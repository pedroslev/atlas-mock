"use client";

import { useCallback } from "react";
import { driver } from "driver.js";
import { Compass } from "lucide-react";
import "driver.js/dist/driver.css";
import "@/lib/tour/tour-theme.css";
import { ActionTooltip } from "@/components/layout/action-tooltip";
import { orientationSteps } from "@/lib/tour/steps";
import { useT } from "@/lib/i18n";

// Botón que dispara el tour de orientación general (driver.js): barra
// superior + menú lateral. Vive en el header para estar siempre a mano,
// sin importar en qué sección se esté. Es el primero de dos tours — el
// segundo ("armá tu primera campaña") todavía no existe.
//
// El texto de cada paso sale del diccionario de i18n (namespace "tour",
// dict/tour.ts) resolviendo `orientacion.<id>.titulo` / `.descripcion` con
// el idioma activo — así el tour respeta el selector de idioma del header
// en vez de tener copy fijo en un solo idioma.
export function ProductTour() {
  const t = useT();

  const start = useCallback(() => {
    const tour = driver({
      showProgress: true,
      progressText: t("tour.orientacion.controles.progreso"),
      nextBtnText: t("tour.orientacion.controles.siguiente"),
      prevBtnText: t("tour.orientacion.controles.atras"),
      doneBtnText: t("tour.orientacion.controles.listo"),
      popoverClass: "atlas-tour-popover",
      stagePadding: 6,
      stageRadius: 8,
      // driver.js espera title/description/side/align anidados en
      // "popover" — se arman acá resolviendo el texto por id de paso.
      steps: orientationSteps.map(({ id, element, side, align }) => ({
        element,
        popover: {
          title: t(`tour.orientacion.${id}.titulo`),
          description: t(`tour.orientacion.${id}.descripcion`),
          side,
          align,
        },
      })),
    });
    tour.drive();
  }, [t]);

  return (
    <ActionTooltip label={t("tour.orientacion.boton.tooltip")}>
      <button
        type="button"
        onClick={start}
        className="flex size-8 items-center justify-center rounded-lg hover:bg-white/10"
        aria-label={t("tour.orientacion.boton.ariaLabel")}
      >
        <Compass className="size-4.5" />
      </button>
    </ActionTooltip>
  );
}
