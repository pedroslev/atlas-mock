"use client";

import type React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  ReactFlow,
  Background,
  Controls,
  ControlButton,
  Handle,
  Panel,
  Position,
  addEdge,
  BaseEdge,
  EdgeLabelRenderer,
  useNodes,
  useEdges,
  useNodesInitialized,
  useStore,
  useStoreApi,
  useNodesState,
  useEdgesState,
  useReactFlow,
  type Connection,
  type Edge,
  type EdgeProps,
  type Node,
  type NodeChange,
  MarkerType,
  type OnConnectStart,
  type OnConnectEnd,
  type ReactFlowInstance,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  Play,
  GitBranch,
  Maximize2,
  Minimize2,
  MessageSquare,
  Volume2,
  Keyboard,
  Split,
  ListTree,
  Globe,
  Calculator,
  X,
  LayoutGrid,
  ChevronsUpDown,
  ChevronsDownUp,
  Plus,
  Minus,
  Scan,
  PanelLeftClose,
  PanelLeftOpen,
  StickyNote,
  Trash2,
  Grid3x3,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ActionTooltip } from "@/components/layout/action-tooltip";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  fijarSinConectar,
  reiniciarEstadoConexiones,
  useEstadoConexiones,
} from "@/components/workflow/estado-conexiones";
import { useCambiosDeValor } from "@/components/layout/aviso-cambios";
import { useT } from "@/lib/i18n";
import {
  anchorRoute,
  draggableSegments,
  edgeGeometry,
  edgesToReroute,
  moveSegment,
  routeEdges,
  type Point,
  type Rect,
  type RouteRequest,
} from "@/lib/workflow/edge-routing";
import { createRoutesStore, type RoutesStore } from "@/lib/workflow/routes-store";
import { cn } from "@/lib/utils";
import {
  type Workflow,
  type WorkflowNode,
  type WorkflowEdge,
  type WorkflowNodeType,
} from "@/lib/mock-data";
import {
  PlayNode,
  CollectNode,
  IfNode,
  CaseNode,
  HttpNode,
  CalcularNode,
  DerivacionNode,
} from "@/components/workflow/macroestados";

// Editor de workflow de la cuenta (ver ADR-BD-002 §accounts.workflow): el
// "Inicio de interacción" (único, fijo), la "Derivación a campaña" y el primer
// set de macroestados de Fase 1 — PLAY, COLLECT, IF y CASE — más las
// herramientas HTTP y Calcular (ver macroestados.tsx). Cada salida con nombre de un nodo va a un solo destino;
// para abrir caminos se usan IF y CASE.
// Estado local únicamente — no hay persistencia real (ver PRODUCT.md).

// Los macroestados son los mismos en todos los canales; lo que cambia es el
// texto (y las propiedades de cada nodo) según la cuenta. Estas claves eligen
// el título y la descripción de PLAY y COLLECT cuando la cuenta es de texto.
const claveTitulo = (type: string, soloTexto: boolean) =>
  soloTexto && (type === "play" || type === "collect")
    ? `cuentas.flujo.${type}.texto${type === "play" ? ".titulo" : ""}`
    : `cuentas.flujo.${type}`;
const claveDescripcion = (type: string, soloTexto: boolean) =>
  soloTexto && (type === "play" || type === "collect")
    ? `cuentas.flujo.${type}.descripcionTexto`
    : `cuentas.flujo.${type}.descripcion`;

function InicioNode({ data }: { data: { sinConectar?: boolean } }) {
  const t = useT();
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-primary-foreground ring-1 ring-foreground/10",
        // Sin nada conectado a la salida, al confirmar queda marcado como los demás.
        data.sinConectar && "ring-2 ring-destructive",
      )}
    >
      <Play className="size-4" />
      <span className="text-sm font-medium">{t("cuentas.flujo.inicio")}</span>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!size-4 !border-2 !border-primary !bg-primary-foreground"
      />
    </div>
  );
}

// Nota adhesiva (como en n8n): un papel amarillo con texto libre para saber en
// qué parte del flujo se está. No tiene entradas ni salidas, no se ejecuta y va
// detrás de los macroestados. Se agrega desde la paleta y se mueve como un nodo.
function NotaNode({ data }: { data: { texto?: string; onChange: (p: Record<string, unknown>) => void; onDelete: () => void } }) {
  const t = useT();
  return (
    <div
      data-testid="nota"
      className="group relative w-56 rounded-xl bg-amber-100 p-3 text-amber-950 shadow-sm ring-1 ring-amber-300 dark:bg-amber-200"
    >
      <Textarea
        aria-label={t("cuentas.flujo.nota")}
        placeholder={t("cuentas.flujo.nota.placeholder")}
        // nodrag: escribir no arrastra la nota; se arrastra desde el borde.
        className="nodrag min-h-20 resize-y border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0"
        value={data.texto ?? ""}
        onChange={(e) => data.onChange({ texto: e.target.value })}
      />
      <ActionTooltip label={t("cuentas.flujo.nota.quitar")}>
        <button
          type="button"
          aria-label={t("cuentas.flujo.nota.quitar")}
          data-testid="nota-quitar"
          onClick={data.onDelete}
          className="absolute top-1 right-1 flex size-6 items-center justify-center rounded-lg text-amber-900/60 opacity-0 hover:bg-amber-200 hover:text-destructive group-hover:opacity-100"
        >
          <Trash2 className="size-3.5" />
        </button>
      </ActionTooltip>
    </div>
  );
}

// Salidas que pueden quedar sin conectar sin que falte nada
// (propuesta-motor-workflows.md §5): el camino termina ahí.
const SALIDAS_OPCIONALES = new Set(["error", "timeout", "other", "out_of_hours"]);

// Nodos con algo sin conectar: una salida obligatoria sin destino, o un nodo al
// que no llega ninguna conexión. Las salidas se leen de los puntos realmente
// dibujados en cada nodo (`salidasDe`), así no hay que repetir acá la lista por
// tipo. No bloquea el guardado: se avisa al confirmar (ver ConfirmarCuenta).
function nodosSinConectar(
  nodes: Node[],
  edges: Edge[],
  salidasDe: (id: string) => string[],
): Set<string> {
  const conectadas = new Set(edges.map((e) => `${e.source}/${e.sourceHandle ?? ""}`));
  const conEntrada = new Set(edges.map((e) => e.target));
  const resultado = new Set<string>();
  for (const n of nodes) {
    if (n.type === "punta" || n.type === "nota") continue;
    const faltaEntrada = n.type !== "inicio" && !conEntrada.has(n.id);
    const faltaSalida = salidasDe(n.id).some(
      (salida) => !SALIDAS_OPCIONALES.has(salida) && !conectadas.has(`${n.id}/${salida}`),
    );
    if (faltaEntrada || faltaSalida) resultado.add(n.id);
  }
  return resultado;
}

// Vive dentro de <ReactFlow> para leer los puntos de salida medidos de cada
// nodo; recalcula los nodos sin conectar cada vez que cambia el flujo.
function VigilanteConexiones({ onChange }: { onChange: (ids: Set<string>) => void }) {
  const nodes = useNodes();
  const edges = useEdges();
  const medidos = useNodesInitialized();
  const { getInternalNode } = useReactFlow();
  useEffect(() => {
    if (!medidos) return;
    const salidasDe = (id: string) =>
      (getInternalNode(id)?.internals.handleBounds?.source ?? []).map((h) => h.id ?? "");
    onChange(nodosSinConectar(nodes, edges, salidasDe));
  }, [nodes, edges, medidos, getInternalNode, onChange]);
  return null;
}

// Regla de "Fuera de horario": un nodo ofrece la salida cuando, siguiendo hacia
// adelante todas sus conexiones (sin contar las "Fuera de horario"), la única
// campaña a la que se puede llegar es una sola — en ese caso la salida
// transversal sabe a qué campaña corresponde (propuesta-motor-workflows.md
// §4.2). Si desde el nodo se puede llegar a más de una campaña, no la ofrece.
// La derivación a campaña también la ofrece: llegar a ella ya es un único destino.
// Dos derivaciones a la misma campaña cuentan como un solo destino; los
// retornos (un menú que se repite) se siguen igual, así que un camino que
// vuelve a un menú con otras campañas también apaga la salida.
function nodosConFueraDeHorario(nodes: Node[], edges: Edge[]): Set<string> {
  const porId = new Map(nodes.map((n) => [n.id, n]));
  const salidas = new Map<string, string[]>();
  for (const e of edges) {
    if (e.sourceHandle === "out_of_hours") continue;
    salidas.set(e.source, [...(salidas.get(e.source) ?? []), e.target]);
  }
  // Campañas alcanzables desde `id`. Una derivación sin campaña elegida cuenta
  // como un destino propio (todavía no se sabe a cuál va).
  const campaniasDesde = (id: string): Set<string> => {
    const campanias = new Set<string>();
    const visitados = new Set<string>();
    const pila = [id];
    while (pila.length > 0) {
      const actual = pila.pop()!;
      if (visitados.has(actual)) continue;
      visitados.add(actual);
      const nodo = porId.get(actual);
      if (nodo?.type === "derivacion") {
        campanias.add((nodo.data.campaniaId as string | undefined) ?? `sin-campania:${actual}`);
      } else {
        pila.push(...(salidas.get(actual) ?? []));
      }
    }
    return campanias;
  };
  const habilitados = new Set<string>();
  for (const n of nodes) {
    // El inicio no ofrece "Fuera de horario". La derivación sí: su campaña es,
    // por definición, el único destino posible.
    if (n.type === "inicio" || n.type === "punta" || n.type === "nota") continue;
    if (campaniasDesde(n.id).size === 1) habilitados.add(n.id);
  }
  return habilitados;
}

// "Ordenar": acomoda los nodos en capas de arriba hacia abajo según la
// distancia desde el inicio (el inicio arriba, después los pasos en el orden
// en que se recorren), con la misma separación entre capas y entre nodos de
// una capa. Los nodos que no se alcanzan desde el inicio van a una última
// capa. Las separaciones dejan lugar para los pasillos por donde corren las
// conexiones (ver EdgeRouter). Las posiciones quedan sobre la grilla.
const SEPARACION_X = 140;
const SEPARACION_Y = 140;
function ordenar(nodes: Node[], edges: Edge[]): Node[] {
  const nivel = new Map<string, number>();
  const inicio = nodes.find((n) => n.type === "inicio");
  if (inicio) {
    nivel.set(inicio.id, 0);
    const cola = [inicio.id];
    while (cola.length > 0) {
      const id = cola.shift()!;
      for (const e of edges.filter((x) => x.source === id)) {
        if (!nivel.has(e.target)) {
          nivel.set(e.target, nivel.get(id)! + 1);
          cola.push(e.target);
        }
      }
    }
  }
  const ultimo = Math.max(0, ...nivel.values()) + 1;
  const capas: Node[][] = [];
  for (const n of nodes) {
    // Las notas no son parte del recorrido: se quedan donde se las dejó.
    if (n.type === "nota") continue;
    const c = nivel.get(n.id) ?? ultimo;
    (capas[c] ??= []).push(n);
  }
  const ancho = (n: Node) => n.measured?.width ?? 288;
  const alto = (n: Node) => n.measured?.height ?? 200;
  const posiciones = new Map<string, { x: number; y: number }>();
  let y = 0;
  for (const capa of capas.filter(Boolean)) {
    const total = capa.reduce((acc, n) => acc + ancho(n), 0) + SEPARACION_X * (capa.length - 1);
    let x = -total / 2;
    for (const n of capa) {
      posiciones.set(n.id, centroEnGrilla({ x, y }, ancho(n)));
      x += ancho(n) + SEPARACION_X;
    }
    y += Math.max(...capa.map(alto)) + SEPARACION_Y;
  }
  return nodes.map((n) => ({ ...n, position: posiciones.get(n.id) ?? n.position }));
}

// Polilínea con las esquinas redondeadas (radio `r`).
function trazoRedondeado(puntos: [number, number][], r = 10): string {
  const pts = puntos.filter((p, i) => i === 0 || p[0] !== puntos[i - 1][0] || p[1] !== puntos[i - 1][1]);
  let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const [px, py] = pts[i - 1];
    const [cx, cy] = pts[i];
    const [nx, ny] = pts[i + 1];
    const entra = Math.hypot(cx - px, cy - py);
    const sale = Math.hypot(nx - cx, ny - cy);
    const rr = Math.min(r, entra / 2, sale / 2);
    d += ` L${cx - ((cx - px) / entra) * rr} ${cy - ((cy - py) / entra) * rr}`;
    d += ` Q${cx} ${cy} ${cx + ((nx - cx) / sale) * rr} ${cy + ((ny - cy) / sale) * rr}`;
  }
  return `${d} L${pts[pts.length - 1][0]} ${pts[pts.length - 1][1]}`;
}

// Conexiones de retorno: las que vuelven a un nodo por el que la llamada ya
// pasó (un menú que se repite, un timeout que reintenta). Se decide por la
// estructura del flujo, no por dónde quedó cada nodo en el lienzo: se recorre
// el grafo desde el inicio y una conexión es de retorno si su destino todavía
// está en el camino que se viene recorriendo.
function conexionesDeRetorno(nodes: Node[], edges: Edge[]): Set<string> {
  const salidas = new Map<string, Edge[]>();
  for (const e of edges) salidas.set(e.source, [...(salidas.get(e.source) ?? []), e]);
  const estado = new Map<string, "en-camino" | "listo">();
  const retornos = new Set<string>();
  const visitar = (id: string) => {
    estado.set(id, "en-camino");
    for (const e of salidas.get(id) ?? []) {
      const destino = estado.get(e.target);
      if (destino === "en-camino") retornos.add(e.id);
      else if (!destino) visitar(e.target);
    }
    estado.set(id, "listo");
  };
  // Desde el inicio primero; los nodos sueltos que no se alcanzan, después.
  for (const n of [...nodes.filter((n) => n.type === "inicio"), ...nodes]) {
    if (!estado.has(n.id)) visitar(n.id);
  }
  return retornos;
}

// Rutas de todas las conexiones, calculadas juntas por EdgeRouter (ver lib/workflow/edge-routing).
// Una conexión sin ruta todavía (antes de medir los nodos) usa el trazado simple de edgeGeometry.
const RutasContext = createContext<RoutesStore>(createRoutesStore());
// Si el imán a la grilla está encendido: los tramos que se arrastran también se enganchan.
const ImanContext = createContext(false);

// Ruta que el usuario le dejó a una conexión arrastrando sus tramos (como en draw.io): los puntos
// de quiebre en coordenadas del lienzo. «Ordenar» la borra; no se guarda con el workflow.
type DatosConexion = { ruta?: Point[] };

// Calcula las rutas cuando cambian los nodos o las conexiones. Incremental, como draw.io: se
// rutean solo las conexiones que lo necesitan (ver edgesToReroute); las acomodadas a mano no se
// rutean nunca, solo se estiran su primer y último tramo si se movió un nodo (anchorRoute).
function EdgeRouter() {
  const nodes = useStore((s) => s.nodes);
  const edges = useStore((s) => s.edges);
  const store = useStoreApi();
  const rutasStore = useContext(RutasContext);
  // Qué conexiones vuelven (punteadas): depende de la estructura, no se recalcula al arrastrar.
  const estructura = nodes.some((n) => n.dragging) ? null : edges;
  useEffect(() => {
    if (estructura) rutasStore.setReturns(conexionesDeRetorno(store.getState().nodes, estructura));
  }, [estructura, store, rutasStore]);
  // Firma de la geometría que se ruteó por última vez: el lienzo se re-renderiza por muchas
  // cosas (incluidas las rutas nuevas), y solo hay que rutear de nuevo si algo se movió.
  const ultimaFirma = useRef("");
  useEffect(() => {
    const { nodeLookup } = store.getState();
    const rects: Rect[] = [];
    for (const n of nodeLookup.values()) {
      if (n.id === PUNTA_ID || n.type === "nota" || !n.measured.width || !n.measured.height) continue;
      const { x, y } = n.internals.positionAbsolute;
      rects.push({ id: n.id, x, y, width: n.measured.width, height: n.measured.height });
    }
    const arrastrando = nodes.some((n) => n.dragging);
    const pedidos: RouteRequest[] = [];
    const aMano = new Map<string, Point[]>();
    for (const e of edges) {
      if (e.target === PUNTA_ID) continue;
      const origen = nodeLookup.get(e.source);
      const destino = nodeLookup.get(e.target);
      const salidas = origen?.internals.handleBounds?.source ?? [];
      const salida = salidas.find((h) => h.id === (e.sourceHandle ?? null)) ?? salidas[0];
      const entrada = destino?.internals.handleBounds?.target?.[0];
      if (!origen || !destino || !salida || !entrada) continue;
      const o = origen.internals.positionAbsolute;
      const d = destino.internals.positionAbsolute;
      const porAbajo = salida.position === Position.Bottom;
      const pedido: RouteRequest = {
        id: e.id,
        from: porAbajo
          ? [o.x + salida.x + salida.width / 2, o.y + salida.y + salida.height]
          : [o.x + salida.x + salida.width, o.y + salida.y + salida.height / 2],
        fromSide: porAbajo ? "bottom" : "right",
        to: [d.x + entrada.x + entrada.width / 2, d.y + entrada.y],
      };
      const ruta = (e.data as DatosConexion | undefined)?.ruta;
      const anclada = ruta && anchorRoute(ruta, pedido.from, pedido.to, pedido.fromSide);
      if (anclada) aMano.set(e.id, anclada);
      else pedidos.push(pedido);
    }
    const firma = JSON.stringify([rects, pedidos, [...aMano], arrastrando]);
    if (firma === ultimaFirma.current) return;
    ultimaFirma.current = firma;
    const actuales = rutasStore.all();
    const rutear = edgesToReroute(actuales, pedidos, rects, !arrastrando);
    const fijas = new Map<string, Point[]>(aMano);
    for (const p of pedidos) {
      const ruta = actuales.get(p.id);
      if (ruta && !rutear.has(p.id)) fijas.set(p.id, ruta);
    }
    const nuevas = routeEdges(rects, pedidos.filter((p) => rutear.has(p.id)), { fixed: fijas });
    rutasStore.setRoutes(new Map([...fijas, ...nuevas]));
  }, [nodes, edges, store, rutasStore]);
  return null;
}

// Tramo de una conexión que se puede arrastrar: una franja transparente sobre
// la línea, con el cursor de mover; al soltar, la conexión queda donde se dejó.
function TramoArrastrable({
  de,
  a,
  eje,
  onMover,
}: {
  de: [number, number];
  a: [number, number];
  // "x": el tramo es vertical y se mueve a los costados; "y": es horizontal y se
  // mueve arriba/abajo.
  eje: "x" | "y";
  onMover: (valor: number) => void;
}) {
  const { screenToFlowPosition } = useReactFlow();
  return (
    <path
      d={`M${de[0]} ${de[1]} L${a[0]} ${a[1]}`}
      className="nodrag nopan"
      style={{
        fill: "none",
        stroke: "transparent",
        strokeWidth: 14,
        pointerEvents: "stroke",
        cursor: eje === "x" ? "ew-resize" : "ns-resize",
      }}
      onPointerDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
        const punto = screenToFlowPosition({ x: e.clientX, y: e.clientY });
        onMover(eje === "x" ? punto.x : punto.y);
      }}
      onPointerUp={(e) => e.currentTarget.releasePointerCapture(e.pointerId)}
    />
  );
}

// Conexión ortogonal para un flujo que corre de arriba hacia abajo: sigue la ruta que calculó
// EdgeRouter (sale por la derecha de la fila de la salida, o por abajo en el inicio, rodea los
// nodos y entra por el borde superior del destino).
// - Las de retorno (ver conexionesDeRetorno) van punteadas y llevan una etiqueta con el nombre
//   del destino, pegada a la salida.
// - Con un nodo seleccionado, las conexiones que no lo tocan se atenúan.
// - El botón para quitarla va en el medio del tramo más largo, siempre visible.
// - Los tramos del medio se pueden arrastrar para acomodar la línea; queda como ruta a mano.
// Cada conexión lee solo lo suyo del store: no se vuelve a dibujar cuando se mueve un nodo que
// no la toca.
function ConexionQuitable({
  id,
  source,
  target,
  sourceX,
  sourceY,
  sourcePosition,
  targetX,
  targetY,
  style,
  markerEnd,
  selected,
}: EdgeProps) {
  const t = useT();
  const { deleteElements, setCenter, getZoom, getNode, setEdges } = useReactFlow();
  const rutasStore = useContext(RutasContext);
  const ruta = useSyncExternalStore(rutasStore.subscribe, () => rutasStore.get(id), () => undefined);
  const retorno = useSyncExternalStore(rutasStore.subscribe, () => rutasStore.isReturn(id), () => false);
  const hayNodoSeleccionado = useStore((s) => s.nodes.some((n) => n.selected));
  const extremoSeleccionado = useStore(
    (s) => Boolean(s.nodeLookup.get(source)?.selected || s.nodeLookup.get(target)?.selected),
  );
  const tituloDestino = useStore((s) => s.nodeLookup.get(target)?.data.titulo as string | undefined);
  const tipoDestino = useStore((s) => s.nodeLookup.get(target)?.type);
  const soloTextoDestino = useStore((s) => s.nodeLookup.get(target)?.data.soloTexto === true);
  const iman = useContext(ImanContext);
  // Borde derecho del nodo de origen: el tramo que sigue a la salida no puede meterse debajo.
  const bordeOrigen = useStore((s) => {
    const n = s.nodeLookup.get(source);
    return n ? n.internals.positionAbsolute.x + (n.measured.width ?? 0) : undefined;
  });

  const { points: puntos, remove, label } = edgeGeometry(
    ruta,
    [sourceX, sourceY],
    [targetX, targetY],
    sourcePosition === Position.Bottom,
  );
  // Arrastrar un tramo deja la conexión acomodada a mano, con la ruta que se ve ahora. Con el
  // imán, el tramo cae sobre la grilla (también el límite junto al nodo de origen).
  const acomodar = (indice: number, valor: number) => {
    const limite =
      bordeOrigen === undefined || !iman
        ? bordeOrigen
        : Math.ceil((bordeOrigen + GRILLA) / GRILLA) * GRILLA - GRILLA;
    const ruta = moveSegment(puntos, indice, iman ? enGrilla(valor) : valor, limite);
    setEdges((eds) => eds.map((e) => (e.id === id ? { ...e, data: { ...e.data, ruta } } : e)));
  };
  const [quitarX, quitarY] = remove;
  const [etiquetaX, etiquetaY] = label;
  const atenuada = hayNodoSeleccionado && !selected && !extremoSeleccionado;
  const nombreDestino = tituloDestino ?? t(claveTitulo(tipoDestino ?? "", soloTextoDestino));

  return (
    <>
      <BaseEdge
        id={id}
        path={trazoRedondeado(puntos)}
        style={{
          ...style,
          ...(retorno && !style?.strokeDasharray ? { strokeDasharray: "6 4" } : {}),
          opacity: atenuada ? 0.15 : 1,
        }}
        markerEnd={markerEnd}
      />
      {draggableSegments(puntos).map(({ index, axis }) => (
        <TramoArrastrable
          key={index}
          de={puntos[index]}
          a={puntos[index + 1]}
          eje={axis}
          onMover={(valor) => acomodar(index, valor)}
        />
      ))}
      <EdgeLabelRenderer>
        {/* Cruz para quitar la conexión, a mitad de tramo. */}
        <div
          className={cn(
            "nodrag nopan pointer-events-auto absolute",
            atenuada ? "opacity-15" : !selected && "opacity-70 hover:opacity-100",
          )}
          style={{ transform: `translate(-50%, -50%) translate(${quitarX}px, ${quitarY}px)` }}
        >
          <ActionTooltip label={t("cuentas.flujo.quitarConexion")}>
            <button
              type="button"
              aria-label={t("cuentas.flujo.quitarConexion")}
              data-testid={`quitar-conexion-${id}`}
              onClick={() => deleteElements({ edges: [{ id }] })}
              className="flex size-5 items-center justify-center rounded-full bg-card text-muted-foreground ring-1 ring-foreground/10 hover:text-destructive"
            >
              <X className="size-3" />
            </button>
          </ActionTooltip>
        </div>
        {/* Etiqueta del retorno, pegada a la salida: al tocarla, lleva al nodo al que vuelve. */}
        {retorno && (
          <div
            className={cn(
              "nodrag nopan pointer-events-auto absolute",
              atenuada ? "opacity-15" : !selected && "opacity-70 hover:opacity-100",
            )}
            style={{ transform: `translate(0%, -50%) translate(${etiquetaX}px, ${etiquetaY}px)` }}
          >
            <ActionTooltip label={t("cuentas.flujo.irAlNodo")}>
              <button
                type="button"
                aria-label={`${t("cuentas.flujo.irAlNodo")}: ${nombreDestino}`}
                data-testid={`retorno-${id}`}
                onClick={() => {
                  const destino = getNode(target);
                  if (!destino) return;
                  setCenter(
                    destino.position.x + (destino.measured?.width ?? 0) / 2,
                    destino.position.y + (destino.measured?.height ?? 0) / 2,
                    { zoom: Math.max(getZoom(), 0.6), duration: 400 },
                  );
                }}
                className="flex h-5 max-w-40 items-center rounded-full bg-card px-1.5 text-xs text-muted-foreground ring-1 ring-foreground/10 hover:text-foreground"
              >
                <span className="truncate">↩ {nombreDestino}</span>
              </button>
            </ActionTooltip>
          </div>
        )}
      </EdgeLabelRenderer>
    </>
  );
}

const edgeTypes = { quitable: ConexionQuitable };

// Punta invisible de la conexión que se está haciendo con clicks: sigue al
// mouse para que la línea quede pegada al cursor hasta elegir el destino.
function PuntaConexion() {
  // Sin eventos de mouse: queda justo bajo el cursor, y si recibiera el click
  // se lo robaría al nodo de destino.
  return (
    <Handle
      type="target"
      position={Position.Top}
      isConnectable={false}
      className="!pointer-events-none !opacity-0"
    />
  );
}
const PUNTA_ID = "__punta-conexion__";

const nodeTypes = {
  inicio: InicioNode,
  punta: PuntaConexion,
  nota: NotaNode,
  derivacion: DerivacionNode,
  play: PlayNode,
  collect: CollectNode,
  if: IfNode,
  case: CaseNode,
  http: HttpNode,
  calcular: CalcularNode,
};

// Macroestados que se agregan desde la paleta, en el orden en que aparecen.
const PALETA: { type: Exclude<WorkflowNodeType, "inicio">; icono: typeof GitBranch }[] = [
  { type: "play", icono: Volume2 },
  { type: "collect", icono: Keyboard },
  { type: "if", icono: Split },
  { type: "case", icono: ListTree },
  { type: "http", icono: Globe },
  { type: "calcular", icono: Calculator },
  { type: "derivacion", icono: GitBranch },
  { type: "nota", icono: StickyNote },
];

// Encuadre del flujo: nunca más de 100%, así un flujo de un solo nodo no se
// agranda hasta llenar el lienzo.
const ENCUADRE = { padding: 0.15, maxZoom: 1 };

// Grilla del lienzo: con el imán encendido los nodos se enganchan cada GRILLA px al arrastrarlos,
// y «Ordenar» los deja siempre sobre ella. Es el mismo margen que el ruteo deja alrededor de cada
// nodo: con los nodos alineados, más conexiones salen derechas y los pasillos quedan parejos.
const GRILLA = 16;
const enGrilla = (v: number) => Math.round(v / GRILLA) * GRILLA;
// Lo que se engancha es el centro del borde de arriba del nodo, no su esquina: por ahí entran
// las conexiones (y sale la del inicio), así dos nodos uno debajo del otro quedan con los
// puntos en la misma vertical aunque tengan anchos distintos, y la línea baja derecha.
const centroEnGrilla = (posicion: { x: number; y: number }, ancho: number) => ({
  x: enGrilla(posicion.x + ancho / 2) - ancho / 2,
  y: enGrilla(posicion.y),
});
// Si el imán está encendido es una preferencia de cada usuario, guardada en su navegador.
const CLAVE_IMAN = "atlas.flujo.iman";
const COLOR_CONEXION = "var(--foreground)";

// Alto del lienzo sin pantalla completa: ocupa lo que queda de la ventana
// debajo de su posición, sin provocar scroll en la página. MARGEN_INFERIOR es
// lo que hay debajo del lienzo (relleno de la tarjeta y de la página);
// ALTO_MINIMO deja lugar a la paleta y a los controles, y en una ventana más
// baja la página scrollea.
const MARGEN_INFERIOR = 42;
const ALTO_MINIMO = 448;

let nextId = 1;

export function WorkflowEditor({
  initialWorkflow,
  campanias,
  soloTexto,
}: {
  initialWorkflow?: Workflow;
  campanias: { id: string; nombre: string }[];
  // Chat y videollamada: el PLAY solo envía texto.
  soloTexto: boolean;
}) {
  const t = useT();
  const [fullscreen, setFullscreen] = useState(false);
  // La paleta de macroestados se puede cerrar para ganar lugar en el lienzo.
  const [paletaAbierta, setPaletaAbierta] = useState(true);
  const [alto, setAlto] = useState<number>();
  // Imán a la grilla, encendido salvo que el usuario lo haya apagado antes.
  const [iman, setIman] = useState(() => {
    try {
      return localStorage.getItem(CLAVE_IMAN) !== "0";
    } catch {
      return true;
    }
  });
  const alternarIman = () =>
    setIman((v) => {
      try {
        localStorage.setItem(CLAVE_IMAN, v ? "0" : "1");
      } catch {
        // Sin almacenamiento (ventana privada): vale solo para esta visita.
      }
      return !v;
    });
  // Rutas de las conexiones de este editor (ver EdgeRouter).
  const [rutasStore] = useState(createRoutesStore);

  const inicioNode = useMemo<WorkflowNode>(
    () =>
      initialWorkflow?.nodes.find((n) => n.type === "inicio") ?? {
        id: "inicio",
        type: "inicio",
        position: { x: 40, y: 120 },
      },
    [initialWorkflow],
  );

  const toFlowNode = useCallback(
    (n: WorkflowNode): Node =>
      n.type === "inicio"
        ? { id: n.id, type: "inicio", position: n.position, data: {} }
        : {
            id: n.id,
            type: n.type,
            position: n.position,
            data: { campaniaId: n.campaniaId },
          },
    [],
  );

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>(
    (initialWorkflow?.nodes ?? [inicioNode]).map(toFlowNode),
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(
    initialWorkflow?.edges.map((e: WorkflowEdge) => ({
      id: e.id,
      type: "quitable",
      source: e.source,
      target: e.target,
      sourceHandle: e.sourceHandle,
      // La salida out_of_hours se dibuja distinta (punteada, tono neutro):
      // es la excepción transversal, no el camino principal del nodo.
      ...(e.sourceHandle === "out_of_hours"
        ? { style: { strokeDasharray: "4 3" }, className: "!stroke-muted-foreground" }
        : {}),
    })) ?? [],
  );

  // Cada salida de un nodo (la única del inicio, `next`, `true`, una opción
  // del CASE, `out_of_hours`…) va a un solo destino: en el documento del
  // workflow, `exits` es un mapa salida → nodo (propuesta-motor-workflows.md
  // §4). Para ir a más de un lugar se usa IF o CASE.
  const isValidConnection = useCallback(
    (connection: Connection | Edge) =>
      !edges.some(
        (e) =>
          e.source === connection.source &&
          (e.sourceHandle ?? null) === (connection.sourceHandle ?? null),
      ),
    [edges],
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      if (!isValidConnection(connection)) return;
      const extra =
        connection.sourceHandle === "out_of_hours"
          ? { style: { strokeDasharray: "4 3" }, className: "!stroke-muted-foreground" }
          : {};
      setEdges((eds) => addEdge({ ...connection, ...extra, type: "quitable" }, eds));
    },
    [isValidConnection, setEdges],
  );

  // Conectar con clicks, sin mantener apretado: un click en una salida deja la
  // línea pegada al mouse, y un click en cualquier parte de otro nodo la
  // conecta. Esc o un click en el lienzo vacío la cancelan. Arrastrar desde
  // la salida sigue funcionando igual.
  const flowRef = useRef<ReactFlowInstance | null>(null);
  const lienzoRef = useRef<HTMLDivElement>(null);
  const [pendiente, setPendiente] = useState<{ source: string; sourceHandle: string | null } | null>(
    null,
  );
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);

  const empezarConexion = useCallback<OnConnectStart>((event, { nodeId, handleId, handleType }) => {
    if (handleType !== "source" || !nodeId) return;
    setPendiente({ source: nodeId, sourceHandle: handleId ?? null });
    const { clientX, clientY } = event as MouseEvent;
    setCursor(flowRef.current?.screenToFlowPosition({ x: clientX, y: clientY }) ?? null);
  }, []);

  const cancelarConexion = useCallback(() => {
    setPendiente(null);
    setCursor(null);
  }, []);

  const terminarConexion = useCallback(
    (target: Node) => {
      if (!pendiente || target.id === pendiente.source || target.type === "inicio") return;
      onConnect({ ...pendiente, target: target.id, targetHandle: null });
      cancelarConexion();
    },
    [pendiente, onConnect, cancelarConexion],
  );

  // Arrastrando, soltar sobre cualquier parte del nodo de destino también
  // conecta, no solo sobre su punto de entrada.
  const soltarConexion = useCallback<OnConnectEnd>(
    (event, estado) => {
      if (estado.isValid || !estado.fromNode || estado.fromHandle?.type !== "source") return;
      const punto = "changedTouches" in event ? event.changedTouches[0] : event;
      const destinoId = document
        .elementFromPoint(punto.clientX, punto.clientY)
        ?.closest(".react-flow__node")
        ?.getAttribute("data-id");
      const destino = nodes.find((n) => n.id === destinoId);
      if (!destino || destino.id === estado.fromNode.id || destino.type === "inicio") return;
      onConnect({
        source: estado.fromNode.id,
        sourceHandle: estado.fromHandle.id ?? null,
        target: destino.id,
        targetHandle: null,
      });
    },
    [nodes, onConnect],
  );

  useEffect(() => {
    if (!pendiente) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") cancelarConexion();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [pendiente, cancelarConexion]);

  // Mide el alto libre de la ventana a partir de donde empieza el lienzo.
  useLayoutEffect(() => {
    if (fullscreen) return;
    const medir = () => {
      const lienzo = lienzoRef.current;
      const pagina = lienzo?.closest("main");
      if (!lienzo || !pagina) return;
      const arriba =
        lienzo.getBoundingClientRect().top - pagina.getBoundingClientRect().top + pagina.scrollTop;
      setAlto(Math.max(pagina.clientHeight - arriba - MARGEN_INFERIOR, ALTO_MINIMO));
    };
    medir();
    window.addEventListener("resize", medir);
    return () => window.removeEventListener("resize", medir);
  }, [fullscreen]);

  const addNodo = useCallback(
    (type: Exclude<WorkflowNodeType, "inicio">) => {
      const id = `${type}-${nextId++}`;
      // El nodo nuevo entra en el centro de lo que se está viendo del lienzo,
      // así aparece a la vista sin tener que buscarlo. Si ya hay uno justo ahí
      // (se agregaron varios seguidos), se corre en escalera.
      const caja = lienzoRef.current?.getBoundingClientRect();
      const centro =
        caja && flowRef.current
          ? flowRef.current.screenToFlowPosition({
              x: caja.left + caja.width / 2,
              y: caja.top + caja.height / 2,
            })
          : { x: 380, y: 40 };
      setNodes((nds) => {
        let position = { x: centro.x - 144, y: centro.y - 80 };
        while (nds.some((n) => n.position.x === position.x && n.position.y === position.y)) {
          position = { x: position.x + 30, y: position.y + 30 };
        }
        // La nota va detrás de los macroestados, para escribir sobre un grupo de nodos.
        return [...nds, { id, type, position, data: {}, ...(type === "nota" ? { zIndex: -1 } : {}) }];
      });
    },
    [setNodes],
  );

  const removeNode = useCallback(
    (id: string) => {
      setNodes((nds) => nds.filter((n) => n.id !== id));
      setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
    },
    [setNodes, setEdges],
  );

  // Copia de nodos: duplicar uno desde su botón, o Ctrl/Cmd+C sobre los
  // seleccionados y Ctrl/Cmd+V. La copia lleva la misma configuración y queda
  // corrida para que se vea; las conexiones no se copian. El inicio no se copia.
  const portapapeles = useRef<Node[]>([]);

  const pegar = useCallback(
    (originales: Node[]) => {
      const copias = originales
        .filter((n) => n.type !== "inicio")
        .map((n) => ({
          ...n,
          id: `${n.type}-${nextId++}`,
          position: { x: n.position.x + 40, y: n.position.y + 40 },
          data: { ...n.data },
          selected: true,
        }));
      if (copias.length === 0) return;
      // Queda seleccionada la copia, así un segundo Ctrl+V la vuelve a copiar corrida.
      setNodes((nds) => [...nds.map((n) => ({ ...n, selected: false })), ...copias]);
      portapapeles.current = copias;
    },
    [setNodes],
  );

  const duplicar = useCallback(
    (id: string) => pegar(nodes.filter((n) => n.id === id)),
    [nodes, pegar],
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey)) return;
      // Dentro de un campo, Ctrl+C/V copian texto, no nodos.
      if ((e.target as HTMLElement).closest("input, textarea, [contenteditable='true']")) return;
      const tecla = e.key.toLowerCase();
      if (tecla === "c") {
        const seleccionados = nodes.filter((n) => n.selected && n.type !== "inicio");
        if (seleccionados.length > 0) portapapeles.current = seleccionados;
      } else if (tecla === "v" && portapapeles.current.length > 0) {
        e.preventDefault();
        pegar(portapapeles.current);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [nodes, pegar]);

  // Cambia parte de la data de un nodo (lo que edita su formulario).
  const updateData = useCallback(
    (id: string, patch: Record<string, unknown>) => {
      setNodes((nds) =>
        nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...patch } } : n)),
      );
    },
    [setNodes],
  );

  // Quita la conexión que sale de una salida puntual (al borrar una opción del CASE).
  const removeExit = useCallback(
    (id: string, handleId: string) => {
      setEdges((eds) => eds.filter((e) => !(e.source === id && e.sourceHandle === handleId)));
    },
    [setEdges],
  );

  // Le asigna al audio subido el nombre único con el que queda guardado en
  // MinIO; el nombre visible es el del archivo original. La url permite
  // escucharlo en el editor (en el mock, un blob local; en la plataforma real,
  // la URL del audio ya guardado).
  const subirAudio = useCallback(
    (archivo: File) => ({
      archivo: `${crypto.randomUUID()}.wav`,
      nombre: archivo.name,
      url: URL.createObjectURL(archivo),
    }),
    [],
  );

  // Escape sale de la pantalla completa.
  useEffect(() => {
    if (!fullscreen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFullscreen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [fullscreen]);

  const conFueraDeHorario = useMemo(() => nodosConFueraDeHorario(nodes, edges), [nodes, edges]);

  // Nodos con algo sin conectar (ver nodosSinConectar). El número va al botón
  // «Confirmar» de la página; la marca roja en cada nodo recién aparece cuando
  // se tocó «Confirmar» (`mostrar`).
  const [sinConectar, setSinConectar] = useState<Set<string>>(new Set());
  const actualizarSinConectar = useCallback((ids: Set<string>) => {
    setSinConectar((previos) =>
      previos.size === ids.size && [...ids].every((id) => previos.has(id)) ? previos : ids,
    );
  }, []);
  useEffect(() => fijarSinConectar(sinConectar.size), [sinConectar]);
  useEffect(() => reiniciarEstadoConexiones, []);
  const { mostrar: marcarSinConectar } = useEstadoConexiones();

  // Si un nodo deja de cumplir la regla (se le agregó un camino a otra
  // campaña), su conexión "Fuera de horario" ya no aplica y se quita.
  useEffect(() => {
    if (edges.some((e) => e.sourceHandle === "out_of_hours" && !conFueraDeHorario.has(e.source))) {
      setEdges((eds) =>
        eds.filter((e) => e.sourceHandle !== "out_of_hours" || conFueraDeHorario.has(e.source)),
      );
    }
  }, [edges, conFueraDeHorario, setEdges]);

  // Con el imán encendido, cada nodo que se arrastra se engancha por su centro (centroEnGrilla).
  // No se usa el snapToGrid de React Flow porque engancha la esquina del nodo.
  const moverNodos = useCallback(
    (cambios: NodeChange<Node>[]) =>
      onNodesChange(
        iman
          ? cambios.map((c) =>
              c.type === "position" && c.position
                ? {
                    ...c,
                    position: centroEnGrilla(
                      c.position,
                      flowRef.current?.getNode(c.id)?.measured?.width ?? 0,
                    ),
                  }
                : c,
            )
          : cambios,
      ),
    [iman, onNodesChange],
  );

  // Al abrir, acomoda el flujo una vez que todos los nodos están medidos.
  const ordenadoInicial = useRef(false);
  const [flujoOrdenado, setFlujoOrdenado] = useState(false);
  useEffect(() => {
    if (ordenadoInicial.current || !nodes.every((n) => n.measured?.width)) return;
    ordenadoInicial.current = true;
    setFlujoOrdenado(true);
    setNodes((nds) => ordenar(nds, edges));
    setTimeout(() => flowRef.current?.fitView(ENCUADRE), 0);
  }, [nodes, edges, setNodes]);

  // El orden automático al abrir no cuenta como cambio; mover un nodo, sí.
  useCambiosDeValor(
    "flujo",
    {
      nodos: nodes.map((n) => ({ id: n.id, posicion: n.position, datos: n.data })),
      conexiones: edges.map((e) => [e.source, e.sourceHandle, e.target, e.targetHandle, e.data]),
    },
    flujoOrdenado,
  );

  const ordenarNodos = useCallback(() => {
    setNodes((nds) => ordenar(nds, edges));
    // Los desvíos de las conexiones eran para la disposición anterior.
    setEdges((eds) => eds.map((e) => (e.data ? { ...e, data: undefined } : e)));
    // Después de acomodar, encuadra todo el workflow.
    setTimeout(() => flowRef.current?.fitView({ ...ENCUADRE, duration: 300 }), 0);
  }, [edges, setNodes, setEdges]);

  // Todos los nodos (salvo "inicio", que no se contrae) están contraídos →
  // el botón pasa a "Expandir todo"; en cualquier otro caso, "Contraer todo".
  const todosContraidos = useMemo(() => {
    const contraibles = nodes.filter((n) => n.type !== "inicio" && n.type !== "nota");
    return contraibles.length > 0 && contraibles.every((n) => n.data.colapsado);
  }, [nodes]);

  // Alterna contraer/expandir en bloque todos los nodos.
  const toggleContraerTodo = useCallback(() => {
    setNodes((nds) =>
      nds.map((n) =>
        n.type === "inicio" || n.type === "nota" ? n : { ...n, data: { ...n.data, colapsado: !todosContraidos } },
      ),
    );
  }, [todosContraidos, setNodes]);

  const nodesWithHandlers = nodes.map((n) =>
    n.type === "inicio"
      ? { ...n, data: { sinConectar: marcarSinConectar && sinConectar.has(n.id) } }
      : {
          ...n,
          data: {
            ...n.data,
            sinConectar: marcarSinConectar && sinConectar.has(n.id),
            onChange: (patch: Record<string, unknown>) => updateData(n.id, patch),
            fueraDeHorario: conFueraDeHorario.has(n.id),
            onDelete: () => removeNode(n.id),
            onDuplicate: () => duplicar(n.id),
            onRemoveExit: (handleId: string) => removeExit(n.id, handleId),
            // Derivación
            campanias,
            // PLAY
            soloTexto,
            onSubirAudio: subirAudio,
          },
        },
  );

  // Mientras hay una conexión pendiente, se dibuja hasta la punta que sigue al mouse.
  const nodosEnLienzo: Node[] =
    pendiente && cursor
      ? [
          ...nodesWithHandlers,
          {
            id: PUNTA_ID,
            type: "punta",
            position: cursor,
            data: {},
            selectable: false,
            draggable: false,
            focusable: false,
            className: "pointer-events-none",
            // Tamaño y entrada declarados: la punta se recrea en cada movimiento
            // del mouse y no llega a medirse, y sin medidas no hay línea.
            width: 1,
            height: 1,
            handles: [{ type: "target", position: Position.Top, x: 0, y: 0, width: 1, height: 1 }],
          },
        ]
      : nodesWithHandlers;
  const conexionesEnLienzo: Edge[] =
    pendiente && cursor
      ? [
          ...edges,
          {
            id: `${PUNTA_ID}-edge`,
            source: pendiente.source,
            sourceHandle: pendiente.sourceHandle,
            target: PUNTA_ID,
            selectable: false,
            focusable: false,
            style: { strokeDasharray: "6 4", pointerEvents: "none" },
            className: "pointer-events-none",
            interactionWidth: 0,
          },
        ]
      : edges;

  return (
    <div
      className={cn(
        "flex flex-col",
        fullscreen && "fixed inset-0 z-50 bg-background p-4",
      )}
    >
      {/* Dentro del lienzo la ayuda al pasar el mouse espera 2 s (feedback
          2026-11: aparecer al toque sobre cada tarjeta y conexión molestaba). */}
      <TooltipProvider delayDuration={2000}>
      <div
        ref={lienzoRef}
        className={cn(
          "w-full overflow-hidden rounded-xl ring-1 ring-foreground/10",
          // Sin pantalla completa, el alto lo fija `alto` (ver MARGEN_INFERIOR);
          // h-[28rem] es solo el de la primera pintura.
          fullscreen ? "flex-1" : "h-[28rem]",
        )}
        style={fullscreen || alto === undefined ? undefined : { height: alto }}
      >
        <RutasContext.Provider value={rutasStore}>
        <ImanContext.Provider value={iman}>
        <ReactFlow
          nodes={nodosEnLienzo}
          edges={conexionesEnLienzo}
          onInit={(instancia) => {
            flowRef.current = instancia;
          }}
          onNodesChange={moverNodos}
          onEdgesChange={onEdgesChange}
          onConnect={(conexion) => {
            if (conexion.target !== PUNTA_ID) onConnect(conexion);
            cancelarConexion();
          }}
          onClickConnectStart={empezarConexion}
          onConnectEnd={soltarConexion}
          onNodeClick={(_, nodo) => terminarConexion(nodo)}
          onPaneClick={cancelarConexion}
          onMouseMove={(e) => {
            if (!pendiente) return;
            setCursor(flowRef.current?.screenToFlowPosition({ x: e.clientX, y: e.clientY }) ?? null);
          }}
          isValidConnection={isValidConnection}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          // Punta de flecha: deja claro hacia dónde va cada conexión.
          defaultEdgeOptions={{
            markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16, color: COLOR_CONEXION },
          }}
          // Líneas oscuras para distinguirlas fácil del fondo; la seleccionada
          // toma el color primario.
          style={
            {
              "--xy-edge-stroke-default": COLOR_CONEXION,
              "--xy-edge-stroke-selected-default": "var(--primary)",
              "--xy-edge-stroke-width-default": 1.5,
            } as React.CSSProperties
          }
          // Una conexión seleccionada también se borra con Backspace o Supr.
          deleteKeyCode={["Backspace", "Delete"]}
          // Zoom out bastante más que el default (0.5): un workflow real tiene
          // muchos nodos y hay que poder verlo entero.
          minZoom={0.1}
          // Al arrastrar una conexión, engancha al punto de entrada desde más lejos.
          connectionRadius={40}
          fitView
          fitViewOptions={ENCUADRE}
          proOptions={{ hideAttribution: true }}
        >
          {/* Fondo de puntos solo con el imán encendido: muestra dónde va a caer el nodo. */}
          {iman && <Background gap={GRILLA} size={1.5} color="var(--muted-foreground)" className="opacity-40" />}
          <EdgeRouter />
          <VigilanteConexiones onChange={actualizarSinConectar} />
          {/* Zoom, centrado y acciones sobre todo el lienzo, juntos: así no se
              confunden con los nodos que se agregan desde la paleta. Cada uno
              dice qué hace al pasar el mouse. */}
          <Controls showInteractive={false} showZoom={false} showFitView={false}>
            <ActionTooltip label={t("cuentas.flujo.acercar")} side="right">
              <ControlButton
                onClick={() => flowRef.current?.zoomIn()}
                aria-label={t("cuentas.flujo.acercar")}
                data-testid="zoom-acercar"
              >
                <Plus />
              </ControlButton>
            </ActionTooltip>
            <ActionTooltip label={t("cuentas.flujo.alejar")} side="right">
              <ControlButton
                onClick={() => flowRef.current?.zoomOut()}
                aria-label={t("cuentas.flujo.alejar")}
                data-testid="zoom-alejar"
              >
                <Minus />
              </ControlButton>
            </ActionTooltip>
            <ActionTooltip label={t("cuentas.flujo.centrar")} side="right">
              <ControlButton
                onClick={() => flowRef.current?.fitView({ ...ENCUADRE, duration: 300 })}
                aria-label={t("cuentas.flujo.centrar")}
                data-testid="zoom-centrar"
              >
                <Scan />
              </ControlButton>
            </ActionTooltip>
            <ActionTooltip label={t(todosContraidos ? "cuentas.flujo.expandirTodo" : "cuentas.flujo.contraerTodo")} side="right">
              <ControlButton
                onClick={toggleContraerTodo}
                aria-label={t(todosContraidos ? "cuentas.flujo.expandirTodo" : "cuentas.flujo.contraerTodo")}
                data-testid="contraer-expandir-todo"
              >
                {todosContraidos ? <ChevronsUpDown /> : <ChevronsDownUp />}
              </ControlButton>
            </ActionTooltip>
            <ActionTooltip label={t(iman ? "cuentas.flujo.imanApagar" : "cuentas.flujo.imanEncender")} side="right">
              <ControlButton
                onClick={alternarIman}
                aria-label={t(iman ? "cuentas.flujo.imanApagar" : "cuentas.flujo.imanEncender")}
                aria-pressed={iman}
                data-testid="iman-grilla"
                className={cn(iman && "!bg-accent")}
              >
                <Grid3x3 />
              </ControlButton>
            </ActionTooltip>
            <ActionTooltip label={t("cuentas.flujo.ordenarAyuda")} side="right">
              <ControlButton
                onClick={ordenarNodos}
                aria-label={t("cuentas.flujo.ordenarAyuda")}
                data-testid="ordenar-nodos"
              >
                <LayoutGrid />
              </ControlButton>
            </ActionTooltip>
          </Controls>

          {/* Sidenav flotante de macroestados dentro del canvas (feedback
              2026-07-16): la paleta vive adentro del lienzo, no en una barra
              superior. Flota sobre el contenido → lleva sombra (DESIGN.md). */}
          <Panel position="top-left">
            {paletaAbierta ? (
              <div className="flex w-56 flex-col gap-2 rounded-xl bg-card p-3 text-card-foreground shadow-md ring-1 ring-foreground/10">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">
                    {t("cuentas.flujo.macroestados")}
                  </span>
                  <ActionTooltip label={t("cuentas.flujo.paleta.ocultar")}>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={t("cuentas.flujo.paleta.ocultar")}
                      data-testid="paleta-alternar"
                      onClick={() => setPaletaAbierta(false)}
                    >
                      <PanelLeftClose />
                    </Button>
                  </ActionTooltip>
                </div>
                {PALETA.map(({ type, icono }) => {
                  const Icono = soloTexto && type === "play" ? MessageSquare : icono;
                  return (
                  <ActionTooltip key={type} label={t(claveDescripcion(type, soloTexto))}>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="justify-start"
                      data-testid={`paleta-${type}`}
                      onClick={() => addNodo(type)}
                    >
                      <Icono />
                      {t(claveTitulo(type, soloTexto))}
                    </Button>
                  </ActionTooltip>
                  );
                })}
              </div>
            ) : (
              <ActionTooltip label={t("cuentas.flujo.paleta.mostrar")}>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="bg-card shadow-sm"
                  aria-label={t("cuentas.flujo.paleta.mostrar")}
                  data-testid="paleta-alternar"
                  onClick={() => setPaletaAbierta(true)}
                >
                  <PanelLeftOpen />
                  {t("cuentas.flujo.macroestados")}
                </Button>
              </ActionTooltip>
            )}
          </Panel>

          <Panel position="top-right">
            <ActionTooltip
              label={t(
                fullscreen
                  ? "cuentas.flujo.salirPantallaCompleta"
                  : "cuentas.flujo.pantallaCompleta"
              )}
              shortcut={fullscreen ? ["Esc"] : undefined}
            >
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                className="bg-card shadow-sm"
                aria-label={t(
                  fullscreen
                    ? "cuentas.flujo.salirPantallaCompleta"
                    : "cuentas.flujo.pantallaCompleta"
                )}
                onClick={() => setFullscreen((f) => !f)}
              >
                {fullscreen ? <Minimize2 /> : <Maximize2 />}
              </Button>
            </ActionTooltip>
          </Panel>
        </ReactFlow>
        </ImanContext.Provider>
        </RutasContext.Provider>
      </div>
      </TooltipProvider>
    </div>
  );
}
