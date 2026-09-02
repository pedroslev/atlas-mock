import type { LucideIcon } from "lucide-react";
import { Building2, Globe, Receipt, PhoneCall } from "lucide-react";

export type AdminNavItem = {
  href: string;
  /** Clave de traducción del rótulo (ver src/lib/i18n/dict/admin.ts). */
  labelKey: string;
  icon: LucideIcon;
};

// Secciones de la Administración Mitrol (interna). Base path /admin.
// El label visible dice "Clientes" (el usuario piensa en clientes, no en
// tenants); la ruta /admin/tenants y las claves de datos quedan igual.
export const adminNavItems: AdminNavItem[] = [
  { href: "/admin/tenants", labelKey: "admin.nav.clientes", icon: Building2 },
  { href: "/admin/regiones", labelKey: "admin.nav.regiones", icon: Globe },
  { href: "/admin/telefonia", labelKey: "admin.nav.telefonia", icon: PhoneCall },
  { href: "/admin/facturacion", labelKey: "admin.nav.facturacion", icon: Receipt },
];
