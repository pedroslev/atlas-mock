"use client";

import { useCallback, useSyncExternalStore } from "react";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/lib/i18n/locales";

// El idioma elegido vive en localStorage (mock: no hay backend ni cookie de
// sesión). Se lee con useSyncExternalStore para que el snapshot de SERVER y el
// primer render del cliente coincidan (DEFAULT_LOCALE) y no haya hydration
// mismatch — el mismo problema que ya nos rompió la tabla en dark mode.
const STORAGE_KEY = "atlas-locale";
const LOCALE_EVENT = "atlas-locale-change";

function subscribe(callback: () => void) {
  // `storage` cubre otras pestañas; el evento propio, esta misma pestaña.
  window.addEventListener(LOCALE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(LOCALE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function getSnapshot(): Locale {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return isLocale(stored) ? stored : DEFAULT_LOCALE;
}

function getServerSnapshot(): Locale {
  return DEFAULT_LOCALE;
}

export function useLocale(): {
  locale: Locale;
  setLocale: (locale: Locale) => void;
} {
  const locale = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setLocale = useCallback((next: Locale) => {
    window.localStorage.setItem(STORAGE_KEY, next);
    window.dispatchEvent(new Event(LOCALE_EVENT));
  }, []);

  return { locale, setLocale };
}
