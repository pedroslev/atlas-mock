"use client";

import { useId, useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ActionTooltip } from "@/components/layout/action-tooltip";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";
import {
  diasSemana,
  type BandaHoraria,
  type BusinessHours,
  type DiaSemana,
} from "@/lib/mock-data";

// Editor de horarios de atención: uno o varios rangos inicio/fin por día,
// independientes entre sí (ej. lunes con pausa de almuerzo 09-13 + 14-18,
// martes corrido 08-20, miércoles cerrado). Estado local solo — sin
// persistencia real (ver PRODUCT.md); el mock simplemente necesita sentirse
// como una UI de scheduling legítima, no un gesto simbólico.
function bandaVacia(): BandaHoraria {
  return { inicio: "09:00", fin: "18:00" };
}

function sumarHoras(hora: string, horas: number) {
  const [h, m] = hora.split(":").map(Number);
  const total = Math.min(h + horas, 23);
  return `${String(total).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function BusinessHoursEditor({
  initialValue,
}: {
  initialValue?: BusinessHours;
}) {
  const [horas, setHoras] = useState<Record<DiaSemana, BandaHoraria[]>>(
    () => {
      const inicial = {} as Record<DiaSemana, BandaHoraria[]>;
      for (const { key } of diasSemana) {
        inicial[key] = initialValue?.[key] ? [...initialValue[key]!] : [];
      }
      return inicial;
    }
  );

  function setBandasDia(dia: DiaSemana, bandas: BandaHoraria[]) {
    setHoras((prev) => ({ ...prev, [dia]: bandas }));
  }

  function toggleDia(dia: DiaSemana, activo: boolean) {
    if (!activo) {
      setBandasDia(dia, []);
      return;
    }
    // Al habilitar un día, copia las bandas del día habilitado más cercano
    // hacia atrás (si la operación abre 09:30, el martes arranca 09:30 sin
    // volver a tipearlo — feedback 2026-07-16). Si no hay ninguno anterior,
    // copia de cualquier día habilitado; recién si no hay nada usa el default.
    const orden = diasSemana.map((d) => d.key);
    const indice = orden.indexOf(dia);
    const anteriores = orden.slice(0, indice).reverse();
    const referencia =
      anteriores.find((d) => horas[d].length > 0) ??
      orden.find((d) => horas[d].length > 0);
    setBandasDia(
      dia,
      referencia ? horas[referencia].map((b) => ({ ...b })) : [bandaVacia()]
    );
  }

  function agregarBanda(dia: DiaSemana) {
    // La banda nueva arranca donde terminó la última (pausa de almuerzo:
    // 09:00–13:00 → la siguiente sugiere 13:00 en adelante).
    const ultima = horas[dia][horas[dia].length - 1];
    const nueva: BandaHoraria = ultima
      ? { inicio: ultima.fin, fin: sumarHoras(ultima.fin, 4) }
      : bandaVacia();
    setBandasDia(dia, [...horas[dia], nueva]);
  }

  function quitarBanda(dia: DiaSemana, index: number) {
    setBandasDia(
      dia,
      horas[dia].filter((_, i) => i !== index)
    );
  }

  function actualizarBanda(
    dia: DiaSemana,
    index: number,
    campo: "inicio" | "fin",
    valor: string
  ) {
    setBandasDia(
      dia,
      horas[dia].map((banda, i) =>
        i === index ? { ...banda, [campo]: valor } : banda
      )
    );
  }

  return (
    <div className="flex flex-col gap-1">
      {/* El `label` de `diasSemana` (mock-data) viene fijo en español: la UI
          traduce por `key` contra el diccionario. */}
      {diasSemana.map(({ key }) => {
        const bandas = horas[key];
        const activo = bandas.length > 0;
        return (
          <DiaRow
            key={key}
            diaKey={key}
            activo={activo}
            bandas={bandas}
            onToggle={(checked) => toggleDia(key, checked)}
            onAgregarBanda={() => agregarBanda(key)}
            onQuitarBanda={(index) => quitarBanda(key, index)}
            onActualizarBanda={(index, campo, valor) =>
              actualizarBanda(key, index, campo, valor)
            }
          />
        );
      })}
    </div>
  );
}

function DiaRow({
  diaKey,
  activo,
  bandas,
  onToggle,
  onAgregarBanda,
  onQuitarBanda,
  onActualizarBanda,
}: {
  diaKey: DiaSemana;
  activo: boolean;
  bandas: BandaHoraria[];
  onToggle: (checked: boolean) => void;
  onAgregarBanda: () => void;
  onQuitarBanda: (index: number) => void;
  onActualizarBanda: (
    index: number,
    campo: "inicio" | "fin",
    valor: string
  ) => void;
}) {
  const switchId = useId();
  const t = useT();
  const label = t(`proyectos.dias.${diaKey}`);

  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-lg border px-3 py-2.5",
        !activo && "bg-muted/30"
      )}
    >
      <div className="flex items-center gap-3">
        <Switch
          id={switchId}
          checked={activo}
          onCheckedChange={onToggle}
          size="sm"
          aria-label={t("proyectos.horarios.atencionDia", { dia: label })}
        />
        <label
          htmlFor={switchId}
          className={cn(
            "w-24 shrink-0 text-sm font-medium",
            !activo && "text-muted-foreground"
          )}
        >
          {label}
        </label>

        {activo ? (
          <div className="flex flex-1 flex-col gap-2">
            {bandas.map((banda, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="time"
                  value={banda.inicio}
                  onChange={(e) =>
                    onActualizarBanda(index, "inicio", e.target.value)
                  }
                  aria-label={t("proyectos.horarios.horaInicio", {
                    n: index + 1,
                    dia: label,
                  })}
                  className="h-8 rounded-lg border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                />
                <span className="text-muted-foreground">–</span>
                <input
                  type="time"
                  value={banda.fin}
                  onChange={(e) =>
                    onActualizarBanda(index, "fin", e.target.value)
                  }
                  aria-label={t("proyectos.horarios.horaFin", {
                    n: index + 1,
                    dia: label,
                  })}
                  className="h-8 rounded-lg border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                />

                <ActionTooltip label={t("proyectos.horarios.quitarBanda")}>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8 text-muted-foreground hover:text-destructive"
                    onClick={() => onQuitarBanda(index)}
                    disabled={bandas.length === 1}
                  >
                    <X />
                  </Button>
                </ActionTooltip>

                {index === bandas.length - 1 && (
                  <ActionTooltip
                    label={t("proyectos.horarios.agregarBanda")}
                  >
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="size-8"
                      onClick={onAgregarBanda}
                    >
                      <Plus />
                    </Button>
                  </ActionTooltip>
                )}
              </div>
            ))}
          </div>
        ) : (
          <span className="flex-1 text-sm text-muted-foreground">
            {t("proyectos.horarios.cerrado")}
          </span>
        )}
      </div>
    </div>
  );
}
