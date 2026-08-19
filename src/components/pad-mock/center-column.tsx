"use client";

import { useEffect, useState } from "react";
import { MessageSquareText, Phone } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Kbd } from "@/components/ui/kbd";
import { ConversationPanel } from "@/components/pad-mock/conversation-panel";
import { ExternalPagePanel } from "@/components/pad-mock/external-page-panel";
import { InteractionControls } from "@/components/pad-mock/call-controls";
import { paginasExternas, type Tipificacion } from "@/lib/pad-mock/data";
import { useIsMac } from "@/lib/pad-mock/use-is-mac";

// Brief §4 — el centro nunca se colapsa. Solapa fija (no se cierra) — dice
// "Llamada" con ícono de teléfono para una interacción telefónica, o
// "Conversación" para el resto. Las demás son páginas externas configurables,
// embebidas o "pestaña aparte" (§4.2). w-full en TabsList para que la línea de
// abajo llegue hasta el borde con la columna de contexto, no solo hasta donde
// terminan las solapas.
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
}: {
  variant: "llamada" | "chat";
  tipificaciones: Tipificacion[];
  enEspera: boolean;
  holdStartedAt: number | null;
  onToggleEspera: () => void;
}) {
  const isMac = useIsMac();
  const [tab, setTab] = useState("conversacion");

  useEffect(() => {
    const tabs = ["conversacion", ...paginasExternas.map((p) => p.id)];
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
      if (Number.isNaN(idx) || idx < 0 || idx >= tabs.length) return;
      e.preventDefault();
      setTab(tabs[idx]);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const PrimerTabIcon = variant === "llamada" ? Phone : MessageSquareText;
  const primerTabLabel = variant === "llamada" ? "Llamada" : "Conversación";
  const shortcutMod = isMac ? "⌘⌥" : "Ctrl Alt";

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <Tabs value={tab} onValueChange={setTab} className="min-h-0 flex-1 gap-0">
        <TabsList variant="line" className="h-10 w-full shrink-0 border-b border-border px-2">
          <TabsTrigger value="conversacion" className="gap-1.5">
            <PrimerTabIcon className="size-4" />
            {primerTabLabel}
            <Kbd className="ml-1">{shortcutMod} 1</Kbd>
          </TabsTrigger>
          {paginasExternas.map((p, i) => (
            <TabsTrigger key={p.id} value={p.id} className="gap-1.5">
              <p.icon className="size-4" />
              {p.nombre}
              <Kbd className="ml-1">
                {shortcutMod} {i + 2}
              </Kbd>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="conversacion" className="min-h-0 flex-1 overflow-hidden">
          <ConversationPanel variant={variant} />
        </TabsContent>
        {paginasExternas.map((p) => (
          <TabsContent key={p.id} value={p.id} className="min-h-0 flex-1 overflow-hidden">
            <ExternalPagePanel pagina={p} />
          </TabsContent>
        ))}
      </Tabs>

      <InteractionControls
        variant={variant}
        tipificaciones={tipificaciones}
        enEspera={enEspera}
        holdStartedAt={holdStartedAt}
        onToggleEspera={onToggleEspera}
      />
    </div>
  );
}
