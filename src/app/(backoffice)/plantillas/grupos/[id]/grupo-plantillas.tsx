"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { CanalBadges } from "@/components/plantillas/mensaje-renderizado";
import { plantillas } from "@/lib/mock-data";
import { useT } from "@/lib/i18n";

// Membresía del grupo: agrega plantillas EXISTENTES del catálogo (buscador,
// nunca duplica) y las quita del grupo sin borrarlas del catálogo. Mismo
// patrón que los grupos de marcas.
export function GrupoPlantillas({ initialIds }: { initialIds: string[] }) {
  const t = useT();
  const [ids, setIds] = useState<string[]>(initialIds);
  const [open, setOpen] = useState(false);

  const miembros = plantillas.filter((p) => ids.includes(p.id));
  const disponibles = plantillas.filter((p) => !ids.includes(p.id));

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle>{t("plantillas.miembros.titulo")}</CardTitle>
          <CardDescription>{t("plantillas.miembros.descripcion")}</CardDescription>
        </div>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline">
              <Plus />
              {t("plantillas.miembros.agregar")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <Command>
              <CommandInput placeholder={t("plantillas.miembros.buscar")} />
              <CommandList>
                <CommandEmpty>{t("plantillas.miembros.sinDisponibles")}</CommandEmpty>
                <CommandGroup>
                  {disponibles.map((p) => (
                    <CommandItem
                      key={p.id}
                      value={p.nombre}
                      onSelect={() => {
                        setIds((prev) => [...prev, p.id]);
                        setOpen(false);
                      }}
                    >
                      <Check className="opacity-0" />
                      {p.nombre}
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
            {t("plantillas.miembros.vacio")}
          </p>
        )}
        {miembros.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm ring-1 ring-foreground/10"
          >
            <span className="flex min-w-0 flex-col gap-1">
              <span className="flex items-center gap-2">
                <Link
                  href={`/plantillas/catalogo/${p.id}`}
                  className="truncate font-medium hover:underline"
                >
                  {p.nombre}
                </Link>
                {!p.activa && (
                  <Badge variant="secondary">{t("common.comunes.inactivo")}</Badge>
                )}
              </span>
              {p.descripcion && (
                <span className="truncate text-xs text-muted-foreground">
                  {p.descripcion}
                </span>
              )}
              <CanalBadges canales={p.canales} />
            </span>
            <ActionTooltip label={t("plantillas.miembros.quitar")}>
              <button
                type="button"
                aria-label={t("plantillas.miembros.quitarAria", { nombre: p.nombre })}
                onClick={() => setIds((prev) => prev.filter((id) => id !== p.id))}
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
