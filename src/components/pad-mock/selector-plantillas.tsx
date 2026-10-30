"use client";

// MOCK: lista las plantillas del grupo de la campaña de ejemplo (datos locales) y arma la vista previa
// en el navegador con los datos del cliente ya conocidos.
// REAL: Hermes obtiene las plantillas de la campaña del agente (grupo de la campaña, con herencia
// campaña←proyecto; ListAgentCampaigns) y solo las activas del canal. Los datos del cliente los
// resuelve el backend; el front solo muestra el resultado y el marcador [NOMBRE] de lo que falta.

import { useMemo } from "react";
import { FileText, Paperclip } from "lucide-react";
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
  tipoRenderDeCanal,
  type CanalPlantilla,
  type Plantilla,
} from "@/lib/mock-data";
import { aTextoPlano, renderizarParaCanal, type DatosVariables } from "@/lib/plantillas";
import { useT } from "@/lib/i18n";

// Selector de plantillas del redactor de Hermes (ATLAS-1191). Se abre con el
// botón o escribiendo "/" en el cuadro vacío. Lista solo las plantillas
// activas del grupo de la campaña que se ofrecen en este canal, bajo el nombre del
// grupo. Busca por nombre y por contenido; al pasar por encima muestra la
// vista previa con los datos del cliente ya resueltos.

export type PlantillaElegida = {
  plantilla: Plantilla;
  /** Texto final para el canal, con variables resueltas. */
  texto: string;
  /** Variables sin dato: quedan visibles en el texto y hay que completarlas a mano. */
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
}: {
  grupoId: string;
  canal: CanalPlantilla;
  datos: DatosVariables;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onElegir: (elegida: PlantillaElegida) => void;
}) {
  const t = useT();
  const disponibles = usePlantillasDeCampania(grupoId, canal);

  const nombreGrupo = plantillaGrupos.find((g) => g.id === grupoId)?.nombre ?? "";

  function elegir(p: Plantilla) {
    const { texto, sinDato } = renderizarParaCanal(p, canal, datos);
    onElegir({ plantilla: p, texto, sinDato });
    onOpenChange(false);
  }

  function Item({ p }: { p: Plantilla }) {
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
          </CommandItem>
        </HoverCardTrigger>
        <HoverCardContent side="right" align="start" className="w-72 p-3">
          <MensajeRenderizado texto={preview} canal={tipoRenderDeCanal(canal)} />
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
            {disponibles.length > 0 && (
              <CommandGroup heading={nombreGrupo}>
                {disponibles.map((p) => (
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
