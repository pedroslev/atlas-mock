"use client";

import type React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  useInternalNode,
  useNodesState,
  useEdgesState,
  useReactFlow,
  type Connection,
  type Edge,
  type EdgeProps,
  type Node,
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ActionTooltip } from "@/components/layout/action-tooltip";
import { useT } from "@/lib/i18n";
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

function InicioNode() {
  const t = useT();
  return (
    <div className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-primary-foreground ring-1 ring-foreground/10">
      <Play className="size-4" />
      <span className="text-sm font-medium">{t("cuentas.flujo.inicio")}</span>
      <Handle type="source" position={Position.Bottom} className="!bg-primary-foreground" />
    </div>
  );
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
    if (n.type === "inicio" || n.type === "punta") continue;
    if (campaniasDesde(n.id).size === 1) habilitados.add(n.id);
  }
  return habilitados;
}

// "Ordenar": acomoda los nodos en capas de arriba hacia abajo según la
// distancia desde el inicio (el inicio arriba, después los pasos en el orden
// en que se recorren), con la misma separación entre capas y entre nodos de
// una capa. Los nodos que no se alcanzan desde el inicio van a una última
// capa. Las separaciones dejan lugar para los canales por donde corren las
// conexiones (ver ConexionQuitable).
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
      posiciones.set(n.id, { x, y });
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

// Solo para dibujar: una conexión cuyo destino quedó arriba del nodo de origen
// (o a su altura) no puede bajar directo al borde superior sin atravesar nodos,
// así que va por el carril lateral. Es geometría del lienzo, no tiene que ver
// con si la conexión es de retorno.
const vaPorCarril = (origen: Node, destino: Node) =>
  destino.position.y < origen.position.y + (origen.measured?.height ?? 0);

// Conexión ortogonal para un flujo que corre de arriba hacia abajo. Sale por
// la derecha de la fila de la salida y entra por el borde superior del destino.
// - Hacia adelante: baja por la separación al costado del nodo y corre por el
//   canal que hay justo arriba de la capa del destino.
// - Hacia un destino que quedó arriba: baja al canal de abajo de su capa, sale
//   al carril lateral derecho —fuera de todos los nodos, un carril por
//   conexión— y sube hasta el canal de arriba del destino. Así nunca pasa por
//   detrás de un nodo.
// - Las de retorno (ver conexionesDeRetorno) van punteadas y llevan una
//   etiqueta con el nombre del destino, pegada a la salida.
// Con un nodo seleccionado, las conexiones que no lo tocan se atenúan.
// El botón para quitarla va en el medio, siempre visible: sin él, la única
// forma de borrarla era hacer click justo sobre la línea y apretar Backspace.
function ConexionQuitable({
  id,
  source,
  target,
  sourceHandleId,
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
  const { deleteElements, setCenter, getZoom } = useReactFlow();
  const nodes = useNodes();
  const edges = useEdges();
  const origen = nodes.find((n) => n.id === source);
  const destino = nodes.find((n) => n.id === target);
  const internoOrigen = useInternalNode(source);
  if (!origen || !destino) return null;

  const porId = new Map(nodes.map((n) => [n.id, n]));
  const retorno = conexionesDeRetorno(nodes, edges).has(id);
  const porCarril = vaPorCarril(origen, destino);
  // Conexiones que comparten el mismo tipo de trazado: sirven para repartir
  // carriles y canales y que no se superpongan.
  const hermanas = edges.filter((e) => {
    const o = porId.get(e.source);
    const d = porId.get(e.target);
    if (!o || !d || vaPorCarril(o, d) !== porCarril) return false;
    return porCarril || Math.round(d.position.y / 10) === Math.round(destino.position.y / 10);
  });
  const rango = Math.max(0, hermanas.findIndex((e) => e.id === id));

  // Separación al costado del nodo: la salida más alta es la más lejana, así
  // las conexiones de una misma tarjeta quedan anidadas y no se cruzan.
  const salidas = internoOrigen?.internals.handleBounds?.source ?? [];
  const posSalida = Math.max(0, salidas.findIndex((h) => h.id === (sourceHandleId ?? null)));
  // El inicio sale por abajo: baja derecho, sin el codo al costado.
  const gx = sourcePosition === Position.Bottom ? sourceX : sourceX + 14 + 9 * (Math.max(salidas.length, 1) - 1 - posSalida);

  let puntos: [number, number][];
  // Dónde va la cruz para quitar la conexión (a mitad de tramo) y, solo en los
  // retornos, la etiqueta con el destino (pegada a la salida).
  let quitarX: number;
  let quitarY: number;
  let etiquetaX = 0;
  let etiquetaY = 0;
  if (porCarril) {
    const altoOrigen = origen.measured?.height ?? 0;
    const fondoCapa = Math.max(
      ...nodes
        .filter(
          (n) =>
            n.position.y < origen.position.y + altoOrigen &&
            n.position.y + (n.measured?.height ?? 0) > origen.position.y,
        )
        .map((n) => n.position.y + (n.measured?.height ?? 0)),
    );
    const derecha = Math.max(...nodes.map((n) => n.position.x + (n.measured?.width ?? 0)));
    const carril = derecha + 36 + rango * 18;
    // Los retornos de una misma capa bajan a canales separados lo suficiente
    // para que sus etiquetas, que van sobre este tramo, no se pisen.
    const rangoCapa = hermanas
      .filter((e) => Math.round((porId.get(e.source)?.position.y ?? 0) / 10) === Math.round(origen.position.y / 10))
      .findIndex((e) => e.id === id);
    const abajo = fondoCapa + 24 + Math.max(0, rangoCapa) * 22;
    const arriba = targetY - 46 - rango * 9;
    puntos = [
      [sourceX, sourceY],
      [gx, sourceY],
      [gx, abajo],
      [carril, abajo],
      [carril, arriba],
      [targetX, arriba],
      [targetX, targetY],
    ];
    // La etiqueta de un retorno va pegada a donde sale la línea, no a donde
    // llega: dice a qué nodo vuelve esta salida, leída desde la salida.
    etiquetaX = gx + 10;
    etiquetaY = abajo;
    quitarX = carril;
    quitarY = (abajo + arriba) / 2;
  } else {
    const canal = Math.max(targetY - 16 - (rango % 5) * 7, sourceY + 8);
    puntos = [
      [sourceX, sourceY],
      [gx, sourceY],
      [gx, canal],
      [targetX, canal],
      [targetX, targetY],
    ];
    quitarX = (gx + targetX) / 2;
    quitarY = canal;
  }

  const hayNodoSeleccionado = nodes.some((n) => n.selected);
  const atenuada = hayNodoSeleccionado && !selected && !origen.selected && !destino.selected;
  const nombreDestino =
    (destino.data.titulo as string | undefined) ?? t(claveTitulo(destino.type ?? "", destino.data.soloTexto === true));

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
                onClick={() =>
                  setCenter(
                    destino.position.x + (destino.measured?.width ?? 0) / 2,
                    destino.position.y + (destino.measured?.height ?? 0) / 2,
                    { zoom: Math.max(getZoom(), 0.6), duration: 400 },
                  )
                }
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
];

// Encuadre del flujo: nunca más de 100%, así un flujo de un solo nodo no se
// agranda hasta llenar el lienzo.
const ENCUADRE = { padding: 0.15, maxZoom: 1 };
const COLOR_CONEXION = "var(--foreground)";

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
        return [...nds, { id, type, position, data: {} }];
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

  // Si un nodo deja de cumplir la regla (se le agregó un camino a otra
  // campaña), su conexión "Fuera de horario" ya no aplica y se quita.
  useEffect(() => {
    if (edges.some((e) => e.sourceHandle === "out_of_hours" && !conFueraDeHorario.has(e.source))) {
      setEdges((eds) =>
        eds.filter((e) => e.sourceHandle !== "out_of_hours" || conFueraDeHorario.has(e.source)),
      );
    }
  }, [edges, conFueraDeHorario, setEdges]);

  // Al abrir, acomoda el flujo una vez que todos los nodos están medidos.
  const ordenadoInicial = useRef(false);
  useEffect(() => {
    if (ordenadoInicial.current || !nodes.every((n) => n.measured?.width)) return;
    ordenadoInicial.current = true;
    setNodes((nds) => ordenar(nds, edges));
    setTimeout(() => flowRef.current?.fitView(ENCUADRE), 0);
  }, [nodes, edges, setNodes]);

  const ordenarNodos = useCallback(() => {
    setNodes((nds) => ordenar(nds, edges));
    // Después de acomodar, encuadra todo el workflow.
    setTimeout(() => flowRef.current?.fitView({ ...ENCUADRE, duration: 300 }), 0);
  }, [edges, setNodes]);

  // Todos los nodos (salvo "inicio", que no se contrae) están contraídos →
  // el botón pasa a "Expandir todo"; en cualquier otro caso, "Contraer todo".
  const todosContraidos = useMemo(() => {
    const contraibles = nodes.filter((n) => n.type !== "inicio");
    return contraibles.length > 0 && contraibles.every((n) => n.data.colapsado);
  }, [nodes]);

  // Alterna contraer/expandir en bloque todos los nodos.
  const toggleContraerTodo = useCallback(() => {
    setNodes((nds) =>
      nds.map((n) =>
        n.type === "inicio" ? n : { ...n, data: { ...n.data, colapsado: !todosContraidos } },
      ),
    );
  }, [todosContraidos, setNodes]);

  const nodesWithHandlers = nodes.map((n) =>
    n.type === "inicio"
      ? n
      : {
          ...n,
          data: {
            ...n.data,
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
      <div
        ref={lienzoRef}
        className={cn(
          "w-full overflow-hidden rounded-xl ring-1 ring-foreground/10",
          // Sin pantalla completa, el lienzo usa el alto que queda en la
          // ventana (menos el encabezado, las solapas y el título de la
          // tarjeta); el mínimo deja lugar a la paleta y a los controles.
          fullscreen ? "flex-1" : "h-[calc(100dvh-17rem)] min-h-[32rem]",
        )}
      >
        <ReactFlow
          nodes={nodosEnLienzo}
          edges={conexionesEnLienzo}
          onInit={(instancia) => {
            flowRef.current = instancia;
          }}
          onNodesChange={onNodesChange}
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
          fitView
          fitViewOptions={ENCUADRE}
          proOptions={{ hideAttribution: true }}
        >
          <Background gap={16} color="var(--border)" />
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
            <div className="flex w-56 flex-col gap-2 rounded-xl bg-card p-3 text-card-foreground shadow-md ring-1 ring-foreground/10">
              <span className="text-xs font-medium text-muted-foreground">
                {t("cuentas.flujo.macroestados")}
              </span>
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
      </div>
    </div>
  );
}
