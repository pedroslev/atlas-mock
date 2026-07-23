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
import { estadosAuxiliares } from "@/lib/mock-data";

// Selector de estados auxiliares habilitados para un grupo: search-first,
// pensado para catálogos grandes (un tenant puede tener cientos de auxiliares
// — feedback 2026-07-16: nada de listas planas de checkboxes). La selección
// se resume en chips removibles debajo.
export function AuxMultiSelect({ initialIds }: { initialIds: string[] }) {
  const [ids, setIds] = useState<string[]>(initialIds);
  const [open, setOpen] = useState(false);
  const t = useT();

  const seleccionados = estadosAuxiliares.filter((e) => ids.includes(e.id));

  function toggle(id: string) {
    setIds((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between font-normal"
          >
            <span
              className={cn(
                seleccionados.length === 0 && "text-muted-foreground"
              )}
            >
              {seleccionados.length > 0
                ? t("grupos.aux.seleccionados", { n: seleccionados.length })
                : t("grupos.aux.placeholder")}
            </span>
            <ChevronsUpDown className="shrink-0 text-muted-foreground" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-(--radix-popover-trigger-width) p-0"
          align="start"
        >
          <Command>
            <CommandInput placeholder={t("grupos.aux.buscar")} />
            <CommandList>
              <CommandEmpty>{t("grupos.aux.vacio")}</CommandEmpty>
              <CommandGroup>
                {estadosAuxiliares.map((estado) => (
                  <CommandItem
                    key={estado.id}
                    value={estado.nombre}
                    onSelect={() => toggle(estado.id)}
                  >
                    <Check
                      className={cn(
                        ids.includes(estado.id) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: estado.color }}
                      aria-hidden
                    />
                    {estado.nombre}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {seleccionados.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {seleccionados.map((estado) => (
            <Badge key={estado.id} variant="outline" className="gap-1.5 pr-1">
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: estado.color }}
                aria-hidden
              />
              {estado.nombre}
              <button
                type="button"
                aria-label={t("grupos.aux.deshabilitarAria", {
                  nombre: estado.nombre,
                })}
                className="rounded-full p-0.5 hover:bg-foreground/10"
                onClick={() => toggle(estado.id)}
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
