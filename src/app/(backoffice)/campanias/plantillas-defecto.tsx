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
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { getPlantillasDeGrupo, plantillas, type CanalPlantilla, type Plantilla } from "@/lib/mock-data";

// Selector de la plantilla por defecto: solo las plantillas activas del canal
// que están en el grupo de plantillas de la campaña (solapa General), como
// define plantillas-de-mensajes (ATLAS-1191). Sin grupo, queda deshabilitado.
function SelectorPlantilla({
  id,
  canal,
  grupoId,
  value,
  onChange,
}: {
  id: string;
  canal: CanalPlantilla;
  grupoId?: string;
  value?: string;
  onChange: (id: string | undefined) => void;
}) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const items = getPlantillasDeGrupo(grupoId ?? "").filter(
    (p) => p.activa && p.canales.includes(canal)
  );
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
        <Button
          id={id}
          variant="outline"
          role="combobox"
          disabled={!grupoId}
          className="w-full justify-between font-normal"
        >
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
            <CommandEmpty>{t("plantillas.campania.vacioDefault")}</CommandEmpty>
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
            <CommandGroup>{items.map((p) => item(p, p.id))}</CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// ATLAS-1227: la plantilla por defecto sale de la solapa General y vive acá,
// en Vista del cliente. Se elige solo entre las del grupo de plantillas de la
// campaña. Sin email por ahora (no hay canal de mail). La casilla de envío
// automático reemplaza al "saludo al atender" del legacy.
// En el mock el grupo se lee de los datos de la campaña, no del estado de la
// solapa General: cambiar el grupo ahí no refresca este selector.
export function PlantillasDefectoTab({
  grupoPlantillasId,
  initialChatId,
}: {
  grupoPlantillasId?: string;
  initialChatId?: string;
}) {
  const t = useT();
  const [chatId, setChatId] = useState(initialChatId);
  const [enviarAutomatico, setEnviarAutomatico] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("campanias.plantillasDefecto.titulo")}</CardTitle>
        <CardDescription>{t("campanias.plantillasDefecto.desc")}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 lg:grid-cols-2">
        {/* Por ahora solo chat: todavía no hay canal de mail. */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="plantilla-chat">{t("plantillas.campania.defaultChat")}</Label>
          <SelectorPlantilla
            id="plantilla-chat"
            canal="chat"
            grupoId={grupoPlantillasId}
            value={chatId}
            onChange={setChatId}
          />
          {!grupoPlantillasId && (
            <p className="text-xs text-muted-foreground">{t("plantillas.campania.elegirGrupoPrimero")}</p>
          )}
          <label
            htmlFor="plantilla-chat-automatica"
            className={cn("mt-1 flex items-start gap-2 rounded-md p-2 ring-1 ring-foreground/10", !chatId && "opacity-50")}
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
              </span>
              <span className="text-xs text-muted-foreground">
                {chatId
                  ? t("campanias.parametros.enviarAutomaticoDesc")
                  : t("campanias.parametros.enviarAutomaticoSinPlantilla")}
              </span>
            </span>
          </label>
        </div>
      </CardContent>
    </Card>
  );
}
