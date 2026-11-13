"use client";

import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { NUEVO_RING, NuevoBadge } from "@/components/propuesta/nuevo";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { plantillaGrupos, plantillas, type CanalPlantilla, type Plantilla } from "@/lib/mock-data";

// Secciones del selector: una por grupo de plantillas y, al final, las que no
// están en ningún grupo. Una plantilla que está en varios grupos aparece en
// cada uno. Solo las activas y del canal pedido.
function seccionesPorGrupo(canal: CanalPlantilla) {
  const delCanal = (p: Plantilla) => p.activa && p.canales.includes(canal);
  const enAlgunGrupo = new Set(plantillaGrupos.flatMap((g) => g.plantillaIds));
  const secciones = plantillaGrupos
    .map((g) => ({
      id: g.id,
      nombre: g.nombre,
      items: plantillas.filter((p) => g.plantillaIds.includes(p.id) && delCanal(p)),
    }))
    .filter((s) => s.items.length > 0);
  const sueltas = plantillas.filter((p) => !enAlgunGrupo.has(p.id) && delCanal(p));
  return { secciones, sueltas };
}

function SelectorPlantilla({
  id,
  canal,
  value,
  onChange,
}: {
  id: string;
  canal: CanalPlantilla;
  value?: string;
  onChange: (id: string | undefined) => void;
}) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const { secciones, sueltas } = seccionesPorGrupo(canal);
  const elegida = plantillas.find((p) => p.id === value);

  function item(p: Plantilla, clave: string) {
    return (
      <CommandItem
        key={clave}
        value={`${clave} ${p.nombre}`}
        onSelect={() => {
          onChange(p.id);
          setOpen(false);
        }}
      >
        <Check className={cn("size-4", value === p.id ? "opacity-100" : "opacity-0")} />
        {p.nombre}
      </CommandItem>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button id={id} variant="outline" role="combobox" className="w-full justify-between font-normal">
          <span className={cn("truncate", !elegida && "text-muted-foreground")}>
            {elegida?.nombre ?? t("plantillas.campania.sinDefault")}
          </span>
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
        <Command>
          <CommandInput placeholder={t("plantillas.campania.buscarDefault")} />
          <CommandList>
            <CommandEmpty>{t("campanias.plantillasDefecto.vacio")}</CommandEmpty>
            <CommandGroup>
              <CommandItem
                value="__ninguna"
                onSelect={() => {
                  onChange(undefined);
                  setOpen(false);
                }}
              >
                <Check className={cn("size-4", !value ? "opacity-100" : "opacity-0")} />
                {t("plantillas.campania.sinDefault")}
              </CommandItem>
            </CommandGroup>
            {secciones.map((s) => (
              <CommandGroup key={s.id} heading={s.nombre}>
                {s.items.map((p) => item(p, `${s.id}-${p.id}`))}
              </CommandGroup>
            ))}
            {sueltas.length > 0 && (
              <CommandGroup heading={t("campanias.plantillasDefecto.sinGrupo")}>
                {sueltas.map((p) => item(p, `suelta-${p.id}`))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// ATLAS-1227: la plantilla por defecto sale de la solapa General y se elige
// entre TODAS las plantillas del catálogo (agrupadas por grupo, y al final
// las que no tienen grupo), no solo las del grupo de la campaña. La casilla
// de envío automático reemplaza al "saludo al atender" del legacy.
export function PlantillasDefectoTab({
  initialChatId,
  initialEmailId,
}: {
  initialChatId?: string;
  initialEmailId?: string;
}) {
  const t = useT();
  const [chatId, setChatId] = useState(initialChatId);
  const [emailId, setEmailId] = useState(initialEmailId);
  const [enviarAutomatico, setEnviarAutomatico] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("plantillas.campania.defaultTitulo")}</CardTitle>
        <CardDescription>{t("campanias.plantillasDefecto.desc")}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="plantilla-chat">{t("plantillas.campania.defaultChat")}</Label>
          <SelectorPlantilla id="plantilla-chat" canal="chat" value={chatId} onChange={setChatId} />
          <label
            htmlFor="plantilla-chat-automatica"
            className={cn("mt-1 flex items-start gap-2 rounded-md p-2", NUEVO_RING, !chatId && "opacity-50")}
          >
            <Checkbox
              id="plantilla-chat-automatica"
              className="mt-0.5"
              disabled={!chatId}
              checked={!!chatId && enviarAutomatico}
              onCheckedChange={(c) => setEnviarAutomatico(c === true)}
            />
            <span className="flex flex-col gap-0.5">
              <span className="flex items-center gap-2 text-sm font-medium">
                {t("campanias.parametros.enviarAutomatico")}
                <NuevoBadge />
              </span>
              <span className="text-xs text-muted-foreground">
                {chatId
                  ? t("campanias.parametros.enviarAutomaticoDesc")
                  : t("campanias.parametros.enviarAutomaticoSinPlantilla")}
              </span>
            </span>
          </label>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="plantilla-email">{t("plantillas.campania.defaultEmail")}</Label>
          <SelectorPlantilla id="plantilla-email" canal="email" value={emailId} onChange={setEmailId} />
        </div>
      </CardContent>
    </Card>
  );
}
