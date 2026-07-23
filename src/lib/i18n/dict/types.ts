import type { Locale } from "@/lib/i18n/locales";

// Un diccionario por PANTALLA/ÁREA. Cada archivo de `dict/` exporta uno, con
// claves cortas (sin prefijo): el prefijo lo pone el registro en dictionary.ts.
// Partirlo por área evita que varias pantallas peleen por el mismo archivo.
export type NamespaceDict = Record<Locale, Record<string, string>>;
