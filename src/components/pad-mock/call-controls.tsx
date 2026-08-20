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
  HelpCircle,
  Tag,
  Grid3x3,
  Delete,
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
import { Textarea } from "@/components/ui/textarea";
import { ActionTooltip } from "@/components/layout/action-tooltip";
import { InfoHint } from "@/components/pad-mock/info-hint";
import { cn } from "@/lib/utils";
import { marcasDisponibles, destinosTransferencia, type Tipificacion } from "@/lib/pad-mock/data";
import { useIsMac } from "@/lib/pad-mock/use-is-mac";

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
  dialpad: "D",
} as const;

const TECLAS_DIALPAD = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"];

// Ícono solo + tooltip con el nombre y el atajo (en vez de label+Kbd fijo
// debajo de cada botón) — mismo patrón que los íconos del header real
// (ActionTooltip), pensado para una barra que ahora está siempre visible y
// tiene que ser compacta.
function ControlButton({
  icon: Icon,
  label,
  shortcutKey,
  isMac,
  tone,
  onClick,
  pressed,
}: {
  icon: LucideIcon;
  label: string;
  shortcutKey: string;
  isMac: boolean;
  tone: ActionTone;
  onClick?: () => void;
  pressed?: boolean;
}) {
  return (
    <ActionTooltip label={label} shortcut={[isMac ? "⌘" : "Ctrl", shortcutKey]}>
      <button
        type="button"
        onClick={onClick}
        aria-label={label}
        aria-keyshortcuts={`${isMac ? "Meta" : "Control"}+${shortcutKey}`}
        aria-pressed={pressed}
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          TONE_CLASS[tone]
        )}
      >
        <Icon className="size-4" />
      </button>
    </ActionTooltip>
  );
}

// Combobox con buscador para tipificación — mismo patrón que EntityCombobox
// de Olimpo. Ancho acotado (w-44): no hace falta que ocupe media barra.
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
          className="w-44 min-w-0 shrink-0 justify-between font-normal"
        >
          <span className="flex min-w-0 flex-1 items-center gap-1.5 truncate">
            <Tag className="size-3.5 shrink-0 text-muted-foreground" />
            <span className="truncate">{seleccionada?.nombre ?? "Tipificación…"}</span>
            {seleccionada?.sugerida && (
              <Sparkles className="size-3 shrink-0 text-info" />
            )}
          </span>
          <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="start">
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
                  <InfoHint>{t.descripcion}</InfoHint>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

type MarcaAgregada = { marca: string; comentario?: string };

// Barra de controles de la interacción activa — vive en CenterColumn, FUERA
// del Tabs, para quedar visible sin importar qué solapa esté mirando el
// agente. Una sola fila, compacta: chips a la izquierda, tipificación +
// botones a la derecha. El cronómetro se sacó de acá (a pedido) — ahora vive
// en CenterColumn, al lado del título de la solapa fija.
//
// El estado de Hold (enEspera) NO es local: lo maneja pad-mock-shell.tsx
// para poder reflejar el mismo tiempo en espera en la fila de la cola del
// menú izquierdo (LeftNav) y en el cronómetro de arriba mientras dura.
export function InteractionControls({
  variant,
  tipificaciones,
  enEspera,
  onToggleEspera,
}: {
  variant: "llamada" | "chat";
  tipificaciones: Tipificacion[];
  enEspera: boolean;
  onToggleEspera: () => void;
}) {
  const isMac = useIsMac();
  const [silenciado, setSilenciado] = useState(false);
  const [marcas, setMarcas] = useState<MarcaAgregada[]>([]);
  const [marcarAbierto, setMarcarAbierto] = useState(false);
  const [marcaSeleccionada, setMarcaSeleccionada] = useState<string | null>(null);
  const [comentarioMarca, setComentarioMarca] = useState("");
  const [transferido, setTransferido] = useState<string | null>(null);
  const [transferirAbierto, setTransferirAbierto] = useState(false);
  const [dialpadAbierto, setDialpadAbierto] = useState(false);
  const [digitosMarcados, setDigitosMarcados] = useState("");
  const [tipSeleccionada, setTipSeleccionada] = useState(
    tipificaciones.find((t) => t.sugerida)?.id ?? tipificaciones[0]?.id
  );

  function cerrarMarcar(next: boolean) {
    setMarcarAbierto(next);
    if (!next) {
      setMarcaSeleccionada(null);
      setComentarioMarca("");
    }
  }

  function agregarMarca() {
    const marca = marcasDisponibles.find((m) => m.id === marcaSeleccionada);
    if (!marca) return;
    setMarcas((cur) => [
      ...cur,
      { marca: marca.nombre, comentario: comentarioMarca.trim() || undefined },
    ]);
    cerrarMarcar(false);
  }

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
          // El chat no tiene Hold — a pedido, ese control (y su atajo) es
          // exclusivo de llamada.
          if (variant === "llamada") {
            e.preventDefault();
            onToggleEspera();
          }
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
        case SHORTCUTS.dialpad.toLowerCase():
          if (variant === "llamada") {
            e.preventDefault();
            setDialpadAbierto(true);
          }
          break;
        case SHORTCUTS.cerrar.toLowerCase():
          e.preventDefault();
          break;
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [variant, onToggleEspera]);

  return (
    <div className="flex shrink-0 flex-wrap items-center gap-2.5 border-t border-border px-3 py-1.5">
      <TipificacionSelector
        tipificaciones={tipificaciones}
        value={tipSeleccionada}
        onChange={setTipSeleccionada}
      />
      <ActionTooltip label="Cómo se guarda una tipificación sugerida por el copiloto vs. una cargada a mano: abierto.">
        <span className="flex size-6 shrink-0 items-center justify-center text-muted-foreground">
          <HelpCircle className="size-3.5" />
        </span>
      </ActionTooltip>

      {variant === "llamada" && enEspera && (
        <Badge variant="warning" className="shrink-0 gap-1">
          <Pause className="size-2.5" />
          Espera
        </Badge>
      )}
      {marcas.map((m, i) => {
        const badge = (
          <Badge variant="neutral" className="shrink-0 gap-1">
            <Bookmark className="size-2.5" />
            {m.marca}
          </Badge>
        );
        return m.comentario ? (
          <ActionTooltip key={`${m.marca}-${i}`} label={m.comentario}>
            <span>{badge}</span>
          </ActionTooltip>
        ) : (
          <span key={`${m.marca}-${i}`}>{badge}</span>
        );
      })}
      {transferido && (
        <Badge variant="info" className="shrink-0 gap-1">
          <PhoneForwarded className="size-2.5" />
          {transferido}
        </Badge>
      )}

      <div className="ml-auto flex min-w-0 items-center gap-1.5">
        {/* El chat no tiene Hold — a pedido, control exclusivo de llamada. */}
        {variant === "llamada" && (
          <ControlButton
            icon={enEspera ? Play : Pause}
            label={enEspera ? "Retomar" : "Espera"}
            shortcutKey={SHORTCUTS.espera}
            isMac={isMac}
            tone={enEspera ? "active" : "neutral"}
            pressed={enEspera}
            onClick={onToggleEspera}
          />
        )}
        {variant === "llamada" && (
          <ControlButton
            icon={silenciado ? MicOff : Mic}
            label={silenciado ? "Reactivar" : "Silenciar"}
            shortcutKey={SHORTCUTS.silenciar}
            isMac={isMac}
            tone={silenciado ? "active" : "neutral"}
            pressed={silenciado}
            onClick={() => setSilenciado((v) => !v)}
          />
        )}
        {variant === "llamada" && (
          <Popover open={dialpadAbierto} onOpenChange={setDialpadAbierto}>
            <PopoverTrigger asChild>
              <div>
                <ControlButton
                  icon={Grid3x3}
                  label="Teclado numérico"
                  shortcutKey={SHORTCUTS.dialpad}
                  isMac={isMac}
                  tone="neutral"
                  onClick={() => setDialpadAbierto(true)}
                />
              </div>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-52 p-2">
              <p className="px-1 py-1 text-xs font-medium text-muted-foreground">
                Enviar tonos (DTMF)
              </p>
              <div className="mb-2 flex h-8 items-center rounded-md border border-border bg-muted/40 px-2 font-mono text-sm tabular-nums">
                {digitosMarcados || <span className="text-muted-foreground">Sin dígitos</span>}
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {TECLAS_DIALPAD.map((tecla) => (
                  <button
                    key={tecla}
                    type="button"
                    onClick={() => setDigitosMarcados((cur) => cur + tecla)}
                    className="flex h-9 items-center justify-center rounded-md border border-border text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                  >
                    {tecla}
                  </button>
                ))}
              </div>
              <button
                type="button"
                disabled={!digitosMarcados}
                onClick={() => setDigitosMarcados((cur) => cur.slice(0, -1))}
                className="mt-1.5 flex w-full items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
              >
                <Delete className="size-3.5" />
                Borrar
              </button>
            </PopoverContent>
          </Popover>
        )}

        <Popover open={marcarAbierto} onOpenChange={cerrarMarcar}>
          <PopoverTrigger asChild>
            <div>
              <ControlButton
                icon={Bookmark}
                label="Marcar"
                shortcutKey={SHORTCUTS.marcar}
                isMac={isMac}
                tone="neutral"
                onClick={() => setMarcarAbierto(true)}
              />
            </div>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-64 p-0">
            {/* Mismo patrón que TipificacionSelector: buscador + ítem con
                ícono "i" de descripción — a pedido, también acá. */}
            <Command>
              <CommandInput placeholder="Buscar marca…" />
              <CommandList>
                <CommandEmpty>Sin resultados.</CommandEmpty>
                <CommandGroup>
                  {marcasDisponibles.map((m) => (
                    <CommandItem
                      key={m.id}
                      value={m.nombre}
                      onSelect={() => setMarcaSeleccionada(m.id)}
                    >
                      <Check className={cn(marcaSeleccionada === m.id ? "opacity-100" : "opacity-0")} />
                      <span className="flex-1">{m.nombre}</span>
                      <InfoHint>{m.descripcion}</InfoHint>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
            <div className="border-t border-border p-1.5">
              <Textarea
                value={comentarioMarca}
                onChange={(e) => setComentarioMarca(e.target.value)}
                placeholder="Agregar un comentario (opcional)…"
                rows={2}
                className="resize-none text-xs"
              />
              <Button
                size="sm"
                className="mt-1.5 w-full"
                disabled={!marcaSeleccionada}
                onClick={agregarMarca}
              >
                Agregar marca
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        <Popover open={transferirAbierto} onOpenChange={setTransferirAbierto}>
          <PopoverTrigger asChild>
            <div>
              <ControlButton
                icon={PhoneForwarded}
                label="Transferir"
                shortcutKey={SHORTCUTS.transferir}
                isMac={isMac}
                tone="neutral"
                onClick={() => setTransferirAbierto(true)}
              />
            </div>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-64 p-1.5">
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
          shortcutKey={SHORTCUTS.cerrar}
          isMac={isMac}
          tone="destructive"
          onClick={() => {}}
        />
      </div>
    </div>
  );
}
