"use client";

import { Star, AtSign, Phone, MessageCircle, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ADefinir, EtiquetaBadge, ViaBadge } from "@/components/clientes/clientes-ui";
import {
  formatFecha,
  getEtiqueta,
  nombreCompleto,
  type Cliente,
  type FormaContacto,
  type ViaCarga,
} from "@/lib/mock-clientes";
import { useT } from "@/lib/i18n";

const FORMA_ICON: Record<FormaContacto["tipo"], typeof Phone> = {
  telefono: Phone,
  email: AtSign,
  whatsapp: MessageCircle,
  red: Globe,
};

// Ficha del cliente, solo lectura (feedback de producto 2026-10-14): arriba
// quién es (identificación, etiquetas, alta y última actualización); abajo
// cómo contactarlo y la información adicional. El historial y los objetivos
// de contacto no van acá.
export function ClienteFicha({ cliente }: { cliente: Cliente }) {
  return (
    <div className="flex flex-col gap-6">
      <Resumen cliente={cliente} />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <FormasContacto formas={cliente.formasContacto} />
        <InfoAdicional cliente={cliente} />
      </div>
    </div>
  );
}

function Dato({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="truncate text-sm font-medium">{children}</dd>
    </div>
  );
}

function Traza({ label, fecha, quien, via }: { label: string; fecha: string; quien: string; via: ViaCarga }) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{formatFecha(fecha, true)}</span>
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <ViaBadge via={via} />
        <span className="truncate">{quien}</span>
      </span>
    </div>
  );
}

function Resumen({ cliente }: { cliente: Cliente }) {
  const t = useT();
  const iniciales = `${cliente.nombre[0] ?? ""}${cliente.apellido[0] ?? ""}`;
  return (
    <Card>
      <CardContent className="flex flex-col gap-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar className="size-12">
              <AvatarFallback className="text-base font-semibold">{iniciales}</AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-col gap-1.5">
              <span className="truncate text-lg font-semibold">{nombreCompleto(cliente)}</span>
              <div className="flex flex-wrap gap-1">
                {cliente.etiquetas.length === 0 ? (
                  <span className="text-xs text-muted-foreground">{t("clientes.ficha.sinEtiquetas")}</span>
                ) : (
                  cliente.etiquetas.map((id) => {
                    const e = getEtiqueta(id);
                    return e ? <EtiquetaBadge key={id} etiqueta={e} /> : null;
                  })
                )}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <Traza
              label={t("clientes.col.alta")}
              fecha={cliente.creado}
              quien={cliente.creadoPor}
              via={cliente.creadoVia}
            />
            <Traza
              label={t("clientes.col.actualizacion")}
              fecha={cliente.actualizado}
              quien={cliente.actualizadoPor}
              via={cliente.actualizadoVia}
            />
          </div>
        </div>
        <dl className="grid gap-4 border-t pt-4 sm:grid-cols-3">
          <Dato label={t("clientes.ficha.tipoDoc")}>{cliente.tipoDoc}</Dato>
          <Dato label={t("clientes.ficha.nroDoc")}>{cliente.nroDoc}</Dato>
          <Dato label={t("clientes.ficha.idExterno")}>
            <span className="font-mono">{cliente.idExterno ?? "—"}</span>
          </Dato>
        </dl>
      </CardContent>
    </Card>
  );
}

function FormasContacto({ formas }: { formas: FormaContacto[] }) {
  const t = useT();
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("clientes.ficha.formasContacto")}</CardTitle>
        <CardDescription>{t("clientes.ficha.formasContactoDesc")}</CardDescription>
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
                      f.estado === "invalido" ? "truncate text-muted-foreground line-through" : "truncate font-medium"
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
                  {f.estado === "invalido" && <Badge variant="neutral">{t("clientes.ficha.invalido")}</Badge>}
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

function InfoAdicional({ cliente }: { cliente: Cliente }) {
  const t = useT();
  const entradas = Object.entries(cliente.infoAdicional);
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <CardTitle>{t("clientes.ficha.infoAdicional")}</CardTitle>
          <CardDescription>{t("clientes.ficha.infoAdicionalDesc")}</CardDescription>
        </div>
        <ADefinir nota={t("clientes.ficha.infoAdicionalPisa")} />
      </CardHeader>
      <CardContent>
        {entradas.length === 0 ? (
          <span className="text-sm text-muted-foreground">—</span>
        ) : (
          <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
            {entradas.map(([campo, valor]) => (
              <Dato key={campo} label={campo}>
                {valor || "—"}
              </Dato>
            ))}
          </dl>
        )}
      </CardContent>
    </Card>
  );
}
