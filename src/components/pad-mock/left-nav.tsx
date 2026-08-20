"use client";

import { useState } from "react";
import { CalendarClock, ChevronsLeft, ChevronsRight, ExternalLink, History, LayoutGrid, Link2, Plus } from "lucide-react";
import { Kbd } from "@/components/ui/kbd";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";
import { AgentStatusSelectorMock } from "@/components/pad-mock/agent-status-selector-mock";
import { NewInteractionDialog } from "@/components/pad-mock/new-interaction-dialog";
import { ResizeHandle } from "@/components/pad-mock/resize-handle";
import { useNow, formatDuration } from "@/lib/pad-mock/use-now";
import {
  accesosRapidosMock,
  CANAL_ICON,
  formatEspera,
  type CampaniaSaliente,
  type CuentaSaliente,
  type FilaCola,
  type PaginaExterna,
} from "@/lib/pad-mock/data";

// A pedido: por ahora el ícono de accesos rápidos no es configurable por
// ítem (ni menú ni interacción) — todos comparten este mismo genérico.
const ICONO_ACCESO_RAPIDO = Link2;

export type Modo = "interaccion" | "estadisticas" | "historial";

const ANCHO_MIN = 168;
const ANCHO_MAX = 320;
const ANCHO_INICIAL = 200;

// Mismo patrón visual que el sidenav REAL de Hermes: bloque de estado
// arriba, ítems de navegación abajo. A diferencia del real, este colapsa a
// pedido explícito del agente (botón), no solo por viewport angosto, y su
// ancho expandido es ajustable a mano (ResizeHandle). La cola (brief §3)
// vive acá, entre el estado y el resto de la navegación — cada fila abre esa
// interacción, reemplazando la vieja solapa única "Llamada".
export function LeftNav({
  modo,
  onModo,
  cola,
  interaccionActivaId,
  onSeleccionarInteraccion,
  onIniciarInteraccion,
  accesoActivoId,
  onAbrirAcceso,
  enEspera,
  holdStartedAt,
  estadoAgenteId,
  estadoAgenteDesde,
  onEstadoAgenteChange,
  ultimaCampaniaId,
  ultimaCuentaId,
}: {
  modo: Modo;
  onModo: (m: Modo) => void;
  cola: FilaCola[];
  interaccionActivaId: string | null;
  onSeleccionarInteraccion: (id: string) => void;
  onIniciarInteraccion: (campania: CampaniaSaliente, cuenta: CuentaSaliente, numero: string) => void;
  accesoActivoId: string | null;
  onAbrirAcceso: (id: string) => void;
  enEspera: boolean;
  holdStartedAt: number | null;
  estadoAgenteId: string;
  estadoAgenteDesde: number;
  onEstadoAgenteChange: (id: string) => void;
  ultimaCampaniaId?: string;
  ultimaCuentaId?: string;
}) {
  const t = useT();
  const [colapsado, setColapsado] = useState(false);
  const [ancho, setAncho] = useState(ANCHO_INICIAL);
  const [nuevaInteraccionAbierta, setNuevaInteraccionAbierta] = useState(false);
  // Tickea siempre: lo usa tanto el cronómetro del estado del agente (arriba
  // del todo) como el tiempo en espera de la fila en Hold.
  const now = useNow(true);
  const cronometroEstado = formatDuration(Math.max(0, Math.floor((now - estadoAgenteDesde) / 1000)));

  // Solo externo ("pestana"/"blank"): abre el link directo en pestaña nueva
  // y no queda marcado como seleccionado — a pedido, no debe "posicionarse"
  // ahí como si fuera un acceso embebido.
  function manejarAcceso(a: PaginaExterna) {
    if (a.modo === "pestana") {
      window.open(a.url, "_blank", "noopener,noreferrer");
      return;
    }
    onAbrirAcceso(a.id);
  }

  const dialogos = (
    <>
      <NewInteractionDialog
        open={nuevaInteraccionAbierta}
        onOpenChange={setNuevaInteraccionAbierta}
        onContactar={onIniciarInteraccion}
        campaniaIdInicial={ultimaCampaniaId}
        cuentaIdInicial={ultimaCuentaId}
      />
    </>
  );

  if (colapsado) {
    return (
      <aside className="flex h-full w-12 shrink-0 flex-col items-center gap-2 border-r border-sidebar-border bg-sidebar p-1.5 text-sidebar-foreground">
        <Button variant="ghost" size="icon-sm" aria-label={t("padMock.leftNav.expandirMenu")} onClick={() => setColapsado(false)}>
          <ChevronsRight className="size-4" />
        </Button>

        <AgentStatusSelectorMock
          colapsado
          estadoId={estadoAgenteId}
          onEstadoIdChange={onEstadoAgenteChange}
          cronometro={cronometroEstado}
        />

        {/* Cola + Accesos rápidos comparten una sola región flexible (a
            pedido: con la cola vacía, antes cada una era flex-1 aparte y
            quedaba un hueco enorme entre "Sin interacciones" y Accesos
            rápidos — la cola crecía igual aunque no tuviera nada adentro). */}
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          <div className="flex shrink-0 flex-col gap-1">
            {cola.map((f, i) => {
              const Icon = CANAL_ICON[f.canal];
              const activa = modo === "interaccion" && f.id === interaccionActivaId;
              return (
                <button
                  key={f.id}
                  type="button"
                  title={`${f.numeroCliente} · Alt+${i + 1}`}
                  onClick={() => onSeleccionarInteraccion(f.id)}
                  aria-current={activa ? "true" : undefined}
                  className={cn(
                    "flex size-8 items-center justify-center rounded-lg transition-colors",
                    activa ? "bg-sidebar-accent text-sidebar-accent-foreground" : "hover:bg-sidebar-accent/60"
                  )}
                >
                  <Icon className="size-4" />
                </button>
              );
            })}
          </div>

          <div className="mt-2 flex max-h-[6.5rem] shrink-0 flex-col gap-1 overflow-y-auto border-t border-sidebar-border pt-2">
            {accesosRapidosMock.map((a) => (
              <button
                key={a.id}
                type="button"
                title={a.nombre}
                onClick={() => manejarAcceso(a)}
                aria-current={accesoActivoId === a.id ? "true" : undefined}
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-lg",
                  accesoActivoId === a.id ? "bg-sidebar-accent text-sidebar-accent-foreground" : "hover:bg-sidebar-accent/60"
                )}
              >
                <ICONO_ACCESO_RAPIDO className="size-4" />
              </button>
            ))}
          </div>
        </div>

        <div className="mt-auto flex flex-col gap-1 border-t border-sidebar-border pt-1.5">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={t("padMock.leftNav.miTurno")}
            title={t("padMock.leftNav.miTurno")}
            onClick={() => onModo("estadisticas")}
            className={cn(modo === "estadisticas" && "bg-sidebar-accent text-sidebar-accent-foreground")}
          >
            <CalendarClock className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={t("padMock.leftNav.historial")}
            title={t("padMock.leftNav.historial")}
            onClick={() => onModo("historial")}
            className={cn(modo === "historial" && "bg-sidebar-accent text-sidebar-accent-foreground")}
          >
            <History className="size-4" />
          </Button>
        </div>

        {dialogos}
      </aside>
    );
  }

  return (
    <aside
      className="relative flex h-full shrink-0 flex-col gap-2 border-r border-sidebar-border bg-sidebar p-2 text-sidebar-foreground"
      style={{ width: ancho }}
    >
      <ResizeHandle side="right" onResize={(d) => setAncho((w) => Math.min(ANCHO_MAX, Math.max(ANCHO_MIN, w + d)))} />

      <div className="flex items-center justify-between">
        <span className="px-1 text-[0.65rem] font-medium text-muted-foreground">{t("padMock.leftNav.miEstado")}</span>
        <Button variant="ghost" size="icon-sm" aria-label={t("padMock.leftNav.contraerMenu")} onClick={() => setColapsado(true)}>
          <ChevronsLeft className="size-3.5" />
        </Button>
      </div>
      <div className="-mt-1 border-b border-sidebar-border pb-2">
        <AgentStatusSelectorMock
          colapsado={false}
          estadoId={estadoAgenteId}
          onEstadoIdChange={onEstadoAgenteChange}
          cronometro={cronometroEstado}
        />
      </div>

      {/* Cola + Accesos rápidos comparten una sola región flexible (a
          pedido: con la cola vacía, antes cada una era flex-1 aparte y
          quedaba un hueco enorme entre "Sin interacciones en curso" y
          Accesos rápidos — la cola crecía igual aunque no tuviera nada
          adentro). Alt+N salta a la fila N de la cola (ver el listener
          global en pad-mock-shell.tsx). Si la interacción activa está en
          Hold, su fila muestra el tiempo en espera (ámbar) en vez del
          tiempo de cola original. */}
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        <div className="flex shrink-0 flex-col gap-1">
          <div className="flex items-center justify-between px-1">
            <span className="text-[0.65rem] font-medium text-muted-foreground">{t("padMock.leftNav.interaccionesEnCurso")}</span>
            <button
              type="button"
              aria-label={t("padMock.leftNav.iniciarInteraccion")}
              title={t("padMock.leftNav.iniciarInteraccion")}
              onClick={() => setNuevaInteraccionAbierta(true)}
              className="flex size-5 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <Plus className="size-3.5" />
            </button>
          </div>
          <div className="flex flex-col gap-0.5">
            {cola.length === 0 && (
              <p className="px-1.5 py-1 text-xs text-muted-foreground italic">{t("padMock.leftNav.sinInteracciones")}</p>
            )}
            {cola.map((f, i) => {
              const Icon = CANAL_ICON[f.canal];
              const activa = modo === "interaccion" && f.id === interaccionActivaId;
              const enHold = activa && enEspera && holdStartedAt !== null;
              const tiempo = enHold
                ? formatDuration(Math.max(0, Math.floor((now - holdStartedAt) / 1000)))
                : formatEspera(f.esperaSeg);
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => onSeleccionarInteraccion(f.id)}
                  aria-current={activa ? "true" : undefined}
                  aria-keyshortcuts={`Alt+${i + 1}`}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-1.5 py-1.5 text-left text-xs transition-colors",
                    activa
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60"
                  )}
                >
                  <Icon className="size-3.5 shrink-0" />
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate font-medium tabular-nums">{f.numeroCliente}</span>
                  </span>
                  <span
                    className={cn(
                      "shrink-0 font-mono text-[0.65rem] tabular-nums",
                      enHold ? "font-semibold text-warning" : "text-muted-foreground"
                    )}
                  >
                    {tiempo}
                  </span>
                  <Kbd className="shrink-0">Alt {i + 1}</Kbd>
                </button>
              );
            })}
          </div>
        </div>

        {/* Accesos rápidos ("shortcut buttons") — no pertenecen a ninguna
            interacción puntual. Ícono genérico compartido (a pedido, por
            ahora no es configurable por ítem — ver ICONO_ACCESO_RAPIDO). Al
            elegir uno, pad-mock-shell.tsx tapa TODO el área de contenido
            (menos este menú y el navbar) con QuickAccessOverlay — no es un
            modal. A pedido, la lista muestra como máximo 3 accesos y el
            resto queda atrás de scroll propio (max-h calculado para 3 filas
            de 28px + 2 gaps de 2px), independiente del scroll de la cola. */}
        <div className="mt-2 flex shrink-0 flex-col gap-1 border-t border-sidebar-border pt-2">
          <span className="px-1 text-[0.65rem] font-medium text-muted-foreground">{t("padMock.leftNav.accesosRapidos")}</span>
          <div className="flex max-h-[5.5rem] flex-col gap-0.5 overflow-y-auto">
          {accesosRapidosMock.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => manejarAcceso(a)}
              aria-current={accesoActivoId === a.id ? "true" : undefined}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-1.5 py-1.5 text-left text-xs transition-colors",
                accesoActivoId === a.id
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60"
              )}
            >
              <ICONO_ACCESO_RAPIDO className="size-3.5 shrink-0" />
              <span className="min-w-0 flex-1 truncate">{a.nombre}</span>
              {a.modo === "pestana" ? (
                <ExternalLink className="size-3 shrink-0 text-muted-foreground" />
              ) : (
                <LayoutGrid className="size-3 shrink-0 text-muted-foreground" />
              )}
            </button>
          ))}
          </div>
        </div>
      </div>

      {/* Mi turno / Historial del agente — siempre pegados al fondo del
          menú (mt-auto), sin importar cuánto ocupe la cola. */}
      <div className="mt-auto flex shrink-0 flex-col gap-0.5 border-t border-sidebar-border pt-1.5">
        <button
          type="button"
          onClick={() => onModo("estadisticas")}
          aria-current={modo === "estadisticas" ? "true" : undefined}
          className={cn(
            "flex h-8 w-full items-center gap-2 rounded-lg px-2 text-xs transition-colors",
            modo === "estadisticas"
              ? "bg-sidebar-accent text-sidebar-accent-foreground"
              : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60"
          )}
        >
          <CalendarClock className="size-4 shrink-0" />
          {t("padMock.leftNav.miTurno")}
        </button>
        <button
          type="button"
          onClick={() => onModo("historial")}
          aria-current={modo === "historial" ? "true" : undefined}
          className={cn(
            "flex h-8 w-full items-center gap-2 rounded-lg px-2 text-xs transition-colors",
            modo === "historial"
              ? "bg-sidebar-accent text-sidebar-accent-foreground"
              : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60"
          )}
        >
          <History className="size-4 shrink-0" />
          {t("padMock.leftNav.historial")}
        </button>
      </div>

      {dialogos}
    </aside>
  );
}
