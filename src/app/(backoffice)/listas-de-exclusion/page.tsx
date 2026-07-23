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
import { Badge } from "@/components/ui/badge";
import { listasExclusion, type ListaExclusion } from "@/lib/mock-data";
import { useT } from "@/lib/i18n";

export default function ListasDeExclusionPage() {
  const t = useT();
  const columns = useMemo<MRT_ColumnDef<ListaExclusion>[]>(
    () => [
      {
        accessorKey: "nombre",
        header: t("common.comunes.nombre"),
        Cell: ({ row }) => (
          <Link
            href={`/listas-de-exclusion/${row.original.id}`}
            className="font-medium hover:underline"
          >
            {row.original.nombre}
          </Link>
        ),
      },
      {
        accessorKey: "tipo",
        header: t("listas.col.tipo"),
        filterVariant: "select",
        Cell: ({ row }) => <Badge variant="outline">{row.original.tipo}</Badge>,
      },
      {
        id: "contactos",
        header: t("listas.col.contactos"),
        accessorFn: (lista) => lista.contactos.length,
        Cell: ({ cell }) => (
          <span className="text-muted-foreground">
            {cell.getValue<number>().toLocaleString("es-AR")}
          </span>
        ),
      },
    ],
    [t]
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("common.nav.listasExclusion")}
        description={t("listas.descripcion")}
        actions={
          <Button asChild>
            <Link href="/listas-de-exclusion/nueva">
              <Plus />
              {t("listas.nuevaLista")}
            </Link>
          </Button>
        }
      />

      <MitrolTable
        columns={columns}
        data={listasExclusion}
        options={{
          enableRowActions: true,
          renderRowActions: ({ row }) => (
            <RowActions
              actions={[
                {
                  label: t("common.acciones.editar"),
                  href: `/listas-de-exclusion/${row.original.id}`,
                },
                { label: t("listas.descargar") },
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
