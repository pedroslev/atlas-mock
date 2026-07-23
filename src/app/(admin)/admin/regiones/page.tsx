"use client";

import { useMemo } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import {
  MitrolTable,
  type MRT_ColumnDef,
} from "@/components/data-table/mitrol-table";
import {
  regions,
  regionBadgeVariant,
  regionLabel,
  countTenantsByRegion,
  type Region,
} from "@/lib/mock-admin";
import { useT } from "@/lib/i18n";

// Regiones de despliegue (base Global). El code lo define desarrollo
// (ADR-BD-001), por eso es una referencia de solo lectura: acá solo se
// consulta cuántos tenants corren en cada región.
export default function RegionesPage() {
  const t = useT();
  const columns = useMemo<MRT_ColumnDef<Region>[]>(
    () => [
      {
        accessorKey: "code",
        header: t("admin.regiones.col.codigo"),
        Cell: ({ row }) => (
          <Badge variant={regionBadgeVariant[row.original.code]}>
            {row.original.code}
          </Badge>
        ),
      },
      {
        id: "label",
        header: t("admin.campos.region"),
        accessorFn: (region) => regionLabel(region, t),
        Cell: ({ row }) => (
          <span className="font-medium">{regionLabel(row.original, t)}</span>
        ),
      },
      {
        id: "tenants",
        header: t("admin.clientes.titulo"),
        accessorFn: (region) => countTenantsByRegion(region.id),
        Cell: ({ row }) => (
          <span className="tabular-nums text-muted-foreground">
            {countTenantsByRegion(row.original.id)}
          </span>
        ),
      },
    ],
    [t]
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("admin.regiones.titulo")}
        description={t("admin.regiones.descripcion")}
      />
      <MitrolTable columns={columns} data={regions} />
    </div>
  );
}
