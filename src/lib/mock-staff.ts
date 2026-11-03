// Datos mock del control de acceso del staff de Mitrol a Zeus (ATLAS-1282).
//
// MOCK: todo vive en memoria; el directorio, los grupos y los estados son
// ficticios y no persisten (PRODUCT.md).
// REAL: la lista de personas la sirve `zeus-api`, que sincroniza en SOLO
// LECTURA con el directorio LDAP de Mitrol y trae únicamente a las personas
// ACTIVAS del directorio en cada sincronización. Zeus no escribe nunca en el
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
  /** Si el alcance por región acota los permisos de esta área. */
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

// --- alcance por región -------------------------------------------------
// MOCK: "all" = todas las regiones; si no, ids de `regions` (mock-admin).
// REAL: en `zeus-api` el alcance es `permission_groups.region_scope`: NULL = todas
// las regiones, incluidas las que se den de alta después; con valor, la lista de
// `regions.id` (una región nueva no entra sola en una lista).
export type RegionScope = "all" | string[];

// --- grupos de permisos --------------------------------------------------
// Son la SEMILLA del store en memoria (lib/staff-store.ts): ahí se crean,
// editan y borran; este archivo no se muta.
export type PermissionGroup = {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  /** Alcance por región del grupo: lo heredan todas sus personas. */
  defaultScope: RegionScope;
};

const readKeys = allPermissionKeys.filter((k) => k.endsWith(".read"));
const soporte = [
  "zeus.tenants.read",
  "zeus.telephony.read",
  "zeus.regions.read",
  "zeus.impersonation.execute",
];

export const seedGroups: PermissionGroup[] = [
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
    description: "Lo de Soporte y además edita telefonía, solo en Argentina.",
    permissions: [...soporte, "zeus.telephony.write"],
    defaultScope: ["region-ar"],
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

// --- personas del directorio y su estado en Zeus -------------------------
export type StaffStatus =
  | "no-habilitado"
  | "invitado"
  | "activo"
  | "deshabilitado";

export const staffStatusBadge: Record<StaffStatus, BadgeVariant> = {
  "no-habilitado": "neutral",
  invitado: "info",
  activo: "success",
  deshabilitado: "neutral",
};

export type StaffUser = {
  /** Identificador inmutable del directorio (REAL: clave del usuario). */
  directoryId: string;
  name: string;
  /** Siempre @mitrol.net; solo lectura en la UI. */
  email: string;
  status: StaffStatus;
  /** Grupo de permisos único (N personas : 1 grupo); undefined = sin grupo. */
  groupId?: string;
  /** Última sincronización con el directorio (texto ya formateado). */
  lastSync: string;
};

const SYNC = "03/11/2026 06:00";

export const seedUsers: StaffUser[] = [
  { directoryId: "ldap-1001", name: "Marcela Ibáñez", email: "marcela.ibanez@mitrol.net", status: "activo", groupId: "grp-admin", lastSync: SYNC },
  { directoryId: "ldap-1002", name: "Federico Castaño", email: "federico.castano@mitrol.net", status: "activo", groupId: "grp-soporte", lastSync: SYNC },
  { directoryId: "ldap-1003", name: "Lucía Benítez", email: "lucia.benitez@mitrol.net", status: "activo", groupId: "grp-soporte-tel", lastSync: SYNC },
  { directoryId: "ldap-1004", name: "Gonzalo Paredes", email: "gonzalo.paredes@mitrol.net", status: "activo", groupId: "grp-ventas", lastSync: SYNC },
  { directoryId: "ldap-1005", name: "Valeria Domínguez", email: "valeria.dominguez@mitrol.net", status: "activo", groupId: "grp-facturacion", lastSync: SYNC },
  { directoryId: "ldap-1006", name: "Tomás Echeverría", email: "tomas.echeverria@mitrol.net", status: "invitado", groupId: "grp-soporte", lastSync: SYNC },
  { directoryId: "ldap-1007", name: "Camila Rossi", email: "camila.rossi@mitrol.net", status: "invitado", groupId: "grp-ventas", lastSync: SYNC },
  { directoryId: "ldap-1008", name: "Julián Arriaga", email: "julian.arriaga@mitrol.net", status: "no-habilitado", lastSync: SYNC },
  { directoryId: "ldap-1009", name: "Paula Sandoval", email: "paula.sandoval@mitrol.net", status: "no-habilitado", lastSync: SYNC },
  { directoryId: "ldap-1010", name: "Nicolás Quiroga", email: "nicolas.quiroga@mitrol.net", status: "no-habilitado", lastSync: SYNC },
  { directoryId: "ldap-1011", name: "Rocío Ferreyra", email: "rocio.ferreyra@mitrol.net", status: "activo", groupId: "grp-soporte", lastSync: SYNC },
  { directoryId: "ldap-1012", name: "Matías Villalba", email: "matias.villalba@mitrol.net", status: "deshabilitado", groupId: "grp-ventas", lastSync: SYNC },
];

// --- permisos efectivos --------------------------------------------------
export type EffectivePermissions = {
  permissions: string[];
  scope: RegionScope;
};

/**
 * Permisos efectivos de una persona = exactamente los de su grupo (con "editar
 * incluye ver"); el alcance por región es el del grupo. Sin grupo no hay nada.
 * REAL: `zeus-api` calcula lo mismo y es la única fuente de autorización.
 */
export function effectivePermissions(
  group: PermissionGroup | undefined,
): EffectivePermissions {
  const granted = withImpliedRead(group?.permissions ?? []);
  return {
    permissions: allPermissionKeys.filter((k) => granted.has(k)),
    scope: group?.defaultScope ?? "all",
  };
}
