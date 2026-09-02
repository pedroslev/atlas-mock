"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

// Regiones de despliegue (base Global). El código de país lo define
// desarrollo (ADR-BD-001), pero el alta de una región (ej. un despliegue
// dedicado por cliente) se hace desde acá — mismo alcance que ya tiene
// zeus-front, este mock había quedado desactualizado tratándola como
// solo-lectura.
export default function RegionesPage() {
  const t = useT();
  const columns = useMemo<MRT_ColumnDef<Region>[]>(
    () => [
      {
        accessorKey: "code",
        header: t("admin.regiones.col.codigo"),
        Cell: ({ row }) => (
          <Badge variant={regionBadgeVariant(row.original.code)}>
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
        accessorKey: "regionUrl",
        header: t("admin.regiones.col.url"),
        Cell: ({ cell }) => (
          <span className="font-mono text-xs">{cell.getValue<string>()}</span>
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
        actions={
          <Button asChild>
            <Link href="/admin/regiones/nueva">
              <Plus />
              {t("admin.regiones.nueva")}
            </Link>
          </Button>
        }
      />
      <MitrolTable columns={columns} data={regions} />
    </div>
  );
}
