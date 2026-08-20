import { CalendarClock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CANAL_ICON, campaniasAgenteMock } from "@/lib/pad-mock/data";

// Nav item nuevo pedido junto con Historial. A pedido, simplificado para
// esta fase: solo la lista de campañas asignadas a la agente en este turno,
// con el ícono del canal al que pertenecen — sin horarios de atención ni
// las métricas del día (interacciones, tiempo promedio, por canal), que se
// retiraron. Contenido de ejemplo, no definido en el brief.
export function StatsPanel() {
  return (
    <div className="flex h-full min-h-0 flex-col gap-4 overflow-y-auto p-4 sm:p-6">
      <h1 className="flex items-center gap-2 font-heading text-xl font-semibold">
        <CalendarClock className="size-5 text-muted-foreground" />
        Mi turno
      </h1>

      <Card size="sm">
        <CardHeader>
          <CardTitle as="h3" className="text-sm">
            Campañas asignadas
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {campaniasAgenteMock.map((c) => (
            <div key={c.id} className="flex items-center gap-2 rounded-lg border border-border px-2.5 py-2 text-sm">
              <span className="flex-1 font-medium">{c.nombre}</span>
              <span className="flex shrink-0 items-center gap-1">
                {c.canales.map((canal) => {
                  const Icon = CANAL_ICON[canal];
                  return <Icon key={canal} className="size-3.5 text-muted-foreground" />;
                })}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
