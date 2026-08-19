"use client";

import { BarChart3, History } from "lucide-react";
import { cn } from "@/lib/utils";
import { CANAL_ICON, colaMock, estadoAgenteMock, formatEspera, type DatasetId } from "@/lib/pad-mock/data";

export type Modo = "interaccion" | "estadisticas" | "historial";

// Mismo patrón visual que el sidenav REAL de Hermes (pad-console.tsx): bloque
// de estado arriba, ítems de navegación abajo, colapsa a solo íconos por
// debajo de sm (idéntico a como ya se comporta el pad). La cola (brief §3)
// ahora vive ACÁ, entre el estado y el resto de la navegación — no es una
// columna aparte — y cada fila es directamente la forma de abrir esa
// interacción, reemplazando la vieja solapa única "Llamada".
export function LeftNav({
  modo,
  onModo,
  interaccionActivaId,
  onSeleccionarInteraccion,
}: {
  modo: Modo;
  onModo: (m: Modo) => void;
  interaccionActivaId: string;
  onSeleccionarInteraccion: (id: string, datasetId: DatasetId) => void;
}) {
  return (
    <aside className="flex h-full w-14 shrink-0 flex-col gap-3 border-r border-sidebar-border bg-sidebar p-2 text-sidebar-foreground sm:w-60 sm:p-3">
      {/* Mi estado — mismo look que AgentStatusSelector real, sin la
          interactividad (acá no hay máquina de estados detrás). */}
      <div className="flex flex-col gap-1.5 border-b border-sidebar-border pb-3">
        <span className="px-1 text-xs font-medium text-muted-foreground max-sm:hidden">
          Mi estado
        </span>
        <div className="flex w-full items-center gap-2 rounded-lg border border-sidebar-border bg-sidebar px-3 py-2 max-sm:justify-center max-sm:px-0">
          <span className="size-2.5 shrink-0 rounded-full bg-success" />
          <span className="min-w-0 flex-1 truncate text-sm font-medium max-sm:hidden">
            {estadoAgenteMock.estado}
          </span>
          <span className="font-mono text-xs text-muted-foreground tabular-nums max-sm:hidden">
            {estadoAgenteMock.cronometro}
          </span>
        </div>
      </div>

      {/* Cola — brief §3: número de cliente + ícono de canal + cronómetro de
          espera, nada más. Cada fila abre esa interacción. */}
      <div className="flex min-h-0 flex-1 flex-col gap-1.5">
        <span className="px-1 text-xs font-medium text-muted-foreground max-sm:hidden">
          Cola
        </span>
        <div className="flex flex-1 flex-col gap-1 overflow-y-auto">
          {colaMock.map((f) => {
            const Icon = CANAL_ICON[f.canal];
            const activa = modo === "interaccion" && f.id === interaccionActivaId;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => onSeleccionarInteraccion(f.id, f.datasetId)}
                aria-current={activa ? "true" : undefined}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-2 py-2 text-left text-sm transition-colors max-sm:justify-center max-sm:px-0",
                  activa
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60"
                )}
              >
                <Icon className="size-4 shrink-0" />
                <span className="flex min-w-0 flex-1 flex-col max-sm:hidden">
                  <span className="truncate font-medium tabular-nums">{f.numeroCliente}</span>
                </span>
                <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground max-sm:hidden">
                  {formatEspera(f.esperaSeg)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Estadísticas / Historial del agente — puntos de navegación fijos,
          debajo de la cola. */}
      <div className="flex flex-col gap-1 border-t border-sidebar-border pt-2">
        <button
          type="button"
          onClick={() => onModo("estadisticas")}
          aria-current={modo === "estadisticas" ? "true" : undefined}
          className={cn(
            "flex h-11 w-full items-center gap-3 rounded-lg px-0 text-sm transition-colors sm:px-3 max-sm:justify-center",
            modo === "estadisticas"
              ? "bg-sidebar-accent text-sidebar-accent-foreground"
              : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60"
          )}
        >
          <BarChart3 className="size-4.5 shrink-0" />
          <span className="max-sm:hidden">Estadísticas</span>
        </button>
        <button
          type="button"
          onClick={() => onModo("historial")}
          aria-current={modo === "historial" ? "true" : undefined}
          className={cn(
            "flex h-11 w-full items-center gap-3 rounded-lg px-0 text-sm transition-colors sm:px-3 max-sm:justify-center",
            modo === "historial"
              ? "bg-sidebar-accent text-sidebar-accent-foreground"
              : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60"
          )}
        >
          <History className="size-4.5 shrink-0" />
          <span className="max-sm:hidden">Historial</span>
        </button>
      </div>
    </aside>
  );
}
