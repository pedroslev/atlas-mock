"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { RowActions } from "@/components/data-table/row-actions";
import {
  MitrolTable,
  type MRT_ColumnDef,
} from "@/components/data-table/mitrol-table";
import { RegionMultiSelect } from "@/components/admin/region-multi-select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  regions,
  regionBadgeVariant,
  regionLabel,
  getRegion,
  organizations,
  type Region,
} from "@/lib/mock-admin";
import {
  carriers as carriersIniciales,
  carrierRates as carrierRatesIniciales,
  usePhoneNumbers,
  type Carrier,
  type PhoneNumber,
  type NumberDirection,
  type CarrierRate,
} from "@/lib/mock-telefonia";
import { useT } from "@/lib/i18n";

// Fila editable de destino SIP en el modal del carrier (la prioridad queda
// como texto mientras se edita y se convierte a número al guardar).
type DestinationForm = { id: string; destination: string; priority: string };

function nuevoDestino(): DestinationForm {
  return { id: `destino-${crypto.randomUUID()}`, destination: "", priority: "10" };
}

const emptyForm = {
  name: "",
  regionIds: [] as string[],
  destinations: [] as DestinationForm[],
  whitelistIps: "",
  allowsHiddenCli: false,
  allowsRandomCli: false,
  active: true,
};

// Valor de Select para "libre para cualquier tenant" — Select no admite value
// vacío; se traduce a tenantId: null recién al guardar.
const TENANT_LIBRE = "libre";

const emptyNumeroForm = {
  number: "",
  carrierId: "",
  regionId: "",
  direction: "saliente" as NumberDirection,
  tenantId: TENANT_LIBRE as string,
};

const DIRECTIONS: NumberDirection[] = ["saliente", "entrante", "ambas"];

const emptyRateForm = {
  carrierId: "",
  prefix: "",
  ratePerMinute: "",
};

// Un badge por región (code). Las regiones que ya no existen se omiten.
function RegionBadges({ regionIds }: { regionIds: string[] }) {
  const lista = regionIds
    .map((id) => getRegion(id))
    .filter((region): region is Region => Boolean(region));
  if (lista.length === 0) return <span className="text-muted-foreground">—</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {lista.map((region) => (
        <Badge key={region.id} variant={regionBadgeVariant(region.code)}>
          {region.code}
        </Badge>
      ))}
    </div>
  );
}

// Administración de carriers de Kamailio desde Zeus (ADR-TELEFONIA-002,
// "Administración de carriers por región"; modelo en ADR-BD-005). Un carrier es
// multiregión: zeus-api lo da de alta, con el mismo id, en la media-api de cada
// región (cluster) donde opera. Acá es mock de pantalla, estado local sin
// persistencia.
export default function TelefoniaPage() {
  const t = useT();
  const [carriers, setCarriers] = useState<Carrier[]>(carriersIniciales);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Carrier | null>(null);
  const [form, setForm] = useState(emptyForm);

  // Compartido con Cuentas (olimpo-front) — ver mock-telefonia.ts.
  const { numeros, setNumeros } = usePhoneNumbers();
  const [numeroDialogOpen, setNumeroDialogOpen] = useState(false);
  const [editingNumero, setEditingNumero] = useState<PhoneNumber | null>(
    null,
  );
  const [numeroForm, setNumeroForm] = useState(emptyNumeroForm);

  const [carrierRates, setCarrierRates] = useState<CarrierRate[]>(
    carrierRatesIniciales,
  );
  const [rateDialogOpen, setRateDialogOpen] = useState(false);
  const [editingRate, setEditingRate] = useState<CarrierRate | null>(null);
  const [rateForm, setRateForm] = useState(emptyRateForm);

  // Búsqueda por id sobre el estado actual, para que un carrier recién creado
  // o editado se vea igual en las solapas de números y tarifas.
  const carrierPorId = useMemo(
    () => new Map(carriers.map((carrier) => [carrier.id, carrier])),
    [carriers],
  );
  // organizations no cambia en esta pantalla (se administra desde Cuentas/Zeus
  // Tenants) — no hace falta useState, solo el map de lookup por id.
  const organizacionPorId = useMemo(
    () => new Map(organizations.map((org) => [org.tenantId, org])),
    [],
  );
  const activeCarriers = carriers.filter((c) => c.active);
  // Candidatos al LCR: carriers activos que permiten salir con CLI oculto o aleatorio.
  const anonymousCarriers = activeCarriers.filter(
    (c) => c.allowsHiddenCli || c.allowsRandomCli,
  );

  // Filas de destino con URI cargada; las vacías se descartan al guardar.
  const destinosCargados = form.destinations.filter((d) =>
    d.destination.trim(),
  );
  const puedeGuardarCarrier =
    form.name.trim().length > 0 &&
    form.regionIds.length > 0 &&
    destinosCargados.length > 0;

  function abrir(carrier: Carrier | null) {
    setEditing(carrier);
    setForm(
      carrier
        ? {
            name: carrier.name,
            regionIds: carrier.regionIds,
            destinations: carrier.destinations.map((d) => ({
              id: d.id,
              destination: d.destination,
              priority: String(d.priority),
            })),
            whitelistIps: carrier.whitelistIps.join("\n"),
            allowsHiddenCli: carrier.allowsHiddenCli,
            allowsRandomCli: carrier.allowsRandomCli,
            active: carrier.active,
          }
        : { ...emptyForm, destinations: [nuevoDestino()] },
    );
    setDialogOpen(true);
  }

  function actualizarDestino(id: string, patch: Partial<DestinationForm>) {
    setForm((f) => ({
      ...f,
      destinations: f.destinations.map((d) =>
        d.id === id ? { ...d, ...patch } : d,
      ),
    }));
  }

  function quitarDestino(id: string) {
    setForm((f) => ({
      ...f,
      destinations: f.destinations.filter((d) => d.id !== id),
    }));
  }

  function guardar() {
    if (!puedeGuardarCarrier) return;
    const datos = {
      name: form.name.trim(),
      regionIds: form.regionIds,
      destinations: destinosCargados.map((d) => ({
        id: d.id,
        destination: d.destination.trim(),
        priority: Number(d.priority) || 0,
      })),
      whitelistIps: form.whitelistIps
        .split("\n")
        .map((ip) => ip.trim())
        .filter(Boolean),
      allowsHiddenCli: form.allowsHiddenCli,
      allowsRandomCli: form.allowsRandomCli,
      active: form.active,
    };

    if (editing) {
      setCarriers((prev) =>
        prev.map((c) => (c.id === editing.id ? { ...c, ...datos } : c)),
      );
      // Sacar una región es dar de baja el carrier en esa región: sus números
      // de ahí se van con él.
      setNumeros((prev) =>
        prev.filter(
          (o) =>
            o.carrierId !== editing.id || datos.regionIds.includes(o.regionId),
        ),
      );
    } else {
      setCarriers((prev) => [
        ...prev,
        { id: `carrier-${crypto.randomUUID()}`, ...datos },
      ]);
    }
    setDialogOpen(false);
  }

  // Borrar un carrier borra también sus números y sus tarifas.
  function eliminarCarrier(id: string) {
    setCarriers((prev) => prev.filter((c) => c.id !== id));
    setNumeros((prev) => prev.filter((o) => o.carrierId !== id));
    setCarrierRates((prev) => prev.filter((r) => r.carrierId !== id));
  }

  // Regiones del carrier elegido: el número solo puede estar en una de ellas.
  const regionesDelCarrier = regions.filter((region) =>
    carrierPorId.get(numeroForm.carrierId)?.regionIds.includes(region.id),
  );
  // Tenants candidatos a la asignación: solo los de la región elegida — un
  // número no se puede asignar a un tenant de otra región.
  const tenantsDeRegion = organizations.filter(
    (org) => org.regionId === numeroForm.regionId,
  );
  // Un mismo número no puede estar cargado dos veces, tampoco en otra región.
  const numeroNormalizado = numeroForm.number.replace(/\D/g, "");
  const numeroRepetido = numeros.some(
    (o) => o.number === numeroNormalizado && o.id !== editingNumero?.id,
  );
  const puedeGuardarNumero =
    numeroNormalizado.length > 0 &&
    !numeroRepetido &&
    regionesDelCarrier.some((region) => region.id === numeroForm.regionId);

  function abrirNumero(entry: PhoneNumber | null) {
    setEditingNumero(entry);
    const primerCarrier = activeCarriers[0];
    setNumeroForm(
      entry
        ? {
            number: entry.number,
            carrierId: entry.carrierId,
            regionId: entry.regionId,
            direction: entry.direction,
            tenantId: entry.tenantId ?? TENANT_LIBRE,
          }
        : {
            ...emptyNumeroForm,
            carrierId: primerCarrier?.id ?? "",
            regionId: primerCarrier?.regionIds[0] ?? "",
          },
    );
    setNumeroDialogOpen(true);
  }

  // Al cambiar de carrier se conserva la región si el carrier nuevo también
  // opera ahí; si no, se pasa a la primera región del carrier nuevo. Cambiar
  // de región puede dejar sin sentido el tenant elegido (es de otra región),
  // así que vuelve a "libre".
  function elegirCarrierNumero(carrierId: string) {
    const regionIds = carrierPorId.get(carrierId)?.regionIds ?? [];
    setNumeroForm((f) => ({
      ...f,
      carrierId,
      regionId: regionIds.includes(f.regionId)
        ? f.regionId
        : (regionIds[0] ?? ""),
      tenantId: TENANT_LIBRE,
    }));
  }

  function elegirRegionNumero(regionId: string) {
    setNumeroForm((f) => ({ ...f, regionId, tenantId: TENANT_LIBRE }));
  }

  function guardarNumero() {
    if (!puedeGuardarNumero) return;
    const datos = {
      number: numeroNormalizado,
      carrierId: numeroForm.carrierId,
      regionId: numeroForm.regionId,
      direction: numeroForm.direction,
      tenantId:
        numeroForm.tenantId === TENANT_LIBRE ? null : numeroForm.tenantId,
    };

    if (editingNumero) {
      setNumeros((prev) =>
        prev.map((o) => (o.id === editingNumero.id ? { ...o, ...datos } : o)),
      );
    } else {
      setNumeros((prev) => [
        ...prev,
        { id: `number-${crypto.randomUUID()}`, ...datos, active: true },
      ]);
    }
    setNumeroDialogOpen(false);
  }

  function abrirRate(rate: CarrierRate | null) {
    setEditingRate(rate);
    setRateForm(
      rate
        ? {
            carrierId: rate.carrierId,
            prefix: rate.prefix,
            ratePerMinute: String(rate.ratePerMinute),
          }
        : { ...emptyRateForm, carrierId: anonymousCarriers[0]?.id ?? "" },
    );
    setRateDialogOpen(true);
  }

  function guardarRate() {
    const prefix = rateForm.prefix.replace(/\D/g, "");
    const ratePerMinute = Number(rateForm.ratePerMinute);
    if (!prefix || !rateForm.carrierId || !(ratePerMinute > 0)) return;

    if (editingRate) {
      setCarrierRates((prev) =>
        prev.map((r) =>
          r.id === editingRate.id
            ? { ...r, carrierId: rateForm.carrierId, prefix, ratePerMinute }
            : r,
        ),
      );
    } else {
      setCarrierRates((prev) => [
        ...prev,
        {
          id: `rate-${crypto.randomUUID()}`,
          carrierId: rateForm.carrierId,
          prefix,
          ratePerMinute,
          currency: "USD",
        },
      ]);
    }
    setRateDialogOpen(false);
  }

  const numeroColumns = useMemo<MRT_ColumnDef<PhoneNumber>[]>(
    () => [
      {
        accessorKey: "number",
        header: t("admin.telefonia.numeros.col.numero"),
        Cell: ({ cell }) => (
          <span className="font-mono text-xs">{cell.getValue<string>()}</span>
        ),
      },
      {
        id: "carrier",
        header: t("admin.telefonia.col.carrier"),
        accessorFn: (entry) => carrierPorId.get(entry.carrierId)?.name ?? "—",
        Cell: ({ row }) => (
          <span className="font-medium">
            {carrierPorId.get(row.original.carrierId)?.name ?? "—"}
          </span>
        ),
      },
      {
        id: "region",
        header: t("admin.campos.region"),
        accessorFn: (entry) => getRegion(entry.regionId)?.code ?? "—",
        Cell: ({ row }) => <RegionBadges regionIds={[row.original.regionId]} />,
      },
      {
        id: "direction",
        header: t("admin.telefonia.numeros.col.direccion"),
        accessorFn: (entry) =>
          t(`admin.telefonia.numeros.direccion.${entry.direction}`),
        Cell: ({ row }) => (
          <span>
            {t(`admin.telefonia.numeros.direccion.${row.original.direction}`)}
          </span>
        ),
      },
      {
        id: "tenant",
        header: t("admin.telefonia.numeros.col.tenant"),
        accessorFn: (entry) =>
          entry.tenantId
            ? (organizacionPorId.get(entry.tenantId)?.name ?? "—")
            : t("admin.telefonia.numeros.tenantLibre"),
        Cell: ({ row }) =>
          row.original.tenantId ? (
            <span className="font-medium">
              {organizacionPorId.get(row.original.tenantId)?.name ?? "—"}
            </span>
          ) : (
            <Badge variant="neutral">
              {t("admin.telefonia.numeros.tenantLibre")}
            </Badge>
          ),
      },
      {
        id: "estado",
        header: t("common.comunes.estado"),
        accessorFn: (entry) =>
          entry.active ? t("common.comunes.activo") : t("common.comunes.inactivo"),
        Cell: ({ row }) =>
          row.original.active ? (
            <Badge variant="success">{t("common.comunes.activo")}</Badge>
          ) : (
            <Badge variant="neutral">{t("common.comunes.inactivo")}</Badge>
          ),
      },
    ],
    [t, carrierPorId, organizacionPorId],
  );

  const rateColumns = useMemo<MRT_ColumnDef<CarrierRate>[]>(
    () => [
      {
        id: "carrier",
        header: t("admin.telefonia.col.carrier"),
        accessorFn: (rate) => carrierPorId.get(rate.carrierId)?.name ?? "—",
        Cell: ({ row }) => (
          <span className="font-medium">
            {carrierPorId.get(row.original.carrierId)?.name ?? "—"}
          </span>
        ),
      },
      {
        accessorKey: "prefix",
        header: t("admin.telefonia.tarifas.col.prefijo"),
        Cell: ({ cell }) => (
          <span className="font-mono text-xs">{cell.getValue<string>()}</span>
        ),
      },
      {
        id: "rate",
        header: t("admin.telefonia.tarifas.col.tarifa"),
        accessorFn: (rate) => rate.ratePerMinute,
        Cell: ({ row }) => (
          <span className="tabular-nums">
            {row.original.currency} {row.original.ratePerMinute.toFixed(4)}
            <span className="text-muted-foreground"> /min</span>
          </span>
        ),
      },
    ],
    [t, carrierPorId],
  );

  const columns = useMemo<MRT_ColumnDef<Carrier>[]>(
    () => [
      {
        accessorKey: "name",
        header: t("admin.telefonia.col.carrier"),
        Cell: ({ row }) => (
          <span className="font-medium">{row.original.name}</span>
        ),
      },
      {
        id: "regiones",
        header: t("admin.telefonia.col.regiones"),
        accessorFn: (carrier) =>
          carrier.regionIds.map((id) => getRegion(id)?.code ?? "").join(", "),
        Cell: ({ row }) => <RegionBadges regionIds={row.original.regionIds} />,
      },
      {
        id: "destinos",
        header: t("admin.telefonia.col.destinos"),
        accessorFn: (carrier) => carrier.destinations.length,
        Cell: ({ row }) => (
          <span className="tabular-nums text-muted-foreground">
            {row.original.destinations.length}
          </span>
        ),
      },
      {
        id: "whitelist",
        header: t("admin.telefonia.col.whitelist"),
        accessorFn: (carrier) => carrier.whitelistIps.length,
        Cell: ({ row }) => (
          <span className="tabular-nums text-muted-foreground">
            {row.original.whitelistIps.length}
          </span>
        ),
      },
      {
        id: "estado",
        header: t("common.comunes.estado"),
        accessorFn: (carrier) =>
          carrier.active ? t("common.comunes.activo") : t("common.comunes.inactivo"),
        Cell: ({ row }) =>
          row.original.active ? (
            <Badge variant="success">{t("common.comunes.activo")}</Badge>
          ) : (
            <Badge variant="neutral">{t("common.comunes.inactivo")}</Badge>
          ),
      },
    ],
    [t],
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("admin.telefonia.titulo")}
        description={t("admin.telefonia.descripcion")}
      />

      <Tabs defaultValue="carriers">
        <TabsList>
          <TabsTrigger value="carriers">
            {t("admin.telefonia.tab.carriers")}
          </TabsTrigger>
          <TabsTrigger value="numeros">
            {t("admin.telefonia.tab.numeros")}
          </TabsTrigger>
          <TabsTrigger value="tarifas">
            {t("admin.telefonia.tab.tarifas")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="carriers" className="flex flex-col gap-4">
          <div className="flex justify-end">
            <Button onClick={() => abrir(null)}>
              <Plus />
              {t("admin.telefonia.nuevoCarrier")}
            </Button>
          </div>

          <MitrolTable
            columns={columns}
            data={carriers}
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
                      label: row.original.active
                        ? t("admin.telefonia.accion.desactivar")
                        : t("admin.telefonia.accion.activar"),
                      onSelect: () =>
                        setCarriers((prev) =>
                          prev.map((c) =>
                            c.id === row.original.id
                              ? { ...c, active: !c.active }
                              : c,
                          ),
                        ),
                    },
                    {
                      label: t("common.acciones.eliminar"),
                      destructive: true,
                      separatorBefore: true,
                      confirmDescription: t(
                        "admin.telefonia.eliminarDescripcion",
                        { nombre: row.original.name },
                      ),
                      onSelect: () => eliminarCarrier(row.original.id),
                    },
                  ]}
                />
              ),
            }}
          />
        </TabsContent>

        <TabsContent value="numeros" className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <p className="max-w-[70ch] text-sm text-muted-foreground">
              {t("admin.telefonia.numeros.descripcion")}
            </p>
            <Button onClick={() => abrirNumero(null)}>
              <Plus />
              {t("admin.telefonia.numeros.agregar")}
            </Button>
          </div>

          <MitrolTable
            columns={numeroColumns}
            data={numeros}
            options={{
              enableRowActions: true,
              renderRowActions: ({ row }) => (
                <RowActions
                  actions={[
                    {
                      label: t("common.acciones.editar"),
                      onSelect: () => abrirNumero(row.original),
                    },
                    {
                      label: row.original.active
                        ? t("admin.telefonia.accion.desactivar")
                        : t("admin.telefonia.accion.activar"),
                      onSelect: () =>
                        setNumeros((prev) =>
                          prev.map((o) =>
                            o.id === row.original.id
                              ? { ...o, active: !o.active }
                              : o,
                          ),
                        ),
                    },
                    {
                      label: t("common.acciones.eliminar"),
                      destructive: true,
                      separatorBefore: true,
                      confirmDescription: t(
                        "admin.telefonia.numeros.eliminarDescripcion",
                        { numero: row.original.number },
                      ),
                      onSelect: () =>
                        setNumeros((prev) =>
                          prev.filter((o) => o.id !== row.original.id),
                        ),
                    },
                  ]}
                />
              ),
            }}
          />
        </TabsContent>

        <TabsContent value="tarifas" className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <p className="max-w-[70ch] text-sm text-muted-foreground">
              {t("admin.telefonia.tarifas.descripcion")}
            </p>
            <Button onClick={() => abrirRate(null)}>
              <Plus />
              {t("admin.telefonia.tarifas.agregar")}
            </Button>
          </div>

          <MitrolTable
            columns={rateColumns}
            data={carrierRates}
            options={{
              enableRowActions: true,
              renderRowActions: ({ row }) => (
                <RowActions
                  actions={[
                    {
                      label: t("common.acciones.editar"),
                      onSelect: () => abrirRate(row.original),
                    },
                    {
                      label: t("common.acciones.eliminar"),
                      destructive: true,
                      separatorBefore: true,
                      confirmDescription: t(
                        "admin.telefonia.tarifas.eliminarDescripcion",
                        { prefijo: row.original.prefix },
                      ),
                      onSelect: () =>
                        setCarrierRates((prev) =>
                          prev.filter((r) => r.id !== row.original.id),
                        ),
                    },
                  ]}
                />
              ),
            }}
          />
        </TabsContent>
      </Tabs>

      <Dialog open={numeroDialogOpen} onOpenChange={setNumeroDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingNumero
                ? t("admin.telefonia.numeros.editarTitulo", {
                    numero: editingNumero.number,
                  })
                : t("admin.telefonia.numeros.nuevo")}
            </DialogTitle>
            <DialogDescription>
              {t("admin.telefonia.numeros.dialogoDescripcion")}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="on-number">
                {t("admin.telefonia.numeros.col.numero")}
              </Label>
              <Input
                id="on-number"
                value={numeroForm.number}
                onChange={(e) =>
                  setNumeroForm((f) => ({ ...f, number: e.target.value }))
                }
                placeholder={t("admin.telefonia.numeros.numeroPlaceholder")}
                className="font-mono text-xs"
                aria-invalid={numeroRepetido}
                autoFocus
              />
              {numeroRepetido && (
                <span className="text-xs text-destructive">
                  {t("admin.telefonia.numeros.numeroRepetido")}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="on-direction">
                {t("admin.telefonia.numeros.col.direccion")}
              </Label>
              <Select
                value={numeroForm.direction}
                onValueChange={(v) =>
                  setNumeroForm((f) => ({
                    ...f,
                    direction: v as NumberDirection,
                  }))
                }
              >
                <SelectTrigger id="on-direction" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DIRECTIONS.map((direction) => (
                    <SelectItem key={direction} value={direction}>
                      {t(`admin.telefonia.numeros.direccion.${direction}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="on-carrier">
                {t("admin.telefonia.col.carrier")}
              </Label>
              <Select
                value={numeroForm.carrierId}
                onValueChange={elegirCarrierNumero}
              >
                <SelectTrigger id="on-carrier" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {activeCarriers.map((carrier) => (
                    <SelectItem key={carrier.id} value={carrier.id}>
                      {carrier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="on-region">{t("admin.campos.region")}</Label>
              <Select value={numeroForm.regionId} onValueChange={elegirRegionNumero}>
                <SelectTrigger id="on-region" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {regionesDelCarrier.map((region) => (
                    <SelectItem key={region.id} value={region.id}>
                      {region.code} · {regionLabel(region, t)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-xs text-muted-foreground">
                {t("admin.telefonia.numeros.regionAyuda")}
              </span>
            </div>
            {/* Condicional a la región elegida: solo tenants de esa región,
                más "libre" — un número no se ofrece a tenants de otra región. */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="on-tenant">
                {t("admin.telefonia.numeros.tenantLabel")}
              </Label>
              <Select
                value={numeroForm.tenantId}
                onValueChange={(v) =>
                  setNumeroForm((f) => ({ ...f, tenantId: v }))
                }
              >
                <SelectTrigger id="on-tenant" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TENANT_LIBRE}>
                    {t("admin.telefonia.numeros.tenantLibre")}
                  </SelectItem>
                  {tenantsDeRegion.map((org) => (
                    <SelectItem key={org.tenantId} value={org.tenantId}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-xs text-muted-foreground">
                {t("admin.telefonia.numeros.tenantAyuda")}
              </span>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setNumeroDialogOpen(false)}
            >
              {t("common.acciones.cancelar")}
            </Button>
            <Button onClick={guardarNumero} disabled={!puedeGuardarNumero}>
              {editingNumero
                ? t("common.acciones.guardar")
                : t("admin.telefonia.numeros.agregar")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={rateDialogOpen} onOpenChange={setRateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingRate
                ? t("admin.telefonia.tarifas.editarTitulo", {
                    prefijo: editingRate.prefix,
                  })
                : t("admin.telefonia.tarifas.nuevo")}
            </DialogTitle>
            <DialogDescription>
              {t("admin.telefonia.tarifas.dialogoDescripcion")}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="rate-carrier">
                {t("admin.telefonia.col.carrier")}
              </Label>
              <Select
                value={rateForm.carrierId}
                onValueChange={(v) =>
                  setRateForm((f) => ({ ...f, carrierId: v }))
                }
              >
                <SelectTrigger id="rate-carrier" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {anonymousCarriers.map((carrier) => (
                    <SelectItem key={carrier.id} value={carrier.id}>
                      {carrier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-xs text-muted-foreground">
                {t("admin.telefonia.tarifas.carrierAyuda")}
              </span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="rate-prefix">
                  {t("admin.telefonia.tarifas.col.prefijo")}
                </Label>
                <Input
                  id="rate-prefix"
                  value={rateForm.prefix}
                  onChange={(e) =>
                    setRateForm((f) => ({ ...f, prefix: e.target.value }))
                  }
                  placeholder="5411"
                  className="font-mono text-xs"
                  autoFocus
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="rate-value">
                  {t("admin.telefonia.tarifas.col.tarifa")}
                </Label>
                <Input
                  id="rate-value"
                  type="number"
                  step="0.0001"
                  min="0"
                  value={rateForm.ratePerMinute}
                  onChange={(e) =>
                    setRateForm((f) => ({
                      ...f,
                      ratePerMinute: e.target.value,
                    }))
                  }
                  placeholder="0.0120"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRateDialogOpen(false)}>
              {t("common.acciones.cancelar")}
            </Button>
            <Button
              onClick={guardarRate}
              disabled={
                !rateForm.prefix.trim() ||
                !rateForm.carrierId ||
                !(Number(rateForm.ratePerMinute) > 0)
              }
            >
              {editingRate
                ? t("common.acciones.guardar")
                : t("admin.telefonia.tarifas.agregar")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        {/* Alto máximo = pantalla: el título y los botones quedan fijos y solo
            el cuerpo scrollea cuando se cargan muchas regiones o destinos. */}
        <DialogContent className="flex max-h-[calc(100dvh-2rem)] flex-col sm:max-w-4xl">
          <DialogHeader className="shrink-0">
            <DialogTitle>
              {editing
                ? t("admin.telefonia.editarTitulo", { nombre: editing.name })
                : t("admin.telefonia.nuevoCarrier")}
            </DialogTitle>
            <DialogDescription>
              {t("admin.telefonia.dialogoDescripcion")}
            </DialogDescription>
          </DialogHeader>

          {/* En pantallas anchas, dos columnas: datos del carrier y whitelist a
              la izquierda, destinos SIP a la derecha; los switches abajo. */}
          <div className="-mx-4 grid min-h-0 flex-1 content-start gap-x-6 gap-y-4 overflow-y-auto overscroll-contain px-4 py-1 md:grid-cols-2">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="tf-name">{t("common.comunes.nombre")}</Label>
                <Input
                  id="tf-name"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  placeholder={t("admin.telefonia.nombrePlaceholder")}
                  autoFocus
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="tf-regions">
                  {t("admin.telefonia.col.regiones")}
                </Label>
                <RegionMultiSelect
                  id="tf-regions"
                  value={form.regionIds}
                  onChange={(regionIds) =>
                    setForm((f) => ({ ...f, regionIds }))
                  }
                />
                <span className="text-xs text-muted-foreground">
                  {t("admin.telefonia.regiones.ayuda")}
                </span>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="tf-whitelist">
                  {t("admin.telefonia.whitelistLabel")}
                </Label>
                <Textarea
                  id="tf-whitelist"
                  value={form.whitelistIps}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, whitelistIps: e.target.value }))
                  }
                  placeholder={"200.1.2.3\n200.1.2.4"}
                  rows={4}
                  className="font-mono text-xs"
                />
                <span className="text-xs text-muted-foreground">
                  {t("admin.telefonia.whitelistAyuda")}
                </span>
              </div>
            </div>

            {/* Destinos SIP: una fila por destino, con su prioridad. */}
            <div className="flex flex-col gap-1.5">
              <div className="grid grid-cols-[1fr_5rem_2.25rem] items-center gap-2">
                <Label htmlFor="tf-destination-0">
                  {t("admin.telefonia.col.destinos")}
                </Label>
                <Label htmlFor="tf-priority-0">
                  {t("admin.telefonia.prioridad")}
                </Label>
                <span />
                {form.destinations.map((d, index) => (
                  <DestinationRow
                    key={d.id}
                    index={index}
                    destination={d}
                    removeLabel={t("admin.telefonia.destinos.quitarAria")}
                    onChange={(patch) => actualizarDestino(d.id, patch)}
                    onRemove={() => quitarDestino(d.id)}
                  />
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                className="w-fit gap-1.5"
                onClick={() =>
                  setForm((f) => ({
                    ...f,
                    destinations: [...f.destinations, nuevoDestino()],
                  }))
                }
              >
                <Plus />
                {t("admin.telefonia.destinos.agregar")}
              </Button>
              <span className="text-xs text-muted-foreground">
                {t("admin.telefonia.destinos.ayuda")}
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 md:col-span-2">
              <SwitchRow
                id="tf-hidden-cli"
                label={t("admin.telefonia.cliOculto")}
                help={t("admin.telefonia.cliOcultoAyuda")}
                checked={form.allowsHiddenCli}
                onCheckedChange={(v) =>
                  setForm((f) => ({ ...f, allowsHiddenCli: v }))
                }
              />
              <SwitchRow
                id="tf-random-cli"
                label={t("admin.telefonia.cliAleatorio")}
                help={t("admin.telefonia.cliAleatorioAyuda")}
                checked={form.allowsRandomCli}
                onCheckedChange={(v) =>
                  setForm((f) => ({ ...f, allowsRandomCli: v }))
                }
              />
              <SwitchRow
                id="tf-active"
                label={t("admin.telefonia.carrierActivo")}
                checked={form.active}
                onCheckedChange={(v) => setForm((f) => ({ ...f, active: v }))}
              />
            </div>
          </div>

          <DialogFooter className="shrink-0">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {t("common.acciones.cancelar")}
            </Button>
            <Button onClick={guardar} disabled={!puedeGuardarCarrier}>
              {editing
                ? t("common.acciones.guardar")
                : t("admin.telefonia.nuevoCarrier")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Una fila de destino SIP: URI, prioridad y botón para quitarla. Vive dentro de
// la grilla de tres columnas del modal del carrier.
function DestinationRow({
  index,
  destination,
  removeLabel,
  onChange,
  onRemove,
}: {
  index: number;
  destination: DestinationForm;
  removeLabel: string;
  onChange: (patch: Partial<DestinationForm>) => void;
  onRemove: () => void;
}) {
  return (
    <>
      <Input
        id={`tf-destination-${index}`}
        value={destination.destination}
        onChange={(e) => onChange({ destination: e.target.value })}
        placeholder="sip:200.1.2.3:5060"
        className="font-mono text-xs"
      />
      <Input
        id={`tf-priority-${index}`}
        type="number"
        value={destination.priority}
        onChange={(e) => onChange({ priority: e.target.value })}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={removeLabel}
        className="text-muted-foreground hover:text-destructive"
        onClick={onRemove}
      >
        <Trash2 />
      </Button>
    </>
  );
}

// Switch con rótulo y ayuda opcional, en el recuadro que ya usa este modal.
function SwitchRow({
  id,
  label,
  help,
  checked,
  onCheckedChange,
}: {
  id: string;
  label: string;
  help?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg ring-1 ring-foreground/10 p-3">
      <div className="flex flex-col gap-0.5">
        <Label htmlFor={id}>{label}</Label>
        {help && <span className="text-xs text-muted-foreground">{help}</span>}
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}
