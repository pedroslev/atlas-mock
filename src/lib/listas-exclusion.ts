import type {
  CanalExclusion,
  ContactoExcluido,
  SentidoExclusion,
} from "@/lib/mock-data";

// Reglas de los contactos de una lista de exclusión (ATLAS-1444). Las usan la
// carga manual, la edición y la importación, para que sean una sola regla.
// MOCK: se validan en el navegador.
// REAL: las valida el servicio; la pantalla muestra lo que devuelve.

export const CANALES: CanalExclusion[] = ["calline", "wsp", "email"];
export const SENTIDOS: SentidoExclusion[] = ["saliente", "entrante", "bidireccional"];

export type Limpieza = {
  prefijos: { id: string; prefijo: string; reemplazo: string }[];
  caracteres: string;
};

export const SIN_LIMPIEZA: Limpieza = { prefijos: [], caracteres: "" };

export type Validacion =
  | { ok: true; valor: string }
  | { ok: false; motivo: "numero" | "email" };

/** Normaliza y valida un contacto para su canal. */
export function validarContacto(
  crudo: string,
  canal: CanalExclusion,
  limpieza: Limpieza = SIN_LIMPIEZA
): Validacion {
  const texto = crudo.trim();
  if (canal === "email") {
    const email = texto.toLowerCase();
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      ? { ok: true, valor: email }
      : { ok: false, motivo: "email" };
  }
  let numero = texto;
  for (const c of limpieza.caracteres.replace(/\s/g, "")) {
    numero = numero.split(c).join("");
  }
  // Siempre: + inicial, espacios, guiones y paréntesis.
  numero = numero.replace(/^\+/, "").replace(/[\s\-()]/g, "");
  for (const r of limpieza.prefijos) {
    if (r.prefijo && numero.startsWith(r.prefijo)) {
      numero = r.reemplazo + numero.slice(r.prefijo.length);
      break;
    }
  }
  return /^\d{8,15}$/.test(numero)
    ? { ok: true, valor: numero }
    : { ok: false, motivo: "numero" };
}

/** Pasar a Bidireccional un contacto que ya está con otro sentido (cuando el usuario lo elige; ver eleccion-sentido.tsx). */
export function combinarSentido(
  actual: SentidoExclusion,
  nuevo: SentidoExclusion
): SentidoExclusion {
  if (actual === nuevo) return actual;
  return "bidireccional";
}

export const clave = (c: Pick<ContactoExcluido, "contacto" | "canal">) =>
  `${c.canal}|${c.contacto}`;

export function formatearFecha(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

// MOCK: usuario de la sesión.
export const USUARIO_ACTUAL = "Marina Acosta";

let secuencia = 0;
export const nuevoId = () => `dnc-nuevo-${++secuencia}`;
