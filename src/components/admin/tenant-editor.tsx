"use client";

import { useMemo, useState } from "react";
import { LogIn, LineChart, Receipt, Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { RowActions } from "@/components/data-table/row-actions";
import {
  MitrolTable,
  type MRT_ColumnDef,
} from "@/components/data-table/mitrol-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EntityCombobox } from "@/app/(backoffice)/campanias/entity-combobox";
import {
  regions,
  regionLabel,
  type Organization,
  type Region,
  type TenantContact,
} from "@/lib/mock-admin";
import { countries } from "@/lib/countries";
import { useT } from "@/lib/i18n";

// Detalle de un cliente (tenant): vista única (sin solapas) con los 3 bloques
// distribuidos en un grid. Arriba, lado a lado: General (nombre, región,
// país, activo) y Soporte. Abajo, ancho completo: Contactos. Impersonar y Ver
// observabilidad ya están activos (a pedido); eventos de billing sigue como
// afordancia deshabilitada / "próximamente" en el bloque Soporte.
// Mock: estado local, sin persistencia (PRODUCT.md).
export function TenantEditor({
  organization,
  region,
  initialContacts,
}: {
  organization: Organization;
  region: Region | undefined;
  initialContacts: TenantContact[];
}) {
  const t = useT();
  const [name, setName] = useState(organization.name);
  const [regionId, setRegionId] = useState(organization.regionId);
  const [countryId, setCountryId] = useState(organization.countryId);
  const [active, setActive] = useState(organization.active);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={organization.name}
        description={
          region
            ? `${region.code} · ${regionLabel(region, t)}`
            : t("admin.detalle.sinRegion")
        }
        backHref="/admin/tenants"
      />

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
        <GeneralSection
          name={name}
          setName={setName}
          regionId={regionId}
          setRegionId={setRegionId}
          countryId={countryId}
          setCountryId={setCountryId}
          active={active}
          setActive={setActive}
        />
        <SoporteSection nombre={organization.name} />
      </div>

      <ContactosSection
        tenantId={organization.tenantId}
        initialContacts={initialContacts}
      />
    </div>
  );
}

function GeneralSection({
  name,
  setName,
  regionId,
  setRegionId,
  countryId,
  setCountryId,
  active,
  setActive,
}: {
  name: string;
  setName: (v: string) => void;
  regionId: string;
  setRegionId: (v: string) => void;
  countryId: string;
  setCountryId: (v: string) => void;
  active: boolean;
  setActive: (v: boolean) => void;
}) {
  const t = useT();

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle>{t("admin.form.datosCliente")}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="edit-name">{t("common.comunes.nombre")}</Label>
          <Input
            id="edit-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="edit-region">{t("admin.campos.region")}</Label>
          <Select value={regionId} onValueChange={setRegionId}>
            <SelectTrigger id="edit-region" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {regions.map((region) => (
                <SelectItem key={region.id} value={region.id}>
                  {region.code} · {regionLabel(region, t)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="edit-country">{t("admin.campos.pais")}</Label>
          <EntityCombobox
            id="edit-country"
            items={countries}
            value={countryId}
            onChange={(v) => v && setCountryId(v)}
            placeholder={t("admin.form.paisPlaceholder")}
            searchPlaceholder={t("admin.form.paisBuscar")}
            emptyLabel={t("admin.form.paisVacio")}
          />
        </div>

        <div className="flex items-start justify-between gap-4 rounded-lg ring-1 ring-foreground/10 p-3">
          <div className="flex flex-col gap-0.5">
            <Label htmlFor="edit-active">
              {t("admin.form.clienteActivo")}
            </Label>
            <span className="text-xs text-muted-foreground">
              {t("admin.detalle.activoAyuda")}
            </span>
          </div>
          <Switch
            id="edit-active"
            checked={active}
            onCheckedChange={setActive}
          />
        </div>
      </CardContent>
    </Card>
  );
}

// Bloque Soporte: herramientas de asistencia multitenancy. Impersonar y Ver
// observabilidad ya están activos (a pedido) — abren un diálogo que simula la
// acción (mock, sin backend real); eventos de billing sigue "próximamente".
// Los diálogos reusan las mismas claves i18n que el menú de tres puntos del
// listado (admin.clientes.impersonar.* / admin.soporte.observabilidad.*): es
// la misma acción simulada, solo con otra puerta de entrada.
function SoporteSection({ nombre }: { nombre: string }) {
  const t = useT();
  const [impersonando, setImpersonando] = useState(false);
  const [observando, setObservando] = useState(false);

  return (
    <>
      <Card className="h-fit">
        <CardHeader>
          <CardTitle>{t("admin.soporte.titulo")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="max-w-[65ch] text-sm text-muted-foreground">
            {t("admin.soporte.descripcion")}
          </p>
          <FaseUnoRow
            icon={<LogIn className="size-4" />}
            title={t("admin.soporte.impersonar.titulo")}
            description={t("admin.soporte.impersonar.descripcion")}
            onClick={() => setImpersonando(true)}
          />
          <FaseUnoRow
            icon={<LineChart className="size-4" />}
            title={t("admin.soporte.observabilidad.titulo")}
            description={t("admin.soporte.observabilidad.descripcion")}
            onClick={() => setObservando(true)}
          />
          <FaseUnoRow
            icon={<Receipt className="size-4" />}
            title={t("admin.soporte.billing.titulo")}
            description={t("admin.soporte.billing.descripcion")}
          />
        </CardContent>
      </Card>

      <Dialog open={impersonando} onOpenChange={setImpersonando}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t("admin.clientes.impersonar.titulo", { nombre })}
            </DialogTitle>
            <DialogDescription>
              {t("admin.clientes.impersonar.descripcion")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setImpersonando(false)}>
              {t("admin.clientes.impersonar.salir")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={observando} onOpenChange={setObservando}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t("admin.soporte.observabilidad.dialogTitulo", { nombre })}
            </DialogTitle>
            <DialogDescription>
              {t("admin.soporte.observabilidad.descripcion")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setObservando(false)}>
              {t("common.acciones.cerrar")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function FaseUnoRow({
  icon,
  title,
  description,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  /** Si se pasa, la fila deja de ser "próximamente" y se vuelve clickeable. */
  onClick?: () => void;
}) {
  const t = useT();
  const contenido = (
    <>
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        {icon}
      </span>
      <div className="flex flex-1 flex-col gap-0.5">
        <span className="flex items-center gap-2 text-sm font-medium">
          {title}
          {!onClick && (
            <Badge variant="neutral">{t("admin.soporte.proximamente")}</Badge>
          )}
        </span>
        <span className="text-xs text-muted-foreground">{description}</span>
      </div>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="flex items-start gap-3 rounded-lg p-3 text-left ring-1 ring-foreground/10 transition-colors hover:bg-accent"
      >
        {contenido}
      </button>
    );
  }

  return (
    <div className="flex items-start gap-3 rounded-lg ring-1 ring-foreground/10 p-3 opacity-70">
      {contenido}
    </div>
  );
}

const emptyContact = {
  contactName: "",
  contactEmail: "",
  contactPhonenumber: "",
  contactRole: "",
  contactNotes: "",
};

function ContactosSection({
  tenantId,
  initialContacts,
}: {
  tenantId: string;
  initialContacts: TenantContact[];
}) {
  const t = useT();
  const [contacts, setContacts] = useState<TenantContact[]>(initialContacts);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<TenantContact | null>(null);
  const [form, setForm] = useState(emptyContact);

  function abrir(contact: TenantContact | null) {
    setEditing(contact);
    setForm(
      contact
        ? {
            contactName: contact.contactName,
            contactEmail: contact.contactEmail,
            contactPhonenumber: contact.contactPhonenumber,
            contactRole: contact.contactRole,
            contactNotes: contact.contactNotes ?? "",
          }
        : emptyContact,
    );
    setDialogOpen(true);
  }

  function guardar() {
    if (!form.contactName.trim()) return;
    const notes = form.contactNotes.trim();
    if (editing) {
      setContacts((prev) =>
        prev.map((c) =>
          c.id === editing.id
            ? {
                ...c,
                contactName: form.contactName.trim(),
                contactEmail: form.contactEmail.trim(),
                contactPhonenumber: form.contactPhonenumber.trim(),
                contactRole: form.contactRole.trim(),
                contactNotes: notes || null,
              }
            : c,
        ),
      );
    } else {
      setContacts((prev) => [
        ...prev,
        {
          id: `contact-nuevo-${tenantId}-${prev.length}-${Date.now()}`,
          tenantId,
          contactName: form.contactName.trim(),
          contactEmail: form.contactEmail.trim(),
          contactPhonenumber: form.contactPhonenumber.trim(),
          contactRole: form.contactRole.trim(),
          contactNotes: notes || null,
        },
      ]);
    }
    setDialogOpen(false);
  }

  const columns = useMemo<MRT_ColumnDef<TenantContact>[]>(
    () => [
      {
        accessorKey: "contactName",
        header: t("common.comunes.nombre"),
        Cell: ({ cell }) => (
          <span className="font-medium">{cell.getValue<string>()}</span>
        ),
      },
      { accessorKey: "contactEmail", header: t("admin.contactos.col.email") },
      {
        accessorKey: "contactPhonenumber",
        header: t("admin.contactos.col.telefono"),
        Cell: ({ cell }) => (
          <span className="font-mono text-xs">{cell.getValue<string>()}</span>
        ),
      },
      { accessorKey: "contactRole", header: t("admin.contactos.col.rol") },
      {
        accessorKey: "contactNotes",
        header: t("admin.contactos.col.notas"),
        Cell: ({ cell }) => {
          const notes = cell.getValue<string | null>();
          return notes ? (
            <span className="text-muted-foreground">{notes}</span>
          ) : (
            <span className="text-muted-foreground">—</span>
          );
        },
      },
    ],
    [t],
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          {t("admin.contactos.descripcion")}
        </p>
        <Button onClick={() => abrir(null)}>
          <Plus />
          {t("admin.contactos.agregar")}
        </Button>
      </div>

      <MitrolTable
        columns={columns}
        data={contacts}
        options={{
          enableRowActions: true,
          renderRowActions: ({ row }) => (
            <RowActions
              actions={[
                {
                  label: t("common.acciones.editar"),
                  onSelect: () => abrir(row.original),
                },
                {
                  label: t("common.acciones.eliminar"),
                  destructive: true,
                  separatorBefore: true,
                  confirmDescription: t("admin.contactos.eliminarDescripcion", {
                    nombre: row.original.contactName,
                  }),
                  onSelect: () =>
                    setContacts((prev) =>
                      prev.filter((c) => c.id !== row.original.id),
                    ),
                },
              ]}
            />
          ),
        }}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editing
                ? t("admin.contactos.editarTitulo", {
                    nombre: editing.contactName,
                  })
                : t("admin.contactos.nuevo")}
            </DialogTitle>
            <DialogDescription>
              {t("admin.contactos.dialogoDescripcion")}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="c-name">{t("common.comunes.nombre")}</Label>
              <Input
                id="c-name"
                value={form.contactName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, contactName: e.target.value }))
                }
                placeholder={t("admin.contactos.nombrePlaceholder")}
                autoFocus
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="c-email">
                  {t("admin.contactos.col.email")}
                </Label>
                <Input
                  id="c-email"
                  type="email"
                  value={form.contactEmail}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, contactEmail: e.target.value }))
                  }
                  placeholder={t("admin.contactos.emailPlaceholder")}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="c-phone">
                  {t("admin.contactos.col.telefono")}
                </Label>
                <Input
                  id="c-phone"
                  value={form.contactPhonenumber}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      contactPhonenumber: e.target.value,
                    }))
                  }
                  placeholder={t("admin.contactos.telefonoPlaceholder")}
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="c-role">{t("admin.contactos.col.rol")}</Label>
              <Input
                id="c-role"
                value={form.contactRole}
                onChange={(e) =>
                  setForm((f) => ({ ...f, contactRole: e.target.value }))
                }
                placeholder={t("admin.contactos.rolPlaceholder")}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="c-notes">{t("admin.contactos.col.notas")}</Label>
              <Textarea
                id="c-notes"
                value={form.contactNotes}
                onChange={(e) =>
                  setForm((f) => ({ ...f, contactNotes: e.target.value }))
                }
                placeholder={t("common.comunes.opcional")}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {t("common.acciones.cancelar")}
            </Button>
            <Button onClick={guardar} disabled={!form.contactName.trim()}>
              {editing
                ? t("common.acciones.guardar")
                : t("admin.contactos.agregar")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
