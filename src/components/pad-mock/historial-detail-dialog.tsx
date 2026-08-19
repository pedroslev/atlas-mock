"use client";

import { Bookmark, Sparkles, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { CANAL_ICON, CANAL_LABEL, type HistorialEntrada } from "@/lib/pad-mock/data";
import { cn } from "@/lib/utils";

// "Ver más" de una interacción pasada del historial de contacto — a pedido:
// dos columnas. La izquierda (resumen, tipificación con su descripción,
// bookmarks) es corta y no necesita scroll propio; la derecha (hilo completo)
// suele ser más larga —sobre todo una transcripción— así que se lleva la
// mayor parte del ancho y del alto disponible, para no forzar tanto scroll.
export function HistorialDetailDialog({
  entrada,
  open,
  onOpenChange,
}: {
  entrada: HistorialEntrada | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!entrada) return null;
  const Icon = CANAL_ICON[entrada.canal];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className="size-4 text-muted-foreground" />
            {CANAL_LABEL[entrada.canal]} · {entrada.fecha}
          </DialogTitle>
          <DialogDescription className="flex items-center gap-1.5">
            <User className="size-3.5" />
            Atendida por {entrada.agente}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[200px_1fr]">
          <div className="flex flex-col gap-3">
            <div className="rounded-lg bg-accent/50 p-3">
              <p className="mb-1 flex items-center gap-1.5 text-[0.65rem] font-semibold tracking-wide text-muted-foreground uppercase">
                <Sparkles className="size-3 text-primary" />
                Resumen (IA)
              </p>
              <p className="text-sm text-foreground/90">{entrada.resumenIA}</p>
            </div>

            <div>
              <p className="mb-1 text-[0.65rem] font-semibold tracking-wide text-muted-foreground uppercase">
                Tipificación
              </p>
              <Badge variant="neutral" className="mb-1">
                {entrada.tipificacion}
              </Badge>
              <p className="text-xs text-muted-foreground">{entrada.tipificacionDescripcion}</p>
            </div>

            {entrada.bookmarks.length > 0 && (
              <div>
                <p className="mb-1 text-[0.65rem] font-semibold tracking-wide text-muted-foreground uppercase">
                  Bookmarks
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

          <div className="flex max-h-[60vh] flex-col overflow-y-auto rounded-lg ring-1 ring-foreground/10">
            <p className="sticky top-0 border-b border-border bg-muted/60 px-3 py-1.5 text-[0.65rem] font-semibold tracking-wide text-muted-foreground uppercase backdrop-blur-sm">
              {entrada.canal === "llamada" ? "Transcripción" : "Conversación"}
            </p>
            <div className="flex flex-col gap-2 p-3">
              {entrada.hilo.map((t, i) => (
                <p key={i} className="text-sm leading-relaxed">
                  <span
                    className={cn(
                      "font-semibold",
                      t.autor === "agente" ? "text-primary" : "text-foreground"
                    )}
                  >
                    {t.autor === "agente" ? "Agente: " : "Cliente: "}
                  </span>
                  {t.texto}
                </p>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
