"use client";

import { useSyncExternalStore } from "react";
import {
  seedGroups,
  seedUsers,
  type PermissionGroup,
  type StaffUser,
} from "@/lib/mock-staff";

// Store en memoria del control de acceso del staff, compartido por todas las
// pantallas de /admin/staff/**: grupos de permisos y personas del directorio.
//
// MOCK: vive en un módulo (sobrevive a la navegación entre pantallas, se
// reinicia al recargar la página) y se siembra con los grupos y personas de
// ejemplo. Crear/editar/borrar un grupo y habilitar/deshabilitar personas se
// reflejan al instante en listas, selectores, filtros y permisos efectivos.
// REAL: la fuente es `zeus-api` (grupos en /staff-groups, personas en
// /staff-users); la UI las pide a la API y no guarda estado propio. Una persona
// tiene un solo grupo; borrar un grupo con personas responde 409
// `group_has_members` (la API lo valida, no la UI).

export type StaffTab = "personas" | "grupos";
type StaffState = {
  groups: PermissionGroup[];
  users: StaffUser[];
  tab: StaffTab;
};

let state: StaffState = { groups: seedGroups, users: seedUsers, tab: "personas" };
const listeners = new Set<() => void>();

// Reemplaza el estado (siempre un objeto nuevo) y avisa a los suscriptores.
function setState(next: StaffState) {
  state = next;
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export const staffActions = {
  /** Crea (sin `id`) o actualiza un grupo. Devuelve el id del grupo. */
  saveGroup(id: string | undefined, data: Omit<PermissionGroup, "id">): string {
    const groupId = id ?? `grp-${Date.now().toString(36)}`;
    const group = { ...data, id: groupId };
    setState({
      ...state,
      groups: id
        ? state.groups.map((g) => (g.id === id ? group : g))
        : [...state.groups, group],
    });
    return groupId;
  },
  /**
   * Borra el grupo solo si no tiene personas asignadas. Devuelve false (y no
   * borra nada) si las tiene: primero hay que reasignarlas.
   */
  deleteGroup(id: string): boolean {
    if (state.users.some((u) => u.groupId === id)) return false;
    setState({ ...state, groups: state.groups.filter((g) => g.id !== id) });
    return true;
  },
  /** Reemplaza los datos de una persona (habilitar, editar, deshabilitar). */
  updateUser(directoryId: string, changes: Partial<StaffUser>) {
    setState({
      ...state,
      users: state.users.map((u) =>
        u.directoryId === directoryId ? { ...u, ...changes } : u,
      ),
    });
  },
  /** Recuerda la pestaña activa para volver a ella desde un detalle. */
  setTab(tab: StaffTab) {
    setState({ ...state, tab });
  },
};

/** Estado actual del store; re-renderiza al cambiar. */
export function useStaffStore(): StaffState {
  return useSyncExternalStore(subscribe, () => state, () => state);
}
