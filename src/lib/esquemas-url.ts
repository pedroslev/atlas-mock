// Helpers compartidos por el validador y el sanitizador de email, y por los
// enlaces de Markdown: decidir si una URL tiene un esquema permitido.

const ENTIDADES_NOMBRADAS: Record<string, string> = {
  colon: ":", tab: "\t", newline: "\n", lpar: "(", rpar: ")", sol: "/", amp: "&", quot: '"', apos: "'", lt: "<", gt: ">",
};

/** Decodifica entidades HTML numéricas y las nombradas más usadas para esconder esquemas (java&#115;cript:). */
export function decodificarEntidades(valor: string): string {
  return valor
    .replace(/&#x([0-9a-f]+);?/gi, (_, h: string) => String.fromCodePoint(parseInt(h, 16) || 0x20))
    .replace(/&#(\d+);?/g, (_, d: string) => String.fromCodePoint(parseInt(d, 10) || 0x20))
    .replace(/&([a-z]+);/gi, (m, n: string) => ENTIDADES_NOMBRADAS[n.toLowerCase()] ?? m);
}

/** Esquema de una URL ("javascript", "https"…) o null si es relativa / ancla / variable. */
export function esquemaDe(url: string): string | null {
  // Los navegadores ignoran espacios y caracteres de control dentro del esquema.
  const limpio = decodificarEntidades(url).replace(/[\u0000- \u007f]+/g, "").toLowerCase();
  const m = /^([a-z][a-z0-9+.-]*):/.exec(limpio);
  return m ? m[1] : null;
}

/** Esquemas de un enlace (href): http, https, mailto y tel. */
export const ESQUEMAS_ENLACE = ["http", "https", "mailto", "tel"];

/** ¿Es una URL de enlace permitida? Sin esquema (relativa, ancla, variable) se acepta. */
export function enlacePermitido(url: string): boolean {
  const esquema = esquemaDe(url);
  return esquema === null || ESQUEMAS_ENLACE.includes(esquema) || imagenDataPermitida(url);
}

/** data:image/png|jpeg|gif (no SVG: puede traer scripts). */
export function imagenDataPermitida(url: string): boolean {
  const limpio = decodificarEntidades(url).replace(/[\u0000- \u007f]+/g, "").toLowerCase();
  return /^data:image\/(png|jpeg|gif)[;,]/.test(limpio);
}

/** Estricto: solo http, https, mailto o tel (para el diálogo de enlace de Markdown). */
export function enlaceMarkdownValido(url: string): boolean {
  const esquema = esquemaDe(url);
  return esquema !== null && ESQUEMAS_ENLACE.includes(esquema);
}
