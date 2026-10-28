"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Categories, EmojiStyle } from "emoji-picker-react";
import {
  ArrowDown,
  Bold,
  CaseSensitive,
  ChevronsUpDown,
  FileText,
  Italic,
  Link2,
  List,
  ListOrdered,
  Paperclip,
  Phone,
  PhoneOutgoing,
  SmilePlus,
  Strikethrough,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ActionTooltip } from "@/components/layout/action-tooltip";
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
  const hiloRef = useRef<HTMLDivElement>(null);
  // Cada mensaje nuevo (por ejemplo, uno que acaba de enviar el asesor) deja
  // el hilo abajo de todo, en lo último.
  useEffect(() => {
    hiloRef.current?.scrollTo({ top: hiloRef.current.scrollHeight });
  }, [mensajes.length]);
  return (
    <div ref={hiloRef} className="relative flex-1 overflow-y-auto p-4">
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

// Redactor: Enter envía (Shift+Enter hace salto de línea); adjuntar, emojis,
// formato y plantillas en línea, arriba del área de texto.
//
// Formato: un solo botón "Aa", cerrado por defecto, para que el cuadro quede
// limpio (mismo criterio que Zendesk, que lo esconde detrás de un botón).
// Abierto, muestra una barra chica con negrita, cursiva, tachado, viñetas,
// lista numerada y enlace — el mismo conjunto que las plantillas. Ctrl/Cmd+B
// y Ctrl/Cmd+I dan negrita y cursiva sin abrirla.
function Redactor({ onEnviar }: { onEnviar: (texto: string) => void }) {
  const t = useT();
  const [texto, setTexto] = useState("");
  const [formatoAbierto, setFormatoAbierto] = useState(false);
  const [enlaceAbierto, setEnlaceAbierto] = useState(false);
  const [enlaceTexto, setEnlaceTexto] = useState("");
  const [enlaceUrl, setEnlaceUrl] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // Selección del cuadro al abrir el enlace: el foco pasa a sus campos.
  const seleccionEnlaceRef = useRef({ a: 0, b: 0 });

  function enviar() {
    if (!texto.trim()) return;
    onEnviar(texto.trim());
    setTexto("");
  }

  // Selección a aplicar apenas el cuadro muestra el texto nuevo (sin esperar
  // un cuadro de animación: si el asesor sigue tipeando rápido, el cursor ya
  // está en su lugar).
  const seleccionPendienteRef = useRef<[number, number] | null>(null);
  useLayoutEffect(() => {
    const sel = seleccionPendienteRef.current;
    if (!sel) return;
    seleccionPendienteRef.current = null;
    textareaRef.current?.focus();
    textareaRef.current?.setSelectionRange(sel[0], sel[1]);
  }, [texto]);

  /** Reemplaza el texto por `nuevo` y deja seleccionado [selA, selB). */
  function editar(nuevo: string, selA: number, selB: number) {
    seleccionPendienteRef.current = [selA, selB];
    setTexto(nuevo);
  }

  // Inserta el emoji donde está el cursor (o reemplaza lo seleccionado) y
  // deja el cursor justo después, para seguir escribiendo.
  function insertarEmoji(emoji: string) {
    const el = textareaRef.current;
    const inicio = el?.selectionStart ?? texto.length;
    const fin = el?.selectionEnd ?? texto.length;
    editar(texto.slice(0, inicio) + emoji + texto.slice(fin), inicio + emoji.length, inicio + emoji.length);
  }

  /** Envuelve lo seleccionado con la marca; sin selección, deja el cursor en el medio. */
  function envolver(marca: string) {
    const el = textareaRef.current;
    const a = el?.selectionStart ?? texto.length;
    const b = el?.selectionEnd ?? texto.length;
    const nuevo = texto.slice(0, a) + marca + texto.slice(a, b) + marca + texto.slice(b);
    editar(nuevo, a + marca.length, b + marca.length);
  }

  /** Viñeta ("- ") o número ("N. ", siguiendo la línea anterior) al inicio de la línea actual. */
  function listar(tipo: "vineta" | "numero") {
    const a = textareaRef.current?.selectionStart ?? texto.length;
    const inicioLinea = texto.lastIndexOf("\n", a - 1) + 1;
    let marca = "- ";
    if (tipo === "numero") {
      const anterior = texto.slice(0, inicioLinea).split("\n").at(-2) ?? "";
      const n = anterior.match(/^(\d+)\. /);
      marca = `${n ? Number(n[1]) + 1 : 1}. `;
    }
    editar(texto.slice(0, inicioLinea) + marca + texto.slice(inicioLinea), a + marca.length, a + marca.length);
  }

  function abrirEnlace(abrir: boolean) {
    if (abrir) {
      const el = textareaRef.current;
      const a = el?.selectionStart ?? texto.length;
      const b = el?.selectionEnd ?? texto.length;
      seleccionEnlaceRef.current = { a, b };
      setEnlaceTexto(texto.slice(a, b));
      setEnlaceUrl("");
    }
    setEnlaceAbierto(abrir);
  }

  function insertarEnlace() {
    const url = enlaceUrl.trim();
    if (!url) return;
    const { a, b } = seleccionEnlaceRef.current;
    const enlace = `[${enlaceTexto.trim() || url}](${url})`;
    editar(texto.slice(0, a) + enlace + texto.slice(b), a + enlace.length, a + enlace.length);
    setEnlaceAbierto(false);
  }

  const botonesFormato = [
    { icon: Bold, label: t("padMock.conversationPanel.negrita"), atajo: "Ctrl+B", accion: () => envolver("**") },
    { icon: Italic, label: t("padMock.conversationPanel.cursiva"), atajo: "Ctrl+I", accion: () => envolver("_") },
    { icon: Strikethrough, label: t("padMock.conversationPanel.tachado"), accion: () => envolver("~~") },
    { icon: List, label: t("padMock.conversationPanel.lista"), accion: () => listar("vineta") },
    { icon: ListOrdered, label: t("padMock.conversationPanel.listaNumerada"), accion: () => listar("numero") },
  ];

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
        <Button
          type="button"
          variant={formatoAbierto ? "secondary" : "outline"}
          size="icon-sm"
          aria-pressed={formatoAbierto}
          aria-label={t("padMock.conversationPanel.formato")}
          title={t("padMock.conversationPanel.formato")}
          onClick={() => setFormatoAbierto((v) => !v)}
        >
          <CaseSensitive className="size-4" />
        </Button>
        <PlantillaSelector onElegir={setTexto} />
        <Button size="sm" onClick={enviar} className="shrink-0 gap-1.5">
          {t("padMock.conversationPanel.enviar")}
          <Kbd className="bg-primary-foreground/15 text-primary-foreground">Enter</Kbd>
        </Button>
      </div>
      {formatoAbierto && (
        <div className="flex items-center gap-0.5 rounded-md border border-border bg-muted/40 p-0.5">
          {botonesFormato.map((b) => (
            <ActionTooltip key={b.label} label={b.atajo ? `${b.label} (${b.atajo})` : b.label}>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={b.label}
                // Sin robarle el foco al cuadro: así la selección sigue ahí.
                onMouseDown={(e) => e.preventDefault()}
                onClick={b.accion}
              >
                <b.icon className="size-4" />
              </Button>
            </ActionTooltip>
          ))}
          <Popover open={enlaceAbierto} onOpenChange={abrirEnlace}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={t("padMock.conversationPanel.enlace")}
                title={t("padMock.conversationPanel.enlace")}
                onMouseDown={(e) => e.preventDefault()}
              >
                <Link2 className="size-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="flex w-72 flex-col gap-3" align="start" side="top">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="chat-enlace-texto">{t("padMock.conversationPanel.enlaceTexto")}</Label>
                <Input
                  id="chat-enlace-texto"
                  value={enlaceTexto}
                  onChange={(e) => setEnlaceTexto(e.target.value)}
                  placeholder={t("padMock.conversationPanel.enlaceTextoPlaceholder")}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="chat-enlace-url">{t("padMock.conversationPanel.enlaceUrl")}</Label>
                <Input
                  id="chat-enlace-url"
                  value={enlaceUrl}
                  onChange={(e) => setEnlaceUrl(e.target.value)}
                  placeholder="https://"
                  onKeyDown={(e) => e.key === "Enter" && insertarEnlace()}
                />
              </div>
              <Button type="button" size="sm" onClick={insertarEnlace} disabled={!enlaceUrl.trim()}>
                {t("padMock.conversationPanel.insertarEnlace")}
              </Button>
            </PopoverContent>
          </Popover>
        </div>
      )}
      <Textarea
        ref={textareaRef}
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        onKeyDown={(e) => {
          const mod = e.ctrlKey || e.metaKey;
          if (mod && !e.altKey && !e.shiftKey && (e.key === "b" || e.key === "B")) {
            e.preventDefault();
            envolver("**");
            return;
          }
          if (mod && !e.altKey && !e.shiftKey && (e.key === "i" || e.key === "I")) {
            e.preventDefault();
            envolver("_");
            return;
          }
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

// Chat en curso: el hilo arriba y el redactor abajo. Lo que envía el asesor
// se suma al hilo (con su formato) — en el mock no hay cliente del otro lado.
function ChatPanel({ mensajesIniciales }: { mensajesIniciales: MensajeChat[] }) {
  const [mensajes, setMensajes] = useState(mensajesIniciales);
  function enviar(texto: string) {
    const hora = new Date().toLocaleTimeString("es-AR", { hour12: false });
    setMensajes((cur) => [...cur, { autor: "agente", texto, hora }]);
  }
  return (
    <div className="flex h-full min-h-0 flex-col">
      <HiloChat mensajes={mensajes} />
      <Redactor onEnviar={enviar} />
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
    return <ChatPanel mensajesIniciales={mensajesChat} />;
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
