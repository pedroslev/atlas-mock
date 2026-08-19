import { History } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CANAL_ICON, CANAL_LABEL, historialAgenteMock } from "@/lib/pad-mock/data";

// Historial DEL AGENTE: la totalidad de lo que gestionó, cualquier canal.
// A propósito distinto del historial que se ve DENTRO de una interacción
// (context-column.tsx), que es el histórico de contacto de ESE cliente
// puntual — para no confundir los dos en la demo del lunes.
export function AgentHistoryPanel() {
  return (
    <div className="flex h-full min-h-0 flex-col gap-4 overflow-y-auto p-4 sm:p-6">
      <div>
        <h1 className="flex items-center gap-2 font-heading text-xl font-semibold">
          <History className="size-5 text-muted-foreground" />
          Historial
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tus gestiones, en cualquier canal. Distinto del historial de contacto de un
          cliente puntual, que se ve dentro de cada interacción.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl ring-1 ring-foreground/10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Canal</TableHead>
              <TableHead>Fecha y hora</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Duración</TableHead>
              <TableHead>Tipificación</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {historialAgenteMock.map((h) => {
              const Icon = CANAL_ICON[h.canal];
              return (
                <TableRow key={h.id}>
                  <TableCell>
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <Icon className="size-4" aria-hidden />
                      {CANAL_LABEL[h.canal]}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="flex flex-col font-mono text-xs tabular-nums">
                      <span>{h.fecha}</span>
                      <span className="text-muted-foreground">{h.hora}</span>
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      {h.nombreCliente && (
                        <span className="text-sm font-medium">{h.nombreCliente}</span>
                      )}
                      <span className="font-mono text-xs tabular-nums text-muted-foreground">
                        {h.numeroCliente}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs tabular-nums">{h.duracion}</TableCell>
                  <TableCell>
                    <Badge variant="neutral">{h.tipificacion}</Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
