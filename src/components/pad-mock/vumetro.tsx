"use client";

import { useEffect, useState } from "react";
import { Mic, MicOff, type LucideIcon } from "lucide-react";
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

type Turno = "cliente" | "asesor" | null;

// Quién está hablando en la webcall o la videollamada, para que el asesor
// vea si hay sonido de cada lado (y descarte problemas de audio). En el mock
// no hay audio: cliente y asesor se turnan para hablar, con pausas entre
// medio. Devuelve el nivel de voz de cada uno (0 = callado). En espera nadie
// habla; con el asesor silenciado, su nivel queda en 0.
export function useQuienHabla(activo: boolean, asesorSilenciado: boolean) {
  const [estado, setEstado] = useState<{ quien: Turno; nivel: number }>({ quien: null, nivel: 0 });
  useEffect(() => {
    if (!activo) return;
    const orden: Turno[] = ["cliente", null, "asesor", null];
    let paso = 0;
    let resto = 12;
    const id = window.setInterval(() => {
      resto--;
      if (resto <= 0) {
        paso = (paso + 1) % orden.length;
        resto = orden[paso] ? 10 + Math.floor(Math.random() * 16) : 3 + Math.floor(Math.random() * 4);
      }
      const quien = orden[paso];
      setEstado({ quien, nivel: quien ? 0.3 + Math.random() * 0.7 : 0 });
    }, 150);
    return () => window.clearInterval(id);
  }, [activo]);
  return {
    cliente: activo && estado.quien === "cliente" ? estado.nivel : 0,
    asesor: activo && !asesorSilenciado && estado.quien === "asesor" ? estado.nivel : 0,
  };
}

// Indicador chico de voz de una persona: micrófono y tres barras que se
// mueven mientras habla (verde); callado, gris; silenciado, micrófono
// tachado en rojo.
export function IndicadorHabla({
  nivel,
  silenciado = false,
  claro = false,
}: {
  nivel: number;
  silenciado?: boolean;
  /** Sobre fondo oscuro (el video). */
  claro?: boolean;
}) {
  const hablando = nivel > 0;
  if (silenciado) return <MicOff aria-hidden className="size-3.5 shrink-0 text-destructive" />;
  return (
    <span aria-hidden className="flex h-3.5 shrink-0 items-center gap-0.5">
      <Mic className={cn("size-3.5", hablando ? "text-success" : claro ? "text-white/60" : "text-muted-foreground")} />
      {[0.6, 1, 0.75].map((f, i) => (
        <span
          key={i}
          style={{ height: `${Math.round(Math.max(0.2, hablando ? nivel * f : 0.2) * 100)}%` }}
          className={cn(
            "w-0.5 rounded-full transition-[height] duration-100",
            hablando ? "bg-success" : claro ? "bg-white/40" : "bg-muted-foreground/40"
          )}
        />
      ))}
    </span>
  );
}
