"use client";

import { MessageCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { MensajeChat } from "@/lib/pad-mock/data";

// Burbujas de un chat: cliente a la izquierda (gris), asesor a la derecha
// (azul), cada una con su hora. Las comparten la pantalla de chat en curso
// (conversation-panel.tsx) y el modal de una conversación pasada.
export function MensajesChat({ mensajes }: { mensajes: MensajeChat[] }) {
  return (
    <div className="flex flex-col gap-2.5">
      {mensajes.map((m, i) => (
        <div key={i} className={cn("flex", m.autor === "agente" ? "justify-end" : "justify-start")}>
          <div
            className={cn(
              "max-w-[75%] rounded-2xl px-3 py-2 text-sm leading-relaxed",
              m.autor === "agente"
                ? "rounded-br-sm bg-primary text-primary-foreground"
                : "rounded-bl-sm bg-muted text-foreground"
            )}
          >
            <p>{m.texto}</p>
            <p
              className={cn(
                "mt-0.5 text-right font-mono text-[0.65rem]",
                m.autor === "agente" ? "text-primary-foreground/70" : "text-muted-foreground"
              )}
            >
              {m.hora}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// "Ver conversación" de un chat del historial: lo conversado, en solo
// lectura, tal como se vio en la pantalla de chat.
export function ConversacionChatDialog({
  open,
  onOpenChange,
  titulo,
  mensajes,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Ej. "Chat · 18/08/2026 · Nicolás Aguirre". */
  titulo: string;
  mensajes: MensajeChat[];
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-1.5 text-base">
            <MessageCircle className="size-4 text-muted-foreground" />
            {titulo}
          </DialogTitle>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto pr-1">
          <MensajesChat mensajes={mensajes} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
