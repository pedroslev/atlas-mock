"use client";

import { useState } from "react";
import { FileText, MessageCircle, Square, Volume2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { AdjuntoChat, MensajeChat } from "@/lib/pad-mock/data";
import { segmentar, tipoDeLinea } from "@/lib/pad-mock/formato-chat";
import { useLeerEnVozAlta } from "@/lib/pad-mock/voz";
import { useT } from "@/lib/i18n";
import { VisorAdjunto } from "@/components/pad-mock/visor-adjunto";

/** El texto de un mensaje sin las marcas de formato, para leerlo en voz alta. */
function textoPlano(texto: string) {
  return texto
    .split("\n")
    .map((l) =>
      segmentar(tipoDeLinea(l).texto)
        .map((s) => s.texto)
        .join("")
    )
    .join(". ");
}

// Texto de un mensaje con su formato (negrita, cursiva, tachado, enlaces y
// listas — ver formato-chat.ts).
function TextoConFormato({ texto }: { texto: string }) {
  return (
    <div className="whitespace-pre-wrap">
      {texto.split("\n").map((linea, i) => {
        const { tipo, marcador, texto: contenido } = tipoDeLinea(linea);
        return (
          <div key={i} className={cn(tipo !== "texto" && "flex gap-1.5 pl-1")}>
            {tipo !== "texto" && <span aria-hidden>{marcador}</span>}
            <span>
              {segmentar(contenido).map((s, j) =>
                s.url ? (
                  <a
                    key={j}
                    href={s.url}
                    className="underline underline-offset-2"
                    onClick={(e) => e.preventDefault()}
                  >
                    {s.texto}
                  </a>
                ) : s.negrita ? (
                  <strong key={j}>{s.texto}</strong>
                ) : s.cursiva ? (
                  <em key={j}>{s.texto}</em>
                ) : s.tachado ? (
                  <s key={j}>{s.texto}</s>
                ) : (
                  <span key={j}>{s.texto}</span>
                )
              )}
              {linea === "" && " "}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// Archivo dentro de una burbuja: la imagen se ve en miniatura; el resto,
// como una ficha con el nombre y el tamaño. Al tocarlo se abre en el visor
// (VisorAdjunto), dentro de Hermes.
function AdjuntoEnMensaje({
  adjunto,
  deAgente,
  onAbrir,
}: {
  adjunto: AdjuntoChat;
  deAgente: boolean;
  onAbrir: () => void;
}) {
  const t = useT();
  if (adjunto.esImagen && adjunto.url) {
    return (
      <button
        type="button"
        onClick={onAbrir}
        aria-label={t("padMock.visor.abrir", { nombre: adjunto.nombre })}
        className="block cursor-zoom-in overflow-hidden rounded-lg focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={adjunto.url} alt={adjunto.nombre} className="max-h-48 object-cover" />
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={onAbrir}
      aria-label={t("padMock.visor.abrir", { nombre: adjunto.nombre })}
      className={cn(
        "flex items-center gap-2 rounded-lg px-2.5 py-2 text-left transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        deAgente ? "bg-primary-foreground/15 hover:bg-primary-foreground/25" : "bg-background hover:bg-background/70"
      )}
    >
      <FileText className="size-5 shrink-0" />
      <div className="flex min-w-0 flex-col">
        <span className="truncate text-sm font-medium">{adjunto.nombre}</span>
        <span className={cn("text-[0.65rem]", deAgente ? "text-primary-foreground/70" : "text-muted-foreground")}>
          {adjunto.tamano}
        </span>
      </div>
    </button>
  );
}

// Burbujas de un chat: cliente a la izquierda (gris), asesor a la derecha
// (azul), cada una con su hora. Las comparten la pantalla de chat en curso
// (conversation-panel.tsx) y el modal de una conversación pasada.
//
// escuchar (chat en curso): al lado de cada mensaje del cliente con texto,
// un botón lo lee en voz alta (otra vez, lo detiene). De a uno por vez.
export function MensajesChat({ mensajes, escuchar = false }: { mensajes: MensajeChat[]; escuchar?: boolean }) {
  const t = useT();
  const voz = useLeerEnVozAlta();
  const [visor, setVisor] = useState<{ adjunto: AdjuntoChat; deCliente: boolean } | null>(null);
  return (
    <div className="flex flex-col gap-2.5">
      <VisorAdjunto adjunto={visor?.adjunto ?? null} deCliente={visor?.deCliente ?? false} onClose={() => setVisor(null)} />
      {mensajes.map((m, i) => (
        <div
          key={i}
          className={cn("group flex items-end gap-1", m.autor === "agente" ? "justify-end" : "justify-start")}
        >
          <div
            className={cn(
              "max-w-[75%] rounded-2xl px-3 py-2 text-sm leading-relaxed",
              m.autor === "agente"
                ? "rounded-br-sm bg-primary text-primary-foreground"
                : "rounded-bl-sm bg-muted text-foreground"
            )}
          >
            {m.adjuntos && m.adjuntos.length > 0 && (
              <div className={cn("flex flex-col gap-1.5", m.texto && "mb-1.5")}>
                {m.adjuntos.map((a, j) => (
                  <AdjuntoEnMensaje
                    key={j}
                    adjunto={a}
                    deAgente={m.autor === "agente"}
                    onAbrir={() => setVisor({ adjunto: a, deCliente: m.autor === "cliente" })}
                  />
                ))}
              </div>
            )}
            {m.texto && <TextoConFormato texto={m.texto} />}
            <p
              className={cn(
                "mt-0.5 text-right font-mono text-[0.65rem]",
                m.autor === "agente" ? "text-primary-foreground/70" : "text-muted-foreground"
              )}
            >
              {m.hora}
            </p>
          </div>
          {escuchar && voz.soportado && m.autor === "cliente" && m.texto && (
            <button
              type="button"
              onClick={() => voz.alternar(i, textoPlano(m.texto))}
              aria-label={voz.leyendo === i ? t("padMock.voz.detener") : t("padMock.voz.escuchar")}
              title={voz.leyendo === i ? t("padMock.voz.detener") : t("padMock.voz.escuchar")}
              className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-opacity hover:bg-muted hover:text-foreground",
                voz.leyendo === i ? "text-primary opacity-100" : "opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
              )}
            >
              {voz.leyendo === i ? <Square className="size-3.5 fill-current" /> : <Volume2 className="size-4" />}
            </button>
          )}
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
