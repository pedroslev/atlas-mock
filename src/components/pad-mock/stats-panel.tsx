import { BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CANAL_ICON, CANAL_LABEL, estadisticasAgenteMock } from "@/lib/pad-mock/data";

function Tile({ label, valor }: { label: string; valor: string }) {
  return (
    <Card size="sm">
      <CardContent className="flex flex-col gap-1">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="font-mono text-2xl font-semibold tabular-nums">{valor}</span>
      </CardContent>
    </Card>
  );
}

// Nav item nuevo pedido junto con Historial — contenido de ejemplo, no
// definido en el brief (que se enfoca en las 3 pantallas de interacción).
export function StatsPanel() {
  const s = estadisticasAgenteMock;
  return (
    <div className="flex h-full min-h-0 flex-col gap-4 overflow-y-auto p-4 sm:p-6">
      <h1 className="flex items-center gap-2 font-heading text-xl font-semibold">
        <BarChart3 className="size-5 text-muted-foreground" />
        Estadísticas
      </h1>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Tile label="Interacciones hoy" valor={String(s.interaccionesHoy)} />
        <Tile label="Tiempo promedio" valor={s.tiempoPromedio} />
        <Tile label="Tiempo en pausa" valor={s.tiempoEnPausa} />
        <Tile label="Objetivo del día" valor={s.cumplimientoObjetivo} />
      </div>

      <Card size="sm">
        <CardHeader>
          <CardTitle as="h3" className="text-sm">
            Por canal
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {s.porCanal.map((c) => {
            const Icon = CANAL_ICON[c.canal];
            return (
              <div key={c.canal} className="flex items-center gap-2 text-sm">
                <Icon className="size-4 shrink-0 text-muted-foreground" />
                <span className="flex-1">{CANAL_LABEL[c.canal]}</span>
                <span className="font-mono tabular-nums text-muted-foreground">{c.cantidad}</span>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
