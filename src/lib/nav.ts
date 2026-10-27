import type { LucideIcon } from "lucide-react";
import {
  Megaphone,
  Landmark,
  Tags,
  Bookmark,
  MessageSquareText,
  CalendarDays,
  ShieldOff,
  Users,
  UsersRound,
  CircleDot,
  Contact,
  Settings,
  KeyRound,
  BookOpen,
} from "lucide-react";
import type { PermisoClaveApi } from "@/lib/mock-data";

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
  // Clientes (propuesta 2026-10-05, relevamiento/clientes-y-contactaciones):
  // base de clientes por proyecto, compartible con otros proyectos.
  { href: "/clientes", labelKey: "common.nav.clientes", icon: Contact },
  { href: "/cuentas", labelKey: "common.nav.cuentas", icon: Landmark },
  { href: "/clasificaciones", labelKey: "common.nav.clasificaciones", icon: Tags },
  { href: "/marcadores", labelKey: "common.nav.marcas", icon: Bookmark },
  // Plantillas de mensajes (ATLAS-1191): catálogo + grupos, como Marcas.
  { href: "/plantillas", labelKey: "common.nav.plantillas", icon: MessageSquareText },
  { href: "/feriados", labelKey: "common.nav.feriados", icon: CalendarDays },
  { href: "/listas-de-exclusion", labelKey: "common.nav.listasExclusion", icon: ShieldOff },
  { href: "/agentes", labelKey: "common.nav.usuarios", icon: Users },
  { href: "/grupos-de-trabajo", labelKey: "common.nav.gruposRoles", icon: UsersRound },
  { href: "/estados-auxiliares", labelKey: "common.nav.estadosAuxiliares", icon: CircleDot },
];

// Configuración del tenant: lo que es del tenant entero. Va al pie del menú
// lateral y adentro tiene su propio submenú. Hoy solo tiene las claves de
// acceso API, así que /configuracion abre directo ahí.
export const configuracionNav: NavItem = {
  href: "/configuracion",
  labelKey: "common.nav.configuracion",
  icon: Settings,
};

// Documentación de la app: cómo usar el editor de workflows y sus
// macroestados. Va al pie, junto a Configuración.
export const documentacionNav: NavItem = {
  href: "/documentacion",
  labelKey: "common.nav.documentacion",
  icon: BookOpen,
};

export type ConfigItem = NavItem & {
  /** Permiso que hace falta para ver el ítem (y la pantalla). */
  permiso: PermisoClaveApi;
};

export const configuracionItems: ConfigItem[] = [
  {
    href: "/configuracion/claves-api",
    labelKey: "common.nav.clavesApi",
    icon: KeyRound,
    permiso: "ver",
  },
];
