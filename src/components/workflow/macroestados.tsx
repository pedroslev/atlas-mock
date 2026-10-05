"use client";

import { useEffect, useRef, useState, type ChangeEvent, type ReactNode } from "react";
import {
  Handle,
  Position,
  useUpdateNodeInternals,
  type NodeProps,
} from "@xyflow/react";
import {
  Volume2,
  Keyboard,
  Split,
  ListTree,
  Trash2,
  Upload,
  FileAudio,
  Plus,
  X,
  Copy,
  ChevronDown,
  ChevronUp,
  GitBranch,
  Moon,
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

// Los macroestados del editor: la derivación a campaña y el primer set de la
// Fase 1 — PLAY, COLLECT, IF y CASE (decisiones/workflows/propuesta-motor-
// workflows.md §5). Cada nodo declara sus salidas con nombre — `next`/`error`,
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
      <Handle type="target" position={Position.Left} className="!bg-secondary" />
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
// texto (solo para cuentas de chat, que todavía no existen).

export type PlayData = Comun & {
  fuente?: "audio" | "tts" | "texto";
  audio?: string; // nombre único con el que quedó guardado el archivo
  audioNombre?: string; // nombre del archivo original, solo para mostrar
  // Barge-in (propuesta-motor-workflows.md §3): si el llamante marca una tecla
  // mientras suena, el audio se corta y el workflow sigue al instante; la tecla
  // marcada la recibe el COLLECT siguiente. Sin tilde, el audio se escucha
  // completo (un aviso legal, por ejemplo). Por defecto, interrumpible.
  interrumpible?: boolean;
  admiteTexto: boolean;
  onSubirAudio: (archivo: File) => { archivo: string; nombre: string };
};

export function PlayNode({ id, data }: NodeProps & { data: PlayData }) {
  const t = useT();
  const fileRef = useRef<HTMLInputElement>(null);
  const fuente = data.fuente ?? "audio";

  return (
    <NodoMacroestado
      icono={<Volume2 className="size-4 text-secondary" />}
      tituloPorDefecto={t("cuentas.flujo.play")}
      descripcion={t("cuentas.flujo.play.descripcion")}
      data={data}
      resumen={data.audioNombre}
      salidas={
        <>
          <Salida id="next" etiqueta={t("cuentas.flujo.salida.next")} />
          <Salida id="error" etiqueta={t("cuentas.flujo.salida.error")} />
        </>
      }
    >
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
            {/* Texto solo existe en cuentas de chat: en una cuenta de
                telefonía la opción no se muestra. */}
            {data.admiteTexto && (
              <SelectItem value="texto">{t("cuentas.flujo.play.fuente.texto")}</SelectItem>
            )}
          </SelectContent>
        </Select>
      </Campo>

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
                data.onChange({ audio: subido.archivo, audioNombre: subido.nombre });
              }
              e.target.value = "";
            }}
          />
          {data.audioNombre && (
            <span className="flex items-center gap-1.5 truncate text-sm">
              <FileAudio className="size-4 shrink-0 text-muted-foreground" />
              {data.audioNombre}
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
    </NodoMacroestado>
  );
}

// ---------------------------------------------------------------------------
// COLLECT — captura un dato del llamante y lo guarda en una variable. Por
// ahora solo teclado del teléfono (DTMF): texto y voz llegan con sus canales
// y proveedores. Pide un mínimo de dígitos y, opcionalmente, una tecla de fin.

export type CollectData = Comun & {
  variable?: string;
  digitos?: number; // mínimo de dígitos
  teclaFin?: "#" | "*"; // opcional: la tecla que corta la captura
  esperaSeg?: number;
  reintentos?: number;
};

export function CollectNode({ id, data }: NodeProps & { data: CollectData }) {
  const t = useT();
  const numero = (campo: keyof CollectData) => (e: ChangeEvent<HTMLInputElement>) =>
    data.onChange({ [campo]: e.target.value === "" ? undefined : Number(e.target.value) });

  return (
    <NodoMacroestado
      icono={<Keyboard className="size-4 text-secondary" />}
      tituloPorDefecto={t("cuentas.flujo.collect")}
      descripcion={t("cuentas.flujo.collect.descripcion")}
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
