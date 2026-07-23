"use client";

import { useCallback } from "react";
import { translate } from "@/lib/i18n/dictionary";
import { useLocale } from "@/lib/i18n/use-locale";

export { useLocale } from "@/lib/i18n/use-locale";
export {
  LOCALES,
  LOCALE_META,
  DEFAULT_LOCALE,
  isLocale,
  type Locale,
} from "@/lib/i18n/locales";

export type TranslateFn = (
  key: string,
  vars?: Record<string, string | number>
) => string;

/**
 * Hook de traducción para componentes de cliente.
 *
 *   const t = useT();
 *   <h1>{t("campanias.titulo")}</h1>
 *   <p>{t("campanias.total", { n: 12 })}</p>
 */
export function useT(): TranslateFn {
  const { locale } = useLocale();
  return useCallback(
    (key: string, vars?: Record<string, string | number>) =>
      translate(locale, key, vars),
    [locale]
  );
}

/**
 * Versión componente, para usar DENTRO de un Server Component sin tener que
 * convertirlo en cliente (un leaf de cliente dentro de un árbol de server es
 * válido). Para props que exigen `string` (placeholder, aria-label) hay que
 * usar `useT()` en un componente de cliente.
 *
 *   <T k="marcas.detalle.titulo" />
 */
export function T({
  k,
  vars,
}: {
  k: string;
  vars?: Record<string, string | number>;
}) {
  const t = useT();
  return <>{t(k, vars)}</>;
}
