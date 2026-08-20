"use client";

import { Bookmark, Clock, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useT } from "@/lib/i18n";
import { CANAL_ICON, CANAL_LABEL, type HistorialEntrada } from "@/lib/pad-mock/data";

// "Ver más" de una interacción pasada del historial de contacto — a pedido,
// se sacaron el resumen (IA) y la transcripción/conversación completa;
// queda solo tipificación (con su descripción) y bookmarks, así que ya no
// hace falta el layout de dos columnas de antes.
export function HistorialDetailDialog({
  entrada,
  open,
  onOpenChange,
}: {
  entrada: HistorialEntrada | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useT();
  if (!entrada) return null;
  const Icon = CANAL_ICON[entrada.canal];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex flex-wrap items-center gap-x-2 gap-y-1 text-base">
            <span className="flex items-center gap-1.5">
              <Icon className="size-4 text-muted-foreground" />
              {CANAL_LABEL[entrada.canal]} · {entrada.fecha}
            </span>
            <span className="flex items-center gap-1 text-sm font-normal text-muted-foreground">
              <Clock className="size-3.5" />
              {entrada.duracion}
            </span>
            <span className="flex items-center gap-1 text-sm font-normal text-muted-foreground">
              <User className="size-3.5" />
              {entrada.agente}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <div>
            <p className="mb-1 text-[0.65rem] font-semibold tracking-wide text-muted-foreground uppercase">
              {t("padMock.historialDetalle.tipificacion")}
            </p>
            <Badge variant="neutral" className="mb-1">
              {entrada.tipificacion}
            </Badge>
            <p className="text-xs text-muted-foreground">{entrada.tipificacionDescripcion}</p>
          </div>

          {entrada.bookmarks.length > 0 && (
            <div>
              <p className="mb-1 text-[0.65rem] font-semibold tracking-wide text-muted-foreground uppercase">
                {t("padMock.historialDetalle.bookmarks")}
              </p>
              <div className="flex flex-wrap gap-1">
                {entrada.bookmarks.map((b) => (
                  <Badge key={b} variant="info" className="gap-1">
                    <Bookmark className="size-2.5" />
                    {b}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
