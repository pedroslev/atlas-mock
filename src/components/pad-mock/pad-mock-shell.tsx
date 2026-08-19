"use client";

import { useState } from "react";
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
          <CenterColumn key={datasetId} variant={cfg.variant} />
          <ContextColumn
            key={datasetId}
            colapsada={contextoColapsada}
            onToggle={() => setContextoColapsada((v) => !v)}
            cliente={cfg.cliente}
            historial={historialPorCliente[cfg.cliente.numeroCliente] ?? []}
            tipificaciones={cfg.tipificaciones}
            articulo={cfg.articulo}
            seccionesAbiertasInit={[...cfg.seccionesAbiertasInit]}
          />
        </>
      )}
    </div>
  );
}
