"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { RowActions } from "@/components/data-table/row-actions";
import { MitrolTable, type MRT_ColumnDef } from "@/components/data-table/mitrol-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScopeBadge } from "@/components/admin/staff/scope-badge";
import { type PermissionGroup } from "@/lib/mock-staff";
import { staffActions, useStaffStore } from "@/lib/staff-store";
import { useT } from "@/lib/i18n";

// Grupos de permisos del staff: lista, alta, edición y baja.
//
// MOCK: lee el store en memoria (lib/staff-store.ts); borrar un grupo lo saca
// de la lista y se lo quita a las personas que lo tenían (pide confirmación).
// REAL: GET /staff-groups y DELETE /staff-groups/{id} en `zeus-api`; 403 sin
// `zeus.staff.write`. La API se encarga de quitarle el grupo a cada persona.
export default function GruposPermisosPage() {
  const t = useT();
  const router = useRouter();
  const { groups, users } = useStaffStore();

  const columns = useMemo<MRT_ColumnDef<PermissionGroup>[]>(
    () => [
      {
        accessorKey: "name",
        header: t("staff.grupos.col.nombre"),
        Cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
      },
      { accessorKey: "description", header: t("staff.grupos.col.descripcion") },
      {
        id: "permisos",
        header: t("staff.grupos.col.permisos"),
        accessorFn: (g) => g.permissions.length,
        Cell: ({ row }) => (
          <Badge variant="secondary">{row.original.permissions.length}</Badge>
        ),
      },
      {
        id: "personas",
        header: t("staff.grupos.col.usuarios"),
        accessorFn: (g) => users.filter((u) => u.groupIds.includes(g.id)).length,
      },
      {
        id: "alcance",
        header: t("staff.grupos.col.alcance"),
        accessorFn: (g) => (g.defaultScope === "all" ? 0 : g.defaultScope.length),
        Cell: ({ row }) => <ScopeBadge scope={row.original.defaultScope} />,
      },
    ],
    [t, users],
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("staff.grupos.titulo")}
        description={t("staff.grupos.descripcion")}
        actions={
          <Button asChild data-testid="grupo-nuevo">
            <Link href="/admin/staff/grupos/nuevo">
              <Plus />
              {t("staff.grupos.nuevo")}
            </Link>
          </Button>
        }
      />
      <MitrolTable
        columns={columns}
        data={groups}
        options={{
          enableRowActions: true,
          muiTableBodyRowProps: ({ row }) => ({
            "data-testid": `grupo-fila-${row.original.id}`,
            onClick: () => router.push(`/admin/staff/grupos/${row.original.id}`),
            sx: { cursor: "pointer" },
          }),
          renderRowActions: ({ row }) => (
            <RowActions
              actions={[
                {
                  label: t("common.acciones.eliminar"),
                  destructive: true,
                  confirmDescription: t("staff.grupos.eliminarDescripcion", {
                    nombre: row.original.name,
                  }),
                  onSelect: () => staffActions.deleteGroup(row.original.id),
                },
              ]}
            />
          ),
        }}
      />
    </div>
  );
}
