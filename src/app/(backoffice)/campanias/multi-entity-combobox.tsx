"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, X, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export type MultiComboboxEntity = {
  id: string;
  nombre: string;
  /** Ícono opcional por ítem (ej. canal de una cuenta: llamada, wsp, sms). */
  icon?: LucideIcon;
};

// Variante multi-selección del EntityCombobox de esta misma carpeta — misma
// base Popover+Command, pero acumula ids en vez de reemplazar. Usado para
// relaciones N:N chicas (ej. cuentas salientes de una campaña).
export function MultiEntityCombobox({
  id,
  items,
  value,
  onChange,
  placeholder,
  searchPlaceholder,
  emptyLabel,
  className,
}: {
  id?: string;
  items: MultiComboboxEntity[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyLabel?: string;
  className?: string;
}) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const seleccionados = items.filter((item) => value.includes(item.id));
  // Ver EntityCombobox: los defaults dependen del idioma activo.
  const placeholderCopy = placeholder ?? t("campanias.comboMultiPlaceholder");
  const buscarCopy = searchPlaceholder ?? t("campanias.comboBuscar");
  const vacioCopy = emptyLabel ?? t("campanias.comboVacio");

  function toggle(itemId: string) {
    onChange(
      value.includes(itemId)
        ? value.filter((v) => v !== itemId)
        : [...value, itemId]
    );
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
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
              className={cn(seleccionados.length === 0 && "text-muted-foreground")}
            >
              {seleccionados.length > 0
                ? t("campanias.comboSeleccionadas", {
                    n: seleccionados.length,
                  })
                : placeholderCopy}
            </span>
            <ChevronsUpDown className="text-muted-foreground" />
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
                    onSelect={() => toggle(item.id)}
                  >
                    <Check
                      className={cn(
                        value.includes(item.id) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {item.icon && (
                      <item.icon className="size-4 text-secondary" />
                    )}
                    {item.nombre}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {seleccionados.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {seleccionados.map((item) => (
            <Badge key={item.id} variant="outline" className="gap-1 pr-1">
              {item.icon && <item.icon className="size-3 text-secondary" />}
              {item.nombre}
              <button
                type="button"
                aria-label={t("campanias.comboQuitar", { nombre: item.nombre })}
                className="rounded-full p-0.5 hover:bg-foreground/10"
                onClick={() => toggle(item.id)}
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
