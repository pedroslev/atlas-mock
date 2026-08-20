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
  ChevronsUpDown,
  Tag,
  Grid3x3,
  Delete,
  X,
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
import { useT } from "@/lib/i18n";
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
  disabled,
}: {
  icon: LucideIcon;
  label: string;
  shortcutKey: string;
  isMac: boolean;
  tone: ActionTone;
  onClick?: () => void;
  pressed?: boolean;
  disabled?: boolean;
}) {
  return (
    <ActionTooltip label={label} shortcut={[isMac ? "⌘" : "Ctrl", shortcutKey]}>
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-label={label}
        aria-keyshortcuts={`${isMac ? "Meta" : "Control"}+${shortcutKey}`}
        aria-pressed={pressed}
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-40",
          TONE_CLASS[tone]
        )}
      >
        <Icon className="size-[1.15rem]" />
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
  const t = useT();
  const [open, setOpen] = useState(false);
  const seleccionada = tipificaciones.find((tip) => tip.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-48 min-w-0 shrink-0 justify-between font-normal"
        >
          <span className="flex min-w-0 flex-1 items-center gap-1.5 truncate">
            <Tag className="size-4 shrink-0 text-muted-foreground" />
            <span className="truncate">{seleccionada?.nombre ?? t("padMock.callControls.tipificacionPlaceholder")}</span>
          </span>
          <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="start">
        <Command>
          <CommandInput placeholder={t("padMock.callControls.buscarTipificacion")} />
          <CommandList>
            <CommandEmpty>{t("padMock.callControls.sinResultados")}</CommandEmpty>
            <CommandGroup>
              {tipificaciones.map((tip) => (
                <CommandItem
                  key={tip.id}
                  value={tip.nombre}
                  onSelect={() => {
                    onChange(tip.id);
                    setOpen(false);
                  }}
                >
                  <Check className={cn(value === tip.id ? "opacity-100" : "opacity-0")} />
                  <span className="flex-1">{tip.nombre}</span>
                  <InfoHint>{tip.descripcion}</InfoHint>
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
  tipificaciones,
  enEspera,
  onToggleEspera,
  onCerrarInteraccion,
}: {
  tipificaciones: Tipificacion[];
  enEspera: boolean;
  onToggleEspera: () => void;
  onCerrarInteraccion: () => void;
}) {
  const t = useT();
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
  // Flujo a pedido: Corto → tipifico → recién ahí se habilita Cerrar
  // interacción. El botón de la derecha es el mismo, cambia
  // de rol según "cortada".
  const [cortada, setCortada] = useState(false);
  const [tipSeleccionada, setTipSeleccionada] = useState(tipificaciones[0]?.id);

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
          // Ninguno de estos controles aplica una vez cortada.
          if (!cortada) {
            e.preventDefault();
            onToggleEspera();
          }
          break;
        case SHORTCUTS.silenciar.toLowerCase():
          if (!cortada) {
            e.preventDefault();
            setSilenciado((v) => !v);
          }
          break;
        case SHORTCUTS.marcar.toLowerCase():
          if (!cortada) {
            e.preventDefault();
            setMarcarAbierto(true);
          }
          break;
        case SHORTCUTS.transferir.toLowerCase():
          if (!cortada) {
            e.preventDefault();
            setTransferirAbierto(true);
          }
          break;
        case SHORTCUTS.dialpad.toLowerCase():
          if (!cortada) {
            e.preventDefault();
            setDialpadAbierto(true);
          }
          break;
        case SHORTCUTS.cerrar.toLowerCase():
          e.preventDefault();
          // Primer paso: cortar. Segundo paso: recién con tipificación
          // elegida, cerrar de verdad la interacción.
          if (!cortada) {
            setCortada(true);
          } else if (tipSeleccionada) {
            onCerrarInteraccion();
          }
          break;
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cortada, tipSeleccionada, onToggleEspera, onCerrarInteraccion]);

  return (
    <div className="flex shrink-0 flex-wrap items-center gap-3 border-t border-border px-4 py-2.5">
      <TipificacionSelector
        tipificaciones={tipificaciones}
        value={tipSeleccionada}
        onChange={setTipSeleccionada}
      />

      {enEspera && (
        <Badge variant="warning" className="shrink-0 gap-1">
          <Pause className="size-2.5" />
          {t("padMock.callControls.espera")}
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

      <div className="ml-auto flex min-w-0 items-center gap-2">
        <ControlButton
          icon={enEspera ? Play : Pause}
          label={enEspera ? t("padMock.callControls.retomar") : t("padMock.callControls.espera")}
          shortcutKey={SHORTCUTS.espera}
          isMac={isMac}
          tone={enEspera ? "active" : "neutral"}
          pressed={enEspera}
          disabled={cortada}
          onClick={onToggleEspera}
        />
        <ControlButton
          icon={silenciado ? MicOff : Mic}
          label={silenciado ? t("padMock.callControls.reactivar") : t("padMock.callControls.silenciar")}
          shortcutKey={SHORTCUTS.silenciar}
          isMac={isMac}
          tone={silenciado ? "active" : "neutral"}
          pressed={silenciado}
          disabled={cortada}
          onClick={() => setSilenciado((v) => !v)}
        />
        <Popover open={dialpadAbierto} onOpenChange={setDialpadAbierto}>
          <PopoverTrigger asChild>
            <div>
              <ControlButton
                icon={Grid3x3}
                label={t("padMock.callControls.tecladoNumerico")}
                shortcutKey={SHORTCUTS.dialpad}
                isMac={isMac}
                tone="neutral"
                disabled={cortada}
                onClick={() => setDialpadAbierto(true)}
              />
            </div>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-52 p-2">
            <p className="px-1 py-1 text-xs font-medium text-muted-foreground">
              {t("padMock.callControls.enviarTonos")}
            </p>
            <div className="mb-2 flex h-8 items-center rounded-md border border-border bg-muted/40 px-2 font-mono text-sm tabular-nums">
              {digitosMarcados || <span className="text-muted-foreground">{t("padMock.callControls.sinDigitos")}</span>}
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
              {t("padMock.callControls.borrar")}
            </button>
          </PopoverContent>
        </Popover>

        <Popover open={marcarAbierto} onOpenChange={cerrarMarcar}>
          <PopoverTrigger asChild>
            <div>
              <ControlButton
                icon={Bookmark}
                label={t("padMock.callControls.marcar")}
                shortcutKey={SHORTCUTS.marcar}
                isMac={isMac}
                tone="neutral"
                disabled={cortada}
                onClick={() => setMarcarAbierto(true)}
              />
            </div>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-64 p-0">
            {/* Mismo patrón que TipificacionSelector: buscador + ítem con
                ícono "i" de descripción — a pedido, también acá. */}
            <Command>
              <CommandInput placeholder={t("padMock.callControls.buscarMarca")} />
              <CommandList>
                <CommandEmpty>{t("padMock.callControls.sinResultados")}</CommandEmpty>
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
                placeholder={t("padMock.callControls.comentarioPlaceholder")}
                rows={2}
                className="resize-none text-xs"
              />
              <Button
                size="sm"
                className="mt-1.5 w-full"
                disabled={!marcaSeleccionada}
                onClick={agregarMarca}
              >
                {t("padMock.callControls.agregarMarca")}
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        <Popover open={transferirAbierto} onOpenChange={setTransferirAbierto}>
          <PopoverTrigger asChild>
            <div>
              <ControlButton
                icon={PhoneForwarded}
                label={t("padMock.callControls.transferir")}
                shortcutKey={SHORTCUTS.transferir}
                isMac={isMac}
                tone="neutral"
                disabled={cortada}
                onClick={() => setTransferirAbierto(true)}
              />
            </div>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-64 p-1.5">
            <p className="px-1.5 py-1 text-xs font-medium text-muted-foreground">
              {t("padMock.callControls.transferirA")}
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

        {/* Flujo de dos pasos a pedido: primero cortar, después tipificar,
            y recién ahí el mismo botón cierra la interacción de verdad
            (deshabilitado hasta que haya tipificación elegida). */}
        <ControlButton
          icon={cortada ? X : PhoneOff}
          label={cortada ? t("padMock.callControls.cerrarInteraccion") : t("padMock.callControls.cortar")}
          shortcutKey={SHORTCUTS.cerrar}
          isMac={isMac}
          tone="destructive"
          disabled={cortada && !tipSeleccionada}
          onClick={() => {
            if (!cortada) {
              setCortada(true);
              return;
            }
            if (tipSeleccionada) onCerrarInteraccion();
          }}
        />
      </div>
    </div>
  );
}
