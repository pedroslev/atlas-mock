"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { LeftNav, type Modo } from "@/components/pad-mock/left-nav";
import { CenterColumn } from "@/components/pad-mock/center-column";
import { ContextColumn } from "@/components/pad-mock/context-column";
import { QuickAccessOverlay } from "@/components/pad-mock/quick-access-overlay";
import { InicioPanel } from "@/components/pad-mock/inicio-panel";
import {
  accesosRapidosMock,
  campaniasSalientesMock,
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
  // de la cola o desde InicioPanel.
  const [cola, setCola] = useState<FilaCola[]>([]);
  const [modo, setModo] = useState<Modo>("interaccion");
  const [interaccionActivaId, setInteraccionActivaId] = useState<string | null>(null);
  const [contextoColapsada, setContextoColapsada] = useState(false);
  const [enEspera, setEnEspera] = useState(false);
  const [holdStartedAt, setHoldStartedAt] = useState<number | null>(null);
  const [accesoAbiertoId, setAccesoAbiertoId] = useState<string | null>(null);
  const nuevaFilaRef = useRef(1);

  // Estado del agente (Disponible/No disponible/Ausente/Aux) — vive ACÁ
  // porque tanto el selector del menú (LeftNav) como la franja de estado de
  // InicioPanel tienen que leerlo y poder cambiarlo, no solo mostrarlo.
  // estadoAgenteDesde ancla el cronómetro que se ve en los dos lugares — se
  // resetea cada vez que cambia el estado.
  const [estadoAgenteId, setEstadoAgenteId] = useState("disponible");
  const [estadoAgenteDesde, setEstadoAgenteDesde] = useState<number>(() => Date.now());
  const cambiarEstadoAgente = useCallback((id: string) => {
    setEstadoAgenteId(id);
    setEstadoAgenteDesde(Date.now());
  }, []);

  // Última campaña/cuenta contactada — a pedido, la pantalla de inicio (y el
  // modal del "+") precargan con el último valor usado, no siempre con el
  // primero del listado.
  const [ultimaCampaniaId, setUltimaCampaniaId] = useState<string | undefined>(
    campaniasSalientesMock[0]?.id
  );
  const [ultimaCuentaId, setUltimaCuentaId] = useState<string | undefined>(
    campaniasSalientesMock[0]?.cuentas[0]?.id
  );

  const seleccionarInteraccion = useCallback((id: string) => {
    setInteraccionActivaId(id);
    setModo("interaccion");
    setEnEspera(false);
    setHoldStartedAt(null);
    setAccesoAbiertoId(null);
  }, []);

  // "Contactar" (desde el modal del "+" o desde InicioPanel) — a
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
      setUltimaCampaniaId(campania.id);
      setUltimaCuentaId(cuenta.id);
      seleccionarInteraccion(id);
    },
    [seleccionarInteraccion]
  );

  // "Cerrar interacción" (segundo paso del botón, ver call-controls.tsx —
  // solo se llega acá con tipificación ya cargada): saca la fila de la
  // cola y, si era la activa, pasa a la próxima que quede o vuelve a
  // InicioPanel si no queda ninguna.
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
  // una interacción desde Inicio).
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
  // Inicio se ve tanto si el agente lo eligió desde el menú como si
  // simplemente no hay ninguna interacción activa (mismo criterio que
  // left-nav.tsx para marcar el botón "Inicio" como activo).
  const mostrarInicio = modo === "inicio" || !hayInteraccionActiva;

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
        estadoAgenteId={estadoAgenteId}
        estadoAgenteDesde={estadoAgenteDesde}
        onEstadoAgenteChange={cambiarEstadoAgente}
        ultimaCampaniaId={ultimaCampaniaId}
        ultimaCuentaId={ultimaCuentaId}
      />

      {accesoActivo ? (
        <QuickAccessOverlay pagina={accesoActivo} onClose={() => setAccesoAbiertoId(null)} />
      ) : mostrarInicio ? (
        <InicioPanel
          estadoAgenteId={estadoAgenteId}
          estadoAgenteDesde={estadoAgenteDesde}
          onEstadoAgenteChange={cambiarEstadoAgente}
          campaniaIdInicial={ultimaCampaniaId}
          cuentaIdInicial={ultimaCuentaId}
          onContactar={iniciarInteraccion}
        />
      ) : (
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
    </div>
  );
}
