"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { BusinessHoursEditor } from "../proyectos/business-hours-editor";
import { useT } from "@/lib/i18n";
import { diasSemana, type BusinessHours } from "@/lib/mock-data";

// Horarios de atención de una campaña. Por defecto la campaña HEREDA los
// horarios del proyecto; al activar "Personalizar" puede redefinirlos y el
// editor arranca precargado con las bandas heredadas para poder tocarlas
// (feedback 2026-07-16: "no me deja cambiar los horarios laborales heredados").
// El campaigns.business_hours undefined = hereda; definido = override.
export function CampaniaHorarios({
  nombreProyecto,
  projectHours,
  initialValue,
}: {
  nombreProyecto?: string;
  /** Horarios del proyecto — lo que se hereda si no se personaliza. */
  projectHours?: BusinessHours;
  /** Override propio de la campaña, si ya lo tenía definido. */
  initialValue?: BusinessHours;
}) {
  const t = useT();
  const [personalizar, setPersonalizar] = useState(initialValue !== undefined);
  // Al personalizar se parte del override propio o, si no hay, de lo heredado.
  const seed = initialValue ?? projectHours;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          {personalizar
            ? t("campanias.horariosPersonalizados")
            : nombreProyecto
              ? t("campanias.horariosHeredadosDe", {
                  proyecto: nombreProyecto,
                })
              : t("campanias.horariosHeredadosProyecto")}
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <Switch
            id="personalizar-horarios"
            checked={personalizar}
            onCheckedChange={setPersonalizar}
            size="sm"
          />
          <Label htmlFor="personalizar-horarios" className="text-sm font-normal">
            {t("campanias.personalizar")}
          </Label>
        </div>
      </div>

      {personalizar ? (
        <BusinessHoursEditor initialValue={seed} />
      ) : (
        <HerenciaResumen hours={projectHours} />
      )}
    </div>
  );
}

// Resumen de solo lectura de los horarios heredados del proyecto.
function HerenciaResumen({ hours }: { hours?: BusinessHours }) {
  const t = useT();
  const tieneBandas =
    hours && diasSemana.some(({ key }) => (hours[key]?.length ?? 0) > 0);
  if (!tieneBandas) {
    return (
      <div className="rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">
        {t("campanias.horariosSinBandas")}
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-1 rounded-lg border bg-muted/30 p-3">
      {diasSemana.map(({ key, label }) => {
        const bandas = hours?.[key] ?? [];
        return (
          <div key={key} className="flex items-baseline gap-3 text-sm">
            <span className="w-24 shrink-0 font-medium text-muted-foreground">
              {label}
            </span>
            {bandas.length > 0 ? (
              <span className="flex flex-wrap gap-x-2 gap-y-0.5">
                {bandas.map((b, i) => (
                  <span key={i}>
                    {b.inicio}&ndash;{b.fin}
                  </span>
                ))}
              </span>
            ) : (
              <span className="text-muted-foreground">
                {t("campanias.cerrado")}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
