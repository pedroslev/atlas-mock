// Datos mock de Telefonía — administración de Kamailio por región desde Zeus.
// Ver documentacion/relevamiento-legacy/administracion-kamailio/propuesta/
// administracion-kamailio-propuesta.md: media-api es quien expone el CRUD real
// de estas entidades (carriers → tabla `dispatcher`, whitelist → tabla
// `address`, ambas nativas de los módulos de Kamailio) y dispara el reload en
// caliente contra el Kamailio de la celda. Acá no pega a ninguna API real.

// Reusa el Badge por región que ya define mock-admin.ts (regionBadgeVariant) —
// no se redefine acá.

// Un proveedor (carrier) telefónico dado de alta por región, con su trunk de
// ruteo saliente (módulo `dispatcher`) y su whitelist de IP de origen (módulo
// `permissions` — la única protección anti-fraude decidida, ver
// ADR-TELEFONIA-002: no hay geo-IP ni rate limiting dentro de Kamailio).
export type Carrier = {
  id: string;
  name: string;
  regionId: string;
  /** URI SIP de destino del trunk (tabla `dispatcher.destination`). */
  destination: string;
  /** Prioridad/peso dentro del set de ruteo (`dispatcher.priority`). */
  priority: number;
  /** IPs autorizadas a mandar tráfico entrante (tabla `address`, una fila por IP). */
  whitelistIps: string[];
  /**
   * Si el carrier permite mandar llamadas con CLI oculto/aleatorio. Solo estos
   * carriers son candidatos al LCR de `carrierRates` (ver §6.2 de la propuesta).
   */
  allowsAnonymousOutbound: boolean;
  active: boolean;
};

export const carriers: Carrier[] = [
  {
    id: "carrier-telnyx-ar",
    name: "Telnyx AR",
    regionId: "region-ar",
    destination: "sip:200.1.10.5:5060",
    priority: 10,
    whitelistIps: ["200.1.10.5", "200.1.10.6"],
    allowsAnonymousOutbound: true,
    active: true,
  },
  {
    id: "carrier-voxbone-ar",
    name: "Voxbone AR",
    regionId: "region-ar",
    destination: "sip:200.1.20.8:5060",
    priority: 10,
    whitelistIps: ["200.1.20.8"],
    allowsAnonymousOutbound: false,
    active: true,
  },
  {
    id: "carrier-twilio-mx",
    name: "Twilio MX",
    regionId: "region-mx",
    destination: "sip:52.84.10.20:5060",
    priority: 10,
    whitelistIps: ["52.84.10.20"],
    allowsAnonymousOutbound: true,
    active: true,
  },
  {
    id: "carrier-entel-cl",
    name: "Entel CL",
    regionId: "region-cl",
    destination: "sip:190.98.4.12:5060",
    priority: 20,
    whitelistIps: ["190.98.4.12", "190.98.4.13"],
    allowsAnonymousOutbound: false,
    active: false,
  },
];

export function getCarrier(id: string): Carrier | undefined {
  return carriers.find((c) => c.id === id);
}

/** Carriers que se pueden elegir para dar de alta un número saliente o una tarifa nueva. */
export function getActiveCarriers(): Carrier[] {
  return carriers.filter((c) => c.active);
}

// Un número saliente (ANI/CLI) y por qué carrier sale — tabla `outbound_numbers`
// (propia de media-api, no nativa de un módulo de Kamailio). A propósito NO
// lleva tenant_id: quién es dueño de ese ANI ya lo resuelve olimpo-api
// (`accounts`/`campaign.outbound_accounts`); acá solo se responde la pregunta
// de infraestructura — con más de un carrier saliente en la misma región (ver
// Voxbone AR y Telnyx AR arriba), esto es lo que decide el trunk de salida.
export type OutboundNumber = {
  id: string;
  /** ANI normalizado a solo dígitos — mismo criterio que accounts.account en olimpo-api. */
  number: string;
  carrierId: string;
  active: boolean;
};

export const outboundNumbers: OutboundNumber[] = [
  {
    id: "outbound-1161238744",
    number: "1161238744",
    carrierId: "carrier-telnyx-ar",
    active: true,
  },
  {
    id: "outbound-1140009911",
    number: "1140009911",
    carrierId: "carrier-voxbone-ar",
    active: true,
  },
];

// Tabla `carrier_rates` — cuánto cobra cada carrier por minuto, por prefijo de
// destino. Se usa para elegir el carrier más barato cuando la cuenta/campaña
// pide salir con CLI oculto/aleatorio (§6.2 de la propuesta): entre los
// carriers con `allowsAnonymousOutbound`, gana el prefijo más específico que
// matchee el destino (longest-prefix-match) y, entre esos, el más barato.
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
    carrierId: "carrier-telnyx-ar",
    prefix: "54",
    ratePerMinute: 0.018,
    currency: "USD",
  },
  {
    id: "rate-telnyx-5411",
    carrierId: "carrier-telnyx-ar",
    prefix: "5411",
    ratePerMinute: 0.012,
    currency: "USD",
  },
  {
    id: "rate-twilio-54",
    carrierId: "carrier-twilio-mx",
    prefix: "54",
    ratePerMinute: 0.021,
    currency: "USD",
  },
];
