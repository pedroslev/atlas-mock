"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Globe, Plus, ShieldAlert } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { RowActions } from "@/components/data-table/row-actions";
import {
  MitrolTable,
  type MRT_ColumnDef,
} from "@/components/data-table/mitrol-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  nombreUsuario,
  PREFIJO_CLAVE_PUBLICA,
  PREFIJO_CLAVE_SECRETA,
  puedeClaves,
  useClavesApi,
  type ClaveApi,
} from "@/lib/mock-claves-api";
import { useT } from "@/lib/i18n";
import { BotonCopiar, useFormatoFecha } from "./componentes";

// Lista de claves de acceso API del tenant. Verla pide el permiso "Ver";
// crear, editar y revocar tienen cada uno el suyo (Grupos y roles → Permisos). El alta es una pantalla
// propia (/configuracion/claves-api/nueva) y cada fila abre el detalle de la clave, donde se
// editan los dominios permitidos. Datos del store de mock, sin backend.
export default function ClavesApiPage() {
  const t = useT();
  const router = useRouter();
  const fecha = useFormatoFecha();
  const { claves, revocar } = useClavesApi();
  const puedeAlgoMas = puedeClaves("crear") || puedeClaves("editar") || puedeClaves("revocar");

  const columns = useMemo<MRT_ColumnDef<ClaveApi>[]>(
    () => [
      {
        accessorKey: "nombre",
        header: t("clavesApi.col.nombre"),
        // Debajo del nombre, desde dónde se acepta la pública: es lo primero
        // que se quiere saber si una clave aparece usada desde otro sitio.
        Cell: ({ row }) => {
          const dominiosClave = row.original.dominiosPermitidos;
          return (
            <span className="flex flex-col gap-0.5">
              <span className="font-medium">{row.original.nombre}</span>
              <span
                className="flex items-center gap-1 text-xs text-muted-foreground"
                title={dominiosClave.join("\n") || undefined}
              >
                <Globe className="size-3 shrink-0" />
                {dominiosClave.length === 0
                  ? t("clavesApi.dominios.cualquiera")
                  : dominiosClave.length === 1
                    ? new URL(dominiosClave[0]).host
                    : t("clavesApi.dominios.varios", {
                        dominio: new URL(dominiosClave[0]).host,
                        n: dominiosClave.length - 1,
                      })}
              </span>
            </span>
          );
        },
      },
      {
        accessorKey: "clavePublica",
        header: t("clavesApi.col.clave"),
        enableColumnFilter: false,
        // La pública se muestra abreviada y se copia completa, la vea quien la
        // vea. De la secreta solo existe la finalización.
        Cell: ({ row }) => {
          const clave = row.original;
          return (
            <span className="grid grid-cols-[auto_auto_auto] items-center gap-x-2 font-mono text-xs text-muted-foreground">
              <span className="font-sans">{t("clavesApi.clave.publica")}</span>
              <span>
                {clave.clavePublica.slice(0, PREFIJO_CLAVE_PUBLICA.length + 4)}…
                {clave.clavePublica.slice(-4)}
              </span>
              {clave.revocada ? (
                <span className="size-7" />
              ) : (
                <BotonCopiar
                  valor={clave.clavePublica}
                  etiqueta={t("clavesApi.clave.copiarPublica")}
                  testId={`copiar-publica-${clave.id}`}
                  soloIcono
                />
              )}
              <span className="font-sans">{t("clavesApi.clave.secreta")}</span>
              <span>
                {PREFIJO_CLAVE_SECRETA}…{clave.finalizacionSecreta}
              </span>
              <span />
            </span>
          );
        },
      },
      {
        id: "capacidades",
        accessorFn: (c) =>
          c.capacidades.map((cap) => t(`clavesApi.capacidad.${cap}.titulo`)).join(", "),
        header: t("clavesApi.col.capacidades"),
        Cell: ({ row }) => (
          <span className="flex flex-wrap gap-1">
            {row.original.capacidades.map((cap) => (
              <Badge key={cap} variant="info">
                {t(`clavesApi.capacidad.${cap}.titulo`)}
              </Badge>
            ))}
          </span>
        ),
      },
      {
        id: "creadaPor",
        accessorFn: (c) => nombreUsuario(c.creadaPor),
        header: t("clavesApi.col.creadaPor"),
        Cell: ({ row }) => (
          <span className="flex flex-col">
            <span>{nombreUsuario(row.original.creadaPor)}</span>
            <span className="text-xs text-muted-foreground">
              {fecha.format(new Date(row.original.creadaEl))}
            </span>
          </span>
        ),
      },
      {
        accessorKey: "ultimoUso",
        header: t("clavesApi.col.ultimoUso"),
        enableColumnFilter: false,
        size: 140,
        Cell: ({ row }) =>
          row.original.ultimoUso ? (
            fecha.format(new Date(row.original.ultimoUso))
          ) : (
            <span className="text-muted-foreground">{t("clavesApi.nuncaUsada")}</span>
          ),
      },
      {
        id: "estado",
        accessorFn: (c) =>
          c.revocada ? t("clavesApi.estado.revocada") : t("clavesApi.estado.activa"),
        header: t("common.comunes.estado"),
        size: 150,
        // Una revocada dice quién y cuándo, para que nadie tenga que preguntar.
        Cell: ({ row }) => {
          const revocada = row.original.revocada;
          if (!revocada) {
            return <Badge variant="success">{t("clavesApi.estado.activa")}</Badge>;
          }
          return (
            <span className="flex flex-col items-start gap-0.5">
              <Badge variant="neutral">{t("clavesApi.estado.revocada")}</Badge>
              <span className="text-xs text-muted-foreground">
                {t("clavesApi.revocadaPor", { nombre: nombreUsuario(revocada.por) })}
              </span>
              <span className="text-xs text-muted-foreground">
                {fecha.format(new Date(revocada.el))}
              </span>
            </span>
          );
        },
      },
    ],
    [t, fecha]
  );


  // Sin "Ver" no hay nada que mostrar (se llega solo tipeando la URL: la
  // opción no aparece en el menú).
  if (!puedeClaves("ver")) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title={t("common.nav.clavesApi")} />
        <p className="flex items-start gap-2 text-sm text-muted-foreground">
          <ShieldAlert className="mt-0.5 size-4 shrink-0" />
          {t("clavesApi.sinAcceso")}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("common.nav.clavesApi")}
        description={t("clavesApi.descripcion")}
        actions={
          puedeClaves("crear") && (
            <Button asChild data-testid="crear-clave-api">
              <Link href="/configuracion/claves-api/nueva">
                <Plus />
                {t("clavesApi.crear")}
              </Link>
            </Button>
          )
        }
      />

      {/* Solo puede mirar: se le explica por qué no tiene acciones. */}
      {!puedeAlgoMas && (
        <p className="flex items-start gap-2 text-sm text-muted-foreground">
          <ShieldAlert className="mt-0.5 size-4 shrink-0" />
          {t("clavesApi.sinPermiso")}
        </p>
      )}

      <MitrolTable
        columns={columns}
        data={claves}
        options={{
          // Clickear la fila abre el detalle (igual que Clientes en Zeus). El
          // menú de tres puntos hace stopPropagation para no navegar.
          muiTableBodyRowProps: ({ row }) => ({
            onClick: () => router.push(`/configuracion/claves-api/${row.original.id}`),
            sx: { cursor: "pointer" },
          }),
          // Sin permiso, o con la clave ya revocada, no hay nada que hacer
          // sobre la fila: revocar es la única acción y no se deshace.
          enableRowActions: puedeClaves("revocar"),
          renderRowActions: ({ row }) =>
            row.original.revocada ? null : (
              <RowActions
                actions={[
                  {
                    label: t("clavesApi.revocar"),
                    destructive: true,
                    confirmDescription: t("clavesApi.revocarConfirmacion", {
                      nombre: row.original.nombre,
                    }),
                    onSelect: () => revocar(row.original.id),
                  },
                ]}
              />
            ),
        }}
      />
    </div>
  );
}
