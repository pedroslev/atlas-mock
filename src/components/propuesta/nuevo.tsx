import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

// Marca TEMPORAL de ATLAS-1227: resalta en violeta lo que suma la propuesta
// de parámetros de chat, webcall y videollamada, para que el PO lo distinga
// en la primera revisión. Cuando se pase al color final, se quitan estos
// componentes (y las clases NUEVO_*) sin tocar nada más.
export const NUEVO_RING = "ring-2 ring-violet-500/70 bg-violet-500/5";
export const NUEVO_TEXTO = "text-violet-600 dark:text-violet-400";

export function NuevoBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-4 shrink-0 items-center rounded-full bg-violet-600 px-1.5 text-[0.6rem] font-semibold uppercase tracking-wide text-white",
        className
      )}
    >
      Nuevo
    </span>
  );
}

// Envuelve un bloque nuevo entero (una tarjeta, un grupo de campos).
export function Nuevo({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("rounded-xl", NUEVO_RING, className)}>{children}</div>;
}
