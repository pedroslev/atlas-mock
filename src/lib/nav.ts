import type { LucideIcon } from "lucide-react";
import {
  Megaphone,
  Landmark,
  Tags,
  Bookmark,
  CalendarDays,
  ShieldOff,
  Users,
  UsersRound,
  CircleDot,
} from "lucide-react";

export type NavItem = {
  href: string;
  /** Clave de traducción del rótulo (ver src/lib/i18n/dict/common.ts). */
  labelKey: string;
  icon: LucideIcon;
};

// Orden por frecuencia de uso — igual al contrato de fronted/README.md,
// con Proyectos antes que Campañas porque las campañas dependen del proyecto.
// "Listas de contactos" no tiene pantalla propia: una lista de contactos
// siempre pertenece a una campaña puntual, se crea y se ve desde la solapa
// "Listas de contactos" de esa campaña (feedback de producto, 2026-07-16).
// "Criterios de rellamada" queda fuera de fase 0 (feedback de producto).
// "Proyectos" tampoco tiene entrada propia: la pantalla de Campañas agrupa
// las campañas por proyecto y desde ahí se gestiona el proyecto (feedback
// de producto 2026-07-16). Las rutas /proyectos/* siguen existiendo.
export const navItems: NavItem[] = [
  { href: "/campanias", labelKey: "common.nav.campanias", icon: Megaphone },
  { href: "/cuentas", labelKey: "common.nav.cuentas", icon: Landmark },
  { href: "/clasificaciones", labelKey: "common.nav.clasificaciones", icon: Tags },
  { href: "/marcadores", labelKey: "common.nav.marcas", icon: Bookmark },
  { href: "/feriados", labelKey: "common.nav.feriados", icon: CalendarDays },
  { href: "/listas-de-exclusion", labelKey: "common.nav.listasExclusion", icon: ShieldOff },
  { href: "/agentes", labelKey: "common.nav.usuarios", icon: Users },
  { href: "/grupos-de-trabajo", labelKey: "common.nav.gruposRoles", icon: UsersRound },
  { href: "/estados-auxiliares", labelKey: "common.nav.estadosAuxiliares", icon: CircleDot },
];
