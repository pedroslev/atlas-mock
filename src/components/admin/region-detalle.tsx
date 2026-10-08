"use client";

import { useMemo, useState } from "react";
import { KeyRound, Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { RowActions } from "@/components/data-table/row-actions";
import {
  MitrolTable,
  type MRT_ColumnDef,
} from "@/components/data-table/mitrol-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { useFormatoFecha } from "@/app/(backoffice)/configuracion/claves-api/componentes";
import {
  regionBadgeVariant,
  regionLabel,
  type Region,
} from "@/lib/mock-admin";
import {
  clavesDeRegion,
  proveedoresIa,
  type ClaveProveedorIa,
  type ProveedorIa,
} from "@/lib/mock-proveedores-ia";
import { useT } from "@/lib/i18n";

// Fila de la tabla: una clave cargada y el proveedor al que pertenece.
type FilaClave = ClaveProveedorIa & { proveedor: ProveedorIa };

// Diálogo abierto: agregar una clave nueva (se elige el proveedor) o rotar la
// de un proveedor que ya tiene.
type Dialogo = { modo: "agregar" } | { modo: "rotar"; proveedor: ProveedorIa };

// Detalle de una región (cluster) en Zeus: sus datos y las claves de los
// proveedores de IA del cluster (ADR-DATOS-003). La clave se escribe una vez y
// no se vuelve a mostrar; Zeus la propaga al OpenBao del cluster. Mock: el
// estado es local y no persiste.
export function RegionDetalle({ region }: { region: Region }) {
  const t = useT();
  const fecha = useFormatoFecha();
  const nombreRegion = regionLabel(region, t);

  const [claves, setClaves] = useState(() => clavesDeRegion(region.id));
  const [dialogo, setDialogo] = useState<Dialogo | null>(null);
  const [proveedorId, setProveedorId] = useState("");
  const [valor, setValor] = useState("");

  // Solo las claves cargadas, en el orden del catálogo de proveedores.
  const filas = useMemo<FilaClave[]>(
    () =>
      proveedoresIa
        .filter((p) => claves[p.id])
        .map((p) => ({ ...claves[p.id], proveedor: p })),
    [claves]
  );
  // Proveedores que todavía no tienen clave en esta región: los que se
  // pueden elegir al agregar.
  const sinClave = proveedoresIa.filter((p) => !claves[p.id]);

  function abrirAgregar() {
    setValor("");
    setProveedorId(sinClave[0]?.id ?? "");
    setDialogo({ modo: "agregar" });
  }

  function abrirRotar(proveedor: ProveedorIa) {
    setValor("");
    setProveedorId(proveedor.id);
    setDialogo({ modo: "rotar", proveedor });
  }

  // Guarda solo lo que Zeus conserva de la clave: los últimos 4 caracteres y
  // cuándo se rotó. El valor completo iría al OpenBao del cluster.
  function guardar() {
    if (!dialogo || !proveedorId || !valor.trim()) return;
    const limpia = valor.trim();
    setClaves((prev) => ({
      ...prev,
      [proveedorId]: {
        regionId: region.id,
        proveedorId,
        finalizacion: limpia.slice(-4),
        rotadaEl: new Date().toISOString(),
      },
    }));
    setDialogo(null);
  }

  function quitar(proveedorId: string) {
    setClaves((prev) => {
      const resto = { ...prev };
      delete resto[proveedorId];
      return resto;
    });
  }

  const columns = useMemo<MRT_ColumnDef<FilaClave>[]>(
    () => [
      {
        id: "proveedor",
        header: t("admin.proveedoresIa.col.proveedor"),
        accessorFn: (fila) => fila.proveedor.nombre,
        Cell: ({ row }) => (
          <span className="font-medium">{row.original.proveedor.nombre}</span>
        ),
      },
      {
        accessorKey: "finalizacion",
        header: t("admin.proveedoresIa.col.clave"),
        enableColumnFilter: false,
        Cell: ({ row }) => (
          <span className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
            <KeyRound className="size-3.5 shrink-0" />
            ••••{row.original.finalizacion}
          </span>
        ),
      },
      {
        accessorKey: "rotadaEl",
        header: t("admin.proveedoresIa.col.ultimaRotacion"),
        enableColumnFilter: false,
        Cell: ({ row }) => fecha.format(new Date(row.original.rotadaEl)),
      },
    ],
    [t, fecha]
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={nombreRegion}
        description={region.regionUrl}
        backHref="/admin/regiones"
      />

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>{t("admin.regiones.form.datosRegion")}</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 text-sm">
            <dt className="text-muted-foreground">{t("admin.regiones.col.codigo")}</dt>
            <dd>
              <Badge variant={regionBadgeVariant(region.code)}>{region.code}</Badge>
            </dd>
            <dt className="text-muted-foreground">{t("admin.regiones.col.url")}</dt>
            <dd className="font-mono text-xs">{region.regionUrl}</dd>
            <dt className="text-muted-foreground">{t("admin.regiones.col.anotaciones")}</dt>
            <dd>{region.annotations ?? <span className="text-muted-foreground">—</span>}</dd>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("admin.proveedoresIa.titulo")}</CardTitle>
          <CardAction>
            <Button
              onClick={abrirAgregar}
              disabled={sinClave.length === 0}
              data-testid="agregar-clave-proveedor-ia"
            >
              <Plus />
              {t("admin.proveedoresIa.agregar")}
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            {t("admin.proveedoresIa.descripcion", { region: nombreRegion })}
          </p>
          <MitrolTable
            columns={columns}
            data={filas}
            options={{
              enableRowActions: true,
              renderRowActions: ({ row }) => (
                <RowActions
                  actions={[
                    {
                      label: t("admin.proveedoresIa.rotar"),
                      onSelect: () => abrirRotar(row.original.proveedor),
                    },
                    {
                      label: t("admin.proveedoresIa.quitar"),
                      destructive: true,
                      separatorBefore: true,
                      confirmDescription: t("admin.proveedoresIa.quitarConfirmacion", {
                        proveedor: row.original.proveedor.nombre,
                        region: nombreRegion,
                      }),
                      onSelect: () => quitar(row.original.proveedorId),
                    },
                  ]}
                />
              ),
            }}
          />
        </CardContent>
      </Card>

      <Dialog open={dialogo !== null} onOpenChange={(open) => !open && setDialogo(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {dialogo?.modo === "rotar"
                ? t("admin.proveedoresIa.rotarTitulo", { proveedor: dialogo.proveedor.nombre })
                : t("admin.proveedoresIa.agregarTitulo")}
            </DialogTitle>
            <DialogDescription>
              {t(
                dialogo?.modo === "rotar"
                  ? "admin.proveedoresIa.rotarDescripcion"
                  : "admin.proveedoresIa.cargarDescripcion",
                { region: nombreRegion }
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            {/* Al agregar se elige el proveedor; al rotar ya está fijo. */}
            {dialogo?.modo === "agregar" && (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="proveedor-ia">{t("admin.proveedoresIa.col.proveedor")}</Label>
                <Select value={proveedorId} onValueChange={setProveedorId}>
                  <SelectTrigger id="proveedor-ia" className="w-full" data-testid="clave-proveedor-ia-proveedor">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sinClave.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="clave-proveedor">{t("admin.proveedoresIa.col.clave")}</Label>
              <Input
                id="clave-proveedor"
                type="password"
                autoComplete="off"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                className="font-mono"
                autoFocus
                data-testid="clave-proveedor-ia-valor"
              />
              <p className="text-xs text-muted-foreground">
                {t("admin.proveedoresIa.ayudaClave")}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogo(null)}>
              {t("common.acciones.cancelar")}
            </Button>
            <Button
              onClick={guardar}
              disabled={!proveedorId || !valor.trim()}
              data-testid="guardar-clave-proveedor-ia"
            >
              {t("admin.proveedoresIa.guardar")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
