"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, ChevronsUpDown } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
// que da ese grupo (permisos y alcance por cluster).
//
// MOCK: edita un borrador local; "Confirmar" lo guarda en el store en memoria
// (lib/staff-store.ts) y, al habilitar, la persona pasa a Invitada y se muestra
// el aviso de mail enviado. Los grupos son los que existan en el store
// (incluidos los creados en Grupos de permisos). Se pierde al recargar.
// REAL (`zeus-api`):
//  - La lista de personas sale de la sincronización en solo lectura con el
//    LDAP de Mitrol (una vez por noche, solo personas activas); la persona
//    SIEMPRE se elige de ahí (nunca se tipea un mail). La clave es el
//    identificador inmutable del directorio, no el mail.
//  - Habilitar = POST /staff-users { directoryId, groupId }: crea el usuario
//    vía `identity-api` en el realm `mitrol` y dispara el mail de alta para
//    fijar la contraseña. El mail debe terminar en @mitrol.net. Cambiar el
//    grupo = PUT /staff-users/{directoryId} { groupId }.
//  - Una persona tiene UN solo grupo y no hay permisos individuales: sus
//    permisos efectivos y su alcance por cluster son los del grupo.
//  - Errores: 404 `directory_user_not_found`, 409 `already_enabled`, 422
//    `group_required` (falta el grupo) / `unknown_group`, 403 sin
//    `zeus.staff.write`.
export function StaffUserEditor({ directoryId }: { directoryId?: string }) {
  const t = useT();
  const router = useRouter();
  const { users, groups } = useStaffStore();
  // Persona preelegida (editar, o habilitar desde el listado).
  const preselected = users.find((u) => u.directoryId === directoryId);
  const editing = preselected !== undefined && preselected.status !== "no-habilitado" && preselected.status !== "deshabilitado";

  const [selectedId, setSelectedId] = useState<string | undefined>(directoryId);
  const person = users.find((u) => u.directoryId === selectedId);
  const [personOpen, setPersonOpen] = useState(false);

  const [groupId, setGroupId] = useState<string | undefined>(person?.groupId);
  const [groupOpen, setGroupOpen] = useState(false);
  const [done, setDone] = useState(false);

  const candidates = users.filter((u) => u.status === "no-habilitado");
  const group = groups.find((g) => g.id === groupId);
  const effective = effectivePermissions(group);

  // Guarda en el store: al habilitar la persona pasa a Invitada; al editar
  // conserva su estado.
  function confirmar() {
    if (!person || !groupId) return;
    staffActions.updateUser(person.directoryId, {
      groupId,
      ...(editing ? {} : { status: "invitado" as const }),
    });
    if (editing) router.push("/admin/staff");
    else setDone(true);
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={editing && person ? person.name : t("staff.habilitar.titulo")}
        description={t(editing ? "staff.editar.descripcion" : "staff.habilitar.descripcion")}
        backHref="/admin/staff"
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/admin/staff">{t("common.acciones.cancelar")}</Link>
            </Button>
            <Button data-testid="staff-confirmar" disabled={!person || !groupId} onClick={confirmar}>
              {t("common.acciones.confirmar")}
            </Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(280px,380px)_1fr]">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>{t("staff.persona.datos")}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="staff-persona">{t("staff.form.persona")}</Label>
              {editing ? (
                <Input id="staff-persona" data-testid="staff-persona" value={person?.name ?? ""} readOnly />
              ) : (
                // Selector buscable de personas del directorio aún no habilitadas.
                <Popover open={personOpen} onOpenChange={setPersonOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      id="staff-persona"
                      data-testid="staff-persona"
                      type="button"
                      variant="outline"
                      role="combobox"
                      aria-expanded={personOpen}
                      className="w-full justify-between font-normal"
                    >
                      <span className={person ? "" : "text-muted-foreground"}>
                        {person?.name ?? t("staff.form.personaPlaceholder")}
                      </span>
                      <ChevronsUpDown className="shrink-0 text-muted-foreground" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
                    <Command>
                      <CommandInput placeholder={t("staff.miembros.buscar")} />
                      <CommandList>
                        <CommandEmpty>{t("staff.form.sinCandidatas")}</CommandEmpty>
                        <CommandGroup>
                          {candidates.map((u) => (
                            <CommandItem
                              key={u.directoryId}
                              value={`${u.name} ${u.email}`}
                              data-testid={`staff-persona-opcion-${u.directoryId}`}
                              onSelect={() => {
                                setSelectedId(u.directoryId);
                                setPersonOpen(false);
                              }}
                            >
                              <Check className={u.directoryId === selectedId ? "opacity-100" : "opacity-0"} />
                              {u.name}
                              <span className="ml-auto truncate text-xs text-muted-foreground">{u.email}</span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              )}
              {!editing && <p className="text-xs text-muted-foreground">{t("staff.form.personaAyuda")}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="staff-mail">{t("staff.form.mail")}</Label>
              <Input id="staff-mail" data-testid="staff-mail" value={person?.email ?? ""} readOnly disabled />
              <p className="text-xs text-muted-foreground">{t("staff.form.mailAyuda")}</p>
            </div>
            {person && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{t("staff.col.estado")}:</span>
                <Badge variant={staffStatusBadge[person.status]}>{t(`staff.estado.${person.status}`)}</Badge>
              </div>
            )}
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

      <Dialog open={done} onOpenChange={(open) => !open && router.push("/admin/staff")}>
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
