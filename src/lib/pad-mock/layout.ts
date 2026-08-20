// Constantes de layout compartidas entre columnas del pad — a pedido, el
// alto de la barra de solapas de CenterColumn y la cabecera "Contexto" de
// ContextColumn tienen que coincidir SIEMPRE. En vez de repetir "h-10" en
// los dos archivos (y confiar en que a nadie se le ocurra tocar uno sin el
// otro), ambos importan esta misma clase — una unidad Tailwind (rem), no un
// px fijo, así se mantiene proporcional si cambia el tamaño de fuente base.
// A pedido, se agrandó de h-11 a h-14 y después a h-16 (junto con más
// padding vertical en los botones de CenterColumn) — la barra de
// Llamada/páginas externas quedaba muy chica.
//
// El "!" (important) es necesario: TabsList (shadcn) trae de base
// "group-data-horizontal/tabs:h-8", una regla condicional que le ganaba a
// un h-16 sin forzar — por eso ningún cambio de alto anterior se veía
// reflejado de verdad (la línea inferior de la barra no se movía). Mismo
// patrón que bg-background! en center-column.tsx, para el mismo tipo de
// problema (perder contra una variante del componente base).
export const ALTO_CABECERA_COLUMNA = "h-16!";
