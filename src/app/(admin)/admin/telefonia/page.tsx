"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
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
} from "@/lib/mock-admin";
import {
  carriers as carriersIniciales,
  outboundNumbers as outboundNumbersIniciales,
  carrierRates as carrierRatesIniciales,
  getCarrier,
  getActiveCarriers,
  type Carrier,
  type OutboundNumber,
  type CarrierRate,
} from "@/lib/mock-telefonia";
import { useT } from "@/lib/i18n";

const emptyForm = {
  name: "",
  regionId: regions[0].id,
  destination: "",
  priority: "10",
  whitelistIps: "",
  allowsAnonymousOutbound: false,
  active: true,
};

const emptyOutboundForm = {
  number: "",
  carrierId: "",
};

const emptyRateForm = {
  carrierId: "",
  prefix: "",
  ratePerMinute: "",
};

// Administración de Kamailio por región (alta de proveedores/carriers). Ver
// documentacion/relevamiento-legacy/administracion-kamailio/propuesta/ —
// media-api es el dueño real de esto (CRUD sobre `dispatcher`/`address` +
// reload en caliente); acá es mock de pantalla, estado local sin persistencia.
export default function TelefoniaPage() {
  const t = useT();
  const [carriers, setCarriers] = useState<Carrier[]>(carriersIniciales);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Carrier | null>(null);
  const [form, setForm] = useState(emptyForm);

  const [outboundNumbers, setOutboundNumbers] = useState<OutboundNumber[]>(
    outboundNumbersIniciales,
  );
  const [outboundDialogOpen, setOutboundDialogOpen] = useState(false);
  const [editingOutbound, setEditingOutbound] = useState<OutboundNumber | null>(
    null,
  );
  const [outboundForm, setOutboundForm] = useState(emptyOutboundForm);

  const [carrierRates, setCarrierRates] = useState<CarrierRate[]>(
    carrierRatesIniciales,
  );
  const [rateDialogOpen, setRateDialogOpen] = useState(false);
  const [editingRate, setEditingRate] = useState<CarrierRate | null>(null);
  const [rateForm, setRateForm] = useState(emptyRateForm);

  const activeCarriers = getActiveCarriers();
  const anonymousCarriers = activeCarriers.filter(
    (c) => c.allowsAnonymousOutbound,
  );

  function abrir(carrier: Carrier | null) {
    setEditing(carrier);
    setForm(
      carrier
        ? {
            name: carrier.name,
            regionId: carrier.regionId,
            destination: carrier.destination,
            priority: String(carrier.priority),
            whitelistIps: carrier.whitelistIps.join("\n"),
            allowsAnonymousOutbound: carrier.allowsAnonymousOutbound,
            active: carrier.active,
          }
        : emptyForm,
    );
    setDialogOpen(true);
  }

  function guardar() {
    if (!form.name.trim() || !form.destination.trim()) return;
    const whitelistIps = form.whitelistIps
      .split("\n")
      .map((ip) => ip.trim())
      .filter(Boolean);
    const priority = Number(form.priority) || 0;

    if (editing) {
      setCarriers((prev) =>
        prev.map((c) =>
          c.id === editing.id
            ? {
                ...c,
                name: form.name.trim(),
                regionId: form.regionId,
                destination: form.destination.trim(),
                priority,
                whitelistIps,
                allowsAnonymousOutbound: form.allowsAnonymousOutbound,
                active: form.active,
              }
            : c,
        ),
      );
    } else {
      setCarriers((prev) => [
        ...prev,
        {
          id: `carrier-nuevo-${prev.length}-${Date.now()}`,
          name: form.name.trim(),
          regionId: form.regionId,
          destination: form.destination.trim(),
          priority,
          whitelistIps,
          allowsAnonymousOutbound: form.allowsAnonymousOutbound,
          active: form.active,
        },
      ]);
    }
    setDialogOpen(false);
  }

  function abrirOutbound(entry: OutboundNumber | null) {
    setEditingOutbound(entry);
    setOutboundForm(
      entry
        ? { number: entry.number, carrierId: entry.carrierId }
        : { ...emptyOutboundForm, carrierId: activeCarriers[0]?.id ?? "" },
    );
    setOutboundDialogOpen(true);
  }

  function guardarOutbound() {
    const number = outboundForm.number.replace(/\D/g, "");
    if (!number || !outboundForm.carrierId) return;

    if (editingOutbound) {
      setOutboundNumbers((prev) =>
        prev.map((o) =>
          o.id === editingOutbound.id
            ? { ...o, number, carrierId: outboundForm.carrierId }
            : o,
        ),
      );
    } else {
      setOutboundNumbers((prev) => [
        ...prev,
        {
          id: `outbound-nuevo-${prev.length}-${Date.now()}`,
          number,
          carrierId: outboundForm.carrierId,
          active: true,
        },
      ]);
    }
    setOutboundDialogOpen(false);
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
          id: `rate-nuevo-${prev.length}-${Date.now()}`,
          carrierId: rateForm.carrierId,
          prefix,
          ratePerMinute,
          currency: "USD",
        },
      ]);
    }
    setRateDialogOpen(false);
  }

  const outboundColumns = useMemo<MRT_ColumnDef<OutboundNumber>[]>(
    () => [
      {
        accessorKey: "number",
        header: t("admin.telefonia.salientes.col.numero"),
        Cell: ({ cell }) => (
          <span className="font-mono text-xs">{cell.getValue<string>()}</span>
        ),
      },
      {
        id: "carrier",
        header: t("admin.telefonia.salientes.col.carrier"),
        accessorFn: (entry) => getCarrier(entry.carrierId)?.name ?? "—",
        Cell: ({ row }) => (
          <span className="font-medium">
            {getCarrier(row.original.carrierId)?.name ?? "—"}
          </span>
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
    [t],
  );

  const rateColumns = useMemo<MRT_ColumnDef<CarrierRate>[]>(
    () => [
      {
        id: "carrier",
        header: t("admin.telefonia.salientes.col.carrier"),
        accessorFn: (rate) => getCarrier(rate.carrierId)?.name ?? "—",
        Cell: ({ row }) => (
          <span className="font-medium">
            {getCarrier(row.original.carrierId)?.name ?? "—"}
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
    [t],
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
        id: "region",
        header: t("admin.campos.region"),
        accessorFn: (carrier) => getRegion(carrier.regionId)?.code ?? "—",
        Cell: ({ row }) => {
          const region = getRegion(row.original.regionId);
          if (!region) return <span className="text-muted-foreground">—</span>;
          return (
            <Badge variant={regionBadgeVariant(region.code)}>
              {region.code}
            </Badge>
          );
        },
      },
      {
        accessorKey: "destination",
        header: t("admin.telefonia.col.destino"),
        Cell: ({ cell }) => (
          <span className="font-mono text-xs">{cell.getValue<string>()}</span>
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

      <Tabs defaultValue="proveedores">
        <TabsList>
          <TabsTrigger value="proveedores">
            {t("admin.telefonia.tab.proveedores")}
          </TabsTrigger>
          <TabsTrigger value="salientes">
            {t("admin.telefonia.tab.salientes")}
          </TabsTrigger>
          <TabsTrigger value="tarifas">
            {t("admin.telefonia.tab.tarifas")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="proveedores" className="flex flex-col gap-4">
          <div className="flex justify-end">
            <Button onClick={() => abrir(null)}>
              <Plus />
              {t("admin.telefonia.nuevoProveedor")}
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
                      onSelect: () =>
                        setCarriers((prev) =>
                          prev.filter((c) => c.id !== row.original.id),
                        ),
                    },
                  ]}
                />
              ),
            }}
          />
        </TabsContent>

        <TabsContent value="salientes" className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <p className="max-w-[70ch] text-sm text-muted-foreground">
              {t("admin.telefonia.salientes.descripcion")}
            </p>
            <Button onClick={() => abrirOutbound(null)}>
              <Plus />
              {t("admin.telefonia.salientes.agregar")}
            </Button>
          </div>

          <MitrolTable
            columns={outboundColumns}
            data={outboundNumbers}
            options={{
              enableRowActions: true,
              renderRowActions: ({ row }) => (
                <RowActions
                  actions={[
                    {
                      label: t("common.acciones.editar"),
                      onSelect: () => abrirOutbound(row.original),
                    },
                    {
                      label: row.original.active
                        ? t("admin.telefonia.accion.desactivar")
                        : t("admin.telefonia.accion.activar"),
                      onSelect: () =>
                        setOutboundNumbers((prev) =>
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
                        "admin.telefonia.salientes.eliminarDescripcion",
                        { numero: row.original.number },
                      ),
                      onSelect: () =>
                        setOutboundNumbers((prev) =>
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

      <Dialog open={outboundDialogOpen} onOpenChange={setOutboundDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingOutbound
                ? t("admin.telefonia.salientes.editarTitulo", {
                    numero: editingOutbound.number,
                  })
                : t("admin.telefonia.salientes.nuevo")}
            </DialogTitle>
            <DialogDescription>
              {t("admin.telefonia.salientes.dialogoDescripcion")}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="on-number">
                {t("admin.telefonia.salientes.col.numero")}
              </Label>
              <Input
                id="on-number"
                value={outboundForm.number}
                onChange={(e) =>
                  setOutboundForm((f) => ({ ...f, number: e.target.value }))
                }
                placeholder={t("admin.telefonia.salientes.numeroPlaceholder")}
                className="font-mono text-xs"
                autoFocus
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="on-carrier">
                {t("admin.telefonia.salientes.col.carrier")}
              </Label>
              <Select
                value={outboundForm.carrierId}
                onValueChange={(v) =>
                  setOutboundForm((f) => ({ ...f, carrierId: v }))
                }
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
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOutboundDialogOpen(false)}
            >
              {t("common.acciones.cancelar")}
            </Button>
            <Button
              onClick={guardarOutbound}
              disabled={!outboundForm.number.trim() || !outboundForm.carrierId}
            >
              {editingOutbound
                ? t("common.acciones.guardar")
                : t("admin.telefonia.salientes.agregar")}
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
                {t("admin.telefonia.salientes.col.carrier")}
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
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editing
                ? t("admin.telefonia.editarTitulo", { nombre: editing.name })
                : t("admin.telefonia.nuevoProveedor")}
            </DialogTitle>
            <DialogDescription>
              {t("admin.telefonia.dialogoDescripcion")}
            </DialogDescription>
          </DialogHeader>
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
              <Label htmlFor="tf-region">{t("admin.campos.region")}</Label>
              <Select
                value={form.regionId}
                onValueChange={(v) => setForm((f) => ({ ...f, regionId: v }))}
              >
                <SelectTrigger id="tf-region" className="w-full">
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

            <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="tf-destination">
                  {t("admin.telefonia.col.destino")}
                </Label>
                <Input
                  id="tf-destination"
                  value={form.destination}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, destination: e.target.value }))
                  }
                  placeholder="sip:200.1.2.3:5060"
                  className="font-mono text-xs"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="tf-priority">
                  {t("admin.telefonia.prioridad")}
                </Label>
                <Input
                  id="tf-priority"
                  type="number"
                  className="w-24"
                  value={form.priority}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, priority: e.target.value }))
                  }
                />
              </div>
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
                rows={3}
                className="font-mono text-xs"
              />
              <span className="text-xs text-muted-foreground">
                {t("admin.telefonia.whitelistAyuda")}
              </span>
            </div>

            <div className="flex items-start justify-between gap-4 rounded-lg ring-1 ring-foreground/10 p-3">
              <div className="flex flex-col gap-0.5">
                <Label htmlFor="tf-anonymous">
                  {t("admin.telefonia.salidaAnonima")}
                </Label>
                <span className="text-xs text-muted-foreground">
                  {t("admin.telefonia.salidaAnonimaAyuda")}
                </span>
              </div>
              <Switch
                id="tf-anonymous"
                checked={form.allowsAnonymousOutbound}
                onCheckedChange={(v) =>
                  setForm((f) => ({ ...f, allowsAnonymousOutbound: v }))
                }
              />
            </div>

            <div className="flex items-start justify-between gap-4 rounded-lg ring-1 ring-foreground/10 p-3">
              <div className="flex flex-col gap-0.5">
                <Label htmlFor="tf-active">
                  {t("admin.telefonia.proveedorActivo")}
                </Label>
              </div>
              <Switch
                id="tf-active"
                checked={form.active}
                onCheckedChange={(v) => setForm((f) => ({ ...f, active: v }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {t("common.acciones.cancelar")}
            </Button>
            <Button
              onClick={guardar}
              disabled={!form.name.trim() || !form.destination.trim()}
            >
              {editing
                ? t("common.acciones.guardar")
                : t("admin.telefonia.nuevoProveedor")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
