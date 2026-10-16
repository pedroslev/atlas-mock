"use client";

import { Phone, PhoneOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n";
import type { AgenteDirectorio } from "@/lib/pad-mock/data";

// Aviso de llamada interna entrante — igual que una llamada normal: muestra
// quién llama y el agente decide si atiende o no. Flota abajo a la derecha
// para no tapar lo que el agente esté haciendo.
export function LlamadaInternaEntrante({
  agente,
  onAtender,
  onRechazar,
}: {
  agente: AgenteDirectorio;
  onAtender: () => void;
  onRechazar: () => void;
}) {
  const t = useT();
  return (
    <div
      role="alertdialog"
      aria-label={t("padMock.llamadaInterna.entrante")}
      className="fixed right-6 bottom-6 z-50 flex w-80 flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-lg"
    >
      <div className="flex items-center gap-3">
        <span className="relative flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/20" />
          <Phone className="size-5" />
        </span>
        <div className="flex min-w-0 flex-col">
          <span className="text-xs text-muted-foreground">{t("padMock.llamadaInterna.entrante")}</span>
          <span className="truncate text-sm font-semibold">{agente.nombre}</span>
        </div>
      </div>
      <div className="flex gap-2">
        <Button type="button" variant="outline" className="flex-1 gap-1.5" onClick={onRechazar}>
          <PhoneOff className="size-4" />
          {t("padMock.llamadaInterna.rechazar")}
        </Button>
        <Button type="button" className="flex-1 gap-1.5 bg-success text-white hover:bg-success/90" onClick={onAtender}>
          <Phone className="size-4" />
          {t("padMock.llamadaInterna.atender")}
        </Button>
      </div>
    </div>
  );
}
