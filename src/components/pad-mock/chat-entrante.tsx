"use client";

import { MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n";
import type { ChatEntrante } from "@/lib/pad-mock/data";

// Aviso de chat entrante de una campaña SIN atención forzada: el agente lo
// acepta o lo rechaza (y el sistema se lo deriva a otro agente). Mismo lugar
// y forma que el aviso de llamada interna entrante (abajo a la derecha, sin
// tapar lo que el agente esté haciendo). Con atención forzada no hay aviso:
// el chat entra directo a las interacciones en curso.
export function ChatEntranteAviso({
  chat,
  onAceptar,
  onRechazar,
}: {
  chat: ChatEntrante;
  onAceptar: () => void;
  onRechazar: () => void;
}) {
  const t = useT();
  const primerMensaje = chat.mensajes.find((m) => m.autor === "cliente");
  return (
    <div
      role="alertdialog"
      aria-label={t("padMock.chatEntrante.titulo")}
      className="fixed right-6 bottom-6 z-50 flex w-80 flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-lg"
    >
      <div className="flex items-center gap-3">
        <span className="relative flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/20" />
          <MessageCircle className="size-5" />
        </span>
        <div className="flex min-w-0 flex-col">
          <span className="text-xs text-muted-foreground">{t("padMock.chatEntrante.titulo")}</span>
          <span className="truncate text-sm font-semibold">{chat.nombre}</span>
          <span className="truncate text-xs text-muted-foreground">{chat.campania}</span>
        </div>
      </div>
      {primerMensaje && (
        <p className="line-clamp-2 rounded-lg bg-muted px-3 py-2 text-xs text-foreground">{primerMensaje.texto}</p>
      )}
      <div className="flex gap-2">
        <Button type="button" variant="outline" className="flex-1 gap-1.5" onClick={onRechazar}>
          <X className="size-4" />
          {t("padMock.chatEntrante.rechazar")}
        </Button>
        <Button type="button" className="flex-1 gap-1.5 bg-success text-white hover:bg-success/90" onClick={onAceptar}>
          <MessageCircle className="size-4" />
          {t("padMock.chatEntrante.aceptar")}
        </Button>
      </div>
    </div>
  );
}
