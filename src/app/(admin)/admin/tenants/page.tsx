"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  organizations as organizacionesIniciales,
  regionBadgeVariant,
  getRegion,
  countTenantContacts,
  type Organization,
} from "@/lib/mock-admin";
import { getCountry } from "@/lib/countries";
import { useT } from "@/lib/i18n";

// Listado de tenants (organizations de la base Global) — ABM núcleo de Fase 0.
// Esta app es CROSS-tenant: mostrar varias empresas cliente es el punto (ver
// fronted/README.md §3). Estado local, sin persistencia (PRODUCT.md).
export default function TenantsPage() {
  const t = useT();
  const router = useRouter();
  const [orgs, setOrgs] = useState<Organization[]>(organizacionesIniciales);
  const [impersonando, setImpersonando] = useState<Organization | null>(null);
  const [observando, setObservando] = useState<Organization | null>(null);

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
        id: "pais",
        header: t("admin.campos.pais"),
        accessorFn: (org) => getCountry(org.countryId)?.nombre ?? "—",
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
          // Clickear la fila lleva al detalle del cliente — reemplaza al
          // "Ver detalle" que antes vivía en el menú de tres puntos (a
          // pedido). El botón de tres puntos hace stopPropagation (ver
          // row-actions.tsx) para no disparar esta navegación al abrir el menú.
          muiTableBodyRowProps: ({ row }) => ({
            onClick: () => router.push(`/admin/tenants/${row.original.tenantId}`),
            sx: { cursor: "pointer" },
          }),
          renderRowActions: ({ row }) => (
            <RowActions
              actions={[
                {
                  label: t("admin.clientes.accion.impersonar"),
                  onSelect: () => setImpersonando(row.original),
                },
                {
                  label: t("admin.clientes.accion.observabilidad"),
                  onSelect: () => setObservando(row.original),
                },
                // A pedido: se retira "Eliminar" (la baja de un tenant es
                // desactivación, no borrado — ver ADR-BD-001 enmienda
                // 2026-08-11) y se retira "Desactivar" de este menú rápido;
                // "Activar" se mantiene para poder reactivar un cliente
                // inactivo sin entrar al detalle.
                ...(row.original.active
                  ? []
                  : [
                      {
                        label: t("admin.clientes.accion.activar"),
                        onSelect: () =>
                          setOrgs((prev) =>
                            prev.map((o) =>
                              o.tenantId === row.original.tenantId
                                ? { ...o, active: true }
                                : o
                            )
                          ),
                      },
                    ]),
              ]}
            />
          ),
        }}
      />

      <Dialog
        open={impersonando !== null}
        onOpenChange={(open) => !open && setImpersonando(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t("admin.clientes.impersonar.titulo", {
                nombre: impersonando?.name ?? "",
              })}
            </DialogTitle>
            <DialogDescription>
              {t("admin.clientes.impersonar.descripcion")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setImpersonando(null)}>
              {t("admin.clientes.impersonar.salir")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={observando !== null}
        onOpenChange={(open) => !open && setObservando(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t("admin.soporte.observabilidad.dialogTitulo", {
                nombre: observando?.name ?? "",
              })}
            </DialogTitle>
            <DialogDescription>
              {t("admin.soporte.observabilidad.descripcion")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setObservando(null)}>
              {t("common.acciones.cerrar")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
