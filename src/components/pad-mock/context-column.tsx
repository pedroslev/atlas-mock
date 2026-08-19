"use client";

import { useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  ChevronsUpDown,
  User,
  History,
  Sparkles,
  Tag,
  NotebookPen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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

// Orden de renderizado: Tipificación va ÚLTIMA (a pedido) — el resto sigue el
// orden del brief §5.
type SeccionId = "cliente" | "historial" | "copiloto" | "notas" | "tipificacion";

const SECCIONES: { id: SeccionId; label: string; icon: typeof User }[] = [
  { id: "cliente", label: "Cliente", icon: User },
  { id: "historial", label: "Historial", icon: History },
  { id: "copiloto", label: "Copiloto", icon: Sparkles },
  { id: "notas", label: "Notas", icon: NotebookPen },
  { id: "tipificacion", label: "Tipificación", icon: Tag },
];

// Acordeón 100% React (sin <details>/onToggle nativo — ese combo controlado
// se desincronizaba al cambiar de interacción). Un botón + render condicional,
// nada de estado del navegador que React tenga que perseguir.
function Seccion({
  label,
  icon: Icon,
  abierta,
  onToggle,
  children,
}: {
  label: string;
  icon: typeof User;
  abierta: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-border">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={abierta}
        className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm font-medium"
      >
        <Icon className="size-4 shrink-0 text-muted-foreground" />
        <span className="flex-1">{label}</span>
        <ChevronDown
          className={cn(
            "size-3.5 shrink-0 text-muted-foreground transition-transform",
            abierta && "rotate-180"
          )}
        />
      </button>
      {abierta && <div className="px-3 pb-3">{children}</div>}
    </div>
  );
}

function HistorialItem({ entrada }: { entrada: HistorialEntrada }) {
  const [abierta, setAbierta] = useState(false);
  const Icon = CANAL_ICON[entrada.canal];
  return (
    <div className="rounded-md border border-border">
      <button
        type="button"
        onClick={() => setAbierta((v) => !v)}
        aria-expanded={abierta}
        className="flex w-full items-center gap-1.5 px-2 py-1.5 text-left text-xs"
      >
        <Icon className="size-3 shrink-0 text-muted-foreground" />
        <span className="flex-1 font-medium">{entrada.fecha}</span>
        <Badge
          variant={
            entrada.estado === "Resuelto"
              ? "success"
              : entrada.estado === "Derivado a nivel 2"
                ? "info"
                : "warning"
          }
        >
          {entrada.estado}
        </Badge>
      </button>
      {abierta && (
        <p className="border-t border-border px-2 py-1.5 text-xs text-muted-foreground">
          {CANAL_LABEL[entrada.canal]} — {entrada.resumen}
        </p>
      )}
    </div>
  );
}

// Combobox con buscador (mismo patrón que EntityCombobox de Olimpo) — el
// catálogo de tipificaciones suele ser largo, una lista de botones no
// escala. La sugerida por el copiloto se marca con badge, tanto en el
// trigger como en la lista.
function TipificacionSelector({
  tipificaciones,
  value,
  onChange,
}: {
  tipificaciones: Tipificacion[];
  value: string | undefined;
  onChange: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const seleccionada = tipificaciones.find((t) => t.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          size="sm"
          className="w-full min-w-0 justify-between font-normal"
        >
          <span className="flex min-w-0 flex-1 items-center gap-1.5 truncate">
            <span className="truncate">{seleccionada?.nombre ?? "Elegir tipificación…"}</span>
            {seleccionada?.sugerida && (
              <Badge variant="info" className="shrink-0 gap-1">
                <Sparkles className="size-2.5" />
                Sugerida
              </Badge>
            )}
          </span>
          <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar tipificación…" />
          <CommandList>
            <CommandEmpty>Sin resultados.</CommandEmpty>
            <CommandGroup>
              {tipificaciones.map((t) => (
                <CommandItem
                  key={t.id}
                  value={t.nombre}
                  onSelect={() => {
                    onChange(t.id);
                    setOpen(false);
                  }}
                >
                  <Check className={cn(value === t.id ? "opacity-100" : "opacity-0")} />
                  <span className="flex-1">{t.nombre}</span>
                  {t.sugerida && (
                    <Badge variant="info" className="shrink-0 gap-1">
                      <Sparkles className="size-2.5" />
                      Sugerida
                    </Badge>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
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
        <Seccion label="Cliente" icon={User} abierta={abiertas.has("cliente")} onToggle={() => toggle("cliente")}>
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

        <Seccion label="Historial" icon={History} abierta={abiertas.has("historial")} onToggle={() => toggle("historial")}>
          <div className="flex flex-col gap-1.5">
            {historial.map((h) => (
              <HistorialItem key={h.id} entrada={h} />
            ))}
          </div>
        </Seccion>

        <Seccion label="Copiloto" icon={Sparkles} abierta={abiertas.has("copiloto")} onToggle={() => toggle("copiloto")}>
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

        <Seccion label="Notas" icon={NotebookPen} abierta={abiertas.has("notas")} onToggle={() => toggle("notas")}>
          <Textarea placeholder="Notas libres sobre esta interacción…" rows={3} className="resize-none text-xs" />
        </Seccion>

        <Seccion
          label="Tipificación"
          icon={Tag}
          abierta={abiertas.has("tipificacion")}
          onToggle={() => toggle("tipificacion")}
        >
          <div className="flex flex-col gap-2">
            <TipificacionSelector
              tipificaciones={tipificaciones}
              value={tipSeleccionada}
              onChange={setTipSeleccionada}
            />
            <OpenQuestion>cómo se guarda una tipificación sugerida por el copiloto vs. una cargada a mano.</OpenQuestion>
          </div>
        </Seccion>
      </div>
    </div>
  );
}
