"use client";

import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { GripHorizontal, MessagesSquare, Minus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HiloChat, Redactor } from "@/components/pad-mock/conversation-panel";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { AdjuntoChat, MensajeChat } from "@/lib/pad-mock/data";

// Tamaño fijo de la ventana y margen mínimo contra los bordes de la pantalla.
const ANCHO = 400;
const ALTO = 520;
const MARGEN = 8;
// Cada ventana nueva se abre corrida respecto de la anterior, para que no
// queden una exactamente encima de la otra.
const CORRIMIENTO = 28;

/** Deja la ventana entera dentro de la pantalla. */
function dentroDePantalla(x: number, y: number) {
  return {
    x: Math.min(Math.max(MARGEN, x), Math.max(MARGEN, window.innerWidth - ANCHO - MARGEN)),
    y: Math.min(Math.max(MARGEN, y), Math.max(MARGEN, window.innerHeight - ALTO - MARGEN)),
  };
}

// Chat interno entre dos agentes, como ventana flotante sobre el pad: el
// asesor la arrastra desde la cabecera y la deja donde quiera, también encima
// de la interacción del cliente, para consultar a un compañero o a su
// supervisor sin salir de lo que está atendiendo. No toma el centro ni cambia
// la interacción activa.
//
// Mismo criterio que la llamada interna (no hay cliente: sin columna de
// contexto, sin páginas externas, sin tipificación), con el hilo y el
// redactor del chat con clientes sin plantillas: texto con formato, emojis,
// archivos y notas de voz. No ocupa al agente: no cambia su estado y le
// siguen llegando interacciones.
//
// Minimizada no se desmonta (queda oculta): conserva el hilo, lo que se
// estaba escribiendo y la posición. Se vuelve a abrir desde su fila en
// "Internas" del menú izquierdo.
//
// MOCK: el otro agente acepta siempre a los 3 segundos y nunca contesta; lo
// que se escribe (y los archivos) se suma al hilo local. "Simular…" existen
// solo para mostrar el rechazo y el cierre del otro lado. La posición vive en
// la ventana y se pierde al recargar.
// REAL: hermes-worker. Iniciar es POST /api/internal-chats; mientras el otro
// no acepta llega internal_chat.ringing y vence a los 30 s. Aceptado, los
// mensajes y los archivos viajan por los mismos chat.send / chat.message /
// chat.upload_request del chat con clientes, identificados por
// internal_chat_id, sobre una conversación de atlas-iris con dos
// participantes de rol asesor. La posición y el minimizado son del navegador:
// no viajan al servidor. Ver
// documentacion/producto/funcionalidades/chats-internos/.
export function ChatInternoVentana({
  nombre,
  esperando,
  finalizadoPorElOtro,
  minimizada,
  orden,
  capa,
  onEnfocar,
  onMinimizar,
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
  /** Oculta (sigue montada); se reabre desde su fila del menú izquierdo. */
  minimizada: boolean;
  /** Número de ventana (0, 1, 2…): corre la posición inicial. */
  orden: number;
  /** Capa: la última ventana tocada queda encima de las demás. */
  capa: number;
  /** Trae la ventana al frente. */
  onEnfocar: () => void;
  onMinimizar: () => void;
  /** Cancelar (mientras espera), finalizar (abierto) o cerrar (ya finalizado). */
  onFinalizar: () => void;
  onSimularRechazo?: () => void;
  onSimularFinDelOtro?: () => void;
}) {
  const t = useT();
  const [mensajes, setMensajes] = useState<MensajeChat[]>([]);
  // Arranca abajo a la derecha, corrida según cuántas ventanas haya.
  const [pos, setPos] = useState(() =>
    dentroDePantalla(
      window.innerWidth - ANCHO - 24 - orden * CORRIMIENTO,
      window.innerHeight - ALTO - 24 - orden * CORRIMIENTO
    )
  );
  // Distancia entre el puntero y la esquina de la ventana mientras se arrastra.
  const arrastre = useRef<{ dx: number; dy: number } | null>(null);

  // Suma el mensaje al hilo. REAL: chat.send; el mensaje aparece cuando
  // vuelve su chat.message.
  function enviar(texto: string, adjuntos: AdjuntoChat[]) {
    const hora = new Date().toLocaleTimeString("es-AR", { hour12: false });
    setMensajes((cur) => [
      ...cur,
      { autor: "agente", texto, hora, adjuntos: adjuntos.length > 0 ? adjuntos : undefined },
    ]);
  }

  // Arrastre desde la cabecera. Los botones de la cabecera no arrastran.
  function empezarArrastre(e: ReactPointerEvent<HTMLElement>) {
    if ((e.target as HTMLElement).closest("button")) return;
    arrastre.current = { dx: e.clientX - pos.x, dy: e.clientY - pos.y };
    e.currentTarget.setPointerCapture(e.pointerId);
  }
  function arrastrar(e: ReactPointerEvent<HTMLElement>) {
    if (!arrastre.current) return;
    setPos(dentroDePantalla(e.clientX - arrastre.current.dx, e.clientY - arrastre.current.dy));
  }
  function soltar() {
    arrastre.current = null;
  }

  return (
    <section
      role="dialog"
      aria-label={`${t("padMock.chatInterno.titulo")}: ${nombre}`}
      data-testid="chat-interno-ventana"
      hidden={minimizada}
      onPointerDownCapture={onEnfocar}
      className={cn(
        "fixed flex flex-col overflow-hidden rounded-xl border border-border bg-background shadow-2xl",
        minimizada && "hidden"
      )}
      style={{ left: pos.x, top: pos.y, width: ANCHO, height: ALTO, zIndex: capa }}
    >
      <header
        onPointerDown={empezarArrastre}
        onPointerMove={arrastrar}
        onPointerUp={soltar}
        onPointerCancel={soltar}
        data-testid="chat-interno-cabecera"
        className="flex shrink-0 cursor-grab touch-none items-center gap-2 border-b border-border bg-muted/50 px-3 py-2 select-none active:cursor-grabbing"
      >
        <GripHorizontal className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        <MessagesSquare className="size-4 shrink-0 text-muted-foreground" />
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-sm font-semibold" data-testid="chat-interno-nombre">
            {nombre}
          </span>
          <span className="text-xs text-muted-foreground">{t("padMock.chatInterno.titulo")}</span>
        </div>
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          aria-label={t("padMock.chatInterno.minimizar")}
          title={t("padMock.chatInterno.minimizar")}
          data-testid="chat-interno-minimizar"
          onClick={onMinimizar}
        >
          <Minus className="size-4" />
        </Button>
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
    </section>
  );
}
