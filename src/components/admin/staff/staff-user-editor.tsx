"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, ChevronsUpDown } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { EffectivePermissionsSummary } from "@/components/admin/staff/effective-permissions";
import { effectivePermissions, staffStatusBadge } from "@/lib/mock-staff";
import { staffActions, useStaffStore } from "@/lib/staff-store";
import { useT } from "@/lib/i18n";

// Detalle de una persona del staff (habilitar o editar), misma estructura que
// /clasificaciones/[id]: datos a la izquierda; a la derecha el grupo de
// permisos (selección única, obligatorio) y el resumen de solo lectura de lo
// que da ese grupo (permisos y alcance por región). Siempre se abre sobre una
// persona del listado: no hay selector de personas. El nombre y el mail son
// texto, no campos. Habilitar y deshabilitar se hacen con el interruptor
// "Habilitada en Zeus" (el mismo control que el detalle de usuario de Olimpo,
// /agentes/[id]) y se aplican en el momento: prenderlo exige un grupo elegido y
// manda el mail de alta; apagarlo pide confirmación. "Confirmar" solo existe
// para una persona ya habilitada y guarda el cambio de grupo.
//
// MOCK: edita un borrador local; "Confirmar" lo guarda en el store en memoria
// (lib/staff-store.ts) y, al habilitar, la persona pasa a Invitada y se muestra
// el aviso de mail enviado. Los grupos son los que existan en el store
// (incluidos los creados en Grupos de permisos). Se pierde al recargar.
// REAL (`zeus-api`):
//  - La lista de personas sale de la sincronización en solo lectura con el
//    LDAP de Mitrol (una vez por noche o a pedido, solo personas activas); la
//    persona SIEMPRE sale de ahí (nunca se tipea un mail). La clave es el
//    identificador inmutable del directorio, no el mail.
//  - Habilitar = POST /staff-users { directoryId, groupId }: crea el usuario
//    vía `identity-api` en el realm `mitrol` y dispara el mail de alta para
//    fijar la contraseña. El mail debe terminar en @mitrol.net. Cambiar el
//    grupo = PUT /staff-users/{directoryId} { groupId }. Deshabilitar =
//    POST /staff-users/{directoryId}/disable.
//  - Una persona tiene UN solo grupo y no hay permisos individuales: sus
//    permisos efectivos y su alcance por región son los del grupo.
//  - Errores: 404 `directory_user_not_found`, 409 `already_enabled`, 422
//    `group_required` (falta el grupo) / `unknown_group`, 403 sin
//    `zeus.staff.write`.
export function StaffUserEditor({ directoryId }: { directoryId: string }) {
  const t = useT();
  const router = useRouter();
  const { users, groups } = useStaffStore();
  const person = users.find((u) => u.directoryId === directoryId);
  // Invitada o Activa: se edita (y se puede deshabilitar). Si no, se habilita.
  const editing = person?.status === "invitado" || person?.status === "activo";
  const [confirmandoBaja, setConfirmandoBaja] = useState(false);

  const [groupId, setGroupId] = useState<string | undefined>(person?.groupId);
  const [groupOpen, setGroupOpen] = useState(false);
  const [done, setDone] = useState(false);

  const group = groups.find((g) => g.id === groupId);
  const effective = effectivePermissions(group);

  // Guarda el cambio de grupo de una persona ya habilitada; conserva su estado.
  function confirmar() {
    if (!person || !groupId) return;
    staffActions.updateUser(person.directoryId, { groupId });
    router.push("/admin/staff");
  }

  // Interruptor: prenderlo habilita con el grupo elegido (pasa a Invitada y se
  // avisa del mail enviado); apagarlo abre la confirmación de la baja.
  function cambiarHabilitada(habilitar: boolean) {
    if (!person) return;
    if (!habilitar) return setConfirmandoBaja(true);
    if (!groupId) return;
    staffActions.updateUser(person.directoryId, { groupId, status: "invitado" });
    setDone(true);
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={person?.name}
        description={t(editing ? "staff.editar.descripcion" : "staff.habilitar.descripcion")}
        backHref="/admin/staff"
        actions={
          // Sin persona habilitada no hay nada que confirmar: se habilita con
          // el interruptor y se vuelve con el enlace del encabezado.
          editing && (
            <>
              <Button variant="outline" asChild>
                <Link href="/admin/staff">{t("common.acciones.cancelar")}</Link>
              </Button>
              <Button
                data-testid="staff-confirmar"
                disabled={!groupId || groupId === person?.groupId}
                onClick={confirmar}
              >
                {t("common.acciones.confirmar")}
              </Button>
            </>
          )
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(280px,380px)_1fr]">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>{t("staff.persona.datos")}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {/* Nombre y mail vienen del directorio: texto, no campos. */}
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">{t("staff.form.persona")}</span>
              <p data-testid="staff-persona">{person?.name}</p>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">{t("staff.form.mail")}</span>
              <p data-testid="staff-mail">{person?.email}</p>
            </div>
            <p className="text-xs text-muted-foreground">{t("staff.form.directorioAyuda")}</p>
            {person && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{t("staff.col.estado")}:</span>
                <Badge variant={staffStatusBadge[person.status]} data-testid="staff-estado">
                  {t(`staff.estado.${person.status}`)}
                </Badge>
              </div>
            )}
            {/* Mismo control que "Habilitado" en el usuario de Olimpo. Apagado y
                sin grupo elegido queda bloqueado: la ayuda dice qué falta. */}
            <div className="flex flex-col gap-2 rounded-lg p-3 ring-1 ring-foreground/10">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{t("staff.habilitada")}</span>
                <Switch
                  data-testid="staff-habilitada"
                  checked={editing}
                  disabled={!editing && !groupId}
                  onCheckedChange={cambiarHabilitada}
                />
              </div>
              <p className="text-xs text-muted-foreground" data-testid="staff-habilitada-ayuda">
                {t(
                  editing
                    ? "staff.habilitada.ayudaSi"
                    : groupId
                      ? "staff.habilitada.ayudaNo"
                      : "staff.habilitada.ayudaSinGrupo",
                )}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("staff.form.grupo")}</CardTitle>
              <CardDescription>{t("staff.form.grupoAyuda")}</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Selección única y obligatoria, buscable (Popover + Command). */}
              <Popover open={groupOpen} onOpenChange={setGroupOpen}>
                <PopoverTrigger asChild>
                  <Button
                    data-testid="staff-grupo"
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={groupOpen}
                    className="w-full justify-between font-normal"
                  >
                    <span className={group ? "" : "text-muted-foreground"}>
                      {group?.name ?? t("staff.form.grupoPlaceholder")}
                    </span>
                    <ChevronsUpDown className="shrink-0 text-muted-foreground" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
                  <Command>
                    <CommandInput placeholder={t("staff.miembros.buscar")} />
                    <CommandList>
                      <CommandEmpty>{t("staff.form.sinGrupos")}</CommandEmpty>
                      <CommandGroup>
                        {groups.map((g) => (
                          <CommandItem
                            key={g.id}
                            value={g.name}
                            data-testid={`staff-grupo-opcion-${g.id}`}
                            onSelect={() => {
                              setGroupId(g.id);
                              setGroupOpen(false);
                            }}
                          >
                            <Check className={g.id === groupId ? "opacity-100" : "opacity-0"} />
                            {g.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("staff.efectivos.titulo")}</CardTitle>
              <CardDescription>{t("staff.efectivos.descripcion")}</CardDescription>
            </CardHeader>
            <CardContent>
              <EffectivePermissionsSummary effective={effective} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Confirmación de la baja; al confirmar se queda en el detalle, ya Deshabilitada. */}
      <AlertDialog open={confirmandoBaja} onOpenChange={setConfirmandoBaja}>
        <AlertDialogContent data-testid="staff-deshabilitar-confirmacion">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("staff.accion.deshabilitarTitulo", { nombre: person?.name ?? "" })}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("staff.accion.deshabilitarDescripcion", { nombre: person?.name ?? "" })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.acciones.cancelar")}</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              data-testid="staff-deshabilitar-confirmar"
              onClick={() => {
                if (!person) return;
                staffActions.updateUser(person.directoryId, { status: "deshabilitado" });
              }}
            >
              {t("staff.accion.deshabilitar")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={done} onOpenChange={setDone}>
        <DialogContent data-testid="staff-confirmacion">
          <DialogHeader>
            <DialogTitle>{t("staff.enviado.titulo")}</DialogTitle>
            <DialogDescription>{t("staff.enviado.descripcion", { mail: person?.email ?? "" })}</DialogDescription>
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
