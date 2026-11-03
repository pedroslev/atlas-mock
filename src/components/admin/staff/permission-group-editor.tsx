"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PermissionMatrix } from "@/components/admin/staff/permission-matrix";
import { ScopePicker } from "@/components/admin/staff/scope-picker";
import { staffStatusBadge, withImpliedRead, type RegionScope } from "@/lib/mock-staff";
import { staffActions, useStaffStore } from "@/lib/staff-store";
import { useT } from "@/lib/i18n";

// Detalle de un grupo de permisos (alta y edición), misma estructura que
// /clasificaciones/[id]: datos y alcance por región a la izquierda; a la
// derecha la matriz de permisos y las personas del grupo (solo lectura).
// Cancelar/Confirmar en el encabezado.
//
// MOCK: edita un borrador local; "Confirmar" lo guarda en el store en memoria
// (lib/staff-store.ts), con lo que el grupo se ve al instante en la lista y en
// el selector de grupo de la persona. Se pierde al recargar la página.
// REAL (`zeus-api`): POST /staff-groups y PUT /staff-groups/{id} con
// { name, description, permissions, scope }. El alcance por región vive solo
// en el grupo y lo heredan todas sus personas; los permisos efectivos de una
// persona son exactamente los de su grupo. La membresía no se edita acá: se
// asigna desde la persona (PUT /staff-users/{directoryId} { groupId }).
// Errores: 409 nombre repetido, 422 `unknown_permission` / `unknown_region`,
// 403 sin `zeus.staff.write`.
export function PermissionGroupEditor({ groupId }: { groupId?: string }) {
  const t = useT();
  const router = useRouter();
  const { groups, users } = useStaffStore();
  const group = groupId ? groups.find((g) => g.id === groupId) : undefined;

  const [name, setName] = useState(group?.name ?? "");
  const [description, setDescription] = useState(group?.description ?? "");
  const [permissions, setPermissions] = useState<string[]>(group?.permissions ?? []);
  const [scope, setScope] = useState<RegionScope>(group?.defaultScope ?? "all");
  // Un grupo creado en la sesión no existe tras recargar la página.
  if (groupId && !group) {
    return <PageHeader title={t("staff.grupos.noEncontrado")} backHref="/admin/staff" />;
  }

  // Personas que tienen este grupo (solo lectura).
  const miembros = groupId ? users.filter((u) => u.groupId === groupId) : [];
  const canSave = name.trim().length > 0 && permissions.length > 0;

  // Guarda el grupo en el store y vuelve a la pestaña Grupos.
  function confirmar() {
    staffActions.saveGroup(groupId, {
      name: name.trim(),
      description,
      permissions,
      defaultScope: scope,
    });
    router.push("/admin/staff");
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={group ? group.name : t("staff.grupos.nuevoTitulo")}
        description={t("staff.grupos.subtitulo")}
        backHref="/admin/staff"
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/admin/staff">{t("common.acciones.cancelar")}</Link>
            </Button>
            <Button data-testid="grupo-confirmar" disabled={!canSave} onClick={confirmar}>
              {t("common.acciones.confirmar")}
            </Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(280px,380px)_1fr]">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>{t("staff.grupos.form.datos")}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="grupo-nombre">{t("common.comunes.nombre")}</Label>
              <Input id="grupo-nombre" data-testid="grupo-nombre" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="grupo-descripcion">{t("common.comunes.descripcion")}</Label>
              <Textarea
                id="grupo-descripcion"
                data-testid="grupo-descripcion"
                rows={3}
                placeholder={t("common.comunes.opcional")}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>{t("staff.grupos.form.alcance")}</Label>
              <ScopePicker value={scope} onChange={setScope} testIdPrefix="grupo-alcance" />
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("staff.grupos.form.permisos")}</CardTitle>
            </CardHeader>
            <CardContent>
              <PermissionMatrix
                value={[...withImpliedRead(permissions)]}
                onChange={setPermissions}
                testIdPrefix="grupo-permiso"
              />
            </CardContent>
          </Card>

          {/* Solo lectura: asignar o cambiar el grupo se hace desde la persona. */}
          <Card>
            <CardHeader>
              <CardTitle>{t("staff.grupos.personas.titulo")}</CardTitle>
              <CardDescription>{t("staff.grupos.personas.descripcion")}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-1.5">
              {miembros.length === 0 && (
                <p className="text-sm text-muted-foreground">{t("staff.grupos.personas.vacio")}</p>
              )}
              {miembros.map((u) => (
                <div
                  key={u.directoryId}
                  data-testid={`grupo-persona-fila-${u.directoryId}`}
                  className="flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm ring-1 ring-foreground/10"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <Link
                      href={`/admin/staff/${u.directoryId}`}
                      className="truncate font-medium hover:underline"
                    >
                      {u.name}
                    </Link>
                    <span className="truncate text-muted-foreground">{u.email}</span>
                  </span>
                  <Badge variant={staffStatusBadge[u.status]}>{t(`staff.estado.${u.status}`)}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
