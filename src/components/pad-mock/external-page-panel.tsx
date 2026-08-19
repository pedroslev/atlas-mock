import { ExternalLink, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { PaginaExterna } from "@/lib/pad-mock/data";

// Brief §4.2 — modo embebido ("frame"): el contenido vive en la solapa,
// dentro de un <iframe> que apunta a /sistema-externo (mock de un sistema de
// terceros). Modo pestaña aparte ("blank"): no ocupa lugar en el pad, la
// solapa solo ofrece reabrirla por si el agente la cerró sin querer — el
// botón abre pagina.url de verdad en una pestaña nueva. A pedido, el modo
// embebido TAMBIÉN tiene su propio botón para abrir esa misma URL aparte.
export function ExternalPagePanel({ pagina }: { pagina: PaginaExterna }) {
  if (pagina.modo === "pestana") {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <ExternalLink className="size-5" />
        </span>
        <p className="text-sm text-muted-foreground">
          &quot;{pagina.nombre}&quot; se abre en otra pestaña del navegador.
        </p>
        <Button asChild variant="outline" size="sm" className="gap-1.5">
          <a href={pagina.url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="size-3.5" />
            Volver a abrir la pestaña
          </a>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-2 p-3">
      <div className="flex shrink-0 items-center justify-between gap-2">
        <Badge variant="neutral" className="w-fit gap-1.5">
          <LayoutGrid className="size-3" />
          Embebido · {pagina.nombre}
        </Badge>
        <Button asChild variant="outline" size="sm" className="gap-1.5">
          <a href={pagina.url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="size-3.5" />
            Abrir en otra pestaña
          </a>
        </Button>
      </div>
      <div className="min-h-0 flex-1 overflow-hidden rounded-xl ring-1 ring-foreground/10">
        <iframe src={pagina.url} title={pagina.nombre} className="h-full w-full border-0" />
      </div>
    </div>
  );
}
