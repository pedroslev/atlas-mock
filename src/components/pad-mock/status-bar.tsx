import { CircleCheck, Mic, PhoneOff, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { estadoAgenteMock } from "@/lib/pad-mock/data";

// Brief §2: "arriba de las tres [columnas], una barra fina con el estado del
// agente, un cronómetro de ese estado, y los controles generales." Deliberadamente
// angosta (h-10) — no compite en altura con el header real de la app.
export function StatusBar({ enLlamada }: { enLlamada?: boolean }) {
  return (
    <div className="flex h-10 shrink-0 items-center gap-3 border-b border-border bg-card px-3 text-sm">
      <Badge variant="success" className="gap-1">
        <CircleCheck className="size-3" />
        {estadoAgenteMock.estado}
      </Badge>
      <span className="font-mono text-xs text-muted-foreground tabular-nums">
        {estadoAgenteMock.cronometro}
      </span>
      <span className="text-xs text-muted-foreground">{estadoAgenteMock.nombre}</span>

      <div className="ml-auto flex items-center gap-1">
        {enLlamada && (
          <>
            <Button variant="ghost" size="icon-sm" aria-label="Silenciar">
              <Mic className="size-4" />
            </Button>
            <Button variant="ghost" size="icon-sm" aria-label="Cortar">
              <PhoneOff className="size-4 text-destructive" />
            </Button>
          </>
        )}
        <Button variant="ghost" size="icon-sm" aria-label="Configuración">
          <Settings className="size-4" />
        </Button>
      </div>
    </div>
  );
}
