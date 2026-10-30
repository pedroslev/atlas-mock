// MOCK: sanea solo para la vista previa (más iframe con sandbox vacío).
// REAL: olimpo-api guarda el HTML/CSS ya saneado con una lista blanca equivalente y el envío del
// email vuelve a sanear; al reemplazar variables se escapan los datos del cliente.

import { esquemaDe, ESQUEMAS_ENLACE, imagenDataPermitida, decodificarEntidades } from "@/lib/esquemas-url";
import { ETIQUETAS_VOID } from "@/lib/validar-email";

// Sanitizador de HTML y CSS de email para la vista previa: lista blanca de
// etiquetas y atributos propios de correo, sin dependencias. La vista previa
// SIEMPRE pasa por acá (además de ir en un iframe con sandbox vacío).

const ETIQUETAS_PERMITIDAS = new Set([
  "html", "head", "meta", "title", "style", "body",
  "div", "span", "p", "br", "hr", "h1", "h2", "h3", "h4", "h5", "h6",
  "strong", "b", "em", "i", "u", "s", "ul", "ol", "li",
  "table", "thead", "tbody", "tfoot", "tr", "td", "th", "img", "a", "center",
]);
// De estas etiquetas se descarta también todo lo que tienen adentro.
const DESCARTAR_CONTENIDO = new Set(["script", "iframe", "object", "embed", "svg", "textarea", "select", "noscript", "template"]);
const ATRIBUTOS_PERMITIDOS = new Set([
  "class", "id", "style", "href", "src", "alt", "width", "height", "align", "valign", "bgcolor", "border",
  "cellpadding", "cellspacing", "colspan", "rowspan", "role", "lang", "dir", "title", "target",
]);

/** Escapa un dato antes de meterlo en HTML (variables resueltas): un dato no inyecta marcado. */
export function escaparHtml(valor: string): string {
  return valor
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Sanea CSS: quita @import, expression(), behavior, -moz-binding y url() con esquemas no permitidos. */
export function sanearCss(css: string): string {
  let s = css
    .replace(/\/\*[\s\S]*?(\*\/|$)/g, "")
    // Los escapes (\65xpression) se decodifican para no dejar pasar nada escondido.
    .replace(/\\([0-9a-fA-F]{1,6})\s?/g, (_, h: string) => String.fromCodePoint(parseInt(h, 16) || 0x20))
    .replace(/@import[^;{}]*(;|$)/gi, "")
    .replace(/(-moz-binding|behavior)\s*:[^;}]*;?/gi, "")
    .replace(/expression\s*\([^)]*\)?/gi, "");
  s = s.replace(/url\(\s*(['"]?)(.*?)\1\s*\)/gi, (m, _q: string, url: string) => {
    const esquema = esquemaDe(url);
    return esquema === null || esquema === "https" || imagenDataPermitida(url) ? m : "url()";
  });
  // Nada puede cerrar el <style> desde adentro.
  return s.replace(/<\/style/gi, "<\\/style");
}

function sanearAtributos(
  nombre: string,
  atributos: { nombre: string; valor: string | null }[]
): string {
  let salida = "";
  const conRel = nombre === "a";
  for (const a of atributos) {
    if (nombre === "meta") {
      // Solo charset y viewport.
      const ok = a.nombre === "charset" || a.nombre === "name" || a.nombre === "content";
      if (!ok) continue;
    } else if (!ATRIBUTOS_PERMITIDOS.has(a.nombre)) continue;
    let valor = a.valor ?? "";
    if (a.nombre === "href") {
      const esquema = esquemaDe(valor);
      if (esquema !== null && !ESQUEMAS_ENLACE.includes(esquema)) continue;
    } else if (a.nombre === "src") {
      const esquema = esquemaDe(valor);
      if (esquema !== null && esquema !== "http" && esquema !== "https" && !imagenDataPermitida(valor)) continue;
    } else if (a.nombre === "style") {
      valor = sanearCss(decodificarEntidades(valor));
    }
    salida += ` ${a.nombre}="${valor.replace(/"/g, "&quot;")}"`;
  }
  if (conRel) salida += ' rel="noopener noreferrer"';
  return salida;
}

/**
 * Sanea el HTML de un email: reconstruye el documento dejando solo las
 * etiquetas y atributos de la lista blanca. Lo que no está permitido se
 * descarta (con su contenido si es activo: script, iframe, svg…).
 */
export function sanearHtml(html: string): string {
  let salida = "";
  let i = 0;
  while (i < html.length) {
    const lt = html.indexOf("<", i);
    if (lt === -1) {
      salida += html.slice(i);
      break;
    }
    salida += html.slice(i, lt);

    if (html.startsWith("<!--", lt)) {
      const fin = html.indexOf("-->", lt + 4);
      i = fin === -1 ? html.length : fin + 3; // los comentarios se descartan
      continue;
    }
    if (html[lt + 1] === "!" || html[lt + 1] === "?") {
      const fin = html.indexOf(">", lt);
      i = fin === -1 ? html.length : fin + 1;
      continue;
    }
    if (!/[A-Za-z/]/.test(html[lt + 1] ?? "")) {
      salida += "&lt;"; // un "<" suelto es texto
      i = lt + 1;
      continue;
    }

    const et = leerEtiquetaSimple(html, lt);
    if (!et) {
      i = html.length; // etiqueta rota: se corta acá
      break;
    }
    i = et.fin;
    const { nombre } = et;

    if (!et.cierre && DESCARTAR_CONTENIDO.has(nombre)) {
      const m = new RegExp(`</${nombre}\\s*>`, "i").exec(html.slice(i));
      i = m ? i + m.index + m[0].length : html.length;
      continue;
    }
    if (!et.cierre && nombre === "style") {
      const m = /<\/style\s*>/i.exec(html.slice(i));
      const contenido = m ? html.slice(i, i + m.index) : html.slice(i);
      i = m ? i + m.index + m[0].length : html.length;
      salida += `<style>${sanearCss(contenido)}</style>`;
      continue;
    }
    if (!ETIQUETAS_PERMITIDAS.has(nombre)) continue; // se descarta la etiqueta, queda su contenido
    if (nombre === "style") continue;

    if (et.cierre) {
      if (!ETIQUETAS_VOID.has(nombre)) salida += `</${nombre}>`;
      continue;
    }
    if (nombre === "meta") {
      const tieneHttpEquiv = et.atributos.some((a) => a.nombre === "http-equiv");
      const ok = et.atributos.some((a) => a.nombre === "charset" || (a.nombre === "name" && a.valor?.toLowerCase() === "viewport"));
      if (tieneHttpEquiv || !ok) continue;
    }
    salida += `<${nombre}${sanearAtributos(nombre, et.atributos)}>`;
  }
  return salida;
}

// Lector mínimo de una etiqueta: nombre, si cierra y sus atributos.
function leerEtiquetaSimple(src: string, desde: number) {
  let i = desde + 1;
  const cierre = src[i] === "/";
  if (cierre) i++;
  let nombre = "";
  while (i < src.length && /[A-Za-z0-9:-]/.test(src[i])) nombre += src[i++];
  const atributos: { nombre: string; valor: string | null }[] = [];
  while (i < src.length) {
    while (i < src.length && /[\s/]/.test(src[i])) i++;
    if (src[i] === ">") return { nombre: nombre.toLowerCase(), cierre, atributos, fin: i + 1 };
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
        if (fin === -1) return null;
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
  return null;
}
