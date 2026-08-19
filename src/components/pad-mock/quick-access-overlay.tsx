"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExternalPagePanel } from "@/components/pad-mock/external-page-panel";
import type { PaginaExterna } from "@/lib/pad-mock/data";

// A pedido: un acceso rápido NO abre un modal — ocupa toda la pantalla de
// Hermes salvo el menú izquierdo y el navbar (los dos quedan fuera de este
// componente: LeftNav es hermano suyo en pad-mock-shell.tsx, y el navbar lo
// pone layout.tsx por encima de todo). Mismo contenido que una página
// externa de una interacción (ExternalPagePanel), reutilizado tal cual.
export function QuickAccessOverlay({
  pagina,
  onClose,
}: {
  pagina: PaginaExterna;
  onClose: () => void;
}) {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <div className="flex h-10 shrink-0 items-center gap-2 border-b border-border bg-card px-3">
        <span className="text-sm font-medium">{pagina.nombre}</span>
        <Button
          variant="ghost"
          size="icon-sm"
          className="ml-auto"
          aria-label="Cerrar"
          onClick={onClose}
        >
          <X className="size-4" />
        </Button>
      </div>
      <div className="min-h-0 flex-1">
        <ExternalPagePanel pagina={pagina} />
      </div>
    </div>
  );
}
