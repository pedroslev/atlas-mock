"use client";

import { useState } from "react";
import { ArrowDown, Check, Paperclip, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  copilotoChat,
  copilotoLlamada,
  mensajesChat,
  plantillasMensaje,
  transcripcionLlamada,
} from "@/lib/pad-mock/data";
import { OpenQuestion } from "@/components/pad-mock/open-question";

// Brief §4.1 — el hilo cambia de contenido según el tipo de interacción, pero
// nunca de lugar: siempre arriba, siempre con autoscroll + "volver al vivo".
function Hilo({ variant }: { variant: "llamada" | "chat" }) {
  return (
    <div className="relative flex-1 overflow-y-auto p-4">
      {variant === "llamada" ? (
        <div className="flex flex-col gap-3">
          {transcripcionLlamada.map((t, i) => (
            <p key={i} className="text-sm leading-relaxed">
              <span
                className={cn(
                  "font-semibold",
                  t.turno === "agente" ? "text-primary" : "text-foreground"
                )}
              >
                {t.turno === "agente" ? "Agente: " : "Cliente: "}
              </span>
              {t.texto}
            </p>
          ))}
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground italic">
            <span className="flex gap-0.5">
              <span className="size-1 animate-pulse rounded-full bg-muted-foreground" />
              <span className="size-1 animate-pulse rounded-full bg-muted-foreground [animation-delay:150ms]" />
              <span className="size-1 animate-pulse rounded-full bg-muted-foreground [animation-delay:300ms]" />
            </span>
            transcribiendo…
          </p>
          <OpenQuestion>de dónde sale esta transcripción y cuánto tarda en aparecer.</OpenQuestion>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {mensajesChat.map((m, i) => (
            <div
              key={i}
              className={cn("flex", m.autor === "agente" ? "justify-end" : "justify-start")}
            >
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
      )}

      <Button
        variant="outline"
        size="sm"
        className="absolute bottom-3 left-1/2 -translate-x-1/2 gap-1.5 shadow-sm"
      >
        <ArrowDown className="size-3.5" />
        Volver al vivo
      </Button>
    </div>
  );
}

// Brief §4.1 — franja de copiloto. Chat: sugerencia de TEXTO, "Aceptar" la
// vuelca en el redactor (nunca se manda sola). Llamada: no hay texto que
// sugerir, muestra un próximo paso — la franja se hace más alta porque no
// convive con un redactor.
function FranjaCopiloto({
  variant,
  onAceptarChat,
}: {
  variant: "llamada" | "chat";
  onAceptarChat?: (texto: string) => void;
}) {
  const [aceptado, setAceptado] = useState(false);

  return (
    <div
      className={cn(
        "flex shrink-0 items-start gap-2.5 border-y border-border bg-accent/60 px-4",
        variant === "llamada" ? "py-3.5" : "py-2.5"
      )}
    >
      <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
        <Sparkles className="size-3.5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[0.65rem] font-semibold tracking-wide text-muted-foreground uppercase">
          Copiloto
        </p>
        <p className="text-sm text-foreground/90">
          {variant === "llamada" ? copilotoLlamada.texto : copilotoChat.texto}
        </p>
      </div>
      {aceptado ? (
        <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-success">
          <Check className="size-3.5" />
          Aceptado
        </span>
      ) : (
        <Button
          size="sm"
          variant="outline"
          className="shrink-0"
          onClick={() => {
            setAceptado(true);
            if (variant === "chat") onAceptarChat?.(copilotoChat.texto);
          }}
        >
          {variant === "llamada" ? copilotoLlamada.accion : "Aceptar"}
        </Button>
      )}
    </div>
  );
}

// Brief §4.1 — redactor: solo para canales de texto. Enter envía (Shift+Enter
// hace salto de línea); adjuntar y plantillas de mensajes al pie. El
// selector de canal de salida se retiró a pedido.
function Redactor({ texto, onTextoChange }: { texto: string; onTextoChange: (v: string) => void }) {
  function enviar() {
    if (!texto.trim()) return;
    onTextoChange("");
  }

  return (
    <div className="flex shrink-0 flex-col gap-2 border-t border-border p-3">
      <div className="flex items-center gap-2">
        <Select
          onValueChange={(id) => {
            const plantilla = plantillasMensaje.find((p) => p.id === id);
            if (plantilla) onTextoChange(plantilla.texto);
          }}
        >
          <SelectTrigger size="sm" className="w-44">
            <SelectValue placeholder="Plantillas de mensajes…" />
          </SelectTrigger>
          <SelectContent>
            {plantillasMensaje.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Textarea
        value={texto}
        onChange={(e) => onTextoChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            enviar();
          }
        }}
        placeholder="Escribí tu respuesta… (Enter para enviar, Shift+Enter para salto de línea)"
        rows={3}
        className="resize-none"
      />
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon-sm" aria-label="Adjuntar archivo" title="Adjuntar archivo">
          <Paperclip className="size-4" />
        </Button>
        <Button size="sm" onClick={enviar}>
          Enviar
        </Button>
      </div>
    </div>
  );
}

export function ConversationPanel({ variant }: { variant: "llamada" | "chat" }) {
  const [texto, setTexto] = useState("");

  return (
    <div className="flex h-full min-h-0 flex-col">
      <Hilo variant={variant} />
      <FranjaCopiloto variant={variant} onAceptarChat={setTexto} />
      {variant === "chat" && <Redactor texto={texto} onTextoChange={setTexto} />}
    </div>
  );
}
