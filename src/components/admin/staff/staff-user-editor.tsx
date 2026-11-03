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
import { MembersCard } from "@/components/admin/staff/members-card";
import { PermissionMatrix } from "@/components/admin/staff/permission-matrix";
import { ScopePicker } from "@/components/admin/staff/scope-picker";
import { EffectivePermissionsSummary } from "@/components/admin/staff/effective-permissions";
import { effectivePermissions, staffStatusBadge, type ClusterScope } from "@/lib/mock-staff";
import { staffActions, useStaffStore } from "@/lib/staff-store";
import { useT } from "@/lib/i18n";

// Detalle de una persona del staff (habilitar o editar), misma estructura que
// /clasificaciones/[id]: datos a la izquierda; a la derecha los grupos de
// permisos (agregar con búsqueda, quitar con X), los permisos extra, el
// alcance por cluster y el resumen de permisos efectivos.
//
// MOCK: edita un borrador local; "Confirmar" lo guarda en el store en memoria
// (lib/staff-store.ts) y la persona pasa a Invitada; muestra el aviso de mail
// enviado. Los grupos son los que existan en el store (incluidos los creados
// en Grupos de permisos). Se pierde al recargar la página.
// REAL (`zeus-api`):
//  - La lista de personas sale de la sincronización en solo lectura con el
//    LDAP de Mitrol; la persona SIEMPRE se elige de ahí (nunca se tipea un
//    mail). La clave es el identificador inmutable del directorio, no el mail.
//  - Habilitar = POST /staff-users { directoryId, groupIds, extraPermissions,
//    clusterScope }: crea el usuario vía `identity-api` en el realm `mitrol` y
//    dispara el mail de alta para fijar la contraseña. El mail debe terminar
//    en @mitrol.net. Editar = PUT /staff-users/{directoryId}.
//  - Permisos efectivos = grupos ∪ extras.
//  - Errores: 404 `directory_user_not_found`, 409 `already_enabled`, 422
//    `unknown_permission` / `unknown_cluster`, 403 sin `zeus.staff.write`.
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

  const [groupIds, setGroupIds] = useState<string[]>(person?.groupIds ?? []);
  const [extras, setExtras] = useState<string[]>(person?.extraPermissions ?? []);
  const [scope, setScope] = useState<ClusterScope>(person?.scope ?? "all");
  const [done, setDone] = useState(false);

  const candidates = users.filter((u) => u.status === "no-habilitado");
  const toOption = (g: (typeof groups)[number]) => ({ id: g.id, name: g.name });
  // Permisos que ya dan los grupos elegidos: se muestran bloqueados en extras.
  const fromGroups = groupIds.flatMap((id) => groups.find((g) => g.id === id)?.permissions ?? []);
  const effective = effectivePermissions(groups, groupIds, extras, scope);

  // Al sumar el primer grupo, el alcance arranca en el alcance por defecto del grupo.
  function addGroup(id: string) {
    if (groupIds.length === 0) setScope(groups.find((g) => g.id === id)?.defaultScope ?? "all");
    setGroupIds((prev) => [...prev, id]);
  }

  // Guarda en el store: al habilitar la persona pasa a Invitada; al editar
  // conserva su estado.
  function confirmar() {
    if (!person) return;
    staffActions.updateUser(person.directoryId, {
      groupIds,
      extraPermissions: extras,
      scope,
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
            <Button data-testid="staff-confirmar" disabled={!person || groupIds.length === 0} onClick={confirmar}>
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
          <MembersCard
            title={t("staff.form.grupos")}
            description={t("staff.form.gruposAyuda")}
            members={groupIds.flatMap((id) => groups.filter((g) => g.id === id).map(toOption))}
            available={groups.filter((g) => !groupIds.includes(g.id)).map(toOption)}
            onAdd={addGroup}
            onRemove={(id) => setGroupIds((prev) => prev.filter((g) => g !== id))}
            testIdPrefix="staff-grupo"
            texts={{
              agregar: t("staff.miembros.agregar"),
              buscar: t("staff.miembros.buscar"),
              sinDisponibles: t("staff.form.sinGrupos"),
              vacio: t("staff.form.gruposVacio"),
              quitar: t("staff.miembros.quitar"),
              quitarAria: (nombre) => t("staff.miembros.quitarAria", { nombre }),
            }}
            footer={
              <Button variant="link" asChild className="w-fit px-0" data-testid="staff-crear-grupo">
                <Link href="/admin/staff/grupos/nuevo">{t("staff.form.crearGrupo")}</Link>
              </Button>
            }
          />

          <Card>
            <CardHeader>
              <CardTitle>{t("staff.form.extras")}</CardTitle>
              <CardDescription>{t("staff.form.extrasAyuda")}</CardDescription>
            </CardHeader>
            <CardContent>
              <PermissionMatrix value={extras} onChange={setExtras} lockedKeys={fromGroups} testIdPrefix="staff-extra" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("staff.form.alcance")}</CardTitle>
              <CardDescription>{t("staff.form.alcanceAyuda")}</CardDescription>
            </CardHeader>
            <CardContent>
              <ScopePicker value={scope} onChange={setScope} testIdPrefix="staff-alcance" />
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
