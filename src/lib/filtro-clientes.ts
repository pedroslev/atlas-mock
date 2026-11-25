// Filtro de clientes (ATLAS-1186, propuesta 2026-11-13, a validar con Pedro).
// Es el mismo filtro en dos lugares: el listado de Clientes (para una carga
// manual con "Cargar en campaña") y la Entrada / Salida de la estrategia de
// salida de una campaña (para que entren o salgan solos). No hay un
// "segmentador" aparte: el filtro vive donde se usa.
//
// En las fechas sólo se ofrecen rangos ("dentro de los próximos N días",
// "hace más de N días", antes / después de una fecha), nunca "exactamente en
// N días": un rango abierto no saca al cliente de la estrategia al día
// siguiente sólo porque pasó el tiempo.

import {
  camposAdicionalesSistema,
  clientes,
  type Cliente,
} from "@/lib/mock-clientes";
import { CAMPOS_ACTIVIDAD } from "@/lib/mock-actividad-clientes";

export type TipoFiltro = "etiqueta" | "numero" | "moneda" | "fecha" | "lista" | "texto";

export type CampoFiltro = {
  id: string;
  nombre: string;
  tipo: TipoFiltro;
  /** Dato del cliente (por defecto, su información adicional con ese nombre). */
  valor?: (c: Cliente) => string | undefined;
  /** Fecha sin dato cuenta como muy antigua (nunca contactado). */
  sinDatoEsAntiguo?: boolean;
};

/** Campos por los que se puede filtrar: etiquetas, información adicional y
 * actividad del cliente (la calcula Atlas). */
export const CAMPOS_FILTRO: CampoFiltro[] = [
  { id: "etiqueta", nombre: "Etiqueta", tipo: "etiqueta" },
  ...camposAdicionalesSistema.map((c) => ({
    id: c.id,
    nombre: c.nombre,
    tipo: (c.tipo === "booleano" ? "texto" : c.tipo) as TipoFiltro,
  })),
  ...CAMPOS_ACTIVIDAD.map((c) => ({
    id: c.id,
    nombre: c.nombre,
    tipo: c.tipo as TipoFiltro,
    valor: (cl: Cliente) => c.valor(cl.id),
    sinDatoEsAntiguo: "sinDatoEsAntiguo" in c,
  })),
];

function datoDe(campo: CampoFiltro, c: Cliente) {
  return campo.valor ? campo.valor(c) : c.infoAdicional[campo.nombre];
}

export type Operador =
  | "tiene"
  | "noTiene"
  | "es"
  | "noEs"
  | "contiene"
  | "mayorIgual"
  | "menorIgual"
  | "proximosDias"
  | "haceMasDias"
  | "antesDe"
  | "despuesDe";

export const OPERADORES: Record<TipoFiltro, Operador[]> = {
  etiqueta: ["tiene", "noTiene"],
  numero: ["mayorIgual", "menorIgual", "es"],
  moneda: ["mayorIgual", "menorIgual"],
  fecha: ["proximosDias", "haceMasDias", "antesDe", "despuesDe"],
  lista: ["es", "noEs"],
  texto: ["es", "contiene"],
};

export type Condicion = {
  id: string;
  campo: string;
  operador: Operador;
  valor: string;
};

export function campoFiltro(id: string) {
  return CAMPOS_FILTRO.find((c) => c.id === id) ?? CAMPOS_FILTRO[0];
}

export function condicionVacia(id: string): Condicion {
  return { id, campo: "etiqueta", operador: "tiene", valor: "" };
}

/** Valores que aparecen hoy para un campo de tipo lista (para el selector). */
export function valoresDeLista(campoId: string): string[] {
  const campo = campoFiltro(campoId);
  const vals = clientes
    .map((c) => datoDe(campo, c))
    .filter((v): v is string => !!v);
  return [...new Set(vals)].sort();
}

const DIA = 24 * 60 * 60 * 1000;

function aNumero(v: string): number {
  return Number(v.replace(/[^\d,-]/g, "").replace(",", "."));
}

function cumpleCondicion(cliente: Cliente, c: Condicion, hoy: Date): boolean {
  // Una condición a medio armar no filtra (el editor la marca).
  if (!c.valor.trim()) return true;
  const campo = campoFiltro(c.campo);
  if (campo.tipo === "etiqueta") {
    const tiene = cliente.etiquetas.includes(c.valor);
    return c.operador === "tiene" ? tiene : !tiene;
  }
  const dato = datoDe(campo, cliente);
  if (dato === undefined || dato === "") {
    if (campo.sinDatoEsAntiguo && (c.operador === "haceMasDias" || c.operador === "antesDe")) return true;
    return c.operador === "noEs";
  }
  switch (c.operador) {
    case "es":
      return campo.tipo === "numero"
        ? aNumero(dato) === aNumero(c.valor)
        : dato.toLowerCase() === c.valor.toLowerCase();
    case "noEs":
      return dato.toLowerCase() !== c.valor.toLowerCase();
    case "contiene":
      return dato.toLowerCase().includes(c.valor.toLowerCase());
    case "mayorIgual":
      return aNumero(dato) >= aNumero(c.valor);
    case "menorIgual":
      return aNumero(dato) <= aNumero(c.valor);
    case "proximosDias": {
      const dias = (new Date(dato).getTime() - hoy.getTime()) / DIA;
      return dias >= -1 && dias <= Number(c.valor);
    }
    case "haceMasDias": {
      const dias = (hoy.getTime() - new Date(dato).getTime()) / DIA;
      return dias >= Number(c.valor);
    }
    case "antesDe":
      return dato < c.valor;
    case "despuesDe":
      return dato > c.valor;
    default:
      return true;
  }
}

/** Cumple todas las condiciones (se combinan con "y"). */
export function cumpleFiltro(cliente: Cliente, condiciones: Condicion[], hoy = new Date()) {
  return condiciones.every((c) => cumpleCondicion(cliente, c, hoy));
}

export function filtrarClientes(condiciones: Condicion[], hoy = new Date()) {
  return clientes.filter((c) => cumpleFiltro(c, condiciones, hoy));
}

/** Hay al menos una condición con valor (la que está vacía no cuenta). */
export function tieneCondiciones(condiciones: Condicion[]) {
  return condiciones.some((c) => c.valor.trim() !== "");
}
