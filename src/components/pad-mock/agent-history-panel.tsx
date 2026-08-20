"use client";

import { useMemo } from "react";
import { History } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  MitrolTable,
  type MRT_ColumnDef,
} from "@/components/data-table/mitrol-table";
import { useT } from "@/lib/i18n";
import {
  CANAL_ICON,
  CANAL_LABEL,
  historialAgenteMock,
  type HistorialAgenteEntrada,
} from "@/lib/pad-mock/data";

// Historial DEL AGENTE: la totalidad de lo que gestionó, cualquier canal.
// A propósito distinto del historial que se ve DENTRO de una interacción
// (context-column.tsx), que es el histórico de contacto de ESE cliente
// puntual — para no confundir los dos en la demo del lunes.
//
// A pedido: misma tabla que el resto de Olimpo (MitrolTable), ocupando
// todo el panel — antes era la tabla shadcn simple, sin buscador/filtros
// ni ocupar el alto disponible.
export function AgentHistoryPanel() {
  const t = useT();

  const columns = useMemo<MRT_ColumnDef<HistorialAgenteEntrada>[]>(
    () => [
      {
        id: "canal",
        header: t("padMock.agentHistory.colCanal"),
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
        header: t("padMock.agentHistory.colFecha"),
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
        header: t("padMock.agentHistory.colCliente"),
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
        header: t("padMock.agentHistory.colDuracion"),
        Cell: ({ cell }) => (
          <span className="font-mono text-xs tabular-nums">{cell.getValue<string>()}</span>
        ),
      },
      {
        accessorKey: "tipificacion",
        header: t("padMock.agentHistory.colTipificacion"),
        Cell: ({ cell }) => <Badge variant="neutral">{cell.getValue<string>()}</Badge>,
      },
    ],
    [t]
  );

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col gap-3 p-4 sm:p-6">
      <h1 className="flex shrink-0 items-center gap-2 font-heading text-xl font-semibold">
        <History className="size-5 text-muted-foreground" />
        {t("padMock.agentHistory.titulo")}
      </h1>

      <div className="min-h-0 flex-1">
        <MitrolTable columns={columns} data={historialAgenteMock} fillHeight />
      </div>
    </div>
  );
}
