"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  User,
  History,
  Sparkles,
  Tag,
  NotebookPen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CANAL_ICON, CANAL_LABEL, type HistorialEntrada, type Tipificacion } from "@/lib/pad-mock/data";
import { OpenQuestion } from "@/components/pad-mock/open-question";

type ClienteMock = {
  numeroCliente: string;
  nombre: string;
  telefono: string;
  mail: string;
  segmento: string;
  antiguedad: string;
};

type ArticuloCopiloto = { titulo: string; resumen: string; fuente: string };

type SeccionId = "cliente" | "historial" | "copiloto" | "tipificacion" | "notas";

const SECCIONES: { id: SeccionId; label: string; icon: typeof User }[] = [
  { id: "cliente", label: "Cliente", icon: User },
  { id: "historial", label: "Historial", icon: History },
  { id: "copiloto", label: "Copiloto", icon: Sparkles },
  { id: "tipificacion", label: "Tipificación", icon: Tag },
  { id: "notas", label: "Notas", icon: NotebookPen },
];

function Seccion({
  id,
  label,
  icon: Icon,
  abierta,
  onToggle,
  children,
}: {
  id: SeccionId;
  label: string;
  icon: typeof User;
  abierta: boolean;
  onToggle: (id: SeccionId) => void;
  children: React.ReactNode;
}) {
  return (
    <details
      open={abierta}
      onToggle={(e) => {
        if (e.currentTarget.open !== abierta) onToggle(id);
      }}
      className="border-b border-border"
    >
      <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2.5 text-sm font-medium select-none marker:content-none [&::-webkit-details-marker]:hidden">
        <Icon className="size-4 shrink-0 text-muted-foreground" />
        <span className="flex-1">{label}</span>
        <ChevronDown
          className={cn(
            "size-3.5 shrink-0 text-muted-foreground transition-transform",
            abierta && "rotate-180"
          )}
        />
      </summary>
      <div className="px-3 pb-3">{children}</div>
    </details>
  );
}

// Brief §5 — acordeón, cada sección se abre/cierra por separado. Colapsa a una
// tira de íconos verticales; un click sobre un ícono reabre la columna con esa
// sección puntual abierta.
export function ContextColumn({
  colapsada,
  onToggle,
  cliente,
  historial,
  tipificaciones,
  articulo,
  seccionesAbiertasInit,
}: {
  colapsada: boolean;
  onToggle: () => void;
  cliente: ClienteMock;
  historial: HistorialEntrada[];
  tipificaciones: Tipificacion[];
  articulo?: ArticuloCopiloto;
  seccionesAbiertasInit: SeccionId[];
}) {
  const [abiertas, setAbiertas] = useState<Set<SeccionId>>(new Set(seccionesAbiertasInit));
  const [tipSeleccionada, setTipSeleccionada] = useState(
    tipificaciones.find((t) => t.sugerida)?.id ?? tipificaciones[0]?.id
  );

  function toggle(id: SeccionId) {
    setAbiertas((cur) => {
      const next = new Set(cur);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function abrirDesdeColapsada(id: SeccionId) {
    setAbiertas(new Set([id]));
    onToggle();
  }

  if (colapsada) {
    return (
      <div className="flex w-12 shrink-0 flex-col items-center gap-2 border-l border-border bg-card py-2">
        <Button variant="ghost" size="icon-sm" aria-label="Expandir contexto" onClick={onToggle}>
          <ChevronsLeft className="size-4" />
        </Button>
        <div className="flex flex-col gap-1.5">
          {SECCIONES.map(({ id, label, icon: Icon }) => (
            <Button
              key={id}
              variant="ghost"
              size="icon-sm"
              aria-label={label}
              title={label}
              onClick={() => abrirDesdeColapsada(id)}
            >
              <Icon className="size-4" />
            </Button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-60 shrink-0 flex-col border-l border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-3 py-1.5">
        <span className="text-[0.65rem] font-semibold tracking-wide text-muted-foreground uppercase">
          Contexto
        </span>
        <Button variant="ghost" size="icon-sm" aria-label="Colapsar contexto" onClick={onToggle}>
          <ChevronsRight className="size-3.5" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <Seccion id="cliente" label="Cliente" icon={User} abierta={abiertas.has("cliente")} onToggle={toggle}>
          <dl className="flex flex-col gap-1.5 text-xs">
            <div className="flex justify-between gap-2">
              <dt className="text-muted-foreground">N° cliente</dt>
              <dd className="font-medium tabular-nums">{cliente.numeroCliente}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-muted-foreground">Nombre</dt>
              <dd className="text-right font-medium">{cliente.nombre}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-muted-foreground">Teléfono</dt>
              <dd className="text-right tabular-nums">{cliente.telefono}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-muted-foreground">Mail</dt>
              <dd className="truncate text-right">{cliente.mail}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-muted-foreground">Segmento</dt>
              <dd className="text-right">{cliente.segmento}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-muted-foreground">Antigüedad</dt>
              <dd className="text-right">{cliente.antiguedad}</dd>
            </div>
          </dl>
        </Seccion>

        <Seccion id="historial" label="Historial" icon={History} abierta={abiertas.has("historial")} onToggle={toggle}>
          <div className="flex flex-col gap-1.5">
            {historial.map((h) => {
              const Icon = CANAL_ICON[h.canal];
              return (
                <details key={h.id} className="rounded-md border border-border">
                  <summary className="flex cursor-pointer list-none items-center gap-1.5 px-2 py-1.5 text-xs select-none [&::-webkit-details-marker]:hidden">
                    <Icon className="size-3 shrink-0 text-muted-foreground" />
                    <span className="flex-1 font-medium">{h.fecha}</span>
                    <Badge
                      variant={
                        h.estado === "Resuelto"
                          ? "success"
                          : h.estado === "Derivado a nivel 2"
                            ? "info"
                            : "warning"
                      }
                    >
                      {h.estado}
                    </Badge>
                  </summary>
                  <p className="border-t border-border px-2 py-1.5 text-xs text-muted-foreground">
                    {CANAL_LABEL[h.canal]} — {h.resumen}
                  </p>
                </details>
              );
            })}
          </div>
        </Seccion>

        <Seccion id="copiloto" label="Copiloto" icon={Sparkles} abierta={abiertas.has("copiloto")} onToggle={toggle}>
          {articulo ? (
            <div className="flex flex-col gap-1.5">
              <p className="text-xs font-semibold">{articulo.titulo}</p>
              <p className="text-xs text-muted-foreground">{articulo.resumen}</p>
              <p className="font-mono text-[0.65rem] text-muted-foreground">{articulo.fuente}</p>
              <OpenQuestion>de dónde saca el copiloto lo que sabe.</OpenQuestion>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic">
              Sin sugerencias de conocimiento para esta interacción.
            </p>
          )}
        </Seccion>

        <Seccion
          id="tipificacion"
          label="Tipificación"
          icon={Tag}
          abierta={abiertas.has("tipificacion")}
          onToggle={toggle}
        >
          <div className="flex flex-col gap-1">
            {tipificaciones.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTipSeleccionada(t.id)}
                className={cn(
                  "flex items-center justify-between gap-2 rounded-md border px-2 py-1.5 text-left text-xs transition-colors",
                  tipSeleccionada === t.id
                    ? "border-primary bg-primary/10 font-medium"
                    : "border-border hover:bg-muted"
                )}
              >
                <span>{t.nombre}</span>
                {t.sugerida && (
                  <Badge variant="info" className="shrink-0 gap-1">
                    <Sparkles className="size-2.5" />
                    Sugerida
                  </Badge>
                )}
              </button>
            ))}
            <OpenQuestion>cómo se guarda una tipificación sugerida por el copiloto vs. una cargada a mano.</OpenQuestion>
          </div>
        </Seccion>

        <Seccion id="notas" label="Notas" icon={NotebookPen} abierta={abiertas.has("notas")} onToggle={toggle}>
          <Textarea placeholder="Notas libres sobre esta interacción…" rows={3} className="resize-none text-xs" />
        </Seccion>
      </div>
    </div>
  );
}
