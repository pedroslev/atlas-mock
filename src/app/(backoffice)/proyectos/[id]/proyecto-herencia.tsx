"use client";

import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";
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
import type { ClasificacionGrupo, Feriado } from "@/lib/mock-data";

// Combobox chico y genérico para elegir una entidad de una lista de mock-data
// que puede llegar a ser larga (grupos de clasificación, grupos de feriados).
// Patrón documentado de shadcn: Popover + Command, ver DESIGN.md "Do: usar
// Combobox (Popover+Command) para selects largos" en vez de un Select plano.
function EntityCombobox({
  id,
  placeholder,
  emptyLabel,
  searchLabel,
  items,
  value,
  onChange,
}: {
  id: string;
  placeholder: string;
  emptyLabel: string;
  searchLabel: string;
  items: { id: string; nombre: string }[];
  value: string | undefined;
  onChange: (value: string | undefined) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = items.find((item) => item.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          <span className={cn(!selected && "text-muted-foreground")}>
            {selected ? selected.nombre : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-(--radix-popover-trigger-width) p-0"
        align="start"
      >
        <Command>
          <CommandInput placeholder={searchLabel} />
          <CommandList>
            <CommandEmpty>{emptyLabel}</CommandEmpty>
            <CommandGroup>
              {items.map((item) => (
                <CommandItem
                  key={item.id}
                  value={item.nombre}
                  onSelect={() => {
                    onChange(item.id === value ? undefined : item.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 size-4",
                      item.id === value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {item.nombre}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// Estado local solo para que el combobox se sienta interactivo en el mock —
// sin persistencia real (ver PRODUCT.md).
export function ProyectoHerencia({
  initialGrupoClasificacionId,
  initialFeriadosId,
  gruposClasificacion,
  feriados,
}: {
  initialGrupoClasificacionId?: string;
  initialFeriadosId?: string;
  gruposClasificacion: ClasificacionGrupo[];
  feriados: Feriado[];
}) {
  const [grupoClasificacion, setGrupoClasificacion] = useState(
    initialGrupoClasificacionId
  );
  const [grupoFeriados, setGrupoFeriados] = useState(initialFeriadosId);
  const t = useT();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("proyectos.herencia.titulo")}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="grupo-clasificacion">
            {t("proyectos.herencia.grupoClasificacion")}
          </Label>
          <EntityCombobox
            id="grupo-clasificacion"
            placeholder={t("proyectos.herencia.sinAsignar")}
            emptyLabel={t("proyectos.herencia.sinGrupos")}
            searchLabel={t("proyectos.herencia.buscarGrupo")}
            items={gruposClasificacion}
            value={grupoClasificacion}
            onChange={setGrupoClasificacion}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="grupo-feriados">
            {t("proyectos.herencia.grupoFeriados")}
          </Label>
          <EntityCombobox
            id="grupo-feriados"
            placeholder={t("proyectos.herencia.sinAsignar")}
            emptyLabel={t("proyectos.herencia.sinGruposFeriados")}
            searchLabel={t("proyectos.herencia.buscarGrupoFeriados")}
            items={feriados}
            value={grupoFeriados}
            onChange={setGrupoFeriados}
          />
        </div>
      </CardContent>
    </Card>
  );
}
