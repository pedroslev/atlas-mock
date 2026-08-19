"use client";

import { useState } from "react";
import { BarChart3, ExternalLink, History, LayoutGrid, MessageCircle, Plus, Zap } from "lucide-react";
import { Kbd } from "@/components/ui/kbd";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { QuickAccessDialog } from "@/components/pad-mock/quick-access-dialog";
import {
  accesosRapidosMock,
  CANAL_ICON,
  chatsInternosMock,
  colaMock,
  estadoAgenteMock,
  formatEspera,
  type DatasetId,
} from "@/lib/pad-mock/data";

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
  const [accesoAbierto, setAccesoAbierto] = useState<string | null>(null);
  const pagina = accesosRapidosMock.find((a) => a.id === accesoAbierto);

  return (
    <aside className="flex h-full w-12 shrink-0 flex-col gap-2 overflow-y-auto border-r border-sidebar-border bg-sidebar p-1.5 text-sidebar-foreground sm:w-44 sm:p-2">
      {/* Mi estado — mismo look que AgentStatusSelector real, sin la
          interactividad (acá no hay máquina de estados detrás). */}
      <div className="flex flex-col gap-1 border-b border-sidebar-border pb-2">
        <span className="px-1 text-[0.65rem] font-medium text-muted-foreground max-sm:hidden">
          Mi estado
        </span>
        <div className="flex w-full items-center gap-1.5 rounded-lg border border-sidebar-border bg-sidebar px-2 py-1.5 max-sm:justify-center max-sm:px-0">
          <span className="size-2 shrink-0 rounded-full bg-success" />
          <span className="min-w-0 flex-1 truncate text-xs font-medium max-sm:hidden">
            {estadoAgenteMock.estado}
          </span>
          <span className="font-mono text-[0.65rem] text-muted-foreground tabular-nums max-sm:hidden">
            {estadoAgenteMock.cronometro}
          </span>
        </div>
      </div>

      {/* Cola — brief §3: número de cliente + ícono de canal + cronómetro de
          espera, nada más. Cada fila abre esa interacción. Alt+N salta a la
          fila N (ver el listener global en pad-mock-shell.tsx). flex-1: es lo
          que se prioriza en el menú, el resto se acomoda alrededor. */}
      <div className="flex min-h-0 flex-1 flex-col gap-1">
        <span className="px-1 text-[0.65rem] font-medium text-muted-foreground max-sm:hidden">
          Cola
        </span>
        <div className="flex flex-col gap-0.5 overflow-y-auto">
          {colaMock.map((f, i) => {
            const Icon = CANAL_ICON[f.canal];
            const activa = modo === "interaccion" && f.id === interaccionActivaId;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => onSeleccionarInteraccion(f.id, f.datasetId)}
                aria-current={activa ? "true" : undefined}
                aria-keyshortcuts={`Alt+${i + 1}`}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-1.5 py-1.5 text-left text-xs transition-colors max-sm:justify-center max-sm:px-0",
                  activa
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60"
                )}
              >
                <Icon className="size-3.5 shrink-0" />
                <span className="flex min-w-0 flex-1 flex-col max-sm:hidden">
                  <span className="truncate font-medium tabular-nums">{f.numeroCliente}</span>
                </span>
                <span className="hidden shrink-0 font-mono text-[0.65rem] tabular-nums text-muted-foreground sm:inline">
                  {formatEspera(f.esperaSeg)}
                </span>
                <Kbd className="hidden shrink-0 sm:inline-flex">Alt {i + 1}</Kbd>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chats internos — de la mitad del menú para abajo, la cola tiene
          prioridad. Solo el listado; el alta ("+") todavía no está mockeada. */}
      <div className="flex shrink-0 flex-col gap-1 border-t border-sidebar-border pt-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-[0.65rem] font-medium text-muted-foreground max-sm:hidden">
            Chats internos
          </span>
          <button
            type="button"
            aria-label="Nuevo chat interno"
            title="Nuevo chat interno"
            className="flex size-5 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground max-sm:hidden"
          >
            <Plus className="size-3.5" />
          </button>
        </div>
        <div className="flex flex-col gap-0.5">
          {chatsInternosMock.map((c) => (
            <div
              key={c.id}
              className="flex items-center gap-1.5 rounded-lg px-1.5 py-1.5 text-xs text-sidebar-foreground/80 max-sm:justify-center max-sm:px-0"
            >
              <MessageCircle className="size-3.5 shrink-0" />
              <span className="min-w-0 flex-1 truncate max-sm:hidden">{c.nombre}</span>
              {c.noLeidos > 0 && (
                <Badge variant="default" className="hidden size-4 shrink-0 justify-center rounded-full p-0 sm:flex">
                  {c.noLeidos}
                </Badge>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Accesos rápidos ("shortcut buttons") — no pertenecen a ninguna
          interacción puntual, funcionan igual estando en cola vacía o en
          medio de una llamada. Mismo modo embebido/pestaña que las páginas
          externas de una interacción, pero se abren en un diálogo porque no
          tienen una interacción a la cual pertenecerle una solapa. */}
      <div className="flex shrink-0 flex-col gap-1 border-t border-sidebar-border pt-2">
        <span className="px-1 text-[0.65rem] font-medium text-muted-foreground max-sm:hidden">
          Accesos rápidos
        </span>
        <div className="flex flex-col gap-0.5">
          {accesosRapidosMock.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => setAccesoAbierto(a.id)}
              className="flex items-center gap-1.5 rounded-lg px-1.5 py-1.5 text-left text-xs text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent/60 max-sm:justify-center max-sm:px-0"
            >
              <Zap className="size-3.5 shrink-0" />
              <span className="min-w-0 flex-1 truncate max-sm:hidden">{a.nombre}</span>
              {a.modo === "pestana" ? (
                <ExternalLink className="hidden size-3 shrink-0 text-muted-foreground sm:inline" />
              ) : (
                <LayoutGrid className="hidden size-3 shrink-0 text-muted-foreground sm:inline" />
              )}
            </button>
          ))}
        </div>
      </div>

      {pagina && (
        <QuickAccessDialog
          pagina={pagina}
          open={accesoAbierto !== null}
          onOpenChange={(open) => setAccesoAbierto(open ? accesoAbierto : null)}
        />
      )}

      {/* Estadísticas / Historial del agente — siempre pegados al fondo del
          menú (mt-auto), sin importar cuánto ocupe la cola o los chats. */}
      <div className="mt-auto flex shrink-0 flex-col gap-0.5 border-t border-sidebar-border pt-1.5">
        <button
          type="button"
          onClick={() => onModo("estadisticas")}
          aria-current={modo === "estadisticas" ? "true" : undefined}
          className={cn(
            "flex h-8 w-full items-center gap-2 rounded-lg px-0 text-xs transition-colors sm:px-2 max-sm:justify-center",
            modo === "estadisticas"
              ? "bg-sidebar-accent text-sidebar-accent-foreground"
              : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60"
          )}
        >
          <BarChart3 className="size-4 shrink-0" />
          <span className="max-sm:hidden">Estadísticas</span>
        </button>
        <button
          type="button"
          onClick={() => onModo("historial")}
          aria-current={modo === "historial" ? "true" : undefined}
          className={cn(
            "flex h-8 w-full items-center gap-2 rounded-lg px-0 text-xs transition-colors sm:px-2 max-sm:justify-center",
            modo === "historial"
              ? "bg-sidebar-accent text-sidebar-accent-foreground"
              : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60"
          )}
        >
          <History className="size-4 shrink-0" />
          <span className="max-sm:hidden">Historial</span>
        </button>
      </div>
    </aside>
  );
}
