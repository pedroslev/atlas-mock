"use client";

import { useCallback, useSyncExternalStore } from "react";
import { agentes, gruposTrabajo, type PermisoClaveApi } from "@/lib/mock-data";
import { createMockStore } from "@/lib/mock-store";

// Datos mock de las claves de acceso API del tenant (Olimpo → Configuración
// → Claves de acceso API). Con una clave, un integrador (un FDE de Mitrol o el
// equipo del cliente) construye aplicaciones propias sobre Atlas: un widget o
// una página de chat/videollamada a medida, un CRM que lee y escribe en
// Customer360, o una integración que maneja la interacción activa del agente.
// Ver documentacion/producto/16-claves-de-acceso-api.md. Acá no pega a ninguna API.

// Qué puede hacer una clave. Se eligen al crearla y no se editan después: para
// cambiarlas se crea otra clave y se revoca la vieja.
export type CapacidadClaveApi =
  | "chat"
  | "videollamada"
  | "customer360.lectura"
  | "customer360.escritura"
  | "hermes.control-agente";

// Orden en que se muestran en el alta y en la tabla. Los textos están en
// i18n/dict/claves-api.ts (`capacidad.<id>.titulo` / `.descripcion`).
export const capacidadesClaveApi: CapacidadClaveApi[] = [
  "chat",
  "videollamada",
  "customer360.lectura",
  "customer360.escritura",
  "hermes.control-agente",
];

// Capacidades que se pueden usar con la clave pública, desde un navegador: el
// widget de chat o videollamada, o el botón de otra web que opera el PAD con la
// sesión del agente. El resto (Customer360) maneja datos de los clientes y solo
// se usa con la clave secreta, desde un servidor.
export const capacidadesPublicas: CapacidadClaveApi[] = [
  "chat",
  "videollamada",
  "hermes.control-agente",
];

// Toda clave es un par: una pública, que va en el código que corre en el
// navegador y se puede volver a copiar siempre, y una secreta, que va en el
// servidor del integrador. De la secreta se guardan solo sus últimos 4
// caracteres: completa se ve una única vez, al crearla, y solo la ve quien la
// creó. El par queda asociado al tenant (implícito: todo el mock es de Banco
// Sur) y al usuario que lo creó, y se revoca junto.
export type ClaveApi = {
  id: string;
  nombre: string;
  /** Clave pública completa: no es un secreto, va en el JavaScript de la página. */
  clavePublica: string;
  /** Últimos 4 caracteres de la secreta, lo único que se ve de ella después del alta. */
  finalizacionSecreta: string;
  capacidades: CapacidadClaveApi[];
  /**
   * Orígenes (esquema + dominio) desde donde se acepta la clave pública.
   * Vacío = se acepta desde cualquier dominio. No aplica a la secreta, que se
   * usa desde un servidor. Es lo único que se edita después de crear la clave.
   */
  dominiosPermitidos: string[];
  /** Id del usuario del tenant que la creó (`agentes` en mock-data.ts). */
  creadaPor: string;
  /** ISO 8601. */
  creadaEl: string;
  /** ISO 8601; null si nunca se usó. */
  ultimoUso: string | null;
  /** Una clave revocada deja de funcionar pero queda en la lista, para saber que existió. */
  revocada: { por: string; el: string } | null;
};

// Prefijos fijos: dejan reconocer una clave de Atlas, y si es la pública o la
// secreta, a simple vista (en un log o en un repo).
export const PREFIJO_CLAVE_PUBLICA = "atl_pub_";
export const PREFIJO_CLAVE_SECRETA = "atl_sec_";

export const clavesApi: ClaveApi[] = [
  {
    id: "key-widget-web",
    nombre: "Widget de chat del sitio web",
    clavePublica: "atl_pub_5c1e8a07d93b42f6a1e0c7d48b2f9e31a6d0c4b2",
    finalizacionSecreta: "7f3c",
    capacidades: ["chat"],
    dominiosPermitidos: ["https://www.bancosur.com.ar", "https://ayuda.bancosur.com.ar"],
    creadaPor: "ag-1",
    creadaEl: "2026-08-12T10:24:00-03:00",
    ultimoUso: "2026-10-07T08:51:00-03:00",
    revocada: null,
  },
  {
    id: "key-crm",
    nombre: "CRM comercial · Customer360",
    clavePublica: "atl_pub_e04b7d2c91a85f36b0d4e7a29c1f83d56b2a07e9",
    finalizacionSecreta: "a91e",
    capacidades: ["customer360.lectura", "customer360.escritura"],
    dominiosPermitidos: [],
    creadaPor: "ag-2",
    creadaEl: "2026-09-03T15:02:00-03:00",
    ultimoUso: "2026-10-06T19:12:00-03:00",
    revocada: null,
  },
  {
    id: "key-telefonia",
    nombre: "Botonera de llamadas en el CRM",
    clavePublica: "atl_pub_9a3f6e1b08c47d25e9b3a0f6d71c48e2b5a90d3c",
    finalizacionSecreta: "04bd",
    capacidades: ["hermes.control-agente", "customer360.lectura"],
    dominiosPermitidos: ["https://crm.bancosur.com.ar"],
    creadaPor: "ag-3",
    creadaEl: "2026-09-28T11:40:00-03:00",
    ultimoUso: null,
    revocada: null,
  },
  {
    id: "key-prueba-fde",
    nombre: "Prueba página de videollamada",
    clavePublica: "atl_pub_2d7c0b9e4a61f38d5c2b7e0a94f16c3d8e5b2a71",
    finalizacionSecreta: "e2d8",
    capacidades: ["chat", "videollamada"],
    dominiosPermitidos: [],
    creadaPor: "ag-4",
    creadaEl: "2026-07-21T09:15:00-03:00",
    ultimoUso: "2026-08-02T17:30:00-03:00",
    revocada: { por: "ag-1", el: "2026-08-20T12:00:00-03:00" },
  },
];

// Genera una clave con forma realista (prefijo + 40 hex aleatorios). Solo
// para el mock: las claves reales las genera el servidor.
export function generarClaveApi(prefijo: string): string {
  const bytes = crypto.getRandomValues(new Uint8Array(20));
  return prefijo + Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

// Normaliza lo que tipea el usuario a un origen (`https://dominio[:puerto]`):
// acepta el dominio pelado ("www.bancosur.com.ar", se asume https) o la URL
// completa, y descarta ruta y query. Devuelve null si no es un dominio válido.
export function normalizarOrigen(texto: string): string | null {
  const limpio = texto.trim();
  if (!limpio) return null;
  const conEsquema = /^https?:\/\//i.test(limpio) ? limpio : `https://${limpio}`;
  try {
    const url = new URL(conEsquema);
    // Un dominio tiene al menos un punto (o es localhost, para desarrollo).
    if (!url.hostname.includes(".") && url.hostname !== "localhost") return null;
    return url.origin;
  } catch {
    return null;
  }
}

// Usuario logueado del mock (el mismo que muestra el header y Mi perfil).
export const usuarioActual = agentes[0];

// Permisos del usuario sobre las claves: la unión de los de sus grupos
// (Grupos y roles → Permisos), aditiva como el resto de los permisos
// (ADR-FUNDAMENTOS-007). Sin "ver" no ve la opción en el menú ni las claves.
const permisosClavesUsuario = new Set<PermisoClaveApi>(
  gruposTrabajo
    .filter((g) => g.usuarioIds.includes(usuarioActual.id))
    .flatMap((g) => g.permisosClavesApi)
);

export function puedeClaves(permiso: PermisoClaveApi) {
  return permisosClavesUsuario.has(permiso);
}

export function nombreUsuario(id: string) {
  return agentes.find((a) => a.id === id)?.nombre ?? id;
}

// Las claves se crean en /configuracion/claves-api/nueva y se ven en la lista y en el
// detalle: se comparten entre pantallas con el store de mock.
const clavesStore = createMockStore("atlas-claves-api", clavesApi);

/** Claves del tenant en vivo, con las tres operaciones que permite la pantalla. */
export function useClavesApi() {
  const claves = useSyncExternalStore(
    clavesStore.subscribe,
    clavesStore.read,
    clavesStore.serverSnapshot
  );

  const agregar = useCallback((clave: ClaveApi) => {
    clavesStore.write([clave, ...clavesStore.read()]);
  }, []);

  // Lo único editable de una clave son sus dominios permitidos: cambiar desde
  // dónde se acepta la pública no le da acceso a nada nuevo. Las capacidades
  // no se editan.
  const actualizarDominios = useCallback((id: string, dominios: string[]) => {
    clavesStore.write(
      clavesStore.read().map((c) => (c.id === id ? { ...c, dominiosPermitidos: dominios } : c))
    );
  }, []);

  const revocar = useCallback((id: string) => {
    clavesStore.write(
      clavesStore
        .read()
        .map((c) =>
          c.id === id
            ? { ...c, revocada: { por: usuarioActual.id, el: new Date().toISOString() } }
            : c
        )
    );
  }, []);

  return { claves, agregar, actualizarDominios, revocar };
}
