"use client";

import { useCallback } from "react";
import { driver } from "driver.js";
import { Compass } from "lucide-react";
import "driver.js/dist/driver.css";
import "@/lib/tour/tour-theme.css";
import { ActionTooltip } from "@/components/layout/action-tooltip";
import { tourSteps } from "@/lib/tour/steps";

// Botón que dispara el tour guiado (driver.js) sobre el shell de Olimpo +
// la pantalla de Campañas. Vive en el header para estar siempre a mano,
// sin importar en qué sección se esté.
export function ProductTour() {
  const start = useCallback(() => {
    const tour = driver({
      showProgress: true,
      progressText: "{{current}} de {{total}}",
      nextBtnText: "Siguiente",
      prevBtnText: "Atrás",
      doneBtnText: "Listo",
      popoverClass: "atlas-tour-popover",
      stagePadding: 6,
      stageRadius: 8,
      steps: tourSteps,
    });
    tour.drive();
  }, []);

  return (
    <ActionTooltip label="Tour guiado">
      <button
        type="button"
        onClick={start}
        className="flex size-8 items-center justify-center rounded-lg hover:bg-white/10"
        aria-label="Iniciar tour guiado"
      >
        <Compass className="size-4.5" />
      </button>
    </ActionTooltip>
  );
}
