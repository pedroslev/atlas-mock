"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  Handle,
  Panel,
  Position,
  addEdge,
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  useNodesState,
  useEdgesState,
  useReactFlow,
  type Connection,
  type Edge,
  type EdgeProps,
  type Node,
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
  Volume2,
  Keyboard,
  Split,
  ListTree,
  X,
  LayoutGrid,
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
  DerivacionNode,
} from "@/components/workflow/macroestados";

// Editor de workflow de la cuenta (ver ADR-BD-002 §accounts.workflow): el
// "Inicio de interacción" (único, fijo), la "Derivación a campaña" y el primer
// set de macroestados de Fase 1 — PLAY, COLLECT, IF y CASE (ver
// macroestados.tsx). Cada salida con nombre de un nodo va a un solo destino;
// para abrir caminos se usan IF y CASE.
// Estado local únicamente — no hay persistencia real (ver PRODUCT.md).

function InicioNode() {
  const t = useT();
  return (
    <div className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-primary-foreground ring-1 ring-foreground/10">
      <Play className="size-4" />
      <span className="text-sm font-medium">{t("cuentas.flujo.inicio")}</span>
      <Handle type="source" position={Position.Right} className="!bg-primary-foreground" />
    </div>
  );
}

// Regla de alcanzabilidad de "Fuera de horario" (propuesta-motor-workflows.md
// §4.2): un nodo la ofrece cuando todos los caminos que salen de él terminan
// en una misma derivación. Se miran las salidas conectadas (sin contar las
// "Fuera de horario"); una salida conectada que termina en un nodo sin salidas
// que no es derivación, o caminos que llegan a derivaciones distintas, la
// deshabilitan. Volver a un nodo ya recorrido (un menú que se repite) no
// cuenta como camino nuevo.
function nodosConFueraDeHorario(nodes: Node[], edges: Edge[]): Set<string> {
  const tipo = new Map(nodes.map((n) => [n.id, n.type]));
  const salidas = new Map<string, string[]>();
  for (const e of edges) {
    if (e.sourceHandle === "out_of_hours") continue;
    salidas.set(e.source, [...(salidas.get(e.source) ?? []), e.target]);
  }
  // Destinos finales de todos los caminos desde `id`; `null` = un camino que no
  // termina en una derivación.
  const destinos = (id: string, recorridos: Set<string>): Set<string | null> => {
    if (tipo.get(id) === "derivacion") return new Set([id]);
    const siguientes = (salidas.get(id) ?? []).filter((t) => !recorridos.has(t));
    if ((salidas.get(id) ?? []).length === 0) return new Set([null]);
    const resultado = new Set<string | null>();
    for (const t of siguientes) {
      for (const d of destinos(t, new Set([...recorridos, id]))) resultado.add(d);
    }
    return resultado;
  };
  const habilitados = new Set<string>();
  for (const n of nodes) {
    // El inicio no ofrece "Fuera de horario"; la derivación es terminal.
    if (n.type === "inicio" || n.type === "derivacion" || n.type === "punta") continue;
    const ds = destinos(n.id, new Set());
    if (ds.size === 1 && !ds.has(null)) habilitados.add(n.id);
  }
  return habilitados;
}

// "Ordenar": acomoda los nodos en columnas según la distancia desde el
// inicio (el inicio a la izquierda, después los pasos en el orden en que se
// recorren), con la misma separación entre columnas y entre nodos de una
// columna. Los nodos que no se alcanzan desde el inicio van a una última
// columna.
const SEPARACION_X = 120;
const SEPARACION_Y = 48;
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
  const columnas: Node[][] = [];
  for (const n of nodes) {
    const c = nivel.get(n.id) ?? ultimo;
    (columnas[c] ??= []).push(n);
  }
  const ancho = (n: Node) => n.measured?.width ?? 288;
  const alto = (n: Node) => n.measured?.height ?? 200;
  const posiciones = new Map<string, { x: number; y: number }>();
  let x = 0;
  for (const columna of columnas.filter(Boolean)) {
    const total =
      columna.reduce((acc, n) => acc + alto(n), 0) + SEPARACION_Y * (columna.length - 1);
    let y = -total / 2;
    for (const n of columna) {
      posiciones.set(n.id, { x, y });
      y += alto(n) + SEPARACION_Y;
    }
    x += Math.max(...columna.map(ancho)) + SEPARACION_X;
  }
  return nodes.map((n) => ({ ...n, position: posiciones.get(n.id) ?? n.position }));
}

// Conexión con un botón para quitarla en el medio, siempre visible. Sin él, la única forma de borrar una conexión era hacer
// click justo sobre la línea y apretar Backspace, y no había cómo saberlo.
function ConexionQuitable({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  markerEnd,
  selected,
}: EdgeProps) {
  const t = useT();
  const { deleteElements } = useReactFlow();
  const [path, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });
  return (
    <>
      <BaseEdge id={id} path={path} style={style} markerEnd={markerEnd} />
      <EdgeLabelRenderer>
        <div
          className={cn(
            "nodrag nopan pointer-events-auto absolute",
            !selected && "opacity-70 hover:opacity-100",
          )}
          style={{ transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)` }}
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
      position={Position.Left}
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
};

// Macroestados que se agregan desde la paleta, en el orden en que aparecen.
const PALETA: { type: Exclude<WorkflowNodeType, "inicio">; icono: typeof GitBranch }[] = [
  { type: "play", icono: Volume2 },
  { type: "collect", icono: Keyboard },
  { type: "if", icono: Split },
  { type: "case", icono: ListTree },
  { type: "derivacion", icono: GitBranch },
];

let nextId = 1;

export function WorkflowEditor({
  initialWorkflow,
  campanias,
  admiteTexto,
}: {
  initialWorkflow?: Workflow;
  campanias: { id: string; nombre: string }[];
  // El PLAY con texto solo vale en cuentas de chat.
  admiteTexto: boolean;
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
  // MinIO; el nombre visible es el del archivo original.
  const subirAudio = useCallback(
    (archivo: File) => ({ archivo: `${crypto.randomUUID()}.wav`, nombre: archivo.name }),
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

  const ordenarNodos = useCallback(() => {
    setNodes((nds) => ordenar(nds, edges));
    // Después de acomodar, encuadra todo el workflow.
    setTimeout(() => flowRef.current?.fitView({ padding: 0.15, duration: 300 }), 0);
  }, [edges, setNodes]);

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
            admiteTexto,
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
            handles: [{ type: "target", position: Position.Left, x: 0, y: 0, width: 1, height: 1 }],
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
          fullscreen ? "flex-1" : "h-[28rem]",
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
          // Una conexión seleccionada también se borra con Backspace o Supr.
          deleteKeyCode={["Backspace", "Delete"]}
          // Zoom out bastante más que el default (0.5): un workflow real tiene
          // muchos nodos y hay que poder verlo entero.
          minZoom={0.1}
          fitView
          proOptions={{ hideAttribution: true }}
        >
          <Background gap={16} color="var(--border)" />
          <Controls showInteractive={false} />

          {/* Sidenav flotante de macroestados dentro del canvas (feedback
              2026-07-16): la paleta vive adentro del lienzo, no en una barra
              superior. Flota sobre el contenido → lleva sombra (DESIGN.md). */}
          <Panel position="top-left">
            <div className="flex w-56 flex-col gap-2 rounded-xl bg-card p-3 text-card-foreground shadow-md ring-1 ring-foreground/10">
              <span className="text-xs font-medium text-muted-foreground">
                {t("cuentas.flujo.macroestados")}
              </span>
              {PALETA.map(({ type, icono: Icono }) => (
                <ActionTooltip key={type} label={t(`cuentas.flujo.${type}.descripcion`)}>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="justify-start"
                    data-testid={`paleta-${type}`}
                    onClick={() => addNodo(type)}
                  >
                    <Icono />
                    {t(`cuentas.flujo.${type}`)}
                  </Button>
                </ActionTooltip>
              ))}
              <ActionTooltip label={t("cuentas.flujo.ordenarAyuda")}>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="justify-start"
                  data-testid="ordenar-nodos"
                  onClick={ordenarNodos}
                >
                  <LayoutGrid />
                  {t("cuentas.flujo.ordenar")}
                </Button>
              </ActionTooltip>
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
