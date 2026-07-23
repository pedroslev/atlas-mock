"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  Handle,
  Panel,
  Position,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  Play,
  GitBranch,
  Trash2,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ActionTooltip } from "@/components/layout/action-tooltip";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { Workflow, WorkflowNode, WorkflowEdge } from "@/lib/mock-data";

// Editor de workflow simplificado para fase 0 (ver ADR-BD-002 §accounts.workflow):
// dos macro-estados — "Inicio de interacción" (único, fijo) y "Derivación a
// campaña". Mientras no exista un macroestado de decisión (if/switch), el
// inicio solo puede conectarse a UNA derivación (feedback 2026-07-16).
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

type DerivacionData = {
  campaniaId?: string;
  campanias: { id: string; nombre: string }[];
  onChangeCampania: (campaniaId: string) => void;
  onDelete: () => void;
};

function DerivacionNode({ data }: NodeProps & { data: DerivacionData }) {
  const t = useT();
  return (
    <div className="flex w-64 flex-col gap-2 rounded-xl bg-card p-3 text-card-foreground ring-1 ring-foreground/10">
      <Handle type="target" position={Position.Left} className="!bg-secondary" />
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-sm font-medium">
          <GitBranch className="size-4 text-secondary" />
          {t("cuentas.flujo.derivacion")}
        </span>
        <ActionTooltip label={t("cuentas.flujo.quitarNodo")}>
          <button
            type="button"
            aria-label={t("cuentas.flujo.quitarNodoAria")}
            onClick={data.onDelete}
            className="flex size-6 items-center justify-center rounded-lg text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="size-3.5" />
          </button>
        </ActionTooltip>
      </div>
      <Select value={data.campaniaId} onValueChange={data.onChangeCampania}>
        <SelectTrigger size="sm" className="w-full">
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
    </div>
  );
}

const nodeTypes = { inicio: InicioNode, derivacion: DerivacionNode };

let nextId = 1;

export function WorkflowEditor({
  initialWorkflow,
  campanias,
}: {
  initialWorkflow?: Workflow;
  campanias: { id: string; nombre: string }[];
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
            type: "derivacion",
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
      source: e.source,
      target: e.target,
    })) ?? [],
  );

  const inicioId = inicioNode.id;

  // Sin nodo if/switch, el inicio admite una única conexión saliente.
  const isValidConnection = useCallback(
    (connection: Connection | Edge) =>
      connection.source !== inicioId ||
      !edges.some((e) => e.source === inicioId),
    [edges, inicioId],
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      if (!isValidConnection(connection)) return;
      setEdges((eds) => addEdge(connection, eds));
    },
    [isValidConnection, setEdges],
  );

  const addDerivacion = useCallback(() => {
    const id = `derivacion-${nextId++}`;
    const yOffset = 40 + nodes.length * 90;
    setNodes((nds) => [
      ...nds,
      {
        id,
        type: "derivacion",
        position: { x: 380, y: yOffset },
        data: { campaniaId: undefined },
      },
    ]);
  }, [nodes.length, setNodes]);

  const removeNode = useCallback(
    (id: string) => {
      setNodes((nds) => nds.filter((n) => n.id !== id));
      setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
    },
    [setNodes, setEdges],
  );

  const setCampania = useCallback(
    (id: string, campaniaId: string) => {
      setNodes((nds) =>
        nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, campaniaId } } : n)),
      );
    },
    [setNodes],
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

  const nodesWithHandlers = nodes.map((n) =>
    n.type === "derivacion"
      ? {
          ...n,
          data: {
            ...n.data,
            campanias,
            onChangeCampania: (campaniaId: string) => setCampania(n.id, campaniaId),
            onDelete: () => removeNode(n.id),
          },
        }
      : n,
  );

  return (
    <div
      className={cn(
        "flex flex-col",
        fullscreen && "fixed inset-0 z-50 bg-background p-4",
      )}
    >
      <div
        className={cn(
          "w-full overflow-hidden rounded-xl ring-1 ring-foreground/10",
          fullscreen ? "flex-1" : "h-[28rem]",
        )}
      >
        <ReactFlow
          nodes={nodesWithHandlers}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          isValidConnection={isValidConnection}
          nodeTypes={nodeTypes}
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
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="justify-start"
                onClick={addDerivacion}
              >
                <GitBranch />
                {t("cuentas.flujo.derivacion")}
              </Button>
              <p className="text-xs text-muted-foreground">
                {t("cuentas.flujo.ayuda")}
              </p>
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
