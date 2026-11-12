// Rutas de las conexiones del lienzo, fuera del estado de React. Cada conexión se suscribe a la
// suya (useSyncExternalStore) y solo se vuelve a dibujar cuando su ruta cambia: mientras se
// arrastra un nodo, cambian las rutas de sus conexiones y nada más, en vez de re-renderizar el
// editor entero en cada movimiento del mouse.

import type { Point } from "./edge-routing";

export type RoutesStore = {
  get: (id: string) => Point[] | undefined;
  isReturn: (id: string) => boolean;
  // Con `merge`, conserva las rutas que no vienen en `routes` (las de un arrastre parcial).
  setRoutes: (routes: Map<string, Point[]>, merge: boolean) => void;
  setReturns: (ids: Set<string>) => void;
  subscribe: (listener: () => void) => () => void;
};

export function createRoutesStore(): RoutesStore {
  let routes = new Map<string, Point[]>();
  let returns = new Set<string>();
  const listeners = new Set<() => void>();
  const notify = () => listeners.forEach((l) => l());
  return {
    get: (id) => routes.get(id),
    isReturn: (id) => returns.has(id),
    setRoutes: (next, merge) => {
      routes = merge ? new Map([...routes, ...next]) : next;
      notify();
    },
    setReturns: (ids) => {
      returns = ids;
      notify();
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
