// Estrategia de salida de una campaña (propuesta 2026-10-16, relevamiento/
// criterios-recontacto y relevamiento/clientes-y-contactaciones §5). Nada de
// esto está acordado con Pedro: es el mock para discutirlo.
//
// Vive en la campaña (decisión de Tomás, 2026-10-16): los horarios y las
// cuentas salientes ya están ahí. Cada paso elige una de las cuentas
// salientes de la campaña (el canal sale del tipo de cuenta) y, si es de
// llamada, el modo de discado. Los horarios son los de la campaña.
//
// Qué hacer después de cada intento se define por EFECTO de la clasificación
// que quedó (ver Clasificacion["efecto"] en mock-data), no por clasificación
// una por una (las excepciones por clasificación se sacaron el 2026-11-14:
// repetían lo que ya dice el efecto).

import type { Workflow } from "@/lib/mock-data";
import type { Condicion } from "@/lib/filtro-clientes";

// Blaster: el discador llama y, al atender, corre un flujo que termina sin
// agente (reproduce audios, junta datos). Por eso exige un flujo propio.
export type ModoLlamada = "predictiva" | "progresiva" | "preview" | "blaster";

export const MODOS_LLAMADA: ModoLlamada[] = [
  "predictiva",
  "progresiva",
  "preview",
  "blaster",
];

// --- Qué pasa cuando el cliente atiende una llamada saliente ---------------
//
// Propuesta 2026-10-23 (relevamiento/criterios-recontacto, pregunta 9), a
// validar con Pedro: "una llamada, un flujo, elegido por el origen".
//   - Entrante → el flujo de la cuenta (menú, validar, derivar).
//   - Saliente atendida → el flujo de la estrategia de la campaña que la
//     marcó: uno por defecto para la campaña, que cada paso puede pisar.
// Así un mismo número sirve para entrar y salir sin que las salientes caigan
// en el menú de entrada. Los flujos son de una biblioteca del tenant
// (reutilizables) y se editan siempre con el mismo editor.

/** Flujo de la biblioteca del tenant. */
export type Flujo = {
  id: string;
  nombre: string;
  descripcion?: string;
  workflow: Workflow;
};

/** "agente" = sin flujo, entra a esta campaña y lo toma un agente; si no,
 * id de flujo. Se elige en cada paso de llamada: ya no hay un flujo por
 * defecto de la campaña (Tomás, 2026-11-18, a validar con Pedro). */
export type AlAtenderPaso = "agente" | string;

// Grafo mínimo inicio → [audio] → [juntar dato] → [derivar].
function grafo(pasos: Array<"play" | "collect">, derivarA?: string): Workflow {
  const tipos = [...pasos, ...(derivarA ? (["derivacion"] as const) : [])];
  const nodes: Workflow["nodes"] = [
    { id: "inicio", type: "inicio", position: { x: 40, y: 120 } },
    ...tipos.map((type, i) => ({
      id: `n${i + 1}`,
      type,
      position: { x: 300 + i * 260, y: 120 },
      ...(type === "derivacion" ? { campaniaId: derivarA } : {}),
    })),
  ];
  const edges = nodes.slice(1).map((n, i) => ({
    id: `e${i}`,
    source: nodes[i].id,
    target: n.id,
  }));
  return { nodes, edges };
}

export const flujos: Flujo[] = [
  {
    id: "flujo-aviso-deuda",
    nombre: "Aviso de deuda",
    descripcion: "Audio corto avisando el motivo del llamado y derivación a Cobranzas.",
    workflow: grafo(["play"], "camp-1"),
  },
  {
    id: "flujo-ultimo-aviso",
    nombre: "Último aviso de deuda",
    descripcion: "Audio de último aviso, pregunta si puede pagar hoy y deriva a Cobranzas.",
    workflow: grafo(["play", "collect"], "camp-1"),
  },
  {
    id: "flujo-recordatorio-turno",
    nombre: "Recordatorio de turno (blaster)",
    descripcion: "Reproduce el recordatorio y junta la confirmación. Sin agente.",
    workflow: grafo(["play", "collect"]),
  },
];

export type Accion =
  | "reintentar"
  | "siguiente"
  | "otro-medio"
  | "cerrar-contactado"
  | "cerrar-no-contactado";

export type UnidadTiempo = "min" | "h" | "d";

export type Regla = {
  accion: Accion;
  /** Sólo para "reintentar": cada cuánto y hasta cuántas veces. */
  cada?: number;
  unidad?: UnidadTiempo;
  maxIntentos?: number;
};

/** Efectos que disparan una regla ("Sin efecto" no cambia nada). */
export type EfectoAccionable =
  | "Seguir intentando"
  | "Dejar este medio"
  | "Dejar de contactar";

export const EFECTOS_ACCIONABLES: EfectoAccionable[] = [
  "Seguir intentando",
  "Dejar este medio",
  "Dejar de contactar",
];

export type Paso = {
  id: string;
  /** Una de las cuentas salientes de la campaña (campaigns.outbound_account_ids). */
  cuentaId: string;
  /** Sólo cuentas de llamada. */
  modo?: ModoLlamada;
  /** Sólo cuentas de llamada: qué pasa cuando el cliente atiende. */
  alAtender?: AlAtenderPaso;
  /** Sólo canales digitales: qué pasa si el cliente responde el mensaje.
   * "agente" = la conversación entra a esta campaña y la toma un agente; si
   * no, id de un flujo (por ejemplo, un bot que contesta primero). */
  alResponder?: "agente" | string;
  /** Plantilla de mensaje (cuentas de WhatsApp, SMS o email). */
  plantilla?: string;
  /** Cuánto esperar desde que termina el paso anterior (0 = enseguida). */
  arrancaEn: number;
  arrancaUnidad: UnidadTiempo;
  /** Canales digitales: cuánto esperar una respuesta antes de dar el
   * mensaje por "sin respuesta" (efecto Seguir intentando). */
  esperarRespuesta?: number;
  esperarUnidad?: UnidadTiempo;
  reglas: Record<EfectoAccionable, Regla>;
};

export const PLANTILLAS = [
  "Recordatorio de deuda",
  "Último aviso de deuda",
  "Recordatorio de turno",
  "Confirmación de turno",
  "Encuesta de satisfacción",
];

const REGLAS_LLAMADA: Paso["reglas"] = {
  "Seguir intentando": {
    accion: "reintentar",
    cada: 2,
    unidad: "h",
    maxIntentos: 3,
  },
  "Dejar este medio": { accion: "otro-medio" },
  "Dejar de contactar": { accion: "cerrar-contactado" },
};

export function pasoVacio(id: string, cuentaId: string): Paso {
  return {
    id,
    cuentaId,
    arrancaEn: 0,
    arrancaUnidad: "h",
    reglas: { ...REGLAS_LLAMADA },
  };
}

// --- Entrada y salida de la estrategia ------------------------------------
//
// Propuesta 2026-11-13 (ATLAS-1186), a validar con Pedro. La estrategia se lee
// de arriba a abajo: Entrada (quién entra) → pasos → Salida (quién sale antes
// de terminar los pasos). El CRM actualiza datos del cliente; quién entra lo
// decide el filtro de la Entrada. Además de la Entrada automática siempre se
// puede cargar a mano desde Clientes ("Cargar en campaña") o por una lista
// del CRM: esos clientes siguen los mismos pasos.

// Cuándo corre la revisión diaria. Pedro (2026-11-17): no se revisa cada vez
// que cambia un dato; corre una vez por día, al abrir o al cerrar el horario
// de la campaña, o a una hora fija.
export type Revision = "inicioBanda" | "finBanda" | "hora";

export type Entrada = {
  /** Entran solos los clientes que cumplen el filtro. Apagada = entrada
   * manual (Clientes › Cargar en campaña, o lista del CRM). */
  automatica: boolean;
  /** Básico (condiciones) o avanzado (consulta estilo JQL). */
  modoFiltro: "basico" | "avanzado";
  condiciones: Condicion[];
  consulta: string;
  /** En cada revisión también saca a quien dejó de cumplir el filtro (ej.
   * pagó): la salida por dato la hace la misma revisión de la entrada. */
  sacarAlDejarDeCumplir: boolean;
  /** Cada cuánto se revisa quién cumple (cómo se hace por dentro, Pedro). */
  revision: Revision;
  /** "HH:MM", sólo para la revisión a una hora fija. */
  hora: string;
  /** Quien ya pasó por la estrategia y vuelve a cumplir la entrada. */
  reingreso: "nunca" | "despues";
  reingresoDias: number;
};

export type Salida = {
  /** Sale quien cumple estas condiciones; vale también para los que
   * entraron a mano o por una lista del CRM. Se revisa en la misma revisión
   * que la entrada (no es un proceso aparte). */
  extra: boolean;
  modoFiltro: "basico" | "avanzado";
  condicionesExtra: Condicion[];
  consulta: string;
};

export function entradaVacia(): Entrada {
  return {
    automatica: false,
    modoFiltro: "basico",
    condiciones: [],
    consulta: "",
    sacarAlDejarDeCumplir: true,
    revision: "inicioBanda",
    hora: "08:00",
    reingreso: "despues",
    reingresoDias: 7,
  };
}

export function salidaVacia(): Salida {
  return { extra: false, modoFiltro: "basico", condicionesExtra: [], consulta: "" };
}

export const entradaPorCampania: Record<string, Entrada> = {
  // Cobranzas Activa PCP: mora temprana, se revisa al abrir el horario.
  "camp-1": {
    automatica: true,
    modoFiltro: "basico",
    consulta: "",
    sacarAlDejarDeCumplir: true,
    condiciones: [
      { id: "e1-1", campo: "campo-mora", operador: "mayorIgual", valor: "1" },
      { id: "e1-2", campo: "campo-mora", operador: "menorIgual", valor: "30" },
    ],
    revision: "inicioBanda",
    hora: "08:00",
    reingreso: "despues",
    reingresoDias: 7,
  },
  // Cobranzas Mora Tardía: los que tienen la etiqueta MORA +90.
  "camp-2": {
    automatica: true,
    modoFiltro: "basico",
    consulta: "",
    sacarAlDejarDeCumplir: true,
    condiciones: [
      { id: "e2-1", campo: "etiqueta", operador: "tiene", valor: "et-mora90" },
    ],
    revision: "finBanda",
    hora: "08:00",
    reingreso: "nunca",
    reingresoDias: 7,
  },
};

export const salidaPorCampania: Record<string, Salida> = {
  "camp-1": salidaVacia(),
  "camp-2": {
    extra: true,
    modoFiltro: "basico",
    consulta: "",
    condicionesExtra: [
      { id: "s2-1", campo: "etiqueta", operador: "tiene", valor: "et-refi" },
    ],
  },
};

/** Clientes que hoy ya están en curso en cada campaña (para la carga manual). */
export const enCursoPorCampania: Record<string, string[]> = {
  "camp-1": ["cli-1", "cli-3", "cli-5"],
  "camp-2": ["cli-4", "cli-8"],
};

// Estrategia por campaña. Las que no aparecen todavía no tienen pasos.
export const estrategiasPorCampania: Record<string, Paso[]> = {
  // Cobranzas Activa PCP — el ejemplo de clientes-y-contactaciones §5.1.
  "camp-1": [
    {
      id: "c1-1",
      cuentaId: "acc-1",
      modo: "predictiva",
      alAtender: "flujo-aviso-deuda",
      arrancaEn: 0,
      arrancaUnidad: "h",
      reglas: { ...REGLAS_LLAMADA },
    },
    {
      id: "c1-2",
      cuentaId: "acc-2",
      plantilla: "Recordatorio de deuda",
      alResponder: "agente",
      arrancaEn: 1,
      arrancaUnidad: "d",
      esperarRespuesta: 24,
      esperarUnidad: "h",
      reglas: {
        "Seguir intentando": { accion: "siguiente" },
        "Dejar este medio": { accion: "siguiente" },
        "Dejar de contactar": { accion: "cerrar-contactado" },
      },
    },
    {
      id: "c1-3",
      cuentaId: "acc-1",
      modo: "preview",
      // Pisa el flujo de la campaña: en el último intento, otro audio.
      alAtender: "flujo-ultimo-aviso",
      arrancaEn: 2,
      arrancaUnidad: "d",
      reglas: {
        "Seguir intentando": { accion: "cerrar-no-contactado" },
        "Dejar este medio": { accion: "otro-medio" },
        "Dejar de contactar": { accion: "cerrar-contactado" },
      },
    },
  ],
  // Cobranzas Mora Tardía — una sola cuenta de llamada: un paso insistente.
  "camp-2": [
    {
      id: "c2-1",
      cuentaId: "acc-1",
      modo: "progresiva",
      arrancaEn: 0,
      arrancaUnidad: "h",
      reglas: {
        "Seguir intentando": {
          accion: "reintentar",
          cada: 90,
          unidad: "min",
          maxIntentos: 5,
        },
        "Dejar este medio": { accion: "otro-medio" },
        "Dejar de contactar": { accion: "cerrar-contactado" },
      },
    },
  ],
};
