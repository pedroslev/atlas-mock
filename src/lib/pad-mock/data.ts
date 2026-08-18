// Datos de ejemplo para el wireframe conceptual del pad omnicanal (ver
// relevamiento/pad-competencia/brief-mock-pad.md). Separado a propósito de
// mock-pad.ts: ese archivo alimenta el pad REAL de Hermes (llamada, con su
// propia máquina de estados); esto es una exploración de layout para discutir
// el lunes, no un reemplazo. No compartir tipos entre los dos.

import type { LucideIcon } from "lucide-react";
import { Phone, MessageCircle, Smartphone, Mail } from "lucide-react";

export type CanalMock = "llamada" | "chat" | "whatsapp" | "mail";

export const CANAL_ICON: Record<CanalMock, LucideIcon> = {
  llamada: Phone,
  chat: MessageCircle,
  whatsapp: Smartphone,
  mail: Mail,
};

export const CANAL_LABEL: Record<CanalMock, string> = {
  llamada: "Llamada",
  chat: "Chat",
  whatsapp: "WhatsApp",
  mail: "Mail",
};

// --- Cola de interacciones -------------------------------------------------
export type FilaCola = {
  id: string;
  numeroCliente: string;
  canal: CanalMock;
  esperaSeg: number;
  activa?: boolean;
};

export const colaMock: FilaCola[] = [
  { id: "q-1", numeroCliente: "3345789", canal: "llamada", esperaSeg: 14, activa: true },
  { id: "q-2", numeroCliente: "8871023", canal: "whatsapp", esperaSeg: 42 },
  { id: "q-3", numeroCliente: "5512980", canal: "chat", esperaSeg: 71 },
  { id: "q-4", numeroCliente: "6603317", canal: "mail", esperaSeg: 205 },
  { id: "q-5", numeroCliente: "4498812", canal: "llamada", esperaSeg: 8 },
  { id: "q-6", numeroCliente: "7729015", canal: "whatsapp", esperaSeg: 133 },
];

// La misma cola con el segundo ítem (chat) como activo, para el estado B.
export const colaMockChatActivo: FilaCola[] = colaMock.map((f) => ({
  ...f,
  activa: f.id === "q-3",
}));

// --- Escenario A: llamada activa (reclamo por facturación) ----------------
export const clienteA = {
  numeroCliente: "3345789",
  nombre: "Valentina Ibarra",
  telefono: "+54 11 4589-2231",
  mail: "valentina.ibarra@correo.com",
  segmento: "Estándar",
  antiguedad: "2 años y 3 meses",
};

export type TurnoLlamada = { turno: "cliente" | "agente"; texto: string };

export const transcripcionLlamada: TurnoLlamada[] = [
  { turno: "agente", texto: "Buenas tardes, habla con Atención al Cliente, mi nombre es Marina. ¿En qué puedo ayudarla?" },
  { turno: "cliente", texto: "Hola, buenas. Te llamo porque en la factura de este mes me cobraron un cargo que no reconozco, de casi ocho mil pesos." },
  { turno: "agente", texto: "Entiendo, disculpe las molestias. ¿Me confirma el número de cliente para revisar la cuenta?" },
  { turno: "cliente", texto: "Sí, es el 3345789." },
  { turno: "agente", texto: "Perfecto, deme un segundo que lo reviso..." },
  { turno: "cliente", texto: "Es la segunda vez que me pasa esto. La verdad que ya me cansé de tener que llamar." },
];

export const copilotoLlamada = {
  texto: "El cargo \"Servicio adicional Premium\" del 12/08 no figura en el plan contratado por la clienta.",
  accion: "Marcar como revisado",
};

// --- Escenario B: chat (consulta por envío) --------------------------------
export const clienteB = {
  numeroCliente: "5512980",
  nombre: "Nicolás Aguirre",
  telefono: "+54 11 4021-9987",
  mail: "nicolas.aguirre@correo.com",
  segmento: "Preferencial",
  antiguedad: "4 años y 8 meses",
};

export type MensajeChat = { autor: "cliente" | "agente"; texto: string; hora: string };

export const mensajesChat: MensajeChat[] = [
  { autor: "cliente", texto: "Hola, buenas tardes 👋 Quería consultar por el envío de mi pedido, todavía no me llegó.", hora: "14:02" },
  { autor: "agente", texto: "¡Hola Nicolás! Ya te ayudo. ¿Me pasás el número de pedido, por favor?", hora: "14:02" },
  { autor: "cliente", texto: "Sí, es el #48213.", hora: "14:03" },
  { autor: "agente", texto: "Genial, dejame revisarlo un segundo...", hora: "14:03" },
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

export const canalesSalida = ["WhatsApp", "Email", "SMS"] as const;

// --- Historial (compartido, se filtra por cliente activo) -------------------
export type HistorialEntrada = {
  id: string;
  fecha: string;
  canal: CanalMock;
  estado: "Resuelto" | "Derivado a nivel 2" | "Sin resolución";
  resumen: string;
};

export const historialPorCliente: Record<string, HistorialEntrada[]> = {
  "3345789": [
    { id: "h-a1", fecha: "22/07/2026", canal: "llamada", estado: "Resuelto", resumen: "Consulta por vencimiento de factura." },
    { id: "h-a2", fecha: "03/06/2026", canal: "mail", estado: "Sin resolución", resumen: "Reclamo por cargo duplicado — sin respuesta del cliente." },
    { id: "h-a3", fecha: "19/04/2026", canal: "llamada", estado: "Derivado a nivel 2", resumen: "Solicitud de baja de servicio adicional." },
  ],
  "5512980": [
    { id: "h-b1", fecha: "30/07/2026", canal: "whatsapp", estado: "Resuelto", resumen: "Consulta por cambio de dirección de envío." },
    { id: "h-b2", fecha: "11/05/2026", canal: "chat", estado: "Resuelto", resumen: "Consulta por medios de pago disponibles." },
  ],
};

// --- Tipificación -----------------------------------------------------------
export type Tipificacion = { id: string; nombre: string; sugerida?: boolean };

export const tipificacionesA: Tipificacion[] = [
  { id: "t-1", nombre: "Reclamo resuelto" },
  { id: "t-2", nombre: "Cargo a revisar por Facturación", sugerida: true },
  { id: "t-3", nombre: "Cliente solicita rellamado" },
  { id: "t-4", nombre: "Sin resolución" },
];

export const tipificacionesB: Tipificacion[] = [
  { id: "t-5", nombre: "Consulta resuelta", sugerida: true },
  { id: "t-6", nombre: "Deriva a Logística" },
  { id: "t-7", nombre: "Cliente solicita reenvío" },
];

// --- Páginas externas ---------------------------------------------------
export type PaginaExterna = {
  id: string;
  nombre: string;
  modo: "embebido" | "pestana";
  contenido?: string;
};

export const paginasExternas: PaginaExterna[] = [
  {
    id: "ext-tickets",
    nombre: "Sistema de tickets",
    modo: "embebido",
    contenido: "Ticket #48213 — Envío demorado — Prioridad media — Asignado a Logística Nivel 1",
  },
  {
    id: "ext-crm",
    nombre: "CRM comercial",
    modo: "embebido",
    contenido: "Ficha comercial del cliente — plan contratado, historial de compras, oportunidades abiertas",
  },
  {
    id: "ext-facturacion",
    nombre: "Portal de facturación",
    modo: "pestana",
  },
];

// --- Estado del agente (barra superior) ------------------------------------
export const estadoAgenteMock = {
  nombre: "Marina Acosta",
  estado: "Disponible",
  cronometro: "04:12",
};
