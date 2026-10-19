"use client";

import { useMemo, useState } from "react";
import { RotateCcw } from "lucide-react";
import {
  MitrolTable,
  type MRT_ColumnDef,
} from "@/components/data-table/mitrol-table";
import { ActionTooltip } from "@/components/layout/action-tooltip";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useT } from "@/lib/i18n";
import { clasificaciones } from "@/lib/mock-data";
import type { Carrier } from "@/lib/mock-telefonia";
import {
  causasQ850,
  excepcionesPorCarrier as excepcionesIniciales,
  mapeoPorDefecto as mapeoInicial,
  type CausaQ850,
  type ExcepcionesCarrier,
  type MapeoCausas,
} from "@/lib/mock-causas";
import {
  efectoClave,
  efectoVariant,
} from "@/app/(backoffice)/clasificaciones/clasificacion-dialog";

// Valores de Select: "todos" = configuración por defecto; "ninguna" = la causa
// no tiene tipificación (Select no admite value vacío).
const POR_DEFECTO = "todos";
const NINGUNA = "ninguna";

// "Contestador automático" no sale de un código Q.850 (lo detecta el
// discador), así que no se ofrece para vincular.
const CONTESTADOR_ID = "sys-contestador";
const tipificaciones = clasificaciones.filter(
  (c) => c.sistema && c.id !== CONTESTADOR_ID
);
const contestador = clasificaciones.find((c) => c.id === CONTESTADOR_ID);

// Solapa "Causas de corte" de Telefonía (propuesta 2026-10-16, a validar con
// Pedro): qué tipificación de sistema le corresponde a cada código Q.850 que
// informan los carriers. Es de Mitrol, igual para todos los tenants. Cada
// carrier puede tener excepciones cuando informa algún código distinto al
// estándar. Mock: estado local, sin persistencia.
export function CausasTab({ carriers }: { carriers: Carrier[] }) {
  const t = useT();
  const [mapeo, setMapeo] = useState<MapeoCausas>(mapeoInicial);
  const [excepciones, setExcepciones] =
    useState<Record<string, ExcepcionesCarrier>>(excepcionesIniciales);
  const [alcance, setAlcance] = useState<string>(POR_DEFECTO);
  const [soloVinculadas, setSoloVinculadas] = useState(false);

  const carrier = carriers.find((c) => c.id === alcance);
  const propias = carrier ? (excepciones[carrier.id] ?? {}) : {};

  /** Tipificación vigente para el código en el alcance elegido. */
  function vigente(codigo: number): string | undefined {
    if (carrier && codigo in propias) return propias[codigo] ?? undefined;
    return mapeo[codigo];
  }

  function asignar(codigo: number, valor: string) {
    const id = valor === NINGUNA ? null : valor;
    if (!carrier) {
      setMapeo((prev) => {
        const next = { ...prev };
        if (id) next[codigo] = id;
        else delete next[codigo];
        return next;
      });
      return;
    }
    setExcepciones((prev) => {
      const actuales = { ...(prev[carrier.id] ?? {}) };
      // Si coincide con el valor por defecto, no es una excepción.
      if ((mapeo[codigo] ?? null) === id) delete actuales[codigo];
      else actuales[codigo] = id;
      return { ...prev, [carrier.id]: actuales };
    });
  }

  function volverAlDefecto(codigo: number) {
    if (!carrier) return;
    setExcepciones((prev) => {
      const actuales = { ...(prev[carrier.id] ?? {}) };
      delete actuales[codigo];
      return { ...prev, [carrier.id]: actuales };
    });
  }

  const filas = soloVinculadas
    ? causasQ850.filter((c) => vigente(c.codigo))
    : causasQ850;

  const columns = useMemo<MRT_ColumnDef<CausaQ850>[]>(
    () => [
      {
        accessorKey: "codigo",
        header: t("admin.telefonia.causas.col.codigo"),
        size: 80,
        Cell: ({ cell }) => (
          <span className="font-mono text-sm">{cell.getValue<number>()}</span>
        ),
      },
      {
        accessorKey: "nombre",
        header: t("admin.telefonia.causas.col.causa"),
        Cell: ({ row }) => (
          <div className="flex flex-col gap-0.5">
            <span className="font-medium">{row.original.nombre}</span>
            <span className="text-xs text-muted-foreground">
              {row.original.explicacion}
            </span>
          </div>
        ),
      },
      {
        id: "tipificacion",
        header: t("admin.telefonia.causas.col.tipificacion"),
        accessorFn: (c) => vigente(c.codigo) ?? "",
        Cell: ({ row }) => {
          const codigo = row.original.codigo;
          const esExcepcion = !!carrier && codigo in propias;
          return (
            <div className="flex items-center gap-2">
              <Select
                value={vigente(codigo) ?? NINGUNA}
                onValueChange={(v) => asignar(codigo, v)}
              >
                <SelectTrigger className="w-56">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NINGUNA}>
                    {t("admin.telefonia.causas.sinTipificacion")}
                  </SelectItem>
                  {tipificaciones.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {esExcepcion && (
                <>
                  <Badge variant="warning">
                    {t("admin.telefonia.causas.propia", {
                      carrier: carrier.name,
                    })}
                  </Badge>
                  <ActionTooltip
                    label={t("admin.telefonia.causas.volverDefecto")}
                  >
                    <button
                      type="button"
                      aria-label={t("admin.telefonia.causas.volverDefecto")}
                      onClick={() => volverAlDefecto(codigo)}
                      className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
                    >
                      <RotateCcw className="size-3.5" />
                    </button>
                  </ActionTooltip>
                </>
              )}
            </div>
          );
        },
      },
      {
        id: "efecto",
        header: t("admin.telefonia.causas.col.efecto"),
        accessorFn: (c) => vigente(c.codigo) ?? "",
        Cell: ({ row }) => {
          const tip = tipificaciones.find(
            (c) => c.id === vigente(row.original.codigo)
          );
          if (!tip) return <span className="text-muted-foreground">—</span>;
          return (
            <Badge variant={efectoVariant[tip.efecto]}>
              {t(`clasificaciones.efecto.${efectoClave(tip.efecto)}`)}
            </Badge>
          );
        },
      },
    ],
    // vigente/asignar dependen de estas piezas de estado.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, mapeo, excepciones, alcance]
  );

  // Resumen: qué códigos alimentan cada tipificación en el alcance elegido.
  const resumen = tipificaciones.map((tip) => ({
    tip,
    codigos: causasQ850
      .filter((c) => vigente(c.codigo) === tip.id)
      .map((c) => c.codigo),
  }));

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_300px]">
      <div className="flex min-w-0 flex-col gap-4">
        <p className="max-w-[80ch] text-sm text-muted-foreground">
          {t("admin.telefonia.causas.descripcion")}
        </p>

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="causas-alcance">
              {t("admin.telefonia.causas.alcance")}
            </Label>
            <Select value={alcance} onValueChange={setAlcance}>
              <SelectTrigger id="causas-alcance" className="w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={POR_DEFECTO}>
                  {t("admin.telefonia.causas.porDefecto")}
                </SelectItem>
                {carriers.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="solo-vinculadas"
              checked={soloVinculadas}
              onCheckedChange={setSoloVinculadas}
              size="sm"
            />
            <Label htmlFor="solo-vinculadas" className="text-sm font-normal">
              {t("admin.telefonia.causas.soloVinculadas")}
            </Label>
          </div>
        </div>

        {carrier && (
          <p className="rounded-lg bg-warning/10 px-3 py-2 text-sm">
            {t("admin.telefonia.causas.carrierAyuda", {
              carrier: carrier.name,
            })}
          </p>
        )}

        <MitrolTable columns={columns} data={filas} />
      </div>

      <Card className="h-fit">
        <CardHeader>
          <CardTitle>{t("admin.telefonia.causas.resumen")}</CardTitle>
          <CardDescription>
            {carrier
              ? t("admin.telefonia.causas.resumenCarrier", {
                  carrier: carrier.name,
                })
              : t("admin.telefonia.causas.resumenDefecto")}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm">
          {resumen.map(({ tip, codigos }) => (
            <div
              key={tip.id}
              className="flex items-start justify-between gap-2"
            >
              <span className="font-medium">{tip.nombre}</span>
              <span className="text-right font-mono text-muted-foreground">
                {codigos.length > 0 ? codigos.join(", ") : "—"}
              </span>
            </div>
          ))}
          <div className="mt-2 flex items-start justify-between gap-2 border-t pt-3">
            <span className="font-medium">{contestador?.nombre}</span>
            <span className="text-right text-xs text-muted-foreground">
              {t("admin.telefonia.causas.contestador")}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
