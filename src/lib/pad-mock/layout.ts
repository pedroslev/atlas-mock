// Constantes de layout compartidas entre columnas del pad — a pedido, el
// alto de la barra de solapas de CenterColumn y la cabecera "Contexto" de
// ContextColumn tienen que coincidir SIEMPRE. En vez de repetir "h-10" en
// los dos archivos (y confiar en que a nadie se le ocurra tocar uno sin el
// otro), ambos importan esta misma clase — una unidad Tailwind (rem), no un
// px fijo, así se mantiene proporcional si cambia el tamaño de fuente base.
export const ALTO_CABECERA_COLUMNA = "h-10";
