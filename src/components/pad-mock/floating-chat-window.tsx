"use client";

import { useRef } from "react";
import { X } from "lucide-react";
import { mensajesChatInterno, type ChatInterno } from "@/lib/pad-mock/data";
import { cn } from "@/lib/utils";

export type VentanaChat = { chat: ChatInterno; x: number; y: number; z: number };

// Ventana flotante tipo Messenger — position: fixed (no un modal, no queda
// atada al área de contenido: por eso puede taparse con el navbar si el
// agente la arrastra ahí arriba, a propósito). El drag va en el header; el
// resto de la ventana solo trae el foco (subir el z-index) al frente.
export function FloatingChatWindow({
  ventana,
  onClose,
  onFocus,
  onMove,
}: {
  ventana: VentanaChat;
  onClose: () => void;
  onFocus: () => void;
  onMove: (x: number, y: number) => void;
}) {
  const draggingRef = useRef(false);
  const offsetRef = useRef({ x: 0, y: 0 });

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    draggingRef.current = true;
    offsetRef.current = { x: e.clientX - ventana.x, y: e.clientY - ventana.y };
    onFocus();
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!draggingRef.current) return;
    const x = Math.min(Math.max(0, e.clientX - offsetRef.current.x), window.innerWidth - 288);
    const y = Math.min(Math.max(0, e.clientY - offsetRef.current.y), window.innerHeight - 40);
    onMove(x, y);
  }

  function onPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    draggingRef.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
  }

  const mensajes = mensajesChatInterno[ventana.chat.id] ?? [];

  return (
    <div
      className="fixed flex w-72 flex-col overflow-hidden rounded-xl border border-border bg-card shadow-2xl"
      style={{ left: ventana.x, top: ventana.y, zIndex: ventana.z }}
      onPointerDownCapture={onFocus}
    >
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        className="flex shrink-0 cursor-move items-center gap-2 bg-primary px-3 py-2 text-primary-foreground select-none"
      >
        <span className="flex-1 truncate text-sm font-medium">{ventana.chat.nombre}</span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar chat"
          className="flex size-5 shrink-0 items-center justify-center rounded-md hover:bg-white/15"
        >
          <X className="size-3.5" />
        </button>
      </div>
      <div className="flex h-56 flex-col gap-2 overflow-y-auto p-2.5">
        {mensajes.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">Sin mensajes todavía.</p>
        ) : (
          mensajes.map((m, i) => (
            <div key={i} className={cn("flex", m.autor === "agente" ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-2.5 py-1.5 text-xs leading-relaxed",
                  m.autor === "agente"
                    ? "rounded-br-sm bg-primary text-primary-foreground"
                    : "rounded-bl-sm bg-muted text-foreground"
                )}
              >
                {m.texto}
              </div>
            </div>
          ))
        )}
      </div>
      <div className="shrink-0 border-t border-border p-2">
        <input
          type="text"
          placeholder="Escribir…"
          className="w-full rounded-md border border-input bg-transparent px-2 py-1.5 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        />
      </div>
    </div>
  );
}
