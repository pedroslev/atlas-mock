"use client";

import { useEffect, useState } from "react";
import { PhoneCall, History, Loader } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { usePad } from "@/components/pad/pad-state";
import {
  resolveStatus,
  AgentStatusBadge,
} from "@/components/pad/status-display";
import { AgentStatusSelector } from "@/components/pad/agent-status-selector";
import { DialerPanel } from "@/components/pad/dialer-panel";
import { ActiveCallPanel } from "@/components/pad/active-call-panel";
import { CallHistoryPanel } from "@/components/pad/call-history-panel";
import {
  INTERACTION_PHASE_META,
  DIRECTION_ICON,
  PAD_SHORTCUTS,
} from "@/lib/mock-pad";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

// Vista cuando no hay interacción: usa el ancho completo con el discador a la
// izquierda y un estado grande a la derecha (nada de card angosta centrada).
function IdleView() {
  const { effectiveStatus } = usePad();
  const t = useT();
  const available = effectiveStatus.kind === "available";
  const resolved = resolveStatus(effectiveStatus, t);

  return (
    <div className="grid h-full min-h-0 gap-6 lg:grid-cols-[minmax(320px,400px)_minmax(0,1fr)]">
      <DialerPanel />
      <Card className="min-h-64">
        <CardContent className="flex h-full flex-col items-center justify-center gap-4 py-12 text-center">
          <span className="flex size-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <PhoneCall className="size-7" />
          </span>
          <AgentStatusBadge status={effectiveStatus} />
          <p className="max-w-md text-sm text-muted-foreground">
            {available
              ? t("pad.idle.listo")
              : t("pad.idle.noDisponible", {
                  estado: resolved.label,
                  disponible: t("pad.estado.disponible"),
                })}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// Contenido de la solapa "Llamada": idle → discador; llamada en curso o
// posllamada → panel vivo. La posllamada YA NO abre un modal bloqueante: se
// resuelve en el mismo panel, con el resultado de la gestión a la derecha
// (feedback: "es poco ágil tener que cortar y que todo el aplicativo se trabe
// con un modal para poner la clasificación").
function CallTab() {
  const { interaction } = usePad();
  return (
    <div className="h-full min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-6">
      {interaction ? (
        <ActiveCallPanel interaction={interaction} />
      ) : (
        <IdleView />
      )}
    </div>
  );
}

type PadTab = "llamada" | "historial";

// Sub-item (CHILD) del sidenav bajo "Llamada": aparece cuando hay una
// interacción en curso e indica en qué llamada está el agente (feedback). Al
// terminar (colgar + tipificar) la interacción vuelve a null y el child
// desaparece, quedando seleccionado el parent "Llamada".
function CallChildItem({
  active,
  onSelect,
}: {
  active: boolean;
  onSelect: () => void;
}) {
  const { interaction } = usePad();
  const t = useT();
  if (!interaction) return null;
  const DirIcon = DIRECTION_ICON[interaction.direction];
  const phaseMeta = INTERACTION_PHASE_META[interaction.phase];
  const label = interaction.nombre ?? interaction.numero;

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={active ? "true" : undefined}
      className={cn(
        "ml-4 flex items-center gap-2 rounded-lg border-l border-sidebar-border py-2 pr-2 pl-3 text-left text-sm transition-colors max-sm:ml-0 max-sm:justify-center max-sm:border-l-0 max-sm:px-0",
        active
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60"
      )}
    >
      {interaction.phase === "incoming" ? (
        <Loader className="size-4 shrink-0 animate-spin text-info" />
      ) : (
        <DirIcon className="size-4 shrink-0 text-muted-foreground" />
      )}
      <span className="flex min-w-0 flex-1 flex-col max-sm:hidden">
        <span className="truncate font-medium">{label}</span>
        <span className="truncate text-xs text-muted-foreground">
          {t(phaseMeta.labelKey)}
        </span>
      </span>
    </button>
  );
}

// Consola del agente (Hermes). Sidenav con superficie propia (bg-sidebar) que lo
// separa del área de contenido; aloja el selector de estado del agente (bajado
// del header) y un child de "Llamada" cuando hay una interacción activa. El pad
// se opera casi 100% por teclado (ver PAD_SHORTCUTS).
export function PadConsole() {
  const {
    interaction,
    locked,
    answer,
    hangup,
    toggleHold,
    toggleMute,
    setStatusMenuOpen,
  } = usePad();
  const t = useT();
  const [tab, setTab] = useState<PadTab>("llamada");

  // Cuando entra una llamada nueva (Conectando) o termina y queda la gestión
  // abierta (posllamada), la solapa de llamada pasa a primer plano para que no
  // se pierda. Es un cambio de solapa, no un bloqueo: el agente puede seguir
  // navegando (p. ej. mirar el historial) mientras carga el resultado.
  const phase = interaction?.phase;
  useEffect(() => {
    // Sincroniza la solapa activa con la fase de la llamada (sistema externo:
    // el motor de interacciones del pad). Mismo patrón que useNow/theme-toggle.
    if (phase === "incoming" || phase === "acw") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTab("llamada");
    }
  }, [phase]);

  // Atajos de teclado globales: el operador opera rápido y el pad tiene que ser
  // controlable casi 100% por teclado. Exigen el modificador Ctrl (o Cmd en
  // Mac) para no dispararse mientras el agente tipea (feedback), y hacen
  // preventDefault para no ejecutar el default del navegador. Se ignoran cuando
  // el foco está en un campo editable (inputs, buscadores).
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const mod = e.ctrlKey || e.metaKey; // Ctrl o Cmd
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
      const ph = interaction?.phase;
      const inCall = ph === "onagent" || ph === "hold";
      switch (key) {
        case PAD_SHORTCUTS.answer.toLowerCase():
          if (ph === "incoming" && interaction?.direction === "inbound") {
            e.preventDefault();
            answer();
          }
          break;
        case PAD_SHORTCUTS.hangup.toLowerCase():
          if (ph === "incoming" || inCall) {
            e.preventDefault();
            hangup();
          }
          break;
        case PAD_SHORTCUTS.hold.toLowerCase():
          if (inCall) {
            e.preventDefault();
            toggleHold();
          }
          break;
        case PAD_SHORTCUTS.mute.toLowerCase():
          if (inCall) {
            e.preventDefault();
            toggleMute();
          }
          break;
        case PAD_SHORTCUTS.status.toLowerCase():
          if (!locked) {
            e.preventDefault();
            setStatusMenuOpen(true);
          }
          break;
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [
    interaction,
    locked,
    answer,
    hangup,
    toggleHold,
    toggleMute,
    setStatusMenuOpen,
  ]);

  const callActive = interaction !== null;

  return (
    <Tabs
      value={tab}
      onValueChange={(v) => setTab(v as PadTab)}
      orientation="vertical"
      className="flex h-full min-h-0 w-full gap-0"
    >
      {/* Sidenav con superficie propia (bg-sidebar) para diferenciarse del área
          de contenido, no sólo por un border. Orden (feedback): primero "Mi
          estado" arriba, después las secciones. */}
      <aside className="flex h-full w-14 shrink-0 flex-col gap-3 border-r border-sidebar-border bg-sidebar p-2 text-sidebar-foreground sm:w-60 sm:p-3">
        {/* Estado del agente, arriba de todo. Incluye su atajo (Ctrl/Cmd S). */}
        <div className="flex flex-col gap-1.5 border-b border-sidebar-border pb-3">
          <span className="px-1 text-xs font-medium text-muted-foreground max-sm:hidden">
            {t("pad.nav.miEstado")}
          </span>
          <AgentStatusSelector />
        </div>

        {/* Secciones: ocupan el ANCHO COMPLETO del sidenav (fila full-width con
            su resaltado abarcando todo el ancho, como Olimpo). */}
        <TabsList
          variant="line"
          className="h-auto w-full flex-col items-stretch justify-start gap-1 rounded-none border-0 bg-transparent p-0"
        >
          <TabsTrigger
            value="llamada"
            className="h-11 w-full justify-start gap-3 rounded-lg border-0 px-0 text-sm after:hidden group-data-[variant=line]/tabs-list:data-active:bg-sidebar-accent dark:group-data-[variant=line]/tabs-list:data-active:bg-sidebar-accent data-active:bg-sidebar-accent dark:data-active:bg-sidebar-accent data-active:text-sidebar-accent-foreground dark:data-active:text-sidebar-accent-foreground sm:px-3 max-sm:justify-center"
          >
            <PhoneCall className="size-4.5 shrink-0" />
            <span className="max-sm:hidden">{t("pad.nav.llamada")}</span>
          </TabsTrigger>

          {callActive && (
            <CallChildItem
              active={tab === "llamada"}
              onSelect={() => setTab("llamada")}
            />
          )}

          <TabsTrigger
            value="historial"
            className="h-11 w-full justify-start gap-3 rounded-lg border-0 px-0 text-sm after:hidden group-data-[variant=line]/tabs-list:data-active:bg-sidebar-accent dark:group-data-[variant=line]/tabs-list:data-active:bg-sidebar-accent data-active:bg-sidebar-accent dark:data-active:bg-sidebar-accent data-active:text-sidebar-accent-foreground dark:data-active:text-sidebar-accent-foreground sm:px-3 max-sm:justify-center"
          >
            <History className="size-4.5 shrink-0" />
            <span className="max-sm:hidden">{t("pad.nav.historial")}</span>
          </TabsTrigger>
        </TabsList>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <TabsContent value="llamada" className="h-full min-h-0 overflow-hidden">
          <CallTab />
        </TabsContent>
        <TabsContent value="historial" className="h-full min-h-0 overflow-hidden">
          <CallHistoryPanel />
        </TabsContent>
      </div>
    </Tabs>
  );
}
