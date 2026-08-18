"use client";

import { useState } from "react";
import { StatusBar } from "@/components/pad-mock/status-bar";
import { QueueColumn } from "@/components/pad-mock/queue-column";
import { CenterColumn } from "@/components/pad-mock/center-column";
import { ContextColumn } from "@/components/pad-mock/context-column";
import {
  clienteA,
  clienteB,
  colaMock,
  colaMockChatActivo,
  copilotoArticulo,
  historialPorCliente,
  tipificacionesA,
  tipificacionesB,
} from "@/lib/pad-mock/data";

export type Escenario = "A" | "B" | "C";

const CONFIG: Record<
  Escenario,
  {
    variant: "llamada" | "chat";
    cola: typeof colaMock;
    cliente: typeof clienteA;
    tipificaciones: typeof tipificacionesA;
    articulo?: typeof copilotoArticulo;
    seccionesAbiertasInit: ("cliente" | "historial" | "copiloto" | "tipificacion" | "notas")[];
    colaColapsadaInit: boolean;
    contextoColapsadaInit: boolean;
    tabInicial: string;
  }
> = {
  A: {
    variant: "llamada",
    cola: colaMock,
    cliente: clienteA,
    tipificaciones: tipificacionesA,
    seccionesAbiertasInit: ["cliente", "historial"],
    colaColapsadaInit: false,
    contextoColapsadaInit: false,
    tabInicial: "conversacion",
  },
  B: {
    variant: "chat",
    cola: colaMockChatActivo,
    cliente: clienteB,
    tipificaciones: tipificacionesB,
    articulo: copilotoArticulo,
    seccionesAbiertasInit: ["copiloto"],
    colaColapsadaInit: false,
    contextoColapsadaInit: false,
    tabInicial: "conversacion",
  },
  C: {
    variant: "chat",
    cola: colaMockChatActivo,
    cliente: clienteB,
    tipificaciones: tipificacionesB,
    articulo: copilotoArticulo,
    seccionesAbiertasInit: ["copiloto"],
    colaColapsadaInit: true,
    contextoColapsadaInit: true,
    tabInicial: "ext-tickets",
  },
};

// Brief §2 — layout base de tres columnas + barra de estado arriba. El centro
// nunca colapsa; cola y contexto sí, y ese colapso es lo que sostiene el
// escenario C (monitor chico, 1366px — ver PadMockPage).
export function PadMockShell({ escenario }: { escenario: Escenario }) {
  const cfg = CONFIG[escenario];
  const [colaColapsada, setColaColapsada] = useState(cfg.colaColapsadaInit);
  const [contextoColapsada, setContextoColapsada] = useState(cfg.contextoColapsadaInit);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <StatusBar enLlamada={cfg.variant === "llamada"} />
      <div className="flex min-h-0 flex-1">
        <QueueColumn
          filas={cfg.cola}
          colapsada={colaColapsada}
          onToggle={() => setColaColapsada((v) => !v)}
        />
        <CenterColumn variant={cfg.variant} tabInicial={cfg.tabInicial} />
        <ContextColumn
          colapsada={contextoColapsada}
          onToggle={() => setContextoColapsada((v) => !v)}
          cliente={cfg.cliente}
          historial={historialPorCliente[cfg.cliente.numeroCliente] ?? []}
          tipificaciones={cfg.tipificaciones}
          articulo={cfg.articulo}
          seccionesAbiertasInit={cfg.seccionesAbiertasInit}
        />
      </div>
    </div>
  );
}
