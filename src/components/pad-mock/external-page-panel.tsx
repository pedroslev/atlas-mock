import { ExternalLink, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OpenQuestion } from "@/components/pad-mock/open-question";
import type { PaginaExterna } from "@/lib/pad-mock/data";

// Brief §4.2 — modo embebido: el contenido vive en la solapa. Modo pestaña
// aparte: no ocupa lugar en el pad, la solapa solo ofrece reabrirla por si el
// agente la cerró sin querer.
export function ExternalPagePanel({ pagina }: { pagina: PaginaExterna }) {
  if (pagina.modo === "pestana") {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <ExternalLink className="size-5" />
        </span>
        <p className="text-sm text-muted-foreground">
          &quot;{pagina.nombre}&quot; se abrió en otra pestaña del navegador.
        </p>
        <Button variant="outline" size="sm" className="gap-1.5">
          <ExternalLink className="size-3.5" />
          Volver a abrir la pestaña
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-3 p-4">
      <div className="flex items-center gap-2 rounded-lg border border-dashed border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
        <LayoutGrid className="size-3.5 shrink-0" />
        Contenido embebido de &quot;{pagina.nombre}&quot; (mock)
      </div>
      <div className="flex flex-1 items-center justify-center rounded-xl border border-border bg-card p-6 text-center">
        <p className="max-w-sm text-sm text-muted-foreground">{pagina.contenido}</p>
      </div>
      <OpenQuestion>si este sistema se deja embeber de verdad — con sistemas viejos puede que no.</OpenQuestion>
    </div>
  );
}
