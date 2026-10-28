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
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ActionTooltip } from "@/components/layout/action-tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { ADJUNTOS_CHAT, plantillasMensaje, type AdjuntoChat, type MensajeChat } from "@/lib/pad-mock/data";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useIsMac } from "@/lib/pad-mock/use-is-mac";

// Chat: hilo de mensajes arriba (cliente a la izquierda, asesor a la
// derecha) con "Volver al vivo", y el redactor abajo. Traído de la branch
// feature/pad-mock-omnicanal; la franja de Copiloto queda afuera.
// Distancia al final (px) a partir de la cual el asesor "perdió el vivo".
const UMBRAL_VIVO_PX = 48;
// Atajo de "Volver al vivo": funciona desde cualquier lugar del chat, también
// con el foco en el cuadro de texto, y solo actúa si el vivo está perdido.
const ATAJO_VIVO: AtajoFormato = { shift: true, code: "ArrowDown", tecla: "↓" };

function HiloChat({ mensajes }: { mensajes: MensajeChat[] }) {
  const t = useT();
  const isMac = useIsMac();
  const hiloRef = useRef<HTMLDivElement>(null);
  // "Volver al vivo" aparece solo cuando el asesor sube y deja de ver lo
  // último; al volver abajo (scrolleando o con el botón) desaparece.
  const [fueraDelVivo, setFueraDelVivo] = useState(false);

  function actualizarVivo() {
    const el = hiloRef.current;
    if (!el) return;
    setFueraDelVivo(el.scrollHeight - el.scrollTop - el.clientHeight > UMBRAL_VIVO_PX);
  }

  function volverAlVivo() {
    const el = hiloRef.current;
    el?.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }

  // Cada mensaje nuevo (por ejemplo, uno que acaba de enviar el asesor) deja
  // el hilo abajo de todo, en lo último.
  useEffect(() => {
    hiloRef.current?.scrollTo({ top: hiloRef.current.scrollHeight });
    actualizarVivo();
  }, [mensajes.length]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!fueraDelVivo || !(e.ctrlKey || e.metaKey) || e.altKey || !e.shiftKey) return;
      if (e.key !== "ArrowDown") return;
      e.preventDefault();
      volverAlVivo();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fueraDelVivo]);

  return (
    <div className="relative min-h-0 flex-1">
      <div ref={hiloRef} onScroll={actualizarVivo} className="h-full overflow-y-auto p-4">
        <MensajesChat mensajes={mensajes} />
      </div>

      {fueraDelVivo && (
        <Button
          variant="outline"
          size="sm"
          onClick={volverAlVivo}
          className="absolute bottom-3 left-1/2 -translate-x-1/2 gap-1.5 shadow-sm"
        >
          <ArrowDown className="size-3.5" />
          {t("padMock.conversationPanel.volverAlVivo")}
          <Kbd className="ml-0.5">{etiquetaAtajo(ATAJO_VIVO, isMac)}</Kbd>
        </Button>
      )}
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

const EXTENSIONES_IMAGEN = ADJUNTOS_CHAT.imagen.extensiones;
const EXTENSIONES_ARCHIVO = ADJUNTOS_CHAT.archivo.extensiones;
// Filtro del selector de archivos del sistema: muestra solo los tipos que se
// pueden mandar (los demás aparecen deshabilitados u ocultos).
const ACCEPT_ADJUNTOS = [...EXTENSIONES_IMAGEN, ...EXTENSIONES_ARCHIVO].map((e) => `.${e}`).join(",");

export function formatoTamano(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1).replace(".", ",")} MB`;
}

export type AdjuntoExterno = { id: number; adjunto: AdjuntoChat };

type ArchivoRechazado = { nombre: string; motivo: "tipo" | "tamano"; maxMB?: number };

/** Revisa tipo y tamaño de un archivo elegido. */
function revisarArchivo(f: File): { ok: AdjuntoChat } | { rechazo: ArchivoRechazado } {
  const ext = f.name.includes(".") ? f.name.split(".").pop()!.toLowerCase() : "";
  const esImagen = EXTENSIONES_IMAGEN.includes(ext);
  if (!esImagen && !EXTENSIONES_ARCHIVO.includes(ext)) {
    return { rechazo: { nombre: f.name, motivo: "tipo" } };
  }
  const maxMB = esImagen ? ADJUNTOS_CHAT.imagen.maxMB : ADJUNTOS_CHAT.archivo.maxMB;
  if (f.size > maxMB * 1024 * 1024) {
    return { rechazo: { nombre: f.name, motivo: "tamano", maxMB } };
  }
  return {
    ok: {
      nombre: f.name,
      tamano: formatoTamano(f.size),
      esImagen,
      url: esImagen ? URL.createObjectURL(f) : undefined,
    },
  };
}

// Atajos de formato del redactor — los mismos que usan Slack y Gmail, así el
// asesor no tiene que aprender nada nuevo. Se comparan por tecla física
// (code) para que Shift+7 / Shift+8 funcionen igual con teclado en español.
// Solo actúan con el foco en el cuadro de texto (los atajos de la barra de
// controles de la interacción se ignoran ahí).
type AtajoFormato = { shift: boolean; code: string; tecla: string };
const ATAJOS_FORMATO = {
  negrita: { shift: false, code: "KeyB", tecla: "B" },
  cursiva: { shift: false, code: "KeyI", tecla: "I" },
  tachado: { shift: true, code: "KeyX", tecla: "X" },
  lista: { shift: true, code: "Digit8", tecla: "8" },
  listaNumerada: { shift: true, code: "Digit7", tecla: "7" },
  enlace: { shift: false, code: "KeyK", tecla: "K" },
} satisfies Record<string, AtajoFormato>;

/** Si la tecla apretada es la del atajo: por tecla física y, si el navegador
 *  no la informa, por la letra. */
function esTecla(e: React.KeyboardEvent, a: AtajoFormato) {
  return e.code ? e.code === a.code : e.key.toLowerCase() === a.tecla.toLowerCase();
}

function etiquetaAtajo(a: AtajoFormato, isMac: boolean) {
  return isMac ? `⌘${a.shift ? "⇧" : ""}${a.tecla}` : `Ctrl+${a.shift ? "Shift+" : ""}${a.tecla}`;
}

// Redactor: Enter envía (Shift+Enter hace salto de línea); adjuntar, emojis,
// formato y plantillas en línea, arriba del área de texto.
//
// Formato: un solo botón "Aa", cerrado por defecto, para que el cuadro quede
// limpio (mismo criterio que Zendesk, que lo esconde detrás de un botón).
// Abierto, muestra una barra chica con negrita, cursiva, tachado, viñetas,
// lista numerada y enlace — el mismo conjunto que las plantillas. Cada una
// tiene su atajo (ATAJOS_FORMATO), que funciona aunque la barra esté cerrada.
//
// Adjuntar: el selector de archivos ya filtra los tipos que se pueden mandar,
// pero el asesor puede pedirle "todos los archivos" y el tamaño no se puede
// filtrar antes; por eso, al elegir, se revisa de nuevo y lo que no se puede
// mandar se avisa en un diálogo. Lo que sí, queda como ficha arriba del
// cuadro hasta enviar (se puede quitar).
//
// adjuntoNuevo: un adjunto que llega de afuera (la captura de imagen de la
// videollamada); cada id nuevo se suma a las fichas, igual que uno elegido.
function Redactor({
  onEnviar,
  adjuntoNuevo,
}: {
  onEnviar: (texto: string, adjuntos: AdjuntoChat[]) => void;
  adjuntoNuevo?: AdjuntoExterno;
}) {
  const t = useT();
  const isMac = useIsMac();
  const [texto, setTexto] = useState("");
  const [adjuntos, setAdjuntos] = useState<AdjuntoChat[]>([]);
  const [adjuntoNuevoVisto, setAdjuntoNuevoVisto] = useState(adjuntoNuevo?.id);
  if (adjuntoNuevo && adjuntoNuevo.id !== adjuntoNuevoVisto) {
    setAdjuntoNuevoVisto(adjuntoNuevo.id);
    setAdjuntos((cur) => [...cur, adjuntoNuevo.adjunto]);
  }
  const [rechazados, setRechazados] = useState<ArchivoRechazado[]>([]);
  const archivoRef = useRef<HTMLInputElement>(null);
  const [formatoAbierto, setFormatoAbierto] = useState(false);
  const [enlaceAbierto, setEnlaceAbierto] = useState(false);
  const [enlaceTexto, setEnlaceTexto] = useState("");
  const [enlaceUrl, setEnlaceUrl] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // Selección del cuadro al abrir el enlace: el foco pasa a sus campos.
  const seleccionEnlaceRef = useRef({ a: 0, b: 0 });

  function enviar() {
    if (!texto.trim() && adjuntos.length === 0) return;
    onEnviar(texto.trim(), adjuntos);
    setTexto("");
    setAdjuntos([]);
  }

  function elegirArchivos(files: FileList | null) {
    if (!files) return;
    const aceptados: AdjuntoChat[] = [];
    const conProblema: ArchivoRechazado[] = [];
    for (const f of Array.from(files)) {
      const r = revisarArchivo(f);
      if ("ok" in r) aceptados.push(r.ok);
      else conProblema.push(r.rechazo);
    }
    setAdjuntos((cur) => [...cur, ...aceptados]);
    setRechazados(conProblema);
    // Para poder volver a elegir el mismo archivo.
    if (archivoRef.current) archivoRef.current.value = "";
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

  const formatos = [
    { id: "negrita", icon: Bold, label: t("padMock.conversationPanel.negrita"), atajo: ATAJOS_FORMATO.negrita, accion: () => envolver("**") },
    { id: "cursiva", icon: Italic, label: t("padMock.conversationPanel.cursiva"), atajo: ATAJOS_FORMATO.cursiva, accion: () => envolver("_") },
    { id: "tachado", icon: Strikethrough, label: t("padMock.conversationPanel.tachado"), atajo: ATAJOS_FORMATO.tachado, accion: () => envolver("~~") },
    { id: "lista", icon: List, label: t("padMock.conversationPanel.lista"), atajo: ATAJOS_FORMATO.lista, accion: () => listar("vineta") },
    { id: "listaNumerada", icon: ListOrdered, label: t("padMock.conversationPanel.listaNumerada"), atajo: ATAJOS_FORMATO.listaNumerada, accion: () => listar("numero") },
  ];

  /** Atajo de formato en el cuadro: true si lo atendió. */
  function atajoFormato(e: React.KeyboardEvent) {
    if (!(e.ctrlKey || e.metaKey) || e.altKey) return false;
    const f = formatos.find((x) => esTecla(e, x.atajo) && x.atajo.shift === e.shiftKey);
    if (f) {
      f.accion();
      return true;
    }
    if (esTecla(e, ATAJOS_FORMATO.enlace) && !e.shiftKey) {
      // El enlace se arma en su recuadro, que vive en la barra: la abre.
      setFormatoAbierto(true);
      abrirEnlace(true);
      return true;
    }
    return false;
  }

  return (
    <div className="flex shrink-0 flex-col gap-2 border-t border-border p-3">
      <div className="flex items-center gap-1.5">
        <input
          ref={archivoRef}
          type="file"
          multiple
          accept={ACCEPT_ADJUNTOS}
          className="hidden"
          onChange={(e) => elegirArchivos(e.target.files)}
        />
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          aria-label={t("padMock.conversationPanel.adjuntar")}
          title={t("padMock.conversationPanel.adjuntar")}
          onClick={() => archivoRef.current?.click()}
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
          {formatos.map((b) => (
            <ActionTooltip key={b.id} label={`${b.label} (${etiquetaAtajo(b.atajo, isMac)})`}>
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
                title={`${t("padMock.conversationPanel.enlace")} (${etiquetaAtajo(ATAJOS_FORMATO.enlace, isMac)})`}
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
      {adjuntos.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {adjuntos.map((a, i) => (
            <span key={i} className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2 py-1 text-xs">
              {a.esImagen && a.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={a.url} alt="" className="size-5 rounded object-cover" />
              ) : (
                <FileText className="size-3.5 text-muted-foreground" />
              )}
              <span className="max-w-48 truncate font-medium">{a.nombre}</span>
              <span className="text-muted-foreground">{a.tamano}</span>
              <button
                type="button"
                aria-label={t("padMock.conversationPanel.quitarAdjunto", { nombre: a.nombre })}
                onClick={() => setAdjuntos((cur) => cur.filter((_, j) => j !== i))}
                className="text-muted-foreground hover:text-destructive"
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      <Textarea
        ref={textareaRef}
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        onKeyDown={(e) => {
          if (atajoFormato(e)) {
            e.preventDefault();
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

      <AlertDialog open={rechazados.length > 0} onOpenChange={(o) => !o && setRechazados([])}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {rechazados.length === 1
                ? t("padMock.conversationPanel.adjuntoRechazadoTitulo")
                : t("padMock.conversationPanel.adjuntosRechazadosTitulo", { n: rechazados.length })}
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="flex flex-col gap-3">
                <ul className="flex flex-col gap-1.5">
                  {rechazados.map((r, i) => (
                    <li key={i} className="flex flex-col">
                      <span className="font-medium text-foreground">{r.nombre}</span>
                      <span>
                        {r.motivo === "tipo"
                          ? t("padMock.conversationPanel.adjuntoTipoNoSoportado")
                          : t("padMock.conversationPanel.adjuntoMuyGrande", { mb: r.maxMB ?? 0 })}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="text-xs">
                  {t("padMock.conversationPanel.adjuntosPermitidos", {
                    imagenes: EXTENSIONES_IMAGEN.map((e) => e.toUpperCase()).join(", "),
                    mbImagen: ADJUNTOS_CHAT.imagen.maxMB,
                    archivos: EXTENSIONES_ARCHIVO.map((e) => e.toUpperCase()).join(", "),
                    mbArchivo: ADJUNTOS_CHAT.archivo.maxMB,
                  })}
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            {/* Con el foco en "Entendido" al abrir, Enter lo cierra. */}
            <AlertDialogAction autoFocus className="gap-1.5">
              {t("padMock.conversationPanel.entendido")}
              <Kbd className="bg-primary-foreground/15 text-primary-foreground">Enter</Kbd>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Chat en curso: el hilo arriba y el redactor abajo. Lo que envía el asesor
// se suma al hilo (con su formato) — en el mock no hay cliente del otro lado.
function ChatPanel({
  mensajesIniciales,
  adjuntoNuevo,
}: {
  mensajesIniciales: MensajeChat[];
  adjuntoNuevo?: AdjuntoExterno;
}) {
  const [mensajes, setMensajes] = useState(mensajesIniciales);
  function enviar(texto: string, adjuntos: AdjuntoChat[]) {
    const hora = new Date().toLocaleTimeString("es-AR", { hour12: false });
    setMensajes((cur) => [
      ...cur,
      { autor: "agente", texto, hora, adjuntos: adjuntos.length > 0 ? adjuntos : undefined },
    ]);
  }
  return (
    <div className="flex h-full min-h-0 flex-col">
      <HiloChat mensajes={mensajes} />
      <Redactor onEnviar={enviar} adjuntoNuevo={adjuntoNuevo} />
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
  adjuntoNuevo,
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
  /** Chat: adjunto que se suma al redactor (captura de la videollamada). */
  adjuntoNuevo?: AdjuntoExterno;
}) {
  const t = useT();
  if (mensajesChat) {
    return <ChatPanel mensajesIniciales={mensajesChat} adjuntoNuevo={adjuntoNuevo} />;
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
