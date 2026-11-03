"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { RowActions } from "@/components/data-table/row-actions";
import { MitrolTable, type MRT_ColumnDef } from "@/components/data-table/mitrol-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScopeBadge } from "@/components/admin/staff/scope-badge";
import { EffectivePermissionsSummary } from "@/components/admin/staff/effective-permissions";
import {
  effectivePermissions,
  staffStatusBadge,
  type StaffUser,
} from "@/lib/mock-staff";
import { staffActions, useStaffStore } from "@/lib/staff-store";
import { useT } from "@/lib/i18n";

// Usuarios del staff de Mitrol: personas traídas del directorio y su estado en
// Zeus. Filtros por estado y por grupo, búsqueda por nombre/mail (global).
//
// MOCK: personas y grupos salen del store en memoria (lib/staff-store.ts), así
// que lo que se hace en Grupos y en el editor se ve acá al instante;
// "Deshabilitar" cambia el estado en memoria.
// REAL (`zeus-api`): GET /staff-users devuelve las personas activas del
// directorio LDAP de Mitrol (sincronización en solo lectura) con su estado en
// Zeus. Si alguien deja de estar activo en el directorio, la próxima
// sincronización lo pasa a "Deshabilitado por baja en el directorio". Deshabilitar
// = POST /staff-users/{directoryId}/disable (403 sin `zeus.staff.write`; 404 si
// no existe). Ver también `zeus.staff.read` para listar.
export default function StaffPage() {
  const t = useT();
  const router = useRouter();
  const { users, groups } = useStaffStore();
  const [efectivosDe, setEfectivosDe] = useState<StaffUser | null>(null);

  const columns = useMemo<MRT_ColumnDef<StaffUser>[]>(
    () => {
      const groupName = (id: string) => groups.find((g) => g.id === id)?.name;
      return [
      {
        accessorKey: "name",
        header: t("staff.col.nombre"),
        Cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
      },
      {
        accessorKey: "email",
        header: t("staff.col.mail"),
        Cell: ({ cell }) => (
          <span className="text-muted-foreground">{cell.getValue<string>()}</span>
        ),
      },
      {
        id: "estado",
        header: t("staff.col.estado"),
        accessorFn: (u) => t(`staff.estado.${u.status}`),
        filterVariant: "select",
        Cell: ({ row }) => (
          <Badge
            variant={staffStatusBadge[row.original.status]}
            data-testid={`staff-estado-${row.original.directoryId}`}
          >
            {t(`staff.estado.${row.original.status}`)}
          </Badge>
        ),
      },
      {
        id: "grupos",
        header: t("staff.col.grupos"),
        accessorFn: (u) => u.groupIds.map(groupName).join(", "),
        filterVariant: "select",
        filterSelectOptions: groups.map((g) => g.name),
        // Un usuario puede tener varios grupos: el filtro busca dentro del texto.
        filterFn: "includesString",
        Cell: ({ row }) =>
          row.original.groupIds.length === 0 ? (
            <span className="text-muted-foreground">{t("staff.sinGrupos")}</span>
          ) : (
            <div className="flex flex-wrap gap-1">
              {row.original.groupIds.map((id) => (
                <Badge key={id} variant="secondary">
                  {groupName(id)}
                </Badge>
              ))}
            </div>
          ),
      },
      {
        id: "alcance",
        header: t("staff.col.alcance"),
        enableColumnFilter: false,
        accessorFn: (u) => (u.scope === "all" ? 0 : u.scope.length),
        Cell: ({ row }) =>
          row.original.groupIds.length === 0 ? (
            <span className="text-muted-foreground">{t("staff.sinGrupos")}</span>
          ) : (
            <ScopeBadge scope={row.original.scope} />
          ),
      },
      {
        accessorKey: "lastSync",
        header: t("staff.col.sync"),
        enableColumnFilter: false,
        Cell: ({ cell }) => (
          <span className="tabular-nums text-muted-foreground">{cell.getValue<string>()}</span>
        ),
      },
    ];
    },
    [t, groups],
  );

  // Pasa a una persona a "Deshabilitado" (decisión manual de un admin).
  function deshabilitar(directoryId: string) {
    staffActions.updateUser(directoryId, { status: "deshabilitado" });
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("staff.titulo")}
        description={t("staff.descripcion")}
        actions={
          <Button asChild data-testid="staff-habilitar-persona">
            <Link href="/admin/staff/habilitar">
              <Plus />
              {t("staff.habilitarPersona")}
            </Link>
          </Button>
        }
      />

      <MitrolTable
        columns={columns}
        data={users}
        options={{
          enableRowActions: true,
          muiTableBodyRowProps: ({ row }) => ({
            "data-testid": `staff-fila-${row.original.directoryId}`,
            onClick: () => router.push(`/admin/staff/${row.original.directoryId}`),
            sx: { cursor: "pointer" },
          }),
          renderRowActions: ({ row }) => {
            const u = row.original;
            const habilitable = u.status === "no-habilitado" || u.status === "deshabilitado";
            const deshabilitable = u.status === "invitado" || u.status === "activo";
            return (
              <RowActions
                actions={[
                  // Quien fue dado de baja en el directorio no se puede volver a
                  // habilitar desde Zeus: solo vuelve si el directorio lo reactiva.
                  ...(habilitable
                    ? [{ label: t("staff.accion.habilitar"), href: `/admin/staff/${u.directoryId}` }]
                    : []),
                  ...(u.status !== "no-habilitado"
                    ? [{ label: t("staff.accion.efectivos"), onSelect: () => setEfectivosDe(u) }]
                    : []),
                  ...(deshabilitable
                    ? [
                        {
                          label: t("staff.accion.deshabilitar"),
                          destructive: true,
                          separatorBefore: true,
                          confirmDescription: t("staff.accion.deshabilitarDescripcion", {
                            nombre: u.name,
                          }),
                          onSelect: () => deshabilitar(u.directoryId),
                        },
                      ]
                    : []),
                ]}
              />
            );
          },
        }}
      />

      <Dialog open={efectivosDe !== null} onOpenChange={(open) => !open && setEfectivosDe(null)}>
        <DialogContent data-testid="staff-efectivos-dialogo" className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {t("staff.efectivos.dialogoTitulo", { nombre: efectivosDe?.name ?? "" })}
            </DialogTitle>
            <DialogDescription>{t("staff.efectivos.descripcion")}</DialogDescription>
          </DialogHeader>
          {efectivosDe && (
            <EffectivePermissionsSummary
              effective={effectivePermissions(
                groups,
                efectivosDe.groupIds,
                efectivosDe.extraPermissions,
                efectivosDe.scope,
              )}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
