"use client";

import { useState } from "react";
import { Plus, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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
import { ActionTooltip } from "@/components/layout/action-tooltip";
import { marcadores } from "@/lib/mock-data";
import { useT } from "@/lib/i18n";

// Membresía del grupo de bookmarks: agrega marcas EXISTENTES del pool
// (searchable, nunca duplica) y los quita del grupo sin borrarlos del pool.
export function GrupoMarcadores({ initialIds }: { initialIds: string[] }) {
  const t = useT();
  const [ids, setIds] = useState<string[]>(initialIds);
  const [open, setOpen] = useState(false);

  const miembros = marcadores.filter((m) => ids.includes(m.id));
  const disponibles = marcadores.filter((m) => !ids.includes(m.id));

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle>{t("marcas.miembros.titulo")}</CardTitle>
          <CardDescription>{t("marcas.miembros.descripcion")}</CardDescription>
        </div>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline">
              <Plus />
              {t("marcas.miembros.agregar")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <Command>
              <CommandInput placeholder={t("marcas.miembros.buscar")} />
              <CommandList>
                <CommandEmpty>
                  {t("marcas.miembros.sinDisponibles")}
                </CommandEmpty>
                <CommandGroup>
                  {disponibles.map((m) => (
                    <CommandItem
                      key={m.id}
                      value={m.nombre}
                      onSelect={() => {
                        setIds((prev) => [...prev, m.id]);
                        setOpen(false);
                      }}
                    >
                      <Check className="opacity-0" />
                      {m.nombre}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </CardHeader>
      <CardContent className="flex flex-col gap-1.5">
        {miembros.length === 0 && (
          <p className="text-sm text-muted-foreground">
            {t("marcas.miembros.vacio")}
          </p>
        )}
        {miembros.map((m) => (
          <div
            key={m.id}
            className="flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm ring-1 ring-foreground/10"
          >
            <span className="flex min-w-0 flex-col">
              <span className="truncate font-medium">{m.nombre}</span>
              {m.descripcion && (
                <span className="truncate text-xs text-muted-foreground">
                  {m.descripcion}
                </span>
              )}
            </span>
            <ActionTooltip label={t("marcas.miembros.quitar")}>
              <button
                type="button"
                aria-label={t("marcas.miembros.quitarAria", {
                  nombre: m.nombre,
                })}
                onClick={() =>
                  setIds((prev) => prev.filter((id) => id !== m.id))
                }
                className="flex size-7 shrink-0 items-center justify-center rounded-lg text-destructive hover:bg-destructive/10"
              >
                <X className="size-3.5" />
              </button>
            </ActionTooltip>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
