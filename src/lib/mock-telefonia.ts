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
   * **Reserva** del número (`Organization.tenantId` de mock-admin), declarada
   * desde Zeus y solo desde Zeus. `null` es libre para cualquier tenant de la
   * región; con valor, queda reservado para ese tenant lo use o no.
   *
   * Que una cuenta tome un número libre NO toca este campo (ADR-BD-005,
   * "Ocupación de un número"): quién lo tiene hoy es `OcupacionDeNumero`, que
   * sale de consultar las cuentas de la región, no de esta tabla.
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
// las mismas tablas. Acá se comparte vía localStorage + evento, mismo patrón
// que ya usa `use-locale.ts`: así, tomar un número desde Cuentas se ve
// reflejado en Zeus sin recargar.

/**
 * Crea un store de mock compartido entre pantallas, listo para
 * `useSyncExternalStore`.
 *
 * El cache contra el string crudo no es opcional: `useSyncExternalStore` exige
 * que `read()` devuelva la MISMA referencia si nada cambió, y un `JSON.parse` a
 * secas crea un array nuevo en cada llamada y dispara un loop infinito.
 */
function createMockStore<T>(key: string, seed: T) {
  const evento = `${key}-change`;
  let rawCache: string | null = null;
  let parsedCache: T = seed;

  const read = (): T => {
    if (typeof window === "undefined") return seed;
    const stored = window.localStorage.getItem(key);
    if (!stored) return seed;
    if (stored === rawCache) return parsedCache;
    try {
      parsedCache = JSON.parse(stored) as T;
      rawCache = stored;
      return parsedCache;
    } catch {
      return seed;
    }
  };

  const write = (next: T) => {
    window.localStorage.setItem(key, JSON.stringify(next));
    window.dispatchEvent(new Event(evento));
  };

  // "storage" cubre otra pestaña; el evento propio cubre esta misma.
  const subscribe = (callback: () => void) => {
    window.addEventListener(evento, callback);
    window.addEventListener("storage", callback);
    return () => {
      window.removeEventListener(evento, callback);
      window.removeEventListener("storage", callback);
    };
  };

  return { read, write, subscribe, serverSnapshot: () => seed };
}

const numbersStore = createMockStore("atlas-phone-numbers", phoneNumbers);

/** Números en vivo, compartidos entre todas las pantallas que los usan. */
export function usePhoneNumbers() {
  const numeros = useSyncExternalStore(
    numbersStore.subscribe,
    numbersStore.read,
    numbersStore.serverSnapshot,
  );

  const setNumeros = useCallback(
    (updater: (prev: PhoneNumber[]) => PhoneNumber[]) => {
      numbersStore.write(updater(numbersStore.read()));
    },
    [],
  );

  return { numeros, setNumeros };
}

// --- Ocupación: qué tenant usa hoy cada número ----------------------------
// No es una tabla de la base kamailio. Es el resultado de consultar `accounts`
// de la región (ADR-BD-005, "Ocupación de un número"), mirando los dos lugares
// donde aparece un número: la línea de la cuenta y el `outbound_number` de sus
// settings. Se mockea como lista porque el mock no tiene las cuentas de los
// otros tenants de la región.

export type OcupacionDeNumero = {
  /** El número en dígitos, igual que `PhoneNumber.number`. */
  number: string;
  /** Tenant que lo tiene tomado en alguna cuenta. Como mucho uno por número. */
  tenantId: string;
};

export const ocupacionDeNumeros: OcupacionDeNumero[] = [
  // Libre en la tabla `numbers`, pero Telco Norte ya lo usa en una cuenta:
  // Zeus lo muestra tomado y ningún otro tenant de la región lo ve en Cuentas.
  // Si Telco Norte borra esa cuenta, vuelve al pool — la reserva sigue en null.
  { number: "1140001001", tenantId: "org-telco-norte" },
  // Reservado a Banco Sur y además usado por él (cuenta acc-1 de mock-data).
  { number: "1140009911", tenantId: "org-banco-sur" },
];

const ocupacionStore = createMockStore(
  "atlas-numeros-ocupacion",
  ocupacionDeNumeros,
);

/** Tenant que hoy tiene tomado el número en una cuenta, o `null` si nadie. */
export function ocupanteDeNumero(
  ocupacion: OcupacionDeNumero[],
  numero: string,
): string | null {
  return ocupacion.find((o) => o.number === numero)?.tenantId ?? null;
}

/** Ocupación en vivo, compartida entre Zeus y Cuentas. */
export function useOcupacionDeNumeros() {
  const ocupacion = useSyncExternalStore(
    ocupacionStore.subscribe,
    ocupacionStore.read,
    ocupacionStore.serverSnapshot,
  );

  /**
   * Una cuenta toma el número. Es el guard del alta de cuenta: si otro tenant
   * lo ocupó entremedio, no se pisa — devuelve `false` y la pantalla tiene que
   * refrescar el selector, igual que el `409` del backend real.
   */
  const ocupar = useCallback((numero: string, tenantId: string) => {
    const actual = ocupacionStore.read();
    const ocupante = ocupanteDeNumero(actual, numero);
    if (ocupante && ocupante !== tenantId) return false;
    if (ocupante === tenantId) return true;
    ocupacionStore.write([...actual, { number: numero, tenantId }]);
    return true;
  }, []);

  /** La cuenta se borra: el número vuelve al pool si su reserva era libre. */
  const liberar = useCallback((numero: string) => {
    ocupacionStore.write(
      ocupacionStore.read().filter((o) => o.number !== numero),
    );
  }, []);

  return { ocupacion, ocupar, liberar };
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
 * Números que una cuenta de `tenantId` puede elegir: los reservados para ese
 * tenant, más los libres de su región que no tenga tomados otro tenant en una
 * cuenta. Nunca los de otro tenant ni los de otra región (ADR-BD-005: un
 * número solo se ofrece a tenants de su región).
 */
export function numerosParaTenant(
  numeros: PhoneNumber[],
  ocupacion: OcupacionDeNumero[],
  tenantId: string,
  regionId: string,
): PhoneNumber[] {
  return numeros.filter((n) => {
    if (!n.active || n.regionId !== regionId) return false;
    if (n.tenantId === tenantId) return true;
    if (n.tenantId !== null) return false;
    // Libre: lo ve mientras nadie más lo tenga tomado en una cuenta.
    const ocupante = ocupanteDeNumero(ocupacion, n.number);
    return ocupante === null || ocupante === tenantId;
  });
}
