"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ExternalPagePanel } from "@/components/pad-mock/external-page-panel";
import type { PaginaExterna } from "@/lib/pad-mock/data";

// Un acceso rápido no pertenece a ninguna interacción, así que no tiene
// solapa propia en el centro (esas son por interacción) — se abre en un
// diálogo, con el MISMO componente y los mismos dos modos (embebido/pestaña)
// que las páginas externas de una interacción.
export function QuickAccessDialog({
  pagina,
  open,
  onOpenChange,
}: {
  pagina: PaginaExterna;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{pagina.nombre}</DialogTitle>
        </DialogHeader>
        <div className="h-64">
          <ExternalPagePanel pagina={pagina} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
