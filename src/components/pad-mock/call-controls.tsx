"use client";

import { useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Mic,
  MicOff,
  Pause,
  Play,
  PhoneOff,
  CircleX,
  Bookmark,
  Check,
  ChevronsUpDown,
  Tag,
  Grid3x3,
  Delete,
  X,
  ScreenShare,
  ScreenShareOff,
  Camera,
  PictureInPicture2,
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
import { marcasDisponibles, type Tipificacion } from "@/lib/pad-mock/data";
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
  cerrar: "E",
  dialpad: "D",
  compartir: "S",
  captura: "I",
  pip: "P",
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
//
// Chat: sin espera, silenciar ni teclado numérico (son de la voz); el
// primer paso del botón de la derecha es "Finalizar chat".
//
// Webcall y videollamada (llamadaWeb): sin teclado numérico — del otro lado
// hay una persona en una página web, no un menú de tonos — y con "Compartir
// pantalla". Videollamada (video), además: "Captura de imagen" (foto del
// video del cliente, queda en la interacción) y "Picture-in-Picture" (el video
// del cliente en la ventana flotante del navegador, encima de todo, también
// fuera del pad); y sin "Marcar". El estado de estos controles vive en
// CenterColumn, porque también lo muestra la solapa del video.
//
// Llamada interna (interno): solo espera, silenciar y cortar — sin
// tipificación, teclado ni marcas. Cortar la cierra de una (no hay
// tipificación que cargar). Mientras suena (sonando), cortar la cancela.
export function InteractionControls({
  tipificaciones,
  enEspera,
  onToggleEspera,
  onCerrarInteraccion,
  chat = false,
  llamadaWeb = false,
  video,
  interno = false,
  sonando = false,
}: {
  tipificaciones: Tipificacion[];
  enEspera: boolean;
  onToggleEspera: () => void;
  onCerrarInteraccion: () => void;
  chat?: boolean;
  /** Webcall o videollamada. */
  llamadaWeb?: boolean;
  /** Compartir pantalla (webcall y videollamada) y, solo en videollamada,
   *  Picture-in-Picture y — si la cuenta suma chat — captura de imagen. */
  video?: {
    esVideo?: boolean;
    compartiendo: boolean;
    onToggleCompartir: () => void;
    onCaptura?: () => void;
    pip?: boolean;
    onTogglePip?: () => void;
  };
  interno?: boolean;
  sonando?: boolean;
}) {
  const t = useT();
  const isMac = useIsMac();
  const [silenciado, setSilenciado] = useState(false);
  const [marcas, setMarcas] = useState<MarcaAgregada[]>([]);
  const [marcarAbierto, setMarcarAbierto] = useState(false);
  const [marcaSeleccionada, setMarcaSeleccionada] = useState<string | null>(null);
  const [comentarioMarca, setComentarioMarca] = useState("");
  const [dialpadAbierto, setDialpadAbierto] = useState(false);
  const [digitosMarcados, setDigitosMarcados] = useState("");
  // Flujo a pedido: Corto → tipifico → recién ahí se habilita Cerrar
  // interacción. El botón de la derecha es el mismo, cambia
  // de rol según "cortada".
  const [cortada, setCortada] = useState(false);
  const esVideo = !!video?.esVideo;
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
      if (interno) {
        if (key === SHORTCUTS.cerrar.toLowerCase()) {
          e.preventDefault();
          onCerrarInteraccion();
        } else if (!sonando && key === SHORTCUTS.espera.toLowerCase()) {
          e.preventDefault();
          onToggleEspera();
        } else if (!sonando && key === SHORTCUTS.silenciar.toLowerCase()) {
          e.preventDefault();
          setSilenciado((v) => !v);
        }
        return;
      }
      switch (key) {
        case SHORTCUTS.espera.toLowerCase():
          // Ninguno de estos controles aplica una vez cortada.
          if (!cortada && !chat) {
            e.preventDefault();
            onToggleEspera();
          }
          break;
        case SHORTCUTS.silenciar.toLowerCase():
          if (!cortada && !chat) {
            e.preventDefault();
            setSilenciado((v) => !v);
          }
          break;
        case SHORTCUTS.compartir.toLowerCase():
          if (!cortada && video) {
            e.preventDefault();
            video.onToggleCompartir();
          }
          break;
        case SHORTCUTS.captura.toLowerCase():
          if (!cortada && video?.onCaptura) {
            e.preventDefault();
            video.onCaptura();
          }
          break;
        case SHORTCUTS.pip.toLowerCase():
          if (!cortada && video?.onTogglePip) {
            e.preventDefault();
            video.onTogglePip();
          }
          break;
        case SHORTCUTS.marcar.toLowerCase():
          if (!cortada && !esVideo) {
            e.preventDefault();
            setMarcarAbierto(true);
          }
          break;
        case SHORTCUTS.dialpad.toLowerCase():
          if (!cortada && !chat && !llamadaWeb) {
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
  }, [cortada, tipSeleccionada, onToggleEspera, onCerrarInteraccion, chat, llamadaWeb, video, esVideo, interno, sonando]);

  if (interno) {
    return (
      <div className="flex shrink-0 flex-wrap items-center gap-3 border-t border-border px-4 py-2.5">
        {enEspera && (
          <Badge variant="warning" className="shrink-0 gap-1">
            <Pause className="size-2.5" />
            {t("padMock.callControls.espera")}
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
            disabled={sonando}
            onClick={onToggleEspera}
          />
          <ControlButton
            icon={silenciado ? MicOff : Mic}
            label={silenciado ? t("padMock.callControls.reactivar") : t("padMock.callControls.silenciar")}
            shortcutKey={SHORTCUTS.silenciar}
            isMac={isMac}
            tone={silenciado ? "active" : "neutral"}
            pressed={silenciado}
            disabled={sonando}
            onClick={() => setSilenciado((v) => !v)}
          />
          <ControlButton
            icon={PhoneOff}
            label={t("padMock.callControls.cortar")}
            shortcutKey={SHORTCUTS.cerrar}
            isMac={isMac}
            tone="destructive"
            onClick={onCerrarInteraccion}
          />
        </div>
      </div>
    );
  }

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
      <div className="ml-auto flex min-w-0 items-center gap-2">
        {!chat && (
          <>
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
            {!llamadaWeb && (
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
            )}
          </>
        )}

        {video && (
          <ControlButton
            icon={video.compartiendo ? ScreenShareOff : ScreenShare}
            label={video.compartiendo ? t("padMock.callControls.dejarDeCompartir") : t("padMock.callControls.compartirPantalla")}
            shortcutKey={SHORTCUTS.compartir}
            isMac={isMac}
            tone={video.compartiendo ? "active" : "neutral"}
            pressed={video.compartiendo}
            disabled={cortada}
            onClick={video.onToggleCompartir}
          />
        )}
        {video?.onCaptura && (
          <ControlButton
            icon={Camera}
            label={t("padMock.callControls.captura")}
            shortcutKey={SHORTCUTS.captura}
            isMac={isMac}
            tone="neutral"
            disabled={cortada}
            onClick={video.onCaptura}
          />
        )}
        {video?.onTogglePip && (
          <ControlButton
            icon={PictureInPicture2}
            label={
              video.pip
                ? t("padMock.callControls.cerrarPip")
                : t("padMock.callControls.pip")
            }
            shortcutKey={SHORTCUTS.pip}
            isMac={isMac}
            tone={video.pip ? "active" : "neutral"}
            pressed={video.pip}
            disabled={cortada}
            onClick={video.onTogglePip}
          />
        )}

        {!esVideo && (
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
        )}

        {/* Flujo de dos pasos a pedido: primero cortar, después tipificar,
            y recién ahí el mismo botón cierra la interacción de verdad
            (deshabilitado hasta que haya tipificación elegida). */}
        <ControlButton
          icon={cortada ? X : chat ? CircleX : PhoneOff}
          label={
            cortada
              ? t("padMock.callControls.cerrarInteraccion")
              : chat
                ? t("padMock.callControls.finalizarChat")
                : t("padMock.callControls.cortar")
          }
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
