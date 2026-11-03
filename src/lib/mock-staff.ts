// Datos mock del control de acceso del staff de Mitrol a Zeus (ATLAS-1282).
//
// MOCK: todo vive en memoria; el directorio, los grupos y los estados son
// ficticios y no persisten (PRODUCT.md).
// REAL: la lista de personas la sirve `zeus-api`, que sincroniza en SOLO
// LECTURA con el directorio LDAP de Mitrol. Zeus no escribe nunca en el
// directorio: solo decide a quién autoriza y con qué permisos. La clave de cada
// persona es el identificador inmutable del directorio (`directoryId`), no el
// mail (el mail puede cambiar).

import type { BadgeVariant } from "@/components/admin/badge-variant";

// --- catálogo de permisos ------------------------------------------------
// Claves `zeus.<recurso>.<accion>`. `write` incluye ver; `create` y `disable`
// (solo Clientes) son independientes de `write`.
export type PermissionArea = {
  /** Clave i18n del área (ver dict/staff.ts). */
  areaKey: string;
  /** Si el alcance por cluster acota los permisos de esta área. */
  scoped: boolean;
  permissions: { key: string; labelKey: string }[];
};

export const permissionCatalog: PermissionArea[] = [
  {
    areaKey: "clientes",
    scoped: true,
    permissions: [
      { key: "zeus.tenants.read", labelKey: "ver" },
      { key: "zeus.tenants.write", labelKey: "editar" },
      { key: "zeus.tenants.create", labelKey: "crear" },
      { key: "zeus.tenants.disable", labelKey: "deshabilitar" },
    ],
  },
  {
    areaKey: "telefonia",
    scoped: true,
    permissions: [
      { key: "zeus.telephony.read", labelKey: "ver" },
      { key: "zeus.telephony.write", labelKey: "editar" },
    ],
  },
  {
    areaKey: "facturacion",
    scoped: true,
    permissions: [
      { key: "zeus.billing.read", labelKey: "ver" },
      { key: "zeus.billing.write", labelKey: "editar" },
    ],
  },
  {
    areaKey: "regiones",
    scoped: false,
    permissions: [
      { key: "zeus.regions.read", labelKey: "ver" },
      { key: "zeus.regions.write", labelKey: "editar" },
    ],
  },
  {
    areaKey: "impersonacion",
    scoped: false,
    permissions: [{ key: "zeus.impersonation.execute", labelKey: "ejecutar" }],
  },
  {
    areaKey: "proveedoresIa",
    scoped: false,
    permissions: [
      { key: "zeus.ai-providers.read", labelKey: "ver" },
      { key: "zeus.ai-providers.write", labelKey: "editar" },
    ],
  },
  {
    areaKey: "staff",
    scoped: false,
    permissions: [
      { key: "zeus.staff.read", labelKey: "ver" },
      { key: "zeus.staff.write", labelKey: "editar" },
    ],
  },
];

export const allPermissionKeys: string[] = permissionCatalog.flatMap((area) =>
  area.permissions.map((p) => p.key),
);

/**
 * Normaliza un conjunto de permisos aplicando "write incluye ver": si hay
 * `<recurso>.write`, se agrega `<recurso>.read`. Lo usan la matriz y el
 * cálculo de permisos efectivos.
 * REAL: la regla vive en `zeus-api`; el cliente no la decide.
 */
export function withImpliedRead(keys: Iterable<string>): Set<string> {
  const result = new Set(keys);
  for (const key of keys) {
    if (key.endsWith(".write")) result.add(key.replace(/\.write$/, ".read"));
  }
  return result;
}

// --- alcance por cluster -------------------------------------------------
// "all" = todos los clusters; si no, ids de `regions` (mock-admin).
export type ClusterScope = "all" | string[];

// --- grupos de permisos --------------------------------------------------
export type PermissionGroup = {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  /** Alcance por defecto: lo hereda el usuario salvo que se lo pise. */
  defaultScope: ClusterScope;
};

const readKeys = allPermissionKeys.filter((k) => k.endsWith(".read"));
const soporte = [
  "zeus.tenants.read",
  "zeus.telephony.read",
  "zeus.regions.read",
  "zeus.impersonation.execute",
];

export const permissionGroups: PermissionGroup[] = [
  {
    id: "grp-admin",
    name: "Administrador de Zeus",
    description: "Acceso total a Zeus, incluida la gestión del staff.",
    permissions: allPermissionKeys,
    defaultScope: "all",
  },
  {
    id: "grp-soporte",
    name: "Soporte",
    description: "Consulta clientes, telefonía y regiones; puede impersonar.",
    permissions: soporte,
    defaultScope: "all",
  },
  {
    id: "grp-soporte-tel",
    name: "Soporte de telefonía",
    description: "Lo de Soporte y además edita telefonía.",
    permissions: [...soporte, "zeus.telephony.write"],
    defaultScope: "all",
  },
  {
    id: "grp-ventas",
    name: "Ventas",
    description: "Consulta y da de alta clientes; ve facturación.",
    permissions: ["zeus.tenants.read", "zeus.tenants.create", "zeus.billing.read"],
    defaultScope: "all",
  },
  {
    id: "grp-facturacion",
    name: "Administración / Facturación",
    description: "Consulta clientes y gestiona la facturación.",
    permissions: ["zeus.tenants.read", "zeus.billing.read", "zeus.billing.write"],
    defaultScope: "all",
  },
  {
    id: "grp-lectura",
    name: "Solo lectura",
    description: "Puede ver todo, no modifica nada.",
    permissions: readKeys,
    defaultScope: "all",
  },
];

export function getGroup(id: string): PermissionGroup | undefined {
  return permissionGroups.find((g) => g.id === id);
}

// --- personas del directorio y su estado en Zeus -------------------------
export type StaffStatus =
  | "no-habilitado"
  | "invitado"
  | "activo"
  | "deshabilitado"
  | "deshabilitado-baja";

export const staffStatusBadge: Record<StaffStatus, BadgeVariant> = {
  "no-habilitado": "neutral",
  invitado: "info",
  activo: "success",
  deshabilitado: "neutral",
  "deshabilitado-baja": "warning",
};

export type StaffUser = {
  /** Identificador inmutable del directorio (REAL: clave del usuario). */
  directoryId: string;
  name: string;
  /** Siempre @mitrol.net; solo lectura en la UI. */
  email: string;
  status: StaffStatus;
  groupIds: string[];
  /** Permisos individuales extra, aditivos sobre los del grupo. */
  extraPermissions: string[];
  /** Alcance propio; "all" o clusters. */
  scope: ClusterScope;
  /** Última sincronización con el directorio (texto ya formateado). */
  lastSync: string;
};

const SYNC = "03/11/2026 06:00";

export const directoryUsers: StaffUser[] = [
  { directoryId: "ldap-1001", name: "Marcela Ibáñez", email: "marcela.ibanez@mitrol.net", status: "activo", groupIds: ["grp-admin"], extraPermissions: [], scope: "all", lastSync: SYNC },
  { directoryId: "ldap-1002", name: "Federico Castaño", email: "federico.castano@mitrol.net", status: "activo", groupIds: ["grp-soporte"], extraPermissions: [], scope: "all", lastSync: SYNC },
  { directoryId: "ldap-1003", name: "Lucía Benítez", email: "lucia.benitez@mitrol.net", status: "activo", groupIds: ["grp-soporte-tel"], extraPermissions: [], scope: ["region-ar"], lastSync: SYNC },
  { directoryId: "ldap-1004", name: "Gonzalo Paredes", email: "gonzalo.paredes@mitrol.net", status: "activo", groupIds: ["grp-ventas"], extraPermissions: ["zeus.regions.read"], scope: ["region-col", "region-mx"], lastSync: SYNC },
  { directoryId: "ldap-1005", name: "Valeria Domínguez", email: "valeria.dominguez@mitrol.net", status: "activo", groupIds: ["grp-facturacion"], extraPermissions: [], scope: "all", lastSync: SYNC },
  { directoryId: "ldap-1006", name: "Tomás Echeverría", email: "tomas.echeverria@mitrol.net", status: "invitado", groupIds: ["grp-soporte"], extraPermissions: [], scope: ["region-cl"], lastSync: SYNC },
  { directoryId: "ldap-1007", name: "Camila Rossi", email: "camila.rossi@mitrol.net", status: "invitado", groupIds: ["grp-ventas"], extraPermissions: [], scope: "all", lastSync: SYNC },
  { directoryId: "ldap-1008", name: "Julián Arriaga", email: "julian.arriaga@mitrol.net", status: "no-habilitado", groupIds: [], extraPermissions: [], scope: "all", lastSync: SYNC },
  { directoryId: "ldap-1009", name: "Paula Sandoval", email: "paula.sandoval@mitrol.net", status: "no-habilitado", groupIds: [], extraPermissions: [], scope: "all", lastSync: SYNC },
  { directoryId: "ldap-1010", name: "Nicolás Quiroga", email: "nicolas.quiroga@mitrol.net", status: "no-habilitado", groupIds: [], extraPermissions: [], scope: "all", lastSync: SYNC },
  { directoryId: "ldap-1011", name: "Rocío Ferreyra", email: "rocio.ferreyra@mitrol.net", status: "deshabilitado-baja", groupIds: ["grp-soporte"], extraPermissions: [], scope: "all", lastSync: "30/10/2026 06:00" },
  { directoryId: "ldap-1012", name: "Matías Villalba", email: "matias.villalba@mitrol.net", status: "deshabilitado-baja", groupIds: ["grp-ventas"], extraPermissions: [], scope: "all", lastSync: "27/10/2026 06:00" },
];

export function getStaffUser(directoryId: string): StaffUser | undefined {
  return directoryUsers.find((u) => u.directoryId === directoryId);
}

// --- permisos efectivos --------------------------------------------------
export type EffectivePermissions = {
  permissions: string[];
  /** Permisos que vienen solo de los extras (para marcarlos en el resumen). */
  extraOnly: string[];
  scope: ClusterScope;
};

/**
 * Permisos efectivos = unión de los permisos de todos los grupos ∪ extras.
 * El alcance es el propio del usuario (por defecto el del grupo).
 * REAL: `zeus-api` calcula lo mismo y es la única fuente de autorización.
 */
export function effectivePermissions(
  groupIds: string[],
  extras: string[],
  scope: ClusterScope,
): EffectivePermissions {
  const fromGroups = new Set(
    groupIds.flatMap((id) => getGroup(id)?.permissions ?? []),
  );
  const all = withImpliedRead([...fromGroups, ...extras]);
  const groupsFull = withImpliedRead(fromGroups);
  return {
    permissions: allPermissionKeys.filter((k) => all.has(k)),
    extraOnly: allPermissionKeys.filter((k) => all.has(k) && !groupsFull.has(k)),
    scope,
  };
}
