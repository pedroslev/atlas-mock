// Lógica pura de "Probar la Consulta HTTP" del editor de flujo: detectar las
// variables, resolver la consulta con los valores de prueba (mismas reglas de
// codificación y escape que el flujo real), validar lo que bloquea el envío y
// simular la respuesta. No toca la red: en el mock la respuesta es simulada.

export type EncabezadoHttp = { nombre: string; valor: string };
export type ConfigHttp = {
  metodo: string;
  url: string;
  encabezados: EncabezadoHttp[];
  cuerpo: string;
};

/** Variables: {{ nombre }}, con espacios opcionales, puntos, guiones y guiones bajos. */
const RE_VARIABLE = /\{\{\s*([A-Za-z0-9_.-]+)\s*\}\}/g;

export const METODOS_CON_CUERPO = ["POST", "PUT", "PATCH"];
export const METODOS_QUE_MODIFICAN = ["POST", "PUT", "PATCH", "DELETE"];

/** Variables usadas en la URL, los encabezados y el cuerpo, sin repetir y en orden de aparición. */
export function variablesDeConsulta(c: ConfigHttp): string[] {
  const textos = [
    c.url,
    ...c.encabezados.flatMap((h) => [h.nombre, h.valor]),
    METODOS_CON_CUERPO.includes(c.metodo) ? c.cuerpo : "",
  ];
  const vistas = new Set<string>();
  for (const t of textos) for (const m of t.matchAll(RE_VARIABLE)) vistas.add(m[1]);
  return Array.from(vistas);
}

export type TipoValor = "numero" | "objeto" | "lista" | "texto";

/** Un valor que se interpreta como número, objeto o lista se toma como tal; el resto es texto. */
export function tipoDeValor(valor: string): TipoValor {
  try {
    const v: unknown = JSON.parse(valor);
    if (typeof v === "number" && Number.isFinite(v)) return "numero";
    if (Array.isArray(v)) return "lista";
    if (v !== null && typeof v === "object") return "objeto";
  } catch {
    /* no es JSON: texto */
  }
  return "texto";
}

/** Texto de un valor para URL y encabezados: número y texto tal cual, objeto o lista como su JSON compacto. */
function valorComoTexto(valor: string): string {
  const tipo = tipoDeValor(valor);
  return tipo === "objeto" || tipo === "lista" ? JSON.stringify(JSON.parse(valor)) : valor;
}

/** Texto de un valor para el cuerpo JSON: número como número, objeto o lista como JSON, texto escapado. */
function valorParaJson(valor: string): string {
  const tipo = tipoDeValor(valor);
  if (tipo === "numero") return String(JSON.parse(valor));
  if (tipo === "texto") return JSON.stringify(valor).slice(1, -1);
  return JSON.stringify(JSON.parse(valor));
}

export type ErrorConsulta = { codigo: string; datos?: Record<string, string> };

export type ConsultaResuelta = {
  metodo: string;
  url: string;
  encabezados: EncabezadoHttp[];
  cuerpo?: string;
  errores: ErrorConsulta[];
};

/** ¿La dirección es interna, privada, local o de metadatos? (no se puede consultar). */
export function hostBloqueado(hostname: string): boolean {
  const h = hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (h === "localhost" || h.endsWith(".localhost") || h.endsWith(".internal") || h.endsWith(".local")) return true;
  if (h === "0.0.0.0" || h === "::1" || h === "::") return true;
  if (/^(fc|fd)[0-9a-f]{2}:/.test(h) || h.startsWith("fe80:") || h.startsWith("::ffff:")) return true;
  const m = /^(\d+)\.(\d+)\.\d+\.\d+$/.exec(h);
  if (m) {
    const [a, b] = [Number(m[1]), Number(m[2])];
    return a === 127 || a === 10 || a === 0 || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 169 && b === 254);
  }
  return false;
}

/** Arma la consulta con los valores de prueba y reúne lo que bloquea el envío. */
export function resolverConsulta(c: ConfigHttp, valores: Record<string, string>): ConsultaResuelta {
  const errores: ErrorConsulta[] = [];
  const usadas = variablesDeConsulta(c);
  for (const v of usadas) {
    if ((valores[v] ?? "") === "") errores.push({ codigo: "sinValor", datos: { variable: v } });
  }
  const dato = (v: string) => valores[v] ?? "";

  // URL: cada valor va codificado.
  const url = c.url.replace(RE_VARIABLE, (_, v: string) => encodeURIComponent(valorComoTexto(dato(v))));
  if (url.trim() === "") {
    errores.push({ codigo: "urlVacia" });
  } else {
    try {
      const u = new URL(url);
      if (u.protocol !== "https:") errores.push({ codigo: "noHttps" });
      else if (hostBloqueado(u.hostname)) errores.push({ codigo: "hostBloqueado", datos: { host: u.hostname } });
    } catch {
      errores.push({ codigo: "urlInvalida" });
    }
  }

  // Encabezados: un valor con saltos de línea se rechaza (inyección de encabezados).
  const encabezados = c.encabezados
    .filter((h) => h.nombre.trim() !== "")
    .map((h) => {
      const nombre = h.nombre.replace(RE_VARIABLE, (_, v: string) => valorComoTexto(dato(v)));
      const valor = h.valor.replace(RE_VARIABLE, (_, v: string) => valorComoTexto(dato(v)));
      if (/[\r\n]/.test(nombre) || /[\r\n]/.test(valor)) errores.push({ codigo: "encabezadoSalto", datos: { nombre } });
      return { nombre, valor };
    });

  // Cuerpo: solo con POST, PUT y PATCH; tiene que quedar como JSON válido.
  let cuerpo: string | undefined;
  if (METODOS_CON_CUERPO.includes(c.metodo) && c.cuerpo.trim() !== "") {
    cuerpo = c.cuerpo.replace(RE_VARIABLE, (_, v: string) => valorParaJson(dato(v)));
    try {
      JSON.parse(cuerpo);
    } catch {
      errores.push({ codigo: "cuerpoJson" });
    }
  }
  return { metodo: c.metodo, url, encabezados, cuerpo, errores };
}

const comillas = (s: string) => `'${s.replace(/'/g, `'\\''`)}'`;

/** Comando cURL equivalente a la consulta ya resuelta. */
export function comoCurl(r: ConsultaResuelta): string {
  const partes = [`curl -X ${r.metodo} ${comillas(r.url)}`];
  for (const h of r.encabezados) partes.push(`-H ${comillas(`${h.nombre}: ${h.valor}`)}`);
  if (r.cuerpo !== undefined) partes.push(`--data-raw ${comillas(r.cuerpo)}`);
  return partes.join(" \\\n  ");
}

// --- Variables que llenan los macroestados anteriores -----------------------

type NodoMin = { id: string; type?: string; data: Record<string, unknown> };
type AristaMin = { source: string; target: string };

/** Variable declarada por un nodo: Capturar → su variable; Calcular → sus asignaciones; Consulta HTTP → «Guardar respuesta en». */
function declaradasPor(n: NodoMin): string[] {
  if (n.type === "collect" || n.type === "http") {
    const v = n.data.variable;
    return typeof v === "string" && v.trim() ? [v.trim()] : [];
  }
  if (n.type === "calcular") {
    const a = n.data.asignaciones;
    return Array.isArray(a)
      ? a.flatMap((x: { variable?: string }) => (x.variable?.trim() ? [x.variable.trim()] : []))
      : [];
  }
  return [];
}

/** Variables que llenan los nodos anteriores a `nodoId` (por las aristas del lienzo). */
export function variablesAnteriores(nodoId: string, nodos: NodoMin[], aristas: AristaMin[]): Set<string> {
  const porId = new Map(nodos.map((n) => [n.id, n]));
  const vistos = new Set<string>([nodoId]);
  const pendientes = [nodoId];
  const declaradas = new Set<string>();
  while (pendientes.length) {
    const actual = pendientes.pop()!;
    for (const a of aristas) {
      if (a.target !== actual || vistos.has(a.source)) continue;
      vistos.add(a.source);
      pendientes.push(a.source);
      const n = porId.get(a.source);
      if (n) for (const v of declaradasPor(n)) declaradas.add(v);
    }
  }
  return declaradas;
}

/** Una variable con puntos (respuesta.body.saldo) se declara por su primer tramo. */
export function llenadaPor(variable: string, declaradas: Set<string>): boolean {
  return declaradas.has(variable) || declaradas.has(variable.split(".")[0]);
}

// --- Respuesta simulada -----------------------------------------------------

export type Simulacion = "exito" | "404" | "500" | "timeout" | "conexion" | "grande";
export type SalidaHttp = "success" | "error" | "timeout";

export type RespuestaSimulada = {
  salida: SalidaHttp;
  status?: number;
  headers: Record<string, string>;
  body?: unknown;
  /** Por qué no hay respuesta o cuerpo (sin conexión, demasiado grande…). */
  motivo?: "conexion" | "grande" | "timeout";
};

/** Cuerpo verosímil de una respuesta exitosa según lo que pide la URL. */
export function cuerpoPorDefecto(url: string): string {
  const u = url.toLowerCase();
  if (u.includes("saldo") || u.includes("balance")) {
    return JSON.stringify({ documento: "28456789", saldo: 1520.5, moneda: "ARS", vencimiento: "2026-11-15" }, null, 2);
  }
  if (u.includes("pedido") || u.includes("order")) {
    return JSON.stringify({ pedido: "48213", estado: "En camino", items: [{ id: "A-1", cantidad: 2 }, { id: "B-7", cantidad: 1 }] }, null, 2);
  }
  return JSON.stringify({ ok: true, mensaje: "Consulta resuelta" }, null, 2);
}

/** Respuesta simulada para el modo elegido; `cuerpoExito` es el JSON editable del caso Éxito. */
export function simularRespuesta(sim: Simulacion, cuerpoExito: string): RespuestaSimulada {
  const headers = { "content-type": "application/json", "cache-control": "no-store" };
  switch (sim) {
    case "exito": {
      let body: unknown = cuerpoExito;
      try {
        body = JSON.parse(cuerpoExito);
      } catch {
        /* cuerpo no JSON: queda como texto */
      }
      return { salida: "success", status: 200, headers, body };
    }
    case "404":
      return { salida: "error", status: 404, headers, body: { error: "No encontrado" } };
    case "500":
      return { salida: "error", status: 500, headers, body: { error: "Error interno del servicio" } };
    case "timeout":
      return { salida: "timeout", headers: {}, motivo: "timeout" };
    case "conexion":
      return { salida: "error", headers: {}, motivo: "conexion" };
    case "grande":
      return { salida: "error", status: 200, headers: { ...headers, "content-length": "73400" }, motivo: "grande" };
  }
}

/** Rutas de un cuerpo: `respuesta.body.saldo`, con índices `respuesta.body.items[0].id`. */
export function rutaHija(ruta: string, clave: string | number): string {
  if (typeof clave === "number") return `${ruta}[${clave}]`;
  return /^[A-Za-z_]\w*$/.test(clave) ? `${ruta}.${clave}` : `${ruta}["${clave}"]`;
}
