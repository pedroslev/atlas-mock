"use client";

import { useMemo } from "react";
import { FileText, Paperclip, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
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
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { MensajeRenderizado } from "@/components/plantillas/mensaje-renderizado";
import {
  getPlantillasDeGrupo,
  plantillaGrupos,
  type CanalPlantilla,
  type Plantilla,
} from "@/lib/mock-data";
import { aTextoPlano, renderizarParaCanal, type DatosVariables } from "@/lib/plantillas";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

// Selector de plantillas del redactor de Hermes (ATLAS-1191). Se abre con el
// botón o escribiendo "/" en el cuadro vacío. Lista solo las plantillas
// activas del grupo de la campaña que se ofrecen en este canal: primero las
// favoritas del asesor (estrella), después las más usadas, después el resto
// por grupo. Busca por nombre y por contenido; al pasar por encima muestra la
// vista previa con los datos del cliente ya resueltos.
//
// Mock: el uso se cuenta en memoria (ranking por uso, a charlar con el
// Architect) y las favoritas son del asesor, no de la campaña.

export type PlantillaElegida = {
  plantilla: Plantilla;
  /** Texto final para el canal, con variables resueltas. */
  texto: string;
  /** Variables sin dato ni respaldo: hay que completarlas a mano. */
  sinDato: string[];
};

export function usePlantillasDeCampania(grupoId: string, canal: CanalPlantilla) {
  return useMemo(
    () =>
      getPlantillasDeGrupo(grupoId).filter(
        (p) => p.activa && p.canales.includes(canal)
      ),
    [grupoId, canal]
  );
}

export function SelectorPlantillas({
  grupoId,
  canal,
  datos,
  open,
  onOpenChange,
  onElegir,
  favoritas,
  onToggleFavorita,
  usos,
}: {
  grupoId: string;
  canal: CanalPlantilla;
  datos: DatosVariables;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onElegir: (elegida: PlantillaElegida) => void;
  favoritas: string[];
  onToggleFavorita: (id: string) => void;
  usos: Record<string, number>;
}) {
  const t = useT();
  const disponibles = usePlantillasDeCampania(grupoId, canal);

  const favs = disponibles.filter((p) => favoritas.includes(p.id));
  const masUsadas = disponibles
    .filter((p) => !favoritas.includes(p.id) && (usos[p.id] ?? 0) > 0)
    .sort((a, b) => (usos[b.id] ?? 0) - (usos[a.id] ?? 0))
    .slice(0, 3);
  const resto = disponibles.filter(
    (p) => !favs.includes(p) && !masUsadas.includes(p)
  );
  const nombreGrupo = plantillaGrupos.find((g) => g.id === grupoId)?.nombre ?? "";

  function elegir(p: Plantilla) {
    const { texto, sinDato } = renderizarParaCanal(p, canal, datos);
    onElegir({ plantilla: p, texto, sinDato });
    onOpenChange(false);
  }

  function Item({ p }: { p: Plantilla }) {
    const esFav = favoritas.includes(p.id);
    const preview = renderizarParaCanal(p, canal, datos).texto;
    return (
      <HoverCard openDelay={300} closeDelay={50}>
        <HoverCardTrigger asChild>
          <CommandItem
            // Busca por nombre Y por contenido.
            value={`${p.nombre} ${aTextoPlano(p.contenido)}`}
            onSelect={() => elegir(p)}
            className="group/item"
          >
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="truncate">{p.nombre}</span>
              {p.descripcion && (
                <span className="truncate text-xs text-muted-foreground">
                  {p.descripcion}
                </span>
              )}
            </span>
            {p.adjuntos.length > 0 && (
              <span
                className="flex items-center gap-0.5 text-xs text-muted-foreground"
                title={t("plantillas.selector.conAdjuntos", { cantidad: p.adjuntos.length })}
              >
                <Paperclip className="size-3" />
                {p.adjuntos.length}
              </span>
            )}
            <button
              type="button"
              aria-label={
                esFav
                  ? t("plantillas.selector.quitarFavorita")
                  : t("plantillas.selector.marcarFavorita")
              }
              onPointerDown={(e) => e.preventDefault()}
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorita(p.id);
              }}
              className={cn(
                "flex size-6 shrink-0 items-center justify-center rounded-md hover:bg-foreground/10",
                esFav ? "text-warning" : "text-muted-foreground opacity-0 group-hover/item:opacity-100"
              )}
            >
              <Star className={cn("size-3.5", esFav && "fill-current")} />
            </button>
          </CommandItem>
        </HoverCardTrigger>
        <HoverCardContent side="right" align="start" className="w-72 p-3">
          <MensajeRenderizado texto={preview} canal={canal} />
        </HoverCardContent>
      </HoverCard>
    );
  }

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          aria-expanded={open}
          className="min-w-0 flex-1 justify-between font-normal"
        >
          <span className="flex min-w-0 items-center gap-1.5 truncate">
            <FileText className="size-3.5 shrink-0 text-muted-foreground" />
            <span className="truncate">{t("plantillas.selector.boton")}</span>
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Kbd>/</Kbd>
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        {/* Búsqueda por texto contenido (no difusa): "cierre" trae solo las
            plantillas que dicen "cierre" en el nombre o en el mensaje. */}
        <Command
          filter={(value, search) =>
            value.toLowerCase().includes(search.toLowerCase()) ? 1 : 0
          }
        >
          <CommandInput placeholder={t("plantillas.selector.buscar")} autoFocus />
          <CommandList>
            <CommandEmpty>{t("plantillas.selector.sinResultados")}</CommandEmpty>
            {favs.length > 0 && (
              <CommandGroup heading={t("plantillas.selector.favoritas")}>
                {favs.map((p) => (
                  <Item key={p.id} p={p} />
                ))}
              </CommandGroup>
            )}
            {masUsadas.length > 0 && (
              <CommandGroup heading={t("plantillas.selector.masUsadas")}>
                {masUsadas.map((p) => (
                  <Item key={p.id} p={p} />
                ))}
              </CommandGroup>
            )}
            {resto.length > 0 && (
              <CommandGroup heading={nombreGrupo}>
                {resto.map((p) => (
                  <Item key={p.id} p={p} />
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
