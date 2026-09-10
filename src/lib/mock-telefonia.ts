// Datos mock de Telefonía — administración de carriers de Kamailio desde Zeus.
// Ver documentacion/decisiones/telefonia/ADR-TELEFONIA-002 ("Administración de
// carriers por región") y ADR-BD-005 (modelo de la base `kamailio`). Cada región
// (un cluster, no un país) tiene su propia base `kamailio` y su media-api: un
// carrier multiregión es el mismo carrier, con el mismo id, dado de alta por
// zeus-api en la media-api de cada región donde opera. Acá no pega a ninguna API.

// Reusa el Badge por región que ya define mock-admin.ts (regionBadgeVariant) —
// no se redefine acá.

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

// Un número saliente (ANI/CLI), por qué carrier sale y en qué región está
// disponible — tabla `outbound_numbers` de la base `kamailio` de esa región. La
// región tiene que ser una de las del carrier, y un mismo número no puede estar
// en dos regiones (lo valida zeus-api antes del alta).
export type OutboundNumber = {
  id: string;
  /** ANI normalizado a solo dígitos — mismo criterio que accounts.account en olimpo-api. */
  number: string;
  carrierId: string;
  regionId: string;
  active: boolean;
};

export const outboundNumbers: OutboundNumber[] = [
  {
    id: "outbound-1161238744",
    number: "1161238744",
    carrierId: "carrier-telnyx",
    regionId: "region-ar",
    active: true,
  },
  {
    id: "outbound-1140009911",
    number: "1140009911",
    carrierId: "carrier-voxbone",
    regionId: "region-ar",
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
