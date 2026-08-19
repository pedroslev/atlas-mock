"use client";

import { useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Mic,
  MicOff,
  Pause,
  Play,
  PhoneOff,
  Bookmark,
  PhoneForwarded,
  Check,
  CircleX,
  ChevronsUpDown,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { Kbd } from "@/components/ui/kbd";
import { cn } from "@/lib/utils";
import { marcasEjemplo, destinosTransferencia, type Tipificacion } from "@/lib/pad-mock/data";
import { useIsMac } from "@/lib/pad-mock/use-is-mac";
import { useNow, formatDuration } from "@/lib/pad-mock/use-now";
import { OpenQuestion } from "@/components/pad-mock/open-question";

type ActionTone = "success" | "destructive" | "neutral" | "active";

const TONE_CLASS: Record<ActionTone, string> = {
  success: "bg-success text-white hover:bg-success/90",
  destructive: "bg-destructive text-white hover:bg-destructive/90",
  neutral: "bg-muted text-foreground hover:bg-muted/60 border border-border",
  active: "bg-warning text-white hover:bg-warning/90",
};

const SHORTCUTS = {
  espera: "H",
  silenciar: "M",
  marcar: "B",
  transferir: "T",
  cerrar: "E",
} as const;

function shortcutLabel(key: string, isMac: boolean): string {
  return isMac ? `⌘${key}` : `Ctrl ${key}`;
}

// Botones más chicos que la primera versión (a pedido) — size-9 en vez de
// size-12, sin perder el mismo lenguaje visual (tono por color, atajo debajo).
function ControlButton({
  icon: Icon,
  label,
  shortcut,
  tone,
  onClick,
  pressed,
}: {
  icon: LucideIcon;
  label: string;
  shortcut: string;
  tone: ActionTone;
  onClick?: () => void;
  pressed?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <button
        type="button"
        onClick={onClick}
        aria-label={label}
        aria-keyshortcuts={shortcut}
        aria-pressed={pressed}
        className={cn(
          "flex size-9 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          TONE_CLASS[tone]
        )}
      >
        <Icon className="size-4" />
      </button>
      <span className="flex items-center gap-1 text-[0.65rem] text-muted-foreground">
        <Kbd className="h-4 min-w-4 px-0.5 text-[0.6rem]">{shortcut}</Kbd>
        {label}
      </span>
    </div>
  );
}

// Combobox con buscador para tipificación — mismo patrón que EntityCombobox
// de Olimpo. Vive acá ahora (antes en el acordeón de contexto, a pedido).
function TipificacionSelector({
  tipificaciones,
  value,
  onChange,
}: {
  tipificaciones: Tipificacion[];
  value: string | undefined;
  onChange: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const seleccionada = tipificaciones.find((t) => t.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          size="sm"
          className="w-full min-w-0 justify-between font-normal"
        >
          <span className="flex min-w-0 flex-1 items-center gap-1.5 truncate">
            <span className="truncate">{seleccionada?.nombre ?? "Elegir tipificación…"}</span>
            {seleccionada?.sugerida && (
              <Badge variant="info" className="shrink-0 gap-1">
                <Sparkles className="size-2.5" />
                Sugerida
              </Badge>
            )}
          </span>
          <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar tipificación…" />
          <CommandList>
            <CommandEmpty>Sin resultados.</CommandEmpty>
            <CommandGroup>
              {tipificaciones.map((t) => (
                <CommandItem
                  key={t.id}
                  value={t.nombre}
                  onSelect={() => {
                    onChange(t.id);
                    setOpen(false);
                  }}
                >
                  <Check className={cn(value === t.id ? "opacity-100" : "opacity-0")} />
                  <span className="flex-1">{t.nombre}</span>
                  {t.sugerida && (
                    <Badge variant="info" className="shrink-0 gap-1">
                      <Sparkles className="size-2.5" />
                      Sugerida
                    </Badge>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// Barra de controles de la interacción activa — vive en CenterColumn, FUERA
// del Tabs, para quedar visible sin importar qué solapa esté mirando el
// agente (conversación o una integración). Cronómetro: cuenta el tiempo
// total de la interacción salvo que esté en Espera, en cuyo caso cambia a
// ámbar y pasa a contar cuánto lleva EN espera (se reinicia si se retoma y
// se vuelve a poner en espera). "Cerrar interacción" reemplaza a
// Colgar/Finalizar — mismo botón para los dos canales, pensado para
// clickearse después de elegir la tipificación de arriba.
export function InteractionControls({
  variant,
  tipificaciones,
}: {
  variant: "llamada" | "chat";
  tipificaciones: Tipificacion[];
}) {
  const isMac = useIsMac();
  const [startedAt] = useState(() => Date.now());
  const [enEspera, setEnEsperaRaw] = useState(false);
  const [holdStartedAt, setHoldStartedAt] = useState<number | null>(null);
  const now = useNow(true);
  const elapsedTotal = Math.max(0, Math.floor((now - startedAt) / 1000));
  const elapsedHold = holdStartedAt ? Math.max(0, Math.floor((now - holdStartedAt) / 1000)) : 0;

  function setEnEspera(next: boolean) {
    setEnEsperaRaw(next);
    setHoldStartedAt(next ? Date.now() : null);
  }

  const [silenciado, setSilenciado] = useState(false);
  const [marcas, setMarcas] = useState<string[]>([]);
  const [marcarAbierto, setMarcarAbierto] = useState(false);
  const [transferido, setTransferido] = useState<string | null>(null);
  const [transferirAbierto, setTransferirAbierto] = useState(false);
  const [tipSeleccionada, setTipSeleccionada] = useState(
    tipificaciones.find((t) => t.sugerida)?.id ?? tipificaciones[0]?.id
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const mod = e.ctrlKey || e.metaKey;
      if (!mod || e.altKey || e.shiftKey || e.repeat) return;
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
      const key = e.key.toLowerCase();
      switch (key) {
        case SHORTCUTS.espera.toLowerCase():
          e.preventDefault();
          setEnEspera(!enEspera);
          break;
        case SHORTCUTS.silenciar.toLowerCase():
          if (variant === "llamada") {
            e.preventDefault();
            setSilenciado((v) => !v);
          }
          break;
        case SHORTCUTS.marcar.toLowerCase():
          e.preventDefault();
          setMarcarAbierto(true);
          break;
        case SHORTCUTS.transferir.toLowerCase():
          e.preventDefault();
          setTransferirAbierto(true);
          break;
        case SHORTCUTS.cerrar.toLowerCase():
          e.preventDefault();
          break;
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [variant, enEspera]);

  return (
    <div className="flex shrink-0 flex-col gap-2 border-t border-border p-2.5">
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "font-mono text-sm font-semibold tabular-nums",
            enEspera ? "text-warning" : "text-foreground"
          )}
        >
          {formatDuration(enEspera ? elapsedHold : elapsedTotal)}
        </span>
        {enEspera && (
          <Badge variant="warning" className="gap-1">
            <Pause className="size-2.5" />
            En espera
          </Badge>
        )}
        {marcas.map((m, i) => (
          <Badge key={`${m}-${i}`} variant="neutral" className="gap-1">
            <Bookmark className="size-2.5" />
            {m}
          </Badge>
        ))}
        {transferido && (
          <Badge variant="info" className="gap-1">
            <PhoneForwarded className="size-2.5" />
            Transferida a {transferido}
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-2">
        <span className="shrink-0 text-xs text-muted-foreground">Tipificación</span>
        <TipificacionSelector
          tipificaciones={tipificaciones}
          value={tipSeleccionada}
          onChange={setTipSeleccionada}
        />
        <OpenQuestion className="hidden flex-1 sm:flex">
          cómo se guarda una tipificación sugerida por el copiloto vs. una cargada a mano.
        </OpenQuestion>
      </div>

      <div className="flex items-center justify-center gap-4">
        <ControlButton
          icon={enEspera ? Play : Pause}
          label={enEspera ? "Retomar" : "Espera"}
          shortcut={shortcutLabel(SHORTCUTS.espera, isMac)}
          tone={enEspera ? "active" : "neutral"}
          pressed={enEspera}
          onClick={() => setEnEspera(!enEspera)}
        />
        {variant === "llamada" && (
          <ControlButton
            icon={silenciado ? MicOff : Mic}
            label={silenciado ? "Reactivar" : "Silenciar"}
            shortcut={shortcutLabel(SHORTCUTS.silenciar, isMac)}
            tone={silenciado ? "active" : "neutral"}
            pressed={silenciado}
            onClick={() => setSilenciado((v) => !v)}
          />
        )}

        <Popover open={marcarAbierto} onOpenChange={setMarcarAbierto}>
          <PopoverTrigger asChild>
            <div>
              <ControlButton
                icon={Bookmark}
                label="Marcar"
                shortcut={shortcutLabel(SHORTCUTS.marcar, isMac)}
                tone="neutral"
                onClick={() => setMarcarAbierto(true)}
              />
            </div>
          </PopoverTrigger>
          <PopoverContent align="center" className="w-56 p-1.5">
            <p className="px-1.5 py-1 text-xs font-medium text-muted-foreground">
              Marcar esta interacción
            </p>
            {marcasEjemplo.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMarcas((cur) => [...cur, m]);
                  setMarcarAbierto(false);
                }}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground"
              >
                <Bookmark className="size-3.5 text-muted-foreground" />
                {m}
              </button>
            ))}
          </PopoverContent>
        </Popover>

        <Popover open={transferirAbierto} onOpenChange={setTransferirAbierto}>
          <PopoverTrigger asChild>
            <div>
              <ControlButton
                icon={PhoneForwarded}
                label="Transferir"
                shortcut={shortcutLabel(SHORTCUTS.transferir, isMac)}
                tone="neutral"
                onClick={() => setTransferirAbierto(true)}
              />
            </div>
          </PopoverTrigger>
          <PopoverContent align="center" className="w-64 p-1.5">
            <p className="px-1.5 py-1 text-xs font-medium text-muted-foreground">
              Transferir a…
            </p>
            {destinosTransferencia.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => {
                  setTransferido(d);
                  setTransferirAbierto(false);
                }}
                className="flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground"
              >
                {d}
                {transferido === d && <Check className="size-3.5 text-primary" />}
              </button>
            ))}
          </PopoverContent>
        </Popover>

        <ControlButton
          icon={variant === "llamada" ? PhoneOff : CircleX}
          label="Cerrar interacción"
          shortcut={shortcutLabel(SHORTCUTS.cerrar, isMac)}
          tone="destructive"
          onClick={() => {}}
        />
      </div>
    </div>
  );
}
