// Rutas de las conexiones del lienzo, fuera del estado de React. Cada conexión se suscribe a la
// suya (useSyncExternalStore) y solo se vuelve a dibujar cuando su ruta cambia (las que se
// conservan mantienen la misma referencia): mover un nodo no re-renderiza el editor entero.

import type { Point } from "./edge-routing";

export type RoutesStore = {
  get: (id: string) => Point[] | undefined;
  all: () => Map<string, Point[]>;
  isReturn: (id: string) => boolean;
  setRoutes: (routes: Map<string, Point[]>) => void;
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
    all: () => routes,
    isReturn: (id) => returns.has(id),
    setRoutes: (next) => {
      routes = next;
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
