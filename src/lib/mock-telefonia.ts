"use client";

import { useCallback, useSyncExternalStore } from "react";

// Datos mock de Telefonía — administración de carriers de Kamailio desde Zeus.
// Ver documentacion/decisiones/telefonia/ADR-TELEFONIA-002 ("Administración de
// carriers por región") y ADR-BD-005 (modelo de la base `kamailio`). Cada región
// (un cluster, no un país) tiene su propia base `kamailio` y su media-api: un
// carrier multiregión es el mismo carrier, con el mismo id, dado de alta por
// zeus-api en la media-api de cada región donde opera. Acá no pega a ninguna API.

// Reusa el Badge por región que ya define mock-admin.ts (regionBadgeVariant) —
// no se redefine acá. La asignación a tenant reusa `organizations` de
// mock-admin.ts — un número solo se puede asignar a un tenant de su misma
// región (`Organization.regionId === PhoneNumber.regionId`).

// Un destino SIP del carrier (una fila de `dispatcher`). Kamailio prueba los
// destinos del carrier en orden de prioridad y, si uno falla, pasa al siguiente.
export type CarrierDestination = {
  id: string;
  /** URI SIP de destino (`dispatcher.destination`). */
  destination: string;
  /** Orden en que Kamailio prueba este destino (`dispatcher.priority`). */
  priority: number;
};

// Un carrier telefónico con las regiones donde opera, sus destinos SIP de
// salida y su whitelist de IP de entrada (la única protección anti-fraude
// decidida, ver ADR-TELEFONIA-002: no hay geo-IP ni rate limiting en Kamailio).
export type Carrier = {
  id: string;
  name: string;
  /** Regiones (clusters) donde opera el carrier; al sumar una se copia el carrier completo. */
  regionIds: string[];
  destinations: CarrierDestination[];
  /** IPs autorizadas a mandar tráfico entrante (`carrier_addresses`, una fila por IP). */
  whitelistIps: string[];
  /** Permite salir con CLI oculto: candidato al LCR de `carrierRates` para ese caso. */
  allowsHiddenCli: boolean;
  /** Permite salir con CLI aleatorio: candidato al LCR de `carrierRates` para ese caso. */
  allowsRandomCli: boolean;
  active: boolean;
};

export const carriers: Carrier[] = [
  {
    id: "carrier-telnyx",
    name: "Telnyx",
    regionIds: ["region-ar", "region-mx"],
    destinations: [
      { id: "dest-telnyx-1", destination: "sip:200.1.10.5:5060", priority: 10 },
      { id: "dest-telnyx-2", destination: "sip:200.1.10.6:5060", priority: 5 },
    ],
    whitelistIps: ["200.1.10.5", "200.1.10.6"],
    allowsHiddenCli: true,
    allowsRandomCli: true,
    active: true,
  },
  {
    id: "carrier-voxbone",
    name: "Voxbone",
    regionIds: ["region-ar"],
    destinations: [
      { id: "dest-voxbone-1", destination: "sip:200.1.20.8:5060", priority: 10 },
    ],
    whitelistIps: ["200.1.20.8"],
    allowsHiddenCli: true,
    allowsRandomCli: false,
    active: true,
  },
  {
    id: "carrier-twilio",
    name: "Twilio",
    regionIds: ["region-mx"],
    destinations: [
      { id: "dest-twilio-1", destination: "sip:52.84.10.20:5060", priority: 10 },
    ],
    whitelistIps: ["52.84.10.20"],
    allowsHiddenCli: false,
    allowsRandomCli: true,
    active: true,
  },
  {
    id: "carrier-entel",
    name: "Entel",
    regionIds: ["region-cl"],
    destinations: [
      { id: "dest-entel-1", destination: "sip:190.98.4.12:5060", priority: 20 },
    ],
    whitelistIps: ["190.98.4.12", "190.98.4.13"],
    allowsHiddenCli: false,
    allowsRandomCli: false,
    active: false,
  },
];

// Qué puede hacer un número: originar llamadas, recibirlas, o ambas
// (`numbers.direction` — ADR-BD-005). Ya no hay una tabla separada de
// "números entrantes" (DIDs): es la misma tabla con la dirección que
// corresponda.
export type NumberDirection = "saliente" | "entrante" | "ambas";

// Un número de telefonía: por qué carrier sale/entra, en qué región está
// (tabla `numbers` de la base `kamailio` de esa región) y a qué tenant está
// asignado. La región tiene que ser una de las del carrier, y un mismo
// número no puede estar en dos regiones (lo valida zeus-api antes del alta).
export type PhoneNumber = {
  id: string;
  /** ANI/DID normalizado a solo dígitos — mismo criterio que accounts.account en olimpo-api. */
  number: string;
  carrierId: string;
  regionId: string;
  direction: NumberDirection;
  /**
   * Tenant dueño del número (`Organization.tenantId` de mock-admin). `null`
   * es libre para cualquier tenant de esta región: una cuenta lo puede tomar
   * desde Cuentas (olimpo-front) y esa asignación se refleja acá mismo — es
   * la misma fila, no dos inventarios separados.
   */
  tenantId: string | null;
  active: boolean;
};

export const phoneNumbers: PhoneNumber[] = [
  {
    id: "number-1161238744",
    number: "1161238744",
    carrierId: "carrier-telnyx",
    regionId: "region-ar",
    direction: "saliente",
    tenantId: null,
    active: true,
  },
  {
    id: "number-1140009911",
    number: "1140009911",
    carrierId: "carrier-voxbone",
    regionId: "region-ar",
    direction: "ambas",
    tenantId: "org-banco-sur",
    active: true,
  },
  {
    id: "number-1140001001",
    number: "1140001001",
    carrierId: "carrier-voxbone",
    regionId: "region-ar",
    direction: "ambas",
    tenantId: null,
    active: true,
  },
  {
    id: "number-1140001002",
    number: "1140001002",
    carrierId: "carrier-voxbone",
    regionId: "region-ar",
    direction: "entrante",
    tenantId: null,
    active: true,
  },
  {
    id: "number-1150002000",
    number: "1150002000",
    carrierId: "carrier-telnyx",
    regionId: "region-ar",
    direction: "saliente",
    tenantId: null,
    active: true,
  },
  // Rango de salida contratado para Banco Sur: números contiguos ya vinculados
  // al tenant. Son varios a propósito — es el caso que el pool de la salida
  // aleatoria tiene que resolver, donde elegirlos uno por uno no escala y la
  // búsqueda por prefijo es lo que sirve.
  ...Array.from({ length: 12 }, (_, i) => {
    const number = `115000${(2001 + i).toString()}`;
    return {
      id: `number-${number}`,
      number,
      carrierId: "carrier-telnyx",
      regionId: "region-ar",
      direction: "saliente" as NumberDirection,
      tenantId: "org-banco-sur",
      active: true,
    };
  }),
];

// Tabla `carrier_rates` — cuánto cobra cada carrier por minuto, por prefijo de
// destino. Es la misma en todas las regiones del carrier (tráfico IP: el precio
// no depende del cluster desde el que sale). Se usa para elegir el carrier más
// barato cuando la llamada sale con CLI oculto o aleatorio: entre los carriers
// que permiten ese modo, gana el prefijo más específico que matchee el destino
// (longest-prefix-match) y, entre esos, el más barato.
export type CarrierRate = {
  id: string;
  carrierId: string;
  /** Prefijo de destino (ej. "54", "5411") — más dígitos = más específico. */
  prefix: string;
  ratePerMinute: number;
  currency: string;
};

export const carrierRates: CarrierRate[] = [
  {
    id: "rate-telnyx-54",
    carrierId: "carrier-telnyx",
    prefix: "54",
    ratePerMinute: 0.018,
    currency: "USD",
  },
  {
    id: "rate-telnyx-5411",
    carrierId: "carrier-telnyx",
    prefix: "5411",
    ratePerMinute: 0.012,
    currency: "USD",
  },
  {
    id: "rate-twilio-54",
    carrierId: "carrier-twilio",
    prefix: "54",
    ratePerMinute: 0.021,
    currency: "USD",
  },
];

// --- Estado compartido entre Zeus (admin/telefonia) y Cuentas -------------
// Sin backend real, Zeus y Cuentas (olimpo-front) tendrían que leer/escribir
// la misma tabla `numbers` de la base kamailio (ADR-BD-005). Acá se comparte
// vía localStorage + evento, mismo patrón que ya usa `use-locale.ts`: así,
// asignar un número desde Cuentas se ve reflejado en Zeus sin recargar.
const NUMBERS_STORAGE_KEY = "atlas-phone-numbers";
const NUMBERS_EVENT = "atlas-phone-numbers-change";

// useSyncExternalStore exige que getSnapshot devuelva la MISMA referencia
// si nada cambió — JSON.parse a secas crea un array nuevo en cada llamada y
// dispara un loop infinito. Se cachea contra el string crudo de localStorage.
let numbersCacheRaw: string | null = null;
let numbersCacheParsed: PhoneNumber[] = phoneNumbers;

function readNumbers(): PhoneNumber[] {
  if (typeof window === "undefined") return phoneNumbers;
  const stored = window.localStorage.getItem(NUMBERS_STORAGE_KEY);
  if (!stored) return phoneNumbers;
  if (stored === numbersCacheRaw) return numbersCacheParsed;
  try {
    numbersCacheParsed = JSON.parse(stored) as PhoneNumber[];
    numbersCacheRaw = stored;
    return numbersCacheParsed;
  } catch {
    return phoneNumbers;
  }
}

function writeNumbers(next: PhoneNumber[]) {
  window.localStorage.setItem(NUMBERS_STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(NUMBERS_EVENT));
}

function subscribeNumbers(callback: () => void) {
  window.addEventListener(NUMBERS_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(NUMBERS_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function getServerSnapshotNumbers(): PhoneNumber[] {
  return phoneNumbers;
}

/** Números en vivo, compartidos entre todas las pantallas que los usan. */
export function usePhoneNumbers() {
  const numeros = useSyncExternalStore(
    subscribeNumbers,
    readNumbers,
    getServerSnapshotNumbers,
  );

  const setNumeros = useCallback(
    (updater: (prev: PhoneNumber[]) => PhoneNumber[]) => {
      writeNumbers(updater(readNumbers()));
    },
    [],
  );

  /** Asigna un número libre a un tenant — no hace nada si ya tiene dueño. */
  const asignarTenant = useCallback((numberId: string, tenantId: string) => {
    writeNumbers(
      readNumbers().map((n) =>
        n.id === numberId && n.tenantId === null ? { ...n, tenantId } : n,
      ),
    );
  }, []);

  return { numeros, setNumeros, asignarTenant };
}

/**
 * Qué le permiten a un tenant los carriers activos de su región: CLI oculto,
 * CLI aleatorio, y si hay tarifas cargadas para armar el LCR de esos modos.
 * Reemplaza el mock estático y desconectado que tenía antes Cuentas — sale de
 * los mismos carriers que administra Zeus, no de un flag suelto.
 */
export function capacidadesDeRegion(regionId: string) {
  const carriersDeRegion = carriers.filter(
    (c) => c.active && c.regionIds.includes(regionId),
  );
  const idsActivos = new Set(carriersDeRegion.map((c) => c.id));
  return {
    permiteOculto: carriersDeRegion.some((c) => c.allowsHiddenCli),
    permiteAleatorio: carriersDeRegion.some((c) => c.allowsRandomCli),
    tieneTarifas: carrierRates.some((r) => idsActivos.has(r.carrierId)),
  };
}

/**
 * Números que una cuenta de `tenantId` puede elegir: los ya asignados a ese
 * tenant, más los libres de su región. Nunca los de otro tenant ni los de
 * otra región (ADR-BD-005: un número solo se ofrece a tenants de su región).
 */
export function numerosParaTenant(
  numeros: PhoneNumber[],
  tenantId: string,
  regionId: string,
): PhoneNumber[] {
  return numeros.filter(
    (n) =>
      n.active &&
      n.regionId === regionId &&
      (n.tenantId === tenantId || n.tenantId === null),
  );
}
