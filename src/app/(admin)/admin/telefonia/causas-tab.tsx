"use client";

import { useMemo, useState } from "react";
import { ListTree } from "lucide-react";
import {
  MitrolTable,
  type MRT_ColumnDef,
} from "@/components/data-table/mitrol-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import {
  causasQ850,
  mapeoPorDefecto as mapeoInicial,
  type CausaQ850,
  type MapeoCausas,
} from "@/lib/mock-causas";
import {
  efectoClave,
  efectoVariant,
} from "@/app/(backoffice)/clasificaciones/clasificacion-dialog";

// Valor de Select para "la causa no tiene tipificación" (Select no admite
// value vacío).
const NINGUNA = "ninguna";

const tipificaciones = clasificaciones.filter((c) => c.sistema);

// Solapa "Causas de corte" de Telefonía (propuesta 2026-10-16, a validar con
// Pedro): qué tipificación de sistema le corresponde a cada código Q.850 que
// informan los carriers. Es de Mitrol, igual para todos los tenants y, por
// ahora, para todos los carriers (Tomás, 2026-10-19: sin excepciones por
// carrier). Mock: estado local, sin persistencia.
export function CausasTab() {
  const t = useT();
  const [mapeo, setMapeo] = useState<MapeoCausas>(mapeoInicial);
  const [soloVinculadas, setSoloVinculadas] = useState(false);

  function vigente(codigo: number): string | undefined {
    return mapeo[codigo];
  }

  function asignar(codigo: number, valor: string) {
    setMapeo((prev) => {
      const next = { ...prev };
      if (valor === NINGUNA) delete next[codigo];
      else next[codigo] = valor;
      return next;
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
          <div className="flex max-w-[220px] flex-col gap-0.5 whitespace-normal">
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
        Cell: ({ row }) => (
          <Select
            value={vigente(row.original.codigo) ?? NINGUNA}
            onValueChange={(v) => asignar(row.original.codigo, v)}
          >
            {/* El efecto va dentro de cada opción (y se ve también en el
                valor elegido), justificado a la derecha: ancho fijo para
                que todas las filas midan lo mismo y los pills queden
                alineados. */}
            <SelectTrigger className="w-[25rem] *:data-[slot=select-value]:flex-1 *:data-[slot=select-value]:justify-between">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NINGUNA}>
                <span className="text-muted-foreground">
                  {t("admin.telefonia.causas.sinTipificacion")}
                </span>
              </SelectItem>
              {tipificaciones.map((c) => (
                <SelectItem
                  key={c.id}
                  value={c.id}
                  className="*:[span]:last:flex-1 *:[span]:last:justify-between"
                >
                  <span>{c.nombre}</span>
                  <Badge variant={efectoVariant[c.efecto]}>
                    {t(`clasificaciones.efecto.${efectoClave(c.efecto)}`)}
                  </Badge>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ),
      },
    ],
    // vigente/asignar dependen de `mapeo`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, mapeo]
  );

  // Resumen: qué códigos alimentan cada tipificación.
  const resumen = tipificaciones.map((tip) => ({
    tip,
    codigos: causasQ850
      .filter((c) => vigente(c.codigo) === tip.id)
      .map((c) => c.codigo),
  }));

  const resumenContenido = (
    <div className="flex flex-col gap-2 text-sm">
      {resumen.map(({ tip, codigos }) => (
        <div key={tip.id} className="flex items-start justify-between gap-2">
          <span className="font-medium">{tip.nombre}</span>
          <span className="text-right font-mono text-muted-foreground">
            {codigos.length > 0 ? codigos.join(", ") : "—"}
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_300px]">
      <div className="flex min-w-0 flex-col gap-4">
        {/* Descripción y controles en una sola fila para que la tabla entre
            en pantalla: scrollea la tabla, no la página. */}
        <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-2">
          <p className="max-w-[80ch] flex-1 text-sm text-muted-foreground">
            {t("admin.telefonia.causas.descripcion")}
          </p>
          <div className="flex shrink-0 items-center gap-4">
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
            {/* En pantallas angostas el resumen no entra al costado. */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="xl:hidden">
                  <ListTree />
                  {t("admin.telefonia.causas.resumen")}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80">
                {resumenContenido}
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <MitrolTable
          columns={columns}
          data={filas}
          options={{
            muiTableContainerProps: {
              sx: { maxHeight: "calc(100vh - 25rem)" },
            },
          }}
        />
      </div>

      <Card className="hidden h-fit xl:flex">
        <CardHeader>
          <CardTitle>{t("admin.telefonia.causas.resumen")}</CardTitle>
          <CardDescription>
            {t("admin.telefonia.causas.resumenDefecto")}
          </CardDescription>
        </CardHeader>
        <CardContent>{resumenContenido}</CardContent>
      </Card>
    </div>
  );
}
