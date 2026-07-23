"use client";

import { Check, ChevronsUpDown, Lock } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Kbd } from "@/components/ui/kbd";
import { cn } from "@/lib/utils";
import { estadosAuxiliares } from "@/lib/mock-data";
import { getAuxIcon } from "@/lib/aux-icons";
import {
  STATUS_META,
  PAD_SHORTCUTS,
  PAD_SHORTCUT_LABEL_KEYS,
  shortcutLabel,
  formatDuration,
  type AgentStatus,
  type EstadoPrincipal,
} from "@/lib/mock-pad";
import { usePad, useNow, useIsMac } from "@/components/pad/pad-state";
import { resolveStatus, StatusDot } from "@/components/pad/status-display";
import { useT } from "@/lib/i18n";

const PRINCIPALES: EstadoPrincipal[] = ["available", "not-available", "unstaffed"];

function sameStatus(a: AgentStatus, b: AgentStatus): boolean {
  if (a.kind !== b.kind) return false;
  if (a.kind === "aux" && b.kind === "aux") return a.auxId === b.auxId;
  return true;
}

// Selector de estado del agente, ahora ALOJADO EN EL SIDENAV del pad (feedback:
// "el coso de estado bajalo al sidenav"). Estilado con tokens de sidebar para
// asentar sobre la superficie `bg-sidebar`. La apertura del popover es
// controlada por el estado del pad para que el atajo de teclado (S) pueda
// abrirlo sin foco previo.
export function AgentStatusSelector() {
  const {
    effectiveStatus,
    chosenStatus,
    locked,
    statusSince,
    setChosenStatus,
    statusMenuOpen,
    setStatusMenuOpen,
  } = usePad();
  const t = useT();
  const isMac = useIsMac();
  const now = useNow(true);
  const elapsed = Math.max(0, Math.floor((now - statusSince) / 1000));

  const resolved = resolveStatus(effectiveStatus, t);
  const Icon = resolved.icon;

  // Estado forzado por la llamada: selector bloqueado, read-only con candado.
  if (locked) {
    return (
      <div
        className="flex w-full items-center gap-2 rounded-lg border border-sidebar-border bg-sidebar-accent/50 px-3 py-2 text-sidebar-foreground"
        aria-label={t("pad.estado.forzadoAria", { estado: resolved.label })}
      >
        <Icon className="size-4 shrink-0 text-muted-foreground" />
        <span className="min-w-0 flex-1 truncate text-sm font-medium">
          {resolved.label}
        </span>
        <span className="font-mono text-xs text-muted-foreground tabular-nums">
          {formatDuration(elapsed)}
        </span>
        <Lock className="size-3.5 shrink-0 text-muted-foreground" />
      </div>
    );
  }

  return (
    <Popover open={statusMenuOpen} onOpenChange={setStatusMenuOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={t("pad.estado.selectorAria", {
            estado: resolved.label,
            accion: t(PAD_SHORTCUT_LABEL_KEYS.status),
          })}
          aria-keyshortcuts={shortcutLabel(PAD_SHORTCUTS.status, isMac)}
          className="flex w-full items-center gap-2 rounded-lg border border-sidebar-border bg-sidebar px-3 py-2 text-sidebar-foreground transition-colors hover:bg-sidebar-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar"
        >
          <StatusDot status={effectiveStatus} />
          <span className="min-w-0 flex-1 truncate text-left text-sm font-medium">
            {resolved.label}
          </span>
          <span className="font-mono text-xs text-muted-foreground tabular-nums">
            {formatDuration(elapsed)}
          </span>
          <Kbd className="max-sm:hidden">{shortcutLabel(PAD_SHORTCUTS.status, isMac)}</Kbd>
          <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      {/* Hint del atajo "Cambiar estado" (feedback: vive acá, junto al estado, no
          en la leyenda del panel de llamada). */}
      <PopoverContent align="start" side="bottom" className="w-72 p-0">
        <Command>
          <CommandInput placeholder={t("pad.estado.buscarPlaceholder")} />
          <CommandList>
            <CommandEmpty>{t("pad.estado.sinResultados")}</CommandEmpty>
            <CommandGroup heading={t("pad.estado.principales")}>
              {PRINCIPALES.map((kind) => {
                const meta = STATUS_META[kind];
                const label = t(meta.labelKey);
                const status: AgentStatus = { kind };
                const active = sameStatus(chosenStatus, status);
                const MetaIcon = meta.icon;
                return (
                  <CommandItem
                    key={kind}
                    value={label}
                    onSelect={() => {
                      setChosenStatus(status);
                      setStatusMenuOpen(false);
                    }}
                  >
                    <Check className={cn(active ? "opacity-100" : "opacity-0")} />
                    <span className={cn("size-2.5 shrink-0 rounded-full", meta.dot)} aria-hidden />
                    <MetaIcon className="size-4 text-muted-foreground" />
                    {label}
                  </CommandItem>
                );
              })}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading={t("pad.estado.auxiliares")}>
              {estadosAuxiliares.map((aux) => {
                const status: AgentStatus = { kind: "aux", auxId: aux.id };
                const active = sameStatus(chosenStatus, status);
                const AuxIcon = getAuxIcon(aux.icono);
                return (
                  <CommandItem
                    key={aux.id}
                    value={aux.nombre}
                    onSelect={() => {
                      setChosenStatus(status);
                      setStatusMenuOpen(false);
                    }}
                  >
                    <Check className={cn(active ? "opacity-100" : "opacity-0")} />
                    <span
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: aux.color }}
                      aria-hidden
                    />
                    <AuxIcon className="size-4" style={{ color: aux.color }} />
                    {aux.nombre}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
