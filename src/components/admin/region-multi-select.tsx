"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";
import { regions, regionBadgeVariant, regionLabel } from "@/lib/mock-admin";

// Selector de las regiones (clusters) donde opera un carrier. Mismo patrón
// search-first con chips removibles que AuxMultiSelect (grupos de trabajo),
// pero controlado: la selección vive en el formulario del carrier.
export function RegionMultiSelect({
  id,
  value,
  onChange,
}: {
  id?: string;
  value: string[];
  onChange: (regionIds: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const t = useT();

  const seleccionadas = regions.filter((region) => value.includes(region.id));

  // Agrega la región si no estaba elegida, o la quita si ya estaba.
  function toggle(regionId: string) {
    onChange(
      value.includes(regionId)
        ? value.filter((v) => v !== regionId)
        : [...value, regionId],
    );
  }

  return (
    <div className="flex flex-col gap-2">
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
            <span
              className={cn(
                seleccionadas.length === 0 && "text-muted-foreground",
              )}
            >
              {seleccionadas.length > 0
                ? t("admin.telefonia.regiones.seleccionadas", {
                    n: seleccionadas.length,
                  })
                : t("admin.telefonia.regiones.placeholder")}
            </span>
            <ChevronsUpDown className="shrink-0 text-muted-foreground" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-(--radix-popover-trigger-width) p-0"
          align="start"
        >
          <Command>
            <CommandInput placeholder={t("admin.telefonia.regiones.buscar")} />
            <CommandList>
              <CommandEmpty>{t("admin.telefonia.regiones.vacio")}</CommandEmpty>
              <CommandGroup>
                {regions.map((region) => (
                  <CommandItem
                    key={region.id}
                    value={`${region.code} ${regionLabel(region, t)}`}
                    onSelect={() => toggle(region.id)}
                  >
                    <Check
                      className={cn(
                        value.includes(region.id) ? "opacity-100" : "opacity-0",
                      )}
                    />
                    <Badge variant={regionBadgeVariant(region.code)}>
                      {region.code}
                    </Badge>
                    {regionLabel(region, t)}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {seleccionadas.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {seleccionadas.map((region) => (
            <Badge
              key={region.id}
              variant={regionBadgeVariant(region.code)}
              className="gap-1 pr-1"
            >
              {region.code}
              <button
                type="button"
                aria-label={t("admin.telefonia.regiones.quitarAria", {
                  nombre: region.code,
                })}
                className="rounded-full p-0.5 hover:bg-foreground/10"
                onClick={() => toggle(region.id)}
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
