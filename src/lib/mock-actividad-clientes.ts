// Actividad del cliente (ATLAS-1186, propuesta 2026-11-16, a validar con
// Pedro): datos que Atlas calcula solo a partir de las interacciones del
// cliente, en todas las campañas, sin que nadie los cargue. Reemplazan, para
// filtrar en Clientes, a los campos del cliente que el segmentador del legacy
// tiene en la tarea (último contacto, última tipificación y su tipo, último
// agente). Lo que es del cliente DENTRO de una campaña (estado, próximo
// intento, intentos, prioridad, agente asignado) no va acá.
//
// MOCK: valores fijos de ejemplo. Cómo y cuándo se calculan, Pedro.

import { agentes, clasificaciones } from "@/lib/mock-data";

type Actividad = {
  /** AAAA-MM-DD */
  ultimoContacto?: string;
  ultimaClasificacionId?: string;
  ultimoAgenteId?: string;
  /** Interacciones (llamadas y mensajes) de los últimos 30 días. */
  contactos30d: number;
};

const actividad: Record<string, Actividad> = {
  "cli-1": { ultimoContacto: "2026-11-14", ultimaClasificacionId: "clas-c-pago", ultimoAgenteId: "ag-1", contactos30d: 4 },
  "cli-2": { ultimoContacto: "2026-11-12", ultimaClasificacionId: "sys-no-contesta", contactos30d: 9 },
  "cli-3": { ultimoContacto: "2026-11-03", ultimaClasificacionId: "clas-c-nopago", ultimoAgenteId: "ag-2", contactos30d: 3 },
  "cli-4": { ultimoContacto: "2026-11-15", ultimaClasificacionId: "sys-ocupado", contactos30d: 12 },
  "cli-5": { ultimoContacto: "2026-10-21", ultimaClasificacionId: "clas-a-resuelto", ultimoAgenteId: "ag-3", contactos30d: 1 },
  "cli-6": { ultimoContacto: "2026-11-10", ultimaClasificacionId: "clas-c-rechazo", ultimoAgenteId: "ag-5", contactos30d: 5 },
  "cli-7": { ultimoContacto: "2026-09-30", ultimaClasificacionId: "sys-apagado", contactos30d: 0 },
  "cli-8": { ultimoContacto: "2026-11-16", ultimaClasificacionId: "clas-c-nopago", ultimoAgenteId: "ag-1", contactos30d: 7 },
  "cli-9": { ultimoContacto: "2026-11-08", ultimaClasificacionId: "clas-a-resuelto", ultimoAgenteId: "ag-2", contactos30d: 2 },
  // cli-10: nunca se lo contactó.
};

const vacia: Actividad = { contactos30d: 0 };

export function actividadDe(clienteId: string): Actividad {
  return actividad[clienteId] ?? vacia;
}

export function ultimaClasificacion(clienteId: string) {
  const id = actividadDe(clienteId).ultimaClasificacionId;
  return id ? clasificaciones.find((c) => c.id === id) : undefined;
}

export function ultimoAgente(clienteId: string) {
  const id = actividadDe(clienteId).ultimoAgenteId;
  return id ? agentes.find((a) => a.id === id) : undefined;
}

/** Campos de actividad: mismo id en la tabla, los filtros y la consulta. */
export const CAMPOS_ACTIVIDAD = [
  {
    id: "act-ultimo-contacto",
    nombre: "Último contacto",
    tipo: "fecha" as const,
    valor: (clienteId: string) => actividadDe(clienteId).ultimoContacto,
    // Nunca contactado cuenta como "hace más de N días" (Tomás, 2026-11-17).
    sinDatoEsAntiguo: true,
  },
  {
    id: "act-ultima-clasificacion",
    nombre: "Última clasificación",
    tipo: "lista" as const,
    valor: (clienteId: string) => ultimaClasificacion(clienteId)?.nombre,
  },
  {
    id: "act-tipo-clasificacion",
    nombre: "Tipo de la última clasificación",
    tipo: "lista" as const,
    valor: (clienteId: string) => ultimaClasificacion(clienteId)?.tipo,
  },
  {
    id: "act-ultimo-agente",
    nombre: "Último agente",
    tipo: "lista" as const,
    valor: (clienteId: string) => ultimoAgente(clienteId)?.nombre,
  },
  {
    id: "act-contactos-30d",
    nombre: "Contactos en los últimos 30 días",
    tipo: "numero" as const,
    valor: (clienteId: string) => String(actividadDe(clienteId).contactos30d),
  },
];
