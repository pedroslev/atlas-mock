"use client";

import { useEffect, useRef, useState, type ChangeEvent, type ReactNode } from "react";
import {
  Handle,
  Position,
  useUpdateNodeInternals,
  type NodeProps,
} from "@xyflow/react";
import {
  MessageSquare,
  Volume2,
  Keyboard,
  Split,
  ListTree,
  Trash2,
  Upload,
  FileAudio,
  Play as PlayIcono,
  Pause,
  Plus,
  X,
  Copy,
  ChevronDown,
  ChevronUp,
  GitBranch,
  Moon,
  Globe,
  Calculator,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ActionTooltip } from "@/components/layout/action-tooltip";
import { useT } from "@/lib/i18n";

// Los macroestados del editor: la derivación a campaña, el primer set de la
// Fase 1 — PLAY, COLLECT, IF y CASE — y las herramientas HTTP y Calcular
// (decisiones/workflows/propuesta-motor-workflows.md §5). Cada nodo declara sus salidas con nombre — `next`/`error`,
// `complete`/`timeout`/`error`, `true`/`false`, `case_*`/`default` — y cada
// salida va a un solo destino.
// Todos comparten el mismo marco: título editable (el ícono no cambia),
// duplicar, ocultar las opciones y quitar.
// Estado local únicamente, igual que el resto del editor (ver PRODUCT.md).

// Lo que el editor le inyecta a cada nodo: la data propia del nodo más los
// handlers para cambiarla o quitarlo.
type Comun = {
  // Título que le puso el usuario. En el documento del workflow es el
  // `ui.name` del nodo (propuesta §4): metadata visual, no cambia la lógica.
  titulo?: string;
  // Opciones ocultas: el nodo queda con título, resumen y salidas.
  colapsado?: boolean;
  // El editor lo calcula: todos los caminos que salen de este nodo terminan
  // en una misma derivación, así que el nodo ofrece la salida "Fuera de
  // horario" (propuesta §4.2).
  fueraDeHorario?: boolean;
  onChange: (patch: Record<string, unknown>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onRemoveExit: (handleId: string) => void;
};

// Marco común de los macroestados: entrada a la izquierda; encabezado con
// ícono, título editable y acciones; el formulario del nodo (que se puede
// ocultar) y sus salidas abajo.
function NodoMacroestado({
  icono,
  tituloPorDefecto,
  descripcion,
  ayuda,
  data,
  resumen,
  children,
  salidas,
}: {
  icono: ReactNode;
  tituloPorDefecto: string;
  // Qué hace el macroestado: se muestra al pasar el mouse por el ícono.
  descripcion: string;
  // Ancla de este macroestado en la documentación del workflow
  // (/documentacion/workflows#<ancla>).
  ayuda: string;
  data: Comun;
  // Una línea que describe la configuración, visible con las opciones ocultas.
  resumen?: string;
  children: ReactNode;
  salidas?: ReactNode;
}) {
  const t = useT();
  const [editando, setEditando] = useState(false);
  const titulo = data.titulo?.trim() || tituloPorDefecto;

  const accion = (label: string, onClick: () => void, contenido: ReactNode, destructiva = false) => (
    <ActionTooltip label={label}>
      <button
        type="button"
        aria-label={label}
        onClick={onClick}
        className={
          destructiva
            ? "flex size-6 items-center justify-center rounded-lg text-destructive hover:bg-destructive/10"
            : "flex size-6 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
        }
      >
        {contenido}
      </button>
    </ActionTooltip>
  );

  return (
    <div className="flex w-72 flex-col gap-2 rounded-xl bg-card p-3 text-card-foreground ring-1 ring-foreground/10">
      <Handle type="target" position={Position.Top} className="!bg-secondary" />
      <div className="flex items-center justify-between gap-1">
        <span className="flex min-w-0 flex-1 items-center gap-1.5 text-sm font-medium">
          {/* El ícono recuerda qué macroestado es aunque el título se haya cambiado. */}
          <ActionTooltip label={`${tituloPorDefecto}: ${descripcion}`}>
            <span className="shrink-0">{icono}</span>
          </ActionTooltip>
          {editando ? (
            <input
              autoFocus
              aria-label={t("cuentas.flujo.cambiarTitulo")}
              className="nodrag h-6 min-w-0 flex-1 rounded-md border border-input bg-transparent px-1.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              defaultValue={data.titulo ?? ""}
              placeholder={tituloPorDefecto}
              onBlur={(e) => {
                data.onChange({ titulo: e.target.value.trim() || undefined });
                setEditando(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") e.currentTarget.blur();
                if (e.key === "Escape") setEditando(false);
              }}
            />
          ) : (
            <ActionTooltip label={t("cuentas.flujo.cambiarTitulo")}>
              <button
                type="button"
                className="nodrag min-w-0 truncate rounded-md px-0.5 text-left hover:bg-muted"
                onClick={() => setEditando(true)}
              >
                {titulo}
              </button>
            </ActionTooltip>
          )}
        </span>
        <span className="flex shrink-0 items-center">
          {/* Va a la documentación en otra pestaña: el flujo es estado local
              y navegar en la misma lo perdería. */}
          <ActionTooltip label={t("cuentas.flujo.ayuda")}>
            <a
              href={`/documentacion/workflows#${ayuda}`}
              target="_blank"
              rel="noreferrer"
              aria-label={t("cuentas.flujo.ayuda")}
              data-testid={`ayuda-${ayuda}`}
              className="flex size-6 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <Info className="size-3.5" />
            </a>
          </ActionTooltip>
          {accion(t("cuentas.flujo.duplicar"), data.onDuplicate, <Copy className="size-3.5" />)}
          {accion(
            t(data.colapsado ? "cuentas.flujo.mostrarOpciones" : "cuentas.flujo.ocultarOpciones"),
            () => data.onChange({ colapsado: !data.colapsado }),
            data.colapsado ? <ChevronDown className="size-3.5" /> : <ChevronUp className="size-3.5" />,
          )}
          {accion(t("cuentas.flujo.quitarNodo"), data.onDelete, <Trash2 className="size-3.5" />, true)}
        </span>
      </div>
      {data.colapsado ? (
        resumen && <p className="truncate text-xs text-muted-foreground">{resumen}</p>
      ) : (
        // nodrag: los controles del formulario no arrastran el nodo.
        <div className="nodrag flex flex-col gap-2">{children}</div>
      )}
      {(salidas || data.fueraDeHorario) && (
        <div className="flex flex-col gap-1 border-t border-border pt-2">
          {salidas}
          {data.fueraDeHorario && <SalidaFueraDeHorario />}
        </div>
      )}
    </div>
  );
}

// Una salida con nombre: la etiqueta a la derecha y el punto de conexión al
// lado.
function Salida({ id, etiqueta }: { id: string; etiqueta: string }) {
  return (
    <div className="relative flex items-center justify-end gap-1.5 pr-1 text-xs text-muted-foreground">
      <span>{etiqueta}</span>
      <Handle
        type="source"
        id={id}
        position={Position.Right}
        className="!static !size-2 !translate-x-0 !translate-y-0 !bg-secondary"
      />
    </div>
  );
}

// Salida transversal "Fuera de horario": la llamada sigue por acá cuando entra
// fuera del horario de atención o en un feriado de la campaña a la que llevan
// todos los caminos. Se dibuja distinta (luna, tono neutro) porque es la
// excepción, no el camino principal.
export function SalidaFueraDeHorario() {
  const t = useT();
  return (
    <ActionTooltip label={t("cuentas.flujo.outOfHoursAyuda")}>
      <div className="relative flex items-center justify-end gap-1.5 pr-1 text-xs text-muted-foreground">
        <Moon className="size-3.5" />
        <span>{t("cuentas.flujo.outOfHours")}</span>
        <Handle
          type="source"
          id="out_of_hours"
          position={Position.Right}
          className="!static !size-2 !translate-x-0 !translate-y-0 !bg-muted-foreground"
        />
      </div>
    </ActionTooltip>
  );
}

function Campo({ id, label, children }: { id: string; label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <Label htmlFor={id} className="text-xs">
        {label}
      </Label>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// PLAY — reproduce algo en la interacción. Tres fuentes previstas: audio
// (la única disponible hoy), TTS (en desarrollo: no hay proveedor definido) y
// texto (la única fuente en cuentas de chat y videollamada).

export type PlayData = Comun & {
  fuente?: "audio" | "tts" | "texto";
  audio?: string; // nombre único con el que quedó guardado el archivo
  audioNombre?: string; // nombre del archivo original, solo para mostrar
  audioUrl?: string; // de dónde se escucha en el editor (en el mock, un blob local)
  // Barge-in (propuesta-motor-workflows.md §3): si el llamante marca una tecla
  // mientras suena, el audio se corta y el workflow sigue al instante; la tecla
  // marcada la recibe el COLLECT siguiente. Sin tilde, el audio se escucha
  // completo (un aviso legal, por ejemplo). Por defecto, interrumpible.
  interrumpible?: boolean;
  texto?: string; // mensaje que se envía (fuente "texto")
  // Chat, videollamada y webcall: el PLAY envía mensajes de texto, sin audio ni TTS.
  soloTexto: boolean;
  // Tipo de mensaje que se envía en cuentas de texto (propuesta-mensajes-enriquecidos
  // §2); sin valor es "texto", como antes de que existieran los demás.
  tipoMensaje?: TipoMensaje;
  botones?: OpcionMensaje[]; // tipo "botones"
  listaBoton?: string; // tipo "lista": rótulo del botón que abre el menú
  opciones?: OpcionMensaje[]; // tipo "lista"
  tarjetas?: TarjetaMensaje[]; // tipo "carrusel"
  adjuntoTipo?: AdjuntoTipo; // tipo "adjunto": imagen o archivo
  adjuntoNombre?: string; // nombre del archivo subido, solo para mostrar
  adjuntoUrl?: string; // de dónde se ve en el editor (en el mock, un blob local)
  onSubirAudio: (archivo: File) => { archivo: string; nombre: string; url: string };
};

export type TipoMensaje = "texto" | "botones" | "lista" | "carrusel" | "adjunto";
export type AdjuntoTipo = "image" | "document";
// `id` es lo que recibe el flujo cuando el cliente elige; `titulo` es lo que ve el cliente.
export type OpcionMensaje = { id: string; titulo: string; descripcion?: string };
export type TarjetaMensaje = {
  id: string;
  titulo: string;
  subtitulo?: string;
  imagenNombre?: string; // nombre de la imagen subida, solo para mostrar
  imagenUrl?: string; // de dónde se ve en el editor (en el mock, un blob local)
  botones: OpcionMensaje[];
};

const TIPOS_MENSAJE: TipoMensaje[] = ["texto", "botones", "lista", "carrusel", "adjunto"];
const TIPOS_ADJUNTO: AdjuntoTipo[] = ["image", "document"];
const ACEPTA_ADJUNTO: Record<AdjuntoTipo, string> = {
  image: ".jpg,.jpeg,.png",
  document: ".pdf,.doc,.docx,.xls,.xlsx,.txt",
};

// Topes del mínimo común entre canales (propuesta-mensajes-enriquecidos §4).
const MAX_BOTONES = 3;
const MAX_OPCIONES_LISTA = 10;
const MAX_TARJETAS = 10;
const MAX_BOTONES_TARJETA = 3;
const MAX_TITULO_BOTON = 20;
const MAX_TITULO_OPCION = 24;
const MAX_TITULO_TARJETA = 80;
const MAX_CUERPO = 1024;

// Primer identificador libre con el prefijo dado (opcion-1, opcion-2…), para que
// una opción nueva nunca repita el de otra.
function idLibre(prefijo: string, existentes: { id: string }[]) {
  const usados = new Set(existentes.map((o) => o.id));
  let n = existentes.length + 1;
  while (usados.has(`${prefijo}-${n}`)) n += 1;
  return `${prefijo}-${n}`;
}

// Subida de un archivo (imagen de una tarjeta, imagen o archivo adjunto): el
// tenant lo sube desde la cuenta y queda con su nombre. En la plataforma real
// el archivo queda guardado y el mensaje lo referencia; en el mock solo se
// guarda un enlace local para verlo en el editor.
function SubirArchivo({
  testid,
  accept,
  nombre,
  url,
  esImagen,
  onSubir,
  onQuitar,
}: {
  testid: string;
  accept: string;
  nombre?: string;
  url?: string;
  esImagen?: boolean;
  onSubir: (archivo: { nombre: string; url: string }) => void;
  onQuitar: () => void;
}) {
  const t = useT();
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="flex flex-col gap-1.5">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        data-testid={`${testid}-archivo`}
        onChange={(e) => {
          const archivo = e.target.files?.[0];
          if (archivo) onSubir({ nombre: archivo.name, url: URL.createObjectURL(archivo) });
          e.target.value = "";
        }}
      />
      {nombre && (
        <span className="flex items-center gap-1.5 text-sm">
          {esImagen && url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt="" className="size-8 shrink-0 rounded object-cover" />
          ) : (
            <FileAudio className="size-4 shrink-0 text-muted-foreground" />
          )}
          <span className="min-w-0 flex-1 truncate" data-testid={`${testid}-nombre`}>
            {nombre}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={t("cuentas.flujo.play.archivo.quitar")}
            data-testid={`${testid}-quitar`}
            onClick={onQuitar}
          >
            <X />
          </Button>
        </span>
      )}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="justify-start"
        data-testid={`${testid}-subir`}
        onClick={() => inputRef.current?.click()}
      >
        <Upload />
        {t(nombre ? "cuentas.flujo.play.archivo.cambiar" : "cuentas.flujo.play.archivo.subir")}
      </Button>
    </div>
  );
}

// Filas editables de opciones (botones, filas de la lista, botones de una
// tarjeta): identificador + título, y descripción cuando el tipo la admite.
function OpcionesEditor({
  nodoId,
  clave,
  opciones,
  max,
  maxTitulo,
  conDescripcion,
  onChange,
}: {
  nodoId: string;
  clave: string;
  opciones: OpcionMensaje[];
  max: number;
  maxTitulo: number;
  conDescripcion?: boolean;
  onChange: (opciones: OpcionMensaje[]) => void;
}) {
  const t = useT();
  const cambiar = (i: number, parche: Partial<OpcionMensaje>) =>
    onChange(opciones.map((o, j) => (j === i ? { ...o, ...parche } : o)));
  return (
    <div className="flex flex-col gap-1.5" data-testid={`play-${nodoId}-${clave}`}>
      {opciones.map((o, i) => (
        <div key={i} className="flex flex-col gap-1 rounded-md border p-1.5">
          <div className="flex items-center gap-1">
            <Input
              className="h-7 w-24 font-mono text-xs"
              aria-label={t("cuentas.flujo.play.opcion.id")}
              placeholder={t("cuentas.flujo.play.opcion.id")}
              value={o.id}
              data-testid={`play-${nodoId}-${clave}-${i}-id`}
              onChange={(e) => cambiar(i, { id: e.target.value })}
            />
            <Input
              className="h-7 min-w-0 flex-1"
              aria-label={t("cuentas.flujo.play.opcion.titulo")}
              placeholder={t("cuentas.flujo.play.opcion.titulo")}
              maxLength={maxTitulo}
              value={o.titulo}
              data-testid={`play-${nodoId}-${clave}-${i}-titulo`}
              onChange={(e) => cambiar(i, { titulo: e.target.value })}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={t("cuentas.flujo.play.opcion.quitar")}
              data-testid={`play-${nodoId}-${clave}-${i}-quitar`}
              onClick={() => onChange(opciones.filter((_, j) => j !== i))}
            >
              <X />
            </Button>
          </div>
          {conDescripcion && (
            <Input
              className="h-7"
              aria-label={t("cuentas.flujo.play.opcion.descripcion")}
              placeholder={t("cuentas.flujo.play.opcion.descripcion")}
              value={o.descripcion ?? ""}
              data-testid={`play-${nodoId}-${clave}-${i}-descripcion`}
              onChange={(e) => cambiar(i, { descripcion: e.target.value })}
            />
          )}
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="justify-start"
        disabled={opciones.length >= max}
        data-testid={`play-${nodoId}-${clave}-agregar`}
        onClick={() => onChange([...opciones, { id: idLibre("opcion", opciones), titulo: "" }])}
      >
        <Plus />
        {t("cuentas.flujo.play.opcion.agregar")} ({opciones.length}/{max})
      </Button>
    </div>
  );
}

// Botón para escuchar el audio cargado sin salir del editor: quien arma el
// flujo oye qué tiene puesto en vez de tener que buscar el archivo por nombre.
// Alterna reproducir/pausar y vuelve a "reproducir" cuando el audio termina o
// cuando cambia el audio del nodo.
function BotonEscuchar({ id, url }: { id: string; url: string }) {
  const t = useT();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [sonando, setSonando] = useState(false);

  useEffect(() => {
    const audio = new Audio(url);
    audio.onended = () => setSonando(false);
    audioRef.current = audio;
    return () => {
      audio.pause();
      audioRef.current = null;
      setSonando(false);
    };
  }, [url]);

  const alternar = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (sonando) {
      audio.pause();
      setSonando(false);
    } else {
      // Si falla (formato que el navegador no reproduce) no queda en "sonando".
      audio.play().then(() => setSonando(true), () => setSonando(false));
    }
  };

  const label = t(sonando ? "cuentas.flujo.play.pausar" : "cuentas.flujo.play.escuchar");
  return (
    <ActionTooltip label={label}>
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        aria-label={label}
        data-testid={`play-${id}-escuchar`}
        onClick={alternar}
      >
        {sonando ? <Pause /> : <PlayIcono />}
      </Button>
    </ActionTooltip>
  );
}

export function PlayNode({ id, data }: NodeProps & { data: PlayData }) {
  const t = useT();
  const fileRef = useRef<HTMLInputElement>(null);
  const fuente = data.soloTexto ? "texto" : (data.fuente ?? "audio");
  const tipoMensaje = data.tipoMensaje ?? "texto";

  return (
    <NodoMacroestado
      icono={
        data.soloTexto ? (
          <MessageSquare className="size-4 text-secondary" />
        ) : (
          <Volume2 className="size-4 text-secondary" />
        )
      }
      tituloPorDefecto={t(data.soloTexto ? "cuentas.flujo.play.texto.titulo" : "cuentas.flujo.play")}
      descripcion={t(data.soloTexto ? "cuentas.flujo.play.descripcionTexto" : "cuentas.flujo.play.descripcion")}
      ayuda="reproducir"
      data={data}
      resumen={
        data.soloTexto
          ? tipoMensaje === "texto"
            ? data.texto
            : t(`cuentas.flujo.play.tipo.${tipoMensaje}`)
          : data.audioNombre
      }
      salidas={
        <>
          <Salida id="next" etiqueta={t("cuentas.flujo.salida.next")} />
          <Salida id="error" etiqueta={t("cuentas.flujo.salida.error")} />
        </>
      }
    >
      {/* En chat/videollamada la fuente es fija (texto): no hay selector. */}
      {!data.soloTexto && (
      <Campo id={`${id}-fuente`} label={t("cuentas.flujo.play.fuente")}>
        <Select
          value={fuente}
          onValueChange={(v) => data.onChange({ fuente: v })}
        >
          <SelectTrigger id={`${id}-fuente`} size="sm" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="audio">{t("cuentas.flujo.play.fuente.audio")}</SelectItem>
            <SelectItem value="tts" disabled>
              {t("cuentas.flujo.play.fuente.tts")}
            </SelectItem>
          </SelectContent>
        </Select>
      </Campo>
      )}

      {/* Cuentas de texto: qué tipo de mensaje envía el nodo. */}
      {data.soloTexto && (
        <Campo id={`${id}-tipo-mensaje`} label={t("cuentas.flujo.play.tipo")}>
          <Select
            value={tipoMensaje}
            onValueChange={(v) => data.onChange({ tipoMensaje: v as TipoMensaje })}
          >
            <SelectTrigger
              id={`${id}-tipo-mensaje`}
              size="sm"
              className="w-full"
              data-testid={`play-${id}-tipo`}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIPOS_MENSAJE.map((tipo) => (
                <SelectItem key={tipo} value={tipo}>
                  {t(`cuentas.flujo.play.tipo.${tipo}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Campo>
      )}

      {/* Texto del mensaje: el propio mensaje (texto) o el cuerpo que acompaña
          a los botones y a la lista. */}
      {fuente === "texto" && (tipoMensaje === "texto" || tipoMensaje === "botones" || tipoMensaje === "lista") && (
        <Campo id={`${id}-texto`} label={t("cuentas.flujo.play.texto")}>
          <Textarea
            id={`${id}-texto`}
            rows={3}
            maxLength={MAX_CUERPO}
            value={data.texto ?? ""}
            placeholder={t("cuentas.flujo.play.textoPlaceholder")}
            data-testid={`play-${id}-texto`}
            onChange={(e) => data.onChange({ texto: e.target.value })}
          />
        </Campo>
      )}

      {fuente === "texto" && tipoMensaje === "botones" && (
        <Campo id={`${id}-botones`} label={t("cuentas.flujo.play.botones")}>
          <OpcionesEditor
            nodoId={id}
            clave="botones"
            opciones={data.botones ?? []}
            max={MAX_BOTONES}
            maxTitulo={MAX_TITULO_BOTON}
            onChange={(botones) => data.onChange({ botones })}
          />
        </Campo>
      )}

      {fuente === "texto" && tipoMensaje === "lista" && (
        <>
          <Campo id={`${id}-lista-boton`} label={t("cuentas.flujo.play.lista.boton")}>
            <Input
              id={`${id}-lista-boton`}
              className="h-7"
              maxLength={MAX_TITULO_BOTON}
              placeholder={t("cuentas.flujo.play.lista.botonPlaceholder")}
              value={data.listaBoton ?? ""}
              data-testid={`play-${id}-lista-boton`}
              onChange={(e) => data.onChange({ listaBoton: e.target.value })}
            />
          </Campo>
          <Campo id={`${id}-opciones`} label={t("cuentas.flujo.play.lista.opciones")}>
            <OpcionesEditor
              nodoId={id}
              clave="opciones"
              opciones={data.opciones ?? []}
              max={MAX_OPCIONES_LISTA}
              maxTitulo={MAX_TITULO_OPCION}
              conDescripcion
              onChange={(opciones) => data.onChange({ opciones })}
            />
          </Campo>
        </>
      )}

      {fuente === "texto" && tipoMensaje === "carrusel" && (
        <div className="flex flex-col gap-2" data-testid={`play-${id}-tarjetas`}>
          {(data.tarjetas ?? []).map((tarjeta, i) => {
            const cambiarTarjeta = (parche: Partial<TarjetaMensaje>) =>
              data.onChange({
                tarjetas: (data.tarjetas ?? []).map((x, j) => (j === i ? { ...x, ...parche } : x)),
              });
            return (
              <div key={i} className="flex flex-col gap-1.5 rounded-md border p-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium">
                    {t("cuentas.flujo.play.tarjeta")} {i + 1}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={t("cuentas.flujo.play.tarjeta.quitar")}
                    data-testid={`play-${id}-tarjeta-${i}-quitar`}
                    onClick={() =>
                      data.onChange({ tarjetas: (data.tarjetas ?? []).filter((_, j) => j !== i) })
                    }
                  >
                    <X />
                  </Button>
                </div>
                <Input
                  className="h-7"
                  aria-label={t("cuentas.flujo.play.tarjeta.titulo")}
                  placeholder={t("cuentas.flujo.play.tarjeta.titulo")}
                  maxLength={MAX_TITULO_TARJETA}
                  value={tarjeta.titulo}
                  data-testid={`play-${id}-tarjeta-${i}-titulo`}
                  onChange={(e) => cambiarTarjeta({ titulo: e.target.value })}
                />
                <Input
                  className="h-7"
                  aria-label={t("cuentas.flujo.play.tarjeta.subtitulo")}
                  placeholder={t("cuentas.flujo.play.tarjeta.subtitulo")}
                  maxLength={MAX_TITULO_TARJETA}
                  value={tarjeta.subtitulo ?? ""}
                  data-testid={`play-${id}-tarjeta-${i}-subtitulo`}
                  onChange={(e) => cambiarTarjeta({ subtitulo: e.target.value })}
                />
                <SubirArchivo
                  testid={`play-${id}-tarjeta-${i}-imagen`}
                  accept={ACEPTA_ADJUNTO.image}
                  esImagen
                  nombre={tarjeta.imagenNombre}
                  url={tarjeta.imagenUrl}
                  onSubir={(f) => cambiarTarjeta({ imagenNombre: f.nombre, imagenUrl: f.url })}
                  onQuitar={() => cambiarTarjeta({ imagenNombre: undefined, imagenUrl: undefined })}
                />
                <OpcionesEditor
                  nodoId={id}
                  clave={`tarjeta-${i}-botones`}
                  opciones={tarjeta.botones}
                  max={MAX_BOTONES_TARJETA}
                  maxTitulo={MAX_TITULO_BOTON}
                  onChange={(botones) => cambiarTarjeta({ botones })}
                />
              </div>
            );
          })}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="justify-start"
            disabled={(data.tarjetas ?? []).length >= MAX_TARJETAS}
            data-testid={`play-${id}-tarjeta-agregar`}
            onClick={() =>
              data.onChange({
                tarjetas: [
                  ...(data.tarjetas ?? []),
                  { id: idLibre("tarjeta", data.tarjetas ?? []), titulo: "", botones: [] },
                ],
              })
            }
          >
            <Plus />
            {t("cuentas.flujo.play.tarjeta.agregar")} ({(data.tarjetas ?? []).length}/{MAX_TARJETAS})
          </Button>
        </div>
      )}

      {fuente === "texto" && tipoMensaje === "adjunto" && (
        <>
          <Campo id={`${id}-adjunto-tipo`} label={t("cuentas.flujo.play.adjunto.tipo")}>
            <Select
              value={data.adjuntoTipo ?? "image"}
              onValueChange={(v) =>
                data.onChange({
                  adjuntoTipo: v as AdjuntoTipo,
                  adjuntoNombre: undefined,
                  adjuntoUrl: undefined,
                })
              }
            >
              <SelectTrigger
                id={`${id}-adjunto-tipo`}
                size="sm"
                className="w-full"
                data-testid={`play-${id}-adjunto-tipo`}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIPOS_ADJUNTO.map((tipo) => (
                  <SelectItem key={tipo} value={tipo}>
                    {t(`cuentas.flujo.play.adjunto.${tipo}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Campo>
          <SubirArchivo
            testid={`play-${id}-adjunto`}
            accept={ACEPTA_ADJUNTO[data.adjuntoTipo ?? "image"]}
            esImagen={(data.adjuntoTipo ?? "image") === "image"}
            nombre={data.adjuntoNombre}
            url={data.adjuntoUrl}
            onSubir={(f) => data.onChange({ adjuntoNombre: f.nombre, adjuntoUrl: f.url })}
            onQuitar={() => data.onChange({ adjuntoNombre: undefined, adjuntoUrl: undefined })}
          />
          <Campo id={`${id}-texto`} label={t("cuentas.flujo.play.adjunto.pie")}>
            <Input
              id={`${id}-texto`}
              className="h-7"
              maxLength={MAX_CUERPO}
              value={data.texto ?? ""}
              data-testid={`play-${id}-texto`}
              onChange={(e) => data.onChange({ texto: e.target.value })}
            />
          </Campo>
        </>
      )}

      {fuente === "audio" && (
        <>
          {/* Se sube el audio a reproducir y listo: no hay biblioteca de
              audios para elegir. En la plataforma real, el navegador lo
              convierte con ffmpeg.wasm a WAV PCM 16 bits mono 8 kHz antes de
              subirlo; en el mock solo se le asigna un nombre único. */}
          <input
            ref={fileRef}
            type="file"
            accept="audio/*"
            className="hidden"
            data-testid={`play-${id}-archivo`}
            onChange={(e) => {
              const archivo = e.target.files?.[0];
              if (archivo) {
                const subido = data.onSubirAudio(archivo);
                data.onChange({ audio: subido.archivo, audioNombre: subido.nombre, audioUrl: subido.url });
              }
              e.target.value = "";
            }}
          />
          {data.audioNombre && (
            <span className="flex items-center gap-1.5 text-sm">
              <FileAudio className="size-4 shrink-0 text-muted-foreground" />
              <span className="min-w-0 flex-1 truncate">{data.audioNombre}</span>
              {data.audioUrl && <BotonEscuchar id={id} url={data.audioUrl} />}
            </span>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="justify-start"
            onClick={() => fileRef.current?.click()}
          >
            <Upload />
            {t(data.audio ? "cuentas.flujo.play.cambiarAudio" : "cuentas.flujo.play.subirAudio")}
          </Button>
        </>
      )}

      {fuente === "audio" && (
      <div className="flex items-start gap-2">
        <Checkbox
          id={`${id}-interrumpible`}
          className="mt-0.5"
          checked={data.interrumpible ?? true}
          onCheckedChange={(v) => data.onChange({ interrumpible: v === true })}
        />
        <Label htmlFor={`${id}-interrumpible`} className="text-xs">
          {t("cuentas.flujo.play.interrumpible")}
        </Label>
      </div>
      )}
    </NodoMacroestado>
  );
}

// ---------------------------------------------------------------------------
// COLLECT — captura un dato del cliente y lo guarda en una variable. Mismo
// nodo en todos los canales, propiedades según la cuenta:
//   · telefonía: teclado del teléfono (DTMF), con mínimo de dígitos y tecla de fin.
//   · chat y videollamada (soloTexto): el próximo mensaje de texto del cliente;
//     no hay dígitos ni tecla de fin, solo espera y reintentos.

export type CollectData = Comun & {
  variable?: string;
  digitos?: number; // mínimo de dígitos
  teclaFin?: "#" | "*"; // opcional: la tecla que corta la captura
  esperaSeg?: number;
  reintentos?: number;
  soloTexto?: boolean; // chat/videollamada: captura texto libre
};

export function CollectNode({ id, data }: NodeProps & { data: CollectData }) {
  const t = useT();
  const numero = (campo: keyof CollectData) => (e: ChangeEvent<HTMLInputElement>) =>
    data.onChange({ [campo]: e.target.value === "" ? undefined : Number(e.target.value) });

  return (
    <NodoMacroestado
      icono={<Keyboard className="size-4 text-secondary" />}
      tituloPorDefecto={t(data.soloTexto ? "cuentas.flujo.collect.texto" : "cuentas.flujo.collect")}
      descripcion={t(data.soloTexto ? "cuentas.flujo.collect.descripcionTexto" : "cuentas.flujo.collect.descripcion")}
      ayuda="capturar"
      data={data}
      resumen={data.variable && `→ ${data.variable}`}
      salidas={
        <>
          <Salida id="complete" etiqueta={t("cuentas.flujo.salida.complete")} />
          <Salida id="timeout" etiqueta={t("cuentas.flujo.salida.timeout")} />
          <Salida id="error" etiqueta={t("cuentas.flujo.salida.error")} />
        </>
      }
    >
      <Campo id={`${id}-variable`} label={t("cuentas.flujo.collect.variable")}>
        <Input
          id={`${id}-variable`}
          className="h-7 font-mono text-xs"
          placeholder="opcion"
          value={data.variable ?? ""}
          onChange={(e) => data.onChange({ variable: e.target.value })}
        />
      </Campo>
      <div className="grid grid-cols-2 gap-2">
        {!data.soloTexto && (
        <>
        <Campo id={`${id}-digitos`} label={t("cuentas.flujo.collect.digitos")}>
          <Input
            id={`${id}-digitos`}
            type="number"
            min={1}
            max={20}
            className="h-7"
            value={data.digitos ?? 1}
            onChange={numero("digitos")}
          />
        </Campo>
        {/* Opcional: "ingrese su documento seguido de la tecla numeral". Con
            tecla de fin, la captura termina al marcarla (si ya llegó al
            mínimo de dígitos); sin ella, al llegar al mínimo. */}
        <Campo id={`${id}-tecla-fin`} label={t("cuentas.flujo.collect.teclaFin")}>
          <Select
            value={data.teclaFin ?? "ninguna"}
            onValueChange={(v) => data.onChange({ teclaFin: v === "ninguna" ? undefined : v })}
          >
            <SelectTrigger id={`${id}-tecla-fin`} size="sm" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ninguna">{t("cuentas.flujo.collect.sinTeclaFin")}</SelectItem>
              <SelectItem value="#"># {t("cuentas.flujo.collect.numeral")}</SelectItem>
              <SelectItem value="*">* {t("cuentas.flujo.collect.asterisco")}</SelectItem>
            </SelectContent>
          </Select>
        </Campo>
        </>
        )}
        <Campo id={`${id}-espera`} label={t("cuentas.flujo.collect.espera")}>
          <Input
            id={`${id}-espera`}
            type="number"
            min={1}
            className="h-7"
            value={data.esperaSeg ?? 5}
            onChange={numero("esperaSeg")}
          />
        </Campo>
        <Campo id={`${id}-reintentos`} label={t("cuentas.flujo.collect.reintentos")}>
          <Input
            id={`${id}-reintentos`}
            type="number"
            min={0}
            className="h-7"
            value={data.reintentos ?? 2}
            onChange={numero("reintentos")}
          />
        </Campo>
      </div>
    </NodoMacroestado>
  );
}

// ---------------------------------------------------------------------------
// Condición en dos modos: la simple (variable, operador, valor), que es la de
// por defecto para cualquier usuario, y CEL como opción avanzada.

type Modo = "simple" | "cel";
const OPERADORES = ["==", "!=", ">", "<", ">=", "<=", "contiene"] as const;

function SelectorModo({
  id,
  modo,
  onChange,
}: {
  id: string;
  modo: Modo;
  onChange: (modo: Modo) => void;
}) {
  const t = useT();
  return (
    <Campo id={`${id}-modo`} label={t("cuentas.flujo.condicion.modo")}>
      <Select value={modo} onValueChange={(v) => onChange(v as Modo)}>
        <SelectTrigger id={`${id}-modo`} size="sm" className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="simple">{t("cuentas.flujo.condicion.simple")}</SelectItem>
          <SelectItem value="cel">{t("cuentas.flujo.condicion.cel")}</SelectItem>
        </SelectContent>
      </Select>
    </Campo>
  );
}

function ExpresionCel({
  id,
  valor,
  placeholder,
  onChange,
}: {
  id: string;
  valor?: string;
  placeholder: string;
  onChange: (v: string) => void;
}) {
  const t = useT();
  return (
    <Campo id={`${id}-cel`} label={t("cuentas.flujo.condicion.expresion")}>
      <Textarea
        id={`${id}-cel`}
        className="min-h-12 font-mono text-xs"
        placeholder={placeholder}
        value={valor ?? ""}
        onChange={(e) => onChange(e.target.value)}
      />
    </Campo>
  );
}

// ---------------------------------------------------------------------------
// IF — bifurca en `true` / `false` según una condición.

export type IfData = Comun & {
  modo?: Modo;
  variable?: string;
  operador?: (typeof OPERADORES)[number];
  valor?: string;
  cel?: string;
};

export function IfNode({ id, data }: NodeProps & { data: IfData }) {
  const t = useT();
  const modo = data.modo ?? "simple";

  return (
    <NodoMacroestado
      icono={<Split className="size-4 text-secondary" />}
      tituloPorDefecto={t("cuentas.flujo.if")}
      descripcion={t("cuentas.flujo.if.descripcion")}
      ayuda="condicion"
      data={data}
      resumen={
        modo === "cel"
          ? data.cel
          : data.variable && `${data.variable} ${data.operador ?? "=="} ${data.valor ?? ""}`
      }
      salidas={
        <>
          <Salida id="true" etiqueta={t("cuentas.flujo.salida.true")} />
          <Salida id="false" etiqueta={t("cuentas.flujo.salida.false")} />
        </>
      }
    >
      <SelectorModo id={id} modo={modo} onChange={(m) => data.onChange({ modo: m })} />
      {modo === "simple" ? (
        <div className="grid grid-cols-[1fr_auto_1fr] gap-2">
          <Campo id={`${id}-variable`} label={t("cuentas.flujo.condicion.variable")}>
            <Input
              id={`${id}-variable`}
              className="h-7 font-mono text-xs"
              placeholder="opcion"
              value={data.variable ?? ""}
              onChange={(e) => data.onChange({ variable: e.target.value })}
            />
          </Campo>
          <Campo id={`${id}-operador`} label={t("cuentas.flujo.condicion.operador")}>
            <Select
              value={data.operador ?? "=="}
              onValueChange={(v) => data.onChange({ operador: v })}
            >
              <SelectTrigger id={`${id}-operador`} size="sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {OPERADORES.map((op) => (
                  <SelectItem key={op} value={op}>
                    {op === "contiene" ? t("cuentas.flujo.condicion.contiene") : op}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Campo>
          <Campo id={`${id}-valor`} label={t("cuentas.flujo.condicion.valor")}>
            <Input
              id={`${id}-valor`}
              className="h-7"
              placeholder="1"
              value={data.valor ?? ""}
              onChange={(e) => data.onChange({ valor: e.target.value })}
            />
          </Campo>
        </div>
      ) : (
        <ExpresionCel
          id={id}
          valor={data.cel}
          placeholder='opcion == "1" && intentos < 3'
          onChange={(v) => data.onChange({ cel: v })}
        />
      )}
    </NodoMacroestado>
  );
}

// ---------------------------------------------------------------------------
// CASE — una salida por valor, más `default` para cualquier otro. Cada opción
// tiene un id estable (no el índice), así quitar una no reconecta las demás.

export type CaseOpcion = { id: string; valor: string };
export type CaseData = Comun & {
  modo?: Modo;
  variable?: string;
  cel?: string;
  opciones?: CaseOpcion[];
};

let nextOpcion = 1;

export function CaseNode({ id, data }: NodeProps & { data: CaseData }) {
  const t = useT();
  const modo = data.modo ?? "simple";
  const opciones = data.opciones ?? [];
  const updateNodeInternals = useUpdateNodeInternals();

  // Las salidas cambian al sumar o quitar opciones: React Flow tiene que volver
  // a medir los puntos de conexión del nodo.
  useEffect(() => {
    updateNodeInternals(id);
  }, [id, opciones.length, updateNodeInternals]);

  const setOpciones = (nuevas: CaseOpcion[]) => data.onChange({ opciones: nuevas });

  return (
    <NodoMacroestado
      icono={<ListTree className="size-4 text-secondary" />}
      tituloPorDefecto={t("cuentas.flujo.case")}
      descripcion={t("cuentas.flujo.case.descripcion")}
      ayuda="segun-valor"
      data={data}
      resumen={modo === "cel" ? data.cel : data.variable}
      salidas={
        <>
          {opciones.map((o, i) => (
            <Salida
              key={o.id}
              id={`case_${o.id}`}
              etiqueta={o.valor || `${t("cuentas.flujo.case.opcion")} ${i + 1}`}
            />
          ))}
          <Salida id="default" etiqueta={t("cuentas.flujo.salida.default")} />
        </>
      }
    >
      <SelectorModo id={id} modo={modo} onChange={(m) => data.onChange({ modo: m })} />
      {modo === "simple" ? (
        <Campo id={`${id}-variable`} label={t("cuentas.flujo.condicion.variable")}>
          <Input
            id={`${id}-variable`}
            className="h-7 font-mono text-xs"
            placeholder="opcion"
            value={data.variable ?? ""}
            onChange={(e) => data.onChange({ variable: e.target.value })}
          />
        </Campo>
      ) : (
        <ExpresionCel
          id={id}
          valor={data.cel}
          placeholder="int(opcion) % 3"
          onChange={(v) => data.onChange({ cel: v })}
        />
      )}

      <span className="text-xs font-medium">{t("cuentas.flujo.case.opciones")}</span>
      {opciones.map((o, i) => (
        <div key={o.id} className="flex items-center gap-1.5">
          <Input
            aria-label={`${t("cuentas.flujo.case.opcion")} ${i + 1}`}
            className="h-7"
            placeholder={String(i + 1)}
            value={o.valor}
            onChange={(e) =>
              setOpciones(opciones.map((x) => (x.id === o.id ? { ...x, valor: e.target.value } : x)))
            }
          />
          <ActionTooltip label={t("cuentas.flujo.case.quitarOpcion")}>
            <button
              type="button"
              aria-label={t("cuentas.flujo.case.quitarOpcion")}
              onClick={() => {
                setOpciones(opciones.filter((x) => x.id !== o.id));
                data.onRemoveExit(`case_${o.id}`);
              }}
              className="flex size-6 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
            >
              <X className="size-3.5" />
            </button>
          </ActionTooltip>
        </div>
      ))}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="justify-start"
        onClick={() => setOpciones([...opciones, { id: String(nextOpcion++), valor: "" }])}
      >
        <Plus />
        {t("cuentas.flujo.case.agregarOpcion")}
      </Button>
    </NodoMacroestado>
  );
}

// ---------------------------------------------------------------------------
// Derivación a campaña — deriva la interacción a la campaña elegida. Es
// terminal: no tiene salidas (propuesta §4.1). La salida "Fuera de horario"
// la ofrecen los nodos anteriores cuando todos sus caminos llegan acá (§4.2).

export type DerivacionData = Comun & {
  campaniaId?: string;
  campanias: { id: string; nombre: string }[];
};

export function DerivacionNode({ id, data }: NodeProps & { data: DerivacionData }) {
  const t = useT();
  const campania = data.campanias.find((c) => c.id === data.campaniaId);
  return (
    <NodoMacroestado
      icono={<GitBranch className="size-4 text-secondary" />}
      tituloPorDefecto={t("cuentas.flujo.derivacion")}
      descripcion={t("cuentas.flujo.derivacion.descripcion")}
      ayuda="derivacion"
      data={data}
      resumen={campania?.nombre}
    >
      <Select value={data.campaniaId} onValueChange={(v) => data.onChange({ campaniaId: v })}>
        <SelectTrigger id={`${id}-campania`} size="sm" className="w-full">
          <SelectValue placeholder={t("cuentas.flujo.elegirCampania")} />
        </SelectTrigger>
        <SelectContent>
          {data.campanias.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.nombre}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </NodoMacroestado>
  );
}

// ---------------------------------------------------------------------------
// HTTP — consulta a un servicio externo del tenant. Omnicanal: funciona igual
// en todas las cuentas. La respuesta queda en una variable como
// { status, body }, que después leen IF, CASE y Calcular. Salidas: `success`
// (respuesta 2xx), `error` (otro status o falla de red) y `timeout`.

const METODOS_HTTP = ["GET", "POST", "PUT", "PATCH", "DELETE"] as const;
// Los métodos que mandan cuerpo; en GET y DELETE el campo no se muestra.
const METODOS_CON_CUERPO: readonly string[] = ["POST", "PUT", "PATCH"];

export type HttpEncabezado = { id: string; nombre: string; valor: string };
export type HttpData = Comun & {
  metodo?: (typeof METODOS_HTTP)[number];
  url?: string;
  encabezados?: HttpEncabezado[];
  cuerpo?: string;
  timeoutSeg?: number;
  variable?: string;
};

let nextEncabezado = 1;

export function HttpNode({ id, data }: NodeProps & { data: HttpData }) {
  const t = useT();
  const metodo = data.metodo ?? "GET";
  const encabezados = data.encabezados ?? [];
  const setEncabezados = (nuevos: HttpEncabezado[]) => data.onChange({ encabezados: nuevos });
  const editar = (hid: string, patch: Partial<HttpEncabezado>) =>
    setEncabezados(encabezados.map((h) => (h.id === hid ? { ...h, ...patch } : h)));

  return (
    <NodoMacroestado
      icono={<Globe className="size-4 text-secondary" />}
      tituloPorDefecto={t("cuentas.flujo.http")}
      descripcion={t("cuentas.flujo.http.descripcion")}
      ayuda="consulta-http"
      data={data}
      resumen={data.url && `${metodo} ${data.url}`}
      salidas={
        <>
          <Salida id="success" etiqueta={t("cuentas.flujo.salida.success")} />
          <Salida id="error" etiqueta={t("cuentas.flujo.salida.error")} />
          <Salida id="timeout" etiqueta={t("cuentas.flujo.salida.timeout")} />
        </>
      }
    >
      <div className="grid grid-cols-[auto_1fr] items-end gap-2">
        <Campo id={`${id}-metodo`} label={t("cuentas.flujo.http.metodo")}>
          <Select value={metodo} onValueChange={(v) => data.onChange({ metodo: v })}>
            <SelectTrigger id={`${id}-metodo`} size="sm" data-testid={`http-${id}-metodo`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {METODOS_HTTP.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Campo>
        <Campo id={`${id}-url`} label={t("cuentas.flujo.http.url")}>
          <Input
            id={`${id}-url`}
            className="h-7 font-mono text-xs"
            placeholder="https://api.cliente.com/saldo/{{ documento }}"
            value={data.url ?? ""}
            data-testid={`http-${id}-url`}
            onChange={(e) => data.onChange({ url: e.target.value })}
          />
        </Campo>
      </div>

      <span className="text-xs font-medium">{t("cuentas.flujo.http.encabezados")}</span>
      {encabezados.map((h) => (
        <div key={h.id} className="flex items-center gap-1.5">
          <Input
            aria-label={t("cuentas.flujo.http.encabezadoNombre")}
            className="h-7 font-mono text-xs"
            placeholder="Authorization"
            value={h.nombre}
            data-testid={`http-${id}-encabezado-${h.id}-nombre`}
            onChange={(e) => editar(h.id, { nombre: e.target.value })}
          />
          <Input
            aria-label={t("cuentas.flujo.http.encabezadoValor")}
            className="h-7 font-mono text-xs"
            placeholder="Bearer …"
            value={h.valor}
            data-testid={`http-${id}-encabezado-${h.id}-valor`}
            onChange={(e) => editar(h.id, { valor: e.target.value })}
          />
          <ActionTooltip label={t("cuentas.flujo.http.quitarEncabezado")}>
            <button
              type="button"
              aria-label={t("cuentas.flujo.http.quitarEncabezado")}
              onClick={() => setEncabezados(encabezados.filter((x) => x.id !== h.id))}
              className="flex size-6 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
            >
              <X className="size-3.5" />
            </button>
          </ActionTooltip>
        </div>
      ))}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="justify-start"
        data-testid={`http-${id}-agregar-encabezado`}
        onClick={() =>
          setEncabezados([...encabezados, { id: String(nextEncabezado++), nombre: "", valor: "" }])
        }
      >
        <Plus />
        {t("cuentas.flujo.http.agregarEncabezado")}
      </Button>

      {METODOS_CON_CUERPO.includes(metodo) && (
        <Campo id={`${id}-cuerpo`} label={t("cuentas.flujo.http.cuerpo")}>
          <Textarea
            id={`${id}-cuerpo`}
            className="min-h-16 font-mono text-xs"
            placeholder='{"documento": "{{ documento }}"}'
            value={data.cuerpo ?? ""}
            data-testid={`http-${id}-cuerpo`}
            onChange={(e) => data.onChange({ cuerpo: e.target.value })}
          />
        </Campo>
      )}

      {/* items-end: si una etiqueta pasa a dos renglones, los campos quedan
          igual alineados por abajo. */}
      <div className="grid grid-cols-2 items-end gap-2">
        <Campo id={`${id}-variable`} label={t("cuentas.flujo.http.variable")}>
          <Input
            id={`${id}-variable`}
            className="h-7 font-mono text-xs"
            placeholder="respuesta"
            value={data.variable ?? ""}
            data-testid={`http-${id}-variable`}
            onChange={(e) => data.onChange({ variable: e.target.value })}
          />
        </Campo>
        <Campo id={`${id}-timeout`} label={t("cuentas.flujo.http.timeout")}>
          <Input
            id={`${id}-timeout`}
            type="number"
            min={1}
            max={30}
            className="h-7"
            value={data.timeoutSeg ?? 5}
            data-testid={`http-${id}-timeout`}
            onChange={(e) =>
              data.onChange({ timeoutSeg: e.target.value === "" ? undefined : Number(e.target.value) })
            }
          />
        </Campo>
      </div>
    </NodoMacroestado>
  );
}

// ---------------------------------------------------------------------------
// Calcular — asigna a variables el resultado de expresiones CEL sobre las
// variables del workflow (aritmética, texto, fechas). Las asignaciones se
// evalúan en orden: cada una ve el resultado de las anteriores. Salidas:
// `next` y `error` (expresión que falla al evaluarse).

export type CalcularAsignacion = { id: string; variable: string; expresion: string };
export type CalcularData = Comun & { asignaciones?: CalcularAsignacion[] };

let nextAsignacion = 1;

export function CalcularNode({ id, data }: NodeProps & { data: CalcularData }) {
  const t = useT();
  const asignaciones = data.asignaciones ?? [];
  const setAsignaciones = (nuevas: CalcularAsignacion[]) => data.onChange({ asignaciones: nuevas });
  const editar = (aid: string, patch: Partial<CalcularAsignacion>) =>
    setAsignaciones(asignaciones.map((a) => (a.id === aid ? { ...a, ...patch } : a)));

  return (
    <NodoMacroestado
      icono={<Calculator className="size-4 text-secondary" />}
      tituloPorDefecto={t("cuentas.flujo.calcular")}
      descripcion={t("cuentas.flujo.calcular.descripcion")}
      ayuda="calcular"
      data={data}
      resumen={asignaciones
        .filter((a) => a.variable)
        .map((a) => `${a.variable} = ${a.expresion}`)
        .join(" · ")}
      salidas={
        <>
          <Salida id="next" etiqueta={t("cuentas.flujo.salida.next")} />
          <Salida id="error" etiqueta={t("cuentas.flujo.salida.error")} />
        </>
      }
    >
      {asignaciones.map((a, i) => (
        <div key={a.id} className="flex flex-col gap-1 rounded-lg border border-border p-2">
          <div className="flex items-center gap-1.5">
            <Input
              aria-label={`${t("cuentas.flujo.calcular.variable")} ${i + 1}`}
              className="h-7 font-mono text-xs"
              placeholder="total"
              value={a.variable}
              data-testid={`calcular-${id}-${a.id}-variable`}
              onChange={(e) => editar(a.id, { variable: e.target.value })}
            />
            <ActionTooltip label={t("cuentas.flujo.calcular.quitar")}>
              <button
                type="button"
                aria-label={t("cuentas.flujo.calcular.quitar")}
                onClick={() => setAsignaciones(asignaciones.filter((x) => x.id !== a.id))}
                className="flex size-6 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
              >
                <X className="size-3.5" />
              </button>
            </ActionTooltip>
          </div>
          <Textarea
            aria-label={`${t("cuentas.flujo.condicion.expresion")} ${i + 1}`}
            className="min-h-10 font-mono text-xs"
            placeholder="int(saldo) - int(pago)"
            value={a.expresion}
            data-testid={`calcular-${id}-${a.id}-expresion`}
            onChange={(e) => editar(a.id, { expresion: e.target.value })}
          />
        </div>
      ))}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="justify-start"
        data-testid={`calcular-${id}-agregar`}
        onClick={() =>
          setAsignaciones([...asignaciones, { id: String(nextAsignacion++), variable: "", expresion: "" }])
        }
      >
        <Plus />
        {t("cuentas.flujo.calcular.agregar")}
      </Button>
    </NodoMacroestado>
  );
}
