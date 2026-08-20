"use client";

import { PhoneCall } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useT } from "@/lib/i18n";
import { NuevaInteraccionForm } from "@/components/pad-mock/nueva-interaccion-form";
import type { CampaniaSaliente, CuentaSaliente } from "@/lib/pad-mock/data";

// "+" de la cola — el formulario en sí (campaña → cuenta → número) vive en
// NuevaInteraccionForm, compartido con el panel que se ve al ingresar sin
// interacciones activas (sin-interaccion-panel.tsx). Acá solo se pone el
// envoltorio de modal.
export function NewInteractionDialog({
  open,
  onOpenChange,
  onContactar,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContactar: (campania: CampaniaSaliente, cuenta: CuentaSaliente, numero: string) => void;
}) {
  const t = useT();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PhoneCall className="size-4 text-muted-foreground" />
            {t("padMock.newInteractionDialog.titulo")}
          </DialogTitle>
          <DialogDescription>{t("padMock.newInteractionDialog.descripcion")}</DialogDescription>
        </DialogHeader>

        <NuevaInteraccionForm
          idPrefix="ni"
          onContactar={(campania, cuenta, numero) => {
            onContactar(campania, cuenta, numero);
            onOpenChange(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
