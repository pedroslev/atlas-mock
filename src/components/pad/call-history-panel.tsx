"use client";

import { useMemo } from "react";
import { History } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  MitrolTable,
  type MRT_ColumnDef,
} from "@/components/data-table/mitrol-table";
import { getCampania, getClasificacion } from "@/lib/mock-data";
import {
  DIRECTION_ICON,
  formatDuration,
  type CallHistoryEntry,
} from "@/lib/mock-pad";
import { usePad } from "@/components/pad/pad-state";
import { useT } from "@/lib/i18n";

function fechaHora(iso: string): { fecha: string; hora: string } {
  // iso tipo "2026-07-17T13:52:10" → { "17/07/2026", "13:52" }
  const [date, time = ""] = iso.split("T");
  const [y, m, d] = date.split("-");
  return { fecha: `${d}/${m}/${y}`, hora: time.slice(0, 5) };
}

// Historial de llamadas con la MISMA tabla que Olimpo (MitrolTable): búsqueda
// global + filtros por columna. Ordenado SIEMPRE de más reciente a más antigua
// por defecto (sorting inicial sobre el timestamp, desc).
export function CallHistoryPanel() {
  const { history } = usePad();
  const t = useT();

  const columns = useMemo<MRT_ColumnDef<CallHistoryEntry>[]>(
    () => [
      {
        id: "direccion",
        header: t("pad.historial.tipo"),
        size: 110,
        accessorFn: (entry) =>
          entry.direction === "inbound"
            ? t("pad.historial.entrante")
            : t("pad.historial.saliente"),
        filterVariant: "select",
        Cell: ({ row }) => {
          const DirIcon = DIRECTION_ICON[row.original.direction];
          const inbound = row.original.direction === "inbound";
          return (
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <DirIcon className="size-4" aria-hidden />
              {inbound
                ? t("pad.historial.entrante")
                : t("pad.historial.saliente")}
            </span>
          );
        },
      },
      {
        accessorKey: "timestamp",
        header: t("pad.historial.fechaHora"),
        size: 150,
        Cell: ({ cell }) => {
          const { fecha, hora } = fechaHora(cell.getValue<string>());
          return (
            <span className="flex flex-col font-mono text-xs tabular-nums">
              <span>{fecha}</span>
              <span className="text-muted-foreground">{hora}</span>
            </span>
          );
        },
      },
      {
        id: "contacto",
        header: t("pad.historial.contacto"),
        accessorFn: (entry) =>
          [entry.nombre, entry.numero].filter(Boolean).join(" "),
        Cell: ({ row }) => {
          const entry = row.original;
          return (
            <div className="flex flex-col">
              {entry.nombre && (
                <span className="text-sm font-medium">{entry.nombre}</span>
              )}
              <span className="font-mono text-xs tabular-nums text-muted-foreground">
                {entry.numero}
              </span>
            </div>
          );
        },
      },
      {
        id: "campania",
        header: t("pad.campo.campania"),
        accessorFn: (entry) => getCampania(entry.campaniaId)?.nombre ?? "—",
        filterVariant: "select",
        Cell: ({ cell }) => (
          <span className="text-sm text-muted-foreground">
            {cell.getValue<string>()}
          </span>
        ),
      },
      {
        accessorKey: "durationSec",
        header: t("pad.historial.duracion"),
        size: 110,
        Cell: ({ cell }) => (
          <span className="font-mono text-xs tabular-nums">
            {formatDuration(cell.getValue<number>())}
          </span>
        ),
      },
      {
        id: "clasificacion",
        header: t("pad.campo.clasificacion"),
        accessorFn: (entry) =>
          entry.clasificacionId
            ? getClasificacion(entry.clasificacionId)?.nombre ??
              t("pad.historial.sinClasificar")
            : t("pad.historial.sinClasificar"),
        filterVariant: "select",
        Cell: ({ row }) => {
          const clas = row.original.clasificacionId
            ? getClasificacion(row.original.clasificacionId)
            : undefined;
          return clas ? (
            <Badge variant="neutral">{clas.nombre}</Badge>
          ) : (
            <span className="text-xs text-muted-foreground">
              {t("pad.historial.sinClasificar")}
            </span>
          );
        },
      },
    ],
    [t]
  );

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 p-4 sm:p-6">
      <h1 className="flex items-center gap-2 font-heading text-xl font-semibold">
        <History className="size-5 text-muted-foreground" />
        {t("pad.historial.titulo")}
      </h1>

      <div className="min-h-0 flex-1 overflow-auto">
        <MitrolTable
          columns={columns}
          data={history}
          options={{
            // Siempre de más reciente a más antigua por defecto.
            initialState: {
              sorting: [{ id: "timestamp", desc: true }],
            },
          }}
        />
      </div>
    </div>
  );
}
