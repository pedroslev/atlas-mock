"use client";

import { useState } from "react";
import { UserMinus, UserPlus } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { CampoUnico } from "@/components/layout/campos-unicos";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ListaSeleccionable } from "@/app/(backoffice)/agentes/acciones-masivas";
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
  campanias,
  getGruposDeUsuario,
  gruposTrabajo,
  proyectos,
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
  ClienteTab,
} from "../campania-parametros";
import { PlantillasDefectoTab } from "../plantillas-defecto";

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
  nombresExistentes,
}: {
  campania: Campania;
  nombreProyecto?: string;
  nombresExistentes: string[];
}) {
  const t = useT();
  // campaigns.parameters, levantado acá (no en cada solapa) porque
  // Grabación necesita saber si Controles del agente tiene el hold
  // habilitado — ver ADR-BD-002 / parametrizacion-propuesta.md.
  const [parametros, setParametros] = useState<CampaniaParametros>(campania.parametros);
  // "Asignar usuarios" del listado de campañas abre directamente esta solapa.
  const solapa = useSearchParams().get("tab") === "usuarios" ? "usuarios" : "general";

  return (
    <Tabs defaultValue={solapa}>
      <TabsList>
        <TabsTrigger value="general">{t("campanias.tab.general")}</TabsTrigger>
        <TabsTrigger value="controles-agente">
          {t("campanias.tab.controlesAgente")}
        </TabsTrigger>
        <TabsTrigger value="visualizacion">{t("campanias.tab.visualizacion")}</TabsTrigger>
        {/* Al lado de Visualización: esa es la vista del asesor, esta la del
            cliente (ATLAS-1227). */}
        <TabsTrigger value="vista-cliente">
          {t("campanias.tab.vistaCliente")}
        </TabsTrigger>
        <TabsTrigger value="grabacion">{t("campanias.tab.grabacion")}</TabsTrigger>
        <TabsTrigger value="config-operativa">
          {t("campanias.tab.configOperativa")}
        </TabsTrigger>
        <TabsTrigger value="url-interaccion">
          {t("campanias.tab.urlInteraccion")}
        </TabsTrigger>
        <TabsTrigger value="usuarios">{t("common.nav.usuarios")}</TabsTrigger>
      </TabsList>

      {/* forceMount: el nombre conserva lo escrito y sigue bloqueando Confirmar
          aunque se pase a otra solapa. */}
      <TabsContent value="general" forceMount className="grid gap-6 lg:grid-cols-2 data-[state=inactive]:hidden">
        <div className="flex min-w-0 flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("campanias.infoGeneral")}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="nombre">{t("common.comunes.nombre")}</Label>
                <CampoUnico
                  id="nombre"
                  existentes={nombresExistentes}
                  defaultValue={campania.nombre}
                  obligatorio
                />
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
                initialGrupoPlantillasId={campania.grupoPlantillasId}
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

      <TabsContent forceMount value="controles-agente" className="data-[state=inactive]:hidden">
        <ControlesAgenteTab
          value={parametros.agentControls}
          onChange={(v) => setParametros((p) => ({ ...p, agentControls: v }))}
        />
      </TabsContent>

      <TabsContent forceMount value="visualizacion" className="data-[state=inactive]:hidden">
        <VisualizacionTab
          value={parametros.displaySettings}
          onChange={(v) => setParametros((p) => ({ ...p, displaySettings: v }))}
          holdHabilitado={parametros.agentControls.allowHold}
        />
      </TabsContent>

      <TabsContent forceMount value="vista-cliente" className="flex flex-col gap-6 data-[state=inactive]:hidden">
        <PlantillasDefectoTab
          grupoPlantillasId={campania.grupoPlantillasId}
          initialChatId={campania.plantillaDefaultChatId}
        />
        <ClienteTab
          value={parametros.clientMedia}
          onChange={(v) => setParametros((p) => ({ ...p, clientMedia: v }))}
        />
      </TabsContent>

      <TabsContent forceMount value="grabacion" className="data-[state=inactive]:hidden">
        <GrabacionTab
          value={parametros.recordingSettings}
          holdHabilitado={parametros.agentControls.allowHold}
          onChange={(v) => setParametros((p) => ({ ...p, recordingSettings: v }))}
        />
      </TabsContent>

      <TabsContent forceMount value="config-operativa" className="data-[state=inactive]:hidden">
        <ConfigOperativaTab
          value={parametros.agentOperationSettings}
          onChange={(v) => setParametros((p) => ({ ...p, agentOperationSettings: v }))}
        />
      </TabsContent>

      <TabsContent forceMount value="url-interaccion" className="data-[state=inactive]:hidden">
        <UrlsExternasTab
          value={parametros.interactionUrlSettings}
          onChange={(v) => setParametros((p) => ({ ...p, interactionUrlSettings: v }))}
        />
      </TabsContent>

      <TabsContent forceMount value="usuarios" className="data-[state=inactive]:hidden">
        <UsuariosTab campaniaId={campania.id} initialUsuarioIds={campania.usuariosAsignados} />
      </TabsContent>
    </Tabs>
  );
}


// Solapa Usuarios (ATLAS-1353): agregar varios a la vez, con filtro por grupo
// (copia de los miembros de ese momento: quien entre después al grupo no queda
// asignado), y quitar varios a la vez. Se guarda con Confirmar, como el resto
// de la campaña.
function UsuariosTab({
  campaniaId,
  initialUsuarioIds,
}: {
  campaniaId: string;
  initialUsuarioIds: string[];
}) {
  const t = useT();
  const [usuarioIds, setUsuarioIds] = useState<string[]>(initialUsuarioIds);
  const [agregarAbierto, setAgregarAbierto] = useState(false);
  const [marcados, setMarcados] = useState<string[]>([]);
  const [confirmarQuitar, setConfirmarQuitar] = useState(false);

  const asignados = agentes.filter((a) => usuarioIds.includes(a.id));
  const todos = asignados.length > 0 && asignados.every((a) => marcados.includes(a.id));
  const alguno = asignados.some((a) => marcados.includes(a.id));

  function quitarMarcados() {
    setUsuarioIds((ids) => ids.filter((id) => !marcados.includes(id)));
    setMarcados([]);
    setConfirmarQuitar(false);
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle>{t("campanias.usuariosAsignados")}</CardTitle>
          <CardDescription>
            {t("campanias.usuariosOperan", { n: asignados.length })}
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          {marcados.length > 0 && (
            <Button variant="outline" className="text-destructive" onClick={() => setConfirmarQuitar(true)}>
              <UserMinus />
              {t("campanias.masivo.quitar", { n: marcados.length })}
            </Button>
          )}
          <Button variant="outline" onClick={() => setAgregarAbierto(true)}>
            <UserPlus />
            {t("campanias.masivo.agregar")}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-xl ring-1 ring-foreground/10">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    aria-label={t("campanias.masivo.marcarTodos")}
                    checked={todos ? true : alguno ? "indeterminate" : false}
                    onCheckedChange={(v) => setMarcados(v === true ? asignados.map((a) => a.id) : [])}
                  />
                </TableHead>
                <TableHead>{t("campanias.colUsuario")}</TableHead>
                <TableHead>{t("campanias.colEmail")}</TableHead>
                <TableHead>{t("common.comunes.estado")}</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {asignados.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    {t("campanias.sinUsuariosAsignados")}
                  </TableCell>
                </TableRow>
              )}
              {asignados.map((a) => (
                <TableRow key={a.id} data-state={marcados.includes(a.id) ? "selected" : undefined}>
                  <TableCell>
                    <Checkbox
                      aria-label={a.nombre}
                      checked={marcados.includes(a.id)}
                      onCheckedChange={(v) =>
                        setMarcados((m) => (v === true ? [...m, a.id] : m.filter((id) => id !== a.id)))
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <HoverCard>
                      <HoverCardTrigger asChild>
                        <div className="flex w-fit cursor-default items-center gap-2 font-medium">
                          <Avatar className="size-7">
                            <AvatarFallback className="text-xs">{iniciales(a.nombre)}</AvatarFallback>
                          </Avatar>
                          {a.nombre}
                        </div>
                      </HoverCardTrigger>
                      <HoverCardContent className="flex flex-col gap-2">
                        <div className="flex flex-col">
                          <span className="font-medium">{a.nombre}</span>
                          <span className="text-xs text-muted-foreground">{a.email}</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {getGruposDeUsuario(a.id).map((grupo) => (
                            <Badge key={grupo.id} variant="outline">{grupo.nombre}</Badge>
                          ))}
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{a.email}</TableCell>
                  <TableCell>
                    <Badge variant={a.habilitado ? "default" : "secondary"}>
                      {a.habilitado ? t("campanias.habilitado") : t("campanias.deshabilitado")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <RowActions
                      actions={[
                        {
                          label: t("campanias.desasignar"),
                          destructive: true,
                          confirmDescription: t("campanias.desasignarConfirm", { nombre: a.nombre }),
                          onSelect: () => {
                            setUsuarioIds((ids) => ids.filter((id) => id !== a.id));
                            setMarcados((m) => m.filter((id) => id !== a.id));
                          },
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

      {agregarAbierto && (
        <AgregarUsuariosDialog
          campaniaId={campaniaId}
          yaAsignados={usuarioIds}
          onClose={() => setAgregarAbierto(false)}
          onAgregar={(ids) => {
            setUsuarioIds((actuales) => [...actuales, ...ids]);
            setAgregarAbierto(false);
          }}
        />
      )}

      <Dialog open={confirmarQuitar} onOpenChange={setConfirmarQuitar}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("campanias.masivo.quitarTitulo", { n: marcados.length })}</DialogTitle>
            <DialogDescription>
              {agentes
                .filter((a) => marcados.includes(a.id))
                .map((a) => a.nombre)
                .join(", ")}
            </DialogDescription>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">{t("campanias.masivo.quitarAyuda")}</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmarQuitar(false)}>
              {t("common.acciones.cancelar")}
            </Button>
            <Button variant="destructive" onClick={quitarMarcados}>
              {t("campanias.masivo.quitar", { n: marcados.length })}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function AgregarUsuariosDialog({
  campaniaId,
  yaAsignados,
  onClose,
  onAgregar,
}: {
  campaniaId: string;
  yaAsignados: string[];
  onClose: () => void;
  onAgregar: (ids: string[]) => void;
}) {
  const t = useT();
  const [grupoId, setGrupoId] = useState<string>("todos");
  const [otraCampaniaId, setOtraCampaniaId] = useState<string>("todas");
  const [elegidos, setElegidos] = useState<string[]>([]);

  // Los que ya están en la campaña no se ofrecen.
  const disponibles = agentes.filter((a) => !yaAsignados.includes(a.id));
  // Los dos filtros se combinan: del grupo elegido Y de la campaña elegida.
  // Igual que el grupo, filtrar por otra campaña toma a sus usuarios de hoy.
  const delGrupo = disponibles
    .filter((a) => grupoId === "todos" || getGruposDeUsuario(a.id).some((g) => g.id === grupoId))
    .filter((a) => {
      if (otraCampaniaId === "todas") return true;
      // "Todas las campañas de <proyecto>": usuarios de cualquiera de ellas.
      const origen = otraCampaniaId.startsWith("proyecto:")
        ? campanias.filter(
            (c) => c.proyectoId === otraCampaniaId.slice("proyecto:".length) && c.id !== campaniaId
          )
        : campanias.filter((c) => c.id === otraCampaniaId);
      return origen.some((c) => c.usuariosAsignados.includes(a.id));
    });

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("campanias.masivo.agregar")}</DialogTitle>
          <DialogDescription>{t("campanias.masivo.agregarAyuda")}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label>{t("campanias.masivo.filtrarGrupo")}</Label>
            <Select value={grupoId} onValueChange={setGrupoId}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">{t("campanias.masivo.todosLosGrupos")}</SelectItem>
                {gruposTrabajo.map((g) => (
                  <SelectItem key={g.id} value={g.id}>{g.nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>{t("campanias.masivo.filtrarCampania")}</Label>
            <Select value={otraCampaniaId} onValueChange={setOtraCampaniaId}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">{t("campanias.masivo.todasLasCampanias")}</SelectItem>
                {/* Agrupadas por proyecto. */}
                {proyectos.map((p) => {
                  const delProyecto = campanias.filter(
                    (c) => c.proyectoId === p.id && c.id !== campaniaId
                  );
                  if (delProyecto.length === 0) return null;
                  return (
                    <SelectGroup key={p.id}>
                      <SelectLabel>{p.nombre}</SelectLabel>
                      <SelectItem value={`proyecto:${p.id}`}>
                        {t("campanias.masivo.todasDelProyecto", { proyecto: p.nombre })}
                      </SelectItem>
                      {delProyecto.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.nombre}</SelectItem>
                      ))}
                    </SelectGroup>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </div>
        <ListaSeleccionable
          opciones={delGrupo.map((a) => ({ id: a.id, nombre: `${a.nombre} · ${a.email}` }))}
          elegidos={elegidos}
          onChange={setElegidos}
          placeholder={t("campanias.buscarUsuario")}
          vacio={t("campanias.sinUsuariosDisponibles")}
        />
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>{t("common.acciones.cancelar")}</Button>
          <Button disabled={elegidos.length === 0} onClick={() => onAgregar(elegidos)}>
            {t("campanias.masivo.agregarN", { n: elegidos.length })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
