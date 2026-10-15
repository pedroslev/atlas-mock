"use client";

import { CircleHelp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useT } from "@/lib/i18n";
import type { Etiqueta, ViaCarga } from "@/lib/mock-clientes";
import { formatFecha } from "@/lib/mock-clientes";

// Las etiquetas se ven siempre en MAYÚSCULA. El color es libre (hex): el fondo
// es una versión suave del color y el texto una más oscura, para que se lea.
export function EtiquetaBadge({
  etiqueta,
  children,
}: {
  etiqueta: Pick<Etiqueta, "nombre" | "color" | "descripcion">;
  children?: React.ReactNode;
}) {
  return (
    <Badge
      variant="outline"
      title={etiqueta.descripcion}
      className="gap-1 border-transparent"
      style={{
        backgroundColor: `color-mix(in oklab, ${etiqueta.color} 16%, transparent)`,
        color: `color-mix(in oklab, ${etiqueta.color}, black 30%)`,
      }}
    >
      {etiqueta.nombre.toLocaleUpperCase("es-AR")}
      {children}
    </Badge>
  );
}

// Por dónde entró o se modificó un cliente: importación, Olimpo (usuario),
// Hermes (agente), IVR, API o alta automática.
export function ViaBadge({ via }: { via: ViaCarga }) {
  const t = useT();
  return <Badge variant="outline">{t(`clientes.via.${via}`)}</Badge>;
}

// Celda "fecha + quién + por dónde" para alta y última actualización.
export function TrazaCelda({ fecha, quien, via }: { fecha: string; quien: string; via: ViaCarga }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="whitespace-nowrap">{formatFecha(fecha, true)}</span>
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <ViaBadge via={via} />
        <span className="truncate">{quien}</span>
      </span>
    </div>
  );
}

// Marca visible para lo que el mock muestra de una forma pero todavía no está
// decidido (insight.md §7). Así nadie confunde el mock con una decisión.
export function ADefinir({ nota }: { nota: string }) {
  const t = useT();
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge
          variant="warning"
          className="cursor-help gap-1"
          tabIndex={0}
          aria-label={`${t("clientes.aDefinir")}: ${nota}`}
        >
          <CircleHelp />
          {t("clientes.aDefinir")}
        </Badge>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">{nota}</TooltipContent>
    </Tooltip>
  );
}
