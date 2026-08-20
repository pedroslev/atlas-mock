"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { LeftNav, type Modo } from "@/components/pad-mock/left-nav";
import { CenterColumn } from "@/components/pad-mock/center-column";
import { ContextColumn } from "@/components/pad-mock/context-column";
import { StatsPanel } from "@/components/pad-mock/stats-panel";
import { AgentHistoryPanel } from "@/components/pad-mock/agent-history-panel";
import { QuickAccessOverlay } from "@/components/pad-mock/quick-access-overlay";
import { SinInteraccionPanel } from "@/components/pad-mock/sin-interaccion-panel";
import {
  accesosRapidosMock,
  clienteMock,
  historialPorCliente,
  tipificaciones,
  type CampaniaSaliente,
  type CuentaSaliente,
  type FilaCola,
} from "@/lib/pad-mock/data";

// Brief §2 — layout de tres columnas: menú izquierdo (con la cola integrada,
// ver LeftNav), centro (nunca colapsa) y contexto (colapsa a íconos, ancho
// ajustable). El navbar lo pone layout.tsx por encima de todo — acá solo
// arma lo que cambia según qué esté seleccionado en la cola.
//
// El estado de Hold (enEspera/holdStartedAt) vive ACÁ, no en InteractionControls:
// LeftNav también lo necesita, para mostrar el tiempo en espera en la fila de
// la cola de la interacción activa.
export function PadMockShell() {
  // A pedido: al ingresar no hay ninguna interacción activa — la cola
  // arranca vacía, no con los dos escenarios de ejemplo precargados. Recién
  // aparecen cuando el agente las crea (ver iniciarInteraccion) desde el "+"
  // de la cola o desde SinInteraccionPanel.
  const [cola, setCola] = useState<FilaCola[]>([]);
  const [modo, setModo] = useState<Modo>("interaccion");
  const [interaccionActivaId, setInteraccionActivaId] = useState<string | null>(null);
  const [contextoColapsada, setContextoColapsada] = useState(false);
  const [enEspera, setEnEspera] = useState(false);
  const [holdStartedAt, setHoldStartedAt] = useState<number | null>(null);
  const [accesoAbiertoId, setAccesoAbiertoId] = useState<string | null>(null);
  const nuevaFilaRef = useRef(1);

  const seleccionarInteraccion = useCallback((id: string) => {
    setInteraccionActivaId(id);
    setModo("interaccion");
    setEnEspera(false);
    setHoldStartedAt(null);
    setAccesoAbiertoId(null);
  }, []);

  // "Contactar" (desde el modal del "+" o desde SinInteraccionPanel) — a
  // pedido: ahora sí crea una fila real en la cola y la deja activa. El
  // contenido de la interacción (cliente, tipificaciones) sigue viniendo
  // del único guion fijo que queda (clienteMock/tipificaciones) — este
  // mock no genera un cliente nuevo de verdad.
  const iniciarInteraccion = useCallback(
    (campania: CampaniaSaliente, cuenta: CuentaSaliente, numero: string) => {
      const id = `q-nueva-${nuevaFilaRef.current++}`;
      const fila: FilaCola = {
        id,
        numeroCliente: numero,
        canal: cuenta.canal,
        esperaSeg: 0,
      };
      setCola((cur) => [...cur, fila]);
      seleccionarInteraccion(id);
    },
    [seleccionarInteraccion]
  );

  // "Cerrar interacción" (segundo paso del botón, ver call-controls.tsx —
  // solo se llega acá con tipificación ya cargada): saca la fila de la
  // cola y, si era la activa, pasa a la próxima que quede o vuelve al
  // estado "sin interacciones" (SinInteraccionPanel) si no queda ninguna.
  const cerrarInteraccion = useCallback(
    (id: string) => {
      setCola((cur) => cur.filter((f) => f.id !== id));
      if (interaccionActivaId !== id) return;
      const siguiente = cola.find((f) => f.id !== id);
      if (siguiente) {
        seleccionarInteraccion(siguiente.id);
      } else {
        setInteraccionActivaId(null);
        setEnEspera(false);
        setHoldStartedAt(null);
      }
    },
    [cola, interaccionActivaId, seleccionarInteraccion]
  );

  const toggleEspera = useCallback(() => {
    setEnEspera((prev) => {
      const next = !prev;
      setHoldStartedAt(next ? Date.now() : null);
      return next;
    });
  }, []);

  function cambiarModo(m: Modo) {
    setModo(m);
    setAccesoAbiertoId(null);
  }

  // Alt+1, Alt+2… salta directo a esa fila de la cola — Alt y no Ctrl/Cmd
  // porque Ctrl/Cmd+número ya lo usan Chrome/Firefox para cambiar de pestaña
  // del navegador. Funciona en cualquier modo (también sirve para volver a
  // una interacción desde Estadísticas/Historial).
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!e.altKey || e.ctrlKey || e.metaKey || e.shiftKey || e.repeat) return;
      const el = e.target as HTMLElement | null;
      if (
        el &&
        (el.isContentEditable ||
          el.tagName === "INPUT" ||
          el.tagName === "TEXTAREA" ||
          el.tagName === "SELECT")
      ) {
        return;
      }
      const idx = Number(e.key) - 1;
      if (Number.isNaN(idx) || idx < 0 || idx >= cola.length) return;
      e.preventDefault();
      seleccionarInteraccion(cola[idx].id);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cola, seleccionarInteraccion]);

  const hayInteraccionActiva = interaccionActivaId !== null;
  const accesoActivo = accesosRapidosMock.find((a) => a.id === accesoAbiertoId);

  return (
    <div className="flex h-full min-h-0 flex-1">
      <LeftNav
        modo={modo}
        onModo={cambiarModo}
        cola={cola}
        interaccionActivaId={interaccionActivaId}
        onSeleccionarInteraccion={seleccionarInteraccion}
        onIniciarInteraccion={iniciarInteraccion}
        accesoActivoId={accesoAbiertoId}
        onAbrirAcceso={setAccesoAbiertoId}
        enEspera={enEspera}
        holdStartedAt={holdStartedAt}
      />

      {accesoActivo ? (
        <QuickAccessOverlay pagina={accesoActivo} onClose={() => setAccesoAbiertoId(null)} />
      ) : (
        <>
          {modo === "estadisticas" && <StatsPanel />}
          {modo === "historial" && <AgentHistoryPanel />}
          {modo === "interaccion" && !hayInteraccionActiva && (
            <SinInteraccionPanel onContactar={iniciarInteraccion} />
          )}
          {modo === "interaccion" && hayInteraccionActiva && (
            <>
              <CenterColumn
                key={`centro-${interaccionActivaId}`}
                tipificaciones={tipificaciones}
                enEspera={enEspera}
                holdStartedAt={holdStartedAt}
                onToggleEspera={toggleEspera}
                onCerrarInteraccion={() => interaccionActivaId && cerrarInteraccion(interaccionActivaId)}
              />
              <ContextColumn
                key={`contexto-${interaccionActivaId}`}
                colapsada={contextoColapsada}
                onToggle={() => setContextoColapsada((v) => !v)}
                cliente={clienteMock}
                historial={historialPorCliente[clienteMock.numeroCliente] ?? []}
              />
            </>
          )}
        </>
      )}
    </div>
  );
}
