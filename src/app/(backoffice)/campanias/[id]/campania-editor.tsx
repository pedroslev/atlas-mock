"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RowActions } from "@/components/data-table/row-actions";
import { useT } from "@/lib/i18n";
import {
  agentes,
  getGruposDeUsuario,
  getProyecto,
  type Campania,
  type CampaniaParametros,
} from "@/lib/mock-data";
import { CampaniaHerencia } from "../campania-herencia";
import { CampaniaHorarios } from "../campania-horarios";
import { CuentasSalientesPicker } from "../cuentas-salientes-picker";
import {
  ControlesAgenteTab,
  VisualizacionTab,
  GrabacionTab,
  ConfigOperativaTab,
  UrlsExternasTab,
} from "../campania-parametros";

// Sin campo de estado (campaigns no tiene estado en el DER) y sin solapa de
// listas de contactos (contact_list queda fuera de fase 0) — feedback de
// producto 2026-07-16.
function iniciales(nombre: string) {
  return nombre
    .split(" ")
    .map((n) => n[0])
    .join("");
}

export function CampaniaEditor({
  campania,
  nombreProyecto,
}: {
  campania: Campania;
  nombreProyecto?: string;
}) {
  const t = useT();
  // campaigns.parameters, levantado acá (no en cada solapa) porque
  // Grabación necesita saber si Controles del agente tiene el hold
  // habilitado — ver ADR-BD-002 / parametrizacion-propuesta.md.
  const [parametros, setParametros] = useState<CampaniaParametros>(campania.parametros);

  return (
    <Tabs defaultValue="general">
      <TabsList>
        <TabsTrigger value="general">{t("campanias.tab.general")}</TabsTrigger>
        <TabsTrigger value="controles-agente">
          {t("campanias.tab.controlesAgente")}
        </TabsTrigger>
        <TabsTrigger value="visualizacion">{t("campanias.tab.visualizacion")}</TabsTrigger>
        <TabsTrigger value="grabacion">{t("campanias.tab.grabacion")}</TabsTrigger>
        <TabsTrigger value="config-operativa">
          {t("campanias.tab.configOperativa")}
        </TabsTrigger>
        <TabsTrigger value="url-interaccion">
          {t("campanias.tab.urlInteraccion")}
        </TabsTrigger>
        <TabsTrigger value="usuarios">{t("common.nav.usuarios")}</TabsTrigger>
      </TabsList>

      <TabsContent value="general" className="grid gap-6 lg:grid-cols-2">
        <div className="flex min-w-0 flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("campanias.infoGeneral")}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="nombre">{t("common.comunes.nombre")}</Label>
                <Input id="nombre" defaultValue={campania.nombre} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="descripcion">
                  {t("common.comunes.descripcion")}
                </Label>
                <Textarea
                  id="descripcion"
                  defaultValue={campania.descripcion}
                  rows={3}
                  placeholder={t("common.comunes.opcional")}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="objetivo">{t("campanias.objetivo")}</Label>
                <Textarea
                  id="objetivo"
                  defaultValue={campania.objetivo}
                  rows={3}
                  placeholder={t("common.comunes.opcional")}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("campanias.cuentasSalientes")}</CardTitle>
              <CardDescription>
                {t("campanias.cuentasSalientesDesc")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CuentasSalientesPicker initialIds={campania.outboundAccountIds} />
            </CardContent>
          </Card>
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          <Card className="min-w-0">
            <CardHeader>
              <CardTitle>{t("campanias.configHeredada")}</CardTitle>
              <CardDescription>
                {nombreProyecto
                  ? t("campanias.configHeredadaDescProyecto", {
                      proyecto: nombreProyecto,
                    })
                  : t("campanias.configHeredadaDescLibre")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CampaniaHerencia
                nombreProyecto={nombreProyecto}
                initialGrupoClasificacionId={campania.grupoClasificacionId}
                initialGrupoBookmarksId={campania.grupoBookmarksId}
                initialFeriadosId={campania.feriadosId}
                initialListaExclusionId={campania.listaExclusionId}
              />
            </CardContent>
          </Card>

          <Card className="min-w-0">
            <CardHeader>
              <CardTitle>{t("campanias.horarios")}</CardTitle>
              <CardDescription>{t("campanias.horariosDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <CampaniaHorarios
                nombreProyecto={nombreProyecto}
                projectHours={getProyecto(campania.proyectoId)?.businessHours}
                initialValue={campania.businessHours}
              />
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="controles-agente">
        <ControlesAgenteTab
          value={parametros.agentControls}
          onChange={(v) => setParametros((p) => ({ ...p, agentControls: v }))}
        />
      </TabsContent>

      <TabsContent value="visualizacion">
        <VisualizacionTab
          value={parametros.displaySettings}
          onChange={(v) => setParametros((p) => ({ ...p, displaySettings: v }))}
        />
      </TabsContent>

      <TabsContent value="grabacion">
        <GrabacionTab
          value={parametros.recordingSettings}
          holdHabilitado={parametros.agentControls.allowHold}
          onChange={(v) => setParametros((p) => ({ ...p, recordingSettings: v }))}
        />
      </TabsContent>

      <TabsContent value="config-operativa">
        <ConfigOperativaTab
          value={parametros.agentOperationSettings}
          onChange={(v) => setParametros((p) => ({ ...p, agentOperationSettings: v }))}
        />
      </TabsContent>

      <TabsContent value="url-interaccion">
        <UrlsExternasTab
          value={parametros.interactionUrlSettings}
          onChange={(v) => setParametros((p) => ({ ...p, interactionUrlSettings: v }))}
        />
      </TabsContent>

      <TabsContent value="usuarios">
        <UsuariosTab initialUsuarioIds={campania.usuariosAsignados} />
      </TabsContent>
    </Tabs>
  );
}

function UsuariosTab({ initialUsuarioIds }: { initialUsuarioIds: string[] }) {
  const t = useT();
  const [usuarioIds, setUsuarioIds] = useState<string[]>(initialUsuarioIds);
  const [open, setOpen] = useState(false);

  const asignados = agentes.filter((a) => usuarioIds.includes(a.id));
  const disponibles = agentes.filter((a) => !usuarioIds.includes(a.id));

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle>{t("campanias.usuariosAsignados")}</CardTitle>
          <CardDescription>
            {t("campanias.usuariosOperan", { n: asignados.length })}
          </CardDescription>
        </div>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline">
              <UserPlus />
              {t("campanias.asignarUsuario")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-0" align="end">
            <Command>
              <CommandInput placeholder={t("campanias.buscarUsuario")} />
              <CommandList>
                <CommandEmpty>
                  {t("campanias.sinUsuariosDisponibles")}
                </CommandEmpty>
                <CommandGroup>
                  {disponibles.map((a) => (
                    <CommandItem
                      key={a.id}
                      value={a.nombre}
                      onSelect={() => {
                        setUsuarioIds((ids) => [...ids, a.id]);
                        setOpen(false);
                      }}
                    >
                      <Avatar className="size-6">
                        <AvatarFallback className="text-xs">
                          {iniciales(a.nombre)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="flex flex-col">
                        <span>{a.nombre}</span>
                        <span className="text-xs text-muted-foreground">
                          {a.email}
                        </span>
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </CardHeader>
      <CardContent>
        <div className="rounded-xl ring-1 ring-foreground/10">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("campanias.colUsuario")}</TableHead>
                <TableHead>{t("campanias.colEmail")}</TableHead>
                <TableHead>{t("common.comunes.estado")}</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {asignados.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center text-muted-foreground"
                  >
                    {t("campanias.sinUsuariosAsignados")}
                  </TableCell>
                </TableRow>
              )}
              {asignados.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>
                    <HoverCard>
                      <HoverCardTrigger asChild>
                        <div className="flex w-fit cursor-default items-center gap-2 font-medium">
                          <Avatar className="size-7">
                            <AvatarFallback className="text-xs">
                              {iniciales(a.nombre)}
                            </AvatarFallback>
                          </Avatar>
                          {a.nombre}
                        </div>
                      </HoverCardTrigger>
                      <HoverCardContent className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="size-9">
                            <AvatarFallback className="text-sm">
                              {iniciales(a.nombre)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-medium">{a.nombre}</span>
                            <span className="text-xs text-muted-foreground">
                              {a.email}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {getGruposDeUsuario(a.id).map((grupo) => (
                            <Badge key={grupo.id} variant="outline">
                              {grupo.nombre}
                            </Badge>
                          ))}
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {a.email}
                  </TableCell>
                  <TableCell>
                    <Badge variant={a.habilitado ? "default" : "secondary"}>
                      {a.habilitado
                        ? t("campanias.habilitado")
                        : t("campanias.deshabilitado")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <RowActions
                      actions={[
                        {
                          label: t("campanias.desasignar"),
                          destructive: true,
                          confirmDescription: t("campanias.desasignarConfirm", {
                            nombre: a.nombre,
                          }),
                          onSelect: () =>
                            setUsuarioIds((ids) =>
                              ids.filter((id) => id !== a.id)
                            ),
                        },
                      ]}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
