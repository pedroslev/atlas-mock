"use client";

import { useMemo, useState } from "react";
import { ClipboardCheck, Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  getCampania,
  getClasificacionesDeGrupo,
  type Clasificacion,
} from "@/lib/mock-data";
import {
  campaniasTipificacionObligatoria,
  formatDuration,
  type ActiveInteraction,
} from "@/lib/mock-pad";
import { usePad } from "@/components/pad/pad-state";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { BadgeTone } from "@/lib/mock-pad";

const TIPO_TONE: Record<Clasificacion["tipo"], BadgeTone> = {
  Exitoso: "success",
  "No exitoso": "destructive",
  "No efectivo": "warning",
  Neutro: "neutral",
};

// Un ítem seleccionable de clasificación, con el nombre de su rama (si la tiene)
// para dar contexto en el buscador.
type ClasOption = { clas: Clasificacion; grupo?: string };

// Resultado de la gestión (ex "ACW"). Ya NO es un modal que aparece al colgar:
// es un panel SIEMPRE disponible mientras hay una llamada, para que el asesor
// vaya cargando la clasificación mientras habla (feedback: "es poco ágil tener
// que cortar y que todo el aplicativo se trabe con un modal"). Lo único que
// depende de que la llamada haya terminado es el botón "Finalizar gestión".
export function GestionPanel({
  interaction,
}: {
  interaction: ActiveInteraction;
}) {
  const { clasificacionId, setClasificacion, finishAcw, acwDurationSec } =
    usePad();
  const t = useT();
  const campania = getCampania(interaction.campaniaId);
  const grupoClasificacionId = campania?.grupoClasificacionId;

  const obligatoria = campaniasTipificacionObligatoria.has(
    interaction.campaniaId
  );
  // La llamada ya se cortó → recién ahí se puede cerrar la gestión.
  const llamadaTerminada = interaction.phase === "acw";

  const [open, setOpen] = useState(false);

  // Solo las hojas son seleccionables (y las raíces sin hijos). Se aplanan a
  // opciones para el combobox — esto escala a cientos de clasificaciones donde
  // una grilla de botones no sirve.
  const { options, byId, grupos } = useMemo(() => {
    const clasificaciones = grupoClasificacionId
      ? getClasificacionesDeGrupo(grupoClasificacionId)
      : [];
    const raices = clasificaciones.filter((c) => !c.parentId);
    const opts: ClasOption[] = [];
    for (const raiz of raices) {
      const hijos = clasificaciones.filter((c) => c.parentId === raiz.id);
      if (hijos.length === 0) {
        opts.push({ clas: raiz });
      } else {
        for (const h of hijos) opts.push({ clas: h, grupo: raiz.nombre });
      }
    }
    const map = new Map(opts.map((o) => [o.clas.id, o]));
    // Agrupa por rama para renderizar CommandGroup con encabezados.
    const grouped = new Map<string, ClasOption[]>();
    for (const o of opts) {
      const key = o.grupo ?? "";
      const arr = grouped.get(key) ?? [];
      arr.push(o);
      grouped.set(key, arr);
    }
    return { options: opts, byId: map, grupos: grouped };
  }, [grupoClasificacionId]);

  const selectedOption = clasificacionId ? byId.get(clasificacionId) : undefined;
  const hayClasificaciones = options.length > 0;
  const faltaClasificacion = obligatoria && clasificacionId === undefined;
  const puedeFinalizar = llamadaTerminada && !faltaClasificacion;

  return (
    <Card size="sm" className="shrink-0">
      <CardHeader>
        <CardTitle as="h3" className="flex items-center gap-2 text-sm">
          <ClipboardCheck className="size-4 text-muted-foreground" />
          {t("pad.gestion.titulo")}
          <Badge
            variant={obligatoria ? "warning" : "neutral"}
            className="ml-auto"
          >
            {obligatoria
              ? t("common.comunes.obligatorio")
              : t("common.comunes.opcional")}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        {!hayClasificaciones ? (
          <p className="text-sm text-muted-foreground">
            {t("pad.gestion.sinClasificaciones")}
          </p>
        ) : (
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                aria-label={t("pad.gestion.clasificacionAria")}
                className="w-full justify-between font-normal"
              >
                {selectedOption ? (
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="truncate">
                      {selectedOption.clas.nombre}
                    </span>
                    <Badge variant={TIPO_TONE[selectedOption.clas.tipo]}>
                      {selectedOption.clas.tipo}
                    </Badge>
                  </span>
                ) : (
                  <span className="text-muted-foreground">
                    {t("pad.gestion.elegirClasificacion")}
                  </span>
                )}
                <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              className="w-(--radix-popover-trigger-width) p-0"
            >
              <Command>
                <CommandInput
                  placeholder={t("pad.gestion.buscarClasificacion")}
                />
                <CommandList>
                  <CommandEmpty>
                    {t("pad.gestion.sinResultadosClasificacion")}
                  </CommandEmpty>
                  {[...grupos.entries()].map(([grupo, opts]) => (
                    <CommandGroup
                      key={grupo || "sin-grupo"}
                      heading={grupo || undefined}
                    >
                      {opts.map(({ clas }) => {
                        const active = clasificacionId === clas.id;
                        return (
                          <CommandItem
                            key={clas.id}
                            value={`${clas.nombre} ${clas.tipo}`}
                            onSelect={() => {
                              // Volver a elegir la misma la deselecciona: el
                              // asesor puede corregirse mientras habla.
                              setClasificacion(active ? undefined : clas.id);
                              setOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                active ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <span className="flex-1">{clas.nombre}</span>
                            <Badge variant={TIPO_TONE[clas.tipo]}>
                              {clas.tipo}
                            </Badge>
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  ))}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        )}

        <div className="flex flex-col gap-1.5">
          <Button onClick={finishAcw} disabled={!puedeFinalizar}>
            <Check />
            {t("pad.gestion.finalizar")}
          </Button>
          <p className="text-xs text-muted-foreground">
            {!llamadaTerminada
              ? t("pad.gestion.ayudaEnCurso")
              : faltaClasificacion
                ? t("pad.gestion.ayudaFaltaClasificacion")
                : t("pad.gestion.ayudaFinalizada", {
                    duracion: formatDuration(acwDurationSec),
                  })}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
