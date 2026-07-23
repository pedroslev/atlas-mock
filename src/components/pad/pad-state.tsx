"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  seedInteraction,
  seedPins,
  callHistory as seedHistory,
  isForzado,
  type AgentStatus,
  type ActiveInteraction,
  type CallHistoryEntry,
  type CallPin,
} from "@/lib/mock-pad";

// Estado compartido del pad (Hermes). Vive acá porque el selector de estado del
// agente (en el app bar) y la consola de operación (en la página) tienen que
// reflejar el MISMO estado: la llamada fuerza el estado del agente
// (ADR-BD-004). Todo es estado local del cliente — no hay backend.

type PadContextValue = {
  chosenStatus: AgentStatus; // solo elegible (lo que el agente eligió)
  effectiveStatus: AgentStatus; // lo que realmente aplica (forzado gana)
  locked: boolean; // true si la llamada fuerza el estado
  interaction: ActiveInteraction | null;
  statusSince: number;
  callSince: number | null;
  acwDurationSec: number;
  history: CallHistoryEntry[];
  pins: CallPin[];
  /** Clasificación elegida para la gestión en curso (se puede cargar DURANTE la llamada). */
  clasificacionId: string | undefined;
  statusMenuOpen: boolean;
  setStatusMenuOpen: (open: boolean) => void;
  setChosenStatus: (s: AgentStatus) => void;
  simulateIncoming: () => void;
  answer: () => void;
  startOutbound: (numero: string, campaniaId: string) => void;
  toggleHold: () => void;
  toggleMute: () => void;
  hangup: () => void;
  addPin: (atSec: number, label: string, descripcion?: string) => void;
  setClasificacion: (id: string | undefined) => void;
  finishAcw: () => void;
};

const PadContext = createContext<PadContextValue | null>(null);

// Números de ejemplo para simular entrantes.
const INBOUND_POOL: { numero: string; nombre?: string }[] = [
  { numero: "+54 11 4762-4410", nombre: "Sofía Ramírez" },
  { numero: "+54 11 4762-9987", nombre: "Marcelo Duarte" },
  { numero: "+54 11 4762-2201", nombre: "Paula Ledesma" },
  { numero: "+54 11 4762-7734" },
];

function deriveEffective(
  chosen: AgentStatus,
  interaction: ActiveInteraction | null
): AgentStatus {
  if (!interaction) return chosen;
  switch (interaction.phase) {
    case "incoming":
      return { kind: "connecting" };
    case "onagent":
    case "hold":
      return { kind: "connected" };
    case "acw":
      return { kind: "acw" };
  }
}

export function PadStateProvider({ children }: { children: ReactNode }) {
  const [chosenStatus, setChosenStatusRaw] = useState<AgentStatus>({
    kind: "available",
  });
  const [interaction, setInteraction] = useState<ActiveInteraction | null>(
    seedInteraction
  );
  const [statusSince, setStatusSince] = useState<number>(() => Date.now());
  const [callSince, setCallSince] = useState<number | null>(null);
  const [acwDurationSec, setAcwDurationSec] = useState(0);
  const [history, setHistory] = useState<CallHistoryEntry[]>(seedHistory);
  // La interacción semilla arranca con varios pins ya clavados para poder ver
  // el overflow/scroll+buscador del bloque de pins; una llamada nueva los borra.
  const [pins, setPins] = useState<CallPin[]>(seedPins);
  // La clasificación vive en el estado del pad (no en el panel) porque se carga
  // DURANTE la llamada y tiene que sobrevivir al pasaje a posllamada (feedback:
  // "hay asesores que mientras gestionan quieren ir poniendo resultado").
  const [clasificacionId, setClasificacionId] = useState<string | undefined>(
    undefined
  );
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const inboundIdx = useRef(0);

  const effectiveStatus = useMemo(
    () => deriveEffective(chosenStatus, interaction),
    [chosenStatus, interaction]
  );
  const locked = isForzado(effectiveStatus);

  const setChosenStatus = useCallback(
    (s: AgentStatus) => {
      if (locked) return; // el selector está bloqueado en estados forzados
      setChosenStatusRaw(s);
      setStatusSince(Date.now());
    },
    [locked]
  );

  const simulateIncoming = useCallback(() => {
    setInteraction((prev) => {
      if (prev) return prev; // ya hay una interacción en curso
      const pick = INBOUND_POOL[inboundIdx.current % INBOUND_POOL.length];
      inboundIdx.current += 1;
      return {
        id: `int-${Date.now()}`,
        direction: "inbound",
        numero: pick.numero,
        nombre: pick.nombre,
        campaniaId: "camp-1",
        phase: "incoming",
        muted: false,
      };
    });
    setPins([]);
    setClasificacionId(undefined);
    setStatusSince(Date.now());
  }, []);

  const answer = useCallback(() => {
    setInteraction((prev) =>
      prev && prev.phase === "incoming" ? { ...prev, phase: "onagent" } : prev
    );
    const now = Date.now();
    setStatusSince(now);
    setCallSince(now);
  }, []);

  const startOutbound = useCallback(
    (numero: string, campaniaId: string) => {
      const trimmed = numero.trim();
      if (!trimmed) return;
      const id = `int-${Date.now()}`;
      setInteraction((prev) => {
        if (prev) return prev;
        return {
          id,
          direction: "outbound",
          numero: trimmed,
          campaniaId,
          phase: "incoming",
          muted: false,
        };
      });
      setPins([]);
      setClasificacionId(undefined);
      setStatusSince(Date.now());
      // Saliente: Connecting → Connected (mockeado con un delay corto).
      window.setTimeout(() => {
        setInteraction((prev) =>
          prev && prev.id === id && prev.phase === "incoming"
            ? { ...prev, phase: "onagent" }
            : prev
        );
        const now = Date.now();
        setStatusSince(now);
        setCallSince(now);
      }, 1600);
    },
    []
  );

  const toggleHold = useCallback(() => {
    setInteraction((prev) => {
      if (!prev) return prev;
      if (prev.phase === "onagent") return { ...prev, phase: "hold" };
      if (prev.phase === "hold") return { ...prev, phase: "onagent" };
      return prev;
    });
    // El hold no cambia el estado del agente (sigue Connected, ADR-BD-004),
    // así que el timer de estado no se reinicia.
  }, []);

  const toggleMute = useCallback(() => {
    setInteraction((prev) => (prev ? { ...prev, muted: !prev.muted } : prev));
  }, []);

  const hangup = useCallback(() => {
    setInteraction((prev) => {
      if (!prev) return prev;
      // Colgar una llamada conectada → Finished, el agente pasa a ACW.
      if (prev.phase === "onagent" || prev.phase === "hold") {
        return { ...prev, phase: "acw" };
      }
      // Rechazar/cancelar una llamada que nunca se conectó → sin ACW.
      if (prev.phase === "incoming") return null;
      return prev;
    });
    setCallSince((start) => {
      setAcwDurationSec(start ? Math.floor((Date.now() - start) / 1000) : 0);
      return null;
    });
    setStatusSince(Date.now());
  }, []);

  // Clava un pin de calidad en el segundo `atSec` de la llamada en curso. El
  // segundo lo calcula el llamador contra el cronómetro de la llamada (useNow),
  // así el pin queda anclado al tiempo transcurrido, no a un reloj de pared.
  const addPin = useCallback(
    (atSec: number, label: string, descripcion?: string) => {
      setPins((prev) => [
        ...prev,
        { id: `pin-${prev.length}-${atSec}`, atSec, label, descripcion },
      ]);
    },
    []
  );

  const finishAcw = useCallback(() => {
    // El alta en el historial se arma ACÁ, no dentro del updater de
    // setInteraction: los updaters tienen que ser puros y React los invoca dos
    // veces en desarrollo, con lo que la llamada quedaba duplicada.
    if (interaction && interaction.phase === "acw") {
      const entry: CallHistoryEntry = {
        id: `h-${Date.now()}`,
        timestamp: new Date().toISOString().slice(0, 19),
        direction: interaction.direction,
        numero: interaction.numero,
        nombre: interaction.nombre,
        campaniaId: interaction.campaniaId,
        durationSec: acwDurationSec,
        clasificacionId,
      };
      setHistory((h) => [entry, ...h]);
    }
    setInteraction(null);
    setChosenStatusRaw({ kind: "available" });
    setStatusSince(Date.now());
    setAcwDurationSec(0);
    setPins([]);
    setClasificacionId(undefined);
  }, [interaction, acwDurationSec, clasificacionId]);

  const value = useMemo<PadContextValue>(
    () => ({
      chosenStatus,
      effectiveStatus,
      locked,
      interaction,
      statusSince,
      callSince,
      acwDurationSec,
      history,
      pins,
      clasificacionId,
      statusMenuOpen,
      setStatusMenuOpen,
      setChosenStatus,
      simulateIncoming,
      answer,
      startOutbound,
      toggleHold,
      toggleMute,
      hangup,
      addPin,
      setClasificacion: setClasificacionId,
      finishAcw,
    }),
    [
      chosenStatus,
      effectiveStatus,
      locked,
      interaction,
      statusSince,
      callSince,
      acwDurationSec,
      history,
      pins,
      clasificacionId,
      statusMenuOpen,
      setChosenStatus,
      simulateIncoming,
      answer,
      startOutbound,
      toggleHold,
      toggleMute,
      hangup,
      addPin,
      finishAcw,
    ]
  );

  return <PadContext.Provider value={value}>{children}</PadContext.Provider>;
}

export function usePad(): PadContextValue {
  const ctx = useContext(PadContext);
  if (!ctx) throw new Error("usePad debe usarse dentro de <PadStateProvider>");
  return ctx;
}

// Reloj compartido que tickea cada segundo solo cuando "active" es true.
// Los componentes calculan el elapsed contra el timestamp de referencia.
export function useNow(active: boolean): number {
  const [now, setNow] = useState<number>(() => Date.now());
  useEffect(() => {
    if (!active) return;
    // Snap al montar/activar; el patrón de "leer reloj externo" ya se usa en
    // hooks/use-mobile.ts y theme-toggle.tsx de este repo.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [active]);
  return now;
}

// Detecta si el cliente es Mac para mostrar "⌘" en vez de "Ctrl" en los hints de
// atajos. Arranca en false (igual que el server) y se resuelve tras montar, así
// no rompe la hidratación. El listener acepta Ctrl o Cmd en cualquier plataforma.
export function useIsMac(): boolean {
  const [isMac, setIsMac] = useState(false);
  useEffect(() => {
    const p = navigator.platform || navigator.userAgent || "";
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMac(/Mac|iPhone|iPad|iPod/i.test(p));
  }, []);
  return isMac;
}
