// Constantes de layout compartidas entre columnas del pad — a pedido, el
// alto de la barra de solapas de CenterColumn y la cabecera "Contexto" de
// ContextColumn tienen que coincidir SIEMPRE. En vez de repetir "h-10" en
// los dos archivos (y confiar en que a nadie se le ocurra tocar uno sin el
// otro), ambos importan esta misma clase — una unidad Tailwind (rem), no un
// px fijo, así se mantiene proporcional si cambia el tamaño de fuente base.
// A pedido, se agrandó de h-11 a h-14: la barra de Llamada/páginas externas
// quedaba muy chica.
export const ALTO_CABECERA_COLUMNA = "h-14";
