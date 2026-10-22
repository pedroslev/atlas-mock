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
  data,
  resumen,
  children,
  salidas,
}: {
  icono: ReactNode;
  tituloPorDefecto: string;
  // Qué hace el macroestado: se muestra al pasar el mouse por el ícono.
  descripcion: string;
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
  // Chat y videollamada: el PLAY solo envía texto, sin audio ni TTS.
  soloTexto: boolean;
  onSubirAudio: (archivo: File) => { archivo: string; nombre: string; url: string };
};

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
      data={data}
      resumen={data.soloTexto ? data.texto : data.audioNombre}
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

      {fuente === "texto" && (
        <Campo id={`${id}-texto`} label={t("cuentas.flujo.play.texto")}>
          <Textarea
            id={`${id}-texto`}
            rows={3}
            value={data.texto ?? ""}
            placeholder={t("cuentas.flujo.play.textoPlaceholder")}
            data-testid={`play-${id}-texto`}
            onChange={(e) => data.onChange({ texto: e.target.value })}
          />
        </Campo>
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
      <div className="grid grid-cols-[auto_1fr] gap-2">
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

      <div className="grid grid-cols-2 gap-2">
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
