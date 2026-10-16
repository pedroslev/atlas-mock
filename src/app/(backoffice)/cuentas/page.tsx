"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { RowActions } from "@/components/data-table/row-actions";
import {
  MitrolTable,
  type MRT_ColumnDef,
} from "@/components/data-table/mitrol-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TIPOS_CUENTA } from "@/components/cuentas/tipos";
import { useT } from "@/lib/i18n";
import { cuentas, type Cuenta } from "@/lib/mock-data";

// El ADM gestiona telefonía SIP, chat y videollamada; WhatsApp, SMS y Email
// siguen fuera de alcance por ahora.
const cuentasGestionadas = cuentas.filter((c) =>
  TIPOS_CUENTA.some((x) => x.value === c.tipo)
);

export default function CuentasPage() {
  const t = useT();
  const columns = useMemo<MRT_ColumnDef<Cuenta>[]>(
    () => [
      {
        accessorKey: "nombre",
        header: t("common.comunes.nombre"),
        Cell: ({ row }) => {
          const Icono = TIPOS_CUENTA.find((x) => x.value === row.original.tipo)?.icon;
          return (
            <Link
              href={`/cuentas/${row.original.id}`}
              className="flex w-fit items-center gap-2 font-medium hover:underline"
            >
              {Icono && <Icono className="size-4 text-secondary" />}
              {row.original.nombre}
            </Link>
          );
        },
      },
      {
        accessorKey: "tipo",
        header: t("cuentas.campo.tipo"),
        Cell: ({ row }) => {
          const tKey = TIPOS_CUENTA.find((x) => x.value === row.original.tipo)?.tKey;
          return <span className="text-muted-foreground">{tKey ? t(tKey) : row.original.tipo}</span>;
        },
      },
      {
        accessorKey: "identificador",
        header: t("cuentas.col.linea"),
        Cell: ({ cell }) => (
          <span className="text-muted-foreground">
            {cell.getValue<string>() || "—"}
          </span>
        ),
      },
      {
        accessorKey: "uso",
        header: t("cuentas.col.uso"),
        Cell: ({ row }) =>
          row.original.uso ? (
            <Badge variant="outline" className="font-normal">
              {t(`cuentas.uso.${row.original.uso}`)}
            </Badge>
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
      },
    ],
    [t]
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("cuentas.titulo")}
        description={t("cuentas.descripcion")}
        actions={
          <Button asChild>
            <Link href="/cuentas/nueva">
              <Plus />
              {t("cuentas.nueva")}
            </Link>
          </Button>
        }
      />

      <MitrolTable
        columns={columns}
        data={cuentasGestionadas}
        options={{
          enableRowActions: true,
          renderRowActions: ({ row }) => (
            <RowActions
              actions={[
                {
                  label: t("common.acciones.editar"),
                  href: `/cuentas/${row.original.id}`,
                },
                {
                  label: t("common.acciones.eliminar"),
                  destructive: true,
                  separatorBefore: true,
                },
              ]}
            />
          ),
        }}
      />
    </div>
  );
}
