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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PermissionMatrix } from "@/components/admin/staff/permission-matrix";
import { ScopePicker } from "@/components/admin/staff/scope-picker";
import { getGroup, withImpliedRead, type ClusterScope } from "@/lib/mock-staff";
import { useT } from "@/lib/i18n";

// Alta/edición de un grupo de permisos: nombre, descripción, matriz de
// permisos por área y alcance por defecto.
//
// MOCK: no persiste; al guardar muestra la confirmación.
// REAL (`zeus-api`): POST /staff-groups y PUT /staff-groups/{id} con
// { name, description, permissions, defaultScope }. Errores: 409 si el nombre
// ya existe, 422 `unknown_permission` / `unknown_cluster`, 403 sin
// `zeus.staff.write`. Borrar un grupo con personas asignadas se las quita.
export function PermissionGroupEditor({ groupId }: { groupId?: string }) {
  const t = useT();
  const router = useRouter();
  const group = groupId ? getGroup(groupId) : undefined;

  const [name, setName] = useState(group?.name ?? "");
  const [description, setDescription] = useState(group?.description ?? "");
  const [permissions, setPermissions] = useState<string[]>(group?.permissions ?? []);
  const [scope, setScope] = useState<ClusterScope>(group?.defaultScope ?? "all");
  const [done, setDone] = useState(false);

  const canSave = name.trim().length > 0 && permissions.length > 0;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={group ? t("staff.grupos.editarTitulo", { nombre: group.name }) : t("staff.grupos.nuevoTitulo")}
        description={t("staff.grupos.nuevoDescripcion")}
        backHref="/admin/staff/grupos"
      />

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>{t("staff.grupos.form.datos")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="grupo-nombre">{t("staff.grupos.form.nombre")}</Label>
            <Input id="grupo-nombre" data-testid="grupo-nombre" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="grupo-descripcion">{t("staff.grupos.form.descripcion")}</Label>
            <Textarea id="grupo-descripcion" data-testid="grupo-descripcion" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card className="max-w-3xl">
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

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>{t("staff.grupos.form.alcance")}</CardTitle>
        </CardHeader>
        <CardContent>
          <ScopePicker value={scope} onChange={setScope} testIdPrefix="grupo-alcance" />
        </CardContent>
      </Card>

      <div className="flex items-center gap-2">
        <Button variant="outline" asChild>
          <Link href="/admin/staff/grupos">{t("staff.form.cancelar")}</Link>
        </Button>
        <Button data-testid="grupo-guardar" disabled={!canSave} onClick={() => setDone(true)}>
          {t(group ? "staff.grupos.form.guardar" : "staff.grupos.form.crear")}
        </Button>
      </div>

      <Dialog open={done} onOpenChange={(open) => !open && router.push("/admin/staff/grupos")}>
        <DialogContent data-testid="grupo-confirmacion">
          <DialogHeader>
            <DialogTitle>{t("staff.grupos.form.guardadoTitulo")}</DialogTitle>
            <DialogDescription>{t("staff.grupos.form.guardadoDescripcion", { nombre: name })}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button data-testid="grupo-confirmacion-volver" onClick={() => router.push("/admin/staff/grupos")}>
              {t("staff.grupos.form.volver")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
