"use client";

import { ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CANAL_ICON, type FilaCola } from "@/lib/pad-mock/data";
import { OpenQuestion } from "@/components/pad-mock/open-question";

function formatEspera(seg: number) {
  const m = Math.floor(seg / 60);
  const s = seg % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// Brief §3: columna angosta (~90px), cada fila muestra SOLO número de cliente,
// ícono de canal y cronómetro de espera — nada de nombre, motivo ni preview.
// Colapsable a una tira de íconos.
export function QueueColumn({
  filas,
  colapsada,
  onToggle,
}: {
  filas: FilaCola[];
  colapsada: boolean;
  onToggle: () => void;
}) {
  if (colapsada) {
    return (
      <div className="flex w-12 shrink-0 flex-col items-center gap-2 border-r border-border bg-card py-2">
        <Button variant="ghost" size="icon-sm" aria-label="Expandir cola" onClick={onToggle}>
          <ChevronsRight className="size-4" />
        </Button>
        <div className="flex flex-col gap-1.5">
          {filas.map((f) => {
            const Icon = CANAL_ICON[f.canal];
            return (
              <span
                key={f.id}
                title={`Cliente ${f.numeroCliente} · ${formatEspera(f.esperaSeg)}`}
                className={cn(
                  "flex size-8 items-center justify-center rounded-lg",
                  f.activa
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                <Icon className="size-4" />
              </span>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-[92px] shrink-0 flex-col border-r border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-2 py-1.5">
        <span className="text-[0.65rem] font-semibold tracking-wide text-muted-foreground uppercase">
          Cola
        </span>
        <Button variant="ghost" size="icon-sm" aria-label="Colapsar cola" onClick={onToggle}>
          <ChevronsLeft className="size-3.5" />
        </Button>
      </div>

      <div className="flex flex-1 flex-col gap-1 overflow-y-auto p-1.5">
        {filas.map((f) => {
          const Icon = CANAL_ICON[f.canal];
          return (
            <button
              key={f.id}
              type="button"
              className={cn(
                "flex flex-col items-center gap-1 rounded-lg px-1 py-2 text-center transition-colors",
                f.activa
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              )}
            >
              <span className="text-xs font-semibold tabular-nums">{f.numeroCliente}</span>
              <Icon className="size-3.5" />
              <span
                className={cn(
                  "font-mono text-[0.65rem] tabular-nums",
                  f.activa ? "text-primary-foreground/80" : "text-muted-foreground"
                )}
              >
                {formatEspera(f.esperaSeg)}
              </span>
            </button>
          );
        })}
      </div>

      <div className="p-1.5">
        <OpenQuestion className="text-[0.65rem] leading-tight">
          ¿se mantienen el ícono de canal y el cronómetro acá?
        </OpenQuestion>
      </div>
    </div>
  );
}
