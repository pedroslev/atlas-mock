// Utilidades puras del autocompletado de variables de cliente en el editor de
// plantillas: detectar qué se está escribiendo y calcular dónde mostrar la lista.

/** Lo que el usuario está escribiendo y puede completarse como variable. */
export type DisparoVariable = {
  /** Posición donde empieza lo escrito (incluye "{{" si lo había). */
  inicio: number;
  /** Posición del cursor: lo que se reemplaza es [inicio, fin). */
  fin: number;
  /** Lo escrito después del punto del prefijo (para filtrar). */
  consulta: string;
};

// Al comienzo de una palabra, un "{{" opcional, el prefijo ("cliente.") y lo
// que se lleva escrito de la clave, todo pegado al cursor.
const RE_DISPARO = /(?:^|[^\w.])(\{\{\s*)?(\w+\.)(\w*)$/;

/**
 * Detecta, justo antes del cursor, un prefijo de cliente (alguno de
 * `prefijos`, sin distinguir mayúsculas) opcionalmente precedido por "{{".
 * Devuelve null si no hay nada que autocompletar.
 */
export function detectarDisparo(
  texto: string,
  cursor: number,
  prefijos: string[]
): DisparoVariable | null {
  const antes = texto.slice(0, cursor);
  const m = RE_DISPARO.exec(antes);
  if (!m) return null;
  const llaves = m[1] ?? "";
  const prefijo = m[2];
  const consulta = m[3];
  if (!prefijos.some((p) => p.toLowerCase() === prefijo.toLowerCase())) return null;
  const largo = llaves.length + prefijo.length + consulta.length;
  return { inicio: cursor - largo, fin: cursor, consulta };
}

/**
 * Posición (en px, relativa al borde superior izquierdo del textarea) de la
 * línea del caracter `pos`, con la técnica del "mirror div": un div oculto con
 * la misma tipografía y ancho que el textarea, para medir dónde cae el texto.
 */
export function coordenadasEnTextarea(el: HTMLTextAreaElement, pos: number) {
  const estilo = window.getComputedStyle(el);
  const espejo = document.createElement("div");
  for (const prop of [
    "boxSizing", "width", "fontFamily", "fontSize", "fontWeight", "fontStyle",
    "letterSpacing", "lineHeight", "textTransform", "wordSpacing", "textIndent",
    "paddingTop", "paddingRight", "paddingBottom", "paddingLeft",
    "borderTopWidth", "borderRightWidth", "borderBottomWidth", "borderLeftWidth",
    "tabSize",
  ] as const) {
    espejo.style[prop] = estilo[prop];
  }
  espejo.style.position = "absolute";
  espejo.style.visibility = "hidden";
  espejo.style.whiteSpace = "pre-wrap";
  espejo.style.overflowWrap = "break-word";
  espejo.textContent = el.value.slice(0, pos);
  const marca = document.createElement("span");
  marca.textContent = "​";
  espejo.appendChild(marca);
  document.body.appendChild(espejo);
  const altoLinea = parseFloat(estilo.lineHeight) || parseFloat(estilo.fontSize) * 1.4;
  const coords = {
    top: marca.offsetTop - el.scrollTop + altoLinea,
    left: marca.offsetLeft - el.scrollLeft,
  };
  document.body.removeChild(espejo);
  return coords;
}
