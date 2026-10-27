"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Categories, EmojiStyle } from "emoji-picker-react";
import { ArrowDown, ChevronsUpDown, FileText, Paperclip, Phone, PhoneOutgoing, SmilePlus } from "lucide-react";
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
import { MensajesChat } from "@/components/pad-mock/conversacion-chat";
import { plantillasMensaje, type MensajeChat } from "@/lib/pad-mock/data";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

// Chat: hilo de mensajes arriba (cliente a la izquierda, asesor a la
// derecha) con "Volver al vivo", y el redactor abajo. Traído de la branch
// feature/pad-mock-omnicanal; la franja de Copiloto queda afuera.
function HiloChat({ mensajes }: { mensajes: MensajeChat[] }) {
  const t = useT();
  return (
    <div className="relative flex-1 overflow-y-auto p-4">
      <MensajesChat mensajes={mensajes} />

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

// Se carga solo al abrir el selector: el listado completo de emojis es
// pesado. Misma librería y configuración que el editor de plantillas de
// Olimpo (ATLAS-1191), para que los dos selectores se vean igual.
const EmojiPicker = dynamic(() => import("emoji-picker-react"), { ssr: false });

// Categorías del selector de emojis, en el orden en que se muestran; el
// nombre visible sale del diccionario (idioma del aplicativo).
const CATEGORIAS_EMOJI = [
  Categories.SUGGESTED,
  Categories.SMILEYS_PEOPLE,
  Categories.ANIMALS_NATURE,
  Categories.FOOD_DRINK,
  Categories.TRAVEL_PLACES,
  Categories.ACTIVITIES,
  Categories.OBJECTS,
  Categories.SYMBOLS,
  Categories.FLAGS,
];

// Botón de emojis del redactor: todos los emojis, con buscador y categorías.
// El elegido se inserta donde está el cursor. Mock con emoji-picker-react;
// la librería definitiva y el idioma del buscador (hoy busca en inglés) se
// definen con el Architect.
function EmojiSelector({ onElegir }: { onElegir: (emoji: string) => void }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          aria-label={t("padMock.conversationPanel.emoji")}
          title={t("padMock.conversationPanel.emoji")}
        >
          <SmilePlus className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start" side="top">
        <EmojiPicker
          onEmojiClick={(e) => {
            onElegir(e.emoji);
            setOpen(false);
          }}
          searchPlaceholder={t("padMock.conversationPanel.buscarEmoji")}
          previewConfig={{ showPreview: false }}
          skinTonesDisabled
          emojiStyle={EmojiStyle.NATIVE}
          categories={CATEGORIAS_EMOJI.map((c) => ({
            category: c,
            name: t(`padMock.emojiCat.${c}`),
          }))}
          style={
            {
              "--epr-emoji-size": "20px",
              "--epr-category-navigation-button-size": "22px",
              "--epr-category-label-height": "28px",
              fontSize: 13,
            } as React.CSSProperties
          }
          width={300}
          height={300}
        />
      </PopoverContent>
    </Popover>
  );
}

// Redactor: Enter envía (Shift+Enter hace salto de línea); adjuntar, emojis
// y plantillas en línea, arriba del área de texto.
function Redactor() {
  const t = useT();
  const [texto, setTexto] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Inserta el emoji donde está el cursor (o reemplaza lo seleccionado) y
  // deja el cursor justo después, para seguir escribiendo.
  function insertarEmoji(emoji: string) {
    const el = textareaRef.current;
    const inicio = el?.selectionStart ?? texto.length;
    const fin = el?.selectionEnd ?? texto.length;
    setTexto(texto.slice(0, inicio) + emoji + texto.slice(fin));
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(inicio + emoji.length, inicio + emoji.length);
    });
  }

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
        <EmojiSelector onElegir={insertarEmoji} />
        <PlantillaSelector onElegir={setTexto} />
        <Button size="sm" onClick={enviar} className="shrink-0 gap-1.5">
          {t("padMock.conversationPanel.enviar")}
          <Kbd className="bg-primary-foreground/15 text-primary-foreground">Enter</Kbd>
        </Button>
      </div>
      <Textarea
        ref={textareaRef}
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
  mensajesChat,
  interno = false,
  sonando = false,
  nombreInterno,
  onSimularForzada,
  onSimularRechazo,
}: {
  tiempo: string;
  enEspera: boolean;
  /** Chat: lo conversado hasta ahora. Sin esto, es una llamada. */
  mensajesChat?: MensajeChat[];
  interno?: boolean;
  sonando?: boolean;
  nombreInterno?: string;
  onSimularForzada?: () => void;
  onSimularRechazo?: () => void;
}) {
  const t = useT();
  if (mensajesChat) {
    return (
      <div className="flex h-full min-h-0 flex-col">
        <HiloChat mensajes={mensajesChat} />
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
