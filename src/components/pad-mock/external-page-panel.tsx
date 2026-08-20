"use client";

import { ExternalLink, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useT } from "@/lib/i18n";
import type { PaginaExterna } from "@/lib/pad-mock/data";

// Brief §4.2 — modo embebido ("frame"): el contenido vive en la solapa,
// dentro de un <iframe> que apunta a /sistema-externo (mock de un sistema de
// terceros). A pedido, también tiene su propio botón para abrir esa misma
// URL aparte. Las páginas "pestaña aparte" ("blank") ya no pasan por acá:
// CenterColumn y LeftNav las abren directo con window.open, sin quedar
// seleccionadas.
export function ExternalPagePanel({ pagina }: { pagina: PaginaExterna }) {
  const t = useT();
  return (
    <div className="flex h-full flex-col gap-2 p-3">
      <div className="flex shrink-0 items-center justify-between gap-2">
        <Badge variant="neutral" className="w-fit gap-1.5">
          <LayoutGrid className="size-3" />
          {t("padMock.externalPage.embebido")} · {pagina.nombre}
        </Badge>
        <Button asChild variant="outline" size="sm" className="gap-1.5">
          <a href={pagina.url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="size-3.5" />
            {t("padMock.externalPage.abrirPestana")}
          </a>
        </Button>
      </div>
      <div className="min-h-0 flex-1 overflow-hidden rounded-xl ring-1 ring-foreground/10">
        <iframe src={pagina.url} title={pagina.nombre} className="h-full w-full border-0" />
      </div>
    </div>
  );
}
