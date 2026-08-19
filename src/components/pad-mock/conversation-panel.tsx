"use client";

import { useState } from "react";
import { ArrowDown, Check, ChevronsUpDown, FileText, Paperclip, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Kbd } from "@/components/ui/kbd";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import {
  copilotoChat,
  copilotoLlamada,
  mensajesChat,
  plantillasMensaje,
  transcripcionLlamada,
} from "@/lib/pad-mock/data";
import { OpenQuestion } from "@/components/pad-mock/open-question";
import { InfoHint } from "@/components/pad-mock/info-hint";

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

// Selector de plantillas — combobox con buscador (mismo patrón que
// Tipificación), cada opción con su "i" de descripción al hover.
function PlantillaSelector({ onElegir }: { onElegir: (texto: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          size="sm"
          className="min-w-0 flex-1 justify-between font-normal"
        >
          <span className="flex min-w-0 items-center gap-1.5 truncate">
            <FileText className="size-3.5 shrink-0 text-muted-foreground" />
            <span className="truncate">Plantillas de mensajes…</span>
          </span>
          <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar plantilla…" />
          <CommandList>
            <CommandEmpty>Sin resultados.</CommandEmpty>
            <CommandGroup>
              {plantillasMensaje.map((p) => (
                <CommandItem
                  key={p.id}
                  value={p.nombre}
                  onSelect={() => {
                    onElegir(p.texto);
                    setOpen(false);
                  }}
                >
                  <span className="flex-1">{p.nombre}</span>
                  <InfoHint>{p.descripcion}</InfoHint>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// Brief §4.1 — redactor: solo para canales de texto. Enter envía (Shift+Enter
// hace salto de línea); adjuntar y plantillas en línea, arriba del área de
// texto. El selector de canal de salida se retiró a pedido.
function Redactor({ texto, onTextoChange }: { texto: string; onTextoChange: (v: string) => void }) {
  function enviar() {
    if (!texto.trim()) return;
    onTextoChange("");
  }

  return (
    <div className="flex shrink-0 flex-col gap-2 border-t border-border p-3">
      <div className="flex items-center gap-1.5">
        <Button variant="outline" size="icon-sm" aria-label="Adjuntar archivo" title="Adjuntar archivo">
          <Paperclip className="size-4" />
        </Button>
        <PlantillaSelector onElegir={onTextoChange} />
        <Button size="sm" onClick={enviar} className="shrink-0 gap-1.5">
          Enviar
          <Kbd className="bg-primary-foreground/15 text-primary-foreground">Enter</Kbd>
        </Button>
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
