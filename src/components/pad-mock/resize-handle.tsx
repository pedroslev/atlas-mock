"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";

// Franja angosta y arrastrable en el borde de una columna — a pedido, tanto
// el menú izquierdo como el contexto tienen que poder ajustarse en ancho.
// "side" define de qué lado vive (para el cursor y qué signo tiene el delta:
// el menú crece arrastrando hacia la derecha, el contexto arrastrando hacia
// la izquierda).
export function ResizeHandle({
  side,
  onResize,
}: {
  side: "left" | "right";
  onResize: (deltaPx: number) => void;
}) {
  const draggingRef = useRef(false);
  const lastXRef = useRef(0);

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    draggingRef.current = true;
    lastXRef.current = e.clientX;
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!draggingRef.current) return;
    const delta = e.clientX - lastXRef.current;
    lastXRef.current = e.clientX;
    onResize(side === "right" ? delta : -delta);
  }

  function onPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    draggingRef.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
  }

  return (
    <div
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      role="separator"
      aria-orientation="vertical"
      className={cn(
        "absolute top-0 z-10 h-full w-1.5 cursor-col-resize touch-none hover:bg-primary/40 active:bg-primary/60",
        side === "right" ? "right-0 translate-x-1/2" : "left-0 -translate-x-1/2"
      )}
    />
  );
}
