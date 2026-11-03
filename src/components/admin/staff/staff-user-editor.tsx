"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PermissionMatrix } from "@/components/admin/staff/permission-matrix";
import { ScopePicker } from "@/components/admin/staff/scope-picker";
import { EffectivePermissionsSummary } from "@/components/admin/staff/effective-permissions";
import { effectivePermissions, type ClusterScope } from "@/lib/mock-staff";
import { staffActions, useStaffStore } from "@/lib/staff-store";
import { useT } from "@/lib/i18n";

// Habilitar (sin `directoryId`) o editar (con `directoryId`) a una persona del
// staff. La persona SIEMPRE se elige de la lista del directorio; el mail se
// muestra de solo lectura.
//
// MOCK: lee personas y grupos del store en memoria (lib/staff-store.ts), así
// que los grupos que se definen en "Grupos de permisos" aparecen acá al
// instante. Al confirmar guarda en ese store (la persona pasa a Invitada) y
// muestra el aviso de mail enviado; se pierde al recargar la página.
// REAL (`zeus-api`):
//  - La lista sale de la sincronización en solo lectura con el LDAP de Mitrol.
//    La clave del usuario es el identificador inmutable del directorio, no el
//    mail.
//  - Habilitar = POST /staff-users { directoryId, groupIds, extraPermissions,
//    clusterScope }. Crea el usuario vía `identity-api` en el realm `mitrol` y
//    dispara el mail de alta para fijar la contraseña. El mail debe terminar en
//    @mitrol.net. Editar = PUT /staff-users/{directoryId}.
//  - Los permisos efectivos son grupos ∪ extras.
//  - Errores: 404 `directory_user_not_found` (no está en el directorio), 409
//    `already_enabled`, 422 `unknown_permission` / `unknown_cluster`, 403 si
//    quien llama no tiene `zeus.staff.write`.
export function StaffUserEditor({ directoryId }: { directoryId?: string }) {
  const t = useT();
  const router = useRouter();
  const editing = directoryId !== undefined;
  // Para habilitar solo se ofrecen personas aún no habilitadas.
  const { users, groups } = useStaffStore();
  const getGroup = (id: string) => groups.find((g) => g.id === id);
  const candidates = users.filter((u) => u.status === "no-habilitado");
  const [selectedId, setSelectedId] = useState<string | undefined>(directoryId);
  const person = users.find((u) => u.directoryId === selectedId);

  const [groupIds, setGroupIds] = useState<string[]>(person?.groupIds ?? []);
  const [extras, setExtras] = useState<string[]>(person?.extraPermissions ?? []);
  const [scope, setScope] = useState<ClusterScope>(person?.scope ?? "all");
  const [done, setDone] = useState(false);

  // Guarda en el store: al habilitar la persona pasa a Invitada (mail de alta
  // enviado); al editar conserva su estado.
  function confirmar() {
    if (!person) return;
    staffActions.updateUser(person.directoryId, {
      groupIds,
      extraPermissions: extras,
      scope,
      ...(editing ? {} : { status: "invitado" as const }),
    });
    setDone(true);
  }

  // Permisos que ya dan los grupos elegidos: se muestran bloqueados en extras.
  const fromGroups = groupIds.flatMap((id) => getGroup(id)?.permissions ?? []);
  const effective = effectivePermissions(groups, groupIds, extras, scope);
  const canSubmit = person !== undefined && groupIds.length > 0;

  // Alternar un grupo; al sumar el primero, el alcance arranca en el del grupo.
  function toggleGroup(id: string, checked: boolean) {
    const next = checked ? [...groupIds, id] : groupIds.filter((g) => g !== id);
    if (checked && groupIds.length === 0) setScope(getGroup(id)?.defaultScope ?? "all");
    setGroupIds(next);
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={
          editing && person
            ? t("staff.editar.titulo", { nombre: person.name })
            : t("staff.habilitar.titulo")
        }
        description={t(editing ? "staff.editar.descripcion" : "staff.habilitar.descripcion")}
        backHref="/admin/staff"
      />

      <Card className="max-w-3xl">
        <CardContent className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="staff-persona">{t("staff.form.persona")}</Label>
            {editing ? (
              <Input id="staff-persona" data-testid="staff-persona" value={person?.name ?? ""} readOnly />
            ) : (
              <Select value={selectedId} onValueChange={setSelectedId}>
                <SelectTrigger id="staff-persona" data-testid="staff-persona" className="w-full">
                  <SelectValue placeholder={t("staff.form.personaPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {candidates.map((u) => (
                    <SelectItem
                      key={u.directoryId}
                      value={u.directoryId}
                      data-testid={`staff-persona-opcion-${u.directoryId}`}
                    >
                      {u.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {!editing && (
              <p className="text-xs text-muted-foreground">{t("staff.form.personaAyuda")}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="staff-mail">{t("staff.form.mail")}</Label>
            <Input id="staff-mail" data-testid="staff-mail" value={person?.email ?? ""} readOnly disabled />
            <p className="text-xs text-muted-foreground">{t("staff.form.mailAyuda")}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>{t("staff.form.grupos")}</CardTitle>
          <p className="text-sm text-muted-foreground">{t("staff.form.gruposAyuda")}</p>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {groups.length === 0 && (
            <p className="text-sm text-muted-foreground">{t("staff.form.sinGrupos")}</p>
          )}
          {groups.map((g) => (
            <div key={g.id} className="flex items-start gap-2">
              <Checkbox
                id={`staff-grupo-${g.id}`}
                data-testid={`staff-grupo-${g.id}`}
                checked={groupIds.includes(g.id)}
                onCheckedChange={(c) => toggleGroup(g.id, c === true)}
              />
              <Label htmlFor={`staff-grupo-${g.id}`} className="flex flex-col items-start gap-0.5 font-normal">
                <span className="font-medium">{g.name}</span>
                <span className="text-xs text-muted-foreground">{g.description}</span>
              </Label>
            </div>
          ))}
          <Button variant="link" asChild className="w-fit px-0" data-testid="staff-crear-grupo">
            <Link href="/admin/staff/grupos/nuevo">{t("staff.form.crearGrupo")}</Link>
          </Button>
        </CardContent>
      </Card>

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>{t("staff.form.extras")}</CardTitle>
          <p className="text-sm text-muted-foreground">{t("staff.form.extrasAyuda")}</p>
        </CardHeader>
        <CardContent>
          <PermissionMatrix
            value={extras}
            onChange={setExtras}
            lockedKeys={fromGroups}
            testIdPrefix="staff-extra"
          />
        </CardContent>
      </Card>

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>{t("staff.form.alcance")}</CardTitle>
          <p className="text-sm text-muted-foreground">{t("staff.form.alcanceAyuda")}</p>
        </CardHeader>
        <CardContent>
          <ScopePicker value={scope} onChange={setScope} testIdPrefix="staff-alcance" />
        </CardContent>
      </Card>

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>{t("staff.efectivos.titulo")}</CardTitle>
          <p className="text-sm text-muted-foreground">{t("staff.efectivos.descripcion")}</p>
        </CardHeader>
        <CardContent>
          <EffectivePermissionsSummary effective={effective} />
        </CardContent>
      </Card>

      <div className="flex items-center gap-2">
        <Button variant="outline" asChild>
          <Link href="/admin/staff">{t("staff.form.cancelar")}</Link>
        </Button>
        <Button data-testid="staff-confirmar" disabled={!canSubmit} onClick={confirmar}>
          {t(editing ? "staff.form.guardar" : "staff.form.habilitar")}
        </Button>
      </div>

      <Dialog open={done} onOpenChange={(open) => !open && router.push("/admin/staff")}>
        <DialogContent data-testid="staff-confirmacion">
          <DialogHeader>
            <DialogTitle>{t(editing ? "staff.guardado.titulo" : "staff.enviado.titulo")}</DialogTitle>
            <DialogDescription>
              {editing
                ? t("staff.guardado.descripcion", { nombre: person?.name ?? "" })
                : t("staff.enviado.descripcion", { mail: person?.email ?? "" })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button data-testid="staff-confirmacion-volver" onClick={() => router.push("/admin/staff")}>
              {t("staff.enviado.volver")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
