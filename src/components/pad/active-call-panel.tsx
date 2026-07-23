"use client";

import { useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Phone,
  PhoneOff,
  Pause,
  Play,
  Mic,
  MicOff,
  Loader,
  Bookmark,
  Pin,
  Search,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Kbd } from "@/components/ui/kbd";
import { Input } from "@/components/ui/input";
import { ActionTooltip } from "@/components/layout/action-tooltip";
import {
  getCampania,
  getProyecto,
  getMarcadoresDeGrupo,
} from "@/lib/mock-data";
import {
  INTERACTION_PHASE_META,
  DIRECTION_ICON,
  PAD_SHORTCUTS,
  PAD_SHORTCUT_LABEL_KEYS,
  shortcutLabel,
  formatDuration,
  marcadoresDemoPad,
  type ActiveInteraction,
} from "@/lib/mock-pad";
import { usePad, useNow, useIsMac } from "@/components/pad/pad-state";
import { GestionPanel } from "@/components/pad/acw-panel";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

// A partir de cuántos pins mostramos el buscador: cuando superan lo que entra
// cómodo en el ~50% de alto reservado, filtrar es más rápido que scrollear.
const PINS_SEARCH_THRESHOLD = 6;

// Ídem para la lista de marcas disponibles: si son suficientes como para
// scrollear, buscar por nombre es más rápido que recorrerla (feedback: "los
// bookmarks si se presenta scroll tiene que haber buscador").
const MARCADORES_SEARCH_THRESHOLD = 6;

// Botón de acción de llamada: ícono grande + color semántico, sin depender del
// texto (el nombre va en tooltip + aria-label). Universal: verde = atender,
// rojo = colgar, etc. Cada acción muestra su atajo de teclado (tooltip + chip
// <Kbd> abajo) para educar al operador (feedback: "los shortcuts me los tiene
// que mostrar").
type ActionTone = "success" | "destructive" | "neutral" | "active";

const TONE_CLASS: Record<ActionTone, string> = {
  success: "bg-success text-white hover:bg-success/90 focus-visible:ring-success/40",
  destructive:
    "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/40",
  neutral:
    "bg-muted text-foreground hover:bg-muted/60 border border-border focus-visible:ring-ring/40",
  active: "bg-warning text-white hover:bg-warning/90 focus-visible:ring-warning/40",
};

function CallActionButton({
  icon: Icon,
  label,
  tone,
  onClick,
  pressed,
  shortcut,
}: {
  icon: LucideIcon;
  label: string;
  tone: ActionTone;
  onClick: () => void;
  pressed?: boolean;
  shortcut: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <ActionTooltip label={label} shortcut={[shortcut]}>
        <button
          type="button"
          onClick={onClick}
          aria-label={label}
          aria-keyshortcuts={shortcut}
          aria-pressed={pressed}
          className={cn(
            "flex size-16 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            TONE_CLASS[tone]
          )}
        >
          <Icon className="size-7" />
        </button>
      </ActionTooltip>
      <span className="flex items-center gap-1 text-xs text-muted-foreground">
        <Kbd>{shortcut}</Kbd>
        {label}
      </span>
    </div>
  );
}

// Pins de calidad: el agente clava una marca DURANTE la conversación y queda
// anclado al segundo transcurrido de la llamada (feedback: "si pongo un
// bookmark tiene que aparecer con el timestamp"). Después los revisa un agente
// de calidad. `elapsed` viene del cronómetro de la llamada del pad (useNow).
function CallPins({
  grupoId,
  elapsed,
  canPin,
}: {
  grupoId: string;
  elapsed: number;
  /** false en posllamada: la llamada terminó, los pins quedan de solo lectura. */
  canPin: boolean;
}) {
  const { pins, addPin } = usePad();
  const t = useT();
  const [query, setQuery] = useState("");
  const [markerQuery, setMarkerQuery] = useState("");
  // Marcas del grupo de la campaña + extras de ejemplo del mock (para ver
  // el overflow de la lista sin tocar mock-data).
  const marcadores = useMemo(
    () => [...getMarcadoresDeGrupo(grupoId), ...marcadoresDemoPad],
    [grupoId]
  );

  // Buscador de marcas disponibles: aparece cuando la lista es lo bastante
  // larga como para scrollear. Filtra por nombre o descripción.
  const showMarkerSearch = canPin && marcadores.length > MARCADORES_SEARCH_THRESHOLD;
  const mq = markerQuery.trim().toLowerCase();
  const filteredMarcadores = mq
    ? marcadores.filter(
        (mk) =>
          mk.nombre.toLowerCase().includes(mq) ||
          (mk.descripcion?.toLowerCase().includes(mq) ?? false)
      )
    : marcadores;

  // Buscador de pins: aparece solo cuando hay más de los que entran cómodos en
  // el 50% reservado. Filtra por etiqueta o por timestamp (p. ej. "02:14").
  const showSearch = pins.length > PINS_SEARCH_THRESHOLD;
  const q = query.trim().toLowerCase();
  const filteredPins = q
    ? pins.filter(
        (p) =>
          p.label.toLowerCase().includes(q) ||
          formatDuration(p.atSec).includes(q)
      )
    : pins;

  if (marcadores.length === 0) return null;

  return (
    <Card size="sm" className="flex min-h-0 flex-col">
      <CardHeader>
        <CardTitle as="h3" className="flex items-center gap-2 text-sm">
          <Bookmark className="size-4 text-muted-foreground" />
          {t("pad.marcas.titulo")}
        </CardTitle>
      </CardHeader>
      {/* Dos bloques con altura acotada: ninguno empuja/rompe el alto del panel.
          Arriba las marcas disponibles (scroll propio); abajo los pins ya
          clavados, topados a ~50% del alto con su propio scroll + buscador. */}
      <CardContent className="flex min-h-0 flex-1 flex-col gap-3">
        {/* Marcas disponibles: buscador (si scrollea) + lista que toma el
            alto restante y scrollea sola. En posllamada no se muestran: ya no
            hay conversación sobre la cual clavar una marca. */}
        <div className={cn("flex min-h-0 flex-1 flex-col gap-1.5", !canPin && "hidden")}>
          {showMarkerSearch && (
            <div className="relative shrink-0">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={markerQuery}
                onChange={(e) => setMarkerQuery(e.target.value)}
                placeholder={t("pad.marcas.buscarPlaceholder")}
                className="h-8 pl-8 text-xs"
                aria-label={t("pad.marcas.buscarAria")}
              />
            </div>
          )}
          <div className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto pr-0.5">
            {filteredMarcadores.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                {t("pad.marcas.sinCoincidencias", { q: markerQuery })}
              </p>
            ) : (
              filteredMarcadores.map((mk) => (
                <button
                  key={mk.id}
                  type="button"
                  onClick={() => addPin(elapsed, mk.nombre, mk.descripcion)}
                  className="flex shrink-0 items-start gap-2 rounded-lg px-2.5 py-2 text-left text-sm ring-1 ring-foreground/10 transition-colors hover:bg-muted"
                >
                  <Pin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <span className="flex flex-col">
                    <span className="font-medium">{mk.nombre}</span>
                    {mk.descripcion && (
                      <span className="text-xs text-muted-foreground">
                        {mk.descripcion}
                      </span>
                    )}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Pins ya clavados, con su timestamp de llamada (p.ej. 02:14 — VIP).
            Acotado a la mitad del alto disponible con scroll interno. */}
        <div
          className={cn(
            "flex min-h-0 flex-col",
            canPin ? "basis-1/2 border-t pt-3" : "flex-1"
          )}
        >
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-xs font-medium text-muted-foreground">
              {t("pad.pins.titulo")}
            </p>
            {pins.length > 0 && (
              <span className="font-mono text-xs tabular-nums text-muted-foreground">
                {pins.length}
              </span>
            )}
          </div>

          {showSearch && (
            <div className="relative mb-2 shrink-0">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("pad.pins.buscarPlaceholder")}
                className="h-8 pl-8 text-xs"
                aria-label={t("pad.pins.buscarAria")}
              />
            </div>
          )}

          <div className="min-h-0 flex-1 overflow-y-auto pr-0.5">
            {pins.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                {canPin
                  ? t("pad.pins.vacioActivo")
                  : t("pad.pins.vacioCerrado")}
              </p>
            ) : filteredPins.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                {t("pad.pins.sinCoincidencias", { q: query })}
              </p>
            ) : (
              <ol className="flex flex-col gap-1.5">
                {filteredPins.map((pin) => (
                  <li
                    key={pin.id}
                    className="flex items-center gap-2 text-sm"
                  >
                    <Pin className="size-3.5 shrink-0 fill-primary text-primary" />
                    <span className="font-mono text-xs tabular-nums text-muted-foreground">
                      {formatDuration(pin.atSec)}
                    </span>
                    <span className="text-muted-foreground">—</span>
                    <span className="truncate font-medium">{pin.label}</span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ActiveCallPanel({
  interaction,
}: {
  interaction: ActiveInteraction;
}) {
  const { callSince, acwDurationSec, answer, hangup, toggleHold, toggleMute } =
    usePad();
  const t = useT();
  const isMac = useIsMac();
  const now = useNow(callSince !== null);
  const elapsed =
    callSince !== null ? Math.max(0, Math.floor((now - callSince) / 1000)) : 0;

  const campania = getCampania(interaction.campaniaId);
  const proyecto = campania ? getProyecto(campania.proyectoId) : undefined;
  const phaseMeta = INTERACTION_PHASE_META[interaction.phase];
  const DirIcon = DIRECTION_ICON[interaction.direction];
  const isInbound = interaction.direction === "inbound";
  const incoming = interaction.phase === "incoming";
  const onHold = interaction.phase === "hold";
  // Posllamada: la llamada terminó pero la gestión sigue abierta. Ya NO hay
  // modal (feedback); se queda en esta misma pantalla, con la llamada en
  // "finalizada" y el panel de resultado a la derecha, ahora sí finalizable.
  const posllamada = interaction.phase === "acw";
  const enLinea = !incoming && !posllamada; // onagent | hold

  // La columna derecha (resultado de la gestión + marcas) aparece apenas la
  // llamada se conecta y sigue disponible en posllamada.
  const sidePanel = enLinea || posllamada;
  const bookmarkGroup = sidePanel ? campania?.grupoBookmarksId : undefined;

  return (
    <div
      className={cn(
        "grid h-full min-h-0 gap-6",
        sidePanel && "lg:grid-cols-[minmax(0,1fr)_360px]"
      )}
    >
      <Card className="flex min-h-0 flex-col">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle as="h2" className="flex items-center gap-2">
            <DirIcon className="size-4 text-muted-foreground" />
            {isInbound ? t("pad.llamada.entrante") : t("pad.llamada.saliente")}
          </CardTitle>
          <Badge variant={phaseMeta.tone}>{t(phaseMeta.labelKey)}</Badge>
        </CardHeader>

        <CardContent className="flex flex-1 flex-col justify-center gap-8">
          <div className="flex flex-col items-center gap-1 text-center">
            {interaction.nombre && (
              <span className="text-2xl font-semibold">{interaction.nombre}</span>
            )}
            <span
              className={cn(
                "font-mono tabular-nums",
                interaction.nombre
                  ? "text-sm text-muted-foreground"
                  : "text-2xl font-semibold"
              )}
            >
              {interaction.numero}
            </span>

            {campania && (
              <span className="mt-1 text-xs text-muted-foreground">
                {campania.nombre}
                {proyecto ? ` · ${proyecto.nombre}` : ""}
              </span>
            )}

            <div className="mt-4 flex items-center gap-2">
              {incoming ? (
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader className="size-4 animate-spin" />
                  {isInbound
                    ? t("pad.llamada.sonando")
                    : t("pad.llamada.conectando")}
                </span>
              ) : (
                <span
                  className={cn(
                    "font-mono text-4xl font-semibold tabular-nums",
                    onHold && "text-warning",
                    posllamada && "text-muted-foreground"
                  )}
                >
                  {formatDuration(posllamada ? acwDurationSec : elapsed)}
                </span>
              )}
            </div>
            {onHold && (
              <span className="text-xs font-medium text-warning">
                {t("pad.llamada.enEspera")}
              </span>
            )}
            {posllamada && (
              <span className="text-xs font-medium text-muted-foreground">
                {t("pad.llamada.finalizada")}
              </span>
            )}
          </div>

          {/* Controles de llamada: ícono grande + color + atajo, según la fase */}
          <div className="flex flex-wrap items-start justify-center gap-6">
            {posllamada ? (
              <p className="max-w-sm text-center text-sm text-muted-foreground">
                {t("pad.llamada.posllamadaAyuda")}
              </p>
            ) : incoming ? (
              <>
                {isInbound && (
                  <CallActionButton
                    icon={Phone}
                    label={t(PAD_SHORTCUT_LABEL_KEYS.answer)}
                    tone="success"
                    shortcut={shortcutLabel(PAD_SHORTCUTS.answer, isMac)}
                    onClick={answer}
                  />
                )}
                <CallActionButton
                  icon={PhoneOff}
                  label={
                    isInbound
                      ? t("pad.llamada.rechazar")
                      : t("common.acciones.cancelar")
                  }
                  tone="destructive"
                  shortcut={shortcutLabel(PAD_SHORTCUTS.hangup, isMac)}
                  onClick={hangup}
                />
              </>
            ) : (
              <>
                <CallActionButton
                  icon={onHold ? Play : Pause}
                  label={
                    onHold
                      ? t("pad.llamada.retomar")
                      : t(PAD_SHORTCUT_LABEL_KEYS.hold)
                  }
                  tone={onHold ? "active" : "neutral"}
                  pressed={onHold}
                  shortcut={shortcutLabel(PAD_SHORTCUTS.hold, isMac)}
                  onClick={toggleHold}
                />
                <CallActionButton
                  icon={interaction.muted ? MicOff : Mic}
                  label={
                    interaction.muted
                      ? t("pad.llamada.reactivarMicrofono")
                      : t(PAD_SHORTCUT_LABEL_KEYS.mute)
                  }
                  tone={interaction.muted ? "active" : "neutral"}
                  pressed={interaction.muted}
                  shortcut={shortcutLabel(PAD_SHORTCUTS.mute, isMac)}
                  onClick={toggleMute}
                />
                <CallActionButton
                  icon={PhoneOff}
                  label={t(PAD_SHORTCUT_LABEL_KEYS.hangup)}
                  tone="destructive"
                  shortcut={shortcutLabel(PAD_SHORTCUTS.hangup, isMac)}
                  onClick={hangup}
                />
              </>
            )}
          </div>
          {/* Sin leyenda de atajos acá: cada botón ya muestra su atajo debajo
              (label + Kbd) y "Cambiar estado" vive en el bloque de estado del
              sidenav (feedback: se eliminó la duplicación Atender/Rechazar). */}
        </CardContent>
      </Card>

      {sidePanel && (
        <div className="flex min-h-0 flex-col gap-6">
          <GestionPanel interaction={interaction} />
          {bookmarkGroup && (
            <CallPins
              grupoId={bookmarkGroup}
              elapsed={elapsed}
              canPin={enLinea}
            />
          )}
        </div>
      )}
    </div>
  );
}
