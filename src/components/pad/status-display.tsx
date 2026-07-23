"use client";

import type { LucideIcon } from "lucide-react";
import { getEstadoAuxiliar } from "@/lib/mock-data";
import { getAuxIcon } from "@/lib/aux-icons";
import { STATUS_META, type AgentStatus, type BadgeTone } from "@/lib/mock-pad";
import { Badge } from "@/components/ui/badge";
import { useT, type TranslateFn } from "@/lib/i18n";
import { cn } from "@/lib/utils";

// Resuelve un AgentStatus a su presentación. Los estados fijos toman su meta de
// tokens (STATUS_META) y su rótulo del diccionario (labelKey → t); los AUX toman
// nombre/icono/color del DATO del tenant (el nombre es dato, no se traduce; y es
// el único caso donde un color inline es legítimo — ADR-BD-004).
export type ResolvedStatus = {
  label: string;
  tone: BadgeTone;
  icon: LucideIcon;
  color?: string; // solo AUX: color crudo del tenant para el punto/ícono
};

export function resolveStatus(status: AgentStatus, t: TranslateFn): ResolvedStatus {
  if (status.kind === "aux") {
    const aux = getEstadoAuxiliar(status.auxId);
    return {
      label: aux?.nombre ?? t("pad.estado.auxiliar"),
      tone: "neutral",
      icon: getAuxIcon(aux?.icono),
      color: aux?.color,
    };
  }
  const meta = STATUS_META[status.kind];
  return { label: t(meta.labelKey), tone: meta.tone, icon: meta.icon };
}

// Punto de color del estado. Usa token (clase) para estados fijos y color
// inline solo para AUX.
export function StatusDot({
  status,
  className,
}: {
  status: AgentStatus;
  className?: string;
}) {
  // Solo necesita el color, así que no pasa por resolveStatus (que traduce).
  if (status.kind === "aux") {
    return (
      <span
        className={cn("size-2.5 shrink-0 rounded-full", className)}
        style={{ backgroundColor: getEstadoAuxiliar(status.auxId)?.color }}
        aria-hidden
      />
    );
  }
  return (
    <span
      className={cn(
        "size-2.5 shrink-0 rounded-full",
        STATUS_META[status.kind].dot,
        className
      )}
      aria-hidden
    />
  );
}

// Badge del estado del agente, con ícono + color.
export function AgentStatusBadge({
  status,
  className,
}: {
  status: AgentStatus;
  className?: string;
}) {
  const t = useT();
  const resolved = resolveStatus(status, t);
  const Icon = resolved.icon;
  return (
    <Badge variant={resolved.tone} className={cn("gap-1.5", className)}>
      {status.kind === "aux" ? (
        <Icon style={{ color: resolved.color }} />
      ) : (
        <Icon />
      )}
      {resolved.label}
    </Badge>
  );
}
