// Store de mock compartido entre pantallas, para los datos que se crean en una
// pantalla y se ven en otra (sin backend no hay otra forma de compartirlos).
// Se guarda en localStorage y avisa con un evento propio, mismo patrón que
// `use-locale.ts`. Lo usan mock-telefonia.ts y mock-claves-api.ts.

/**
 * Crea un store de mock compartido entre pantallas, listo para
 * `useSyncExternalStore`.
 *
 * El cache contra el string crudo no es opcional: `useSyncExternalStore` exige
 * que `read()` devuelva la MISMA referencia si nada cambió, y un `JSON.parse` a
 * secas crea un array nuevo en cada llamada y dispara un loop infinito.
 */
export function createMockStore<T>(key: string, seed: T) {
  const evento = `${key}-change`;
  let rawCache: string | null = null;
  let parsedCache: T = seed;

  const read = (): T => {
    if (typeof window === "undefined") return seed;
    const stored = window.localStorage.getItem(key);
    if (!stored) return seed;
    if (stored === rawCache) return parsedCache;
    try {
      parsedCache = JSON.parse(stored) as T;
      rawCache = stored;
      return parsedCache;
    } catch {
      return seed;
    }
  };

  const write = (next: T) => {
    window.localStorage.setItem(key, JSON.stringify(next));
    window.dispatchEvent(new Event(evento));
  };

  // "storage" cubre otra pestaña; el evento propio cubre esta misma.
  const subscribe = (callback: () => void) => {
    window.addEventListener(evento, callback);
    window.addEventListener("storage", callback);
    return () => {
      window.removeEventListener(evento, callback);
      window.removeEventListener("storage", callback);
    };
  };

  return { read, write, subscribe, serverSnapshot: () => seed };
}
