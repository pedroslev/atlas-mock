"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Ban } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  capacidadesPublicas,
  nombreUsuario,
  PREFIJO_CLAVE_SECRETA,
  puedeClaves,
  useClavesApi,
  type ClaveApi,
} from "@/lib/mock-claves-api";
import { useT } from "@/lib/i18n";
import { BotonCopiar, DominiosPermitidos, useFormatoFecha } from "../componentes";

// Detalle de una clave de acceso API (pide "Ver"). Muestra todo lo de la
// clave y, con "Editar", deja editar lo único editable: los dominios
// permitidos de la pública (sumar un dominio no obliga a revocar la clave y
// crear otra). Las capacidades se ven pero no se editan. Abajo, con
// "Revocar", la zona de peligro.
export default function ClaveApiDetallePage() {
  const t = useT();
  const { id } = useParams<{ id: string }>();
  const { claves } = useClavesApi();
  const clave = claves.find((c) => c.id === id);

  if (!puedeClaves("ver")) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title={t("common.nav.clavesApi")} backHref="/configuracion/claves-api" />
        <p className="text-sm text-muted-foreground">{t("clavesApi.sinAcceso")}</p>
      </div>
    );
  }

  if (!clave) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title={t("common.nav.clavesApi")} backHref="/configuracion/claves-api" />
        <p className="text-sm text-muted-foreground">{t("clavesApi.detalle.noExiste")}</p>
      </div>
    );
  }

  // `key`: si cambia la clave (otra URL), el formulario arranca de cero.
  return <Detalle key={clave.id} clave={clave} />;
}

function Detalle({ clave }: { clave: ClaveApi }) {
  const t = useT();
  const fecha = useFormatoFecha();
  const { actualizarDominios, revocar } = useClavesApi();
  const [dominios, setDominios] = useState(clave.dominiosPermitidos);
  const [confirmando, setConfirmando] = useState(false);

  // Una revocada ya no funciona: se ve, pero no se edita nada. Editar los
  // dominios y revocar tienen cada uno su permiso.
  const puedeEditar = puedeClaves("editar") && !clave.revocada;
  const puedeRevocar = puedeClaves("revocar") && !clave.revocada;
  const cambiaron =
    dominios.length !== clave.dominiosPermitidos.length ||
    dominios.some((d, i) => d !== clave.dominiosPermitidos[i]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={clave.nombre}
        backHref="/configuracion/claves-api"
        actions={
          clave.revocada ? (
            <Badge variant="neutral">{t("clavesApi.estado.revocada")}</Badge>
          ) : (
            <Badge variant="success">{t("clavesApi.estado.activa")}</Badge>
          )
        }
      />

      <div className="flex max-w-3xl flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("clavesApi.detalle.datos")}</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-[max-content_1fr] items-center gap-x-6 gap-y-3 text-sm">
              <dt className="text-muted-foreground">{t("clavesApi.clave.publica")}</dt>
              <dd className="flex min-w-0 items-center gap-2">
                <code className="truncate font-mono text-xs" data-testid="detalle-clave-publica">
                  {clave.clavePublica}
                </code>
                {!clave.revocada && (
                  <BotonCopiar
                    valor={clave.clavePublica}
                    etiqueta={t("clavesApi.clave.copiarPublica")}
                    testId="detalle-copiar-publica"
                    soloIcono
                  />
                )}
              </dd>
              <dt className="text-muted-foreground">{t("clavesApi.clave.secreta")}</dt>
              <dd className="font-mono text-xs">
                {PREFIJO_CLAVE_SECRETA}…{clave.finalizacionSecreta}
              </dd>
              <dt className="text-muted-foreground">{t("clavesApi.col.creadaPor")}</dt>
              <dd>
                {nombreUsuario(clave.creadaPor)} · {fecha.format(new Date(clave.creadaEl))}
              </dd>
              <dt className="text-muted-foreground">{t("clavesApi.col.ultimoUso")}</dt>
              <dd>
                {clave.ultimoUso
                  ? fecha.format(new Date(clave.ultimoUso))
                  : t("clavesApi.nuncaUsada")}
              </dd>
              {clave.revocada && (
                <>
                  <dt className="text-muted-foreground">{t("clavesApi.estado.revocada")}</dt>
                  <dd>
                    {nombreUsuario(clave.revocada.por)} ·{" "}
                    {fecha.format(new Date(clave.revocada.el))}
                  </dd>
                </>
              )}
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("clavesApi.nueva.capacidades")}</CardTitle>
            <CardDescription>{t("clavesApi.detalle.capacidadesFijas")}</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col rounded-lg ring-1 ring-foreground/10">
              {clave.capacidades.map((cap, index) => (
                <li
                  key={cap}
                  className={"flex flex-col gap-0.5 px-3 py-2.5" + (index > 0 ? " border-t" : "")}
                >
                  <span className="flex items-center justify-between gap-2 text-sm font-medium">
                    {t(`clavesApi.capacidad.${cap}.titulo`)}
                    <Badge variant="neutral">
                      {capacidadesPublicas.includes(cap)
                        ? t("clavesApi.uso.ambas")
                        : t("clavesApi.uso.secreta")}
                    </Badge>
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {t(`clavesApi.capacidad.${cap}.descripcion`)}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-4">
            {puedeEditar ? (
              <>
                <DominiosPermitidos dominios={dominios} onChange={setDominios} />
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    disabled={!cambiaron}
                    onClick={() => setDominios(clave.dominiosPermitidos)}
                  >
                    {t("common.acciones.cancelar")}
                  </Button>
                  <Button
                    disabled={!cambiaron}
                    onClick={() => actualizarDominios(clave.id, dominios)}
                    data-testid="guardar-dominios"
                  >
                    {t("common.acciones.guardar")}
                  </Button>
                </div>
              </>
            ) : (
              // Sin "Editar" (o revocada): la misma información, solo lectura.
              <div className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium">{t("clavesApi.dominios.titulo")}</span>
                {clave.dominiosPermitidos.length === 0 ? (
                  <span className="text-muted-foreground">
                    {t("clavesApi.dominios.cualquiera")}
                  </span>
                ) : (
                  <ul className="flex flex-wrap gap-1.5">
                    {clave.dominiosPermitidos.map((d) => (
                      <li key={d}>
                        <Badge variant="outline" className="h-6 font-mono">
                          {d}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {puedeRevocar && (
          <Card>
            <CardHeader>
              <CardTitle className="text-destructive">{t("clavesApi.revocar")}</CardTitle>
              <CardDescription>{t("clavesApi.detalle.revocarDescripcion")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="destructive"
                onClick={() => setConfirmando(true)}
                data-testid="revocar-clave-api"
              >
                <Ban />
                {t("clavesApi.revocar")}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <AlertDialog open={confirmando} onOpenChange={setConfirmando}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("clavesApi.detalle.revocarTitulo")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("clavesApi.revocarConfirmacion", { nombre: clave.nombre })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.acciones.cancelar")}</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={() => revocar(clave.id)}>
              {t("clavesApi.revocar")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
