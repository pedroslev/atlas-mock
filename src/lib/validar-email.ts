// MOCK: validación del HTML/CSS en el navegador para mostrar el panel y bloquear Guardar.
// REAL: olimpo-api valida y rechaza al guardar con los mismos criterios (la autoridad es el
// servidor); el front no es una barrera de seguridad.

import { decodificarEntidades, esquemaDe, ESQUEMAS_ENLACE, imagenDataPermitida } from "@/lib/esquemas-url";

// Validador del HTML y el CSS de un email (plantillas con cuerpo HTML).
// Tokenizador propio y simple, sin dependencias: no pretende ser un parser
// HTML completo, sino detectar lo que bloquea el guardado (contenido activo,
// URLs peligrosas, marcado mal formado) y avisar de lo que los clientes de
// correo no soportan.

export type NivelHallazgo = "error" | "aviso";

export type Hallazgo = {
  nivel: NivelHallazgo;
  /** Identifica el problema; el panel lo traduce con `datos`. */
  codigo: string;
  /** Texto por defecto (español), por si no hay traducción. */
  mensaje: string;
  /** Línea (desde 1) dentro de la pestaña `origen`. */
  linea: number;
  /** En qué pestaña del editor está el problema. */
  origen: "html" | "css";
  /** Valores para completar el texto traducido (etiqueta, atributo, esquema…). */
  datos?: Record<string, string>;
};

const ETIQUETAS_PROHIBIDAS = new Set([
  "script", "iframe", "object", "embed", "form", "input", "button", "select", "textarea", "link", "base", "svg",
]);
// Contenido que se salta entero (no se interpreta como etiquetas).
const CONTENIDO_CRUDO = new Set(["script", "style", "textarea"]);
export const ETIQUETAS_VOID = new Set([
  "area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr",
]);
// Su cierre es opcional en HTML: no se reportan sin cerrar.
const CIERRE_OPCIONAL = new Set(["p", "li", "td", "th", "tr", "thead", "tbody", "tfoot", "dt", "dd", "option"]);

/** Propiedades CSS que muchos clientes de correo ignoran. */
const RE_PROPIEDAD_NO_SOPORTADA =
  /(?:^|[;{\s])(position|float|flex(?:-[a-z]+)?|grid(?:-[a-z-]+)?|gap|transform|animation|transition|filter|backdrop-filter)\s*:/gi;
const RE_DISPLAY_NO_SOPORTADO = /(?:^|[;{\s])display\s*:\s*(inline-)?(flex|grid)\b/gi;

function lineaDe(texto: string, indice: number): number {
  let n = 1;
  for (let i = 0; i < indice && i < texto.length; i++) if (texto.charCodeAt(i) === 10) n++;
  return n;
}

type Atributo = { nombre: string; valor: string | null };
type EtiquetaLeida = {
  nombre: string;
  cierre: boolean;
  autocierre: boolean;
  atributos: Atributo[];
  /** Índice siguiente al ">" (o null si la etiqueta quedó incompleta / con comilla abierta). */
  fin: number | null;
  error?: "comilla" | "incompleta";
};

/** Lee una etiqueta que empieza en `desde` (el "<"). */
function leerEtiqueta(src: string, desde: number): EtiquetaLeida {
  let i = desde + 1;
  const cierre = src[i] === "/";
  if (cierre) i++;
  let nombre = "";
  while (i < src.length && /[A-Za-z0-9:-]/.test(src[i])) nombre += src[i++];
  const atributos: Atributo[] = [];
  let autocierre = false;
  while (i < src.length) {
    while (i < src.length && /\s/.test(src[i])) i++;
    if (src[i] === ">") return { nombre: nombre.toLowerCase(), cierre, autocierre, atributos, fin: i + 1 };
    if (src[i] === "/") {
      autocierre = true;
      i++;
      continue;
    }
    autocierre = false;
    let attr = "";
    while (i < src.length && !/[\s=>/]/.test(src[i])) attr += src[i++];
    if (!attr) {
      i++;
      continue;
    }
    while (i < src.length && /\s/.test(src[i])) i++;
    let valor: string | null = null;
    if (src[i] === "=") {
      i++;
      while (i < src.length && /\s/.test(src[i])) i++;
      const q = src[i];
      if (q === '"' || q === "'") {
        const fin = src.indexOf(q, i + 1);
        if (fin === -1) {
          return { nombre: nombre.toLowerCase(), cierre, autocierre, atributos, fin: null, error: "comilla" };
        }
        valor = src.slice(i + 1, fin);
        i = fin + 1;
      } else {
        let v = "";
        while (i < src.length && !/[\s>]/.test(src[i])) v += src[i++];
        valor = v;
      }
    }
    atributos.push({ nombre: attr.toLowerCase(), valor });
  }
  return { nombre: nombre.toLowerCase(), cierre, autocierre, atributos, fin: null, error: "incompleta" };
}

type Salida = Hallazgo[];

function agregar(
  salida: Salida,
  nivel: NivelHallazgo,
  codigo: string,
  mensaje: string,
  linea: number,
  origen: "html" | "css",
  datos?: Record<string, string>
) {
  salida.push({ nivel, codigo, mensaje, linea, origen, datos });
}

/** Revisa el CSS (de la pestaña CSS, de un <style> o de un atributo style). */
function validarCssTexto(
  css: string,
  salida: Salida,
  origen: "html" | "css",
  lineaBase: number,
  estructura: boolean
) {
  // Se quitan los comentarios conservando los saltos de línea (para ubicar líneas).
  let limpio = "";
  let i = 0;
  while (i < css.length) {
    if (css.startsWith("/*", i)) {
      const fin = css.indexOf("*/", i + 2);
      const bloque = fin === -1 ? css.slice(i) : css.slice(i, fin + 2);
      limpio += bloque.replace(/[^\n]/g, " ");
      if (fin === -1) {
        agregar(salida, "error", "css_comentario_sin_cerrar", "Comentario CSS sin cerrar.", lineaBase + lineaDe(css, i) - 1, origen);
        break;
      }
      i = fin + 2;
    } else {
      limpio += css[i++];
    }
  }
  // Los escapes (\65xpression) no pueden esconder una construcción prohibida.
  const decodificado = limpio.replace(/\\([0-9a-fA-F]{1,6})\s?/g, (_, h: string) => String.fromCodePoint(parseInt(h, 16) || 0x20));
  const linea = (idx: number) => lineaBase + lineaDe(decodificado, idx) - 1;

  for (const [re, codigo, texto] of [
    [/@import\b/gi, "css_import", "@import no está permitido."],
    [/expression\s*\(/gi, "css_expression", "expression() no está permitido."],
    [/behavior\s*:/gi, "css_behavior", "behavior no está permitido."],
    [/-moz-binding/gi, "css_moz_binding", "-moz-binding no está permitido."],
  ] as const) {
    for (const m of decodificado.matchAll(re)) agregar(salida, "error", codigo, texto, linea(m.index!), origen);
  }
  for (const m of decodificado.matchAll(/url\(\s*(['"]?)(.*?)\1\s*\)/gi)) {
    const url = m[2];
    const esquema = esquemaDe(url);
    if (esquema !== null && esquema !== "https" && !imagenDataPermitida(url)) {
      agregar(salida, "error", "css_url_esquema", `url() con esquema «${esquema}» no permitido (solo https o data:image).`, linea(m.index!), origen, { esquema });
    }
  }

  if (estructura) {
    // Llaves balanceadas, ignorando las que están dentro de strings.
    const abiertas: number[] = [];
    let comilla: string | null = null;
    for (let k = 0; k < decodificado.length; k++) {
      const c = decodificado[k];
      if (comilla) {
        if (c === "\\") k++;
        else if (c === comilla) comilla = null;
      } else if (c === '"' || c === "'") comilla = c;
      else if (c === "{") abiertas.push(k);
      else if (c === "}") {
        if (abiertas.length === 0) {
          agregar(salida, "error", "css_llaves", "Llave «}» sin su «{».", linea(k), origen);
        } else abiertas.pop();
      }
    }
    for (const k of abiertas) agregar(salida, "error", "css_bloque_sin_cerrar", "Bloque CSS sin cerrar: falta «}».", linea(k), origen);
  }

  for (const m of decodificado.matchAll(RE_PROPIEDAD_NO_SOPORTADA)) {
    agregar(salida, "aviso", "css_propiedad_no_soportada", `«${m[1]}» no lo soportan muchos clientes de correo.`, linea(m.index!), origen, { propiedad: m[1].toLowerCase() });
  }
  for (const m of decodificado.matchAll(RE_DISPLAY_NO_SOPORTADO)) {
    agregar(salida, "aviso", "css_propiedad_no_soportada", `«display:${m[2]}» no lo soportan muchos clientes de correo.`, linea(m.index!), origen, { propiedad: `display:${m[2]}` });
  }
  for (const m of decodificado.matchAll(/(?:^|[;{\s])(?:min-|max-)?width\s*:\s*(\d+)px/gi)) {
    if (Number(m[1]) > 600) {
      agregar(salida, "aviso", "ancho_excedido", `Ancho de ${m[1]}px: los correos se diseñan hasta 600px.`, linea(m.index!), origen, { valor: m[1] });
    }
  }
}

/** Valida el HTML del cuerpo (y los <style> que traiga) y el CSS aparte. */
export function validarEmail(html: string, css: string): Hallazgo[] {
  const salida: Hallazgo[] = [];
  const pila: { nombre: string; linea: number }[] = [];
  let i = 0;
  while (i < html.length) {
    const lt = html.indexOf("<", i);
    if (lt === -1) break;
    const linea = lineaDe(html, lt);

    if (html.startsWith("<!--", lt)) {
      const fin = html.indexOf("-->", lt + 4);
      if (fin === -1) {
        agregar(salida, "error", "comentario_sin_cerrar", "Comentario HTML sin cerrar.", linea, "html");
        break;
      }
      i = fin + 3;
      continue;
    }
    if (html[lt + 1] === "!" || html[lt + 1] === "?") {
      // <!doctype ...> y similares: se saltan.
      const fin = html.indexOf(">", lt);
      i = fin === -1 ? html.length : fin + 1;
      continue;
    }
    if (!/[A-Za-z/]/.test(html[lt + 1] ?? "")) {
      i = lt + 1; // un "<" suelto en el texto
      continue;
    }

    const et = leerEtiqueta(html, lt);
    if (et.error === "comilla") {
      agregar(salida, "error", "comilla_sin_cerrar", `Comilla de atributo sin cerrar en <${et.nombre}>.`, linea, "html", { etiqueta: et.nombre });
      break;
    }
    if (et.fin === null) {
      agregar(salida, "error", "etiqueta_incompleta", `La etiqueta <${et.nombre}> no se cierra con «>».`, linea, "html", { etiqueta: et.nombre });
      break;
    }
    i = et.fin;

    if (et.cierre) {
      const pos = pila.map((p) => p.nombre).lastIndexOf(et.nombre);
      if (pos === -1) {
        if (!ETIQUETAS_VOID.has(et.nombre)) {
          agregar(salida, "error", "cierre_sin_apertura", `</${et.nombre}> no tiene su apertura.`, linea, "html", { etiqueta: et.nombre });
        }
      } else {
        // Lo que quedó abierto por encima: opcional se ignora, el resto está cruzado.
        for (const p of pila.splice(pos + 1).reverse()) {
          if (!CIERRE_OPCIONAL.has(p.nombre)) {
            agregar(salida, "error", "etiqueta_cruzada", `<${p.nombre}> (línea ${p.linea}) se abrió y no se cerró antes de </${et.nombre}>.`, p.linea, "html", { etiqueta: p.nombre, cierre: et.nombre });
          }
        }
        pila.pop();
      }
      continue;
    }

    // --- Etiqueta de apertura ---
    const nombre = et.nombre;
    if (ETIQUETAS_PROHIBIDAS.has(nombre)) {
      agregar(salida, "error", "etiqueta_prohibida", `<${nombre}> no está permitida en un email.`, linea, "html", { etiqueta: nombre });
    }
    for (const a of et.atributos) {
      if (/^on[a-z]/.test(a.nombre)) {
        agregar(salida, "error", "atributo_evento", `El atributo ${a.nombre} (evento) no está permitido.`, linea, "html", { atributo: a.nombre });
      }
      if ((a.nombre === "href" || a.nombre === "src") && a.valor !== null) {
        const esquema = esquemaDe(a.valor);
        const ok = esquema === null || ESQUEMAS_ENLACE.includes(esquema) || imagenDataPermitida(a.valor);
        if (!ok) {
          agregar(salida, "error", "url_esquema", `${a.nombre} con esquema «${esquema}» no permitido (http, https, mailto, tel o data:image).`, linea, "html", { atributo: a.nombre, esquema: esquema ?? "" });
        }
      }
      if (a.nombre === "style" && a.valor) validarCssTexto(decodificarEntidades(a.valor), salida, "html", linea, false);
      if ((a.nombre === "width") && a.valor && /^\d+$/.test(a.valor.trim()) && Number(a.valor) > 600) {
        agregar(salida, "aviso", "ancho_excedido", `Ancho de ${a.valor}: los correos se diseñan hasta 600px.`, linea, "html", { valor: a.valor });
      }
    }
    if (nombre === "meta" && et.atributos.some((a) => a.nombre === "http-equiv")) {
      agregar(salida, "error", "meta_http_equiv", "<meta http-equiv> no está permitido.", linea, "html");
    }
    if (nombre === "img" && !et.atributos.some((a) => a.nombre === "alt")) {
      agregar(salida, "aviso", "img_sin_alt", "Imagen sin texto alternativo (alt).", linea, "html");
    }

    if (CONTENIDO_CRUDO.has(nombre) && !et.autocierre) {
      // El contenido hasta el cierre no se interpreta como etiquetas.
      const re = new RegExp(`</${nombre}\\s*>`, "i");
      const resto = html.slice(i);
      const m = re.exec(resto);
      if (!m) {
        if (nombre === "style") agregar(salida, "error", "style_sin_cerrar", "<style> sin cerrar.", linea, "html");
        else agregar(salida, "error", "etiqueta_sin_cerrar", `<${nombre}> sin cerrar.`, linea, "html", { etiqueta: nombre });
        break;
      }
      if (nombre === "style") validarCssTexto(resto.slice(0, m.index), salida, "html", lineaDe(html, i), true);
      i += m.index + m[0].length;
      continue;
    }

    if (!ETIQUETAS_VOID.has(nombre) && !et.autocierre) pila.push({ nombre, linea });
  }

  for (const p of pila) {
    if (!CIERRE_OPCIONAL.has(p.nombre)) {
      agregar(salida, "error", "etiqueta_sin_cerrar", `<${p.nombre}> sin cerrar.`, p.linea, "html", { etiqueta: p.nombre });
    }
  }

  validarCssTexto(css, salida, "css", 1, true);
  return salida;
}

/** Cantidad de errores y avisos de una lista de hallazgos. */
export function resumirHallazgos(h: Hallazgo[]) {
  return {
    errores: h.filter((x) => x.nivel === "error").length,
    avisos: h.filter((x) => x.nivel === "aviso").length,
  };
}
