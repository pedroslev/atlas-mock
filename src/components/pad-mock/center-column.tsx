"use client";

import { useEffect, useState } from "react";
import { ExternalLink, MessageSquareText, Phone } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Kbd } from "@/components/ui/kbd";
import { ConversationPanel } from "@/components/pad-mock/conversation-panel";
import { ExternalPagePanel } from "@/components/pad-mock/external-page-panel";
import { InteractionControls } from "@/components/pad-mock/call-controls";
import { paginasExternas, type Tipificacion } from "@/lib/pad-mock/data";
import { ALTO_CABECERA_COLUMNA } from "@/lib/pad-mock/layout";
import { useIsMac } from "@/lib/pad-mock/use-is-mac";
import { useNow, formatDuration } from "@/lib/pad-mock/use-now";
import { cn } from "@/lib/utils";

// Brief §4 — el centro nunca se colapsa. Solapa fija (no se cierra) — dice
// "Llamada" con ícono de teléfono para una interacción telefónica, o
// "Conversación" para el resto. Las demás son páginas externas configurables,
// embebidas o "pestaña aparte" (§4.2). w-full en TabsList para que la línea de
// abajo llegue hasta el borde con la columna de contexto, no solo hasta donde
// terminan las solapas. min-w-0 en el contenedor y en Tabs: sin esto, la
// columna no se achica cuando el contexto crece y el layout se rompe.
//
// El cronómetro de la interacción vive ACÁ (antes en InteractionControls) y
// se muestra al lado del título de la solapa fija — a pedido, sacado de la
// barra de controles de abajo.
//
// InteractionControls vive FUERA del Tabs (a pedido: la barra de controles
// de la interacción queda visible siempre, no solo en Conversación/Llamada).
//
// Ctrl/Cmd+Alt+N salta a la solapa N (1 = Conversación/Llamada, 2… = cada
// integración) — mismo "número = posición" que Alt+N en la cola, con un
// modificador extra para no chocar con ese atajo ni con nada del navegador.
export function CenterColumn({
  variant,
  tipificaciones,
  enEspera,
  holdStartedAt,
  onToggleEspera,
  onCerrarInteraccion,
}: {
  variant: "llamada" | "chat";
  tipificaciones: Tipificacion[];
  enEspera: boolean;
  holdStartedAt: number | null;
  onToggleEspera: () => void;
  onCerrarInteraccion: () => void;
}) {
  const isMac = useIsMac();
  const [tab, setTab] = useState("conversacion");
  const [startedAt] = useState(() => Date.now());
  const now = useNow(true);
  const elapsedTotal = Math.max(0, Math.floor((now - startedAt) / 1000));
  const elapsedHold = holdStartedAt ? Math.max(0, Math.floor((now - holdStartedAt) / 1000)) : 0;

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const mod = e.ctrlKey || e.metaKey;
      if (!mod || !e.altKey || e.shiftKey || e.repeat) return;
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
      const idx = Number(e.key) - 1;
      if (Number.isNaN(idx) || idx < 0 || idx > paginasExternas.length) return;
      e.preventDefault();
      // Posición 1 = Llamada/Conversación (siempre una solapa). Del resto,
      // las "pestana" (solo externas) no se seleccionan — abren su link
      // aparte, igual que al clickearlas.
      if (idx === 0) {
        setTab("conversacion");
        return;
      }
      const p = paginasExternas[idx - 1];
      if (!p) return;
      if (p.modo === "pestana") {
        window.open(p.url, "_blank", "noopener,noreferrer");
      } else {
        setTab(p.id);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const PrimerTabIcon = variant === "llamada" ? Phone : MessageSquareText;
  const primerTabLabel = variant === "llamada" ? "Llamada" : "Conversación";
  const shortcutMod = isMac ? "⌘⌥" : "Ctrl Alt";

  return (
    <div className="flex h-full min-h-0 w-0 flex-1 flex-col bg-background">
      <Tabs value={tab} onValueChange={setTab} className="min-h-0 w-full flex-1 gap-0">
        {/* ALTO_CABECERA_COLUMNA: mismo alto que la cabecera "Contexto" de
            ContextColumn (fuente única compartida — ver layout.ts), para
            que las dos columnas arranquen alineadas. La solapa fija
            (Llamada/Conversación) queda sticky a la izquierda con su propio
            fondo — a pedido, no se va con el resto cuando el overflow-x-auto
            hace scroll por la cantidad de páginas externas. */}
        <TabsList
          variant="line"
          className={cn(
            ALTO_CABECERA_COLUMNA,
            "w-full shrink-0 justify-start overflow-x-auto overflow-y-hidden border-b border-border px-2"
          )}
        >
          {/* flex-none: la base de TabsTrigger trae flex-1 (pensada para
              tabs tipo segmented control que reparten el ancho disponible) —
              acá cada solapa mide lo que mide su contenido, si no se
              estiraba y el contenido quedaba centrado a mitad del sobrante.
              bg-background! (con !important): sin forzarlo, pierde contra
              las variantes data-active/dark de TabsTrigger y se veían las
              solapas de atrás pasando por detrás del texto al hacer scroll. */}
          <TabsTrigger
            value="conversacion"
            className="sticky left-0 z-10 flex-none gap-1.5 bg-background!"
          >
            <PrimerTabIcon className="size-4" />
            {primerTabLabel}
            <span
              className={cn(
                "font-mono text-sm font-bold tabular-nums",
                enEspera ? "text-warning" : "text-foreground"
              )}
            >
              {formatDuration(enEspera ? elapsedHold : elapsedTotal)}
            </span>
            <Kbd className="ml-1">{shortcutMod} 1</Kbd>
          </TabsTrigger>
          {paginasExternas.map((p, i) =>
            p.modo === "pestana" ? (
              // Solo externa ("blank"): no es una solapa seleccionable — un
              // click abre pagina.url directo en pestaña nueva y no queda
              // marcada como activa (a pedido: "no deje seleccionado el
              // botón como si se posicionara allí").
              <button
                key={p.id}
                type="button"
                onClick={() => window.open(p.url, "_blank", "noopener,noreferrer")}
                className="relative inline-flex h-[calc(100%-1px)] flex-none items-center justify-center gap-1.5 rounded-md border border-transparent px-1.5 py-0.5 text-sm font-medium whitespace-nowrap text-foreground/60 transition-all hover:bg-muted/60 hover:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-1 focus-visible:outline-ring [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
              >
                <p.icon className="size-4" />
                {p.nombre}
                <ExternalLink className="size-3 text-muted-foreground" />
                <Kbd className="ml-1">
                  {shortcutMod} {i + 2}
                </Kbd>
              </button>
            ) : (
              <TabsTrigger key={p.id} value={p.id} className="flex-none gap-1.5">
                <p.icon className="size-4" />
                {p.nombre}
                <Kbd className="ml-1">
                  {shortcutMod} {i + 2}
                </Kbd>
              </TabsTrigger>
            )
          )}
        </TabsList>

        <TabsContent value="conversacion" className="min-h-0 flex-1 overflow-hidden">
          <ConversationPanel variant={variant} />
        </TabsContent>
        {paginasExternas
          .filter((p) => p.modo === "embebido")
          .map((p) => (
            <TabsContent key={p.id} value={p.id} className="min-h-0 flex-1 overflow-hidden">
              <ExternalPagePanel pagina={p} />
            </TabsContent>
          ))}
      </Tabs>

      <InteractionControls
        variant={variant}
        tipificaciones={tipificaciones}
        enEspera={enEspera}
        onToggleEspera={onToggleEspera}
        onCerrarInteraccion={onCerrarInteraccion}
      />
    </div>
  );
}
