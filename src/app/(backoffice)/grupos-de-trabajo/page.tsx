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
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n";
import { gruposTrabajo, type GrupoTrabajo } from "@/lib/mock-data";

export default function GruposDeTrabajoPage() {
  const t = useT();
  const columns = useMemo<MRT_ColumnDef<GrupoTrabajo>[]>(
    () => [
      {
        accessorKey: "nombre",
        header: t("common.comunes.nombre"),
        Cell: ({ row }) => (
          <Link
            href={`/grupos-de-trabajo/${row.original.id}`}
            className="font-medium hover:underline"
          >
            {row.original.nombre}
          </Link>
        ),
      },
      {
        accessorKey: "descripcion",
        header: t("common.comunes.descripcion"),
        Cell: ({ cell }) => (
          <span className="text-muted-foreground">
            {cell.getValue<string>() ?? "—"}
          </span>
        ),
      },
      {
        id: "usuarios",
        header: t("common.nav.usuarios"),
        accessorFn: (grupo) => grupo.usuarioIds.length,
        Cell: ({ cell }) => (
          <span className="text-muted-foreground">
            {cell.getValue<number>()}
          </span>
        ),
      },
      {
        id: "auxiliares",
        header: t("grupos.col.auxiliares"),
        accessorFn: (grupo) => grupo.estadosAuxiliares.length,
        Cell: ({ cell }) => (
          <span className="text-muted-foreground">
            {cell.getValue<number>()}
          </span>
        ),
      },
    ],
    [t]
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("common.nav.gruposRoles")}
        description={t("grupos.descripcion")}
        actions={
          <Button asChild>
            <Link href="/grupos-de-trabajo/nuevo">
              <Plus />
              {t("grupos.nuevo")}
            </Link>
          </Button>
        }
      />

      <MitrolTable
        columns={columns}
        data={gruposTrabajo}
        options={{
          enableRowActions: true,
          renderRowActions: ({ row }) => (
            <RowActions
              actions={[
                {
                  label: t("common.acciones.editar"),
                  href: `/grupos-de-trabajo/${row.original.id}`,
                },
                { label: t("grupos.acciones.duplicar") },
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
