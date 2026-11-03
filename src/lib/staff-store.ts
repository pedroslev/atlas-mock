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
// /staff-users); la UI las pide a la API y no guarda estado propio. Borrar un
// grupo con personas asignadas se lo quita a cada una (lo hace la API).

type StaffState = { groups: PermissionGroup[]; users: StaffUser[] };

let state: StaffState = { groups: seedGroups, users: seedUsers };
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
  /** Crea un grupo nuevo y devuelve su id. */
  createGroup(data: Omit<PermissionGroup, "id">): string {
    const id = `grp-${Date.now().toString(36)}`;
    setState({ ...state, groups: [...state.groups, { ...data, id }] });
    return id;
  },
  updateGroup(id: string, data: Omit<PermissionGroup, "id">) {
    setState({
      ...state,
      groups: state.groups.map((g) => (g.id === id ? { ...data, id } : g)),
    });
  },
  /** Borra el grupo y se lo quita a las personas que lo tenían. */
  deleteGroup(id: string) {
    setState({
      groups: state.groups.filter((g) => g.id !== id),
      users: state.users.map((u) => ({
        ...u,
        groupIds: u.groupIds.filter((g) => g !== id),
      })),
    });
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
};

/** Estado actual del store; re-renderiza al cambiar. */
export function useStaffStore(): StaffState {
  return useSyncExternalStore(subscribe, () => state, () => state);
}
