"use client";

// Último paso de una acción masiva (ATLAS-1353), común a la tabla de Usuarios
// y a los catálogos: qué se aplicó, qué no cambió y, si algo falló, la lista
// de lo que falló con su motivo y "Reintentar los que fallaron". El botón
// desaparece cuando ya no quedan fallidos.

import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n";
import type { Fallido } from "@/lib/asignacion-masiva";

export function ResultadoAsignacion({
  exito,
  sinCambios,
  tituloFallidos,
  fallidos,
  onReintentar,
}: {
  /** "Listo. … actualizados: n." Se omite si no se aplicó nada. */
  exito?: string;
  /** "Sin cambios: n." Se omite si no corresponde. */
  sinCambios?: string;
  /** Encabezado de la lista de fallidos (por entidad o por usuario). */
  tituloFallidos: string;
  fallidos: Fallido[];
  onReintentar: () => void;
}) {
  const t = useT();
  return (
    <div className="flex flex-col gap-3 text-sm" data-testid="resultado-asignacion">
      {exito && (
        <p className="flex items-center gap-2" data-testid="resultado-asignacion-exito">
          <CheckCircle2 className="size-4 text-emerald-600" />
          {exito}
        </p>
      )}
      {sinCambios && (
        <p className="text-muted-foreground" data-testid="resultado-asignacion-sin-cambios">
          {sinCambios}
        </p>
      )}
      {fallidos.length > 0 && (
        <div
          className="flex flex-col gap-2 rounded-md bg-destructive/10 p-3"
          data-testid="resultado-asignacion-fallidos"
        >
          <p className="flex items-center gap-2 font-medium text-destructive">
            <AlertTriangle className="size-4" />
            {tituloFallidos}
          </p>
          <ul className="flex flex-col gap-1">
            {fallidos.map((f) => (
              <li key={f.id} data-testid={`resultado-asignacion-fallido-${f.id}`}>
                <span className="font-medium">{f.nombre}</span>
                <span className="text-muted-foreground"> — {t(f.motivo)}</span>
              </li>
            ))}
          </ul>
          <Button
            size="sm"
            variant="outline"
            className="w-fit"
            onClick={onReintentar}
            data-testid="boton-reintentar-fallidos"
          >
            {t("asignacion.reintentar")}
          </Button>
        </div>
      )}
    </div>
  );
}
