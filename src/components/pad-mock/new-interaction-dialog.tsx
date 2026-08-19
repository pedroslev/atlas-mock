"use client";

import { PhoneCall } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

// Placeholder del "+" de la cola — el flujo de alta todavía no está definido
// ("luego lo sigo detallando"). Por ahora solo el punto de entrada.
export function NewInteractionDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PhoneCall className="size-4 text-muted-foreground" />
            Nueva interacción
          </DialogTitle>
          <DialogDescription>
            Todavía a definir cómo se arma este flujo (a qué cliente, por qué canal, desde qué
            campaña). Por ahora es solo el punto de entrada.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
