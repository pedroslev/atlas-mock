import { ExternalLink, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
      <Badge variant="neutral" className="w-fit gap-1.5">
        <LayoutGrid className="size-3" />
        Embebido · {pagina.nombre}
      </Badge>
      <div className="flex flex-1 items-center justify-center rounded-xl bg-muted/40 p-6 text-center ring-1 ring-foreground/10">
        <p className="max-w-sm text-sm text-muted-foreground">{pagina.contenido}</p>
      </div>
      <OpenQuestion>si este sistema se deja embeber de verdad — con sistemas viejos puede que no.</OpenQuestion>
    </div>
  );
}
