"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Phone, Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { RowActions } from "@/components/data-table/row-actions";
import {
  MitrolTable,
  type MRT_ColumnDef,
} from "@/components/data-table/mitrol-table";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n";
import { cuentas, type Cuenta } from "@/lib/mock-data";

// Fase 0: el ADM de cuentas solo gestiona cuentas telefónicas — los demás
// canales quedan fuera de alcance por ahora (feedback 2026-07-16).
const cuentasTelefonicas = cuentas.filter((c) => c.tipo === "Llamada");

export default function CuentasPage() {
  const t = useT();
  const columns = useMemo<MRT_ColumnDef<Cuenta>[]>(
    () => [
      {
        accessorKey: "nombre",
        header: t("common.comunes.nombre"),
        Cell: ({ row }) => (
          <Link
            href={`/cuentas/${row.original.id}`}
            className="flex w-fit items-center gap-2 font-medium hover:underline"
          >
            <Phone className="size-4 text-secondary" />
            {row.original.nombre}
          </Link>
        ),
      },
      {
        accessorKey: "identificador",
        header: t("cuentas.col.linea"),
        Cell: ({ cell }) => (
          <span className="text-muted-foreground">
            {cell.getValue<string>()}
          </span>
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
        data={cuentasTelefonicas}
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
