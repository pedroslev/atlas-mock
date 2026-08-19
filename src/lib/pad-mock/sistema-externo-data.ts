// Datos del mock de "sistema externo" (/sistema-externo) — representa lo que
// Hermes vería si de verdad embebiera o abriera en pestaña aparte un sistema
// de un tercero (CRM, tickets, facturación, etc.). A propósito NO comparte
// estilo con Hermes/Atlas (otra identidad visual, otra tipografía de marca)
// para que se note que es "de afuera" — mismo criterio que separar
// legacy-repos de atlas-repos en el relevamiento: acá se simula el sistema
// ajeno, no se lo confunde con el propio.
//
// Un mismo "kind" de plantilla se reusa para varias integraciones (todas las
// que muestran "Ficha comercial", "Cola de tickets" o un registro simple) —
// no hace falta una pantalla distinta por cada botón rápido para que se
// entienda el mecanismo de frame/blank.

export type SistemaExternoKind = "crm" | "tickets" | "generico";

type CampoGenerico = { label: string; valor: string };
type FilaGenerica = { titulo: string; detalle: string; estado?: string };

export type SistemaExternoConfig = {
  id: string;
  vendor: string;
  tagline: string;
  accent: keyof typeof ACCENTS;
  kind: SistemaExternoKind;
  campos?: CampoGenerico[];
  filas?: FilaGenerica[];
};

// Clases completas y literales a propósito (nada de `bg-${accent}-600`):
// Tailwind solo detecta clases que aparecen enteras en el código fuente.
export const ACCENTS = {
  blue: {
    badge: "bg-blue-600 text-white",
    chip: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300",
    ring: "ring-blue-600/15",
    text: "text-blue-700 dark:text-blue-400",
  },
  orange: {
    badge: "bg-orange-600 text-white",
    chip: "bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-300",
    ring: "ring-orange-600/15",
    text: "text-orange-700 dark:text-orange-400",
  },
  emerald: {
    badge: "bg-emerald-600 text-white",
    chip: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
    ring: "ring-emerald-600/15",
    text: "text-emerald-700 dark:text-emerald-400",
  },
  violet: {
    badge: "bg-violet-600 text-white",
    chip: "bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300",
    ring: "ring-violet-600/15",
    text: "text-violet-700 dark:text-violet-400",
  },
  rose: {
    badge: "bg-rose-600 text-white",
    chip: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300",
    ring: "ring-rose-600/15",
    text: "text-rose-700 dark:text-rose-400",
  },
  slate: {
    badge: "bg-slate-700 text-white",
    chip: "bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-300",
    ring: "ring-slate-600/15",
    text: "text-slate-700 dark:text-slate-400",
  },
  amber: {
    badge: "bg-amber-600 text-white",
    chip: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
    ring: "ring-amber-600/15",
    text: "text-amber-700 dark:text-amber-400",
  },
  sky: {
    badge: "bg-sky-600 text-white",
    chip: "bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300",
    ring: "ring-sky-600/15",
    text: "text-sky-700 dark:text-sky-400",
  },
  pink: {
    badge: "bg-pink-600 text-white",
    chip: "bg-pink-50 text-pink-700 dark:bg-pink-500/10 dark:text-pink-300",
    ring: "ring-pink-600/15",
    text: "text-pink-700 dark:text-pink-400",
  },
  cyan: {
    badge: "bg-cyan-600 text-white",
    chip: "bg-cyan-50 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-300",
    ring: "ring-cyan-600/15",
    text: "text-cyan-700 dark:text-cyan-400",
  },
} as const;

export const sistemasExternosMock: Record<string, SistemaExternoConfig> = {
  "ext-crm": { id: "ext-crm", vendor: "NexusCRM", tagline: "Gestión comercial", accent: "blue", kind: "crm" },
  "ext-tickets": { id: "ext-tickets", vendor: "TicketFlow", tagline: "Mesa de ayuda", accent: "orange", kind: "tickets" },
  "ext-facturacion": {
    id: "ext-facturacion",
    vendor: "PagoLink",
    tagline: "Portal de facturación",
    accent: "emerald",
    kind: "generico",
    campos: [
      { label: "Cliente", valor: "Valentina Ibarra — N° 3345789" },
      { label: "Último comprobante", valor: "FC-A 0004-00081223 · 12/08/2026" },
      { label: "Saldo actual", valor: "$8.450,00" },
      { label: "Próximo vencimiento", valor: "28/08/2026" },
    ],
    filas: [
      { titulo: "FC-A 0004-00081223", detalle: "Servicio adicional Premium", estado: "Pendiente" },
      { titulo: "FC-A 0004-00079901", detalle: "Abono mensual — julio", estado: "Pagada" },
      { titulo: "FC-A 0004-00078340", detalle: "Abono mensual — junio", estado: "Pagada" },
    ],
  },
  "ext-buro": {
    id: "ext-buro",
    vendor: "InfoScore Buró",
    tagline: "Consulta crediticia",
    accent: "violet",
    kind: "generico",
    campos: [
      { label: "Situación BCRA", valor: "1 — Situación normal" },
      { label: "Score crediticio", valor: "742 / 999" },
      { label: "Deudas activas", valor: "2 entidades" },
      { label: "Última consulta", valor: "18/08/2026" },
    ],
    filas: [
      { titulo: "Banco Central — Entidad A", detalle: "Tarjeta de crédito", estado: "Al día" },
      { titulo: "Banco Central — Entidad B", detalle: "Préstamo personal", estado: "Al día" },
    ],
  },
  "ext-scoring": {
    id: "ext-scoring",
    vendor: "RiskGauge",
    tagline: "Scoring de riesgo",
    accent: "rose",
    kind: "generico",
    campos: [
      { label: "Riesgo de mora", valor: "Bajo (12%)" },
      { label: "Modelo", valor: "RG-Cobranzas v4.2" },
      { label: "Recomendación", valor: "Ofrecer plan de pagos a 3 cuotas" },
      { label: "Calculado", valor: "18/08/2026 09:10" },
    ],
  },
  "ext-legales": {
    id: "ext-legales",
    vendor: "LexPortal",
    tagline: "Gestión de casos legales",
    accent: "slate",
    kind: "generico",
    campos: [
      { label: "Casos abiertos del cliente", valor: "0" },
      { label: "Última actualización", valor: "—" },
    ],
    filas: [
      { titulo: "Sin expedientes asociados", detalle: "No hay causas activas para este cliente.", estado: "—" },
    ],
  },
  "ext-refinanciacion": {
    id: "ext-refinanciacion",
    vendor: "PagoLink Simulador",
    tagline: "Simulador de refinanciación",
    accent: "emerald",
    kind: "generico",
    campos: [
      { label: "Deuda a refinanciar", valor: "$8.450,00" },
      { label: "Plan sugerido", valor: "3 cuotas de $2.950,00" },
      { label: "Interés aplicado", valor: "4,5% mensual" },
      { label: "Vigencia de la oferta", valor: "48 horas" },
    ],
  },
  "ar-manual": {
    id: "ar-manual",
    vendor: "KnowledgeHub",
    tagline: "Manual del agente",
    accent: "amber",
    kind: "generico",
    campos: [
      { label: "Sección sugerida", valor: "Reclamos por facturación" },
      { label: "Última revisión", valor: "01/08/2026" },
    ],
    filas: [
      { titulo: "Cargos no reconocidos", detalle: "Cómo validar contra el plan contratado antes de derivar.", estado: "Vigente" },
      { titulo: "Guion de apertura", detalle: "Saludo institucional + confirmación de identidad.", estado: "Vigente" },
      { titulo: "Política de reembolsos", detalle: "Actualizada — ver cambios en cobertura extendida.", estado: "Nuevo" },
    ],
  },
  "ar-calculadora": {
    id: "ar-calculadora",
    vendor: "PagoLink Simulador",
    tagline: "Calculadora de cuotas",
    accent: "emerald",
    kind: "generico",
    campos: [
      { label: "Monto a financiar", valor: "$15.000,00" },
      { label: "Plan disponible", valor: "6 cuotas de $2.680,00" },
      { label: "Interés aplicado", valor: "3,9% mensual" },
    ],
  },
  "ar-rrhh": {
    id: "ar-rrhh",
    vendor: "GenteRRHH",
    tagline: "Portal de RRHH",
    accent: "sky",
    kind: "generico",
    campos: [
      { label: "Días de vacaciones disponibles", valor: "9" },
      { label: "Próximo recibo de sueldo", valor: "01/09/2026" },
    ],
    filas: [
      { titulo: "Solicitud de franco", detalle: "Pendiente de aprobación del supervisor.", estado: "Pendiente" },
      { titulo: "Curso de atención al cliente", detalle: "Asignado — vence el 30/08/2026.", estado: "En curso" },
    ],
  },
  "ar-conocimiento": {
    id: "ar-conocimiento",
    vendor: "KnowledgeHub",
    tagline: "Base de conocimientos",
    accent: "amber",
    kind: "generico",
    filas: [
      { titulo: "Envíos — demoras y reenvíos", detalle: "Cuándo ofrecer reenvío sin cargo.", estado: "Vigente" },
      { titulo: "Cambios de dirección", detalle: "Requisitos antes del despacho.", estado: "Vigente" },
      { titulo: "Medios de pago aceptados", detalle: "Tarjeta, transferencia, efectivo en puntos adheridos.", estado: "Vigente" },
    ],
  },
  "ar-directorio": {
    id: "ar-directorio",
    vendor: "Directorio Interno",
    tagline: "Contactos por área",
    accent: "sky",
    kind: "generico",
    filas: [
      { titulo: "Facturación — Nivel 2", detalle: "Interno 4521" },
      { titulo: "Logística", detalle: "Interno 4880" },
      { titulo: "Supervisión de turno", detalle: "Interno 4001" },
    ],
  },
  "ar-beneficios": {
    id: "ar-beneficios",
    vendor: "Beneficios+",
    tagline: "Portal de beneficios",
    accent: "pink",
    kind: "generico",
    filas: [
      { titulo: "Descuento en gimnasios", detalle: "30% en cadenas adheridas.", estado: "Activo" },
      { titulo: "Convenio universitario", detalle: "Becas parciales para carreras de grado.", estado: "Activo" },
    ],
  },
  "ar-mesaayuda": {
    id: "ar-mesaayuda",
    vendor: "HelpDesk IT",
    tagline: "Mesa de ayuda IT",
    accent: "cyan",
    kind: "tickets",
  },
};

export const SISTEMA_EXTERNO_DEFAULT: SistemaExternoConfig = {
  id: "default",
  vendor: "Sistema externo",
  tagline: "Sin configuración de ejemplo para este acceso",
  accent: "slate",
  kind: "generico",
};

export const CRM_MOCK = {
  cliente: {
    nombre: "Marcela Suárez",
    id: "CRM-88214",
    plan: "Plan Empresas Plus",
    clienteDesde: "Marzo 2021",
    telefono: "+54 11 4777-2200",
    mail: "marcela.suarez@correo.com",
  },
  oportunidades: [
    { nombre: "Upgrade a línea corporativa x5", etapa: "Negociación", valor: "$420.000" },
    { nombre: "Renovación anual — soporte premium", etapa: "Propuesta enviada", valor: "$96.000" },
  ],
  casos: [
    { id: "CS-3312", asunto: "Consulta por facturación duplicada", estado: "Cerrado" },
    { id: "CS-3298", asunto: "Solicitud de cambio de plan", estado: "En curso" },
  ],
};

export const TICKETS_MOCK = [
  { id: "TCK-5510", asunto: "No puede acceder al portal de autogestión", prioridad: "Alta", estado: "Abierto", asignado: "Nivel 1" },
  { id: "TCK-5498", asunto: "Consulta por facturación duplicada", prioridad: "Media", estado: "En curso", asignado: "Facturación" },
  { id: "TCK-5487", asunto: "Solicitud de baja de servicio adicional", prioridad: "Baja", estado: "Esperando cliente", asignado: "Nivel 2" },
  { id: "TCK-5471", asunto: "Reclamo por demora en instalación", prioridad: "Alta", estado: "Abierto", asignado: "Logística" },
];
