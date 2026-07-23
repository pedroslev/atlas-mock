// Datos mock del Pad de agente de Atlas (Hermes) — tenant único "Banco Sur".
// El agente logueado es "Marina Acosta" (ag-1), que coincide con el avatar "MA"
// del backoffice. Nada de esto pega a una API real: solo alimenta el mock
// navegable. Los estados siguen la semántica de ADR-BD-004 (estados elegibles
// del agente vs. estados forzados por la llamada) y el ciclo de vida de la
// interacción. Importa (solo lectura) de mock-data.ts, nunca lo edita.

import type { LucideIcon } from "lucide-react";
import {
  PhoneIncoming,
  PhoneOutgoing,
  CircleCheck,
  CircleSlash,
  PowerOff,
  Loader,
  PhoneCall,
  ClipboardCheck,
} from "lucide-react";

// El agente logueado en el pad. id "ag-1" = Marina Acosta en mock-data.ts.
export const AGENTE_PAD_ID = "ag-1";
export const agentePad = {
  id: AGENTE_PAD_ID,
  nombre: "Marina Acosta",
  iniciales: "MA",
  email: "marina.acosta@bancosur.com",
} as const;

// --- Estados de agente (ADR-BD-004) ---------------------------------------
// "Elegibles" los elige el agente; los AUX son un subtipo elegible (referencian
// un estado auxiliar del tenant por id). "Forzados" los impone la llamada y el
// agente no puede elegirlos: el selector se bloquea y los muestra read-only.
export type AgentStatus =
  | { kind: "available" }
  | { kind: "not-available" }
  | { kind: "unstaffed" }
  | { kind: "aux"; auxId: string }
  | { kind: "connecting" }
  | { kind: "connected" }
  | { kind: "acw" };

export const ELEGIBLES_PRINCIPALES = [
  "available",
  "not-available",
  "unstaffed",
] as const;
export type EstadoPrincipal = (typeof ELEGIBLES_PRINCIPALES)[number];

export function isForzado(s: AgentStatus): boolean {
  return s.kind === "connecting" || s.kind === "connected" || s.kind === "acw";
}

// Presentación de los estados NO-aux (los AUX toman nombre/color/icono del dato
// del tenant vía getAuxIcon + color inline). "tone" mapea a variantes de Badge
// (tokens), nunca a hex. "dot" es una clase de color de token para el punto.
export type BadgeTone =
  | "success"
  | "warning"
  | "info"
  | "neutral"
  | "secondary"
  | "default"
  | "destructive";

// `labelKey` es una CLAVE de traducción (i18n), no un texto: el rótulo se
// resuelve con `t()` en el punto de render (status-display, agent-status-selector).
export type StatusMeta = {
  labelKey: string;
  tone: BadgeTone;
  dot: string; // clase bg-* de token
  icon: LucideIcon;
};

export const STATUS_META: Record<
  "available" | "not-available" | "unstaffed" | "connecting" | "connected" | "acw",
  StatusMeta
> = {
  available: { labelKey: "pad.estado.disponible", tone: "success", dot: "bg-success", icon: CircleCheck },
  "not-available": { labelKey: "pad.estado.noDisponible", tone: "destructive", dot: "bg-destructive", icon: CircleSlash },
  unstaffed: { labelKey: "pad.estado.ausente", tone: "neutral", dot: "bg-muted-foreground", icon: PowerOff },
  connecting: { labelKey: "pad.estado.conectando", tone: "info", dot: "bg-info", icon: Loader },
  connected: { labelKey: "pad.estado.enLlamada", tone: "default", dot: "bg-primary", icon: PhoneCall },
  acw: { labelKey: "pad.estado.trabajoPosLlamada", tone: "secondary", dot: "bg-secondary", icon: ClipboardCheck },
};

// --- Estados de interacción (ADR-BD-004) ----------------------------------
// Fase de la interacción activa del pad. "incoming" agrupa Queued/Ringing/
// Dialing (el agente ve "Conectando"); "onagent" = OnAgent; "hold" = Hold;
// "acw" = Finished + el agente en After-Call Work. Los `labelKey` apuntan a la
// TRADUCCIÓN UX del estado lógico de la DB (OnAgent → "En vivo", etc.): el
// valor lógico se conserva en el `phase`, pero nunca se muestra crudo.
export type CallPhase = "incoming" | "onagent" | "hold" | "acw";
export type CallDirection = "inbound" | "outbound";

export type ActiveInteraction = {
  id: string;
  direction: CallDirection;
  numero: string;
  nombre?: string;
  campaniaId: string;
  phase: CallPhase;
  muted: boolean;
};

// --- Bookmarks / pins de calidad ------------------------------------------
// Un pin que el agente clava DURANTE la llamada ("acá pasó algo") para que un
// agente de calidad lo revise después. `atSec` es el segundo transcurrido de la
// llamada en que se puso (no un Date.now(): se apoya en el cronómetro de la
// llamada que ya maneja el estado del pad), lo que permite mostrarlo como
// "02:14 — Cliente VIP".
export type CallPin = {
  id: string;
  atSec: number;
  label: string;
  descripcion?: string;
};

// Marcas de ejemplo EXTRA, solo para el mock del pad. El grupo real de la
// campaña (getMarcadoresDeGrupo) trae pocas; estas se concatenan en la llamada
// para poder ver el overflow/scroll de la lista de marcas disponibles sin
// tocar mock-data.ts. Forma compatible con `Marcador`.
export const marcadoresDemoPad: {
  id: string;
  nombre: string;
  descripcion?: string;
}[] = [
  { id: "mkd-1", nombre: "Promesa de pago", descripcion: "El cliente se comprometió a pagar" },
  { id: "mkd-2", nombre: "Datos a actualizar", descripcion: "Teléfono o email desactualizado" },
  { id: "mkd-3", nombre: "Deriva a supervisor", descripcion: "Escalar el caso" },
  { id: "mkd-4", nombre: "Cliente molesto", descripcion: "Tono de la conversación tenso" },
  { id: "mkd-5", nombre: "Requiere seguimiento", descripcion: "Rellamar en las próximas 48h" },
  { id: "mkd-6", nombre: "Posible fraude", descripcion: "Patrón sospechoso a revisar" },
];

// Pins de ejemplo ya clavados en la interacción semilla, para poder ver el
// comportamiento del bloque "Pins en esta llamada" cuando crece (scroll al 50%
// + buscador). Se limpian al iniciar cualquier llamada nueva.
export const seedPins: CallPin[] = [
  { id: "pin-seed-1", atSec: 12, label: "Cliente VIP" },
  { id: "pin-seed-2", atSec: 47, label: "Reclamo activo" },
  { id: "pin-seed-3", atSec: 83, label: "Promesa de pago" },
  { id: "pin-seed-4", atSec: 126, label: "Datos a actualizar" },
  { id: "pin-seed-5", atSec: 164, label: "Cliente molesto" },
  { id: "pin-seed-6", atSec: 201, label: "Requiere seguimiento" },
  { id: "pin-seed-7", atSec: 238, label: "Cliente VIP" },
  { id: "pin-seed-8", atSec: 292, label: "Posible fraude" },
];

// --- Atajos de teclado del pad --------------------------------------------
// Fuente única de verdad: el listener (pad-console) y los hints de UI
// (tooltips, chips <Kbd>, leyenda) leen de acá para no desincronizarse.
// Todos exigen el modificador Ctrl (o Cmd en Mac): el agente escribe en inputs
// entre llamadas y las letras sueltas eran raras (feedback). El listener hace
// preventDefault para no disparar el default del navegador. Las letras son
// mnemónicas en español/EN y no colisionan entre sí.
export const PAD_SHORTCUTS = {
  answer: "A", // Atender
  hangup: "E", // End / colgar-rechazar-cancelar
  hold: "H", // Hold / espera
  mute: "M", // Mute / silenciar
  status: "S", // cambiar de eStado
} as const;

export type PadShortcut = keyof typeof PAD_SHORTCUTS;

// Descripción de la acción de cada atajo, como CLAVE de traducción. La TECLA no
// se traduce (es la misma en todos los idiomas), pero el texto que la acompaña
// en tooltips/aria-labels sí. Fuente única: los botones de llamada y el selector
// de estado leen de acá para no desincronizarse del listener.
export const PAD_SHORTCUT_LABEL_KEYS: Record<PadShortcut, string> = {
  answer: "pad.llamada.atender",
  hangup: "pad.llamada.colgar",
  hold: "pad.llamada.ponerEnEspera",
  mute: "pad.llamada.silenciar",
  status: "pad.estado.cambiar",
};

// Formatea un atajo para mostrarlo con su modificador: "⌘A" en Mac, "Ctrl A" en
// el resto. `isMac` lo resuelve el cliente (useIsMac) para no romper hidratación.
export function shortcutLabel(key: string, isMac: boolean): string {
  return isMac ? `⌘${key}` : `Ctrl ${key}`;
}

// `labelKey` es una CLAVE de traducción: el texto se resuelve con `t()` donde se
// renderiza (pad-console, active-call-panel).
export const INTERACTION_PHASE_META: Record<
  CallPhase,
  { labelKey: string; tone: BadgeTone }
> = {
  incoming: { labelKey: "pad.fase.conectando", tone: "info" },
  onagent: { labelKey: "pad.fase.enVivo", tone: "success" },
  hold: { labelKey: "pad.fase.enEspera", tone: "warning" },
  acw: { labelKey: "pad.fase.posllamada", tone: "secondary" },
};

// Semilla de una interacción entrante ya derivada al agente (para arrancar el
// pad con algo vivo). El agente arranca en "incoming" (forzado: Connecting).
export const seedInteraction: ActiveInteraction = {
  id: "int-seed",
  direction: "inbound",
  numero: "+54 11 4762-8890",
  nombre: "Ramiro Sosa",
  campaniaId: "camp-1",
  phase: "incoming",
  muted: false,
};

// --- Historial de llamadas del agente -------------------------------------
export type CallHistoryEntry = {
  id: string;
  timestamp: string; // ISO
  direction: CallDirection;
  numero: string;
  nombre?: string;
  campaniaId: string;
  durationSec: number;
  clasificacionId?: string; // referencia a clasificaciones de mock-data
};

// ~8 llamadas recientes de Marina, mezclando entrantes/salientes y campañas
// asignadas (camp-1, camp-3, camp-6). Las clasificaciones referencian el árbol
// de mock-data.ts (clas-c-*).
export const callHistory: CallHistoryEntry[] = [
  {
    id: "h-1",
    timestamp: "2026-07-17T13:52:10",
    direction: "inbound",
    numero: "+54 11 4762-1180",
    nombre: "Elena Rivas",
    campaniaId: "camp-1",
    durationSec: 214,
    clasificacionId: "clas-c-pago",
  },
  {
    id: "h-2",
    timestamp: "2026-07-17T13:35:44",
    direction: "outbound",
    numero: "+54 11 4550-9021",
    campaniaId: "camp-6",
    durationSec: 96,
    clasificacionId: "clas-c-rechazo",
  },
  {
    id: "h-3",
    timestamp: "2026-07-17T13:18:02",
    direction: "inbound",
    numero: "+54 11 4762-3345",
    nombre: "Diego Peralta",
    campaniaId: "camp-3",
    durationSec: 512,
    clasificacionId: "clas-c-pago",
  },
  {
    id: "h-4",
    timestamp: "2026-07-17T12:59:31",
    direction: "outbound",
    numero: "+54 11 4001-7788",
    campaniaId: "camp-1",
    durationSec: 33,
    clasificacionId: "clas-c-nopago",
  },
  {
    id: "h-5",
    timestamp: "2026-07-17T12:41:16",
    direction: "inbound",
    numero: "+54 11 4762-0090",
    nombre: "Carla Méndez",
    campaniaId: "camp-1",
    durationSec: 178,
    clasificacionId: "clas-c-pago",
  },
  {
    id: "h-6",
    timestamp: "2026-07-17T12:20:48",
    direction: "outbound",
    numero: "+54 11 4877-1200",
    campaniaId: "camp-6",
    durationSec: 61,
  },
  {
    id: "h-7",
    timestamp: "2026-07-17T11:58:09",
    direction: "inbound",
    numero: "+54 11 4762-5521",
    nombre: "Hernán Vega",
    campaniaId: "camp-3",
    durationSec: 402,
    clasificacionId: "clas-c-nopago",
  },
  {
    id: "h-8",
    timestamp: "2026-07-17T11:33:25",
    direction: "outbound",
    numero: "+54 11 4550-3390",
    campaniaId: "camp-1",
    durationSec: 145,
    clasificacionId: "clas-c-rechazo",
  },
];

// Flag mock: qué campañas exigen tipificación obligatoria en el ACW (en el DER
// real es un parámetro de la campaign). Cobranzas la exige; el resto opcional.
export const campaniasTipificacionObligatoria = new Set<string>([
  "camp-1",
  "camp-2",
  "camp-3",
]);

export function formatDuration(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export const DIRECTION_ICON: Record<CallDirection, LucideIcon> = {
  inbound: PhoneIncoming,
  outbound: PhoneOutgoing,
};
