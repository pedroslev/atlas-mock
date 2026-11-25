"use client";

// Asignación masiva desde la tabla de Usuarios (ATLAS-1353).
//
// MOCK: las acciones modifican en memoria los datos de ejemplo (agentes,
// campanias.usuariosAsignados, gruposTrabajo.usuarioIds) y avisan a las
// pantallas abiertas para que se redibujen. No persiste: al recargar vuelve a
// los datos iniciales, y las pantallas que se arman en el servidor (la ficha
// de una campaña) no ven estos cambios.
// REAL: olimpo-front llama a olimpo-api una vez por cada campaña o grupo
// elegido: POST /api/campaigns/{campaign_id}/users/add (o /users/remove) y
// POST /api/working-groups/{group_id}/users/add (o /users/remove), con el
// cuerpo { "user_ids": [...] }. Son idempotentes (agregar un id que ya está o
// quitar uno que no está no cambia nada), validan los ids contra los usuarios
// del tenant (un usuario desconocido responde 400 y no se guarda nada),
// devuelven la entidad actualizada y, si algo cambió, publican el mismo evento
// que el PUT de la entidad. La campaña o el grupo que falla se informa con su
// motivo y se reintenta solo. Habilitar y deshabilitar es una llamada por
// usuario a identity-api: PUT /api/users/{user_id}/enabled.

import { useSyncExternalStore } from "react";
import { agentes, campanias, gruposTrabajo } from "@/lib/mock-data";

let version = 0;
const oyentes = new Set<() => void>();

function avisar() {
  version += 1;
  oyentes.forEach((o) => o());
}

/** Se redibuja cada vez que una acción masiva cambia los datos. */
export function useVersionAsignaciones() {
  return useSyncExternalStore(
    (cb) => {
      oyentes.add(cb);
      return () => oyentes.delete(cb);
    },
    () => version,
    () => 0
  );
}

/** Lo que no se pudo aplicar: una campaña, un grupo o (en habilitar/deshabilitar) un usuario. */
export type Fallido = { id: string; nombre: string; motivo: string };

export type ResultadoMasivo = {
  /** Usuarios a los que se les aplicó algún cambio. */
  aplicados: string[];
  /** Usuarios que ya estaban como se pedía: no cambió nada. */
  sinCambios: string[];
  /** Campañas o grupos (o usuarios, al habilitar/deshabilitar) en los que falló. */
  fallidos: Fallido[];
};

// MOCK: falla a propósito el primer intento de cada acción sobre ciertas
// entidades, para poder ver en el mock la lista de fallidos y "Reintentar los
// que fallaron"; el segundo intento se aplica. En Usuarios fallan la campaña
// "Cobranzas Mora Tardía" (camp-2) y el grupo de trabajo "Ventas" (wg-ventas);
// al habilitar o deshabilitar, la usuaria Florencia Godoy (ag-17). Los
// catálogos usan la misma función (ver asignar-a-grupos.tsx).
// REAL: los fallos los informa el servicio (por ejemplo, un corte de conexión
// a mitad de la operación); no hay nada que falle a propósito.
const yaFallo = new Set<string>();

/** true solo la primera vez que se pide para esta acción y este id, si está entre los que fallan. */
export function fallaLaPrimeraVez(accion: string, id: string, queFallan: readonly string[]): boolean {
  if (!queFallan.includes(id)) return false;
  const clave = `${accion}:${id}`;
  if (yaFallo.has(clave)) return false;
  yaFallo.add(clave);
  return true;
}

const ENTIDADES_QUE_FALLAN = ["camp-2", "wg-ventas"] as const;
const USUARIOS_QUE_FALLAN = ["ag-17"] as const;

// MOCK: el motivo es una clave del diccionario, que la ventana de resultado
// traduce. REAL: el front traduce el error que devuelve el servicio.
export const MOTIVO_FALLO = "asignacion.motivoFallo";

/** Suma el resultado de un reintento al anterior: los fallidos que quedan son los del reintento. */
export function sumarResultados(antes: ResultadoMasivo, ahora: ResultadoMasivo): ResultadoMasivo {
  const aplicados = [...new Set([...antes.aplicados, ...ahora.aplicados])];
  return {
    aplicados,
    sinCambios: [...new Set([...antes.sinCambios, ...ahora.sinCambios])].filter(
      (u) => !aplicados.includes(u)
    ),
    fallidos: ahora.fallidos,
  };
}

// --- Campañas y grupos de trabajo: una operación por entidad ---------------

/** Una campaña o un grupo, con a quién se le agrega y a quién se le quita. */
type Operacion = {
  id: string;
  nombre: string;
  /** La lista real de miembros de la entidad (se modifica en el lugar). */
  miembros: string[];
  agregar: string[];
  quitar: string[];
};

type Entidad = Pick<Operacion, "id" | "nombre" | "miembros">;

const enCampanias = (ids: string[]): Entidad[] =>
  campanias
    .filter((c) => ids.includes(c.id))
    .map((c) => ({ id: c.id, nombre: c.nombre, miembros: c.usuariosAsignados }));

const enGrupos = (ids: string[]): Entidad[] =>
  gruposTrabajo
    .filter((g) => ids.includes(g.id))
    .map((g) => ({ id: g.id, nombre: g.nombre, miembros: g.usuarioIds }));

/**
 * Aplica cada operación por separado (como olimpo-api: un pedido por campaña
 * o grupo). Un usuario queda "aplicado" si cambió en alguna entidad que se
 * guardó; "sin cambios" si no tenía nada que cambiar en ninguna, ni siquiera
 * en las que fallaron (esos quedan pendientes del reintento).
 */
function ejecutarPorEntidad(accion: string, ops: Operacion[], usuarioIds: string[]): ResultadoMasivo {
  const aplicados = new Set<string>();
  const pendientes = new Set<string>();
  const fallidos: Fallido[] = [];
  for (const op of ops) {
    const entran = op.agregar.filter((u) => !op.miembros.includes(u));
    const salen = op.quitar.filter((u) => op.miembros.includes(u));
    if (fallaLaPrimeraVez(accion, op.id, ENTIDADES_QUE_FALLAN)) {
      fallidos.push({ id: op.id, nombre: op.nombre, motivo: MOTIVO_FALLO });
      [...entran, ...salen].forEach((u) => pendientes.add(u));
      continue;
    }
    op.miembros.push(...entran);
    for (const u of salen) op.miembros.splice(op.miembros.indexOf(u), 1);
    [...entran, ...salen].forEach((u) => aplicados.add(u));
  }
  avisar();
  return {
    aplicados: [...aplicados],
    sinCambios: usuarioIds.filter((u) => !aplicados.has(u) && !pendientes.has(u)),
    fallidos,
  };
}

const agregarATodas = (entidades: Entidad[], usuarioIds: string[]) =>
  entidades.map((e) => ({ ...e, agregar: usuarioIds, quitar: [] }));
const quitarDeTodas = (entidades: Entidad[], usuarioIds: string[]) =>
  entidades.map((e) => ({ ...e, agregar: [], quitar: usuarioIds }));

export const agregarACampanias = (usuarioIds: string[], campaniaIds: string[]) =>
  ejecutarPorEntidad("camp+", agregarATodas(enCampanias(campaniaIds), usuarioIds), usuarioIds);

export const quitarDeCampanias = (usuarioIds: string[], campaniaIds: string[]) =>
  ejecutarPorEntidad("camp-", quitarDeTodas(enCampanias(campaniaIds), usuarioIds), usuarioIds);

export const agregarAGrupos = (usuarioIds: string[], grupoIds: string[]) =>
  ejecutarPorEntidad("grp+", agregarATodas(enGrupos(grupoIds), usuarioIds), usuarioIds);

export const quitarDeGrupos = (usuarioIds: string[], grupoIds: string[]) =>
  ejecutarPorEntidad("grp-", quitarDeTodas(enGrupos(grupoIds), usuarioIds), usuarioIds);

// --- Estado: una operación por usuario ------------------------------------

export function cambiarEstado(usuarioIds: string[], habilitado: boolean): ResultadoMasivo {
  const r: ResultadoMasivo = { aplicados: [], sinCambios: [], fallidos: [] };
  for (const id of usuarioIds) {
    const a = agentes.find((a) => a.id === id);
    if (fallaLaPrimeraVez(`estado:${habilitado}`, id, USUARIOS_QUE_FALLAN)) {
      r.fallidos.push({ id, nombre: a?.nombre ?? id, motivo: MOTIVO_FALLO });
      continue;
    }
    if (!a || a.habilitado === habilitado) {
      r.sinCambios.push(id);
      continue;
    }
    a.habilitado = habilitado;
    r.aplicados.push(id);
  }
  avisar();
  return r;
}

// --- Copiar asignaciones de otro usuario ---------------------------------

export type QueCopiar = { campanias: boolean; grupos: boolean };
/** "sumar": conserva lo que ya tenían. "igualar": además quita lo que el origen no tiene. */
export type ModoCopia = "sumar" | "igualar";

/** Qué se le agrega y qué se le quita a cada usuario de destino. */
export type CambioCopia = {
  usuarioId: string;
  campaniasAgregar: string[];
  campaniasQuitar: string[];
  gruposAgregar: string[];
  gruposQuitar: string[];
};

export function calcularCopia(
  origenId: string,
  destinoIds: string[],
  que: QueCopiar,
  modo: ModoCopia
): CambioCopia[] {
  const campOrigen = campanias.filter((c) => c.usuariosAsignados.includes(origenId)).map((c) => c.id);
  const grpOrigen = gruposTrabajo.filter((g) => g.usuarioIds.includes(origenId)).map((g) => g.id);

  return destinoIds
    .filter((d) => d !== origenId)
    .map((d) => {
      const campD = campanias.filter((c) => c.usuariosAsignados.includes(d)).map((c) => c.id);
      const grpD = gruposTrabajo.filter((g) => g.usuarioIds.includes(d)).map((g) => g.id);
      const dif = (a: string[], b: string[]) => a.filter((x) => !b.includes(x));
      return {
        usuarioId: d,
        campaniasAgregar: que.campanias ? dif(campOrigen, campD) : [],
        campaniasQuitar: que.campanias && modo === "igualar" ? dif(campD, campOrigen) : [],
        gruposAgregar: que.grupos ? dif(grpOrigen, grpD) : [],
        gruposQuitar: que.grupos && modo === "igualar" ? dif(grpD, grpOrigen) : [],
      };
    });
}

/**
 * Aplica la copia como una operación por cada campaña o grupo que algún
 * usuario de destino gana o pierde. Con `entidadIds` (el reintento) solo
 * aplica esas campañas o grupos.
 */
export function aplicarCopia(cambios: CambioCopia[], entidadIds?: string[]) {
  const quienes = (campo: keyof Omit<CambioCopia, "usuarioId">, id: string) =>
    cambios.filter((c) => c[campo].includes(id)).map((c) => c.usuarioId);
  const ops: Operacion[] = [
    ...enCampanias(campanias.map((c) => c.id)).map((e) => ({
      ...e,
      agregar: quienes("campaniasAgregar", e.id),
      quitar: quienes("campaniasQuitar", e.id),
    })),
    ...enGrupos(gruposTrabajo.map((g) => g.id)).map((e) => ({
      ...e,
      agregar: quienes("gruposAgregar", e.id),
      quitar: quienes("gruposQuitar", e.id),
    })),
  ].filter(
    (op) => op.agregar.length + op.quitar.length > 0 && (!entidadIds || entidadIds.includes(op.id))
  );
  return ejecutarPorEntidad("copia", ops, cambios.map((c) => c.usuarioId));
}

export function hayCambios(c: CambioCopia) {
  return (
    c.campaniasAgregar.length + c.campaniasQuitar.length +
    c.gruposAgregar.length + c.gruposQuitar.length > 0
  );
}
