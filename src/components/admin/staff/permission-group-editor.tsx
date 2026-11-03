"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MembersCard } from "@/components/admin/staff/members-card";
import { PermissionMatrix } from "@/components/admin/staff/permission-matrix";
import { ScopePicker } from "@/components/admin/staff/scope-picker";
import { withImpliedRead, type ClusterScope } from "@/lib/mock-staff";
import { staffActions, useStaffStore } from "@/lib/staff-store";
import { useT } from "@/lib/i18n";

// Detalle de un grupo de permisos (alta y edición), misma estructura que
// /clasificaciones/[id]: datos a la izquierda; a la derecha los permisos y las
// personas del grupo (agregar con búsqueda, quitar con X sin borrar a la
// persona). Cancelar/Confirmar en el encabezado.
//
// MOCK: edita un borrador local; "Confirmar" lo guarda en el store en memoria
// (lib/staff-store.ts), con lo que el grupo y sus personas se ven al instante
// en la lista, en el alta de personas y en los permisos efectivos. Se pierde al
// recargar la página.
// REAL (`zeus-api`): POST /staff-groups y PUT /staff-groups/{id} con
// { name, description, permissions, defaultScope } y la membresía (personas
// del grupo). Los permisos efectivos de cada persona son grupos ∪ extras.
// Errores: 409 nombre repetido, 422 `unknown_permission` / `unknown_cluster`,
// 404 persona no habilitada, 403 sin `zeus.staff.write`. Quitar a una persona
// del grupo no la borra ni la deshabilita.
export function PermissionGroupEditor({ groupId }: { groupId?: string }) {
  const t = useT();
  const router = useRouter();
  const { groups, users } = useStaffStore();
  const group = groupId ? groups.find((g) => g.id === groupId) : undefined;

  const [name, setName] = useState(group?.name ?? "");
  const [description, setDescription] = useState(group?.description ?? "");
  const [permissions, setPermissions] = useState<string[]>(group?.permissions ?? []);
  const [scope, setScope] = useState<ClusterScope>(group?.defaultScope ?? "all");
  const [memberIds, setMemberIds] = useState<string[]>(
    groupId ? users.filter((u) => u.groupIds.includes(groupId)).map((u) => u.directoryId) : [],
  );

  // Un grupo creado en la sesión no existe tras recargar la página.
  if (groupId && !group) {
    return <PageHeader title={t("staff.grupos.noEncontrado")} backHref="/admin/staff" />;
  }

  const toOption = (u: (typeof users)[number]) => ({ id: u.directoryId, name: u.name, detail: u.email });
  // Solo personas ya habilitadas (no las no habilitadas ni las deshabilitadas).
  const habilitadas = users.filter((u) => u.status === "invitado" || u.status === "activo");
  const canSave = name.trim().length > 0 && permissions.length > 0;

  // Guarda el grupo y su membresía en el store y vuelve a la pestaña Grupos.
  function confirmar() {
    staffActions.saveGroup(
      groupId,
      { name: name.trim(), description, permissions, defaultScope: scope },
      memberIds,
    );
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

          <MembersCard
            title={t("staff.grupos.personas.titulo")}
            description={t("staff.grupos.personas.descripcion")}
            members={users.filter((u) => memberIds.includes(u.directoryId)).map(toOption)}
            available={habilitadas.filter((u) => !memberIds.includes(u.directoryId)).map(toOption)}
            onAdd={(id) => setMemberIds((prev) => [...prev, id])}
            onRemove={(id) => setMemberIds((prev) => prev.filter((m) => m !== id))}
            testIdPrefix="grupo-persona"
            texts={{
              agregar: t("staff.miembros.agregar"),
              buscar: t("staff.miembros.buscar"),
              sinDisponibles: t("staff.grupos.personas.sinDisponibles"),
              vacio: t("staff.grupos.personas.vacio"),
              quitar: t("staff.miembros.quitar"),
              quitarAria: (nombre) => t("staff.miembros.quitarAria", { nombre }),
            }}
          />
        </div>
      </div>
    </div>
  );
}
