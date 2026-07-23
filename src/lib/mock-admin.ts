// Datos mock de la Administración Mitrol — la consola INTERNA de soporte de
// Mitrol para gestionar los tenants cloud. A diferencia del backoffice (Olimpo,
// tenant único "Banco Sur"), esta app es CROSS-tenant: administra muchas
// organizaciones cliente a la vez, por lo que mostrar varias empresas es el
// punto (ver fronted/README.md §3). Nada de esto pega a una API real.
//
// Los tipos siguen el DER de la base Global (ADR-BD-001): organizations,
// regions, tenant_contacts, billing_events. Campos "a definir" en el ADR
// (organizations.settings, billing_events.type/content) se dejan como
// placeholders, sin inventar contrato.

import type { BadgeVariant } from "@/components/admin/badge-variant";
import type { TranslateFn } from "@/lib/i18n";

// --- regions -------------------------------------------------------------
// El code lo define desarrollo (ADR-BD-001): AR, COL, MX, CL o CUSTOM.
export type RegionCode = "AR" | "COL" | "MX" | "CL" | "CUSTOM";

export type Region = {
  id: string;
  code: RegionCode;
  /** Nombre legible para la UI (no está en el DER, solo presentación). */
  label: string;
  /**
   * Clave i18n del rótulo, solo cuando el label es COPY de interfaz y no un
   * dato: los países son dato (no se traducen), "Despliegue dedicado" no.
   */
  labelKey?: string;
};

export const regions: Region[] = [
  { id: "region-ar", code: "AR", label: "Argentina" },
  { id: "region-col", code: "COL", label: "Colombia" },
  { id: "region-mx", code: "MX", label: "México" },
  { id: "region-cl", code: "CL", label: "Chile" },
  {
    id: "region-custom",
    code: "CUSTOM",
    label: "Despliegue dedicado",
    labelKey: "admin.regiones.custom",
  },
];

/** Rótulo de la región listo para pintar: traducido si es copy, crudo si es dato. */
export function regionLabel(region: Region, t: TranslateFn): string {
  return region.labelKey ? t(region.labelKey) : region.label;
}

// Cada región usa una variante tonal distinta del Badge (DESIGN.md: colores
// distintos para diferenciar, siempre por token, nunca hex crudo).
export const regionBadgeVariant: Record<RegionCode, BadgeVariant> = {
  AR: "info",
  COL: "success",
  MX: "warning",
  CL: "secondary",
  CUSTOM: "neutral",
};

export function getRegion(id: string): Region | undefined {
  return regions.find((r) => r.id === id);
}

// --- tenant_contacts -----------------------------------------------------
export type TenantContact = {
  id: string;
  tenantId: string;
  contactName: string;
  contactEmail: string;
  // El DER lo tipa INT; en la UI se maneja como string para conservar
  // formato (prefijos, espacios) — es un mock de presentación.
  contactPhonenumber: string;
  contactRole: string;
  contactNotes: string | null;
};

// --- organizations (tenants) --------------------------------------------
export type Organization = {
  tenantId: string;
  name: string;
  regionId: string;
  active: boolean;
  // settings: JSONB "a definir" en el ADR — no se modela contenido todavía.
  settings: Record<string, never>;
};

export const organizations: Organization[] = [
  { tenantId: "org-banco-sur", name: "Banco Sur", regionId: "region-ar", active: true, settings: {} },
  { tenantId: "org-telco-norte", name: "Telco Norte", regionId: "region-ar", active: true, settings: {} },
  { tenantId: "org-salud-integral", name: "Salud Integral", regionId: "region-mx", active: true, settings: {} },
  { tenantId: "org-retail-andes", name: "Retail Andes", regionId: "region-cl", active: true, settings: {} },
  { tenantId: "org-cobranzas-plata", name: "Cobranzas del Plata", regionId: "region-ar", active: false, settings: {} },
  { tenantId: "org-seguros-delta", name: "Seguros Delta", regionId: "region-col", active: true, settings: {} },
  { tenantId: "org-logistica-pampa", name: "Logística Pampa", regionId: "region-custom", active: true, settings: {} },
  { tenantId: "org-energia-co", name: "EnergíaCo", regionId: "region-mx", active: false, settings: {} },
];

export const tenantContacts: TenantContact[] = [
  {
    id: "contact-1",
    tenantId: "org-banco-sur",
    contactName: "Lucía Fernández",
    contactEmail: "lucia.fernandez@bancosur.com",
    contactPhonenumber: "+54 11 4780-1200",
    contactRole: "Gerente de Contact Center",
    contactNotes: "Contacto comercial principal. Prefiere avisos con 48h.",
  },
  {
    id: "contact-2",
    tenantId: "org-banco-sur",
    contactName: "Martín Ibáñez",
    contactEmail: "martin.ibanez@bancosur.com",
    contactPhonenumber: "+54 11 4780-1233",
    contactRole: "Referente técnico",
    contactNotes: null,
  },
  {
    id: "contact-3",
    tenantId: "org-telco-norte",
    contactName: "Sofía Quiroga",
    contactEmail: "sofia.quiroga@telconorte.com.ar",
    contactPhonenumber: "+54 351 555-8090",
    contactRole: "Coordinadora de operaciones",
    contactNotes: "Ventana de mantenimiento fuera de horario pico.",
  },
  {
    id: "contact-4",
    tenantId: "org-salud-integral",
    contactName: "Diego Herrera",
    contactEmail: "diego.herrera@saludintegral.mx",
    contactPhonenumber: "+52 55 1234-5678",
    contactRole: "IT Manager",
    contactNotes: null,
  },
  {
    id: "contact-5",
    tenantId: "org-salud-integral",
    contactName: "Ana Robles",
    contactEmail: "ana.robles@saludintegral.mx",
    contactPhonenumber: "+52 55 1234-5690",
    contactRole: "Responsable de calidad",
    contactNotes: "Escalar incidencias de audio directamente a ella.",
  },
  {
    id: "contact-6",
    tenantId: "org-retail-andes",
    contactName: "Camila Soto",
    contactEmail: "camila.soto@retailandes.cl",
    contactPhonenumber: "+56 2 2987-4400",
    contactRole: "Jefa de servicio al cliente",
    contactNotes: null,
  },
  {
    id: "contact-7",
    tenantId: "org-cobranzas-plata",
    contactName: "Roberto Nieto",
    contactEmail: "roberto.nieto@cobranzasplata.com",
    contactPhonenumber: "+54 11 5231-7788",
    contactRole: "Dueño de la operación",
    contactNotes: "Cuenta desactivada por baja comercial en 2026-06.",
  },
  {
    id: "contact-8",
    tenantId: "org-seguros-delta",
    contactName: "Valentina Ríos",
    contactEmail: "valentina.rios@segurosdelta.co",
    contactPhonenumber: "+57 1 743-2200",
    contactRole: "Gerente de experiencia",
    contactNotes: null,
  },
  {
    id: "contact-9",
    tenantId: "org-logistica-pampa",
    contactName: "Federico Álvarez",
    contactEmail: "federico.alvarez@logisticapampa.com",
    contactPhonenumber: "+54 11 4000-9911",
    contactRole: "CTO",
    contactNotes: "Despliegue dedicado (CUSTOM). Coordinar cambios por email.",
  },
];

export function getOrganization(tenantId: string): Organization | undefined {
  return organizations.find((o) => o.tenantId === tenantId);
}

export function getTenantContacts(tenantId: string): TenantContact[] {
  return tenantContacts.filter((c) => c.tenantId === tenantId);
}

export function countTenantContacts(tenantId: string): number {
  return tenantContacts.reduce((n, c) => (c.tenantId === tenantId ? n + 1 : n), 0);
}

export function countTenantsByRegion(regionId: string): number {
  return organizations.reduce((n, o) => (o.regionId === regionId ? n + 1 : n), 0);
}

// --- billing_events ------------------------------------------------------
// El ADR-BD-001 deja type (ENUM) y content (JSONB) SIN DEFINIR (preguntas
// abiertas). La pantalla de Facturación es un placeholder "pendiente de
// desarrollo" (sin datos), así que no se modela ningún stub de eventos.

// --- identidad del técnico de soporte Mitrol -----------------------------
// El usuario logueado es un EMPLEADO de Mitrol (login LDAP Mitrol), no un
// usuario de tenant. Requisito explícito: avatar y nombre de soporte Mitrol.
// `name`/`initials` son dato (una persona); el rol es copy de interfaz y va por
// clave. `role` queda como fallback sin traducir para quien todavía lo lea.
export const mitrolSupportTech = {
  name: "Diego Ramírez",
  role: "Soporte Mitrol",
  roleKey: "admin.soporte.rol",
  initials: "DR",
};
