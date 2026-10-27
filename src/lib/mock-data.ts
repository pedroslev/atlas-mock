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
export type CanalPlantilla = "chat" | "email" | "sms";

export const CANALES_PLANTILLA: CanalPlantilla[] = ["chat", "email", "sms"];

export type OrigenVariable = "cliente" | "campania" | "asesor";

export type VariablePlantilla = {
  clave: string;
  origen: OrigenVariable;
  /** Valor con el que se arma la vista previa. */
  ejemplo: string;
  /**
   * Si falta el dato: texto que lo reemplaza. Es una configuración general
   * del tenant (solapa Variables), no de cada plantilla. Sin respaldo, Hermes
   * avisa al asesor antes de enviar.
   */
  respaldo?: string;
};

// Las variables salen de lo que Atlas ya conoce: los campos del cliente
// (módulo Clientes), la campaña y el asesor. La etiqueta visible se traduce
// con `plantillas.variable.<clave>`.
export const variablesPlantilla: VariablePlantilla[] = [
  { clave: "nombre", origen: "cliente", ejemplo: "Juan", respaldo: "" },
  { clave: "apellido", origen: "cliente", ejemplo: "Pérez", respaldo: "" },
  { clave: "documento", origen: "cliente", ejemplo: "28.456.789" },
  { clave: "telefono", origen: "cliente", ejemplo: "+54 11 5555-0101" },
  { clave: "email", origen: "cliente", ejemplo: "juan.perez@mail.com" },
  { clave: "numeroCliente", origen: "cliente", ejemplo: "CL-10422" },
  { clave: "campania", origen: "campania", ejemplo: "Cobranzas Activa PCP" },
  { clave: "asesor", origen: "asesor", ejemplo: "Ana" },
];

export type AdjuntoPlantilla = { id: string; nombre: string; tamano: string };

export type Plantilla = {
  id: string;
  nombre: string;
  descripcion?: string;
  canales: CanalPlantilla[];
  /** Solo email. */
  asunto?: string;
  contenido: string;
  /** Valor de respaldo por variable usada, cuando el dato del cliente falta. */
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
    plantillaDefaultEmailId: "pl-saludo",
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

export const plantillas: Plantilla[] = [
  {
    id: "pl-saludo",
    nombre: "Saludo inicial",
    descripcion: "Para abrir la conversación cuando todavía no se sabe el motivo de contacto.",
    canales: ["chat", "email", "sms"],
    asunto: "Hola {{nombre}}, te escribimos por tu cuenta",
    contenido:
      "¡Hola {{nombre}}! Soy {{asesor}}. ¿En qué te puedo ayudar hoy?",
    adjuntos: [],
    activa: true,
  },
  {
    id: "pl-datos",
    nombre: "Pedir más datos",
    descripcion: "Cuando falta un dato puntual para seguir la gestión.",
    canales: ["chat", "email"],
    contenido:
      "Para poder ayudarte mejor, ¿me confirmás estos datos?\n- Número de cliente\n- Últimos 4 dígitos del documento",
    adjuntos: [],
    activa: true,
  },
  {
    id: "pl-propuesta",
    nombre: "Propuesta de pago",
    descripcion: "Envía las condiciones de la propuesta con el detalle adjunto.",
    canales: ["chat", "email"],
    asunto: "Tu propuesta de pago",
    contenido:
      "{{nombre}}, te dejo la **propuesta de pago** que conversamos. Las condiciones completas están en el archivo.\n[[archivo:propuesta-de-pago.pdf]]\n_Tiene validez hasta el último día hábil del mes._",
    adjuntos: [
      { id: "adj-1", nombre: "propuesta-de-pago.pdf", tamano: "180 KB" },
    ],
    activa: true,
  },
  {
    id: "pl-demora",
    nombre: "Aviso de demora",
    descripcion: "Cuando el asesor tiene que consultar y el cliente va a esperar.",
    canales: ["chat"],
    contenido: "Dame un minuto que lo reviso y te confirmo, {{nombre}}.",
    adjuntos: [],
    activa: true,
  },
  {
    id: "pl-cierre",
    nombre: "Cierre de conversación",
    descripcion: "Para cerrar de forma prolija una vez resuelta la consulta, antes de tipificar.",
    canales: ["chat", "email", "sms"],
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
      "{{nombre}}, tu cuota vence pronto. Si ya pagaste, ignorá este mensaje.",
    adjuntos: [],
    activa: false,
  },
];

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
    plantillaIds: ["pl-saludo", "pl-datos", "pl-demora", "pl-cierre"],
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
