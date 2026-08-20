// Datos de ejemplo para el wireframe conceptual del pad omnicanal (ver
// relevamiento/pad-competencia/brief-mock-pad.md). Separado a propósito de
// mock-pad.ts: ese archivo alimenta el pad REAL de Hermes (llamada, con su
// propia máquina de estados); esto es una exploración de layout para discutir
// el lunes, no un reemplazo. No compartir tipos entre los dos.

import type { LucideIcon } from "lucide-react";
import {
  Phone,
  MessageSquareText,
  Smartphone,
  Mail,
  CircleCheck,
  CircleSlash,
  PowerOff,
  Utensils,
  GraduationCap,
  Coffee,
} from "lucide-react";

// "chat" se retiró como canal — a pedido, esta fase del mock es solo
// llamada (ver conversation-panel.tsx, center-column.tsx, call-controls.tsx
// y pad-mock-shell.tsx, todos simplificados a variant única). whatsapp/mail/
// sms quedan porque no son "chat" propiamente — son otros canales que
// todavía aparecen en historial y en el armado de campañas salientes,
// aunque esta fase no tenga una pantalla de interacción activa para ellos.
export type CanalMock = "llamada" | "whatsapp" | "mail" | "sms";

export const CANAL_ICON: Record<CanalMock, LucideIcon> = {
  llamada: Phone,
  whatsapp: Smartphone,
  mail: Mail,
  sms: MessageSquareText,
};

export const CANAL_LABEL: Record<CanalMock, string> = {
  llamada: "Llamada",
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

// Solo cuentas de canal "llamada" — a pedido, esta fase no tiene pantalla
// de interacción para otros canales, así que no se ofrecen como opción acá
// (evita un alta que no tendría dónde mostrarse). camp-4 (Soporte técnico)
// solo tenía cuenta de WhatsApp, así que sale de este listado — sigue
// existiendo en campaniasAgenteMock ("Mi turno"), que es otro dataset.
export const campaniasSalientesMock: CampaniaSaliente[] = [
  {
    id: "camp-1",
    nombre: "Cobranzas Activa PCP",
    cuentas: [
      { id: "acc-1", nombre: "Línea Cobranzas AR", canal: "llamada", identificador: "+54 11 4000-1000" },
    ],
  },
  {
    id: "camp-6",
    nombre: "Lanzamiento Tarjeta Plus",
    cuentas: [
      { id: "acc-3", nombre: "Línea Ventas", canal: "llamada", identificador: "+54 11 4900-3000" },
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

// 8 campañas de ejemplo (a pedido, para ver cómo queda el grid de la
// sección "Campañas" de InicioPanel con más de 3 asignadas).
export const campaniasAgenteMock: CampaniaAgente[] = [
  { id: "camp-1", nombre: "Cobranzas Activa PCP", canales: ["llamada", "whatsapp"], horario: "09:00 – 18:00" },
  { id: "camp-4", nombre: "Soporte técnico Nivel 1", canales: ["whatsapp"], horario: "09:00 – 18:00" },
  { id: "camp-6", nombre: "Lanzamiento Tarjeta Plus", canales: ["llamada", "sms"], horario: "13:00 – 18:00" },
  { id: "camp-7", nombre: "Renovación de Seguros", canales: ["llamada"], horario: "09:00 – 17:00" },
  { id: "camp-8", nombre: "Encuesta de Satisfacción", canales: ["sms", "whatsapp"], horario: "10:00 – 16:00" },
  { id: "camp-9", nombre: "Recupero Mora Temprana", canales: ["llamada", "whatsapp"], horario: "09:00 – 18:00" },
  { id: "camp-10", nombre: "Onboarding Cuenta Sueldo", canales: ["mail", "whatsapp"], horario: "09:00 – 18:00" },
  { id: "camp-11", nombre: "Venta Cruzada Tarjetas", canales: ["llamada"], horario: "11:00 – 19:00" },
];

// A pedido, la cola YA NO arranca precargada: nace vacía en
// pad-mock-shell.tsx y se llena con lo que el agente contacta desde el "+"
// o desde InicioPanel (ver iniciarInteraccion ahí). Ya no hace
// falta el ida-y-vuelta "datasetId" que distinguía escenario A (llamada) de
// B (chat) — sacado el chat, todo mapea al único cliente/guion que queda
// (clienteMock, tipificaciones), así que se sacó la indirección.
export type FilaCola = {
  id: string;
  numeroCliente: string;
  canal: CanalMock;
  esperaSeg: number;
};

// --- Cliente activo (reclamo por facturación) ------------------------------
// A pedido, se sacaron mail/segmento/antigüedad, y ahora también N° cliente
// y nombre de lo que se MUESTRA en la sección Cliente del contexto (queda
// solo teléfono y campaña) — numeroCliente se mantiene en el dato porque
// pad-mock-shell.tsx lo sigue usando como clave para buscar el historial de
// contacto en historialPorCliente.
export const clienteMock = {
  numeroCliente: "3345789",
  telefono: "+54 11 4589-2231",
  campania: "Cobranzas Activa PCP",
};

// Controles de llamada — Marcar (bookmarks de calidad).
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
  // tipificación en el catálogo vigente (tipificaciones): un contacto
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
};

// --- Tipificación -----------------------------------------------------------
// "descripcion" alimenta el ícono "i" de ayuda de cada opción (hover). Ya no
// tiene "sugerida" — a pedido, se sacó la tipificación sugerida por el
// copiloto del selector.
export type Tipificacion = { id: string; nombre: string; descripcion: string };

// Renombrada de tipificacionesA (ya no hace falta el sufijo — al sacar el
// escenario B de chat, solo queda este único catálogo).
export const tipificaciones: Tipificacion[] = [
  {
    id: "t-1",
    nombre: "Reclamo resuelto",
    descripcion: "El reclamo se resolvió en esta misma gestión, sin necesidad de derivar ni hacer seguimiento.",
  },
  {
    id: "t-2",
    nombre: "Cargo a revisar por Facturación",
    descripcion: "El cliente reclama un cargo que no reconoce y que hay que validar contra el plan contratado.",
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

// --- Páginas externas ---------------------------------------------------
// "url" apunta a /sistema-externo (mock de un sistema de terceros — ver
// sistema-externo-data.ts): en modo "embebido" ("frame", entra en un
// <iframe>) y en modo "pestana" ("blank", se abre con target=_blank) — a
// pedido, ambos casos necesitan un destino real para poder mockear cómo
// funcionaría, no solo un cartel de "acá iría contenido". Ya no tiene
// "icon" propio — a pedido, todos estos botones (acá y en accesosRapidos)
// comparten un mismo ícono genérico por ahora, no es configurable por
// ítem todavía (ver ICONO_ACCESO_RAPIDO en left-nav.tsx/center-column.tsx).
export type PaginaExterna = {
  id: string;
  nombre: string;
  modo: "embebido" | "pestana";
  url: string;
};

export const paginasExternas: PaginaExterna[] = [
  { id: "ext-tickets", nombre: "Sistema de tickets", modo: "embebido", url: "/sistema-externo?id=ext-tickets" },
  { id: "ext-crm", nombre: "CRM comercial", modo: "embebido", url: "/sistema-externo?id=ext-crm" },
  { id: "ext-facturacion", nombre: "Portal de facturación", modo: "pestana", url: "/sistema-externo?id=ext-facturacion" },
  { id: "ext-buro", nombre: "Buró de crédito", modo: "pestana", url: "/sistema-externo?id=ext-buro" },
  { id: "ext-scoring", nombre: "Scoring de riesgo", modo: "embebido", url: "/sistema-externo?id=ext-scoring" },
  { id: "ext-legales", nombre: "Portal de Legales", modo: "pestana", url: "/sistema-externo?id=ext-legales" },
  { id: "ext-refinanciacion", nombre: "Simulador de refinanciación", modo: "embebido", url: "/sistema-externo?id=ext-refinanciacion" },
];

// --- Accesos rápidos (menú izquierdo, arriba de Mi turno) ------------------
// "Shortcut buttons": no pertenecen a ninguna interacción puntual — el
// agente los usa igual esté en cola vacía o en medio de una llamada. Mismo
// tipo y mismo componente de contenido que las páginas externas (embebido o
// pestaña aparte); a diferencia de esas, se abren sobre toda la pantalla del
// pad (menos el menú y el navbar), no en una solapa.
export const accesosRapidosMock: PaginaExterna[] = [
  { id: "ar-manual", nombre: "Manual del agente", modo: "embebido", url: "/sistema-externo?id=ar-manual" },
  { id: "ar-calculadora", nombre: "Calculadora de cuotas", modo: "embebido", url: "/sistema-externo?id=ar-calculadora" },
  { id: "ar-rrhh", nombre: "Portal de RRHH", modo: "pestana", url: "/sistema-externo?id=ar-rrhh" },
  { id: "ar-conocimiento", nombre: "Base de conocimientos", modo: "embebido", url: "/sistema-externo?id=ar-conocimiento" },
  { id: "ar-directorio", nombre: "Directorio interno", modo: "pestana", url: "/sistema-externo?id=ar-directorio" },
  { id: "ar-beneficios", nombre: "Portal de beneficios", modo: "pestana", url: "/sistema-externo?id=ar-beneficios" },
  { id: "ar-mesaayuda", nombre: "Mesa de ayuda IT", modo: "embebido", url: "/sistema-externo?id=ar-mesaayuda" },
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
  { id: "ha-3", fecha: "18/08/2026", hora: "13:18", canal: "whatsapp", numeroCliente: "5512980", duracion: "4:02", tipificacion: "Deriva a Logística" },
  { id: "ha-4", fecha: "18/08/2026", hora: "12:59", canal: "mail", numeroCliente: "6603317", nombreCliente: "Diego Peralta", duracion: "—", tipificacion: "Sin resolución" },
  { id: "ha-5", fecha: "18/08/2026", hora: "12:41", canal: "llamada", numeroCliente: "3345789", nombreCliente: "Valentina Ibarra", duracion: "5:56", tipificacion: "Cargo a revisar por Facturación" },
  { id: "ha-6", fecha: "18/08/2026", hora: "12:20", canal: "llamada", numeroCliente: "7729015", duracion: "1:01", tipificacion: "Cliente solicita rellamado" },
];

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

export const estadoAgenteMock = {
  nombre: "Marina Acosta",
  cronometro: "04:12",
};

export function formatEspera(seg: number) {
  const m = Math.floor(seg / 60);
  const s = seg % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
