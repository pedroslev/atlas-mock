"use client";

import { useEffect, useState } from "react";
import { LeftNav, type Modo } from "@/components/pad-mock/left-nav";
import { CenterColumn } from "@/components/pad-mock/center-column";
import { ContextColumn } from "@/components/pad-mock/context-column";
import { StatsPanel } from "@/components/pad-mock/stats-panel";
import { AgentHistoryPanel } from "@/components/pad-mock/agent-history-panel";
import {
  clienteA,
  clienteB,
  colaMock,
  copilotoArticulo,
  historialPorCliente,
  tipificacionesA,
  tipificacionesB,
  type DatasetId,
} from "@/lib/pad-mock/data";

const DATASETS = {
  A: {
    variant: "llamada" as const,
    cliente: clienteA,
    tipificaciones: tipificacionesA,
    articulo: undefined,
    seccionesAbiertasInit: ["cliente", "historial"] as const,
  },
  B: {
    variant: "chat" as const,
    cliente: clienteB,
    tipificaciones: tipificacionesB,
    articulo: copilotoArticulo,
    seccionesAbiertasInit: ["copiloto"] as const,
  },
};

// Brief §2 — layout de tres columnas: menú izquierdo (con la cola integrada,
// ver LeftNav), centro (nunca colapsa) y contexto (colapsa a íconos). El
// menú izquierdo y el navbar los pone PadHeader/layout.tsx, reales de Hermes
// — acá solo arma lo que cambia según qué esté seleccionado en la cola.
export function PadMockShell() {
  const primera = colaMock[0];
  const [modo, setModo] = useState<Modo>("interaccion");
  const [interaccionActivaId, setInteraccionActivaId] = useState(primera.id);
  const [datasetId, setDatasetId] = useState<DatasetId>(primera.datasetId);
  const [contextoColapsada, setContextoColapsada] = useState(false);

  function seleccionarInteraccion(id: string, ds: DatasetId) {
    setInteraccionActivaId(id);
    setDatasetId(ds);
    setModo("interaccion");
  }

  // Alt+1, Alt+2… salta directo a esa fila de la cola — Alt y no Ctrl/Cmd
  // porque Ctrl/Cmd+número ya lo usan Chrome/Firefox para cambiar de pestaña
  // del navegador. Funciona en cualquier modo (también sirve para volver a
  // una interacción desde Estadísticas/Historial).
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!e.altKey || e.ctrlKey || e.metaKey || e.shiftKey || e.repeat) return;
      const el = e.target as HTMLElement | null;
      if (
        el &&
        (el.isContentEditable ||
          el.tagName === "INPUT" ||
          el.tagName === "TEXTAREA" ||
          el.tagName === "SELECT")
      ) {
        return;
      }
      const idx = Number(e.key) - 1;
      if (Number.isNaN(idx) || idx < 0 || idx >= colaMock.length) return;
      e.preventDefault();
      const fila = colaMock[idx];
      seleccionarInteraccion(fila.id, fila.datasetId);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const cfg = DATASETS[datasetId];

  return (
    <div className="flex h-full min-h-0 flex-1">
      <LeftNav
        modo={modo}
        onModo={setModo}
        interaccionActivaId={interaccionActivaId}
        onSeleccionarInteraccion={seleccionarInteraccion}
      />

      {modo === "estadisticas" && <StatsPanel />}
      {modo === "historial" && <AgentHistoryPanel />}
      {modo === "interaccion" && (
        <>
          <CenterColumn
            key={`centro-${interaccionActivaId}`}
            variant={cfg.variant}
            tipificaciones={cfg.tipificaciones}
          />
          <ContextColumn
            key={`contexto-${interaccionActivaId}`}
            colapsada={contextoColapsada}
            onToggle={() => setContextoColapsada((v) => !v)}
            cliente={cfg.cliente}
            historial={historialPorCliente[cfg.cliente.numeroCliente] ?? []}
            articulo={cfg.articulo}
            seccionesAbiertasInit={[...cfg.seccionesAbiertasInit]}
          />
        </>
      )}
    </div>
  );
}
