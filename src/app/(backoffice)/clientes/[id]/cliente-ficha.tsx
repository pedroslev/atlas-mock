"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Share2, Star, X, AtSign, Phone, MessageCircle, Globe } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
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
import {
  ADefinir,
  CanalBadge,
  CanalIcon,
  EstadoObjetivoBadge,
  OrigenBadge,
} from "@/components/clientes/clientes-ui";
import { getCampania, getProyecto, proyectos } from "@/lib/mock-data";
import {
  camposAdicionalesPorProyecto,
  formatFecha,
  getInteraccionesDeCliente,
  getObjetivosDeCliente,
  type Cliente,
  type FormaContacto,
} from "@/lib/mock-clientes";
import { useT } from "@/lib/i18n";

const FORMA_ICON: Record<FormaContacto["tipo"], typeof Phone> = {
  telefono: Phone,
  email: AtSign,
  whatsapp: MessageCircle,
  red: Globe,
};

export function ClienteFicha({ cliente }: { cliente: Cliente }) {
  const t = useT();
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="flex min-w-0 flex-col gap-6">
          <DatosBasicos cliente={cliente} />
          <Alcance cliente={cliente} />
        </div>
        <div className="flex min-w-0 flex-col gap-6">
          <FormasContacto formas={cliente.formasContacto} />
          <InfoAdicional cliente={cliente} />
        </div>
      </div>

      <Tabs defaultValue="historial">
        <TabsList>
          <TabsTrigger value="historial">{t("clientes.ficha.tab.historial")}</TabsTrigger>
          <TabsTrigger value="objetivos">{t("clientes.ficha.tab.objetivos")}</TabsTrigger>
        </TabsList>
        <TabsContent value="historial">
          <Historial clienteId={cliente.id} />
        </TabsContent>
        <TabsContent value="objetivos">
          <Objetivos clienteId={cliente.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Campo({ id, label, value }: { id: string; label: string; value?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} defaultValue={value ?? ""} />
    </div>
  );
}

function DatosBasicos({ cliente }: { cliente: Cliente }) {
  const t = useT();
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("clientes.ficha.datosBasicos")}</CardTitle>
        <CardDescription>
          {t("clientes.ficha.trazabilidad", {
            fecha: formatFecha(cliente.actualizado, true),
            quien: cliente.actualizadoPor,
          })}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        <Campo id="nombre" label={t("clientes.ficha.nombre")} value={cliente.nombre} />
        <Campo id="apellido" label={t("clientes.ficha.apellido")} value={cliente.apellido} />
        <Campo id="tipoDoc" label={t("clientes.ficha.tipoDoc")} value={cliente.tipoDoc} />
        <Campo id="nroDoc" label={t("clientes.ficha.nroDoc")} value={cliente.nroDoc} />
        <div className="sm:col-span-2">
          <Campo id="idCrm" label={t("clientes.ficha.idCrm")} value={cliente.idCrm} />
        </div>
      </CardContent>
    </Card>
  );
}

function FormasContacto({ formas }: { formas: FormaContacto[] }) {
  const t = useT();
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>{t("clientes.ficha.formasContacto")}</CardTitle>
          <CardDescription>{t("clientes.ficha.formasContactoDesc")}</CardDescription>
        </div>
        <Button variant="outline" size="sm">
          <Plus />
          {t("clientes.ficha.agregarForma")}
        </Button>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col divide-y">
          {formas.map((f, i) => {
            const Icon = FORMA_ICON[f.tipo];
            return (
              <li key={i} className="flex items-center gap-3 py-2.5">
                <Icon className="size-4 text-muted-foreground" aria-hidden />
                <div className="flex min-w-0 flex-1 flex-col">
                  <span
                    className={
                      f.estado === "invalido"
                        ? "truncate text-muted-foreground line-through"
                        : "truncate font-medium"
                    }
                  >
                    {f.valor}
                  </span>
                  <span className="text-xs text-muted-foreground">{f.etiqueta}</span>
                </div>
                <div className="flex flex-wrap justify-end gap-1">
                  {f.principal && (
                    <Badge variant="info" className="gap-1">
                      <Star />
                      {t("clientes.ficha.principal")}
                    </Badge>
                  )}
                  {f.estado === "invalido" && (
                    <Badge variant="neutral">{t("clientes.ficha.invalido")}</Badge>
                  )}
                  {f.estado === "noContactar" && (
                    <Badge variant="destructive">{t("clientes.ficha.noContactar")}</Badge>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}

function Alcance({ cliente }: { cliente: Cliente }) {
  const t = useT();
  const [compartidos, setCompartidos] = useState<string[]>(cliente.compartidoCon);
  const [open, setOpen] = useState(false);
  const disponibles = proyectos.filter(
    (p) => p.id !== cliente.proyectoId && !compartidos.includes(p.id)
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("clientes.ficha.alcance")}</CardTitle>
        <CardDescription>{t("clientes.ficha.alcanceDesc")}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">{t("clientes.ficha.proyectoDuenio")}</span>
          <Badge variant="outline">{getProyecto(cliente.proyectoId)?.nombre}</Badge>
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">{t("clientes.compartidoCon")}</span>
          <div className="flex flex-wrap items-center gap-2">
            {compartidos.length === 0 && (
              <span className="text-sm text-muted-foreground">
                {t("clientes.noCompartido")}
              </span>
            )}
            {compartidos.map((pid) => (
              <Badge key={pid} variant="info" className="gap-1 pr-1">
                {getProyecto(pid)?.nombre}
                <button
                  type="button"
                  aria-label={t("clientes.ficha.dejarDeCompartir")}
                  className="rounded-full hover:bg-info/20"
                  onClick={() => setCompartidos((ids) => ids.filter((id) => id !== pid))}
                >
                  <X />
                </button>
              </Badge>
            ))}
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" disabled={disponibles.length === 0}>
                  <Share2 />
                  {t("clientes.ficha.compartir")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-0" align="start">
                <Command>
                  <CommandList>
                    <CommandEmpty>—</CommandEmpty>
                    <CommandGroup>
                      {disponibles.map((p) => (
                        <CommandItem
                          key={p.id}
                          value={p.nombre}
                          onSelect={() => {
                            setCompartidos((ids) => [...ids, p.id]);
                            setOpen(false);
                          }}
                        >
                          {p.nombre}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function InfoAdicional({ cliente }: { cliente: Cliente }) {
  const t = useT();
  const campos = camposAdicionalesPorProyecto[cliente.proyectoId] ?? [];
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>{t("clientes.ficha.infoAdicional")}</CardTitle>
          <CardDescription>{t("clientes.ficha.infoAdicionalDesc")}</CardDescription>
        </div>
        <ADefinir nota={t("clientes.ficha.infoAdicionalPisa")} />
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        {campos.map((campo) => (
          <Campo
            key={campo}
            id={`info-${campo}`}
            label={campo}
            value={cliente.infoAdicional[campo]}
          />
        ))}
      </CardContent>
    </Card>
  );
}

function Historial({ clienteId }: { clienteId: string }) {
  const t = useT();
  const items = getInteraccionesDeCliente(clienteId);
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <CardDescription>{t("clientes.ficha.historialVisibilidad")}</CardDescription>
        <ADefinir nota={t("clientes.ficha.historialVisibilidad")} />
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-xl ring-1 ring-foreground/10">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("clientes.hist.fecha")}</TableHead>
                <TableHead>{t("clientes.hist.canal")}</TableHead>
                <TableHead>{t("clientes.hist.direccion")}</TableHead>
                <TableHead>{t("clientes.hist.campania")}</TableHead>
                <TableHead>{t("clientes.hist.agente")}</TableHead>
                <TableHead>{t("clientes.hist.duracion")}</TableHead>
                <TableHead>{t("clientes.hist.clasificacion")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    {t("clientes.ficha.sinInteracciones")}
                  </TableCell>
                </TableRow>
              )}
              {items.map((i) => (
                <TableRow key={i.id}>
                  <TableCell className="whitespace-nowrap">{formatFecha(i.fecha, true)}</TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1.5">
                      <CanalIcon canal={i.canal} />
                      {t(`clientes.canal.${i.canal}`)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <span>{t(`clientes.hist.${i.direccion}`)}</span>
                      {i.objetivoId && (
                        <span className="text-xs text-muted-foreground">
                          {t("clientes.hist.porObjetivo")}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/campanias/${i.campaniaId}`}
                      className="hover:underline"
                    >
                      {getCampania(i.campaniaId)?.nombre}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{i.agente ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{i.duracion ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{i.clasificacion}</Badge>
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

function Objetivos({ clienteId }: { clienteId: string }) {
  const t = useT();
  const items = getObjetivosDeCliente(clienteId);
  return (
    <Card>
      <CardContent>
        <div className="overflow-x-auto rounded-xl ring-1 ring-foreground/10">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("clientes.hist.campania")}</TableHead>
                <TableHead>{t("clientes.obj.col.cargado")}</TableHead>
                <TableHead>{t("clientes.obj.col.origen")}</TableHead>
                <TableHead>{t("clientes.obj.col.medios")}</TableHead>
                <TableHead>{t("clientes.obj.col.ventana")}</TableHead>
                <TableHead>{t("clientes.obj.col.paso")}</TableHead>
                <TableHead>{t("clientes.obj.col.estado")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    {t("clientes.ficha.sinObjetivos")}
                  </TableCell>
                </TableRow>
              )}
              {items.map((o) => (
                <TableRow key={o.id}>
                  <TableCell>
                    <Link href={`/campanias/${o.campaniaId}`} className="font-medium hover:underline">
                      {getCampania(o.campaniaId)?.nombre}
                    </Link>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">{formatFecha(o.cargado, true)}</TableCell>
                  <TableCell>
                    <OrigenBadge origen={o.origen} />
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {o.medios.map((m, idx) => (
                        <CanalBadge key={m} canal={m} orden={idx + 1} />
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {formatFecha(o.desde)} – {formatFecha(o.hasta)}
                  </TableCell>
                  <TableCell>
                    {o.pasoActual ? t("clientes.obj.paso", { n: o.pasoActual }) : "—"}
                  </TableCell>
                  <TableCell>
                    <EstadoObjetivoBadge estado={o.estado} />
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
