"use client";

import { Phone, MessageCircle, MessageSquare, Mail, CircleHelp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useT } from "@/lib/i18n";
import type {
  CanalContacto,
  EstadoObjetivo,
  OrigenObjetivo,
} from "@/lib/mock-clientes";

const CANAL_ICON = {
  llamada: Phone,
  whatsapp: MessageCircle,
  sms: MessageSquare,
  email: Mail,
} as const;

export function CanalIcon({ canal, className }: { canal: CanalContacto; className?: string }) {
  const Icon = CANAL_ICON[canal];
  return <Icon className={className ?? "size-4"} aria-hidden />;
}

export function CanalBadge({ canal, orden }: { canal: CanalContacto; orden?: number }) {
  const t = useT();
  return (
    <Badge variant="outline" className="gap-1">
      {orden !== undefined && <span className="text-muted-foreground">{orden}.</span>}
      <CanalIcon canal={canal} />
      {t(`clientes.canal.${canal}`)}
    </Badge>
  );
}

const ESTADO_VARIANT: Record<
  EstadoObjetivo,
  "info" | "warning" | "success" | "destructive" | "neutral" | "outline"
> = {
  programado: "outline",
  pendiente: "info",
  enCurso: "warning",
  contactado: "success",
  noContactado: "destructive",
  vencido: "neutral",
  cancelado: "neutral",
};

export function EstadoObjetivoBadge({ estado }: { estado: EstadoObjetivo }) {
  const t = useT();
  return <Badge variant={ESTADO_VARIANT[estado]}>{t(`clientes.estado.${estado}`)}</Badge>;
}

export function OrigenBadge({ origen }: { origen: OrigenObjetivo }) {
  const t = useT();
  return (
    <div className="flex flex-col gap-0.5">
      <Badge variant="outline">{t(`clientes.origen.${origen.tipo}`)}</Badge>
      <span className="text-xs text-muted-foreground">
        {origen.detalle} · {origen.quien}
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
