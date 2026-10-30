// Arma el documento final de un email con cuerpo HTML a partir de las dos
// partes que se cargan por separado en el editor: el HTML y el CSS. La vista
// previa usa SIEMPRE este documento, así lo que se ve es lo que se enviaría.

const RE_TIENE_ESTRUCTURA = /<(html|head|body)[\s>]/i;

/**
 * Compone el documento de un email.
 * - Fragmento (solo contenido del body): lo envuelve en un documento completo
 *   con el <style> en el <head>.
 * - HTML que ya trae <html>/<head>/<body>: inyecta el <style> antes de </head>
 *   (o crea el head) en vez de anidar documentos.
 */
export function componerEmail(html: string, css: string): string {
  // Un "</style" dentro del CSS cerraría el bloque antes de tiempo.
  const estilo = css.trim() ? `<style>${css.replace(/<\/style/gi, "<\\/style")}</style>` : "";

  if (RE_TIENE_ESTRUCTURA.test(html)) {
    if (!estilo) return html;
    if (/<\/head>/i.test(html)) return html.replace(/<\/head>/i, () => `${estilo}</head>`);
    if (/<html[^>]*>/i.test(html)) return html.replace(/<html[^>]*>/i, (m) => `${m}<head>${estilo}</head>`);
    // Solo trae <body>: el estilo va antes, dentro del documento implícito.
    return estilo + html;
  }

  return (
    `<!doctype html><html><head><meta charset="utf-8">` +
    `<meta name="viewport" content="width=device-width,initial-scale=1">` +
    `${estilo}</head><body>${html}</body></html>`
  );
}
