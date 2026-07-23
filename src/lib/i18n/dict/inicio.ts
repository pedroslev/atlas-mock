import type { NamespaceDict } from "@/lib/i18n/dict/types";

// `/` es sólo un redirect a /campanias, así que no tiene copy propio. Este
// namespace queda para los textos de los componentes compartidos de tabla que
// no encajan en `common` (las acciones genéricas —editar, eliminar, cancelar—
// sí salen de `common.acciones.*`).
export const inicio: NamespaceDict = {
  es: {
    "tabla.masAcciones": "Más acciones",
  },
  en: {
    "tabla.masAcciones": "More actions",
  },
  pt: {
    "tabla.masAcciones": "Mais ações",
  },
  ca: {
    "tabla.masAcciones": "Més accions",
  },
};
