"use client";

import { MessageSquareText, Phone } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConversationPanel } from "@/components/pad-mock/conversation-panel";
import { ExternalPagePanel } from "@/components/pad-mock/external-page-panel";
import { paginasExternas } from "@/lib/pad-mock/data";

// Brief §4 — el centro nunca se colapsa. Solapa fija (no se cierra) — dice
// "Llamada" con ícono de teléfono para una interacción telefónica, o
// "Conversación" para el resto. Las demás son páginas externas configurables,
// embebidas o "pestaña aparte" (§4.2). w-full en TabsList para que la línea de
// abajo llegue hasta el borde con la columna de contexto, no solo hasta donde
// terminan las solapas.
export function CenterColumn({ variant }: { variant: "llamada" | "chat" }) {
  const PrimerTabIcon = variant === "llamada" ? Phone : MessageSquareText;
  const primerTabLabel = variant === "llamada" ? "Llamada" : "Conversación";

  return (
    <Tabs defaultValue="conversacion" className="h-full min-h-0 flex-1 gap-0">
      <TabsList variant="line" className="h-10 w-full shrink-0 border-b border-border px-2">
        <TabsTrigger value="conversacion" className="gap-1.5">
          <PrimerTabIcon className="size-4" />
          {primerTabLabel}
        </TabsTrigger>
        {paginasExternas.map((p) => (
          <TabsTrigger key={p.id} value={p.id}>
            {p.nombre}
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
  );
}
