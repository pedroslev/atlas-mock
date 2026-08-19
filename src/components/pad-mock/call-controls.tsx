"use client";

import { useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Mic, MicOff, Pause, Play, PhoneOff, Bookmark, PhoneForwarded, Check, CircleX } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Kbd } from "@/components/ui/kbd";
import { cn } from "@/lib/utils";
import { marcasEjemplo, destinosTransferencia } from "@/lib/pad-mock/data";
import { useIsMac } from "@/lib/pad-mock/use-is-mac";

type ActionTone = "success" | "destructive" | "neutral" | "active";

// Mismos tokens que CallActionButton real (active-call-panel.tsx): verde
// atender, rojo colgar, gris neutro, ámbar cuando está "presionado".
const TONE_CLASS: Record<ActionTone, string> = {
  success: "bg-success text-white hover:bg-success/90",
  destructive: "bg-destructive text-white hover:bg-destructive/90",
  neutral: "bg-muted text-foreground hover:bg-muted/60 border border-border",
  active: "bg-warning text-white hover:bg-warning/90",
};

// Atajos de esta interacción — mismo criterio que PAD_SHORTCUTS real
// (mock-pad.ts): modificador Ctrl/Cmd + letra mnemónica, para no chocar con
// atajos de una letra sola del navegador/SO. "Marcar" y "Transferir" son
// nuevos acá, elegidos para no repetir letra con Espera/Silenciar/Colgar.
const SHORTCUTS = {
  espera: "H",
  silenciar: "M",
  marcar: "B",
  transferir: "T",
  finalizar: "E",
} as const;

function shortcutLabel(key: string, isMac: boolean): string {
  return isMac ? `⌘${key}` : `Ctrl ${key}`;
}

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
    <div className="flex flex-col items-center gap-1.5">
      <button
        type="button"
        onClick={onClick}
        aria-label={label}
        aria-keyshortcuts={shortcut}
        aria-pressed={pressed}
        className={cn(
          "flex size-12 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          TONE_CLASS[tone]
        )}
      >
        <Icon className="size-5" />
      </button>
      <span className="flex items-center gap-1 text-xs text-muted-foreground">
        <Kbd>{shortcut}</Kbd>
        {label}
      </span>
    </div>
  );
}

// Acciones de la interacción activa — comunes a llamada y chat (Espera,
// Marcar, Transferir, terminar) salvo Silenciar, que es específico de audio.
// "Finalizar" (chat) es la versión genérica de "Colgar" (llamada): ambas
// cierran la interacción, la etiqueta cambia porque "colgar" no tiene sentido
// fuera de una llamada.
export function InteractionControls({ variant }: { variant: "llamada" | "chat" }) {
  const isMac = useIsMac();
  const [enEspera, setEnEspera] = useState(false);
  const [silenciado, setSilenciado] = useState(false);
  const [marcas, setMarcas] = useState<string[]>([]);
  const [marcarAbierto, setMarcarAbierto] = useState(false);
  const [transferido, setTransferido] = useState<string | null>(null);
  const [transferirAbierto, setTransferirAbierto] = useState(false);

  // Mismo guard que el listener real: exige Ctrl/Cmd, ignora inputs
  // editables, y hace preventDefault para no disparar el default del
  // navegador (p.ej. Ctrl+B suele ser "negrita" en algunos campos).
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
          setEnEspera((v) => !v);
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
        case SHORTCUTS.finalizar.toLowerCase():
          e.preventDefault();
          break;
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [variant]);

  return (
    <div className="flex shrink-0 flex-col gap-2 border-t border-border p-3">
      {(marcas.length > 0 || transferido) && (
        <div className="flex flex-wrap items-center gap-1.5 px-1">
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
      )}

      <div className="flex items-center justify-center gap-5">
        <ControlButton
          icon={enEspera ? Play : Pause}
          label={enEspera ? "Retomar" : "Espera"}
          shortcut={shortcutLabel(SHORTCUTS.espera, isMac)}
          tone={enEspera ? "active" : "neutral"}
          pressed={enEspera}
          onClick={() => setEnEspera((v) => !v)}
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

        {variant === "llamada" ? (
          <ControlButton
            icon={PhoneOff}
            label="Colgar"
            shortcut={shortcutLabel(SHORTCUTS.finalizar, isMac)}
            tone="destructive"
            onClick={() => {}}
          />
        ) : (
          <ControlButton
            icon={CircleX}
            label="Finalizar"
            shortcut={shortcutLabel(SHORTCUTS.finalizar, isMac)}
            tone="destructive"
            onClick={() => {}}
          />
        )}
      </div>
    </div>
  );
}
