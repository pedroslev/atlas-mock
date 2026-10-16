"use client";

import { Phone, PhoneOutgoing } from "lucide-react";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { OpenQuestion } from "@/components/pad-mock/open-question";

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
//
// Llamada interna: muestra con quién es la llamada (o "Llamando a…" mientras
// el otro agente no atiende) y el simulador de una entrante con atención
// forzada, que la pone en espera.
export function ConversationPanel({
  tiempo,
  enEspera,
  interno = false,
  sonando = false,
  nombreInterno,
  onSimularForzada,
}: {
  tiempo: string;
  enEspera: boolean;
  interno?: boolean;
  sonando?: boolean;
  nombreInterno?: string;
  onSimularForzada?: () => void;
}) {
  const t = useT();
  if (interno) {
    return (
      <div className="flex h-full min-h-0 flex-col items-center justify-center gap-2 p-4 text-center text-muted-foreground">
        {sonando ? (
          <>
            <PhoneOutgoing className="size-6 animate-pulse" />
            <p className="text-sm">{t("padMock.llamadaInterna.llamando", { nombre: nombreInterno ?? "" })}</p>
            <OpenQuestion className="mt-2 max-w-sm text-left">
              Si el otro agente rechaza o no atiende, ¿se le muestra al que llama que lo rechazaron, o
              solo que la llamada terminó? (Teams no distingue un rechazo de una llamada no atendida.)
            </OpenQuestion>
          </>
        ) : (
          <>
            <Phone className="size-6" />
            <p className="text-sm">{t("padMock.llamadaInterna.enCursoCon", { nombre: nombreInterno ?? "" })}</p>
            <span
              className={cn(
                "font-mono text-2xl font-bold tabular-nums",
                enEspera ? "text-warning" : "text-foreground"
              )}
            >
              {tiempo}
            </span>
            {onSimularForzada && (
              <button
                type="button"
                onClick={onSimularForzada}
                className="mt-4 text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
              >
                {t("padMock.llamadaInterna.simularForzada")}
              </button>
            )}
          </>
        )}
      </div>
    );
  }
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
