// Datos de ejemplo para el wireframe conceptual del pad omnicanal (ver
// relevamiento/pad-competencia/brief-mock-pad.md). Separado a propósito de
// mock-pad.ts: ese archivo alimenta el pad REAL de Hermes (llamada, con su
// propia máquina de estados); esto es una exploración de layout para discutir
// el lunes, no un reemplazo. No compartir tipos entre los dos.

import type { LucideIcon } from "lucide-react";
import {
  Phone,
  MessageCircle,
  MessageSquareText,
  Smartphone,
  Mail,
  Ticket,
  Building2,
  Receipt,
  BookOpen,
  Calculator,
  Users,
  CircleCheck,
  CircleSlash,
  PowerOff,
  Utensils,
  GraduationCap,
  Coffee,
  ShieldCheck,
  Gauge,
  Scale,
  Percent,
  Library,
  Contact,
  Gift,
  LifeBuoy,
} from "lucide-react";

export type CanalMock = "llamada" | "chat" | "whatsapp" | "mail" | "sms";

export const CANAL_ICON: Record<CanalMock, LucideIcon> = {
  llamada: Phone,
  chat: MessageCircle,
  whatsapp: Smartphone,
  mail: Mail,
  sms: MessageSquareText,
};

export const CANAL_LABEL: Record<CanalMock, string> = {
  llamada: "Llamada",
  chat: "Chat",
  whatsapp: "WhatsApp",
  mail: "Mail",
  sms: "SMS",
};

// --- Campañas salientes (modal "Nueva interacción" de la cola) ------------
// Nombres a propósito parecidos a los de mock-data.ts de Olimpo, para que se
// sienta el mismo tenant — pero es un mock propio, no un import real
// (mismo criterio que el resto de pad-mock: separado del pad real). Cada
// campaña trae sus propias cuentas salientes; el modal las filtra según la
// campaña elegida, no muestra todas las cuentas del tenant.
export type CuentaSaliente = { id: string; nombre: string; canal: CanalMock; identificador: string };
export type CampaniaSaliente = { id: string; nombre: string; cuentas: CuentaSaliente[] };

export const campaniasSalientesMock: CampaniaSaliente[] = [
  {
    id: "camp-1",
    nombre: "Cobranzas Activa PCP",
    cuentas: [
      { id: "acc-1", nombre: "Línea Cobranzas AR", canal: "llamada", identificador: "+54 11 4000-1000" },
      { id: "acc-1-wsp", nombre: "WhatsApp Cobranzas", canal: "whatsapp", identificador: "+54 9 11 4000-1000" },
    ],
  },
  {
    id: "camp-4",
    nombre: "Soporte técnico Nivel 1",
    cuentas: [
      { id: "acc-2", nombre: "WhatsApp Soporte", canal: "whatsapp", identificador: "+54 9 11 5555-2020" },
    ],
  },
  {
    id: "camp-6",
    nombre: "Lanzamiento Tarjeta Plus",
    cuentas: [
      { id: "acc-3", nombre: "Línea Ventas", canal: "llamada", identificador: "+54 11 4900-3000" },
      { id: "acc-4", nombre: "SMS Recordatorios", canal: "sms", identificador: "BANCOSUR" },
    ],
  },
];

// --- Campañas del agente (nav "Mi turno") ----------------------------------
// A qué campañas está asociado el agente logueado en este turno — a
// propósito, dataset separado de campaniasSalientesMock: esas son TODAS las
// campañas con marcado saliente disponibles en el tenant, estas son solo las
// que le tocan a esta agente hoy (ids repetidos donde coinciden, mismo
// tenant, misma convención de nombres que Olimpo).
export type CampaniaAgente = { id: string; nombre: string; canales: CanalMock[]; horario: string };

export const campaniasAgenteMock: CampaniaAgente[] = [
  { id: "camp-1", nombre: "Cobranzas Activa PCP", canales: ["llamada", "whatsapp"], horario: "09:00 – 18:00" },
  { id: "camp-4", nombre: "Soporte técnico Nivel 1", canales: ["whatsapp", "chat"], horario: "09:00 – 18:00" },
  { id: "camp-6", nombre: "Lanzamiento Tarjeta Plus", canales: ["llamada", "sms"], horario: "13:00 – 18:00" },
];

// Solo dos escenarios en la cola (a pedido: "pongas solo dos escenarios, una
// de telefonía y otra de chat") — cada fila mapea 1 a 1 con su dataset, sin
// filas de relleno que repitan el mismo contenido.
export type DatasetId = "A" | "B";

export type FilaCola = {
  id: string;
  numeroCliente: string;
  canal: CanalMock;
  esperaSeg: number;
  datasetId: DatasetId;
};

export const colaMock: FilaCola[] = [
  { id: "q-1", numeroCliente: "3345789", canal: "llamada", esperaSeg: 14, datasetId: "A" },
  { id: "q-2", numeroCliente: "5512980", canal: "chat", esperaSeg: 71, datasetId: "B" },
];

// --- Escenario A: llamada activa (reclamo por facturación) ----------------
export const clienteA = {
  numeroCliente: "3345789",
  nombre: "Valentina Ibarra",
  telefono: "+54 11 4589-2231",
  mail: "valentina.ibarra@correo.com",
  segmento: "Estándar",
  antiguedad: "2 años y 3 meses",
};

// "hora" en formato hora:minuto:segundo — mismo formato que el chat, a
// pedido (antes la transcripción no mostraba horario).
export type TurnoLlamada = { turno: "cliente" | "agente"; texto: string; hora: string };

export const transcripcionLlamada: TurnoLlamada[] = [
  { turno: "agente", texto: "Buenas tardes, habla con Atención al Cliente, mi nombre es Marina. ¿En qué puedo ayudarla?", hora: "14:15:02" },
  { turno: "cliente", texto: "Hola, buenas. Te llamo porque en la factura de este mes me cobraron un cargo que no reconozco, de casi ocho mil pesos.", hora: "14:15:09" },
  { turno: "agente", texto: "Entiendo, disculpe las molestias. ¿Me confirma el número de cliente para revisar la cuenta?", hora: "14:15:24" },
  { turno: "cliente", texto: "Sí, es el 3345789.", hora: "14:15:31" },
  { turno: "agente", texto: "Perfecto, deme un segundo que lo reviso...", hora: "14:15:36" },
  { turno: "cliente", texto: "Es la segunda vez que me pasa esto. La verdad que ya me cansé de tener que llamar.", hora: "14:15:53" },
];

export const copilotoLlamada = {
  texto: "El cargo \"Servicio adicional Premium\" del 12/08 no figura en el plan contratado por la clienta.",
  accion: "Marcar como revisado",
};

// Controles de llamada — Marcar (bookmarks de calidad) y Transferir.
// "descripcion" alimenta el ícono "i" del selector (hover) — mismo patrón
// que Tipificacion, a pedido: buscador + descripción también en Marcar.
export type MarcaDisponible = { id: string; nombre: string; descripcion: string };

export const marcasDisponibles: MarcaDisponible[] = [
  {
    id: "mk-1",
    nombre: "Cliente VIP",
    descripcion: "Cliente de segmento preferencial o con acuerdos comerciales especiales — priorizar en derivaciones.",
  },
  {
    id: "mk-2",
    nombre: "Reclamo activo",
    descripcion: "Hay un reclamo abierto sin resolver relacionado con esta interacción.",
  },
  {
    id: "mk-3",
    nombre: "Promesa de pago",
    descripcion: "El cliente se comprometió a pagar en una fecha determinada — anotar el seguimiento.",
  },
  {
    id: "mk-4",
    nombre: "Requiere seguimiento",
    descripcion: "Esta interacción necesita que alguien la retome más adelante, no quedó resuelta del todo.",
  },
];

export const destinosTransferencia: string[] = [
  "Nivel 2 — Facturación",
  "Supervisor de turno",
  "Equipo de Logística",
];

// --- Escenario B: chat (consulta por envío) --------------------------------
export const clienteB = {
  numeroCliente: "5512980",
  nombre: "Nicolás Aguirre",
  telefono: "+54 11 4021-9987",
  mail: "nicolas.aguirre@correo.com",
  segmento: "Preferencial",
  antiguedad: "4 años y 8 meses",
};

// "hora" en formato hora:minuto:segundo — mismo formato que la transcripción.
export type MensajeChat = { autor: "cliente" | "agente"; texto: string; hora: string };

export const mensajesChat: MensajeChat[] = [
  { autor: "cliente", texto: "Hola, buenas tardes 👋 Quería consultar por el envío de mi pedido, todavía no me llegó.", hora: "14:02:11" },
  { autor: "agente", texto: "¡Hola Nicolás! Ya te ayudo. ¿Me pasás el número de pedido, por favor?", hora: "14:02:38" },
  { autor: "cliente", texto: "Sí, es el #48213.", hora: "14:03:05" },
  { autor: "agente", texto: "Genial, dejame revisarlo un segundo...", hora: "14:03:19" },
];

export const copilotoChat = {
  texto: "Tu pedido #48213 salió del depósito ayer y el transportista estima entrega para mañana antes de las 18 hs. Te paso el número de seguimiento: AR48213X.",
};

export const copilotoArticulo = {
  titulo: "Política de envíos — demoras",
  resumen:
    "Los envíos estándar tardan de 3 a 5 días hábiles. Ante demoras, ofrecer seguimiento y, si supera los 7 días hábiles, evaluar reenvío sin cargo.",
  fuente: "Base de conocimiento — Logística",
};

// Plantillas de mensajes — reemplaza al selector de canal de salida en el
// redactor (retirado a pedido). "descripcion" alimenta el ícono "i" de ayuda
// del selector (hover).
export type PlantillaMensaje = { id: string; nombre: string; texto: string; descripcion: string };

export const plantillasMensaje: PlantillaMensaje[] = [
  {
    id: "pl-1",
    nombre: "Saludo inicial",
    texto: "¡Hola! Gracias por escribirnos. ¿En qué te puedo ayudar hoy?",
    descripcion: "Para abrir la conversación cuando todavía no se sabe el motivo de contacto.",
  },
  {
    id: "pl-2",
    nombre: "Pedir más datos",
    texto: "Para poder ayudarte mejor, ¿me confirmás tu número de pedido?",
    descripcion: "Cuando falta un dato puntual (pedido, DNI, número de cliente) para seguir la gestión.",
  },
  {
    id: "pl-3",
    nombre: "Cierre de conversación",
    texto: "Perfecto, quedó todo resuelto. ¡Gracias por tu paciencia! Cualquier cosa, escribinos.",
    descripcion: "Para cerrar de forma prolija una vez resuelta la consulta, antes de tipificar.",
  },
];

// --- Historial DE CONTACTO por cliente (vive DENTRO de la interacción, en el
// acordeón de contexto — brief §5.2). Distinto del historial del agente
// (abajo): acá es "qué pasó con este cliente", no "qué gestionó el agente".
// Cada entrada tiene el detalle completo para el modal "Ver más": el hilo
// (transcripción o conversación, según el canal), tipificación, bookmarks,
// el agente que la atendió y un resumen generado por IA.
export type HistorialEntrada = {
  id: string;
  fecha: string;
  canal: CanalMock;
  estado: "Resuelto" | "Derivado a nivel 2" | "Sin resolución";
  resumen: string;
  agente: string;
  tipificacion: string;
  // Descripción propia de este historial — a propósito no busca la
  // tipificación en el catálogo vigente (tipificacionesA/B): un contacto
  // viejo puede referenciar un código que ya no existe o cambió de texto.
  tipificacionDescripcion: string;
  bookmarks: string[];
  resumenIA: string;
  duracion: string;
  hilo: { autor: "cliente" | "agente"; texto: string }[];
};

export const historialPorCliente: Record<string, HistorialEntrada[]> = {
  "3345789": [
    {
      id: "h-a1",
      fecha: "22/07/2026",
      canal: "llamada",
      estado: "Resuelto",
      resumen: "Consulta por vencimiento de factura.",
      agente: "Rocío Benítez",
      tipificacion: "Consulta resuelta",
      tipificacionDescripcion: "La consulta del cliente se respondió por completo en esta gestión.",
      bookmarks: ["Cliente VIP"],
      resumenIA:
        "La clienta consultó la fecha de vencimiento de su factura de julio. Se le informó el vencimiento (28/07) y las formas de pago disponibles. Quedó conforme.",
      duracion: "2:14",
      hilo: [
        { autor: "cliente", texto: "Hola, quería saber cuándo vence mi factura de este mes." },
        { autor: "agente", texto: "Hola, vence el 28/07. La podés pagar por home banking o en cualquier sucursal." },
        { autor: "cliente", texto: "Perfecto, gracias." },
      ],
    },
    {
      id: "h-a2",
      fecha: "03/06/2026",
      canal: "mail",
      estado: "Sin resolución",
      resumen: "Reclamo por cargo duplicado — sin respuesta del cliente.",
      agente: "Julián Ferreyra",
      tipificacion: "Sin resolución",
      tipificacionDescripcion: "Se agotaron las opciones disponibles en esta gestión y no se llegó a una resolución.",
      bookmarks: ["Reclamo activo", "Requiere seguimiento"],
      resumenIA:
        "La clienta reportó por mail un cobro duplicado del servicio adicional. Se le pidió el número de comprobante para investigar y no volvió a responder. Reclamo quedó abierto.",
      duracion: "—",
      hilo: [
        { autor: "cliente", texto: "Me cobraron dos veces el mismo servicio este mes, adjunto el resumen." },
        { autor: "agente", texto: "Gracias por avisar. ¿Me podés pasar el número de comprobante de cada cobro para investigar?" },
      ],
    },
    {
      id: "h-a3",
      fecha: "19/04/2026",
      canal: "llamada",
      estado: "Derivado a nivel 2",
      resumen: "Solicitud de baja de servicio adicional.",
      agente: "Marina Acosta",
      tipificacion: "Deriva a Facturación",
      tipificacionDescripcion: "El caso requiere una autorización que solo puede procesar el equipo de Facturación.",
      bookmarks: [],
      resumenIA:
        "La clienta pidió dar de baja el 'Servicio adicional Premium'. No se pudo procesar en primera línea por requerir autorización de Facturación; se derivó el caso a nivel 2.",
      duracion: "1:47",
      hilo: [
        { autor: "cliente", texto: "Quiero dar de baja el servicio adicional que tengo contratado." },
        { autor: "agente", texto: "Entiendo. Esa baja la tiene que procesar Facturación — te derivo el caso ahora." },
      ],
    },
  ],
  "5512980": [
    {
      id: "h-b1",
      fecha: "30/07/2026",
      canal: "whatsapp",
      estado: "Resuelto",
      resumen: "Consulta por cambio de dirección de envío.",
      agente: "Rocío Benítez",
      tipificacion: "Consulta resuelta",
      tipificacionDescripcion: "La consulta del cliente se respondió por completo en esta gestión.",
      bookmarks: ["Cliente frecuente"],
      resumenIA:
        "El cliente solicitó cambiar la dirección de envío de un pedido en curso. Se actualizó el dato antes del despacho y se confirmó por WhatsApp.",
      duracion: "3:02",
      hilo: [
        { autor: "cliente", texto: "Necesito cambiar la dirección de entrega de mi último pedido." },
        { autor: "agente", texto: "Listo, ya actualicé la dirección. Te va a llegar a la nueva sin problema." },
      ],
    },
    {
      id: "h-b2",
      fecha: "11/05/2026",
      canal: "chat",
      estado: "Resuelto",
      resumen: "Consulta por medios de pago disponibles.",
      agente: "Julián Ferreyra",
      tipificacion: "Consulta resuelta",
      tipificacionDescripcion: "La consulta del cliente se respondió por completo en esta gestión.",
      bookmarks: [],
      resumenIA:
        "El cliente consultó qué medios de pago se aceptan para compras online. Se le informaron las opciones disponibles (tarjeta, transferencia, efectivo en puntos de pago).",
      duracion: "1:05",
      hilo: [
        { autor: "cliente", texto: "¿Qué medios de pago aceptan para compras por la web?" },
        { autor: "agente", texto: "Tarjeta de crédito/débito, transferencia y efectivo en puntos de pago adheridos." },
      ],
    },
  ],
};

// --- Tipificación -----------------------------------------------------------
// "descripcion" alimenta el ícono "i" de ayuda de cada opción (hover).
export type Tipificacion = { id: string; nombre: string; descripcion: string; sugerida?: boolean };

export const tipificacionesA: Tipificacion[] = [
  {
    id: "t-1",
    nombre: "Reclamo resuelto",
    descripcion: "El reclamo se resolvió en esta misma gestión, sin necesidad de derivar ni hacer seguimiento.",
  },
  {
    id: "t-2",
    nombre: "Cargo a revisar por Facturación",
    descripcion: "El cliente reclama un cargo que no reconoce y que hay que validar contra el plan contratado.",
    sugerida: true,
  },
  {
    id: "t-3",
    nombre: "Cliente solicita rellamado",
    descripcion: "El cliente pidió que lo vuelvan a contactar en otro momento — no se resolvió ni se derivó.",
  },
  {
    id: "t-4",
    nombre: "Sin resolución",
    descripcion: "Se agotaron las opciones disponibles en esta gestión y no se llegó a una resolución.",
  },
];

export const tipificacionesB: Tipificacion[] = [
  {
    id: "t-5",
    nombre: "Consulta resuelta",
    descripcion: "La consulta del cliente se respondió por completo en esta conversación.",
    sugerida: true,
  },
  {
    id: "t-6",
    nombre: "Deriva a Logística",
    descripcion: "El caso requiere intervención del equipo de Logística (envíos, demoras, extravíos).",
  },
  {
    id: "t-7",
    nombre: "Cliente solicita reenvío",
    descripcion: "El cliente pidió que se le reenvíe el pedido, por demora o por un problema con el original.",
  },
];

// --- Páginas externas ---------------------------------------------------
// "icon" es fijo por integración — a pedido, se configura afuera del pad
// (Olimpo/backoffice), acá solo se refleja. "url" apunta a /sistema-externo
// (mock de un sistema de terceros — ver sistema-externo-data.ts): en modo
// "embebido" ("frame", entra en un <iframe>) y en modo "pestana" ("blank",
// se abre con target=_blank) — a pedido, ambos casos necesitan un destino
// real para poder mockear cómo funcionaría, no solo un cartel de "acá iría
// contenido".
export type PaginaExterna = {
  id: string;
  nombre: string;
  modo: "embebido" | "pestana";
  url: string;
  icon: LucideIcon;
};

export const paginasExternas: PaginaExterna[] = [
  {
    id: "ext-tickets",
    nombre: "Sistema de tickets",
    modo: "embebido",
    url: "/sistema-externo?id=ext-tickets",
    icon: Ticket,
  },
  {
    id: "ext-crm",
    nombre: "CRM comercial",
    modo: "embebido",
    url: "/sistema-externo?id=ext-crm",
    icon: Building2,
  },
  {
    id: "ext-facturacion",
    nombre: "Portal de facturación",
    modo: "pestana",
    url: "/sistema-externo?id=ext-facturacion",
    icon: Receipt,
  },
  {
    id: "ext-buro",
    nombre: "Buró de crédito",
    modo: "pestana",
    url: "/sistema-externo?id=ext-buro",
    icon: ShieldCheck,
  },
  {
    id: "ext-scoring",
    nombre: "Scoring de riesgo",
    modo: "embebido",
    url: "/sistema-externo?id=ext-scoring",
    icon: Gauge,
  },
  {
    id: "ext-legales",
    nombre: "Portal de Legales",
    modo: "pestana",
    url: "/sistema-externo?id=ext-legales",
    icon: Scale,
  },
  {
    id: "ext-refinanciacion",
    nombre: "Simulador de refinanciación",
    modo: "embebido",
    url: "/sistema-externo?id=ext-refinanciacion",
    icon: Percent,
  },
];

// --- Accesos rápidos (menú izquierdo, arriba de Mi turno) ------------------
// "Shortcut buttons": no pertenecen a ninguna interacción puntual — el
// agente los usa igual esté en cola vacía o en medio de una llamada. Mismo
// tipo y mismo componente de contenido que las páginas externas (embebido o
// pestaña aparte); a diferencia de esas, se abren sobre toda la pantalla del
// pad (menos el menú y el navbar), no en una solapa.
export const accesosRapidosMock: PaginaExterna[] = [
  {
    id: "ar-manual",
    nombre: "Manual del agente",
    modo: "embebido",
    url: "/sistema-externo?id=ar-manual",
    icon: BookOpen,
  },
  {
    id: "ar-calculadora",
    nombre: "Calculadora de cuotas",
    modo: "embebido",
    url: "/sistema-externo?id=ar-calculadora",
    icon: Calculator,
  },
  {
    id: "ar-rrhh",
    nombre: "Portal de RRHH",
    modo: "pestana",
    url: "/sistema-externo?id=ar-rrhh",
    icon: Users,
  },
  {
    id: "ar-conocimiento",
    nombre: "Base de conocimientos",
    modo: "embebido",
    url: "/sistema-externo?id=ar-conocimiento",
    icon: Library,
  },
  {
    id: "ar-directorio",
    nombre: "Directorio interno",
    modo: "pestana",
    url: "/sistema-externo?id=ar-directorio",
    icon: Contact,
  },
  {
    id: "ar-beneficios",
    nombre: "Portal de beneficios",
    modo: "pestana",
    url: "/sistema-externo?id=ar-beneficios",
    icon: Gift,
  },
  {
    id: "ar-mesaayuda",
    nombre: "Mesa de ayuda IT",
    modo: "embebido",
    url: "/sistema-externo?id=ar-mesaayuda",
    icon: LifeBuoy,
  },
];

// --- Historial DEL AGENTE (nav item propio, §"por debajo suma Historial") --
// La totalidad de lo que gestionó el agente, cualquier canal — distinto del
// historial de contacto de arriba, que es por cliente y vive dentro de cada
// interacción.
export type HistorialAgenteEntrada = {
  id: string;
  fecha: string;
  hora: string;
  canal: CanalMock;
  numeroCliente: string;
  nombreCliente?: string;
  duracion: string;
  tipificacion: string;
};

export const historialAgenteMock: HistorialAgenteEntrada[] = [
  { id: "ha-1", fecha: "18/08/2026", hora: "13:52", canal: "llamada", numeroCliente: "4498812", nombreCliente: "Elena Rivas", duracion: "3:34", tipificacion: "Reclamo resuelto" },
  { id: "ha-2", fecha: "18/08/2026", hora: "13:35", canal: "whatsapp", numeroCliente: "8871023", nombreCliente: "Nicolás Aguirre", duracion: "6:12", tipificacion: "Consulta resuelta" },
  { id: "ha-3", fecha: "18/08/2026", hora: "13:18", canal: "chat", numeroCliente: "5512980", duracion: "4:02", tipificacion: "Deriva a Logística" },
  { id: "ha-4", fecha: "18/08/2026", hora: "12:59", canal: "mail", numeroCliente: "6603317", nombreCliente: "Diego Peralta", duracion: "—", tipificacion: "Sin resolución" },
  { id: "ha-5", fecha: "18/08/2026", hora: "12:41", canal: "llamada", numeroCliente: "3345789", nombreCliente: "Valentina Ibarra", duracion: "5:56", tipificacion: "Cargo a revisar por Facturación" },
  { id: "ha-6", fecha: "18/08/2026", hora: "12:20", canal: "llamada", numeroCliente: "7729015", duracion: "1:01", tipificacion: "Cliente solicita rellamado" },
];

// --- Estadísticas del agente (nav item propio) ------------------------------
export const estadisticasAgenteMock = {
  interaccionesHoy: 14,
  tiempoPromedio: "4:38",
  tiempoEnPausa: "0:52",
  cumplimientoObjetivo: "92%",
  porCanal: [
    { canal: "llamada" as CanalMock, cantidad: 8 },
    { canal: "chat" as CanalMock, cantidad: 3 },
    { canal: "whatsapp" as CanalMock, cantidad: 2 },
    { canal: "mail" as CanalMock, cantidad: 1 },
  ],
};

// --- Chats internos (menú izquierdo, entre la cola y Estadísticas) --------
// Solo el listado + apertura de ventana flotante por ahora — el alta de un
// chat nuevo (botón "+") todavía no está mockeada.
export type ChatInterno = { id: string; nombre: string; noLeidos: number };

export const chatsInternosMock: ChatInterno[] = [
  { id: "ci-1", nombre: "Rocío Benítez — Supervisora", noLeidos: 2 },
  { id: "ci-2", nombre: "Julián Ferreyra", noLeidos: 0 },
  { id: "ci-3", nombre: "Turno tarde — Cobranzas", noLeidos: 5 },
];

// Mensajes de ejemplo para las ventanas flotantes de chat interno.
export const mensajesChatInterno: Record<string, MensajeChat[]> = {
  "ci-1": [
    { autor: "cliente", texto: "¿Cómo venís con la cola? Tengo dos casos VIP para pasarte.", hora: "14:05" },
    { autor: "agente", texto: "Dale, en 5 min termino esta y los tomo.", hora: "14:06" },
  ],
  "ci-2": [{ autor: "cliente", texto: "¿Viste el mail de la nueva política de reembolsos?", hora: "13:40" }],
  "ci-3": [
    { autor: "cliente", texto: "Che, ¿alguien libre para tomar una llamada saliente urgente?", hora: "14:10" },
    { autor: "cliente", texto: "Es del caso de Ibarra, cliente VIP.", hora: "14:10" },
  ],
};

// --- Estado del agente (selector del menú izquierdo) ------------------------
export type EstadoAgenteMock = {
  id: string;
  nombre: string;
  grupo: "principal" | "auxiliar";
  icon: LucideIcon;
  dotClass: string;
};

export const estadosAgenteDisponibles: EstadoAgenteMock[] = [
  { id: "disponible", nombre: "Disponible", grupo: "principal", icon: CircleCheck, dotClass: "bg-success" },
  { id: "no-disponible", nombre: "No disponible", grupo: "principal", icon: CircleSlash, dotClass: "bg-destructive" },
  { id: "ausente", nombre: "Ausente", grupo: "principal", icon: PowerOff, dotClass: "bg-muted-foreground" },
  { id: "almuerzo", nombre: "Almuerzo", grupo: "auxiliar", icon: Utensils, dotClass: "bg-warning" },
  { id: "capacitacion", nombre: "Capacitación", grupo: "auxiliar", icon: GraduationCap, dotClass: "bg-info" },
  { id: "descanso", nombre: "Descanso", grupo: "auxiliar", icon: Coffee, dotClass: "bg-secondary" },
];

// --- Agentes disponibles para chat interno (modal "Nuevo chat interno") ---
// Reusa los ids de chatsInternosMock cuando coinciden con alguien que ya
// tiene un chat abierto (ci-1, ci-2) — así elegirlo acá reabre esa misma
// ventana en vez de crear una duplicada. estadoId referencia
// estadosAgenteDisponibles. No incluye a la agente logueada (Marina Acosta):
// no tiene sentido chatear con una misma.
export type AgenteInterno = { id: string; nombre: string; estadoId: string };

export const agentesInternosMock: AgenteInterno[] = [
  { id: "ci-1", nombre: "Rocío Benítez — Supervisora", estadoId: "disponible" },
  { id: "ci-2", nombre: "Julián Ferreyra", estadoId: "almuerzo" },
  { id: "ag-camila", nombre: "Camila Torres", estadoId: "disponible" },
  { id: "ag-bruno", nombre: "Bruno Ledesma", estadoId: "no-disponible" },
  { id: "ag-agustina", nombre: "Agustina Molina", estadoId: "capacitacion" },
  { id: "ag-ezequiel", nombre: "Ezequiel Suárez", estadoId: "ausente" },
];

export const estadoAgenteMock = {
  nombre: "Marina Acosta",
  cronometro: "04:12",
};

export function formatEspera(seg: number) {
  const m = Math.floor(seg / 60);
  const s = seg % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
