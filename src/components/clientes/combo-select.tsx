"use client";

import { useState, type ReactNode } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  CommandSeparator,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";

export type ComboOption = {
  value: string;
  label: ReactNode;
  /** Texto por el que se busca (si `label` no es un string). */
  searchText?: string;
  /** Ya usada en otro lado: se ve en gris pero se puede elegir igual. */
  muted?: boolean;
  /** Aclaración a la derecha (ej. "Usada en: Nombre"). */
  hint?: string;
  group?: string;
};

// Desplegable con buscador (pedido de producto 2026-10-09: "en todos los
// desplegables coloca un buscador"). Las opciones ya usadas no se quitan:
// se muestran en gris con una aclaración.
export function ComboSelect({
  value,
  onChange,
  options,
  placeholder,
  id,
  ariaLabel,
  size = "default",
  disabled,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  options: ComboOption[];
  placeholder?: string;
  id?: string;
  ariaLabel?: string;
  size?: "default" | "sm";
  disabled?: boolean;
  className?: string;
}) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const actual = options.find((o) => o.value === value);
  const grupos = Array.from(new Set(options.map((o) => o.group ?? "")));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label={ariaLabel}
          disabled={disabled}
          className={cn(
            "w-full justify-between font-normal",
            size === "sm" && "h-8",
            className
          )}
        >
          <span className={cn("truncate", !actual && "text-muted-foreground")}>
            {actual?.label ?? placeholder ?? t("clientes.combo.seleccionar")}
          </span>
          <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="min-w-56 p-0"
        style={{ width: "var(--radix-popover-trigger-width)" }}
        align="start"
      >
        <Command>
          <CommandInput placeholder={t("clientes.combo.buscar")} />
          <CommandList>
            <CommandEmpty>{t("clientes.combo.sinResultados")}</CommandEmpty>
            {grupos.map((g, gi) => (
              <div key={g || gi}>
                {gi > 0 && <CommandSeparator />}
                <CommandGroup heading={g || undefined}>
                  {options
                    .filter((o) => (o.group ?? "") === g)
                    .map((o) => (
                      <CommandItem
                        key={o.value}
                        value={`${o.searchText ?? (typeof o.label === "string" ? o.label : "")} ${o.value}`}
                        onSelect={() => {
                          onChange(o.value);
                          setOpen(false);
                        }}
                        className={cn(o.muted && "text-muted-foreground")}
                      >
                        <Check className={cn("size-4", o.value === value ? "opacity-100" : "opacity-0")} />
                        <span className="min-w-0 flex-1 truncate">{o.label}</span>
                        {o.hint && <span className="shrink-0 text-xs text-muted-foreground">{o.hint}</span>}
                      </CommandItem>
                    ))}
                </CommandGroup>
              </div>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
