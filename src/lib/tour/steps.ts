export type TourStepDef = {
  id: string;
  element: string;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
};

// Tour 1 de 2 — Orientación general: qué es cada control de la barra
// superior y qué es cada sección del menú lateral. No entra en el detalle
// de ninguna pantalla ni crea nada — ese es el segundo tour ("armá tu
// primera campaña"), todavía por armar.
//
// Solo estructura acá — el texto vive en el diccionario de i18n
// (src/lib/i18n/dict/tour.ts, namespace "tour", claves
// "orientacion.<id>.titulo" / ".descripcion") para que el tour cambie de
// idioma junto con el resto de la app. product-tour.tsx arma el step final
// de driver.js resolviendo esas claves con el `id` de cada entrada.
//
// Storytelling: arranca por los controles que están siempre arriba, sin
// importar en qué sección estés ("esto es tuyo, para cuando lo necesites"),
// y termina recorriendo el menú lateral en el orden en que se arma una
// operación de punta a punta —de las piezas sueltas (cuentas, catálogos) a
// la gente, y por último la Campaña, que es donde todo se junta— en vez
// del orden real del menú (que va por frecuencia de uso diaria).
export const orientationSteps: TourStepDef[] = [
  { id: "brand", element: '[data-tour="brand"]', side: "bottom", align: "start" },
  { id: "search", element: '[data-tour="search"]', side: "bottom", align: "start" },
  { id: "temaToggle", element: '[data-tour="theme-toggle"]', side: "bottom", align: "center" },
  { id: "idioma", element: '[data-tour="language"]', side: "bottom", align: "center" },
  { id: "apps", element: '[data-tour="apps"]', side: "bottom", align: "end" },
  { id: "usuario", element: '[data-tour="user-menu"]', side: "bottom", align: "end" },
  { id: "sidebarToggle", element: '[data-tour="sidebar-toggle"]', side: "right", align: "start" },
  { id: "cuentas", element: '[data-tour="nav-cuentas"]', side: "right", align: "start" },
  { id: "clasificaciones", element: '[data-tour="nav-clasificaciones"]', side: "right", align: "start" },
  { id: "marcadores", element: '[data-tour="nav-marcadores"]', side: "right", align: "start" },
  { id: "feriados", element: '[data-tour="nav-feriados"]', side: "right", align: "start" },
  { id: "listasExclusion", element: '[data-tour="nav-listas-de-exclusion"]', side: "right", align: "start" },
  { id: "agentes", element: '[data-tour="nav-agentes"]', side: "right", align: "start" },
  { id: "gruposTrabajo", element: '[data-tour="nav-grupos-de-trabajo"]', side: "right", align: "start" },
  { id: "estadosAuxiliares", element: '[data-tour="nav-estados-auxiliares"]', side: "right", align: "start" },
  { id: "campanias", element: '[data-tour="nav-campanias"]', side: "right", align: "start" },
];
