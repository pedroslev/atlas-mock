"use client";

import { useMemo, useState } from "react";
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
import {
  organizations as organizacionesIniciales,
  regionBadgeVariant,
  getRegion,
  countTenantContacts,
  type Organization,
} from "@/lib/mock-admin";
import { useT } from "@/lib/i18n";

// Listado de tenants (organizations de la base Global) — ABM núcleo de Fase 0.
// Esta app es CROSS-tenant: mostrar varias empresas cliente es el punto (ver
// fronted/README.md §3). Estado local, sin persistencia (PRODUCT.md).
export default function TenantsPage() {
  const t = useT();
  const [orgs, setOrgs] = useState<Organization[]>(organizacionesIniciales);

  const columns = useMemo<MRT_ColumnDef<Organization>[]>(
    () => [
      {
        accessorKey: "name",
        header: t("admin.clientes.col.cliente"),
        Cell: ({ row }) => (
          <span className="font-medium">{row.original.name}</span>
        ),
      },
      {
        id: "region",
        header: t("admin.campos.region"),
        accessorFn: (org) => getRegion(org.regionId)?.code ?? "—",
        Cell: ({ row }) => {
          const region = getRegion(row.original.regionId);
          if (!region) return <span className="text-muted-foreground">—</span>;
          return (
            <Badge variant={regionBadgeVariant[region.code]}>
              {region.code}
            </Badge>
          );
        },
      },
      {
        id: "estado",
        header: t("common.comunes.estado"),
        accessorFn: (org) =>
          org.active ? t("common.comunes.activo") : t("common.comunes.inactivo"),
        Cell: ({ row }) =>
          row.original.active ? (
            <Badge variant="success">{t("common.comunes.activo")}</Badge>
          ) : (
            <Badge variant="neutral">{t("common.comunes.inactivo")}</Badge>
          ),
      },
      {
        id: "contactos",
        header: t("admin.clientes.col.contactos"),
        accessorFn: (org) => countTenantContacts(org.tenantId),
        Cell: ({ row }) => (
          <span className="tabular-nums text-muted-foreground">
            {countTenantContacts(row.original.tenantId)}
          </span>
        ),
      },
    ],
    [t]
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("admin.clientes.titulo")}
        description={t("admin.clientes.descripcion")}
        actions={
          <Button asChild>
            <Link href="/admin/tenants/nuevo">
              <Plus />
              {t("admin.clientes.onboarding")}
            </Link>
          </Button>
        }
      />

      <MitrolTable
        columns={columns}
        data={orgs}
        options={{
          enableRowActions: true,
          renderRowActions: ({ row }) => (
            <RowActions
              actions={[
                {
                  label: t("admin.clientes.accion.verDetalle"),
                  href: `/admin/tenants/${row.original.tenantId}`,
                },
                {
                  label: row.original.active
                    ? t("admin.clientes.accion.desactivar")
                    : t("admin.clientes.accion.activar"),
                  onSelect: () =>
                    setOrgs((prev) =>
                      prev.map((o) =>
                        o.tenantId === row.original.tenantId
                          ? { ...o, active: !o.active }
                          : o
                      )
                    ),
                },
                {
                  label: t("common.acciones.eliminar"),
                  destructive: true,
                  separatorBefore: true,
                  confirmDescription: t("admin.clientes.eliminarDescripcion", {
                    nombre: row.original.name,
                  }),
                  onSelect: () =>
                    setOrgs((prev) =>
                      prev.filter((o) => o.tenantId !== row.original.tenantId)
                    ),
                },
              ]}
            />
          ),
        }}
      />
    </div>
  );
}
