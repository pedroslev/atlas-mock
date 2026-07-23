"use client";

import { useState } from "react";
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
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { clasificaciones, type Clasificacion } from "@/lib/mock-data";
import { tipoClave } from "../clasificacion-dialog";

// Un tono distinto por tipo (feedback 2026-07-16: "distintos colores si son
// diferentes"), consistente con el pool de /clasificaciones.
const tipoVariant: Record<
  string,
  "success" | "destructive" | "warning" | "neutral"
> = {
  Exitoso: "success",
  "No exitoso": "destructive",
  "No efectivo": "warning",
  Neutro: "neutral",
};

// Membresía del grupo: agrega clasificaciones EXISTENTES del pool (searchable,
// nunca duplica la entidad) y las quita del grupo sin borrarlas del pool —
// una clasificación como "Venta exitosa" es cross a muchos grupos (DER:
// classifications_groups.classifications guarda solo uuids). Las altas o
// ediciones de una clasificación se hacen desde /clasificaciones (el pool).
export function GrupoMiembros({ initialIds }: { initialIds: string[] }) {
  const t = useT();
  const [ids, setIds] = useState<string[]>(initialIds);
  const [open, setOpen] = useState(false);

  const miembros = clasificaciones.filter((c) => ids.includes(c.id));
  const disponibles = clasificaciones.filter((c) => !ids.includes(c.id));
  const raices = miembros.filter((c) => !c.parentId);
  const hijosDe = (padreId: string) =>
    miembros.filter((c) => c.parentId === padreId);

  function fila(c: Clasificacion, hija: boolean) {
    return (
      <div
        key={c.id}
        className={cn(
          "flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm ring-1 ring-foreground/10",
          hija && "ml-6"
        )}
      >
        <span className="flex min-w-0 items-center gap-2">
          {hija && <span className="text-muted-foreground">↳</span>}
          <span className="truncate font-medium">{c.nombre}</span>
          <Badge variant={tipoVariant[c.tipo]}>
            {t(`clasificaciones.tipo.${tipoClave(c.tipo)}`)}
          </Badge>
        </span>
        <ActionTooltip label={t("clasificaciones.miembros.quitar")}>
          <button
            type="button"
            aria-label={t("clasificaciones.miembros.quitarAria", {
              nombre: c.nombre,
            })}
            onClick={() => setIds((prev) => prev.filter((id) => id !== c.id))}
            className="flex size-7 shrink-0 items-center justify-center rounded-lg text-destructive hover:bg-destructive/10"
          >
            <X className="size-3.5" />
          </button>
        </ActionTooltip>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle>{t("clasificaciones.miembros.titulo")}</CardTitle>
          <CardDescription>
            {t("clasificaciones.miembros.descripcion")}
          </CardDescription>
        </div>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline">
              <Plus />
              {t("clasificaciones.miembros.agregar")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <Command>
              <CommandInput
                placeholder={t("clasificaciones.campo.buscar")}
              />
              <CommandList>
                <CommandEmpty>
                  {t("clasificaciones.miembros.sinDisponibles")}
                </CommandEmpty>
                <CommandGroup>
                  {disponibles.map((c) => (
                    <CommandItem
                      key={c.id}
                      value={c.nombre}
                      onSelect={() => {
                        setIds((prev) => [...prev, c.id]);
                        setOpen(false);
                      }}
                    >
                      <Check className="opacity-0" />
                      {c.nombre}
                      <Badge
                        variant={tipoVariant[c.tipo]}
                        className="ml-auto"
                      >
                        {t(`clasificaciones.tipo.${tipoClave(c.tipo)}`)}
                      </Badge>
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
            {t("clasificaciones.miembros.vacio")}
          </p>
        )}
        {raices.map((raiz) => (
          <div key={raiz.id} className="flex flex-col gap-1.5">
            {fila(raiz, false)}
            {hijosDe(raiz.id).map((hijo) => fila(hijo, true))}
          </div>
        ))}
        {/* Hijas cuyo padre no está en el grupo se muestran al nivel raíz. */}
        {miembros
          .filter((c) => c.parentId && !ids.includes(c.parentId))
          .map((c) => fila(c, false))}
      </CardContent>
    </Card>
  );
}
