// Datos mock del Backoffice de Atlas (Olimpo) — tenant único "Banco Sur", por
// convención de wireframes (ver fronted/README.md). Nada de esto pega a una
// API real: es solo para navegar el mock.
//
// Los tipos acá siguen el DER real de ADRS/base-datos/ADR-BD-002 (núcleo
// operativo), ADR-BD-003 (identidad Keycloak) y ADR-FUNDAMENTOS-007 (RBAC).
// Campos marcados "reservado IA" existen en el DER pero no se exponen en la
// UI de fase 0 (mismo criterio que excluye Criterios de rellamada del scope).

export type DiaSemana =
  | "lunes"
  | "martes"
  | "miercoles"
  | "jueves"
  | "viernes"
  | "sabado"
  | "domingo";

export const diasSemana: { key: DiaSemana; label: string }[] = [
  { key: "lunes", label: "Lunes" },
  { key: "martes", label: "Martes" },
  { key: "miercoles", label: "Miércoles" },
  { key: "jueves", label: "Jueves" },
  { key: "viernes", label: "Viernes" },
  { key: "sabado", label: "Sábado" },
  { key: "domingo", label: "Domingo" },
];

// project.business_hours / campaigns.business_hours (JSONB, bandas horarias
// por día) — cada día puede tener cero, una o varias bandas (ej. mañana +
// tarde con pausa de almuerzo en el medio).
export type BandaHoraria = { inicio: string; fin: string };
export type BusinessHours = Partial<Record<DiaSemana, BandaHoraria[]>>;

export type Proyecto = {
  id: string;
  nombre: string;
  descripcion?: string;
  objetivo?: string;
  businessHours?: BusinessHours;
  grupoClasificacionId?: string;
  feriadosId?: string;
  campaniasCount: number;
};

// campaigns.parameters (JSONB) — ADR-BD-002 lo deja "a definir por PAD, no
// MVP"; esto mockea la propuesta de relevamiento-legacy/parametros-campaigns
// (parametrizacion-propuesta.md). Cada grupo del documento con "Dónde va:
// Parámetro de campaña" tiene acá su propia solapa en el editor de campaña
// (entre General y Usuarios). Quedan AFUERA de este mock, porque el propio
// documento dice que no van por campaña:
// - `agent_operation_settings.history_lookback_days` → grupo de trabajo (ver
//   `GrupoTrabajo.historyLookbackDays` más abajo).
// - `routing_and_wait` (modo de derivación) → Workflow, no campaña (ADR-BD-002
//   ya dice que las campaigns no tienen workflow propio, vive en `accounts`).
// - Shortcut Buttons → grupo de trabajo, no campaña (lo dice el documento).
export type AgentControlsParams = {
  allowHold: boolean;
  allowHangup: boolean;
  allowAddBookmark: boolean;
  allowMute: boolean;
  allowClassification: boolean;
  forceClassification: boolean;
};

export type DisplaySettingsParams = {
  allowRinging: boolean;
};

export type RecordingSettingsParams = {
  recordAgentAudioDuringHold: boolean;
};

export type AgentOperationSettingsParams = {
  forcedAnswer: boolean;
};

// A pedido: ya no es una URL única — se van agregando de a una, sin
// máximo, y cada una configura su propio modo de apertura y momento. Cada
// entrada lleva "nombre" (no está en el documento original, lo sumamos acá
// para poder identificarlas en la lista — a definir si conviene o no).
export type InteractionUrlOpenAs = "frame" | "blank";
// "manual": no se abre sola nunca, el agente la abre a mano cuando quiere —
// renombrado de "none"/"Nunca" (sonaba negativo) a algo que describe lo que
// SÍ pasa.
export type InteractionUrlMode = "start" | "end" | "manual";
export type InteractionUrlEntry = {
  id: string;
  nombre: string;
  url: string;
  openAs: InteractionUrlOpenAs;
  mode: InteractionUrlMode;
};

export type CampaniaParametros = {
  agentControls: AgentControlsParams;
  displaySettings: DisplaySettingsParams;
  recordingSettings: RecordingSettingsParams;
  agentOperationSettings: AgentOperationSettingsParams;
  interactionUrlSettings: InteractionUrlEntry[];
};

// Valores por defecto — columna "Valor default" del documento. Función (no
// constante) para que cada campaña se lleve su propio objeto y editar una no
// mute la de otra.
export function defaultParametros(): CampaniaParametros {
  return {
    agentControls: {
      allowHold: true,
      allowHangup: true,
      allowAddBookmark: true,
      allowMute: true,
      allowClassification: true,
      forceClassification: false,
    },
    displaySettings: {
      allowRinging: true,
    },
    recordingSettings: {
      recordAgentAudioDuringHold: true,
    },
    agentOperationSettings: {
      forcedAnswer: true,
    },
    interactionUrlSettings: [],
  };
}

export type Campania = {
  id: string;
  nombre: string;
  descripcion?: string;
  objetivo?: string;
  proyectoId: string;
  // Nota: campaigns NO tiene columna de estado en el DER (ADR-BD-002) — el
  // ciclo de vida operativo vive en otras entidades, no acá.
  // undefined = hereda del proyecto sin redefinir
  businessHours?: BusinessHours;
  grupoClasificacionId?: string;
  grupoBookmarksId?: string;
  feriadosId?: string;
  listaExclusionId?: string;
  outboundAccountIds: string[];
  usuariosAsignados: string[];
  parametros: CampaniaParametros;
  // Nota: las campañas NO tienen workflow propio (ver ADR-BD-002 — el
  // workflow vive en `accounts`, no en `campaigns`).
};

// accounts.workflow (JSONB) — fase 0: solo dos macro-estados (inicio de
// interacción y derivación a campaña), editado como grafo con react-flow.
export type WorkflowNodeType = "inicio" | "derivacion";
export type WorkflowNode = {
  id: string;
  type: WorkflowNodeType;
  position: { x: number; y: number };
  campaniaId?: string; // solo en nodos "derivacion": a qué campaña deriva
};
export type WorkflowEdge = { id: string; source: string; target: string };
export type Workflow = { nodes: WorkflowNode[]; edges: WorkflowEdge[] };

export type Cuenta = {
  id: string;
  nombre: string;
  descripcion?: string;
  tipo: "Llamada" | "WhatsApp" | "SMS" | "Email";
  identificador: string;
  workflow?: Workflow;
  interactionValue: number; // 0-100
  provisioning: number;
  provisioningLock: number; // tope, multiplicador
};

export type Clasificacion = {
  id: string;
  idExt?: string;
  nombre: string;
  descripcion?: string; // reservado IA
  tipo: "Exitoso" | "No exitoso" | "No efectivo" | "Neutro";
  parentId?: string;
  callingTime?: number; // tiempo de rellamada, minutos
  prompt?: string; // reservado IA
};

export type ClasificacionGrupo = {
  id: string;
  nombre: string;
  descripcion?: string; // reservado IA
  clasificacionIds: string[];
};

export type Marcador = {
  id: string;
  nombre: string;
  descripcion?: string;
  prompt?: string; // reservado IA
};

export type MarcadorGrupo = {
  id: string;
  nombre: string;
  marcadorIds: string[];
};

// holidays.holidays (JSONB): [{ date, description }] — cada fecha no laborable
// lleva su motivo (feedback de producto 2026-07-16, reflejado en ADR-BD-002).
export type FechaFeriado = { date: string; description: string };

export type Feriado = {
  id: string;
  nombre: string;
  holidays: FechaFeriado[];
};

export type ContactoExcluido = {
  id: string;
  contacto: string;
  tipo: "wsp" | "calline" | "email";
};

export type ListaExclusion = {
  id: string;
  nombre: string;
  descripcion?: string;
  tipo: "Exclusión de tareas" | "Gubernamental";
  contactos: ContactoExcluido[];
};

// contact_list queda fuera de fase 0 (feedback de producto 2026-07-16): no se
// diseña ni se usa por ahora, así que no hay tipo ni mock para listas de
// contactos. El DER la conserva (ADR-BD-002) para fases siguientes.

// users (Keycloak) — solo type=human se administra desde el backoffice del
// tenant (ver ADR-BD-003). "habilitado" = users.enabled.
export type Agente = {
  id: string;
  nombre: string;
  email: string;
  habilitado: boolean;
};

// working_groups.permissions (JSONB): claves {modulo}.{accion}. Simplificado
// acá a lectura/escritura/eliminación por sección del backoffice (el árbol
// completo del legacy no entra en el mock).
export type PermisoAccion = "lectura" | "escritura" | "eliminacion";
export type Permiso = { modulo: string; acciones: PermisoAccion[] };

// working_groups.shortcut_buttons (JSONB) — ver relevamiento-legacy/
// parametros-campaigns/propuesta/parametrizacion-propuesta.md §11: "se
// configuran desde Olimpo, por grupo de trabajo (no por campaña)". A
// diferencia de InteractionUrlEntry (campañas), no tiene "momento": son
// botones siempre presentes en el menú del pad, no algo que se abre solo en
// cierto punto de la interacción. "nombre" tampoco está en el documento —
// mismo criterio que en campañas, lo sumamos para poder identificarlos en
// la lista.
export type ShortcutButtonOpenAs = "frame" | "blank";
export type ShortcutButtonEntry = {
  id: string;
  nombre: string;
  url: string;
  openAs: ShortcutButtonOpenAs;
};

export type GrupoTrabajo = {
  id: string;
  nombre: string;
  descripcion?: string;
  usuarioIds: string[]; // working_groups.users
  estadosAuxiliares: string[]; // working_groups.aux_statuses
  permisos: Permiso[]; // working_groups.permissions — Olimpo
  accesoHermes: boolean; // habilita al grupo a entrar al PAD (Hermes)
  shortcutButtons: ShortcutButtonEntry[]; // working_groups.shortcut_buttons
  historyLookbackDays: number; // working_groups.parameters.agent_operation_settings.history_lookback_days — default 30 (ver parametrizacion-propuesta.md §5)
};

// user_keycloak_map — overrides individuales de un usuario sobre su grupo,
// aditivo (grupo + esto). Solo existe fila si el usuario redefine algo.
export type UsuarioOverride = {
  usuarioId: string;
  estadosAuxiliaresExtra: string[];
  permisosExtra: Permiso[];
};

export type EstadoAuxiliar = {
  id: string;
  nombre: string;
  color: string;
  icono: string;
};

export const proyectos: Proyecto[] = [
  {
    id: "proj-1",
    nombre: "Cobranzas",
    descripcion: "Gestión de mora y recupero",
    objetivo: "Recupero de cartera",
    businessHours: {
      lunes: [{ inicio: "09:00", fin: "13:00" }, { inicio: "14:00", fin: "18:00" }],
      martes: [{ inicio: "09:00", fin: "13:00" }, { inicio: "14:00", fin: "18:00" }],
      miercoles: [{ inicio: "09:00", fin: "13:00" }, { inicio: "14:00", fin: "18:00" }],
      jueves: [{ inicio: "09:00", fin: "13:00" }, { inicio: "14:00", fin: "18:00" }],
      viernes: [{ inicio: "09:00", fin: "13:00" }, { inicio: "14:00", fin: "18:00" }],
    },
    grupoClasificacionId: "cg-cobranzas",
    feriadosId: "fer-ar",
    campaniasCount: 3,
  },
  {
    id: "proj-2",
    nombre: "Atención al cliente",
    descripcion: "Soporte y consultas generales",
    businessHours: {
      lunes: [{ inicio: "08:00", fin: "20:00" }],
      martes: [{ inicio: "08:00", fin: "20:00" }],
      miercoles: [{ inicio: "08:00", fin: "20:00" }],
      jueves: [{ inicio: "08:00", fin: "20:00" }],
      viernes: [{ inicio: "08:00", fin: "20:00" }],
      sabado: [{ inicio: "09:00", fin: "13:00" }],
    },
    grupoClasificacionId: "cg-atencion",
    feriadosId: "fer-ar",
    campaniasCount: 2,
  },
  {
    id: "proj-3",
    nombre: "Ventas",
    descripcion: "Campañas comerciales salientes",
    feriadosId: "fer-ar",
    campaniasCount: 1,
  },
  {
    id: "proj-4",
    nombre: "Piloto Encuestas",
    descripcion: "Proyecto nuevo, todavía sin campañas activas",
    objetivo: "Validar guion de encuesta antes de escalar",
    feriadosId: "fer-ar",
    campaniasCount: 0,
  },
];

export const campanias: Campania[] = [
  {
    id: "camp-1",
    nombre: "Cobranzas Activa PCP",
    descripcion: "Discado predictivo sobre cartera en mora temprana",
    objetivo: "Recupero temprano",
    proyectoId: "proj-1",
    usuariosAsignados: ["ag-1", "ag-2", "ag-3"],
    grupoClasificacionId: "cg-cobranzas",
    grupoBookmarksId: "bg-cobranzas",
    feriadosId: "fer-ar",
    listaExclusionId: "dnc-1",
    outboundAccountIds: ["acc-1"],
    // Personalizada a modo de ejemplo (el resto de las campañas usa los
    // valores default): discado predictivo de cobranzas obliga a tipificar
    // antes de salir del ACW, y abre la ficha del cliente embebida apenas
    // cae la interacción.
    parametros: {
      ...defaultParametros(),
      agentControls: { ...defaultParametros().agentControls, forceClassification: true },
      interactionUrlSettings: [
        {
          id: "url-camp1-1",
          nombre: "Ficha del cliente",
          url: "https://olimpo.bancosur.com/ficha-cliente?dni={{userid}}&interaccion={{iditeraccion}}",
          openAs: "frame",
          mode: "start",
        },
      ],
    },
  },
  {
    id: "camp-2",
    nombre: "Cobranzas Mora Tardía",
    descripcion: "Gestión de cuentas con mora mayor a 90 días",
    objetivo: "Recupero de mora +90 días",
    proyectoId: "proj-1",
    usuariosAsignados: ["ag-2", "ag-4"],
    grupoClasificacionId: "cg-cobranzas",
    feriadosId: "fer-ar",
    outboundAccountIds: ["acc-1"],
    parametros: defaultParametros(),
  },
  {
    id: "camp-3",
    nombre: "Renegociación de deuda",
    proyectoId: "proj-1",
    usuariosAsignados: ["ag-1"],
    grupoClasificacionId: "cg-cobranzas",
    outboundAccountIds: [],
    parametros: defaultParametros(),
  },
  {
    id: "camp-4",
    nombre: "Soporte técnico Nivel 1",
    proyectoId: "proj-2",
    usuariosAsignados: ["ag-3", "ag-5"],
    grupoClasificacionId: "cg-atencion",
    outboundAccountIds: ["acc-2"],
    // Personalizada: mesa inbound sin ring (agentes con headset todo el
    // turno) y con el ticket relacionado abriéndose aparte, no embebido.
    parametros: {
      ...defaultParametros(),
      displaySettings: { allowRinging: false },
      interactionUrlSettings: [
        {
          id: "url-camp4-1",
          nombre: "Ticket relacionado",
          url: "https://olimpo.bancosur.com/tickets?cliente={{userid}}",
          openAs: "blank",
          mode: "start",
        },
      ],
    },
  },
  {
    id: "camp-5",
    nombre: "Encuesta de satisfacción",
    proyectoId: "proj-2",
    usuariosAsignados: ["ag-4"],
    outboundAccountIds: ["acc-4"],
    parametros: defaultParametros(),
  },
  {
    id: "camp-6",
    nombre: "Lanzamiento Tarjeta Plus",
    proyectoId: "proj-3",
    usuariosAsignados: ["ag-1", "ag-2"],
    outboundAccountIds: ["acc-3"],
    parametros: defaultParametros(),
  },
];

export const cuentas: Cuenta[] = [
  {
    id: "acc-1",
    nombre: "Línea Cobranzas AR",
    descripcion: "Línea saliente principal para las campañas de cobranzas",
    tipo: "Llamada",
    identificador: "+54 11 4000-1000",
    interactionValue: 80,
    provisioning: 500,
    provisioningLock: 3,
    // Nota: el inicio solo puede tener UNA derivación conectada mientras no
    // exista un macroestado de decisión (if/switch) — feedback 2026-07-16.
    workflow: {
      nodes: [
        { id: "wf-1-inicio", type: "inicio", position: { x: 80, y: 120 } },
        {
          id: "wf-1-camp1",
          type: "derivacion",
          position: { x: 380, y: 100 },
          campaniaId: "camp-1",
        },
      ],
      edges: [{ id: "wf-1-e1", source: "wf-1-inicio", target: "wf-1-camp1" }],
    },
  },
  {
    id: "acc-2",
    nombre: "WhatsApp Soporte",
    descripcion: "Canal de WhatsApp para atención al cliente",
    tipo: "WhatsApp",
    identificador: "+54 9 11 5555-2020",
    interactionValue: 40,
    provisioning: 200,
    provisioningLock: 2,
    workflow: {
      nodes: [
        { id: "wf-2-inicio", type: "inicio", position: { x: 80, y: 100 } },
        {
          id: "wf-2-camp4",
          type: "derivacion",
          position: { x: 380, y: 100 },
          campaniaId: "camp-4",
        },
      ],
      edges: [{ id: "wf-2-e1", source: "wf-2-inicio", target: "wf-2-camp4" }],
    },
  },
  {
    id: "acc-3",
    nombre: "Email Ventas",
    tipo: "Email",
    identificador: "ventas@bancosur.com",
    interactionValue: 20,
    provisioning: 100,
    provisioningLock: 1,
  },
  {
    id: "acc-4",
    nombre: "SMS Recordatorios",
    tipo: "SMS",
    identificador: "BANCOSUR",
    interactionValue: 10,
    provisioning: 50,
    provisioningLock: 1,
  },
];

export const clasificaciones: Clasificacion[] = [
  { id: "clas-cobranzas", nombre: "Cobranzas", tipo: "Neutro" },
  {
    id: "clas-c-pago",
    nombre: "Compromiso de pago",
    tipo: "Exitoso",
    parentId: "clas-cobranzas",
    callingTime: 4320,
  },
  {
    id: "clas-c-nopago",
    nombre: "No puede pagar",
    tipo: "No exitoso",
    parentId: "clas-cobranzas",
    callingTime: 1440,
  },
  {
    id: "clas-c-rechazo",
    nombre: "Rechaza contacto",
    tipo: "No exitoso",
    parentId: "clas-cobranzas",
  },
  { id: "clas-atencion", nombre: "Atención al cliente", tipo: "Neutro" },
  {
    id: "clas-a-resuelto",
    nombre: "Resuelto en el momento",
    tipo: "Exitoso",
    parentId: "clas-atencion",
  },
  {
    id: "clas-a-escalado",
    nombre: "Escalado a nivel 2",
    tipo: "Neutro",
    parentId: "clas-atencion",
  },
];

export const clasificacionGrupos: ClasificacionGrupo[] = [
  {
    id: "cg-cobranzas",
    nombre: "Cobranzas",
    clasificacionIds: [
      "clas-cobranzas",
      "clas-c-pago",
      "clas-c-nopago",
      "clas-c-rechazo",
    ],
  },
  {
    id: "cg-atencion",
    nombre: "Atención al cliente",
    clasificacionIds: ["clas-atencion", "clas-a-resuelto", "clas-a-escalado"],
  },
];

export const marcadores: Marcador[] = [
  { id: "mk-1", nombre: "Cliente VIP", descripcion: "Requiere atención prioritaria" },
  { id: "mk-2", nombre: "Reclamo activo", descripcion: "Tiene un reclamo abierto en curso" },
  { id: "mk-3", nombre: "Contacto sensible", descripcion: "Requiere manejo cuidadoso" },
];

export const marcadorGrupos: MarcadorGrupo[] = [
  { id: "bg-cobranzas", nombre: "Cobranzas", marcadorIds: ["mk-1", "mk-2"] },
  { id: "bg-general", nombre: "General", marcadorIds: ["mk-3"] },
];

export const feriados: Feriado[] = [
  {
    id: "fer-ar",
    nombre: "Feriados Argentina 2026",
    holidays: [
      { date: "2026-01-01", description: "Año Nuevo" },
      { date: "2026-02-16", description: "Carnaval" },
      { date: "2026-02-17", description: "Carnaval" },
      { date: "2026-03-24", description: "Día de la Memoria" },
      { date: "2026-04-02", description: "Malvinas" },
      { date: "2026-04-03", description: "Viernes Santo" },
      { date: "2026-05-01", description: "Día del Trabajador" },
      { date: "2026-05-25", description: "Revolución de Mayo" },
      { date: "2026-06-15", description: "Paso a la inmortalidad de Güemes" },
      { date: "2026-06-20", description: "Paso a la inmortalidad de Belgrano" },
      { date: "2026-07-09", description: "Día de la Independencia" },
      { date: "2026-08-17", description: "Muerte de San Martín" },
      { date: "2026-10-12", description: "Diversidad Cultural" },
      { date: "2026-11-20", description: "Soberanía Nacional" },
      { date: "2026-12-08", description: "Inmaculada Concepción" },
      { date: "2026-12-25", description: "Navidad" },
    ],
  },
  {
    id: "fer-cba",
    nombre: "Feriados Provinciales Córdoba",
    holidays: [{ date: "2026-07-06", description: "Fundación de Córdoba" }],
  },
];

export const listasExclusion: ListaExclusion[] = [
  {
    id: "dnc-1",
    nombre: "No llame — Nacional",
    descripcion: "Registro nacional \"No llame\" (gubernamental)",
    tipo: "Gubernamental",
    contactos: [
      { id: "dnc-1-c1", contacto: "+54 11 4222-3344", tipo: "calline" },
      { id: "dnc-1-c2", contacto: "+54 11 4555-1122", tipo: "calline" },
    ],
  },
  {
    id: "dnc-2",
    nombre: "Excluidos Cobranzas Q3",
    descripcion: "Contactos que pidieron no ser llamados este trimestre",
    tipo: "Exclusión de tareas",
    contactos: [
      { id: "dnc-2-c1", contacto: "+54 9 11 6011-2233", tipo: "wsp" },
      { id: "dnc-2-c2", contacto: "reclamos@ejemplo.com", tipo: "email" },
    ],
  },
];

export const agentes: Agente[] = [
  { id: "ag-1", nombre: "Marina Acosta", email: "marina.acosta@bancosur.com", habilitado: true },
  { id: "ag-2", nombre: "Julián Ferreyra", email: "julian.ferreyra@bancosur.com", habilitado: true },
  { id: "ag-3", nombre: "Rocío Benítez", email: "rocio.benitez@bancosur.com", habilitado: true },
  { id: "ag-4", nombre: "Tomás Ibarra", email: "tomas.ibarra@bancosur.com", habilitado: false },
  { id: "ag-5", nombre: "Lucía Márquez", email: "lucia.marquez@bancosur.com", habilitado: true },
];

// El catálogo de auxiliares puede crecer mucho por tenant (decenas o cientos):
// toda UI que asigne auxiliares tiene que ser buscable, nunca una lista plana
// de checkboxes (feedback de producto 2026-07-16).
export const estadosAuxiliares: EstadoAuxiliar[] = [
  { id: "aux-almuerzo", nombre: "Almuerzo", color: "#FFC107", icono: "utensils" },
  { id: "aux-capacitacion", nombre: "Capacitación", color: "#0074B5", icono: "graduation-cap" },
  { id: "aux-reunion", nombre: "Reunión", color: "#807CDB", icono: "users" },
  { id: "aux-descanso", nombre: "Descanso", color: "#28A745", icono: "coffee" },
  { id: "aux-bano", nombre: "Baño", color: "#17A2B8", icono: "door-open" },
  { id: "aux-gestion", nombre: "Gestión interna", color: "#6A6A6A", icono: "clipboard-list" },
  { id: "aux-feedback", nombre: "Feedback con supervisor", color: "#9C27B0", icono: "message-circle" },
  { id: "aux-tecnico", nombre: "Inconveniente técnico", color: "#D7373F", icono: "wrench" },
];

// Catálogo de módulos para el árbol de permisos simplificado (working_groups.permissions).
export const modulosPermisos = [
  "Proyectos",
  "Campañas",
  "Cuentas",
  "Clasificaciones",
  "Marcas",
  "Feriados",
  "Listas de exclusión",
  "Agentes y roles",
  "Grupos de trabajo",
  "Estados auxiliares",
] as const;

export const gruposTrabajo: GrupoTrabajo[] = [
  {
    id: "wg-cobranzas",
    nombre: "Cobranzas",
    descripcion: "Equipo de gestión de cobranzas",
    usuarioIds: ["ag-1", "ag-2", "ag-4"],
    estadosAuxiliares: ["aux-almuerzo", "aux-capacitacion"],
    permisos: [
      { modulo: "Campañas", acciones: ["lectura", "escritura", "eliminacion"] },
      { modulo: "Cuentas", acciones: ["lectura"] },
      { modulo: "Clasificaciones", acciones: ["lectura", "escritura"] },
    ],
    accesoHermes: true,
    shortcutButtons: [
      {
        id: "sb-cobranzas-1",
        nombre: "Manual del agente",
        url: "https://olimpo.bancosur.com/manual-agente",
        openAs: "frame",
      },
      {
        id: "sb-cobranzas-2",
        nombre: "Calculadora de cuotas",
        url: "https://olimpo.bancosur.com/simulador-cuotas",
        openAs: "frame",
      },
    ],
    historyLookbackDays: 90,
  },
  {
    id: "wg-atencion",
    nombre: "Atención al cliente",
    descripcion: "Equipo de soporte N1",
    usuarioIds: ["ag-3", "ag-5"],
    estadosAuxiliares: ["aux-almuerzo"],
    permisos: [{ modulo: "Campañas", acciones: ["lectura"] }],
    accesoHermes: true,
    shortcutButtons: [
      {
        id: "sb-atencion-1",
        nombre: "Base de conocimientos",
        url: "https://olimpo.bancosur.com/base-conocimiento",
        openAs: "frame",
      },
    ],
    historyLookbackDays: 30,
  },
  {
    id: "wg-ventas",
    nombre: "Ventas",
    usuarioIds: ["ag-2"],
    estadosAuxiliares: ["aux-almuerzo", "aux-reunion"],
    permisos: [{ modulo: "Campañas", acciones: ["lectura"] }],
    accesoHermes: false,
    shortcutButtons: [],
    historyLookbackDays: 30,
  },
];

// user_keycloak_map — solo Julián tiene overrides sobre su grupo (está en dos
// grupos porque tiene asignación cruzada Cobranzas/Ventas vía override).
export const usuarioOverrides: UsuarioOverride[] = [
  {
    usuarioId: "ag-2",
    estadosAuxiliaresExtra: ["aux-reunion"],
    permisosExtra: [{ modulo: "Proyectos", acciones: ["lectura"] }],
  },
];

export function getProyecto(id: string) {
  return proyectos.find((p) => p.id === id);
}

export function getCampania(id: string) {
  return campanias.find((c) => c.id === id);
}

export function getCuenta(id: string) {
  return cuentas.find((c) => c.id === id);
}

export function getAgente(id: string) {
  return agentes.find((a) => a.id === id);
}

export function getGrupoTrabajo(id: string) {
  return gruposTrabajo.find((g) => g.id === id);
}

export function getGruposDeUsuario(usuarioId: string) {
  return gruposTrabajo.filter((g) => g.usuarioIds.includes(usuarioId));
}

export function getOverrideDeUsuario(usuarioId: string) {
  return usuarioOverrides.find((o) => o.usuarioId === usuarioId);
}

export function getEstadoAuxiliar(id: string) {
  return estadosAuxiliares.find((e) => e.id === id);
}

export function getClasificacion(id: string) {
  return clasificaciones.find((c) => c.id === id);
}

export function getClasificacionGrupo(id: string) {
  return clasificacionGrupos.find((g) => g.id === id);
}

export function getClasificacionesDeGrupo(grupoId: string) {
  const grupo = getClasificacionGrupo(grupoId);
  if (!grupo) return [];
  return clasificaciones.filter((c) => grupo.clasificacionIds.includes(c.id));
}

export function getMarcadorGrupo(id: string) {
  return marcadorGrupos.find((g) => g.id === id);
}

export function getMarcadoresDeGrupo(grupoId: string) {
  const grupo = getMarcadorGrupo(grupoId);
  if (!grupo) return [];
  return marcadores.filter((m) => grupo.marcadorIds.includes(m.id));
}

export function getFeriado(id: string) {
  return feriados.find((f) => f.id === id);
}

export function getListaExclusion(id: string) {
  return listasExclusion.find((l) => l.id === id);
}
