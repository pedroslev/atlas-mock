"use client";

// Asignación masiva desde la tabla de Usuarios (ATLAS-1353).
//
// MOCK: las acciones modifican en memoria los datos de ejemplo (agentes,
// campanias.usuariosAsignados, gruposTrabajo.usuarioIds, usuarioOverrides) y
// avisan a las pantallas abiertas para que se redibujen. No persiste: al
// recargar vuelve a los datos iniciales, y las pantallas que se arman en el
// servidor (la ficha de una campaña) no ven estos cambios.
// REAL: cada acción es una sola operación contra el servicio, que devuelve,
// por usuario, si se aplicó, si no cambió nada o por qué falló.

import { useSyncExternalStore } from "react";
import {
  agentes,
  campanias,
  gruposTrabajo,
  usuarioOverrides,
  type Permiso,
} from "@/lib/mock-data";

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

export type ResultadoMasivo = {
  /** Usuarios a los que se les aplicó algún cambio. */
  aplicados: string[];
  /** Usuarios que ya estaban como se pedía: no cambió nada. */
  sinCambios: string[];
  /** Usuarios en los que falló, con el motivo visible. */
  fallidos: { usuarioId: string; motivo: string }[];
};

// MOCK: Florencia Godoy (ag-17) falla en el primer intento de cada acción,
// para poder ver en el mock la lista de fallidos y "Reintentar los que
// fallaron". En el segundo intento se aplica.
// REAL: los fallos los informa el servicio (por ejemplo, un corte de conexión
// a mitad de la operación); no hay ningún usuario que falle a propósito.
const USUARIO_QUE_FALLA = "ag-17";
const yaFallo = new Set<string>();

function simulaFallo(accion: string, usuarioId: string): boolean {
  if (usuarioId !== USUARIO_QUE_FALLA) return false;
  const clave = `${accion}:${usuarioId}`;
  if (yaFallo.has(clave)) return false;
  yaFallo.add(clave);
  return true;
}

const MOTIVO_FALLO = "No se pudo guardar el cambio. Volvé a intentarlo.";

function ejecutar(
  accion: string,
  usuarioIds: string[],
  aplicar: (usuarioId: string) => boolean
): ResultadoMasivo {
  const r: ResultadoMasivo = { aplicados: [], sinCambios: [], fallidos: [] };
  for (const id of usuarioIds) {
    if (simulaFallo(accion, id)) {
      r.fallidos.push({ usuarioId: id, motivo: MOTIVO_FALLO });
      continue;
    }
    if (aplicar(id)) r.aplicados.push(id);
    else r.sinCambios.push(id);
  }
  avisar();
  return r;
}

// --- Campañas -------------------------------------------------------------

export function agregarACampanias(usuarioIds: string[], campaniaIds: string[]) {
  return ejecutar(`camp+:${campaniaIds.join(",")}`, usuarioIds, (u) => {
    let cambio = false;
    for (const c of campanias.filter((c) => campaniaIds.includes(c.id))) {
      if (!c.usuariosAsignados.includes(u)) {
        c.usuariosAsignados.push(u);
        cambio = true;
      }
    }
    return cambio;
  });
}

export function quitarDeCampanias(usuarioIds: string[], campaniaIds: string[]) {
  return ejecutar(`camp-:${campaniaIds.join(",")}`, usuarioIds, (u) => {
    let cambio = false;
    for (const c of campanias.filter((c) => campaniaIds.includes(c.id))) {
      const i = c.usuariosAsignados.indexOf(u);
      if (i !== -1) {
        c.usuariosAsignados.splice(i, 1);
        cambio = true;
      }
    }
    return cambio;
  });
}

// --- Grupos de trabajo ----------------------------------------------------

export function agregarAGrupos(usuarioIds: string[], grupoIds: string[]) {
  return ejecutar(`grp+:${grupoIds.join(",")}`, usuarioIds, (u) => {
    let cambio = false;
    for (const g of gruposTrabajo.filter((g) => grupoIds.includes(g.id))) {
      if (!g.usuarioIds.includes(u)) {
        g.usuarioIds.push(u);
        cambio = true;
      }
    }
    return cambio;
  });
}

export function quitarDeGrupos(usuarioIds: string[], grupoIds: string[]) {
  return ejecutar(`grp-:${grupoIds.join(",")}`, usuarioIds, (u) => {
    let cambio = false;
    for (const g of gruposTrabajo.filter((g) => grupoIds.includes(g.id))) {
      const i = g.usuarioIds.indexOf(u);
      if (i !== -1) {
        g.usuarioIds.splice(i, 1);
        cambio = true;
      }
    }
    return cambio;
  });
}

// --- Estado ---------------------------------------------------------------

export function cambiarEstado(usuarioIds: string[], habilitado: boolean) {
  return ejecutar(`estado:${habilitado}`, usuarioIds, (u) => {
    const a = agentes.find((a) => a.id === u);
    if (!a || a.habilitado === habilitado) return false;
    a.habilitado = habilitado;
    return true;
  });
}

// --- Copiar asignaciones de otro usuario ---------------------------------

export type QueCopiar = { campanias: boolean; grupos: boolean; permisos: boolean };
/** "sumar": conserva lo que ya tenían. "igualar": además quita lo que el origen no tiene. */
export type ModoCopia = "sumar" | "igualar";

export function permisosPropios(usuarioId: string): Permiso[] {
  return usuarioOverrides.find((o) => o.usuarioId === usuarioId)?.permisosExtra ?? [];
}

/** Qué se le agrega y qué se le quita a cada usuario de destino. */
export type CambioCopia = {
  usuarioId: string;
  campaniasAgregar: string[];
  campaniasQuitar: string[];
  gruposAgregar: string[];
  gruposQuitar: string[];
  permisosAgregar: string[];
  permisosQuitar: string[];
};

function clavesPermiso(permisos: Permiso[]): string[] {
  return permisos.flatMap((p) => p.acciones.map((a) => `${p.modulo}:${a}`));
}

function desdeClaves(claves: string[]): Permiso[] {
  const porModulo = new Map<string, Permiso["acciones"]>();
  for (const c of claves) {
    const [modulo, accion] = c.split(":") as [string, Permiso["acciones"][number]];
    porModulo.set(modulo, [...(porModulo.get(modulo) ?? []), accion]);
  }
  return [...porModulo].map(([modulo, acciones]) => ({ modulo, acciones }));
}

export function calcularCopia(
  origenId: string,
  destinoIds: string[],
  que: QueCopiar,
  modo: ModoCopia
): CambioCopia[] {
  const campOrigen = campanias.filter((c) => c.usuariosAsignados.includes(origenId)).map((c) => c.id);
  const grpOrigen = gruposTrabajo.filter((g) => g.usuarioIds.includes(origenId)).map((g) => g.id);
  const permOrigen = clavesPermiso(permisosPropios(origenId));

  return destinoIds
    .filter((d) => d !== origenId)
    .map((d) => {
      const campD = campanias.filter((c) => c.usuariosAsignados.includes(d)).map((c) => c.id);
      const grpD = gruposTrabajo.filter((g) => g.usuarioIds.includes(d)).map((g) => g.id);
      const permD = clavesPermiso(permisosPropios(d));
      const dif = (a: string[], b: string[]) => a.filter((x) => !b.includes(x));
      return {
        usuarioId: d,
        campaniasAgregar: que.campanias ? dif(campOrigen, campD) : [],
        campaniasQuitar: que.campanias && modo === "igualar" ? dif(campD, campOrigen) : [],
        gruposAgregar: que.grupos ? dif(grpOrigen, grpD) : [],
        gruposQuitar: que.grupos && modo === "igualar" ? dif(grpD, grpOrigen) : [],
        permisosAgregar: que.permisos ? dif(permOrigen, permD) : [],
        permisosQuitar: que.permisos && modo === "igualar" ? dif(permD, permOrigen) : [],
      };
    });
}

export function aplicarCopia(cambios: CambioCopia[], usuarioIds?: string[]) {
  const porUsuario = new Map(cambios.map((c) => [c.usuarioId, c]));
  const ids = usuarioIds ?? cambios.map((c) => c.usuarioId);
  return ejecutar("copia", ids, (u) => {
    const c = porUsuario.get(u);
    if (!c) return false;
    let cambio = false;
    for (const camp of campanias) {
      if (c.campaniasAgregar.includes(camp.id)) { camp.usuariosAsignados.push(u); cambio = true; }
      if (c.campaniasQuitar.includes(camp.id)) {
        camp.usuariosAsignados.splice(camp.usuariosAsignados.indexOf(u), 1);
        cambio = true;
      }
    }
    for (const g of gruposTrabajo) {
      if (c.gruposAgregar.includes(g.id)) { g.usuarioIds.push(u); cambio = true; }
      if (c.gruposQuitar.includes(g.id)) { g.usuarioIds.splice(g.usuarioIds.indexOf(u), 1); cambio = true; }
    }
    if (c.permisosAgregar.length || c.permisosQuitar.length) {
      // MOCK: los permisos propios del usuario son los "permisos extra" que
      // ya muestra su ficha.
      // REAL: a confirmar con el Architect — hoy en Atlas los permisos se
      // definen en el grupo de trabajo y no hay una pantalla para darle
      // permisos propios a una persona.
      const actuales = clavesPermiso(permisosPropios(u));
      const nuevos = [
        ...actuales.filter((p) => !c.permisosQuitar.includes(p)),
        ...c.permisosAgregar,
      ];
      let o = usuarioOverrides.find((o) => o.usuarioId === u);
      if (!o) {
        o = { usuarioId: u, estadosAuxiliaresExtra: [], permisosExtra: [] };
        usuarioOverrides.push(o);
      }
      o.permisosExtra = desdeClaves(nuevos);
      cambio = true;
    }
    return cambio;
  });
}

export function hayCambios(c: CambioCopia) {
  return (
    c.campaniasAgregar.length + c.campaniasQuitar.length +
    c.gruposAgregar.length + c.gruposQuitar.length +
    c.permisosAgregar.length + c.permisosQuitar.length > 0
  );
}
