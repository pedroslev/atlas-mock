"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { RowActions } from "@/components/data-table/row-actions";
import { MitrolTable, type MRT_ColumnDef } from "@/components/data-table/mitrol-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  type PermissionGroup,
  type StaffUser,
} from "@/lib/mock-staff";
import { staffActions, useStaffStore, type StaffTab } from "@/lib/staff-store";
import { useT } from "@/lib/i18n";

// Control de acceso del staff de Mitrol a Zeus, en una sola pantalla con dos
// pestañas (mismo patrón que /clasificaciones): "Personas" (traídas del
// directorio, con su estado en Zeus) y "Grupos de permisos". El alta/edición de
// cada una es una pantalla de detalle (/admin/staff/[id], /admin/staff/grupos/[id]).
//
// MOCK: personas y grupos salen del store en memoria (lib/staff-store.ts), así
// que lo que se hace en los detalles se ve acá al instante; "Deshabilitar" y
// borrar un grupo cambian ese store (borrar un grupo se lo quita a las
// personas). Se pierde al recargar la página.
// REAL (`zeus-api`): GET /staff-users devuelve solo las personas ACTIVAS del
// directorio LDAP de Mitrol en cada sincronización (solo lectura), con su
// estado en Zeus. Quien deja de estar activo en el directorio desaparece de la
// lista: el job de sincronización revoca su acceso en el realm `mitrol`.
// Deshabilitar = POST /staff-users/{directoryId}/disable. GET /staff-groups y
// DELETE /staff-groups/{id} para los grupos (la API le quita el grupo a cada
// persona). Listar requiere `zeus.staff.read`; modificar `zeus.staff.write`
// (403 si falta); 404 si la persona o el grupo no existen.
export default function StaffPage() {
  const t = useT();
  const { users, groups, tab } = useStaffStore();
  const [efectivosDe, setEfectivosDe] = useState<StaffUser | null>(null);

  const columnasPersonas = useMemo<MRT_ColumnDef<StaffUser>[]>(() => {
    const groupName = (id: string) => groups.find((g) => g.id === id)?.name;
    return [
      {
        accessorKey: "name",
        header: t("staff.col.nombre"),
        Cell: ({ row }) => (
          <Link
            href={`/admin/staff/${row.original.directoryId}`}
            data-testid={`staff-persona-${row.original.directoryId}`}
            className="font-medium hover:underline"
          >
            {row.original.name}
          </Link>
        ),
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
  }, [t, groups]);

  const columnasGrupos = useMemo<MRT_ColumnDef<PermissionGroup>[]>(
    () => [
      {
        accessorKey: "name",
        header: t("staff.grupos.col.nombre"),
        Cell: ({ row }) => (
          <Link
            href={`/admin/staff/grupos/${row.original.id}`}
            data-testid={`grupo-${row.original.id}`}
            className="font-medium hover:underline"
          >
            {row.original.name}
          </Link>
        ),
      },
      {
        accessorKey: "description",
        header: t("staff.grupos.col.descripcion"),
        Cell: ({ cell }) => (
          <span className="text-muted-foreground">{cell.getValue<string>()}</span>
        ),
      },
      {
        id: "permisos",
        header: t("staff.grupos.col.permisos"),
        accessorFn: (g) => g.permissions.length,
      },
      {
        id: "personas",
        header: t("staff.grupos.col.usuarios"),
        accessorFn: (g) => users.filter((u) => u.groupIds.includes(g.id)).length,
      },
      {
        id: "alcance",
        header: t("staff.grupos.col.alcance"),
        enableColumnFilter: false,
        accessorFn: (g) => (g.defaultScope === "all" ? 0 : g.defaultScope.length),
        Cell: ({ row }) => <ScopeBadge scope={row.original.defaultScope} />,
      },
    ],
    [t, users],
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("staff.titulo")} description={t("staff.descripcion")} />

      {/* Una sola tabla por vez; la acción de alta de cada pestaña queda a la
          derecha de la lista de tabs, como en /clasificaciones. */}
      <Tabs
        value={tab}
        onValueChange={(v) => staffActions.setTab(v as StaffTab)}
        className="gap-4"
      >
        <div className="flex items-center justify-between gap-3">
          <TabsList>
            <TabsTrigger value="personas" data-testid="staff-tab-personas">
              {t("staff.tab.personas")}
            </TabsTrigger>
            <TabsTrigger value="grupos" data-testid="staff-tab-grupos">
              {t("staff.tab.grupos")}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="personas" className="contents">
            <Button asChild data-testid="staff-habilitar-persona">
              <Link href="/admin/staff/habilitar">
                <Plus />
                {t("staff.habilitarPersona")}
              </Link>
            </Button>
          </TabsContent>
          <TabsContent value="grupos" className="contents">
            <Button asChild data-testid="grupo-nuevo">
              <Link href="/admin/staff/grupos/nuevo">
                <Plus />
                {t("staff.grupos.nuevo")}
              </Link>
            </Button>
          </TabsContent>
        </div>

        <TabsContent value="personas">
          <MitrolTable
            columns={columnasPersonas}
            data={users}
            options={{
              enableRowActions: true,
              renderRowActions: ({ row }) => {
                const u = row.original;
                const habilitable = u.status === "no-habilitado" || u.status === "deshabilitado";
                const deshabilitable = u.status === "invitado" || u.status === "activo";
                return (
                  <RowActions
                    actions={[
                      ...(habilitable
                        ? [{ label: t("staff.accion.habilitar"), href: `/admin/staff/${u.directoryId}` }]
                        : []),
                      ...(u.status === "invitado" || u.status === "activo"
                        ? [{ label: t("staff.accion.editar"), href: `/admin/staff/${u.directoryId}` }]
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
                              onSelect: () =>
                                staffActions.updateUser(u.directoryId, { status: "deshabilitado" }),
                            },
                          ]
                        : []),
                    ]}
                  />
                );
              },
            }}
          />
        </TabsContent>

        <TabsContent value="grupos">
          <MitrolTable
            columns={columnasGrupos}
            data={groups}
            options={{
              enableRowActions: true,
              renderRowActions: ({ row }) => (
                <RowActions
                  actions={[
                    {
                      label: t("common.acciones.editar"),
                      href: `/admin/staff/grupos/${row.original.id}`,
                    },
                    {
                      label: t("common.acciones.eliminar"),
                      destructive: true,
                      separatorBefore: true,
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
        </TabsContent>
      </Tabs>

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
