export type TourStep = {
  element: string;
  title: string;
  description: string;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
};

// Tour guiado de orientación: recorre el shell de Olimpo (header + sidebar,
// presentes en toda la app) y se detiene en la pantalla de Campañas —la
// puerta de entrada, primer ítem del nav por frecuencia de uso (ver
// src/lib/nav.ts)— para mostrar cómo se ve una sección completa por dentro.
// Es la propuesta inicial: se arma en base a lo que hay en código hoy y se
// termina de pulir a mano, sección por sección.
export const tourSteps: TourStep[] = [
  {
    element: '[data-tour="brand"]',
    title: "Bienvenida a Olimpo",
    description:
      "Este es el backoffice de Atlas: acá el tenant administra campañas, cuentas, agentes y todo lo que necesita para operar. Te muestro las partes principales.",
    side: "bottom",
    align: "start",
  },
  {
    element: '[data-tour="search"]',
    title: "Buscador global",
    description:
      "Con ⌘K (o Ctrl+K) accedés a cualquier sección o buscás una entidad puntual por nombre, sin salir de donde estás.",
    side: "bottom",
    align: "start",
  },
  {
    element: '[data-tour="nav-campanias"]',
    title: "Campañas",
    description:
      "Gestioná las campañas de cada proyecto. Entrá a un proyecto para ajustar su configuración común o creá una campaña nueva.",
    side: "right",
    align: "start",
  },
  {
    element: '[data-tour="nav-cuentas"]',
    title: "Cuentas",
    description:
      "Administrá las líneas telefónicas por las que ingresan y se realizan las llamadas.",
    side: "right",
    align: "start",
  },
  {
    element: '[data-tour="nav-clasificaciones"]',
    title: "Clasificaciones",
    description:
      "Definí con qué resultados se cierra cada gestión y agrupalos para asignarlos a tus campañas.",
    side: "right",
    align: "start",
  },
  {
    element: '[data-tour="nav-marcadores"]',
    title: "Marcas",
    description:
      "Definí las marcas que los agentes pueden dejar sobre una gestión y agrupalas para asignarlas a tus campañas.",
    side: "right",
    align: "start",
  },
  {
    element: '[data-tour="nav-feriados"]',
    title: "Feriados",
    description:
      "Armá grupos de fechas no laborables y asignalos a tus proyectos y campañas para que no se opere esos días.",
    side: "right",
    align: "start",
  },
  {
    element: '[data-tour="nav-listas-de-exclusion"]',
    title: "Listas de exclusión",
    description:
      "Administrá los contactos que no deben ser contactados, ya sea por decisión propia o por registros oficiales de no-llame.",
    side: "right",
    align: "start",
  },
  {
    element: '[data-tour="nav-agentes"]',
    title: "Usuarios",
    description:
      "Administrá las personas con acceso a la plataforma y su estado de acceso. Los permisos de cada una se definen en Grupos y roles.",
    side: "right",
    align: "start",
  },
  {
    element: '[data-tour="nav-grupos-de-trabajo"]',
    title: "Grupos y roles",
    description:
      "Definí qué puede hacer cada equipo: sus permisos, los estados auxiliares habilitados y las personas que lo integran.",
    side: "right",
    align: "start",
  },
  {
    element: '[data-tour="nav-estados-auxiliares"]',
    title: "Estados auxiliares",
    description:
      "Definí los estados que un agente puede seleccionar cuando no está atendiendo, como pausa, capacitación o reunión.",
    side: "right",
    align: "start",
  },
  {
    element: '[data-tour="apps"]',
    title: "Cambiar de app",
    description:
      "Desde acá saltás al PAD (Hermes), la pantalla que usa el agente durante una interacción, sin cerrar sesión.",
    side: "bottom",
    align: "end",
  },
  {
    element: '[data-tour="user-menu"]',
    title: "Tu cuenta",
    description: "Accedés a tu perfil o cerrás sesión desde acá.",
    side: "bottom",
    align: "end",
  },
  {
    element: '[data-tour="campanias-intro"]',
    title: "Así se ve una sección por dentro",
    description:
      "Todas las secciones del nav siguen el mismo patrón: un título, una acción principal y una tabla. Campañas es la puerta de entrada — te la muestro en detalle.",
    side: "bottom",
    align: "start",
  },
  {
    element: '[data-tour="campanias-nueva"]',
    title: "Alta rápida",
    description: "La acción principal de la pantalla siempre va arriba a la derecha, bien visible.",
    side: "bottom",
    align: "end",
  },
  {
    element: '[data-tour="campanias-tabla"]',
    title: "Campañas agrupadas por proyecto",
    description:
      "La tabla agrupa las campañas por proyecto — abrí un grupo para ver sus campañas, o entrá al ícono de lápiz para editar el proyecto en sí.",
    side: "top",
    align: "start",
  },
];
