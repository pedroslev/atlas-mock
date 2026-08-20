"use client";

import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MitrolTable,
  type MRT_ColumnDef,
} from "@/components/data-table/mitrol-table";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { NuevaInteraccionForm } from "@/components/pad-mock/nueva-interaccion-form";
import { useNow, formatDuration } from "@/lib/pad-mock/use-now";
import {
  CANAL_ICON,
  CANAL_LABEL,
  campaniasAgenteMock,
  estadoAgenteMock,
  estadosAgenteDisponibles,
  historialAgenteMock,
  type CampaniaSaliente,
  type CuentaSaliente,
  type HistorialAgenteEntrada,
} from "@/lib/pad-mock/data";

// Pantalla de inicio del pad — se ve al entrar (sin interacción activa) y,
// desde el menú, es el destino fijo que unifica lo que antes eran "Mi
// turno" e "Historial" como solapas separadas (a pedido). NO es un estado
// vacío tipo error/404 — es la casa del agente, así que va con contenido a
// lo ancho, alineado a la izquierda, en 4 secciones apiladas, TODAS al
// mismo ancho (a pedido — antes 1-2 tenían un ancho distinto de 3-4 y no
// alineaban):
// 1. Datos del agente.
// 2. Nueva interacción saliente.
// 3. Campañas — grid responsive (auto-fill): usa el ancho disponible para
//    sumar columnas en vez de amontonar filas de a 2 fijas.
// 4. Historial — sin scroll propio: es la última sección, así que "seguir
//    bajando" es simplemente seguir bajando la página (como una landing
//    page), no un scroll anidado.
export function InicioPanel({
  estadoAgenteId,
  estadoAgenteDesde,
  onEstadoAgenteChange,
  campaniaIdInicial,
  cuentaIdInicial,
  onContactar,
}: {
  estadoAgenteId: string;
  estadoAgenteDesde: number;
  onEstadoAgenteChange: (id: string) => void;
  campaniaIdInicial?: string;
  cuentaIdInicial?: string;
  onContactar: (campania: CampaniaSaliente, cuenta: CuentaSaliente, numero: string) => void;
}) {
  const t = useT();
  const estado =
    estadosAgenteDisponibles.find((e) => e.id === estadoAgenteId) ?? estadosAgenteDisponibles[0];
  const disponible = estado.id === "disponible";
  const now = useNow(true);
  const cronometro = formatDuration(Math.max(0, Math.floor((now - estadoAgenteDesde) / 1000)));

  const columnasHistorial = useMemo<MRT_ColumnDef<HistorialAgenteEntrada>[]>(
    () => [
      {
        id: "canal",
        header: t("padMock.inicio.colCanal"),
        accessorFn: (h) => CANAL_LABEL[h.canal],
        filterVariant: "select",
        Cell: ({ row }) => {
          const Icon = CANAL_ICON[row.original.canal];
          return (
            <span className="flex items-center gap-2 text-muted-foreground">
              <Icon className="size-4" aria-hidden />
              {CANAL_LABEL[row.original.canal]}
            </span>
          );
        },
      },
      {
        id: "fecha",
        header: t("padMock.inicio.colFecha"),
        accessorFn: (h) => `${h.fecha} ${h.hora}`,
        Cell: ({ row }) => (
          <span className="flex flex-col font-mono text-xs tabular-nums">
            <span>{row.original.fecha}</span>
            <span className="text-muted-foreground">{row.original.hora}</span>
          </span>
        ),
      },
      {
        id: "cliente",
        header: t("padMock.inicio.colCliente"),
        accessorFn: (h) => h.nombreCliente ?? h.numeroCliente,
        Cell: ({ row }) => (
          <div className="flex flex-col">
            {row.original.nombreCliente && (
              <span className="text-sm font-medium">{row.original.nombreCliente}</span>
            )}
            <span className="font-mono text-xs tabular-nums text-muted-foreground">
              {row.original.numeroCliente}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "duracion",
        header: t("padMock.inicio.colDuracion"),
        Cell: ({ cell }) => (
          <span className="font-mono text-xs tabular-nums">{cell.getValue<string>()}</span>
        ),
      },
      {
        accessorKey: "tipificacion",
        header: t("padMock.inicio.colTipificacion"),
        Cell: ({ cell }) => <Badge variant="neutral">{cell.getValue<string>()}</Badge>,
      },
    ],
    [t]
  );

  return (
    <div className="h-full min-h-0 w-full flex-1 overflow-y-auto bg-muted/30">
      <div className="flex w-full flex-col gap-8 p-6 sm:p-8">
        <div className="flex w-full flex-col gap-6">
          {/* 1. Datos del agente — nombre, estado y cronómetro. Sin saludo
              ("Hola"): a pedido, empalaga en una herramienta de uso diario. */}
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h1 className="font-heading text-2xl font-semibold">{estadoAgenteMock.nombre}</h1>
            <div className="flex items-center gap-2 text-sm">
              <span className={cn("size-2 shrink-0 rounded-full", estado.dotClass)} aria-hidden />
              <estado.icon className="size-3.5 shrink-0 text-muted-foreground" />
              <span className="font-medium">{estado.nombre}</span>
              <span className="font-mono text-muted-foreground tabular-nums">{cronometro}</span>
            </div>
          </div>

          {/* Franja de estado — la acción vive EN el mensaje, no manda al
              agente a resolverlo en otro lado. */}
          {disponible ? (
            <div className="flex items-center gap-2.5 rounded-xl border border-border bg-card px-4 py-3 text-sm">
              <span className="relative flex size-2.5 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                <span className="relative inline-flex size-2.5 rounded-full bg-success" />
              </span>
              {t("padMock.inicio.esperando")}
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm">
              {t("padMock.inicio.noRecibiendo")}
              <Button size="sm" onClick={() => onEstadoAgenteChange("disponible")}>
                {t("padMock.inicio.pasarADisponible")}
              </Button>
            </div>
          )}

          {/* 2. Nueva interacción saliente — misma lógica que el modal del
              "+", en una barra ancha en vez de una card angosta. Foco en
              Número al montar, Enter contacta (NuevaInteraccionForm es un
              <form>). */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              {t("padMock.inicio.nuevaInteraccion")}
            </span>
            <div className="rounded-xl border border-border bg-card p-3">
              <NuevaInteraccionForm
                idPrefix="si"
                layout="row"
                campaniaIdInicial={campaniaIdInicial}
                cuentaIdInicial={cuentaIdInicial}
                onContactar={onContactar}
              />
            </div>
          </div>
        </div>

        {/* 3. Campañas — a todo el ancho. Grid auto-fill (no columnas fijas):
            suma tantas columnas como el ancho disponible permita a partir
            de ~260px por card, así con más campañas asignadas no se
            amontona todo en filas de a 2-3 — usa el ancho que tiene. */}
        <div className="flex w-full flex-col gap-2">
          <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {t("padMock.inicio.campanias")}
          </span>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-3">
            {campaniasAgenteMock.map((c) => (
              <div
                key={c.id}
                className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3"
              >
                <span className="min-w-0 flex-1 truncate text-sm font-medium">{c.nombre}</span>
                <span className="flex shrink-0 items-center gap-1.5">
                  {c.canales.map((canal) => {
                    const Icon = CANAL_ICON[canal];
                    return <Icon key={canal} className="size-4 text-muted-foreground" />;
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Historial — a todo el ancho. Sin scroll propio ni cabecera
            sticky: es la última sección de la página, así que "ver más" es
            seguir bajando la página entera (como una landing page), no un
            recuadro con scroll interno aparte. Absorbe lo que antes era
            "Últimas interacciones" (esa sección se sacó) y la vieja solapa
            "Historial". */}
        <div className="flex w-full flex-col gap-2">
          <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {t("padMock.inicio.historial")}
          </span>
          <MitrolTable
            columns={columnasHistorial}
            data={historialAgenteMock}
            options={{
              enableStickyHeader: false,
              muiTableContainerProps: { sx: {} },
            }}
          />
        </div>
      </div>
    </div>
  );
}
