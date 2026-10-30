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

// Cómo se maneja la grabación. Se configura en la campaña Y en el grupo de
// trabajo, y entre los dos gana lo más restrictivo: si cualquiera de los dos
// dice que no se grabe, no se graba (decisión del PO, 2026-09-16 — pendiente
// de acordar con el Chief Innovation Architect).
// Dos ejes: QUÉ se graba (audio, pantalla) y EN QUÉ MOMENTOS. Si no se graba
// ni audio ni pantalla, no se graba nada y los momentos no aplican.
//
// La conversación no es opcional: si algo se graba, se graba la conversación.
// Lo que se elige es si además se sigue grabando en la espera y en el trabajo
// posterior.
export type RecordingSettingsParams = {
  recordAudio: boolean;
  // La pantalla es una grabación aparte del audio (en el ADR de grabaciones,
  // una object_class distinta con su propio egress). Siempre acotada a la
  // interacción: grabar toda la sesión del agente se descartó (2026-09-16).
  recordScreen: boolean;
  recordAgentAudioDuringHold: boolean;
  // ACW = after call work, el trabajo posterior a la llamada (tipificación).
  recordAcw: boolean;
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
      recordAudio: true,
      recordScreen: true,
      recordAgentAudioDuringHold: true,
      recordAcw: true,
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
  // Plantillas de mensajes (ATLAS-1191): un grupo por campaña, igual que
  // clasificaciones y marcas, y una plantilla por defecto por canal escrito
  // que Hermes precarga al abrir la conversación.
  // MOCK: el grupo y las plantillas por defecto de la campaña están en los datos de ejemplo.
  // REAL: el grupo de plantillas se hereda campaña←proyecto (igual que el grupo de
  // clasificaciones) y se entrega a Hermes con ListAgentCampaigns; la plantilla por defecto
  // por canal debe pertenecer al grupo y ser de ese canal.
  grupoPlantillasId?: string;
  plantillaDefaultChatId?: string;
  plantillaDefaultEmailId?: string;
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
// "play", "collect", "if" y "case" son el primer set de macroestados de la
// Fase 1; "http" y "calcular" son las herramientas de consulta HTTP y de
// cálculo con CEL (decisiones/workflows/propuesta-motor-workflows.md §5).
export type WorkflowNodeType =
  | "inicio"
  | "derivacion"
  | "play"
  | "collect"
  | "if"
  | "case"
  | "http"
  | "calcular";
export type WorkflowNode = {
  id: string;
  type: WorkflowNodeType;
  position: { x: number; y: number };
  campaniaId?: string; // solo en nodos "derivacion": a qué campaña deriva
};
export type WorkflowEdge = {
  id: string;
  source: string;
  target: string;
  // Handle de origen cuando el nodo tiene más de una salida — hoy solo
  // "out_of_hours" (salida transversal, ver decisiones/workflows/
  // propuesta-motor-workflows.md §4.2). undefined = salida principal del nodo.
  sourceHandle?: string;
};
export type Workflow = { nodes: WorkflowNode[]; edges: WorkflowEdge[] };

// Para qué se usa la línea de una cuenta. Se define ANTES de elegir el número:
// lo que la línea puede hacer depende del proveedor de la región, así que
// primero se valida el uso y recién después se ofrecen los números.
export type UsoDeLinea = "entrante" | "saliente" | "ambas";

// Qué ve el destinatario cuando la llamada sale por esta cuenta.
export type ModoDeSalida = "misma" | "propio" | "aleatorio" | "oculto";

export type Cuenta = {
  id: string;
  nombre: string;
  descripcion?: string;
  tipo: "Llamada" | "Chat" | "Videollamada" | "Webcall" | "WhatsApp" | "SMS" | "Email";
  identificador: string;
  uso?: UsoDeLinea;
  modoSalida?: ModoDeSalida;
  lineaSalida?: string;
  workflow?: Workflow;
  // Solo webcall y videollamada: además del audio (o del video), cliente y
  // asesor se escriben por chat durante la llamada.
  chatEnLlamada?: boolean;
  // Capacidad del asesor: cada uno tiene 100. Voz, webcall y videollamada ocupan los 100
  // (una a la vez) y no lo piden. En chat el tenant define el cupo y el máximo
  // de simultáneas, y el resto se deriva:
  //   provisioning     = máximo de interacciones simultáneas de la cuenta por asesor.
  //   provisioningLock = cupo: % de los 100 que esta cuenta reserva del asesor.
  //   interactionValue = lo que ocupa cada una = provisioningLock / provisioning.
  interactionValue: number;
  provisioning: number;
  provisioningLock: number;
};

export type Efecto =
  | "Seguir intentando"
  | "Dejar este medio"
  | "Dejar de contactar"
  | "Sin efecto";

export type Clasificacion = {
  id: string;
  idExt?: string;
  nombre: string;
  descripcion?: string; // reservado IA
  tipo: "Exitoso" | "No exitoso" | "No efectivo" | "Neutro";
  parentId?: string;
  // Qué significa el resultado para el contacto, igual en todos los canales
  // y campañas (propuesta 2026-10-16, reemplaza a calling_time — a validar
  // con Pedro). Cuándo y por qué canal se sigue lo decide la estrategia de
  // salida de cada campaña, por efecto.
  efecto: Efecto;
  prompt?: string; // reservado IA
  // Clasificación de SISTEMA: la pone Atlas sola cuando la interacción no
  // llega a un agente (no contesta, ocupado, número inexistente…), a partir
  // de la causa que informa la red o el proveedor. Vienen en todos los
  // tenants y no se modifican. Qué causas caen en cada una lo define Atlas
  // (relevamiento criterios de recontacto, 2026-10-16) — el tenant no lo ve.
  sistema?: { explicacion: string };
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

// Plantillas de mensajes (ATLAS-1191, relevamiento/plantillas-de-mensajes):
// catálogo del tenant + grupos asignables a campañas, mismo modelo que
// clasificaciones y marcas. El contenido se escribe una vez con formato
// básico (**negrita**, _cursiva_, listas con "- ") y variables {{clave}};
// Atlas lo adapta a lo que soporta cada canal.
// Canales escritos: los tipos de cuenta de texto (todo menos Teléfono).
export type CanalPlantilla =
  | "chat"
  | "whatsapp"
  | "email"
  | "sms"
  | "instagram"
  | "facebook"
  | "tiktok"
  | "x"
  | "telegram"
  | "linkedin";

// Canales de mensajería: se combinan entre sí. Email y SMS van siempre solos
// (el SMS no admite formato y el email se escribe en texto plano o en HTML).
export const CANALES_MENSAJERIA: CanalPlantilla[] = [
  "chat",
  "whatsapp",
  "instagram",
  "facebook",
  "tiktok",
  "x",
  "telegram",
  "linkedin",
];

export const CANALES_PLANTILLA: CanalPlantilla[] = [
  "chat",
  "whatsapp",
  "email",
  "sms",
  "instagram",
  "facebook",
  "tiktok",
  "x",
  "telegram",
  "linkedin",
];

/**
 * Cómo se ve el mensaje según el canal:
 * - chat: chat web, WhatsApp y Telegram admiten formato (negrita, cursiva,
 *   tachado, listas); los enlaces van con la dirección completa.
 * - plano: Instagram, Facebook, TikTok, X y LinkedIn no admiten formato en
 *   sus mensajes: sale solo el texto (y los archivos como mensaje aparte).
 * - email: formato completo y enlaces con texto.
 * - sms: solo texto, sin archivos.
 */
export type TipoRender = "chat" | "plano" | "email" | "sms";
export const TIPOS_RENDER: TipoRender[] = ["chat", "plano", "email", "sms"];
export function tipoRenderDeCanal(canal: CanalPlantilla): TipoRender {
  if (canal === "email" || canal === "sms") return canal;
  if (canal === "chat" || canal === "whatsapp" || canal === "telegram") return "chat";
  return "plano";
}

// Las variables de la plantilla (catálogo y permisos) viven en lib/plantillas.ts.

export type AdjuntoPlantilla = { id: string; nombre: string; tamano: string };

/** Formato del cuerpo de un email: texto plano o código HTML. */
export type FormatoCuerpo = "texto" | "html";

export type Plantilla = {
  id: string;
  nombre: string;
  descripcion?: string;
  canales: CanalPlantilla[];
  /** Solo email. */
  asunto?: string;
  /** Solo email: cómo se interpreta `contenido` (por defecto texto plano). */
  bodyFormat?: FormatoCuerpo;
  /** Solo email con cuerpo HTML: el CSS se carga aparte y se compone con el HTML. */
  cuerpoCss?: string;
  contenido: string;
  adjuntos: AdjuntoPlantilla[];
  activa: boolean;
};

export type PlantillaGrupo = {
  id: string;
  nombre: string;
  descripcion?: string;
  plantillaIds: string[];
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

// Permisos sobre las claves de acceso API (Configuración → Claves de acceso
// API). Van aparte de la matriz de Olimpo porque crear y editar se separan:
// crear abre un acceso nuevo a Atlas y editar solo cambia dominios. Misma
// regla que la matriz: sin "ver" no hay ningún otro.
export type PermisoClaveApi = "ver" | "crear" | "editar" | "revocar";

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
  permisosClavesApi: PermisoClaveApi[]; // working_groups.permissions — claves de acceso API
  shortcutButtons: ShortcutButtonEntry[]; // working_groups.shortcut_buttons
  historyLookbackDays: number; // working_groups.parameters.agent_operation_settings.history_lookback_days — default 30 (ver parametrizacion-propuesta.md §5)
  // Grabación por grupo: se cruza con la de la campaña y gana lo más
  // restrictivo. Alcance nuevo, todavía no acordado — ver la propuesta de
  // grabaciones en documentacion/relevamiento-legacy/grabaciones/.
  recordingSettings: RecordingSettingsParams;
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
    grupoPlantillasId: "pg-cobranzas",
    plantillaDefaultChatId: "pl-saludo",
    plantillaDefaultEmailId: "pl-propuesta",
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
    // Mismo número, digitos-only, que mock-telefonia.ts (ya asignado a
    // org-banco-sur ahí) — así el Select de Cuentas lo muestra preseleccionado.
    identificador: "1140009911",
    uso: "ambas",
    modoSalida: "misma",
    interactionValue: 100,
    provisioning: 1,
    provisioningLock: 100,
  },
  {
    id: "acc-chat-1",
    nombre: "Chat Web Soporte",
    descripcion: "Chat del sitio para atención al cliente",
    tipo: "Chat",
    // Sin número de línea: `accounts.account` lleva el nombre, único por tenant.
    identificador: "Chat Web Soporte",
    interactionValue: 20,
    provisioning: 3, // chats simultáneos
    provisioningLock: 60, // % de la capacidad del asesor
  },
  {
    id: "acc-chat-2",
    nombre: "Chat App Móvil",
    descripcion: "Chat dentro de la app para clientes registrados",
    tipo: "Chat",
    identificador: "Chat App Móvil",
    interactionValue: 10,
    provisioning: 4, // chats simultáneos
    provisioningLock: 40, // % de la capacidad del asesor
  },
  {
    id: "acc-video-1",
    nombre: "Videollamada Asesoría",
    descripcion: "Videollamada con asesores desde el portal del cliente",
    tipo: "Videollamada",
    identificador: "Videollamada Asesoría",
    interactionValue: 100,
    provisioning: 1,
    provisioningLock: 100,
  },
  {
    id: "acc-video-2",
    nombre: "Videollamada Ventas",
    descripcion: "Videollamada con chat desde la tienda online, para mostrar productos y mandar comprobantes",
    tipo: "Videollamada",
    identificador: "Videollamada Ventas",
    chatEnLlamada: true,
    interactionValue: 100,
    provisioning: 1,
    provisioningLock: 100,
  },
  {
    id: "acc-webcall-1",
    nombre: "Webcall Soporte",
    descripcion: "Llamada de voz por web (solo audio) desde el portal del cliente, sin carrier",
    tipo: "Webcall",
    identificador: "Webcall Soporte",
    interactionValue: 100,
    provisioning: 1,
    provisioningLock: 100,
  },
  {
    id: "acc-webcall-2",
    nombre: "Webcall Ventas",
    descripcion: "Llamada web con chat desde la tienda online, para mandar links y comprobantes",
    tipo: "Webcall",
    identificador: "Webcall Ventas",
    chatEnLlamada: true,
    interactionValue: 100,
    provisioning: 1,
    provisioningLock: 100,
  },
  {
    id: "acc-2",
    nombre: "WhatsApp Soporte",
    descripcion: "Canal de WhatsApp para atención al cliente",
    tipo: "WhatsApp",
    identificador: "+54 9 11 5555-2020",
    interactionValue: 40,
    provisioning: 1,
    provisioningLock: 40,
  },
  {
    id: "acc-3",
    nombre: "Email Ventas",
    tipo: "Email",
    identificador: "ventas@bancosur.com",
    interactionValue: 20,
    provisioning: 1,
    provisioningLock: 20,
  },
  {
    id: "acc-4",
    nombre: "SMS Recordatorios",
    tipo: "SMS",
    identificador: "BANCOSUR",
    interactionValue: 10,
    provisioning: 1,
    provisioningLock: 10,
  },
];

// Tipificaciones de sistema (propuesta 2026-10-16, a validar con Pedro).
const clasificacionesSistema: Clasificacion[] = [
  {
    id: "sys-no-contesta",
    efecto: "Seguir intentando",
    nombre: "No contesta",
    tipo: "No efectivo",
    sistema: { explicacion: "El teléfono sonó y nadie atendió." },
  },
  {
    id: "sys-ocupado",
    efecto: "Seguir intentando",
    nombre: "Ocupado",
    tipo: "No efectivo",
    sistema: { explicacion: "El teléfono estaba ocupado en otra llamada." },
  },
  {
    id: "sys-apagado",
    efecto: "Seguir intentando",
    nombre: "Apagado o fuera de cobertura",
    tipo: "No efectivo",
    sistema: {
      explicacion:
        "El teléfono está apagado, sin señal o no se pudo llegar a él por un momento.",
    },
  },
  {
    id: "sys-rechazada",
    efecto: "Seguir intentando",
    nombre: "Rechazada",
    tipo: "No efectivo",
    sistema: {
      explicacion:
        "El contacto cortó sin atender o un bloqueador de spam filtró la llamada.",
    },
  },
  {
    id: "sys-inexistente",
    efecto: "Dejar este medio",
    nombre: "Número inexistente",
    tipo: "No efectivo",
    sistema: {
      explicacion: "El número no existe o está mal formado.",
    },
  },
  {
    id: "sys-cambiado",
    efecto: "Dejar este medio",
    nombre: "Número cambiado",
    tipo: "No efectivo",
    sistema: {
      explicacion: "El número ya no está en uso y fue reemplazado por otro.",
    },
  },
  {
    id: "sys-no-acepta",
    efecto: "Dejar este medio",
    nombre: "No acepta llamadas",
    tipo: "No efectivo",
    sistema: {
      explicacion: "El teléfono tiene bloqueadas las llamadas entrantes.",
    },
  },
  {
    id: "sys-fax",
    efecto: "Dejar este medio",
    nombre: "Fax o módem",
    tipo: "No efectivo",
    sistema: {
      explicacion: "Del otro lado atendió un fax o un módem, no un teléfono.",
    },
  },
];

export const clasificaciones: Clasificacion[] = [
  ...clasificacionesSistema,
  {
    id: "clas-cobranzas",
    nombre: "Cobranzas",
    tipo: "Neutro",
    efecto: "Sin efecto",
  },
  {
    id: "clas-c-pago",
    nombre: "Compromiso de pago",
    tipo: "Exitoso",
    efecto: "Dejar de contactar",
    parentId: "clas-cobranzas",
  },
  {
    id: "clas-c-nopago",
    nombre: "No puede pagar",
    tipo: "No exitoso",
    efecto: "Seguir intentando",
    parentId: "clas-cobranzas",
  },
  {
    id: "clas-c-rechazo",
    nombre: "Rechaza contacto",
    tipo: "No exitoso",
    efecto: "Dejar de contactar",
    parentId: "clas-cobranzas",
  },
  {
    id: "clas-atencion",
    nombre: "Atención al cliente",
    tipo: "Neutro",
    efecto: "Sin efecto",
  },
  {
    id: "clas-a-resuelto",
    nombre: "Resuelto en el momento",
    tipo: "Exitoso",
    efecto: "Dejar de contactar",
    parentId: "clas-atencion",
  },
  {
    id: "clas-a-escalado",
    nombre: "Escalado a nivel 2",
    tipo: "Neutro",
    efecto: "Sin efecto",
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

// MOCK: plantillas de ejemplo en memoria (incluye un email HTML+CSS de muestra y uno de prueba de
// validación que NO debe usarse).
// REAL: tabla message_templates de olimpo-api (por tenant): nombre, descripción, activa, canales,
// asunto (email), body_format, contenido, css (email) y adjuntos. El HTML se guarda ya saneado.
export const plantillas: Plantilla[] = [
  {
    id: "pl-saludo",
    nombre: "Saludo inicial",
    descripcion: "Para abrir la conversación cuando todavía no se sabe el motivo de contacto.",
    canales: [...CANALES_MENSAJERIA],
    contenido:
      "¡Hola {{cliente.nombre}}! Soy {{asesor.nombre}}. ¿En qué te puedo ayudar hoy?",
    adjuntos: [],
    activa: true,
  },
  {
    id: "pl-datos",
    nombre: "Pedir más datos",
    descripcion: "Cuando falta un dato puntual para seguir la gestión.",
    canales: ["chat", "whatsapp"],
    contenido:
      "Para poder ayudarte mejor, ¿me confirmás estos datos?\n1. Número de cliente\n2. Últimos 4 dígitos del documento",
    adjuntos: [],
    activa: true,
  },
  {
    id: "pl-propuesta",
    nombre: "Propuesta de pago",
    descripcion: "Envía las condiciones de la propuesta con el detalle adjunto.",
    canales: ["email"],
    asunto: "Tu propuesta de pago",
    bodyFormat: "html",
    contenido:
      "<p>{{cliente.nombre}}, te dejo la <strong>propuesta de pago</strong> que conversamos. Las condiciones completas están en el archivo adjunto.</p>\n[[archivo:propuesta-de-pago.pdf]]\n<p><em>Tiene validez hasta el último día hábil del mes.</em> Las condiciones generales están en <a href=\"https://www.ejemplo.com/condiciones\">nuestro sitio</a>.</p>",
    adjuntos: [
      { id: "adj-1", nombre: "propuesta-de-pago.pdf", tamano: "180 KB" },
    ],
    activa: true,
  },
  {
    id: "pl-contacto",
    nombre: "Confirmar datos de contacto",
    descripcion: "Pide confirmar el email y el documento que figuran en la ficha.",
    canales: ["chat", "whatsapp"],
    contenido:
      "{{cliente.nombre}}, ¿seguimos en contacto por {{cliente.email}}? Confirmame también tu documento ({{cliente.numero_identificacion}}).",
    adjuntos: [],
    activa: true,
  },
  {
    id: "pl-comprobante",
    nombre: "Enviar comprobante",
    descripcion: "Manda el comprobante del pedido como archivo, entre dos textos.",
    canales: ["chat", "whatsapp"],
    contenido:
      "Te paso el comprobante, {{cliente.nombre}}:\n[[archivo:comprobante-48213.pdf]]\nCualquier duda, escribime por acá.",
    adjuntos: [{ id: "adj-comprobante", nombre: "comprobante-48213.pdf", tamano: "96 KB" }],
    activa: true,
  },
  {
    id: "pl-demora",
    nombre: "Aviso de demora",
    descripcion: "Cuando el asesor tiene que consultar y el cliente va a esperar.",
    canales: ["chat", "whatsapp"],
    contenido: "Dame un minuto que lo reviso y te confirmo, {{cliente.nombre}}.",
    adjuntos: [],
    activa: true,
  },
  {
    id: "pl-cierre",
    nombre: "Cierre de conversación",
    descripcion: "Para cerrar de forma prolija una vez resuelta la consulta, antes de tipificar.",
    canales: [...CANALES_MENSAJERIA],
    contenido:
      "Perfecto, quedó todo resuelto. ¡Gracias por tu tiempo! Cualquier cosa, escribinos a este mismo número.",
    adjuntos: [],
    activa: true,
  },
  {
    id: "pl-recordatorio",
    nombre: "Recordatorio de vencimiento",
    descripcion: "Mensaje corto de recordatorio, pensado para SMS.",
    canales: ["sms"],
    contenido:
      "{{cliente.nombre}}, tu cuota vence pronto. Si ya pagaste, ignorá este mensaje.",
    adjuntos: [],
    activa: false,
  },
  {
    id: "pl-bienvenida-email",
    nombre: "Bienvenida con propuesta (email)",
    descripcion: "Email con diseño: propuesta de pago con tres destacados y botón para aceptarla.",
    canales: ["email"],
    asunto: "{{cliente.nombre}}, tu propuesta de pago está lista",
    bodyFormat: "html",
    contenido: "<!-- Preheader: texto que ve la bandeja de entrada junto al asunto; oculto en el cuerpo -->\n<div class=\"em-preheader\">Armamos una propuesta a tu medida, con el detalle de cuotas y fechas.</div>\n\n<table role=\"presentation\" class=\"em-fondo\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\">\n  <tr>\n    <td align=\"center\" class=\"em-fondo-celda\">\n\n      <!-- Contenedor de 600px -->\n      <table role=\"presentation\" class=\"em-contenedor\" width=\"600\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\">\n\n        <!-- Cabecera -->\n        <tr>\n          <td class=\"em-cabecera\" align=\"left\">\n            <table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\">\n              <tr>\n                <td class=\"em-logo\" align=\"center\">A</td>\n                <td class=\"em-marca\">Atlas</td>\n              </tr>\n            </table>\n            <h1 class=\"em-titulo\">Tu propuesta de pago está lista</h1>\n            <p class=\"em-subtitulo\">{{campania.nombre}}</p>\n          </td>\n        </tr>\n\n        <!-- Saludo y mensaje principal -->\n        <tr>\n          <td class=\"em-cuerpo\">\n            <p class=\"em-saludo\">Hola {{cliente.nombre}},</p>\n            <p class=\"em-texto\">Gracias por tu tiempo. Revisamos tu situación y preparamos una propuesta pensada para que puedas ponerte al día sin sobresaltos. Estos son los puntos principales:</p>\n          </td>\n        </tr>\n\n        <!-- Tres destacados: en móvil se apilan -->\n        <tr>\n          <td class=\"em-destacados-celda\">\n            <table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\">\n              <tr>\n                <td class=\"em-destacado em-col\" width=\"33%\" valign=\"top\">\n                  <p class=\"em-destacado-numero\">12</p>\n                  <p class=\"em-destacado-texto\">cuotas fijas, sin sorpresas</p>\n                </td>\n                <td class=\"em-destacado em-col\" width=\"33%\" valign=\"top\">\n                  <p class=\"em-destacado-numero\">0%</p>\n                  <p class=\"em-destacado-texto\">de interés adicional</p>\n                </td>\n                <td class=\"em-destacado em-col\" width=\"33%\" valign=\"top\">\n                  <p class=\"em-destacado-numero\">30</p>\n                  <p class=\"em-destacado-texto\">días para aceptarla</p>\n                </td>\n              </tr>\n            </table>\n          </td>\n        </tr>\n\n        <!-- Botón de llamada a la acción (a prueba de clientes de correo: tabla + enlace con padding) -->\n        <tr>\n          <td class=\"em-cuerpo\" align=\"center\">\n            <table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\">\n              <tr>\n                <td class=\"em-boton-celda\" align=\"center\">\n                  <a class=\"em-boton\" href=\"https://www.ejemplo.com/propuesta\" target=\"_blank\">Ver y aceptar la propuesta</a>\n                </td>\n              </tr>\n            </table>\n            <p class=\"em-nota\">Si el botón no funciona, copiá este enlace en tu navegador: https://www.ejemplo.com/propuesta</p>\n          </td>\n        </tr>\n\n        <!-- Firma -->\n        <tr>\n          <td class=\"em-cuerpo\">\n            <p class=\"em-texto\">Cualquier duda, respondé este correo y lo vemos juntos.</p>\n            <p class=\"em-firma\">\n              Un saludo,<br>\n              <strong>{{asesor.nombre}}</strong><br>\n              <span class=\"em-firma-detalle\">Equipo de {{campania.nombre}}</span>\n            </p>\n          </td>\n        </tr>\n\n        <!-- Pie legal -->\n        <tr>\n          <td class=\"em-pie\">\n            <p class=\"em-legal\">Recibís este correo porque sos cliente y tenés una gestión abierta con nosotros. Esta propuesta es personal y no es transferible. Las condiciones pueden cambiar si no se acepta dentro del plazo indicado.</p>\n            <p class=\"em-legal\"><a class=\"em-baja\" href=\"https://www.ejemplo.com/baja\">Dejar de recibir estos correos</a></p>\n          </td>\n        </tr>\n\n      </table>\n    </td>\n  </tr>\n</table>",
    cuerpoCss: "/* ===== Base ===== */\n/* Tipografía web-safe: se ve igual en todos los clientes de correo. */\nbody {\n  margin: 0;\n  padding: 0;\n  background-color: #f1f4f9;\n  font-family: Arial, Helvetica, sans-serif;\n  color: #1f2937;\n  -webkit-text-size-adjust: 100%;\n}\ntable { border-collapse: collapse; }\np { margin: 0; }\na { color: #1d4ed8; }\n\n/* ===== Preheader (oculto en el cuerpo, visible en la bandeja) ===== */\n.em-preheader {\n  display: none;\n  max-height: 0;\n  overflow: hidden;\n  opacity: 0;\n  font-size: 1px;\n  line-height: 1px;\n  color: #f1f4f9;\n}\n\n/* ===== Fondo y contenedor ===== */\n.em-fondo { background-color: #f1f4f9; }\n.em-fondo-celda { padding: 24px 12px; }\n.em-contenedor {\n  /* Ancho fluido con tope de 600px: en pantallas chicas se ajusta solo. */\n  width: 100% !important;\n  max-width: 600px;\n  background-color: #ffffff;\n  border-radius: 12px;\n  overflow: hidden;\n}\n\n/* ===== Cabecera: color sólido de base y degradé como mejora ===== */\n.em-cabecera {\n  background-color: #1d4ed8;\n  background-image: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);\n  padding: 32px 32px 28px 32px;\n  color: #ffffff;\n}\n.em-logo {\n  width: 36px;\n  height: 36px;\n  border-radius: 8px;\n  background-color: #ffffff;\n  color: #1d4ed8;\n  font-size: 20px;\n  font-weight: bold;\n  line-height: 36px;\n}\n.em-marca {\n  padding-left: 10px;\n  font-size: 18px;\n  font-weight: bold;\n  letter-spacing: 0.5px;\n  color: #ffffff;\n}\n.em-titulo {\n  margin: 24px 0 6px 0;\n  font-size: 26px;\n  line-height: 32px;\n  color: #ffffff;\n}\n.em-subtitulo {\n  font-size: 14px;\n  color: #dbeafe;\n}\n\n/* ===== Cuerpo ===== */\n.em-cuerpo { padding: 24px 32px 8px 32px; }\n.em-saludo {\n  font-size: 18px;\n  font-weight: bold;\n  margin-bottom: 12px;\n}\n.em-texto {\n  font-size: 15px;\n  line-height: 24px;\n  margin-bottom: 12px;\n}\n\n/* ===== Destacados ===== */\n.em-destacados-celda { padding: 8px 32px 8px 32px; }\n.em-destacado {\n  background-color: #eff6ff;\n  border: 6px solid #ffffff;\n  border-radius: 10px;\n  padding: 16px 8px;\n  text-align: center;\n}\n.em-destacado-numero {\n  font-size: 28px;\n  font-weight: bold;\n  color: #1d4ed8;\n}\n.em-destacado-texto {\n  font-size: 13px;\n  line-height: 18px;\n  color: #475569;\n}\n\n/* ===== Botón (tabla + enlace con padding) ===== */\n.em-boton-celda {\n  background-color: #1d4ed8;\n  border-radius: 8px;\n}\n.em-boton {\n  display: inline-block;\n  padding: 14px 28px;\n  font-size: 16px;\n  font-weight: bold;\n  color: #ffffff;\n  text-decoration: none;\n}\n.em-nota {\n  margin-top: 12px;\n  font-size: 12px;\n  line-height: 18px;\n  color: #64748b;\n}\n\n/* ===== Firma ===== */\n.em-firma {\n  font-size: 15px;\n  line-height: 22px;\n  margin-top: 8px;\n  margin-bottom: 8px;\n}\n.em-firma-detalle { color: #64748b; font-size: 13px; }\n\n/* ===== Pie ===== */\n.em-pie {\n  background-color: #f8fafc;\n  border-top: 1px solid #e2e8f0;\n  padding: 20px 32px;\n}\n.em-legal {\n  font-size: 11px;\n  line-height: 16px;\n  color: #64748b;\n  margin-bottom: 8px;\n}\n.em-baja { color: #64748b; }\n\n/* ===== Móvil: los destacados se apilan y se achican los márgenes ===== */\n@media only screen and (max-width: 480px) {\n  .em-fondo-celda { padding: 0; }\n  .em-contenedor { border-radius: 0; }\n  .em-cabecera { padding: 24px 20px; }\n  .em-titulo { font-size: 22px; line-height: 28px; }\n  .em-cuerpo { padding: 20px 20px 4px 20px; }\n  .em-destacados-celda { padding: 4px 20px; }\n  .em-col { display: block; width: 100% !important; box-sizing: border-box; }\n  .em-pie { padding: 16px 20px; }\n}\n\n/* ===== Modo oscuro ===== */\n@media (prefers-color-scheme: dark) {\n  body, .em-fondo { background-color: #0f172a !important; }\n  .em-contenedor { background-color: #1e293b !important; }\n  .em-cuerpo, .em-destacados-celda { color: #e2e8f0; }\n  .em-destacado { background-color: #0f172a; border-color: #1e293b; }\n  .em-destacado-numero { color: #93c5fd; }\n  .em-destacado-texto, .em-nota, .em-firma-detalle { color: #94a3b8; }\n  .em-boton-celda { background-color: #3b82f6; }\n  .em-pie { background-color: #0f172a; border-top-color: #334155; }\n  .em-legal, .em-baja { color: #94a3b8; }\n  a { color: #93c5fd; }\n}",
    adjuntos: [],
    activa: true,
  },
  {
    id: "pl-prueba-validacion",
    nombre: "Prueba de validación (no usar)",
    descripcion: "Solo para ver los errores del validador de email: trae un script, un evento onclick y una etiqueta sin cerrar.",
    canales: ["email"],
    asunto: "Prueba de validación",
    bodyFormat: "html",
    contenido: "<p>Hola {{cliente.nombre}}, mirá esta oferta.</p>\n<script>alert('hola')</script>\n<a href=\"javascript:alert(1)\" onclick=\"robar()\">Aceptar</a>\n<div><p>Texto con una etiqueta sin cerrar",
    cuerpoCss: "@import url(http://sitio.ejemplo/estilos.css);\n.a { color: red; ",
    adjuntos: [],
    activa: true,
  },
  {
    id: "pl-confirmacion-email",
    nombre: "Confirmación de pago (email, texto plano)",
    descripcion: "Confirma un pago recibido, en texto plano.",
    canales: ["email"],
    asunto: "Recibimos tu pago, {{cliente.nombre}}",
    bodyFormat: "texto",
    contenido:
      "Hola {{cliente.nombre}},\n\nConfirmamos que recibimos tu pago. Ya está acreditado en tu cuenta.\n\nUn saludo,\n{{asesor.nombre}}",
    adjuntos: [],
    activa: true,
  },
];

// MOCK: grupos de ejemplo con sus plantillas por id.
// REAL: tabla message_template_groups y su relación muchos a muchos con las plantillas, en olimpo-api.
export const plantillaGrupos: PlantillaGrupo[] = [
  {
    id: "pg-cobranzas",
    nombre: "Cobranzas",
    descripcion: "Mensajes de gestión de deuda y propuestas de pago.",
    plantillaIds: ["pl-saludo", "pl-datos", "pl-propuesta", "pl-demora", "pl-cierre", "pl-recordatorio"],
  },
  {
    id: "pg-atencion",
    nombre: "Atención al cliente",
    descripcion: "Saludo, pedido de datos y cierre para consultas generales.",
    plantillaIds: ["pl-saludo", "pl-datos", "pl-contacto", "pl-comprobante", "pl-demora", "pl-cierre"],
  },
  {
    id: "pg-email-comercial",
    nombre: "Email comercial",
    descripcion: "Correos con diseño y en texto plano para propuestas y confirmaciones.",
    plantillaIds: ["pl-propuesta", "pl-bienvenida-email", "pl-confirmacion-email", "pl-prueba-validacion"],
  },
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
  // Clientes (propuesta 2026-10-14): mismos permisos que el resto.
  "Clientes",
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
      { modulo: "Clientes", acciones: ["lectura", "escritura", "eliminacion"] },
      { modulo: "Cuentas", acciones: ["lectura"] },
      { modulo: "Clasificaciones", acciones: ["lectura", "escritura"] },
    ],
    accesoHermes: true,
    permisosClavesApi: ["ver", "crear", "editar", "revocar"],
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
    recordingSettings: {
      recordAudio: true,
      recordScreen: true,
      recordAgentAudioDuringHold: true,
      recordAcw: true,
    },
  },
  {
    id: "wg-atencion",
    nombre: "Atención al cliente",
    descripcion: "Equipo de soporte N1",
    usuarioIds: ["ag-3", "ag-5"],
    estadosAuxiliares: ["aux-almuerzo"],
    permisos: [
      { modulo: "Campañas", acciones: ["lectura"] },
      { modulo: "Clientes", acciones: ["lectura"] },
      { modulo: "Cuentas", acciones: ["lectura"] },
      { modulo: "Clasificaciones", acciones: ["lectura"] },
    ],
    accesoHermes: true,
    permisosClavesApi: ["ver"],
    shortcutButtons: [
      {
        id: "sb-atencion-1",
        nombre: "Base de conocimientos",
        url: "https://olimpo.bancosur.com/base-conocimiento",
        openAs: "frame",
      },
      {
        id: "sb-atencion-2",
        nombre: "Estado de reclamos",
        url: "https://olimpo.bancosur.com/reclamos",
        openAs: "frame",
      },
    ],
    historyLookbackDays: 30,
    recordingSettings: {
      recordAudio: true,
      recordScreen: true,
      recordAgentAudioDuringHold: true,
      recordAcw: true,
    },
  },
  {
    id: "wg-ventas",
    nombre: "Ventas",
    descripcion: "Equipo comercial de ventas salientes",
    usuarioIds: ["ag-2"],
    estadosAuxiliares: ["aux-almuerzo", "aux-reunion"],
    permisos: [
      { modulo: "Campañas", acciones: ["lectura", "escritura"] },
      { modulo: "Clientes", acciones: ["lectura", "escritura"] },
      { modulo: "Cuentas", acciones: ["lectura"] },
      { modulo: "Marcas", acciones: ["lectura"] },
    ],
    accesoHermes: true,
    permisosClavesApi: [],
    shortcutButtons: [
      {
        id: "sb-ventas-1",
        nombre: "Catálogo de productos",
        url: "https://olimpo.bancosur.com/catalogo-productos",
        openAs: "frame",
      },
    ],
    historyLookbackDays: 30,
    recordingSettings: {
      recordAudio: true,
      recordScreen: true,
      recordAgentAudioDuringHold: true,
      recordAcw: true,
    },
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

export function getPlantilla(id: string) {
  return plantillas.find((p) => p.id === id);
}

export function getPlantillaGrupo(id: string) {
  return plantillaGrupos.find((g) => g.id === id);
}

export function getPlantillasDeGrupo(grupoId: string) {
  const grupo = getPlantillaGrupo(grupoId);
  if (!grupo) return [];
  return plantillas.filter((p) => grupo.plantillaIds.includes(p.id));
}

export function getFeriado(id: string) {
  return feriados.find((f) => f.id === id);
}

export function getListaExclusion(id: string) {
  return listasExclusion.find((l) => l.id === id);
}
