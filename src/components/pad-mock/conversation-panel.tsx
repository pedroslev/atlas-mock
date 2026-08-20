"use client";

import { Phone } from "lucide-react";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

// A pedido, se retiraron para esta fase: el chat como canal (redactor,
// plantillas, hilo de mensajes), la franja de Copiloto y la transcripción
// de la llamada. Lo único que queda de esta solapa es la barra de
// controles (InteractionControls, fuera de este panel, en CenterColumn) —
// este panel es un placeholder simple para no dejar el área vacía sin
// explicación mientras se define qué va acá en la próxima fase.
//
// tiempo/enEspera: mismo cronómetro que ya se muestra en el título de la
// solapa (CenterColumn) — a pedido, se repite acá abajo de "Llamada en
// curso" para que se vea también en el cuerpo del panel, no solo arriba.
export function ConversationPanel({
  tiempo,
  enEspera,
}: {
  tiempo: string;
  enEspera: boolean;
}) {
  const t = useT();
  return (
    <div className="flex h-full min-h-0 flex-col items-center justify-center gap-2 p-4 text-center text-muted-foreground">
      <Phone className="size-6" />
      <p className="text-sm">{t("padMock.conversationPanel.llamadaEnCurso")}</p>
      <span
        className={cn(
          "font-mono text-2xl font-bold tabular-nums",
          enEspera ? "text-warning" : "text-foreground"
        )}
      >
        {tiempo}
      </span>
    </div>
  );
}
