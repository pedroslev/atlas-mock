"use client";

import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export type ComboboxEntity = { id: string; nombre: string };

// Combobox (Popover + Command) para elegir una entidad de mock-data que
// puede llegar a ser larga (proyecto, workflow, grupo de feriados, lista de
// exclusión) — más apropiado que un Select plano para relaciones tipo FK.
// Ver DESIGN.md Do's: "usar Combobox en vez de un Select para listas largas".
export function EntityCombobox({
  id,
  items,
  defaultValue,
  value: controlledValue,
  onChange,
  placeholder,
  searchPlaceholder,
  emptyLabel,
  className,
}: {
  id?: string;
  items: ComboboxEntity[];
  defaultValue?: string;
  /** Uso controlado (opcional): si se pasa, el combobox refleja este valor y
   * notifica cambios vía onChange en vez de manejar estado propio. */
  value?: string;
  onChange?: (value: string | undefined) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyLabel?: string;
  className?: string;
}) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [internalValue, setInternalValue] = useState(defaultValue ?? "");
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;

  const seleccionado = items.find((item) => item.id === value);
  // Los textos por defecto se resuelven acá (y no en los parámetros) porque
  // dependen del idioma activo, que solo se conoce dentro del componente.
  const placeholderCopy = placeholder ?? t("campanias.comboPlaceholder");
  const buscarCopy = searchPlaceholder ?? t("campanias.comboBuscar");
  const vacioCopy = emptyLabel ?? t("campanias.comboVacio");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full min-w-0 justify-between font-normal", className)}
        >
          <span className={cn("truncate", !seleccionado && "text-muted-foreground")}>
            {seleccionado ? seleccionado.nombre : placeholderCopy}
          </span>
          <ChevronsUpDown className="shrink-0 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-(--radix-popover-trigger-width) p-0"
        align="start"
      >
        <Command>
          <CommandInput placeholder={buscarCopy} />
          <CommandList>
            <CommandEmpty>{vacioCopy}</CommandEmpty>
            <CommandGroup>
              {items.map((item) => (
                <CommandItem
                  key={item.id}
                  value={item.nombre}
                  data-checked={item.id === value}
                  onSelect={() => {
                    const next = item.id === value ? "" : item.id;
                    if (!isControlled) setInternalValue(next);
                    onChange?.(next || undefined);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      value === item.id ? "opacity-100" : "opacity-0"
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
