"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";

// Alcance de supervisión de una persona: qué campañas y qué grupos puede
// mirar. Es otra cosa que los permisos del grupo (a qué secciones del
// backoffice entra) y que las campañas donde atiende: trabajar en una campaña
// no es supervisarla.
//
// Se configura desde el usuario y no desde la campaña o el grupo porque la
// pregunta que se responde acá es "¿qué alcance tiene esta persona?" — verlo
// repartido en veinte campañas no deja contestarla.

type Opcion = { id: string; nombre: string };

export function AgenteSupervision({
  campanias,
  grupos,
  initialCampaniaIds,
  initialGrupoIds,
}: {
  campanias: Opcion[];
  grupos: Opcion[];
  initialCampaniaIds: string[];
  initialGrupoIds: string[];
}) {
  const t = useT();
  const [campaniaIds, setCampaniaIds] = useState(initialCampaniaIds);
  const [grupoIds, setGrupoIds] = useState(initialGrupoIds);

  const noSupervisa = campaniaIds.length === 0 && grupoIds.length === 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("usuarios.supervision.titulo")}</CardTitle>
        <CardDescription>
          {t("usuarios.supervision.descripcion")}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label>{t("usuarios.supervision.campanias")}</Label>
          <Selector
            opciones={campanias}
            elegidos={campaniaIds}
            onChange={setCampaniaIds}
            placeholder={t("usuarios.supervision.elegirCampanias")}
            buscar={t("usuarios.supervision.buscarCampania")}
            vacio={t("usuarios.supervision.sinResultados")}
            resumen={(n) => t("usuarios.supervision.campaniasElegidas", { n })}
          />
          <p className="text-xs text-muted-foreground">
            {t("usuarios.supervision.campaniasAyuda")}
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>{t("usuarios.supervision.grupos")}</Label>
          <Selector
            opciones={grupos}
            elegidos={grupoIds}
            onChange={setGrupoIds}
            placeholder={t("usuarios.supervision.elegirGrupos")}
            buscar={t("usuarios.supervision.buscarGrupo")}
            vacio={t("usuarios.supervision.sinResultados")}
            resumen={(n) => t("usuarios.supervision.gruposElegidos", { n })}
          />
          <p className="text-xs text-muted-foreground">
            {t("usuarios.supervision.gruposAyuda")}
          </p>
        </div>

        {noSupervisa && (
          <p className="rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">
            {t("usuarios.supervision.noSupervisa")}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function Selector({
  opciones,
  elegidos,
  onChange,
  placeholder,
  buscar,
  vacio,
  resumen,
}: {
  opciones: Opcion[];
  elegidos: string[];
  onChange: (ids: string[]) => void;
  placeholder: string;
  buscar: string;
  vacio: string;
  resumen: (n: number) => string;
}) {
  const [open, setOpen] = useState(false);
  const t = useT();

  const seleccionados = opciones.filter((o) => elegidos.includes(o.id));

  function toggle(id: string) {
    onChange(
      elegidos.includes(id)
        ? elegidos.filter((v) => v !== id)
        : [...elegidos, id]
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
            {/* Con uno solo se muestra su nombre: "1 grupos" queda mal y el
                diccionario no tiene plurales. */}
            <span className={cn(elegidos.length === 0 && "text-muted-foreground")}>
              {seleccionados.length === 1
                ? seleccionados[0].nombre
                : elegidos.length > 0
                  ? resumen(elegidos.length)
                  : placeholder}
            </span>
            <ChevronsUpDown className="size-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-(--radix-popover-trigger-width) p-0"
          align="start"
        >
          <Command>
            <CommandInput placeholder={buscar} />
            <CommandList>
              <CommandEmpty>{vacio}</CommandEmpty>
              <CommandGroup>
                {opciones.map((o) => (
                  <CommandItem key={o.id} value={o.nombre} onSelect={() => toggle(o.id)}>
                    <Check
                      className={cn(
                        "size-4",
                        elegidos.includes(o.id) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {o.nombre}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {seleccionados.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {seleccionados.map((o) => (
            <Badge key={o.id} variant="outline" className="gap-1 font-normal">
              {o.nombre}
              <button
                type="button"
                aria-label={t("usuarios.supervision.quitar", { nombre: o.nombre })}
                onClick={() => toggle(o.id)}
                className="text-muted-foreground hover:text-foreground"
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
