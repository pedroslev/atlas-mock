"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, Lock } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";
import { estadosAgenteDisponibles, type EstadoForzado } from "@/lib/pad-mock/data";
import { useNow, formatDuration } from "@/lib/pad-mock/use-now";

// Selector de estado del agente — a pedido, tiene que dejar elegir entre
// Principales (Disponible/No disponible/Ausente) y Auxiliares (Almuerzo,
// Capacitación, Descanso). Antes era un bloque de solo lectura; ahora abre
// un Command/Popover, mismo patrón que el selector real (agent-status-selector.tsx).
//
// Controlado desde pad-mock-shell.tsx (estadoId/onEstadoIdChange/cronometro)
// — a pedido, la pantalla de "sin interacciones" necesita leer y cambiar el
// mismo estado que este selector, así que ya no puede vivir solo acá adentro.
export function AgentStatusSelectorMock({
  colapsado,
  estadoId,
  onEstadoIdChange,
  cronometro,
  estadoSistema,
}: {
  colapsado: boolean;
  estadoId: string;
  onEstadoIdChange: (id: string) => void;
  cronometro: string;
  /** Estado forzado por la interacción (ADR-BD-004: Conectando, En llamada,
   *  Trabajo pos-llamada, En llamada interna): se muestra en lugar del elegido,
   *  bloqueado con candado, y el cronómetro cuenta desde `desde`. */
  estadoSistema?: EstadoForzado & { desde?: number };
}) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const now = useNow(!!estadoSistema);
  const estado = estadosAgenteDisponibles.find((e) => e.id === estadoId) ?? estadosAgenteDisponibles[0];
  const Icon = estado.icon;
  const principales = estadosAgenteDisponibles.filter((e) => e.grupo === "principal");
  const auxiliares = estadosAgenteDisponibles.filter((e) => e.grupo === "auxiliar");

  if (estadoSistema) {
    const IconForzado = estadoSistema.icon;
    const cronometroForzado =
      estadoSistema.desde !== undefined
        ? formatDuration(Math.max(0, Math.floor((now - estadoSistema.desde) / 1000)))
        : null;
    return colapsado ? (
      <span title={estadoSistema.nombre} className="mx-auto flex size-8 items-center justify-center">
        <span className={cn("size-2.5 rounded-full", estadoSistema.dotClass)} />
      </span>
    ) : (
      // Variante bloqueada: el estado lo impone la interacción, no se abre el
      // Popover. Candado al final, mismo patrón que hermes-front.
      <div
        className="flex w-full items-center gap-1.5 rounded-lg border border-sidebar-border bg-sidebar-accent/50 px-2 py-1.5"
        aria-label={t("padMock.agentStatus.forzadoAria", { estado: estadoSistema.nombre })}
      >
        <IconForzado className="size-3.5 shrink-0 text-muted-foreground" />
        <span className="min-w-0 flex-1 truncate text-left text-xs font-medium">{estadoSistema.nombre}</span>
        {cronometroForzado && (
          <span className="shrink-0 font-mono text-[0.65rem] text-muted-foreground tabular-nums">{cronometroForzado}</span>
        )}
        <Lock className="size-3 shrink-0 text-muted-foreground" />
      </div>
    );
  }

  const lista = (
    <Command>
      <CommandList>
        <CommandGroup heading={t("padMock.agentStatus.principales")}>
          {principales.map((e) => (
            <CommandItem
              key={e.id}
              value={e.nombre}
              onSelect={() => {
                onEstadoIdChange(e.id);
                setOpen(false);
              }}
            >
              <Check className={cn(estadoId === e.id ? "opacity-100" : "opacity-0")} />
              <span className={cn("size-2.5 shrink-0 rounded-full", e.dotClass)} aria-hidden />
              <e.icon className="size-4 text-muted-foreground" />
              {e.nombre}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading={t("padMock.agentStatus.auxiliares")}>
          {auxiliares.map((e) => (
            <CommandItem
              key={e.id}
              value={e.nombre}
              onSelect={() => {
                onEstadoIdChange(e.id);
                setOpen(false);
              }}
            >
              <Check className={cn(estadoId === e.id ? "opacity-100" : "opacity-0")} />
              <span className={cn("size-2.5 shrink-0 rounded-full", e.dotClass)} aria-hidden />
              <e.icon className="size-4 text-muted-foreground" />
              {e.nombre}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );

  if (colapsado) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            title={estado.nombre}
            className="mx-auto flex size-8 items-center justify-center rounded-lg hover:bg-sidebar-accent"
          >
            <span className={cn("size-2.5 rounded-full", estado.dotClass)} />
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" side="right" className="w-56 p-0">
          {lista}
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-expanded={open}
          className="flex w-full items-center gap-1.5 rounded-lg border border-sidebar-border bg-sidebar px-2 py-1.5 hover:bg-sidebar-accent"
        >
          <Icon className="size-3.5 shrink-0 text-muted-foreground" />
          <span className="min-w-0 flex-1 truncate text-left text-xs font-medium">{estado.nombre}</span>
          <span className="shrink-0 font-mono text-[0.65rem] text-muted-foreground tabular-nums">
            {cronometro}
          </span>
          <ChevronsUpDown className="size-3 shrink-0 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-56 p-0">
        {lista}
      </PopoverContent>
    </Popover>
  );
}
