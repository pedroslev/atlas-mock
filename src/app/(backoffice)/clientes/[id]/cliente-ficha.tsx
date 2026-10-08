"use client";

import { useState } from "react";
import { Plus, Star, AtSign, Phone, MessageCircle, Globe, X } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ADefinir, EtiquetaBadge } from "@/components/clientes/clientes-ui";
import { proyectos } from "@/lib/mock-data";
import {
  etiquetasCatalogo,
  formatFecha,
  getEtiqueta,
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

// Pantalla de edición del cliente: solo sus datos. El historial de
// interacciones y los objetivos de contacto no van acá (feedback de producto
// 2026-10-05).
export function ClienteFicha({ cliente }: { cliente: Cliente }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="flex min-w-0 flex-col gap-6">
        <DatosBasicos cliente={cliente} />
        <Visibilidad cliente={cliente} />
      </div>
      <div className="flex min-w-0 flex-col gap-6">
        <Etiquetas cliente={cliente} />
        <FormasContacto formas={cliente.formasContacto} />
        <InfoAdicional cliente={cliente} />
      </div>
    </div>
  );
}

// Etiquetas del catálogo (no texto libre). No cambian la visibilidad —
// decisión de producto 2026-10-08.
function Etiquetas({ cliente }: { cliente: Cliente }) {
  const t = useT();
  const [ids, setIds] = useState<string[]>(cliente.etiquetas);
  const [open, setOpen] = useState(false);
  const disponibles = etiquetasCatalogo.filter((e) => !ids.includes(e.id));

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <CardTitle>{t("clientes.ficha.etiquetas")}</CardTitle>
          <CardDescription>{t("clientes.ficha.etiquetasDesc")}</CardDescription>
        </div>
        <ADefinir nota={t("clientes.ficha.etiquetasQuien")} />
      </CardHeader>
      <CardContent className="flex flex-wrap items-center gap-2">
        {ids.length === 0 && (
          <span className="text-sm text-muted-foreground">{t("clientes.ficha.sinEtiquetas")}</span>
        )}
        {ids.map((id) => {
          const e = getEtiqueta(id);
          if (!e) return null;
          return (
            <EtiquetaBadge key={id} etiqueta={e}>
              <button
                type="button"
                aria-label={t("clientes.ficha.quitarEtiqueta", { nombre: e.nombre })}
                className="-mr-1 rounded-full opacity-70 hover:opacity-100"
                onClick={() => setIds((xs) => xs.filter((x) => x !== id))}
              >
                <X />
              </button>
            </EtiquetaBadge>
          );
        })}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" disabled={disponibles.length === 0}>
              <Plus />
              {t("clientes.ficha.agregarEtiqueta")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-0" align="start">
            <Command>
              <CommandInput placeholder={t("clientes.ficha.buscarEtiqueta")} />
              <CommandList>
                <CommandEmpty>—</CommandEmpty>
                <CommandGroup>
                  {disponibles.map((e) => (
                    <CommandItem
                      key={e.id}
                      value={e.nombre}
                      onSelect={() => {
                        setIds((xs) => [...xs, e.id]);
                        setOpen(false);
                      }}
                    >
                      <EtiquetaBadge etiqueta={e} />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </CardContent>
    </Card>
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
          <Campo id="idExterno" label={t("clientes.ficha.idExterno")} value={cliente.idExterno} />
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

// Clientes globales: por defecto se ven en todos los proyectos y se puede
// sacar la visibilidad en los que no corresponda (ej. BPO con mandantes).
function Visibilidad({ cliente }: { cliente: Cliente }) {
  const t = useT();
  const [ocultoEn, setOcultoEn] = useState<string[]>(cliente.ocultoEn);
  const visibles = proyectos.length - ocultoEn.length;

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <CardTitle>{t("clientes.ficha.visibilidad")}</CardTitle>
          <CardDescription>{t("clientes.ficha.visibilidadDesc")}</CardDescription>
        </div>
        <ADefinir nota={t("clientes.ficha.visibilidadDefault")} />
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <span className="text-sm text-muted-foreground">
          {ocultoEn.length === 0
            ? t("clientes.visibleTodos")
            : t("clientes.ficha.visibleEnN", { n: visibles, total: proyectos.length })}
        </span>
        <ul className="flex flex-col divide-y rounded-lg border">
          {proyectos.map((p) => {
            const visible = !ocultoEn.includes(p.id);
            return (
              <li key={p.id} className="flex items-center justify-between gap-3 px-3 py-2.5">
                <label htmlFor={`vis-${p.id}`} className="flex flex-col">
                  <span className={visible ? "text-sm font-medium" : "text-sm text-muted-foreground"}>
                    {p.nombre}
                  </span>
                  {!visible && (
                    <span className="text-xs text-muted-foreground">
                      {t("clientes.ficha.ocultoEnProyecto")}
                    </span>
                  )}
                </label>
                <Switch
                  id={`vis-${p.id}`}
                  checked={visible}
                  onCheckedChange={(on) =>
                    setOcultoEn((ids) => (on ? ids.filter((id) => id !== p.id) : [...ids, p.id]))
                  }
                />
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}

function InfoAdicional({ cliente }: { cliente: Cliente }) {
  const t = useT();
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <CardTitle>{t("clientes.ficha.infoAdicional")}</CardTitle>
          <CardDescription>{t("clientes.ficha.infoAdicionalDesc")}</CardDescription>
        </div>
        <ADefinir nota={t("clientes.ficha.infoAdicionalPisa")} />
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          {Object.entries(cliente.infoAdicional).map(([campo, valor]) => (
            <Campo key={campo} id={`info-${campo}`} label={campo} value={valor} />
          ))}
        </div>
        <Button variant="outline" size="sm" className="self-start">
          <Plus />
          {t("clientes.ficha.agregarCampo")}
        </Button>
      </CardContent>
    </Card>
  );
}
