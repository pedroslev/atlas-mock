"use client";

import { useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const BARRAS = 15;
const QUIETO = Array.from({ length: BARRAS }, () => 0.12);

// Vúmetro de la llamada y la webcall: barras que se mueven como una voz
// mientras la llamada está en curso, para que se note que hay alguien del
// otro lado. En espera quedan quietas. En el mock no hay audio: el
// movimiento es simulado (alterna ráfagas de "habla" con silencios cortos).
export function Vumetro({ activo }: { activo: boolean }) {
  const [niveles, setNiveles] = useState(QUIETO);
  useEffect(() => {
    if (!activo || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let silencio = 0;
    const id = window.setInterval(() => {
      if (silencio > 0) {
        silencio--;
        setNiveles(QUIETO);
        return;
      }
      if (Math.random() < 0.06) silencio = 3 + Math.floor(Math.random() * 5);
      const fuerza = 0.4 + Math.random() * 0.6;
      setNiveles(
        Array.from({ length: BARRAS }, (_, i) => {
          // Más alto al centro, como la forma de una voz.
          const centro = 1 - Math.abs(i - (BARRAS - 1) / 2) / ((BARRAS - 1) / 2);
          return Math.max(0.12, Math.min(1, fuerza * (0.35 + centro * 0.65) * (0.5 + Math.random() * 0.7)));
        })
      );
    }, 120);
    return () => window.clearInterval(id);
  }, [activo]);

  const mostrados = activo ? niveles : QUIETO;
  return (
    <div aria-hidden className="flex h-10 items-center gap-1">
      {mostrados.map((n, i) => (
        <span
          key={i}
          style={{ height: `${Math.round(n * 100)}%` }}
          className={cn(
            "w-1.5 rounded-full transition-[height] duration-100 ease-out",
            activo ? "bg-success" : "bg-muted-foreground/30"
          )}
        />
      ))}
    </div>
  );
}

// Ícono de la llamada en curso con un halo que late mientras está activa
// (en espera, quieto).
export function IconoEnCurso({ icono: Icono, activo }: { icono: LucideIcon; activo: boolean }) {
  return (
    <span
      className={cn(
        "relative flex size-16 items-center justify-center rounded-full",
        activo ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
      )}
    >
      {activo && (
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success/15 [animation-duration:2s]" />
      )}
      <Icono className="size-7" />
    </span>
  );
}
