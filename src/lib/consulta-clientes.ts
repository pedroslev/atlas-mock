// Consulta avanzada de Clientes (ATLAS-1186, propuesta 2026-11-16, a validar
// con Pedro). Estilo "condición", como JQL de Jira:
//
//   etiquetas EN ("MORA +90", "PROMESA INCUMPLIDA") Y "Días de mora" >= 60
//   Y Vencimiento <= -30d ORDENAR POR Deuda DESC
//
// El modo básico son los filtros de la cabecera de la tabla; el avanzado es
// esta consulta. Se sincronizan: al pasar a avanzado, los filtros se escriben
// como consulta; al volver, la consulta se pasa a filtros si se puede (solo
// condiciones unidas con Y que un filtro de cabecera sabe mostrar).
//
// Palabras clave en español, con su equivalente en inglés: Y/AND, O/OR,
// NO/NOT, EN/IN, NO EN/NOT IN, CONTIENE/~, ORDENAR POR/ORDER BY, ASC, DESC.
// Fechas: AAAA-MM-DD, DD/MM/AAAA, "hoy" o relativas (-30d = hace 30 días,
// +2d = dentro de 2 días).
//
// MOCK: el intérprete corre en el navegador sobre los datos de ejemplo. Cómo
// se interpreta y ejecuta de verdad (motor, seguridad, performance) es del
// Chief Innovation Architect.

import { CAMPOS_ACTIVIDAD } from "@/lib/mock-actividad-clientes";
import {
  camposAdicionalesSistema,
  etiquetasCatalogo,
  telefonoPrincipal,
  type Cliente,
} from "@/lib/mock-clientes";

// ── Campos ─────────────────────────────────────────────────────────────────

export type TipoConsulta =
  | "texto"
  | "numero"
  | "moneda"
  | "fecha"
  | "lista"
  | "booleano"
  | "etiquetas";

export type CampoConsulta = {
  /** Mismo id que la columna de la tabla. */
  id: string;
  nombre: string;
  alias?: string[];
  tipo: TipoConsulta;
  valor: (c: Cliente) => string | string[] | undefined;
  /** Fecha sin dato (ej. nunca contactado) cuenta como muy antigua: cumple
   * "<" y "<=" (por ejemplo, "Último contacto" <= -7d). */
  sinDatoEsAntiguo?: boolean;
};

function contacto(c: Cliente, tipo: "email" | "whatsapp") {
  return (
    c.formasContacto.find((f) => f.tipo === tipo && f.principal) ??
    c.formasContacto.find((f) => f.tipo === tipo)
  )?.valor;
}

export const CAMPOS_CONSULTA: CampoConsulta[] = [
  { id: "nombre", nombre: "Nombre", tipo: "texto", valor: (c) => c.nombre },
  { id: "apellido", nombre: "Apellido", tipo: "texto", valor: (c) => c.apellido },
  {
    id: "identificacion",
    nombre: "Identificación",
    tipo: "texto",
    valor: (c) => `${c.tipoDoc} ${c.nroDoc}`,
  },
  { id: "idExterno", nombre: "ID externo", tipo: "texto", valor: (c) => c.idExterno },
  {
    id: "telefono",
    nombre: "Teléfono",
    alias: ["Teléfono principal"],
    tipo: "texto",
    valor: (c) => telefonoPrincipal(c),
  },
  { id: "email", nombre: "Email", alias: ["Mail"], tipo: "texto", valor: (c) => contacto(c, "email") },
  { id: "whatsapp", nombre: "WhatsApp", tipo: "texto", valor: (c) => contacto(c, "whatsapp") },
  {
    id: "etiquetas",
    nombre: "Etiquetas",
    alias: ["Etiqueta"],
    tipo: "etiquetas",
    valor: (c) =>
      c.etiquetas.map((id) => etiquetasCatalogo.find((e) => e.id === id)?.nombre ?? id),
  },
  ...camposAdicionalesSistema.map(
    (campo): CampoConsulta => ({
      id: campo.id,
      nombre: campo.nombre,
      tipo: campo.tipo,
      valor: (c) => c.infoAdicional[campo.nombre],
    })
  ),
  // Actividad del cliente (la calcula Atlas a partir de las interacciones).
  ...CAMPOS_ACTIVIDAD.map(
    (campo): CampoConsulta => ({
      id: campo.id,
      nombre: campo.nombre,
      tipo: campo.tipo,
      valor: (c) => campo.valor(c.id),
      sinDatoEsAntiguo: "sinDatoEsAntiguo" in campo,
    })
  ),
];

export type Operador = "=" | "!=" | ">" | ">=" | "<" | "<=" | "CONTIENE" | "EN" | "NO EN";

export const OPERADORES_POR_TIPO: Record<TipoConsulta, Operador[]> = {
  texto: ["=", "!=", "CONTIENE"],
  numero: ["=", "!=", ">", ">=", "<", "<="],
  moneda: [">", ">=", "<", "<="],
  fecha: [">", ">=", "<", "<=", "="],
  lista: ["=", "!=", "EN", "NO EN"],
  booleano: ["="],
  etiquetas: ["EN", "NO EN", "=", "!="],
};

function sinAcentos(s: string) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

export function buscarCampo(nombre: string): CampoConsulta | undefined {
  const n = sinAcentos(nombre);
  return CAMPOS_CONSULTA.find(
    (c) =>
      sinAcentos(c.nombre) === n ||
      sinAcentos(c.id) === n ||
      (c.alias ?? []).some((a) => sinAcentos(a) === n)
  );
}

/** Campo más parecido, para el "¿Quisiste decir…?". */
function parecido(nombre: string): CampoConsulta | undefined {
  const n = sinAcentos(nombre);
  return (
    CAMPOS_CONSULTA.find((c) => sinAcentos(c.nombre).startsWith(n)) ??
    CAMPOS_CONSULTA.find((c) => sinAcentos(c.nombre).includes(n)) ??
    CAMPOS_CONSULTA.find((c) => n.includes(sinAcentos(c.nombre)))
  );
}

/** Cómo se escribe el nombre de un campo en la consulta (con comillas si hace falta). */
export function escribirCampo(c: CampoConsulta) {
  return /^[\p{L}\d_]+$/u.test(c.nombre) ? c.nombre : `"${c.nombre}"`;
}

export function escribirValor(v: string) {
  return /^[\p{L}\d_.+\-/]+$/u.test(v) ? v : `"${v.replace(/"/g, '\\"')}"`;
}

/** Valores conocidos de un campo (para sugerir). */
export function valoresConocidos(campo: CampoConsulta, clientes: Cliente[]): string[] {
  if (campo.tipo === "etiquetas") return etiquetasCatalogo.map((e) => e.nombre);
  if (campo.tipo === "booleano") return ["Sí", "No"];
  if (campo.tipo === "fecha") return ["hoy", "-30d", "+2d"];
  if (campo.tipo !== "lista") return [];
  const vals = clientes.map((c) => campo.valor(c)).filter((v): v is string => typeof v === "string" && !!v);
  return [...new Set(vals)].sort();
}

// ── Tokens ─────────────────────────────────────────────────────────────────

type Token =
  | { tipo: "palabra"; texto: string; desde: number; hasta: number }
  | { tipo: "cadena"; texto: string; desde: number; hasta: number; cerrada: boolean }
  | { tipo: "simbolo"; texto: string; desde: number; hasta: number };

export class ErrorConsulta extends Error {
  constructor(mensaje: string, public posicion: number) {
    super(mensaje);
  }
}

function tokenizar(texto: string, tolerante = false): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < texto.length) {
    const ch = texto[i];
    if (/\s/.test(ch)) {
      i++;
      continue;
    }
    if (ch === '"') {
      let j = i + 1;
      let valor = "";
      while (j < texto.length && texto[j] !== '"') {
        if (texto[j] === "\\" && texto[j + 1] === '"') {
          valor += '"';
          j += 2;
          continue;
        }
        valor += texto[j];
        j++;
      }
      const cerrada = j < texto.length;
      if (!cerrada && !tolerante) throw new ErrorConsulta("Faltan las comillas de cierre.", i);
      tokens.push({ tipo: "cadena", texto: valor, desde: i, hasta: cerrada ? j + 1 : j, cerrada });
      i = cerrada ? j + 1 : j;
      continue;
    }
    const dos = texto.slice(i, i + 2);
    if ([">=", "<=", "!="].includes(dos)) {
      tokens.push({ tipo: "simbolo", texto: dos, desde: i, hasta: i + 2 });
      i += 2;
      continue;
    }
    if ("()=<>,~".includes(ch)) {
      tokens.push({ tipo: "simbolo", texto: ch, desde: i, hasta: i + 1 });
      i++;
      continue;
    }
    let j = i;
    while (j < texto.length && !/[\s()=<>,~"!]/.test(texto[j])) j++;
    if (j === i) {
      if (!tolerante) throw new ErrorConsulta(`No se entiende «${ch}».`, i);
      i++;
      continue;
    }
    tokens.push({ tipo: "palabra", texto: texto.slice(i, j), desde: i, hasta: j });
    i = j;
  }
  return tokens;
}

const CLAVES: Record<string, string> = {
  y: "Y",
  and: "Y",
  o: "O",
  or: "O",
  no: "NO",
  not: "NO",
  en: "EN",
  in: "EN",
  contiene: "CONTIENE",
  ordenar: "ORDENAR",
  order: "ORDENAR",
  por: "POR",
  by: "POR",
  asc: "ASC",
  desc: "DESC",
};

function clave(t: Token | undefined): string | undefined {
  if (!t || t.tipo !== "palabra") return undefined;
  return CLAVES[t.texto.toLowerCase()];
}

// ── Árbol ──────────────────────────────────────────────────────────────────

export type Condicion = {
  tipo: "condicion";
  campo: CampoConsulta;
  operador: Operador;
  valores: string[];
};
export type Nodo =
  | Condicion
  | { tipo: "y" | "o"; hijos: Nodo[] }
  | { tipo: "no"; hijo: Nodo };

export type Orden = { campo: CampoConsulta; desc: boolean };
export type Consulta = { filtro: Nodo | null; orden: Orden | null };

export function interpretar(texto: string): Consulta {
  const tokens = tokenizar(texto);
  let pos = 0;
  const actual = () => tokens[pos];
  const fin = () => texto.length;
  const posDe = (t: Token | undefined) => (t ? t.desde : fin());

  function esperarCampo(): CampoConsulta {
    const t = actual();
    if (!t || (t.tipo !== "palabra" && t.tipo !== "cadena") || (t.tipo === "palabra" && clave(t))) {
      throw new ErrorConsulta("Falta un campo.", posDe(t));
    }
    const campo = buscarCampo(t.texto);
    if (!campo) {
      const p = parecido(t.texto);
      throw new ErrorConsulta(
        `No existe el campo «${t.texto}».${p ? ` ¿Quisiste decir «${p.nombre}»?` : ""}`,
        t.desde
      );
    }
    pos++;
    return campo;
  }

  function leerOperador(campo: CampoConsulta): Operador {
    const t = actual();
    let op: Operador | undefined;
    if (t?.tipo === "simbolo" && ["=", "!=", ">", ">=", "<", "<=", "~"].includes(t.texto)) {
      op = t.texto === "~" ? "CONTIENE" : (t.texto as Operador);
      pos++;
    } else if (clave(t) === "CONTIENE") {
      op = "CONTIENE";
      pos++;
    } else if (clave(t) === "EN") {
      op = "EN";
      pos++;
    } else if (clave(t) === "NO" && clave(tokens[pos + 1]) === "EN") {
      op = "NO EN";
      pos += 2;
    }
    if (!op) throw new ErrorConsulta(`Falta la condición después de «${campo.nombre}».`, posDe(t));
    if (!OPERADORES_POR_TIPO[campo.tipo].includes(op)) {
      throw new ErrorConsulta(
        `«${campo.nombre}» no admite «${op}». Se puede usar: ${OPERADORES_POR_TIPO[campo.tipo].join(", ")}.`,
        posDe(t)
      );
    }
    return op;
  }

  function leerValor(): string {
    const t = actual();
    if (!t || t.tipo === "simbolo" || (t.tipo === "palabra" && clave(t) && !["NO"].includes(clave(t)!))) {
      throw new ErrorConsulta("Falta un valor.", posDe(t));
    }
    pos++;
    return t.texto;
  }

  function validarValor(campo: CampoConsulta, v: string, desde: number) {
    if ((campo.tipo === "numero" || campo.tipo === "moneda") && Number.isNaN(Number(v.replace(",", ".")))) {
      throw new ErrorConsulta(`«${campo.nombre}» es un número: «${v}» no sirve.`, desde);
    }
    if (campo.tipo === "fecha" && !aFecha(v)) {
      throw new ErrorConsulta(
        `«${v}» no es una fecha. Usá AAAA-MM-DD, DD/MM/AAAA, hoy, -30d o +2d.`,
        desde
      );
    }
    if (campo.tipo === "etiquetas" && !etiquetasCatalogo.some((e) => sinAcentos(e.nombre) === sinAcentos(v))) {
      throw new ErrorConsulta(`No existe la etiqueta «${v}».`, desde);
    }
  }

  function condicion(): Condicion {
    const campo = esperarCampo();
    const operador = leerOperador(campo);
    const valores: string[] = [];
    if (operador === "EN" || operador === "NO EN") {
      const abre = actual();
      if (abre?.tipo !== "simbolo" || abre.texto !== "(") {
        throw new ErrorConsulta(`Después de «${operador}» va una lista entre paréntesis: ("a", "b").`, posDe(abre));
      }
      pos++;
      for (;;) {
        const t = actual();
        const v = leerValor();
        validarValor(campo, v, posDe(t));
        valores.push(v);
        const sep = actual();
        if (sep?.tipo === "simbolo" && sep.texto === ",") {
          pos++;
          continue;
        }
        if (sep?.tipo === "simbolo" && sep.texto === ")") {
          pos++;
          break;
        }
        throw new ErrorConsulta("Falta cerrar la lista con «)».", posDe(sep));
      }
    } else {
      const t = actual();
      const v = leerValor();
      validarValor(campo, v, posDe(t));
      valores.push(v);
    }
    return { tipo: "condicion", campo, operador, valores };
  }

  function factor(): Nodo {
    const t = actual();
    if (clave(t) === "NO") {
      pos++;
      return { tipo: "no", hijo: factor() };
    }
    if (t?.tipo === "simbolo" && t.texto === "(") {
      pos++;
      const n = expresion();
      const c = actual();
      if (c?.tipo !== "simbolo" || c.texto !== ")") throw new ErrorConsulta("Falta cerrar el paréntesis.", posDe(c));
      pos++;
      return n;
    }
    return condicion();
  }

  function termino(): Nodo {
    const hijos = [factor()];
    while (clave(actual()) === "Y") {
      pos++;
      hijos.push(factor());
    }
    return hijos.length === 1 ? hijos[0] : { tipo: "y", hijos };
  }

  function expresion(): Nodo {
    const hijos = [termino()];
    while (clave(actual()) === "O") {
      pos++;
      hijos.push(termino());
    }
    return hijos.length === 1 ? hijos[0] : { tipo: "o", hijos };
  }

  let filtro: Nodo | null = null;
  if (tokens.length > 0 && clave(actual()) !== "ORDENAR") filtro = expresion();

  let orden: Orden | null = null;
  if (clave(actual()) === "ORDENAR") {
    pos++;
    if (clave(actual()) !== "POR") throw new ErrorConsulta("Después de ORDENAR va POR.", posDe(actual()));
    pos++;
    const campo = esperarCampo();
    let desc = false;
    if (clave(actual()) === "ASC" || clave(actual()) === "DESC") {
      desc = clave(actual()) === "DESC";
      pos++;
    }
    orden = { campo, desc };
  }

  if (pos < tokens.length) {
    const t = actual()!;
    throw new ErrorConsulta(
      `Sobra «${t.texto}». Para sumar otra condición usá Y u O.`,
      t.desde
    );
  }
  return { filtro, orden };
}

// ── Evaluación ─────────────────────────────────────────────────────────────

function hoyISO(delta = 0) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + delta);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** Fecha de la consulta en AAAA-MM-DD, o undefined si no es una fecha. */
export function aFecha(v: string): string | undefined {
  const s = v.trim().toLowerCase();
  if (s === "hoy" || s === "today") return hoyISO();
  const rel = /^([+-])(\d+)d$/.exec(s);
  if (rel) return hoyISO((rel[1] === "-" ? -1 : 1) * Number(rel[2]));
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const dmy = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(s);
  if (dmy) return `${dmy[3]}-${dmy[2].padStart(2, "0")}-${dmy[1].padStart(2, "0")}`;
  return undefined;
}

function aNumero(v: string) {
  return Number(v.replace(/[^\d,-]/g, "").replace(",", "."));
}

function comparar(op: Operador, a: number | string, b: number | string) {
  switch (op) {
    case "=":
      return a === b;
    case "!=":
      return a !== b;
    case ">":
      return a > b;
    case ">=":
      return a >= b;
    case "<":
      return a < b;
    case "<=":
      return a <= b;
    default:
      return false;
  }
}

function cumpleCondicion(c: Cliente, n: Condicion): boolean {
  const dato = n.campo.valor(c);
  const { operador: op, valores } = n;
  switch (n.campo.tipo) {
    case "etiquetas": {
      const tiene = ((dato as string[]) ?? []).map(sinAcentos);
      const alguna = valores.some((v) => tiene.includes(sinAcentos(v)));
      return op === "EN" || op === "=" ? alguna : !alguna;
    }
    case "numero":
    case "moneda":
      if (typeof dato !== "string" || !dato) return op === "!=";
      return comparar(op, aNumero(dato), Number(valores[0].replace(",", ".")));
    case "fecha":
      if (typeof dato !== "string" || !dato) {
        return !!n.campo.sinDatoEsAntiguo && (op === "<" || op === "<=");
      }
      return comparar(op, dato, aFecha(valores[0]) ?? "");
    case "lista":
    case "booleano": {
      const d = sinAcentos(typeof dato === "string" ? dato : "");
      const coincide = valores.some((v) => sinAcentos(v) === d);
      return op === "=" || op === "EN" ? coincide : !coincide;
    }
    default: {
      const d = sinAcentos(typeof dato === "string" ? dato : "");
      const v = sinAcentos(valores[0]);
      if (op === "CONTIENE") return d.includes(v);
      return op === "=" ? d === v : d !== v;
    }
  }
}

export function cumple(c: Cliente, n: Nodo | null): boolean {
  if (!n) return true;
  switch (n.tipo) {
    case "condicion":
      return cumpleCondicion(c, n);
    case "y":
      return n.hijos.every((h) => cumple(c, h));
    case "o":
      return n.hijos.some((h) => cumple(c, h));
    case "no":
      return !cumple(c, n.hijo);
  }
}

// ── Autocompletado ─────────────────────────────────────────────────────────

export type Sugerencia = { texto: string; insertar: string; detalle?: string };

type Estado =
  | "campo"
  | "operador"
  | "valor"
  | "abreLista"
  | "lista"
  | "listaSep"
  | "conector"
  | "ordenPor"
  | "ordenCampo"
  | "ordenDir"
  | "fin";

/**
 * Qué se puede escribir en la posición del cursor. Devuelve dónde empieza la
 * palabra a medio escribir (se reemplaza al elegir) y las opciones.
 */
export function sugerir(
  texto: string,
  cursor: number,
  clientes: Cliente[]
): { desde: number; opciones: Sugerencia[] } {
  const antes = texto.slice(0, cursor);
  const tokens = tokenizar(antes, true);
  // Palabra a medio escribir: el último token pegado al cursor.
  let parcial = "";
  let desde = cursor;
  const ultimo = tokens[tokens.length - 1];
  if (
    ultimo &&
    ultimo.hasta === cursor &&
    (ultimo.tipo === "palabra" || (ultimo.tipo === "cadena" && !ultimo.cerrada))
  ) {
    parcial = ultimo.texto;
    desde = ultimo.desde;
    tokens.pop();
  }

  let estado: Estado = "campo";
  let campo: CampoConsulta | undefined;
  let profundidad = 0;
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    const k = clave(t);
    switch (estado) {
      case "campo":
        if (t.texto === "(") profundidad++;
        else if (k === "NO") break;
        else if (k === "ORDENAR") estado = "ordenPor";
        else {
          campo = buscarCampo(t.texto);
          estado = "operador";
        }
        break;
      case "operador":
        if (k === "NO") break; // "NO EN"
        estado = k === "EN" ? "abreLista" : "valor";
        break;
      case "abreLista":
        estado = t.texto === "(" ? "lista" : "conector";
        break;
      case "lista":
        estado = t.texto === ")" ? "conector" : "listaSep";
        break;
      case "listaSep":
        estado = t.texto === "," ? "lista" : "conector";
        break;
      case "valor":
        estado = "conector";
        break;
      case "conector":
        if (k === "Y" || k === "O") estado = "campo";
        else if (k === "ORDENAR") estado = "ordenPor";
        else if (t.texto === ")") profundidad--;
        break;
      case "ordenPor":
        estado = "ordenCampo";
        break;
      case "ordenCampo":
        campo = buscarCampo(t.texto);
        estado = "ordenDir";
        break;
      case "ordenDir":
        estado = "fin";
        break;
    }
  }

  const campos = (): Sugerencia[] =>
    CAMPOS_CONSULTA.map((c) => ({ texto: c.nombre, insertar: escribirCampo(c), detalle: TIPO_TEXTO[c.tipo] }));

  let opciones: Sugerencia[] = [];
  switch (estado) {
    case "campo":
      opciones = [...campos(), { texto: "(", insertar: "(" }, { texto: "NO", insertar: "NO" }];
      break;
    case "operador":
      opciones = campo
        ? OPERADORES_POR_TIPO[campo.tipo].map((op) => ({
            texto: op,
            insertar: op === "EN" || op === "NO EN" ? `${op} (` : op,
            detalle: OPERADOR_TEXTO[op],
          }))
        : [];
      break;
    case "valor":
    case "lista":
      opciones = campo
        ? valoresConocidos(campo, clientes).map((v) => ({
            texto: v,
            insertar: escribirValor(v),
            detalle: campo!.tipo === "fecha" ? FECHA_TEXTO[v] : undefined,
          }))
        : [];
      break;
    case "abreLista":
      opciones = [{ texto: "(", insertar: "(" }];
      break;
    case "listaSep":
      opciones = [
        { texto: ",", insertar: ",", detalle: "otro valor" },
        { texto: ")", insertar: ")", detalle: "cerrar la lista" },
      ];
      break;
    case "conector":
      opciones = [
        { texto: "Y", insertar: "Y", detalle: "también tiene que cumplir" },
        { texto: "O", insertar: "O", detalle: "alcanza con que cumpla una" },
        ...(profundidad > 0 ? [{ texto: ")", insertar: ")", detalle: "cerrar el paréntesis" }] : []),
        { texto: "ORDENAR POR", insertar: "ORDENAR POR" },
      ];
      break;
    case "ordenPor":
      opciones = [{ texto: "POR", insertar: "POR" }];
      break;
    case "ordenCampo":
      opciones = campos();
      break;
    case "ordenDir":
      opciones = [
        { texto: "ASC", insertar: "ASC", detalle: "de menor a mayor" },
        { texto: "DESC", insertar: "DESC", detalle: "de mayor a menor" },
      ];
      break;
  }

  const p = sinAcentos(parcial);
  if (p) opciones = opciones.filter((o) => sinAcentos(o.texto).startsWith(p) || sinAcentos(o.texto).includes(` ${p}`));
  return { desde, opciones: opciones.slice(0, 12) };
}

const TIPO_TEXTO: Record<TipoConsulta, string> = {
  texto: "texto",
  numero: "número",
  moneda: "moneda",
  fecha: "fecha",
  lista: "lista",
  booleano: "sí / no",
  etiquetas: "etiquetas",
};

const OPERADOR_TEXTO: Record<Operador, string> = {
  "=": "es igual a",
  "!=": "no es",
  ">": "mayor que",
  ">=": "mayor o igual",
  "<": "menor que",
  "<=": "menor o igual",
  CONTIENE: "contiene el texto",
  EN: "es alguno de",
  "NO EN": "no es ninguno de",
};

const FECHA_TEXTO: Record<string, string> = {
  hoy: "fecha de hoy",
  "-30d": "hace 30 días",
  "+2d": "dentro de 2 días",
};
