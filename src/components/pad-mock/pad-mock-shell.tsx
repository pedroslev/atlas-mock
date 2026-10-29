"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { LeftNav, type Modo } from "@/components/pad-mock/left-nav";
import { CenterColumn } from "@/components/pad-mock/center-column";
import { ContextColumn } from "@/components/pad-mock/context-column";
import { QuickAccessOverlay } from "@/components/pad-mock/quick-access-overlay";
import { InicioPanel } from "@/components/pad-mock/inicio-panel";
import { LlamadaInternaEntrante } from "@/components/pad-mock/llamada-interna-entrante";
import { ChatEntranteAviso, ChatEntrantePanel } from "@/components/pad-mock/chat-entrante";
import { useT } from "@/lib/i18n";
import { VentanitaVideo, usePipNavegador, type FuenteVideo } from "@/components/pad-mock/video-panel";
import { formatDuration } from "@/lib/pad-mock/use-now";
import {
  accesosRapidosMock,
  agenteLlamadaEntrante,
  campaniasSalientesMock,
  entrantesMock,
  clienteMock,
  estadoLlamadaInterna,
  historialAgenteMock,
  historialPorCliente,
  ocupaAlAsesorEntero,
  tipificaciones,
  type AgenteDirectorio,
  type CampaniaSaliente,
  type InteraccionEntrante,
  type CuentaSaliente,
  type FilaCola,
  type HistorialAgenteEntrada,
} from "@/lib/pad-mock/data";

// Cuánto "suena" una llamada interna saliente antes de que el otro agente
// atienda — en el mock siempre atiende.
const RING_INTERNO_MS = 3000;

// Cuánto tarda el sistema en derivar un chat después de que el agente pasa a
// Disponible.
const DERIVACION_CHAT_MS = 3000;

// Capacidad del asesor (Olimpo → Cuentas): una llamada, una webcall o una
// videollamada lo ocupan entero. Con una en curso no se le deriva nada; y
// una webcall o videollamada solo llega con el asesor libre.
function puedeLlegar(entrante: InteraccionEntrante, cola: FilaCola[]) {
  if (cola.some((f) => ocupaAlAsesorEntero(f.canal))) return false;
  return !(ocupaAlAsesorEntero(entrante.canal) && cola.length > 0);
}

// Brief §2 — layout de tres columnas: menú izquierdo (con la cola integrada,
// ver LeftNav), centro (nunca colapsa) y contexto (colapsa a íconos, ancho
// ajustable). El navbar lo pone layout.tsx por encima de todo — acá solo
// arma lo que cambia según qué esté seleccionado en la cola.
//
// El estado de Hold (enEspera/holdStartedAt) vive ACÁ, no en InteractionControls:
// LeftNav también lo necesita, para mostrar el tiempo en espera en la fila de
// la cola de la interacción activa.
export function PadMockShell() {
  const t = useT();
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
  // Llamada interna entrante sonando (aviso abajo a la derecha).
  const [entrante, setEntrante] = useState<AgenteDirectorio | null>(null);
  // Historial del agente: las llamadas internas que terminan se suman arriba.
  const [historial, setHistorial] = useState<HistorialAgenteEntrada[]>(historialAgenteMock);

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

  // Fila de un chat sin atención forzada que llegó mientras el agente estaba
  // en otra interacción: su aviso flotante sigue visible hasta que lo acepte,
  // lo rechace o abra la fila.
  const [avisoChatFilaId, setAvisoChatFilaId] = useState<string | null>(null);
  // Cada vez que el agente pasa a Disponible el sistema le deriva una
  // interacción, recorriendo entrantesMock en orden: chat con atención
  // forzada, chat sin, webcall con chat (sin atención forzada) y webcall
  // solo audio (con atención forzada), para ver todos los casos.
  const proximoChatRef = useRef(0);
  // Al entrar al pad el agente ya está Disponible: eso no cuenta como "pasar
  // a Disponible", así que no deriva nada hasta que cambie de estado.
  const estadoInicialDesdeRef = useRef(estadoAgenteDesde);

  // Última campaña/cuenta contactada — a pedido, la pantalla de inicio (y el
  // modal del "+") precargan con el último valor usado, no siempre con el
  // primero del listado.
  const [ultimaCampaniaId, setUltimaCampaniaId] = useState<string | undefined>(
    campaniasSalientesMock[0]?.id
  );
  const [ultimaCuentaId, setUltimaCuentaId] = useState<string | undefined>(
    campaniasSalientesMock[0]?.cuentas[0]?.id
  );

  // Al volver a una llamada interna que quedó retenida por una atención
  // forzada, sigue en espera (con su tiempo) hasta que el agente la retome.
  const seleccionarInteraccion = useCallback((id: string, retenidaDesde?: number) => {
    setInteraccionActivaId(id);
    setModo("interaccion");
    setEnEspera(retenidaDesde !== undefined);
    setHoldStartedAt(retenidaDesde ?? null);
    setAccesoAbiertoId(null);
    if (retenidaDesde !== undefined) {
      setCola((cur) => cur.map((f) => (f.id === id ? { ...f, retenidaDesde: undefined } : f)));
    }
  }, []);

  const seleccionarFila = useCallback(
    (id: string) => seleccionarInteraccion(id, cola.find((f) => f.id === id)?.retenidaDesde),
    [cola, seleccionarInteraccion]
  );

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

  // Llamada interna desde el directorio (modal "Nueva interacción" → Interno):
  // entra a la cola como una interacción más, sin campaña ni cuenta. Suena
  // hasta que el otro agente atiende (en el mock, siempre a los 3 segundos).
  const iniciarLlamadaInterna = useCallback(
    (agente: AgenteDirectorio) => {
      const id = `q-interna-${nuevaFilaRef.current++}`;
      setCola((cur) => [
        ...cur,
        { id, numeroCliente: agente.nombre, canal: "llamada", esperaSeg: 0, interno: true, sonando: true },
      ]);
      seleccionarInteraccion(id);
      window.setTimeout(() => {
        setCola((cur) =>
          cur.map((f) => (f.id === id ? { ...f, sonando: false, iniciadaEn: Date.now() } : f))
        );
      }, RING_INTERNO_MS);
    },
    [seleccionarInteraccion]
  );

  // Interacción derivada por el sistema. Con atención forzada entra a la
  // cola y pasa al frente. Sin atención forzada entra como "Por aceptar": si
  // el agente está libre (sin interacciones en curso) también pasa al frente,
  // y el centro la ofrece con sus dos botones, como una llamada; si ya está
  // en otra interacción (solo puede pasar con un chat), no lo saca de ahí:
  // queda la fila y el aviso flotante.
  const derivarEntrante = useCallback(
    (entrante: InteraccionEntrante, libre: boolean) => {
      const id = `q-${entrante.canal}-${nuevaFilaRef.current++}`;
      const porAceptar = !entrante.atencionForzada;
      setCola((cur) => [
        ...cur,
        {
          id,
          numeroCliente: entrante.nombre,
          canal: entrante.canal,
          esperaSeg: 0,
          entranteId: entrante.id,
          porAceptar,
        },
      ]);
      if (!porAceptar || libre) seleccionarInteraccion(id);
      else setAvisoChatFilaId(id);
    },
    [seleccionarInteraccion]
  );

  const aceptarChat = useCallback(
    (id: string) => {
      setCola((cur) => cur.map((f) => (f.id === id ? { ...f, porAceptar: false } : f)));
      setAvisoChatFilaId((cur) => (cur === id ? null : cur));
      seleccionarInteraccion(id);
    },
    [seleccionarInteraccion]
  );

  // La cola actual, para leerla desde el timer de derivación sin reiniciarlo
  // cada vez que cambia.
  const colaRef = useRef(cola);
  useEffect(() => {
    colaRef.current = cola;
  }, [cola]);

  useEffect(() => {
    if (estadoAgenteId !== "disponible" || estadoAgenteDesde === estadoInicialDesdeRef.current) return;
    const timer = window.setTimeout(() => {
      const entrante = entrantesMock[proximoChatRef.current % entrantesMock.length];
      const cola = colaRef.current;
      // Si no puede llegar (capacidad, ver puedeLlegar), sigue esperando: el
      // próximo paso a Disponible la vuelve a intentar.
      if (!puedeLlegar(entrante, cola)) return;
      proximoChatRef.current++;
      derivarEntrante(entrante, cola.length === 0);
    }, DERIVACION_CHAT_MS);
    return () => window.clearTimeout(timer);
    // estadoAgenteDesde: cada nuevo paso a Disponible deriva otra interacción.
  }, [estadoAgenteId, estadoAgenteDesde, derivarEntrante]);

  // Botones temporales de Inicio (solo para probar el mock, a pedido del PO):
  // hacen llegar ya una interacción puntual, sin cambiar de estado. Respetan
  // la misma regla de capacidad.
  const simularEntrante = useCallback(
    (id: string) => {
      const entrante = entrantesMock.find((e) => e.id === id);
      if (!entrante || !puedeLlegar(entrante, colaRef.current)) return;
      derivarEntrante(entrante, colaRef.current.length === 0);
    },
    [derivarEntrante]
  );

  const atenderEntrante = useCallback(() => {
    if (!entrante) return;
    const id = `q-interna-${nuevaFilaRef.current++}`;
    setCola((cur) => [
      ...cur,
      { id, numeroCliente: entrante.nombre, canal: "llamada", esperaSeg: 0, interno: true, iniciadaEn: Date.now() },
    ]);
    setEntrante(null);
    seleccionarInteraccion(id);
  }, [entrante, seleccionarInteraccion]);

  // El otro agente rechaza la llamada interna saliente: sin aviso, el que
  // llama vuelve a la pantalla de inicio (definición del PO).
  const rechazarSaliente = useCallback((id: string) => {
    setCola((cur) => cur.filter((f) => f.id !== id));
    setInteraccionActivaId(null);
    setEnEspera(false);
    setHoldStartedAt(null);
    setModo("inicio");
  }, []);

  // Entra una llamada de cliente con atención forzada durante la llamada
  // interna activa: la interna queda en espera y la del cliente pasa al frente.
  const simularAtencionForzada = useCallback(() => {
    const internaId = interaccionActivaId;
    const retenidaDesde = enEspera && holdStartedAt !== null ? holdStartedAt : Date.now();
    setCola((cur) => cur.map((f) => (f.id === internaId ? { ...f, retenidaDesde } : f)));
    const campania = campaniasSalientesMock[0];
    const id = `q-forzada-${nuevaFilaRef.current++}`;
    setCola((cur) => [
      ...cur,
      { id, numeroCliente: clienteMock.telefono, canal: campania.cuentas[0].canal, esperaSeg: 0 },
    ]);
    seleccionarInteraccion(id);
  }, [interaccionActivaId, enEspera, holdStartedAt, seleccionarInteraccion]);

  // "Cerrar interacción" (segundo paso del botón, ver call-controls.tsx —
  // solo se llega acá con tipificación ya cargada): saca la fila de la
  // cola y, si era la activa, pasa a la próxima que quede o vuelve a
  // InicioPanel si no queda ninguna.
  const cerrarInteraccion = useCallback(
    (id: string) => {
      const fila = cola.find((f) => f.id === id);
      // Llamada interna atendida: queda en el historial del agente.
      if (fila?.interno && fila.iniciadaEn) {
        const inicio = new Date(fila.iniciadaEn);
        const entrada: HistorialAgenteEntrada = {
          id: `ha-${id}`,
          fecha: inicio.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" }),
          hora: inicio.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false }),
          canal: "llamada",
          numeroCliente: fila.numeroCliente,
          duracion: formatDuration(Math.max(0, Math.floor((Date.now() - fila.iniciadaEn) / 1000))),
          tipificacion: "—",
          interno: true,
        };
        setHistorial((cur) => [entrada, ...cur]);
      }
      setCola((cur) => cur.filter((f) => f.id !== id));
      if (interaccionActivaId !== id) return;
      const siguiente = cola.find((f) => f.id !== id);
      if (siguiente) {
        seleccionarInteraccion(siguiente.id, siguiente.retenidaDesde);
      } else {
        setInteraccionActivaId(null);
        setEnEspera(false);
        setHoldStartedAt(null);
      }
    },
    [cola, interaccionActivaId, seleccionarInteraccion]
  );

  // Rechazar un chat entrante: sale de la cola (el sistema se lo deriva a
  // otro agente) sin pasar por el historial.
  const rechazarChat = useCallback(
    (id: string) => {
      setAvisoChatFilaId((cur) => (cur === id ? null : cur));
      cerrarInteraccion(id);
    },
    [cerrarInteraccion]
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
      seleccionarFila(cola[idx].id);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cola, seleccionarFila]);

  // Videollamada o webcall en curso (ya atendida; hay una sola a la vez por
  // la capacidad del asesor) o, si no hay, el chat cuyo cliente comparte su
  // pantalla. Lo que el asesor mira en ella sigue a la vista aunque no esté
  // en su solapa: dentro del pad, con la ventanita (VentanitaVideo); fuera
  // del pad, con el Picture-in-Picture del navegador. Las dos vuelven a la
  // solapa.
  // - Videollamada: siempre, con lo fijado en el recuadro grande.
  // - Webcall y chat: solo mientras el cliente comparte su pantalla, con la
  //   pantalla.
  // Qué cliente comparte y el pin viven acá (no en CenterColumn, que se
  // vuelve a armar al cambiar de interacción) para que la ventanita y el
  // Picture-in-Picture los sigan desde cualquier parte del pad. En el mock,
  // de a un cliente por vez: si comparte el de otro chat, deja de compartir
  // el anterior.
  const [comparteFilaId, setComparteFilaId] = useState<string | null>(null);
  // El asesor comparte su pantalla en esta interacción (chat, webcall o
  // videollamada); también acá para que no se corte al cambiar de interacción.
  const [asesorComparteFilaId, setAsesorComparteFilaId] = useState<string | null>(null);
  // Interacciones ya cortadas (o con el chat finalizado) que esperan la
  // tipificación para cerrarse: muestran que terminaron, dejan de compartir
  // y no tienen ventanita ni Picture-in-Picture.
  const [finalizadas, setFinalizadas] = useState<string[]>([]);
  const filaVideo =
    cola.find(
      (f) => (f.canal === "videollamada" || f.canal === "webcall") && !f.porAceptar && !finalizadas.includes(f.id)
    ) ?? cola.find((f) => f.id === comparteFilaId && !f.porAceptar);
  const filaVideoEsVideo = filaVideo?.canal === "videollamada";
  const nombreVideo = filaVideo ? (entrantesMock.find((e) => e.id === filaVideo.entranteId)?.nombre ?? null) : null;
  const clienteComparte = !!filaVideo && filaVideo.id === comparteFilaId;
  const [fijado, setFijado] = useState<FuenteVideo>("cliente");
  const [filaVideoVista, setFilaVideoVista] = useState(filaVideo?.id);
  if (filaVideo?.id !== filaVideoVista) {
    setFilaVideoVista(filaVideo?.id);
    setFijado("cliente");
  }
  // Al empezar a compartir, la pantalla pasa sola al recuadro grande; al
  // terminar, si estaba fijada, vuelve la cámara del cliente.
  function alternarClienteComparte(filaId: string) {
    const comparte = comparteFilaId === filaId;
    if (comparte) setFijado((f) => (f === "pantalla" ? "cliente" : f));
    else setFijado("pantalla");
    setComparteFilaId(comparte ? null : filaId);
  }
  function finalizar(filaId: string) {
    setFinalizadas((cur) => (cur.includes(filaId) ? cur : [...cur, filaId]));
    if (comparteFilaId === filaId) setComparteFilaId(null);
    if (asesorComparteFilaId === filaId) setAsesorComparteFilaId(null);
  }
  const sigueALaVista = filaVideoEsVideo || clienteComparte;
  const fuenteALaVista: FuenteVideo = filaVideoEsVideo ? fijado : "pantalla";
  const [solapaVideoVisible, setSolapaVideoVisible] = useState(false);
  const [pedidoSolapaVideo, setPedidoSolapaVideo] = useState(0);
  const [pedidoSolapaVideoVisto, setPedidoSolapaVideoVisto] = useState(0);
  const volverAlVideo = useCallback(() => {
    if (!filaVideo) return;
    setAccesoAbiertoId(null);
    // Si ya es la interacción activa, no se toca su espera.
    if (filaVideo.id === interaccionActivaId) setModo("interaccion");
    else seleccionarInteraccion(filaVideo.id, filaVideo.retenidaDesde);
    setPedidoSolapaVideo((n) => n + 1);
  }, [filaVideo, interaccionActivaId, seleccionarInteraccion]);
  const pip = usePipNavegador(
    sigueALaVista ? nombreVideo : null,
    fuenteALaVista,
    t("padMock.video.tuCamara"),
    volverAlVideo
  );

  const hayInteraccionActiva = interaccionActivaId !== null;
  const accesoActivo = accesosRapidosMock.find((a) => a.id === accesoAbiertoId);
  // Inicio se ve tanto si el agente lo eligió desde el menú como si
  // simplemente no hay ninguna interacción activa (mismo criterio que
  // left-nav.tsx para marcar el botón "Inicio" como activo).
  const mostrarInicio = modo === "inicio" || !hayInteraccionActiva;
  const filaActiva = cola.find((f) => f.id === interaccionActivaId);
  const entranteActivo = entrantesMock.find((c) => c.id === filaActiva?.entranteId);
  const filaAvisoChat = cola.find((f) => f.id === avisoChatFilaId && f.porAceptar);
  const avisoChat = entrantesMock.find((c) => c.id === filaAvisoChat?.entranteId);
  // Mientras hay una llamada interna conectada y al frente, el agente figura
  // "En llamada interna" (propuesta del PO, a confirmar con Pedro).
  const enLlamadaInterna = !!filaActiva?.interno && !filaActiva.sonando;

  return (
    // min-w-0: que el contenido (por ejemplo, el historial de Inicio) no
    // estire el pad más allá del ancho de la ventana.
    <div className="flex h-full min-h-0 min-w-0 flex-1">
      <LeftNav
        modo={modo}
        onModo={cambiarModo}
        cola={cola}
        interaccionActivaId={interaccionActivaId}
        onSeleccionarInteraccion={seleccionarFila}
        onIniciarInteraccion={iniciarInteraccion}
        onLlamarInterno={iniciarLlamadaInterna}
        accesoActivoId={accesoAbiertoId}
        onAbrirAcceso={setAccesoAbiertoId}
        enEspera={enEspera}
        holdStartedAt={holdStartedAt}
        estadoAgenteId={estadoAgenteId}
        estadoAgenteDesde={estadoAgenteDesde}
        onEstadoAgenteChange={cambiarEstadoAgente}
        ultimaCampaniaId={ultimaCampaniaId}
        ultimaCuentaId={ultimaCuentaId}
        estadoSistema={enLlamadaInterna ? estadoLlamadaInterna : undefined}
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
          onLlamarInterno={iniciarLlamadaInterna}
          onSimularEntrante={() => setEntrante(agenteLlamadaEntrante)}
          entrantesSimulables={entrantesMock.map((e) => ({ entrante: e, disponible: puedeLlegar(e, cola) }))}
          onSimularEntranteCliente={simularEntrante}
          historial={historial}
        />
      ) : (
        <>
          {filaActiva?.porAceptar && entranteActivo ? (
            <ChatEntrantePanel
              chat={entranteActivo}
              onAceptar={() => aceptarChat(filaActiva.id)}
              onRechazar={() => rechazarChat(filaActiva.id)}
            />
          ) : (
            <CenterColumn
              key={`centro-${interaccionActivaId}`}
              tipificaciones={tipificaciones}
              enEspera={enEspera}
              holdStartedAt={holdStartedAt}
              onToggleEspera={toggleEspera}
              onCerrarInteraccion={() => interaccionActivaId && cerrarInteraccion(interaccionActivaId)}
              entrante={entranteActivo}
              interno={filaActiva?.interno}
              sonando={filaActiva?.sonando}
              nombreInterno={filaActiva?.interno ? filaActiva.numeroCliente : undefined}
              onSimularForzada={filaActiva?.interno ? simularAtencionForzada : undefined}
              onSimularRechazo={
                filaActiva?.sonando ? () => rechazarSaliente(filaActiva.id) : undefined
              }
              pip={pip}
              compartiendo={asesorComparteFilaId !== null && asesorComparteFilaId === interaccionActivaId}
              onAlternarCompartiendo={() =>
                setAsesorComparteFilaId((cur) => (cur === interaccionActivaId ? null : interaccionActivaId))
              }
              clienteComparte={comparteFilaId !== null && comparteFilaId === interaccionActivaId}
              onAlternarClienteComparte={() => interaccionActivaId && alternarClienteComparte(interaccionActivaId)}
              fijado={fijado}
              onFijar={setFijado}
              onSolapaVideoVisible={setSolapaVideoVisible}
              pedidoSolapaVideo={pedidoSolapaVideo}
              pedidoSolapaVideoVisto={pedidoSolapaVideoVisto}
              onPedidoSolapaVideoVisto={setPedidoSolapaVideoVisto}
              finalizada={interaccionActivaId !== null && finalizadas.includes(interaccionActivaId)}
              onFinalizar={() => interaccionActivaId && finalizar(interaccionActivaId)}
            />
          )}
          {/* Llamada interna: no hay cliente, así que no se muestra el contexto. */}
          {!filaActiva?.interno && (
            <ContextColumn
              key={`contexto-${interaccionActivaId}`}
              colapsada={contextoColapsada}
              onToggle={() => setContextoColapsada((v) => !v)}
              cliente={
                entranteActivo ? { nombre: entranteActivo.nombre, campania: entranteActivo.campania } : clienteMock
              }
              historial={
                historialPorCliente[entranteActivo ? entranteActivo.claveHistorial : clienteMock.numeroCliente] ?? []
              }
            />
          )}
        </>
      )}

      {avisoChat && avisoChatFilaId !== interaccionActivaId && (
        <ChatEntranteAviso
          chat={avisoChat}
          onAceptar={() => aceptarChat(avisoChatFilaId!)}
          onRechazar={() => rechazarChat(avisoChatFilaId!)}
        />
      )}

      {nombreVideo && sigueALaVista && !solapaVideoVisible && !pip.activo && (
        <VentanitaVideo
          nombre={nombreVideo}
          fuente={fuenteALaVista}
          webcall={!filaVideoEsVideo}
          onVolver={volverAlVideo}
        />
      )}

      {entrante && (
        <LlamadaInternaEntrante
          agente={entrante}
          onAtender={atenderEntrante}
          onRechazar={() => setEntrante(null)}
        />
      )}
    </div>
  );
}
