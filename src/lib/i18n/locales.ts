// Idiomas soportados por Atlas. El orden es el que se ve en el selector.
// No usamos banderas: Portugués no tiene una sola bandera obvia (PT/BR) y
// Catalán directamente no tiene emoji con soporte real de fuentes. En su lugar
// mostramos el código ISO en un chip, que es lo que hace cualquier producto
// multi-región serio.
export const LOCALES = ["es", "en", "pt", "ca"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "es";

export const LOCALE_META: Record<
  Locale,
  { code: string; label: string; endonym: string }
> = {
  // `label` es el nombre en el propio idioma (endónimo) — así el usuario que no
  // entiende la interfaz igual reconoce el suyo.
  es: { code: "ES", label: "Español", endonym: "Español" },
  en: { code: "EN", label: "English", endonym: "English" },
  pt: { code: "PT", label: "Português", endonym: "Português" },
  ca: { code: "CA", label: "Català", endonym: "Català" },
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}
