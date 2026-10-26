"use client";

import { useState } from "react";
import { ArrowDown, ChevronsUpDown, FileText, Paperclip, Phone, PhoneOutgoing } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Kbd } from "@/components/ui/kbd";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { InfoHint } from "@/components/pad-mock/info-hint";
import { mensajesChat, plantillasMensaje } from "@/lib/pad-mock/data";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

// Chat: hilo de mensajes arriba (cliente a la izquierda, asesor a la
// derecha) con "Volver al vivo", y el redactor abajo. Traído de la branch
// feature/pad-mock-omnicanal; la franja de Copiloto queda afuera.
function HiloChat() {
  const t = useT();
  return (
    <div className="relative flex-1 overflow-y-auto p-4">
      <div className="flex flex-col gap-2.5">
        {mensajesChat.map((m, i) => (
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

      <Button
        variant="outline"
        size="sm"
        className="absolute bottom-3 left-1/2 -translate-x-1/2 gap-1.5 shadow-sm"
      >
        <ArrowDown className="size-3.5" />
        {t("padMock.conversationPanel.volverAlVivo")}
      </Button>
    </div>
  );
}

// Selector de plantillas — combobox con buscador (mismo patrón que
// Tipificación), cada opción con su "i" de descripción al hover.
function PlantillaSelector({ onElegir }: { onElegir: (texto: string) => void }) {
  const t = useT();
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
            <span className="truncate">{t("padMock.conversationPanel.plantillas")}</span>
          </span>
          <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="start">
        <Command>
          <CommandInput placeholder={t("padMock.conversationPanel.buscarPlantilla")} />
          <CommandList>
            <CommandEmpty>{t("padMock.callControls.sinResultados")}</CommandEmpty>
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

// Redactor: Enter envía (Shift+Enter hace salto de línea); adjuntar y
// plantillas en línea, arriba del área de texto.
function Redactor() {
  const t = useT();
  const [texto, setTexto] = useState("");

  function enviar() {
    if (!texto.trim()) return;
    setTexto("");
  }

  return (
    <div className="flex shrink-0 flex-col gap-2 border-t border-border p-3">
      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="icon-sm"
          aria-label={t("padMock.conversationPanel.adjuntar")}
          title={t("padMock.conversationPanel.adjuntar")}
        >
          <Paperclip className="size-4" />
        </Button>
        <PlantillaSelector onElegir={setTexto} />
        <Button size="sm" onClick={enviar} className="shrink-0 gap-1.5">
          {t("padMock.conversationPanel.enviar")}
          <Kbd className="bg-primary-foreground/15 text-primary-foreground">Enter</Kbd>
        </Button>
      </div>
      <Textarea
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            enviar();
          }
        }}
        placeholder={t("padMock.conversationPanel.placeholder")}
        rows={3}
        className="resize-none"
      />
    </div>
  );
}

// Llamada: placeholder simple (sin transcripción, retirada a pedido) para
// no dejar el área vacía sin explicación.
//
// tiempo/enEspera: mismo cronómetro que ya se muestra en el título de la
// solapa (CenterColumn) — a pedido, se repite acá abajo de "Llamada en
// curso" para que se vea también en el cuerpo del panel, no solo arriba.
//
// Llamada interna: muestra con quién es la llamada (o "Llamando a…" mientras
// el otro agente no atiende) y los simuladores de rechazo y de una entrante
// con atención forzada, que la pone en espera.
export function ConversationPanel({
  tiempo,
  enEspera,
  chat = false,
  interno = false,
  sonando = false,
  nombreInterno,
  onSimularForzada,
  onSimularRechazo,
}: {
  tiempo: string;
  enEspera: boolean;
  chat?: boolean;
  interno?: boolean;
  sonando?: boolean;
  nombreInterno?: string;
  onSimularForzada?: () => void;
  onSimularRechazo?: () => void;
}) {
  const t = useT();
  if (chat) {
    return (
      <div className="flex h-full min-h-0 flex-col">
        <HiloChat />
        <Redactor />
      </div>
    );
  }
  if (interno) {
    return (
      <div className="flex h-full min-h-0 flex-col items-center justify-center gap-2 p-4 text-center text-muted-foreground">
        {sonando ? (
          <>
            <PhoneOutgoing className="size-6 animate-pulse" />
            <p className="text-sm">{t("padMock.llamadaInterna.llamando", { nombre: nombreInterno ?? "" })}</p>
            {onSimularRechazo && (
              <button
                type="button"
                onClick={onSimularRechazo}
                className="mt-4 text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
              >
                {t("padMock.llamadaInterna.simularRechazo")}
              </button>
            )}
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
