"use client";

import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Mic, MicOff, Pause, Play, PhoneOff, Bookmark, PhoneForwarded, Check } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { marcasEjemplo, destinosTransferencia } from "@/lib/pad-mock/data";

type ActionTone = "success" | "destructive" | "neutral" | "active";

// Mismos tokens que CallActionButton real (active-call-panel.tsx): verde
// atender, rojo colgar, gris neutro, ámbar cuando está "presionado".
const TONE_CLASS: Record<ActionTone, string> = {
  success: "bg-success text-white hover:bg-success/90",
  destructive: "bg-destructive text-white hover:bg-destructive/90",
  neutral: "bg-muted text-foreground hover:bg-muted/60 border border-border",
  active: "bg-warning text-white hover:bg-warning/90",
};

function ControlButton({
  icon: Icon,
  label,
  tone,
  onClick,
  pressed,
}: {
  icon: LucideIcon;
  label: string;
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
        aria-pressed={pressed}
        className={cn(
          "flex size-12 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          TONE_CLASS[tone]
        )}
      >
        <Icon className="size-5" />
      </button>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

// Marcar: clava un bookmark de calidad durante la llamada (versión simple del
// CallPins real — sin timestamp de llamada, este mock no corre un cronómetro
// real). Transferir: deriva la llamada a otro destino.
export function CallControls() {
  const [enEspera, setEnEspera] = useState(false);
  const [silenciado, setSilenciado] = useState(false);
  const [marcas, setMarcas] = useState<string[]>([]);
  const [marcarAbierto, setMarcarAbierto] = useState(false);
  const [transferido, setTransferido] = useState<string | null>(null);
  const [transferirAbierto, setTransferirAbierto] = useState(false);

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
          tone={enEspera ? "active" : "neutral"}
          pressed={enEspera}
          onClick={() => setEnEspera((v) => !v)}
        />
        <ControlButton
          icon={silenciado ? MicOff : Mic}
          label={silenciado ? "Reactivar" : "Silenciar"}
          tone={silenciado ? "active" : "neutral"}
          pressed={silenciado}
          onClick={() => setSilenciado((v) => !v)}
        />

        <Popover open={marcarAbierto} onOpenChange={setMarcarAbierto}>
          <PopoverTrigger asChild>
            <div>
              <ControlButton icon={Bookmark} label="Marcar" tone="neutral" onClick={() => setMarcarAbierto(true)} />
            </div>
          </PopoverTrigger>
          <PopoverContent align="center" className="w-56 p-1.5">
            <p className="px-1.5 py-1 text-xs font-medium text-muted-foreground">
              Marcar esta llamada
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
              <ControlButton icon={PhoneForwarded} label="Transferir" tone="neutral" onClick={() => setTransferirAbierto(true)} />
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

        <ControlButton icon={PhoneOff} label="Colgar" tone="destructive" onClick={() => {}} />
      </div>
    </div>
  );
}
