"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { campanias as campaniasIniciales, type Campania } from "@/lib/mock-data";

// Las campañas viven en memoria mientras dura la sesión del navegador, para
// poder recorrer el flujo completo: eliminar las campañas de un proyecto y ver
// cómo se habilita el botón de eliminarlo. No hay persistencia — al recargar
// vuelve el set original (ver PRODUCT.md).

type CampaniasContextValue = {
  campanias: Campania[];
  eliminar: (id: string) => void;
  contarPorProyecto: (proyectoId: string) => number;
};

const CampaniasContext = createContext<CampaniasContextValue | null>(null);

export function CampaniasProvider({ children }: { children: React.ReactNode }) {
  const [lista, setLista] = useState<Campania[]>(campaniasIniciales);

  const eliminar = useCallback((id: string) => {
    setLista((cur) => cur.filter((c) => c.id !== id));
  }, []);

  const contarPorProyecto = useCallback(
    (proyectoId: string) => lista.filter((c) => c.proyectoId === proyectoId).length,
    [lista]
  );

  const value = useMemo(
    () => ({ campanias: lista, eliminar, contarPorProyecto }),
    [lista, eliminar, contarPorProyecto]
  );

  return (
    <CampaniasContext.Provider value={value}>
      {children}
    </CampaniasContext.Provider>
  );
}

export function useCampanias(): CampaniasContextValue {
  const ctx = useContext(CampaniasContext);
  if (!ctx) {
    throw new Error("useCampanias tiene que usarse dentro de CampaniasProvider");
  }
  return ctx;
}
