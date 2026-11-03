"use client";

import type { ReactNode } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { useAtajosActivos } from "@/components/layout/atajos-de-botones";
import { ATAJOS, type NombreAtajo } from "@/lib/atajos";
import { useIsMac } from "@/lib/pad-mock/use-is-mac";

// Wrapper chico para el pedido de UX: todo control icon-only muestra su
// nombre al hover, y el atajo de teclado cuando existe uno real (no se
// inventan atajos que el control no tiene). `atajo` lo muestra y además hace
// que el control responda a él; `fila` es para el que se repite por fila, que
// responde solo con el foco en su fila.
export function ActionTooltip({
  label,
  shortcut,
  atajo,
  fila,
  side = "bottom",
  children,
}: {
  label: string;
  shortcut?: string[];
  atajo?: NombreAtajo;
  fila?: boolean;
  side?: "top" | "bottom" | "left" | "right";
  children: ReactNode;
}) {
  const isMac = useIsMac();
  const activos = useAtajosActivos();
  const teclas = atajo && activos ? [ATAJOS[atajo].etiqueta(isMac)] : shortcut;
  return (
    <Tooltip>
      {/* Solo si hay atajo: un undefined acá pisaría el del Button de adentro. */}
      <TooltipTrigger
        asChild
        {...(atajo ? { "data-atajo": atajo } : {})}
        {...(atajo && fila ? { "data-atajo-fila": "" } : {})}
      >
        {children}
      </TooltipTrigger>
      <TooltipContent side={side}>
        {label}
        {teclas && teclas.length > 0 && (
          <KbdGroup>
            {teclas.map((key) => (
              <Kbd key={key}>{key}</Kbd>
            ))}
          </KbdGroup>
        )}
      </TooltipContent>
    </Tooltip>
  );
}
