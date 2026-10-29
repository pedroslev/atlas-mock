"use client";

import { useEffect, useRef } from "react";

// Atajos para atender (o aceptar) y rechazar una interacción entrante: los
// mismos en la llamada, la webcall, la videollamada, el chat y la llamada
// interna, sea en el centro o en el aviso flotante.
// - Atender / Aceptar: Ctrl/Cmd+Enter.
// - Rechazar: Ctrl/Cmd+Shift+Backspace.
// Funcionan aunque el foco esté en el cuadro de texto de otro chat (por eso
// el redactor no envía con Ctrl/Cmd+Enter). Ningún navegador los usa.
export function useAtajosEntrante(onAceptar: () => void, onRechazar: () => void) {
  const ref = useRef({ onAceptar, onRechazar });
  useEffect(() => {
    ref.current = { onAceptar, onRechazar };
  }, [onAceptar, onRechazar]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!(e.ctrlKey || e.metaKey) || e.altKey || e.repeat) return;
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        ref.current.onAceptar();
      } else if (e.key === "Backspace" && e.shiftKey) {
        e.preventDefault();
        ref.current.onRechazar();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}

export function etiquetaAtender(isMac: boolean) {
  return isMac ? "⌘↵" : "Ctrl+Enter";
}

export function etiquetaRechazar(isMac: boolean) {
  return isMac ? "⌘⇧⌫" : "Ctrl+Shift+Backspace";
}
