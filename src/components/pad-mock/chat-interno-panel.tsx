"use client";

import { useState } from "react";
import { MessagesSquare, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HiloChat, Redactor } from "@/components/pad-mock/conversation-panel";
import { useT } from "@/lib/i18n";
import type { AdjuntoChat, MensajeChat } from "@/lib/pad-mock/data";

// Chat interno entre dos agentes: ocupa el centro del pad cuando su fila es
// la activa. Mismo criterio que la llamada interna (no hay cliente: sin
// columna de contexto, sin páginas externas, sin tipificación), pero con el
// hilo y el redactor del chat con clientes sin plantillas: texto con formato,
// emojis, archivos y notas de voz.
//
// A diferencia de la llamada interna, no ocupa al agente: no cambia su
// estado y le siguen llegando interacciones mientras el chat está abierto.
//
// MOCK: el otro agente acepta siempre a los 3 segundos y nunca contesta; lo
// que se escribe (y los archivos) se suma al hilo local. "Simular…" existen solo para mostrar
// el rechazo y el cierre del otro lado.
// REAL: hermes-worker. Iniciar es POST /api/internal-chats; mientras el otro
// no acepta llega internal_chat.ringing y vence a los 30 s. Aceptado, los
// mensajes y los archivos viajan por los mismos chat.send / chat.message /
// chat.upload_request del chat con clientes, identificados por internal_chat_id, sobre una conversación de
// atlas-iris con dos participantes de rol asesor. Ver
// documentacion/producto/funcionalidades/chats-internos/.
export function ChatInternoPanel({
  nombre,
  esperando,
  finalizadoPorElOtro,
  onFinalizar,
  onSimularRechazo,
  onSimularFinDelOtro,
}: {
  /** Nombre del otro agente. */
  nombre: string;
  /** Todavía no aceptó: no se puede escribir, solo cancelar. */
  esperando: boolean;
  /** El otro agente finalizó el chat: el hilo queda de solo lectura. */
  finalizadoPorElOtro: boolean;
  /** Cancelar (mientras espera), finalizar (abierto) o cerrar (ya finalizado). */
  onFinalizar: () => void;
  onSimularRechazo?: () => void;
  onSimularFinDelOtro?: () => void;
}) {
  const t = useT();
  const [mensajes, setMensajes] = useState<MensajeChat[]>([]);

  // Suma el mensaje al hilo. REAL: chat.send; el mensaje aparece cuando
  // vuelve su chat.message.
  function enviar(texto: string, adjuntos: AdjuntoChat[]) {
    const hora = new Date().toLocaleTimeString("es-AR", { hour12: false });
    setMensajes((cur) => [
      ...cur,
      { autor: "agente", texto, hora, adjuntos: adjuntos.length > 0 ? adjuntos : undefined },
    ]);
  }

  return (
    <div className="flex h-full min-h-0 w-0 flex-1 flex-col bg-background" data-testid="chat-interno-panel">
      <header className="flex shrink-0 items-center gap-3 border-b border-border px-5 py-3">
        <MessagesSquare className="size-5 text-muted-foreground" />
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-sm font-semibold" data-testid="chat-interno-nombre">
            {nombre}
          </span>
          <span className="text-xs text-muted-foreground">{t("padMock.chatInterno.titulo")}</span>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="gap-1.5"
          data-testid="chat-interno-finalizar"
          onClick={onFinalizar}
        >
          <X className="size-4" />
          {esperando
            ? t("padMock.chatInterno.cancelar")
            : finalizadoPorElOtro
              ? t("padMock.chatInterno.cerrar")
              : t("padMock.chatInterno.finalizar")}
        </Button>
      </header>

      {esperando ? (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-2 p-4 text-center text-muted-foreground">
          <MessagesSquare className="size-6 animate-pulse" />
          <p className="text-sm" data-testid="chat-interno-esperando">
            {t("padMock.chatInterno.esperando", { nombre })}
          </p>
          {onSimularRechazo && (
            <button
              type="button"
              onClick={onSimularRechazo}
              className="mt-4 text-xs underline-offset-2 hover:text-foreground hover:underline"
            >
              {t("padMock.llamadaInterna.simularRechazo")}
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="min-h-0 flex-1">
            {mensajes.length === 0 ? (
              <p className="p-6 text-center text-sm text-muted-foreground">
                {t("padMock.chatInterno.vacio", { nombre })}
              </p>
            ) : (
              <HiloChat mensajes={mensajes} />
            )}
          </div>
          {finalizadoPorElOtro ? (
            <p
              className="shrink-0 border-t border-border px-4 py-3 text-center text-sm text-muted-foreground"
              data-testid="chat-interno-finalizado"
            >
              {t("padMock.chatInterno.finalizadoPorElOtro", { nombre })}
            </p>
          ) : (
            <Redactor onEnviar={enviar} sinPlantillas />
          )}
          {onSimularFinDelOtro && !finalizadoPorElOtro && (
            <button
              type="button"
              onClick={onSimularFinDelOtro}
              className="shrink-0 pb-2 text-center text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
            >
              {t("padMock.chatInterno.simularFinDelOtro")}
            </button>
          )}
        </>
      )}
    </div>
  );
}
