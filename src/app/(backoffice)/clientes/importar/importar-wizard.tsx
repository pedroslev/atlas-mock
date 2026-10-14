"use client";

import { createContext, useContext, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  CircleAlert,
  FileSpreadsheet,
  FileText,
  FileX,
  Plus,
  RefreshCw,
  Sparkles,
  Tags,
  Trash2,
  TriangleAlert,
  Upload,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ADefinir, EtiquetaBadge } from "@/components/clientes/clientes-ui";
import { ComboSelect, type ComboOption } from "@/components/clientes/combo-select";
import { EtiquetaDialog } from "@/components/clientes/etiqueta-dialog";
import { PageHeader } from "@/components/layout/page-header";
import { cn } from "@/lib/utils";
import {
  camposAdicionalesSistema,
  csvEjemplo,
  etiquetasCatalogo,
  type Etiqueta,
  type TipoCampo,
} from "@/lib/mock-clientes";
import { useT } from "@/lib/i18n";

// Importación de clientes en pantalla propia (propuesta 2026-10-09, ajustes
// 2026-10-13 y 2026-10-14 — ver relevamiento/clientes-y-contactaciones/
// checklist-mock.md).
// - Paso Archivo según la US T4-3268 (formatos, encabezado, separadores,
//   hoja) + XLS y codificación para TXT/CSV.
// - En el mock todo arranca SIN relacionar (en el producto habrá asociación
//   automática). Las columnas que no se usan en datos básicos ni contacto
//   pasan solas a información adicional con el nombre de su encabezado.
// - Pasos y navegación fijos arriba/abajo; los pasos son clickeables.

const PASOS = ["archivo", "basicos", "contacto", "adicionales", "opciones", "revision"] as const;
type Paso = (typeof PASOS)[number];

// ── Archivo ──────────────────────────────────────────────────────────────
type Formato = "csv" | "txt" | "xlsx" | "xls" | "invalido";
type Codificacion = "utf8" | "latin1" | "win1252";
type ConfigArchivo = {
  formato: Formato;
  header: boolean;
  sepCampos: string;
  sepTexto: string;
  codificacion: Codificacion;
  hoja: string;
};
type Archivo = {
  nombre: string;
  columnas: string[];
  filas: string[][];
  problema: "separador" | "hojaVacia" | null;
  mojibake: boolean;
};

const FORMATOS_PRUEBA: Formato[] = ["csv", "txt", "xlsx", "xls", "invalido"];
const ES_TEXTO = (f: Formato) => f === "csv" || f === "txt";
const ES_EXCEL = (f: Formato) => f === "xlsx" || f === "xls";
const CODIFICACION_DETECTADA: Codificacion = "utf8";
const HOJAS = ["Clientes", "Resumen", "Instrucciones"];
const SEPARADORES_RAPIDOS = [";", ",", "|", "\\t"];

const CONFIG_INICIAL: ConfigArchivo = {
  formato: "csv",
  header: true,
  sepCampos: ";",
  sepTexto: "",
  codificacion: CODIFICACION_DETECTADA,
  hoja: HOJAS[0],
};

// Simula leer un UTF-8 con otra codificación: así se ven los acentos rotos.
const MOJIBAKE: Record<string, string> = {
  "á": "Ã¡", "é": "Ã©", "í": "Ã­", "ó": "Ã³", "ú": "Ãº", "ñ": "Ã±", "Ñ": "Ã‘", "É": "Ã‰", "Ó": "Ã“",
};
const romper = (v: string) => v.replace(/[áéíóúñÑÉÓ]/g, (c) => MOJIBAKE[c] ?? c);

function construirArchivo(c: ConfigArchivo): Archivo {
  const ext = c.formato === "invalido" ? "pdf" : c.formato;
  const nombre = `clientes_banco_sur_2026-10-14.${ext}`;
  if (c.formato === "invalido") return { nombre, columnas: [], filas: [], problema: null, mojibake: false };
  if (ES_EXCEL(c.formato) && c.hoja !== HOJAS[0]) {
    return { nombre, columnas: [], filas: [], problema: "hojaVacia", mojibake: false };
  }
  const base = csvEjemplo.columnas;
  let columnas: string[];
  let filas: string[][];
  let problema: Archivo["problema"] = null;
  if (ES_TEXTO(c.formato) && c.sepCampos !== ";") {
    // El archivo viene separado por ";": con otro separador queda una sola columna.
    const linea = (r: string[]) => [r.join(";")];
    columnas = c.header ? [base.join(";")] : ["Columna 1"];
    filas = c.header ? csvEjemplo.filas.map(linea) : [base, ...csvEjemplo.filas].map(linea);
    problema = "separador";
  } else {
    columnas = c.header ? base : base.map((_, i) => `Columna ${i + 1}`);
    filas = c.header ? csvEjemplo.filas : [base, ...csvEjemplo.filas];
  }
  const mojibake = ES_TEXTO(c.formato) && c.codificacion !== CODIFICACION_DETECTADA;
  if (mojibake) filas = filas.map((r) => r.map(romper));
  return { nombre, columnas, filas, problema, mojibake };
}

const ArchivoCtx = createContext<Archivo>(construirArchivo(CONFIG_INICIAL));
const useArchivo = () => useContext(ArchivoCtx);

function muestras(a: Archivo, columna: string) {
  const i = a.columnas.indexOf(columna);
  if (i < 0) return [];
  return a.filas.map((f) => f[i]).filter(Boolean);
}

// ── Mapeo ────────────────────────────────────────────────────────────────
const BASICOS = [
  { key: "nombre", obligatorio: true },
  { key: "apellido", obligatorio: false },
  { key: "tipoDoc", obligatorio: false },
  { key: "nroDoc", obligatorio: true },
  { key: "idExterno", obligatorio: false },
] as const;
type BasicoKey = (typeof BASICOS)[number]["key"];
const basicosVacios = (): Record<BasicoKey, string> => ({ nombre: "", apellido: "", tipoDoc: "", nroDoc: "", idExterno: "" });

// Tipos de documento usados en LATAM, por país (para "Valor fijo").
const TIPOS_DOC_LATAM: { pais: string; tipos: string[] }[] = [
  { pais: "Argentina", tipos: ["DNI", "CUIT", "CUIL", "CDI", "LE", "LC"] },
  { pais: "Bolivia", tipos: ["CI", "NIT"] },
  { pais: "Brasil", tipos: ["CPF", "CNPJ", "RG"] },
  { pais: "Chile", tipos: ["RUN", "RUT"] },
  { pais: "Colombia", tipos: ["CC", "CE", "NIT", "TI", "PPT"] },
  { pais: "Costa Rica", tipos: ["Cédula de identidad", "DIMEX", "Cédula jurídica"] },
  { pais: "Cuba", tipos: ["CI"] },
  { pais: "Ecuador", tipos: ["Cédula", "RUC"] },
  { pais: "El Salvador", tipos: ["DUI", "NIT"] },
  { pais: "Guatemala", tipos: ["DPI", "NIT"] },
  { pais: "Honduras", tipos: ["DNI", "RTN"] },
  { pais: "México", tipos: ["CURP", "RFC", "INE"] },
  { pais: "Nicaragua", tipos: ["Cédula", "RUC"] },
  { pais: "Panamá", tipos: ["Cédula", "RUC"] },
  { pais: "Paraguay", tipos: ["CI", "RUC"] },
  { pais: "Perú", tipos: ["DNI", "RUC", "CE"] },
  { pais: "República Dominicana", tipos: ["Cédula", "RNC"] },
  { pais: "Uruguay", tipos: ["CI", "RUT"] },
  { pais: "Venezuela", tipos: ["CI", "RIF"] },
  { pais: "Otros", tipos: ["Pasaporte"] },
];
const TIPO_DOC_DEFAULT = "Argentina|DNI";
const tipoDocTexto = (v: string) => {
  const [pais, tipo] = v.split("|");
  return pais === "Otros" ? tipo : `${tipo} (${pais})`;
};

// Monedas: el estándar ISO 4217 que ya trae el navegador (Intl), con el
// nombre en español. No hace falta un servicio externo para listarlas.
const MONEDAS_FRECUENTES = ["ARS", "USD", "EUR", "BRL", "CLP", "UYU", "PYG", "BOB", "PEN", "COP", "MXN"];
function opcionesMoneda(grupoFrecuentes: string, grupoTodas: string): ComboOption[] {
  const todas = typeof Intl.supportedValuesOf === "function" ? Intl.supportedValuesOf("currency") : MONEDAS_FRECUENTES;
  const nombres = new Intl.DisplayNames(["es-AR"], { type: "currency" });
  const opcion = (codigo: string, group: string): ComboOption => {
    const nombre = nombres.of(codigo) ?? codigo;
    return { value: codigo, label: `${codigo} — ${nombre}`, searchText: `${codigo} ${nombre}`, group };
  };
  return [
    ...MONEDAS_FRECUENTES.map((c) => opcion(c, grupoFrecuentes)),
    ...todas.filter((c) => !MONEDAS_FRECUENTES.includes(c)).map((c) => opcion(c, grupoTodas)),
  ];
}

type TipoForma = "telefono" | "whatsapp" | "email";
type MapeoContacto = {
  id: string;
  columna: string;
  tipo: TipoForma;
  descripcion: string;
  principal: boolean;
};
const contactoVacio = (principal: boolean): MapeoContacto => ({
  id: `m-${Math.random().toString(36).slice(2, 8)}`,
  columna: "",
  tipo: "telefono",
  descripcion: "",
  principal,
});

// Validaciones de un campo de información adicional. Todo desactivado por defecto.
type Validaciones = {
  obligatorio: boolean;
  min?: string;
  max?: string;
  moneda?: string;
  formatoFecha?: string;
  valorSi?: string;
  /** Lista de opciones: carácter que separa varias opciones dentro de una celda. */
  sepOpciones?: string;
  /** Si se valida el campo (obligatorio, mínimo/máximo, largo). Apagado por defecto. */
  validar?: boolean;
};

type SiExiste = "reemplazar" | "siVacio" | "noTocar";
type ConfigAdicional = Validaciones & {
  incluir: boolean;
  destino: string; // "nuevo" o id de un campo existente
  nombre: string;
  tipo: TipoCampo;
  siExiste: SiExiste;
};

type CampoVacio = Validaciones & {
  id: string;
  destino: string;
  nombre: string;
  tipo: TipoCampo;
};

type Operador =
  | "igual"
  | "distinto"
  | "contiene"
  | "vacio"
  | "noVacio"
  | "mayor"
  | "mayorIgual"
  | "menor"
  | "menorIgual"
  | "entre"
  | "antes"
  | "despues"
  | "esSi"
  | "esNo";

type ReglaEtiqueta = {
  id: string;
  columna: string;
  operador: Operador;
  valor: string;
  valor2: string;
  etiquetas: string[];
};

const OPERADORES: Record<"texto" | "numero" | "fecha" | "booleano", Operador[]> = {
  texto: ["igual", "distinto", "contiene", "vacio", "noVacio"],
  numero: ["igual", "mayor", "mayorIgual", "menor", "menorIgual", "entre", "vacio"],
  fecha: ["antes", "despues", "entre", "vacio"],
  booleano: ["esSi", "esNo"],
};
const SIN_VALOR: Operador[] = ["vacio", "noVacio", "esSi", "esNo"];

const TIPOS: TipoCampo[] = ["texto", "numero", "moneda", "fecha", "lista", "booleano"];
const NADA = "__ninguna__";

function adivinarTipo(a: Archivo, columna: string): TipoCampo {
  const vs = muestras(a, columna);
  if (vs.length === 0) return "texto";
  if (vs.every((v) => /^\d{2}\/\d{2}\/\d{4}$/.test(v))) return "fecha";
  if (vs.every((v) => /^(si|no|s|n|true|false)$/i.test(v))) return "booleano";
  if (vs.every((v) => /^-?\d+([.,]\d+)?$/.test(v))) return "numero";
  if (vs.some((v) => v.includes("|"))) return "lista";
  if (new Set(vs).size < vs.length) return "lista";
  return "texto";
}

function familia(tipo: TipoCampo): keyof typeof OPERADORES {
  if (tipo === "numero" || tipo === "moneda") return "numero";
  if (tipo === "fecha") return "fecha";
  if (tipo === "booleano") return "booleano";
  return "texto";
}

// Sin asociación automática en el mock: toda columna sobrante entra como
// información adicional nueva, con el nombre exacto de su encabezado y las
// validaciones apagadas.
function configInicial(a: Archivo, columna: string): ConfigAdicional {
  const tipo = adivinarTipo(a, columna);
  return {
    incluir: true,
    destino: "nuevo",
    nombre: columna,
    tipo,
    obligatorio: false,
    formatoFecha: "DD/MM/AAAA",
    moneda: "ARS",
    valorSi: tipo === "booleano" ? muestras(a, columna).find((v) => /^(si|s|true)$/i.test(v)) : undefined,
    sepOpciones: tipo === "lista" && muestras(a, columna).some((v) => v.includes("|")) ? "|" : "",
    siExiste: "reemplazar",
  };
}

function parseFecha(v: string) {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(v);
  return m ? new Date(`${m[3]}-${m[2]}-${m[1]}`).getTime() : NaN;
}

function cumple(regla: ReglaEtiqueta, tipo: TipoCampo, valor: string, valorSi?: string) {
  const fam = familia(tipo);
  const v = valor?.trim() ?? "";
  const esSi = valorSi ? v.toLowerCase() === valorSi.toLowerCase() : /^(si|s|true)$/i.test(v);
  switch (regla.operador) {
    case "vacio":
      return v === "";
    case "noVacio":
      return v !== "";
    case "esSi":
      return esSi;
    case "esNo":
      return !esSi;
    case "contiene":
      return v.toLowerCase().includes(regla.valor.toLowerCase());
    case "igual":
      return fam === "numero" ? Number(v) === Number(regla.valor) : v.toLowerCase() === regla.valor.toLowerCase();
    case "distinto":
      return v.toLowerCase() !== regla.valor.toLowerCase();
  }
  if (v === "") return false;
  const n = fam === "fecha" ? parseFecha(v) : Number(v);
  const a = fam === "fecha" ? new Date(regla.valor).getTime() : Number(regla.valor);
  const b = fam === "fecha" ? new Date(regla.valor2).getTime() : Number(regla.valor2);
  switch (regla.operador) {
    case "mayor":
    case "despues":
      return n > a;
    case "mayorIgual":
      return n >= a;
    case "menor":
    case "antes":
      return n < a;
    case "menorIgual":
      return n <= a;
    case "entre":
      return n >= a && n <= b;
  }
  return false;
}

const normalizar = (s: string) => s.trim().toLocaleLowerCase("es-AR");

export function ImportarClientes() {
  const t = useT();
  const [paso, setPaso] = useState<Paso>("archivo");
  const [cargado, setCargado] = useState(false);
  const [config, setConfig] = useState<ConfigArchivo>(CONFIG_INICIAL);
  const archivo = construirArchivo(config);
  const [basicos, setBasicos] = useState<Record<BasicoKey, string>>(basicosVacios);
  const [tipoDocFijo, setTipoDocFijo] = useState<string | null>(null);
  const [contactos, setContactos] = useState<MapeoContacto[]>(() => [contactoVacio(true)]);
  const [adicionales, setAdicionales] = useState<Record<string, ConfigAdicional>>({});
  const [vacios, setVacios] = useState<CampoVacio[]>([]);
  const [clave, setClave] = useState("");
  const [catalogo, setCatalogo] = useState<Etiqueta[]>(etiquetasCatalogo);
  const [etiquetas, setEtiquetas] = useState<string[]>([]);
  const [reglas, setReglas] = useState<ReglaEtiqueta[]>([]);
  const [errores, setErrores] = useState("saltear");
  const [importado, setImportado] = useState(false);

  const idx = PASOS.indexOf(paso);

  const reiniciarMapeo = () => {
    setBasicos(basicosVacios());
    setTipoDocFijo(null);
    setContactos([contactoVacio(true)]);
    setAdicionales({});
    setVacios([]);
    setClave("");
    setReglas([]);
  };

  // Cambiar encabezado, separador, hoja o formato cambia las columnas: el
  // mapeo vuelve a cero.
  const cambiarConfig = (cambios: Partial<ConfigArchivo>) => {
    setConfig({ ...config, ...cambios });
    if (["formato", "header", "sepCampos", "hoja"].some((k) => k in cambios)) reiniciarMapeo();
  };

  // Dónde se usa cada columna, para marcarla en los desplegables.
  const usos = new Map<string, string>();
  for (const b of BASICOS) {
    if (basicos[b.key]) usos.set(basicos[b.key], t(`clientes.imp.basico.${b.key}`));
  }
  for (const c of contactos) {
    if (c.columna) usos.set(c.columna, t("clientes.imp.usoContacto", { etiqueta: c.descripcion || t(`clientes.imp.forma.${c.tipo}`) }));
  }
  const restantes = archivo.columnas.filter((c) => !usos.has(c));
  const cfg = (col: string) => adicionales[col] ?? configInicial(archivo, col);
  const setCfg = (col: string, cambios: Partial<ConfigAdicional>) =>
    setAdicionales((a) => ({ ...a, [col]: { ...cfg(col), ...cambios } }));

  // Nombres de campos nuevos repetidos (entre sí o con uno existente).
  const nombresExistentes = new Set(camposAdicionalesSistema.map((c) => normalizar(c.nombre)));
  const nuevosNombres = [
    ...restantes.filter((c) => cfg(c).incluir && cfg(c).destino === "nuevo").map((c) => ({ key: c, nombre: cfg(c).nombre })),
    ...vacios.filter((v) => v.destino === "nuevo").map((v) => ({ key: v.id, nombre: v.nombre })),
  ];
  const repetidos = new Set(
    nuevosNombres
      .filter(
        (n) =>
          n.nombre.trim() &&
          (nombresExistentes.has(normalizar(n.nombre)) ||
            nuevosNombres.some((o) => o.key !== n.key && normalizar(o.nombre) === normalizar(n.nombre)))
      )
      .map((n) => n.key)
  );

  // Tipo y nombre "en el sistema" de cualquier columna (para las reglas).
  const infoColumna = (col: string): { nombre: string; tipo: TipoCampo; importa: boolean; valorSi?: string } => {
    const b = BASICOS.find((x) => basicos[x.key] === col);
    if (b) return { nombre: t(`clientes.imp.basico.${b.key}`), tipo: "texto", importa: true };
    const c = contactos.find((x) => x.columna === col);
    if (c) return { nombre: c.descripcion || t(`clientes.imp.forma.${c.tipo}`), tipo: "texto", importa: true };
    const a = cfg(col);
    return { nombre: a.nombre, tipo: a.tipo, importa: a.incluir, valorSi: a.valorSi };
  };

  const archivoOk =
    cargado &&
    config.formato !== "invalido" &&
    !archivo.problema &&
    (!ES_TEXTO(config.formato) || config.sepCampos.trim() !== "");
  const faltanBasicos = BASICOS.filter((b) => b.obligatorio && !basicos[b.key]);
  const pasoOk = (p: Paso) =>
    (p === "archivo" && archivoOk) ||
    (p === "basicos" && faltanBasicos.length === 0) ||
    (p === "contacto" && contactos.some((c) => c.columna)) ||
    (p === "adicionales" &&
      repetidos.size === 0 &&
      restantes.every((c) => !cfg(c).incluir || cfg(c).nombre.trim()) &&
      vacios.every((v) => v.nombre.trim())) ||
    (p === "opciones" && clave !== "");
  const puedeAvanzar = pasoOk(paso);
  const primeroIncompleto = PASOS.findIndex((p) => p !== "revision" && !pasoOk(p));
  const maxAlcanzable = primeroIncompleto === -1 ? PASOS.length - 1 : primeroIncompleto;

  const reset = () => {
    setPaso("archivo");
    setCargado(false);
    setConfig(CONFIG_INICIAL);
    reiniciarMapeo();
    setEtiquetas([]);
    setErrores("saltear");
    setImportado(false);
  };

  const basicosAsociados = Object.values(basicos).filter(Boolean).length + (tipoDocFijo ? 1 : 0);
  const mensajeBloqueo =
    (paso === "basicos" && faltanBasicos.length > 0 && t("clientes.imp.faltanObligatorios")) ||
    (paso === "adicionales" && repetidos.size > 0 && t("clientes.imp.nombresRepetidos")) ||
    (paso === "opciones" && !clave && t("clientes.imp.faltaClave")) ||
    "";

  return (
    <ArchivoCtx.Provider value={archivo}>
      {/* En pantallas anchas la página no scrollea: ocupa el alto disponible
          y cada panel (wizard y tabla de campos) tiene su propio scroll. */}
      <div className="flex flex-col gap-4 xl:min-h-0 xl:flex-1">
        {/* Encabezado + pasos fijos arriba (siempre visibles). */}
        <div className="sticky top-0 z-20 -mx-4 bg-background px-4 sm:-mx-6 sm:px-6">
          <PageHeader
            title={t("clientes.imp.titulo")}
            description={t("clientes.imp.descripcion")}
            backHref="/clientes"
            actions={
              !importado && (
                <Button variant="outline" asChild>
                  <Link href="/clientes">{t("clientes.imp.cancelar")}</Link>
                </Button>
              )
            }
          />
          <div className="border-b py-3">
            <Stepper
              actual={importado ? PASOS.length : idx}
              maxAlcanzable={importado ? -1 : maxAlcanzable}
              onIr={(i) => setPaso(PASOS[i])}
            />
          </div>
        </div>

        <div className="grid gap-6 xl:min-h-0 xl:flex-1 xl:grid-cols-[minmax(0,1fr)_minmax(0,24rem)]">
          <Card className="min-w-0 xl:min-h-0 xl:overflow-y-auto">
            <CardContent className="flex flex-col gap-6">
              {importado ? (
                <Resultado onOtra={reset} />
              ) : (
                <>
                  {paso === "archivo" && (
                    <PasoArchivo
                      cargado={cargado}
                      config={config}
                      onCargar={(formato) => {
                        cambiarConfig({ formato, hoja: HOJAS[0] });
                        setCargado(true);
                      }}
                      onCambiar={() => setCargado(false)}
                      onConfig={cambiarConfig}
                    />
                  )}
                  {paso === "basicos" && (
                    <PasoBasicos
                      basicos={basicos}
                      setBasicos={setBasicos}
                      tipoDocFijo={tipoDocFijo}
                      setTipoDocFijo={setTipoDocFijo}
                      usos={usos}
                    />
                  )}
                  {paso === "contacto" && <PasoContacto contactos={contactos} setContactos={setContactos} usos={usos} />}
                  {paso === "adicionales" && (
                    <PasoAdicionales
                      restantes={restantes}
                      cfg={cfg}
                      setCfg={setCfg}
                      vacios={vacios}
                      setVacios={setVacios}
                      repetidos={repetidos}
                    />
                  )}
                  {paso === "opciones" && (
                    <PasoOpciones
                      basicos={basicos}
                      contactos={contactos}
                      clave={clave}
                      setClave={setClave}
                      catalogo={catalogo}
                      setCatalogo={setCatalogo}
                      etiquetas={etiquetas}
                      setEtiquetas={setEtiquetas}
                      reglas={reglas}
                      setReglas={setReglas}
                      infoColumna={infoColumna}
                      errores={errores}
                      setErrores={setErrores}
                    />
                  )}
                  {paso === "revision" && (
                    <PasoRevision
                      config={config}
                      restantes={restantes}
                      cfg={cfg}
                      vacios={vacios}
                      basicosAsociados={basicosAsociados}
                      basicos={basicos}
                      contactos={contactos}
                      clave={clave}
                      catalogo={catalogo}
                      reglas={reglas}
                      infoColumna={infoColumna}
                    />
                  )}
                </>
              )}
            </CardContent>
          </Card>

          <aside className="min-w-0 xl:flex xl:min-h-0 xl:flex-col">
            <ResumenCampos
              cargado={cargado && archivoOk}
              basicos={basicos}
              tipoDocFijo={tipoDocFijo}
              contactos={contactos}
              restantes={restantes}
              cfg={cfg}
              vacios={vacios}
            />
          </aside>
        </div>

        {/* Navegación fija abajo (siempre visible). */}
        {!importado && (
          <div className="sticky -bottom-4 z-20 -mx-4 -mb-4 flex items-center justify-between gap-3 border-t bg-background px-4 py-3 sm:-bottom-6 sm:-mx-6 sm:-mb-6 sm:px-6">
            <div>
              {idx > 0 && (
                <Button variant="outline" onClick={() => setPaso(PASOS[idx - 1])}>
                  {t("clientes.imp.anterior")}
                </Button>
              )}
            </div>
            <div className="flex items-center gap-3">
              {mensajeBloqueo && <span className="text-xs text-destructive">{mensajeBloqueo}</span>}
              {paso === "revision" ? (
                <Button onClick={() => setImportado(true)}>
                  <Upload />
                  {t("clientes.imp.importarN", { n: (1215).toLocaleString("es-AR") })}
                </Button>
              ) : (
                <Button disabled={!puedeAvanzar} onClick={() => setPaso(PASOS[idx + 1])}>
                  {t("clientes.imp.siguiente")}
                  <ArrowRight />
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </ArchivoCtx.Provider>
  );
}

// Indicador de pasos clickeable: se puede ir a cualquier paso hasta el
// primero que todavía no está completo.
function Stepper({
  actual,
  maxAlcanzable,
  onIr,
}: {
  actual: number;
  maxAlcanzable: number;
  onIr: (i: number) => void;
}) {
  const t = useT();
  return (
    <nav aria-label={t("clientes.imp.pasos")}>
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {PASOS.map((p, i) => {
          const habilitado = i <= maxAlcanzable && i !== actual;
          return (
            <li key={p} className="flex items-center gap-2">
              <button
                type="button"
                disabled={!habilitado}
                onClick={() => onIr(i)}
                aria-current={i === actual ? "step" : undefined}
                title={!habilitado && i > actual ? t("clientes.imp.pasoBloqueado") : undefined}
                className={cn(
                  "flex items-center gap-2 rounded-full py-1 pr-2.5 pl-1 transition-colors",
                  habilitado && "hover:bg-muted",
                  !habilitado && i !== actual && "cursor-not-allowed opacity-60"
                )}
              >
                <span
                  className={cn(
                    "flex size-5 items-center justify-center rounded-full text-[11px] font-semibold",
                    i < actual && "bg-primary text-primary-foreground",
                    i === actual && "bg-primary text-primary-foreground ring-4 ring-primary/20",
                    i > actual && "bg-muted text-muted-foreground"
                  )}
                >
                  {i < actual ? <Check className="size-3" /> : i + 1}
                </span>
                <span className={cn("text-xs", i === actual ? "font-medium text-foreground" : "text-muted-foreground")}>
                  {t(`clientes.imp.paso.${p}`)}
                </span>
              </button>
              {i < PASOS.length - 1 && <span aria-hidden className="h-px w-4 bg-border" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// Desplegable de columnas del archivo: las ya usadas en otro lado quedan en
// gris con la aclaración de dónde se usan, pero se pueden elegir igual.
// Se marcan con "En uso" y el detalle en un tooltip (checklist #19, opción C).
function ColumnaSelect({
  value,
  onChange,
  usos,
  permitirVacio,
  id,
  ariaLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  usos: Map<string, string>;
  permitirVacio?: boolean;
  id?: string;
  ariaLabel?: string;
}) {
  const t = useT();
  const archivo = useArchivo();
  const opciones: ComboOption[] = [
    ...(permitirVacio ? [{ value: NADA, label: t("clientes.imp.noImportar") }] : []),
    ...archivo.columnas.map((c) => {
      const uso = c !== value ? usos.get(c) : undefined;
      return {
        value: c,
        label: <span className="font-mono text-xs">{c}</span>,
        searchText: c,
        muted: !!uso,
        uso: uso ? t("clientes.imp.usadaEn", { donde: uso }) : undefined,
      };
    }),
  ];
  return (
    <ComboSelect
      id={id}
      ariaLabel={ariaLabel}
      placeholder={t("clientes.imp.elegirColumna")}
      value={value || (permitirVacio ? NADA : "")}
      onChange={(v) => onChange(v === NADA ? "" : v)}
      options={opciones}
    />
  );
}

function Muestra({ columna }: { columna: string }) {
  const archivo = useArchivo();
  const vs = columna ? muestras(archivo, columna).slice(0, 2) : [];
  if (vs.length === 0) return <span className="text-xs text-muted-foreground">—</span>;
  return <span className="truncate text-xs text-muted-foreground">{vs.join(" · ")}</span>;
}

// ── Paso 1: Archivo ───────────────────────────────────────────────────────
function PasoArchivo({
  cargado,
  config,
  onCargar,
  onCambiar,
  onConfig,
}: {
  cargado: boolean;
  config: ConfigArchivo;
  onCargar: (f: Formato) => void;
  onCambiar: () => void;
  onConfig: (c: Partial<ConfigArchivo>) => void;
}) {
  const t = useT();
  const archivo = useArchivo();
  const [simular, setSimular] = useState<Formato>("csv");

  if (!cargado) {
    return (
      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={() => onCargar(simular)}
          className="flex h-44 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed text-sm text-muted-foreground hover:border-primary hover:bg-accent/40"
        >
          <Upload className="size-6" />
          <span className="font-medium text-foreground">{t("clientes.imp.soltar")}</span>
          <span className="text-xs">{t("clientes.imp.formatos")}</span>
        </button>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span>{t("clientes.imp.simular")}</span>
          {FORMATOS_PRUEBA.map((f) => (
            <button
              key={f}
              type="button"
              aria-pressed={simular === f}
              onClick={() => setSimular(f)}
              className={cn(
                "rounded-full border px-2.5 py-0.5 font-medium",
                simular === f ? "border-primary bg-primary text-primary-foreground" : "hover:bg-muted"
              )}
            >
              {t(`clientes.imp.fmt.${f}`)}
            </button>
          ))}
        </div>
      </div>
    );
  }

  const invalido = config.formato === "invalido";
  const Icono = invalido ? FileX : ES_EXCEL(config.formato) ? FileSpreadsheet : FileText;

  return (
    <div className="flex flex-col gap-5">
      <div className={cn("flex items-center gap-3 rounded-lg border p-3", invalido && "border-destructive/50 bg-destructive/5")}>
        <Icono className={cn("size-5", invalido ? "text-destructive" : "text-success")} />
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate font-medium">{archivo.nombre}</span>
          {invalido ? (
            <span className="text-xs text-destructive">{t("clientes.imp.formatoInvalido")}</span>
          ) : (
            <span className="text-xs text-muted-foreground">
              {t("clientes.imp.resumenArchivo", {
                filas: csvEjemplo.totalFilas.toLocaleString("es-AR"),
                columnas: archivo.columnas.length,
              })}
            </span>
          )}
        </div>
        {!invalido && (
          <Badge variant="success" className="gap-1">
            <Check />
            {t("clientes.imp.archivoValido")}
          </Badge>
        )}
        <Button variant="outline" size="sm" onClick={onCambiar}>
          <RefreshCw />
          {t("clientes.imp.cambiarArchivo")}
        </Button>
      </div>

      {!invalido && (
        <>
          <div className="grid gap-4 rounded-lg bg-muted/50 p-4 sm:grid-cols-2 lg:grid-cols-4">
            <label className="flex items-start gap-2 text-sm sm:col-span-2 lg:col-span-4">
              <Checkbox className="mt-0.5" checked={config.header} onCheckedChange={() => onConfig({ header: !config.header })} />
              <span className="flex flex-col">
                <span className="font-medium">{t("clientes.imp.header")}</span>
                <span className="text-xs text-muted-foreground">{t("clientes.imp.headerDesc")}</span>
              </span>
            </label>

            {ES_TEXTO(config.formato) && (
              <>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="imp-sep-campos">
                    {t("clientes.imp.sepCampos")} <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="imp-sep-campos"
                    className={cn("w-24 font-mono", !config.sepCampos.trim() && "border-destructive")}
                    value={config.sepCampos}
                    maxLength={3}
                    onChange={(e) => onConfig({ sepCampos: e.target.value })}
                  />
                  {!config.sepCampos.trim() ? (
                    <span className="text-xs text-destructive">{t("clientes.imp.requerido")}</span>
                  ) : (
                    <div className="flex gap-1">
                      {SEPARADORES_RAPIDOS.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => onConfig({ sepCampos: s })}
                          className="rounded border px-1.5 font-mono text-xs text-muted-foreground hover:bg-background"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="imp-sep-texto">{t("clientes.imp.sepTexto")}</Label>
                  <Input
                    id="imp-sep-texto"
                    className="w-24 font-mono"
                    placeholder={`Ej. " o '`}
                    value={config.sepTexto}
                    maxLength={1}
                    onChange={(e) => onConfig({ sepTexto: e.target.value })}
                  />
                  <span className="text-xs text-muted-foreground">{t("clientes.imp.opcional")}</span>
                </div>
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <Label htmlFor="imp-codif">{t("clientes.imp.codificacion")}</Label>
                  <ComboSelect
                    id="imp-codif"
                    value={config.codificacion}
                    onChange={(v) => onConfig({ codificacion: v as Codificacion })}
                    options={(["utf8", "latin1", "win1252"] as Codificacion[]).map((c) => ({
                      value: c,
                      label: t(`clientes.imp.cod.${c}`),
                    }))}
                  />
                  {config.codificacion !== CODIFICACION_DETECTADA && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <TriangleAlert className="size-3 text-warning" />
                      {t("clientes.imp.codDistinta", { cod: t(`clientes.imp.cod.${CODIFICACION_DETECTADA}`) })}
                    </span>
                  )}
                </div>
              </>
            )}

            {ES_EXCEL(config.formato) && (
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <Label htmlFor="imp-hoja">{t("clientes.imp.hoja")}</Label>
                <ComboSelect
                  id="imp-hoja"
                  value={config.hoja}
                  onChange={(v) => onConfig({ hoja: v })}
                  options={HOJAS.map((h, i) => ({
                    value: h,
                    label: h,
                    hint:
                      i === 0
                        ? t("clientes.imp.hojaFilas", { n: csvEjemplo.totalFilas.toLocaleString("es-AR") })
                        : t("clientes.imp.hojaVaciaHint"),
                  }))}
                />
              </div>
            )}
          </div>

          {archivo.problema === "separador" && (
            <Aviso>{t("clientes.imp.problemaSeparador", { sep: config.sepCampos })}</Aviso>
          )}
          {archivo.problema === "hojaVacia" && <Aviso>{t("clientes.imp.problemaHoja", { hoja: config.hoja })}</Aviso>}

          {archivo.columnas.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium">
                {t("clientes.imp.vistaPrevia", { n: Math.min(10, archivo.filas.length) })}
              </span>
              <div className="overflow-x-auto rounded-lg ring-1 ring-foreground/10">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {archivo.columnas.map((c) => (
                        <TableHead key={c} className="font-mono text-xs whitespace-nowrap">
                          {c}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {archivo.filas.slice(0, 10).map((f, i) => (
                      <TableRow key={i}>
                        {f.map((v, j) => (
                          <TableCell key={j} className="text-xs whitespace-nowrap">
                            {v || <span className="text-muted-foreground">—</span>}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {!config.header && <span className="text-xs text-muted-foreground">{t("clientes.imp.sinHeaderNota")}</span>}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Aviso({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-start gap-2 rounded-lg border border-warning/50 bg-warning/10 px-4 py-3 text-sm">
      <TriangleAlert className="mt-0.5 size-4 shrink-0 text-warning" />
      {children}
    </p>
  );
}

// ── Paso 2: Datos básicos ─────────────────────────────────────────────────
function PasoBasicos({
  basicos,
  setBasicos,
  tipoDocFijo,
  setTipoDocFijo,
  usos,
}: {
  basicos: Record<BasicoKey, string>;
  setBasicos: React.Dispatch<React.SetStateAction<Record<BasicoKey, string>>>;
  tipoDocFijo: string | null;
  setTipoDocFijo: (v: string | null) => void;
  usos: Map<string, string>;
}) {
  const t = useT();
  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-muted-foreground">{t("clientes.imp.basicosDesc")}</p>
      <div className="flex flex-col divide-y rounded-lg border">
        {BASICOS.map((b) => (
          <div key={b.key} className="grid items-center gap-3 p-3 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1.2fr)_minmax(0,1fr)]">
            <Label htmlFor={`b-${b.key}`} className="flex items-center gap-1.5">
              {t(`clientes.imp.basico.${b.key}`)}
              {b.obligatorio && <Badge variant="destructive">{t("clientes.imp.obligatorio")}</Badge>}
            </Label>
            <ArrowRight aria-hidden className="hidden size-4 rotate-180 text-muted-foreground sm:block" />
            <div className="flex min-w-0 flex-col gap-1.5">
              {b.key === "tipoDoc" && (
                <ModoToggle
                  fijo={tipoDocFijo !== null}
                  onChange={(fijo) => {
                    setTipoDocFijo(fijo ? TIPO_DOC_DEFAULT : null);
                    if (fijo) setBasicos((x) => ({ ...x, tipoDoc: "" }));
                  }}
                />
              )}
              {b.key === "tipoDoc" && tipoDocFijo !== null ? (
                <ComboSelect
                  id={`b-${b.key}`}
                  value={tipoDocFijo}
                  onChange={setTipoDocFijo}
                  options={TIPOS_DOC_LATAM.flatMap((g) =>
                    g.tipos.map((tipo) => ({ value: `${g.pais}|${tipo}`, label: tipo, searchText: `${tipo} ${g.pais}`, group: g.pais }))
                  )}
                />
              ) : (
                <ColumnaSelect
                  id={`b-${b.key}`}
                  value={basicos[b.key]}
                  usos={usos}
                  permitirVacio={!b.obligatorio}
                  onChange={(v) => setBasicos((x) => ({ ...x, [b.key]: v }))}
                />
              )}
            </div>
            {b.key === "tipoDoc" && tipoDocFijo !== null ? (
              <span className="text-xs text-muted-foreground">{t("clientes.imp.fijoTodos")}</span>
            ) : (
              <Muestra columna={basicos[b.key]} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// "Columna del archivo" o "Valor fijo" (mismo criterio que el checkbox
// "Seleccionar columna" de la US T4-3268).
function ModoToggle({ fijo, onChange }: { fijo: boolean; onChange: (fijo: boolean) => void }) {
  const t = useT();
  return (
    <div role="radiogroup" className="inline-flex w-fit rounded-md border p-0.5 text-xs">
      {[false, true].map((f) => (
        <button
          key={String(f)}
          type="button"
          role="radio"
          aria-checked={fijo === f}
          onClick={() => onChange(f)}
          className={cn(
            "rounded px-2 py-0.5 font-medium",
            fijo === f ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
          )}
        >
          {f ? t("clientes.imp.modoFijo") : t("clientes.imp.modoColumna")}
        </button>
      ))}
    </div>
  );
}

// ── Paso 3: Contacto ──────────────────────────────────────────────────────
function PasoContacto({
  contactos,
  setContactos,
  usos,
}: {
  contactos: MapeoContacto[];
  setContactos: React.Dispatch<React.SetStateAction<MapeoContacto[]>>;
  usos: Map<string, string>;
}) {
  const t = useT();
  const upd = (id: string, c: Partial<MapeoContacto>) =>
    setContactos((xs) => xs.map((x) => (x.id === id ? { ...x, ...c } : x)));
  const quitar = (id: string) =>
    setContactos((xs) => {
      const resto = xs.filter((x) => x.id !== id);
      // Si se quitó el principal, el primero que queda pasa a serlo.
      if (resto.length > 0 && !resto.some((x) => x.principal)) resto[0] = { ...resto[0], principal: true };
      return resto.length > 0 ? resto : [contactoVacio(true)];
    });

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">{t("clientes.imp.contactoDesc")}</p>
      <div className="flex flex-col gap-2">
        {contactos.map((c) => (
          <div
            key={c.id}
            className="grid items-end gap-3 rounded-lg border p-3 sm:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1fr)_auto_auto]"
          >
            <div className="flex min-w-0 flex-col gap-1.5">
              <Label>{t("clientes.imp.columna")}</Label>
              <ColumnaSelect
                ariaLabel={t("clientes.imp.columna")}
                value={c.columna}
                usos={usos}
                onChange={(v) => upd(c.id, { columna: v })}
              />
              <Muestra columna={c.columna} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>{t("clientes.imp.tipoContacto")}</Label>
              <ComboSelect
                ariaLabel={t("clientes.imp.tipoContacto")}
                value={c.tipo}
                onChange={(v) => upd(c.id, { tipo: v as TipoForma })}
                options={(["telefono", "whatsapp", "email"] as TipoForma[]).map((x) => ({
                  value: x,
                  label: t(`clientes.imp.forma.${x}`),
                }))}
              />
              <span className="h-4" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>{t("clientes.imp.descripcionContacto")}</Label>
              <Input
                value={c.descripcion}
                placeholder={t("clientes.imp.descripcionPlaceholder")}
                onChange={(e) => upd(c.id, { descripcion: e.target.value })}
              />
              <span className="h-4" />
            </div>
            <label className="flex h-8 items-center gap-2 self-center text-sm sm:mb-5">
              <Checkbox
                checked={c.principal}
                onCheckedChange={() =>
                  setContactos((xs) =>
                    xs.map((x) => ({
                      ...x,
                      principal: x.id === c.id ? !c.principal : x.tipo === c.tipo ? false : x.principal,
                    }))
                  )
                }
              />
              {t("clientes.ficha.principal")}
            </label>
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive sm:mb-5"
              aria-label={t("common.acciones.eliminar")}
              onClick={() => quitar(c.id)}
            >
              <Trash2 />
            </Button>
          </div>
        ))}
      </div>
      <Button
        variant="outline"
        size="sm"
        className="self-start"
        onClick={() => setContactos((xs) => [...xs, contactoVacio(!xs.some((x) => x.principal))])}
      >
        <Plus />
        {t("clientes.imp.agregarContacto")}
      </Button>
      <p className="text-xs text-muted-foreground">{t("clientes.imp.contactoNota")}</p>
    </div>
  );
}

// ── Paso 4: Información adicional ─────────────────────────────────────────
function PasoAdicionales({
  restantes,
  cfg,
  setCfg,
  vacios,
  setVacios,
  repetidos,
}: {
  restantes: string[];
  cfg: (c: string) => ConfigAdicional;
  setCfg: (c: string, x: Partial<ConfigAdicional>) => void;
  vacios: CampoVacio[];
  setVacios: React.Dispatch<React.SetStateAction<CampoVacio[]>>;
  repetidos: Set<string>;
}) {
  const t = useT();
  // Qué campo existente ya tomó cada columna o campo vacío (para marcarlo).
  const destinoUsado = new Map<string, { por: string; texto: string }>();
  for (const col of restantes) {
    const c = cfg(col);
    if (c.incluir && c.destino !== "nuevo")
      destinoUsado.set(c.destino, { por: col, texto: t("clientes.imp.usadoPor", { columna: col }) });
  }
  for (const v of vacios) {
    if (v.destino !== "nuevo") destinoUsado.set(v.destino, { por: v.id, texto: t("clientes.imp.usadoPorVacio") });
  }
  const updVacio = (id: string, c: Partial<CampoVacio>) =>
    setVacios((xs) => xs.map((x) => (x.id === id ? { ...x, ...c } : x)));

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-muted-foreground">{t("clientes.imp.adicionalesDesc")}</p>

      <div className="flex flex-col gap-3">
        {restantes.length === 0 && <span className="text-sm text-muted-foreground">{t("clientes.imp.sinRestantes")}</span>}
        {restantes.map((col) => (
          <FilaAdicional
            key={col}
            columna={col}
            c={cfg(col)}
            destinoUsado={destinoUsado}
            repetido={repetidos.has(col)}
            onChange={(x) => setCfg(col, x)}
          />
        ))}
      </div>

      <div className="flex flex-col gap-3 border-t pt-5">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium">{t("clientes.imp.vaciosTitulo")}</span>
          <p className="text-xs text-muted-foreground">{t("clientes.imp.vaciosDesc")}</p>
        </div>
        {vacios.map((v) => {
          const existente = camposAdicionalesSistema.find((x) => x.id === v.destino);
          return (
            <div key={v.id} className="flex flex-col gap-3 rounded-lg border border-dashed p-3">
              <div className="grid items-end gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto]">
                <div className="flex flex-col gap-1.5">
                  <Label>{t("clientes.imp.destino")}</Label>
                  <DestinoSelect
                    value={v.destino}
                    propio={v.id}
                    destinoUsado={destinoUsado}
                    onChange={(destino) => {
                      const e = camposAdicionalesSistema.find((x) => x.id === destino);
                      updVacio(v.id, e ? { destino, nombre: e.nombre, tipo: e.tipo, obligatorio: e.obligatorio } : { destino: "nuevo", nombre: "" });
                    }}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>{t("clientes.imp.nombreSistema")}</Label>
                  <Input
                    value={v.nombre}
                    disabled={!!existente}
                    aria-invalid={repetidos.has(v.id)}
                    placeholder={t("clientes.imp.vacioPlaceholder")}
                    onChange={(e) => updVacio(v.id, { nombre: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>{t("clientes.imp.tipo")}</Label>
                  <TipoSelect value={v.tipo} disabled={!!existente} onChange={(tipo) => updVacio(v.id, { tipo })} />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive"
                  aria-label={t("common.acciones.eliminar")}
                  onClick={() => setVacios((xs) => xs.filter((x) => x.id !== v.id))}
                >
                  <Trash2 />
                </Button>
              </div>
              {repetidos.has(v.id) && <span className="text-xs text-destructive">{t("clientes.imp.nombreRepetido")}</span>}
              {existente ? (
                <p className="text-xs text-muted-foreground">{t("clientes.imp.validacionesExistente")}</p>
              ) : (
                <ValidacionesEditor tipo={v.tipo} v={v} onChange={(x) => updVacio(v.id, x)} />
              )}
            </div>
          );
        })}
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setVacios((xs) => [
                ...xs,
                { id: `v-${Date.now()}`, destino: "nuevo", nombre: "", tipo: "texto", obligatorio: false, moneda: "ARS", formatoFecha: "DD/MM/AAAA" },
              ])
            }
          >
            <Plus />
            {t("clientes.imp.agregarVacio")}
          </Button>
          <ADefinir nota={t("clientes.imp.vacioNotaGestion")} />
        </div>
      </div>
    </div>
  );
}

function TipoSelect({
  value,
  onChange,
  disabled,
}: {
  value: TipoCampo;
  onChange: (t: TipoCampo) => void;
  disabled?: boolean;
}) {
  const t = useT();
  return (
    <ComboSelect
      ariaLabel={t("clientes.imp.tipo")}
      value={value}
      disabled={disabled}
      onChange={(v) => onChange(v as TipoCampo)}
      options={TIPOS.map((x) => ({ value: x, label: t(`clientes.imp.tipoCampo.${x}`) }))}
    />
  );
}

// "Se guarda en": campo nuevo o uno existente. Los existentes que ya tomó
// otra columna se marcan con "En uso" + tooltip (checklist #19, opción C).
function DestinoSelect({
  value,
  propio,
  destinoUsado,
  onChange,
}: {
  value: string;
  propio: string;
  destinoUsado: Map<string, { por: string; texto: string }>;
  onChange: (v: string) => void;
}) {
  const t = useT();
  const opciones: ComboOption[] = [
    { value: "nuevo", label: t("clientes.imp.crearNuevo") },
    ...camposAdicionalesSistema.map((e) => {
      const otra = destinoUsado.get(e.id);
      const usado = !!otra && otra.por !== propio;
      return {
        value: e.id,
        label: e.nombre,
        group: t("clientes.imp.camposExistentes"),
        muted: usado,
        uso: usado ? otra.texto : undefined,
      };
    }),
  ];
  return <ComboSelect ariaLabel={t("clientes.imp.destino")} value={value} options={opciones} onChange={onChange} />;
}

// Configuración del campo según el tipo (moneda, formato de fecha, opciones,
// valor "Sí") y, aparte, el check "Validar este campo" que habilita las
// validaciones (apagado por defecto — pedido de producto 2026-10-14).
function ValidacionesEditor({
  tipo,
  v,
  onChange,
  valoresDetectados = [],
}: {
  tipo: TipoCampo;
  v: Validaciones;
  onChange: (x: Partial<Validaciones>) => void;
  valoresDetectados?: string[];
}) {
  const t = useT();
  const opcionesLista = Array.from(
    new Set(
      valoresDetectados.flatMap((d) => (v.sepOpciones ? d.split(v.sepOpciones).map((x) => x.trim()).filter(Boolean) : [d]))
    )
  );
  const configuracion =
    tipo === "moneda" || tipo === "fecha" || tipo === "lista" || (tipo === "booleano" && valoresDetectados.length > 0);

  return (
    <div className="flex flex-col gap-3 rounded-md bg-muted/50 p-3">
      {configuracion && (
        <div className="flex flex-wrap items-end gap-x-5 gap-y-3">
          {tipo === "moneda" && (
            <div className="flex w-64 flex-col gap-1">
              <Label className="text-xs">{t("clientes.imp.moneda")}</Label>
              <ComboSelect
                size="sm"
                ariaLabel={t("clientes.imp.moneda")}
                value={v.moneda ?? "ARS"}
                onChange={(x) => onChange({ moneda: x })}
                options={opcionesMoneda(t("clientes.imp.monedasFrecuentes"), t("clientes.imp.monedasTodas"))}
              />
            </div>
          )}
          {tipo === "fecha" && (
            <div className="flex w-44 flex-col gap-1">
              <Label className="text-xs">{t("clientes.imp.formatoFecha")}</Label>
              <ComboSelect
                size="sm"
                ariaLabel={t("clientes.imp.formatoFecha")}
                value={v.formatoFecha ?? "DD/MM/AAAA"}
                onChange={(x) => onChange({ formatoFecha: x })}
                options={["DD/MM/AAAA", "DD/MM/AA", "AAAA/MM/DD", "AA/MM/DD", "MM/DD/AAAA", "MM/DD/AA"].map((f) => ({
                  value: f,
                  label: f,
                }))}
              />
            </div>
          )}
          {tipo === "lista" && (
            <>
              <div className="flex flex-col gap-1">
                <Label className="text-xs">{t("clientes.imp.sepOpciones")}</Label>
                <Input
                  className="h-8 w-24 font-mono"
                  maxLength={3}
                  placeholder="|"
                  aria-label={t("clientes.imp.sepOpciones")}
                  value={v.sepOpciones ?? ""}
                  onChange={(e) => onChange({ sepOpciones: e.target.value })}
                />
              </div>
              {opcionesLista.length > 0 && (
                <div className="flex flex-col gap-1">
                  <Label className="text-xs">{t("clientes.imp.opcionesDetectadas")}</Label>
                  <div className="flex flex-wrap gap-1">
                    {opcionesLista.map((d) => (
                      <Badge key={d} variant="outline">
                        {d}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              <span className="w-full text-xs text-muted-foreground">{t("clientes.imp.sepOpcionesDesc")}</span>
            </>
          )}
          {tipo === "booleano" && valoresDetectados.length > 0 && (
            <div className="flex flex-col gap-1">
              <Label className="text-xs">{t("clientes.imp.valorSi")}</Label>
              <div className="flex items-center gap-2">
                <div className="w-32">
                  <ComboSelect
                    size="sm"
                    ariaLabel={t("clientes.imp.valorSi")}
                    value={v.valorSi ?? ""}
                    placeholder={t("clientes.imp.elegirValor")}
                    onChange={(x) => onChange({ valorSi: x })}
                    options={valoresDetectados.map((d) => ({ value: d, label: d }))}
                  />
                </div>
                <span className="text-xs text-muted-foreground">{t("clientes.imp.restoNo")}</span>
              </div>
            </div>
          )}
        </div>
      )}

      <div className={cn("flex flex-wrap items-end gap-x-5 gap-y-3", configuracion && "border-t pt-3")}>
          <label className="flex h-8 w-full items-center gap-2 text-sm font-medium">
            <Checkbox checked={!!v.validar} onCheckedChange={() => onChange({ validar: !v.validar })} />
            {t("clientes.imp.validar")}
          </label>
          {v.validar && (
            <>
              <label className="flex h-8 items-center gap-2 text-sm">
                <Checkbox checked={v.obligatorio} onCheckedChange={() => onChange({ obligatorio: !v.obligatorio })} />
                {t("clientes.imp.obligatorio")}
              </label>
              {(tipo === "numero" || tipo === "moneda") && (
                <>
                  <div className="flex flex-col gap-1">
                    <Label className="text-xs">{t("clientes.imp.minimo")}</Label>
                    <Input className="h-8 w-28" type="number" value={v.min ?? ""} onChange={(e) => onChange({ min: e.target.value })} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label className="text-xs">{t("clientes.imp.maximo")}</Label>
                    <Input className="h-8 w-28" type="number" value={v.max ?? ""} onChange={(e) => onChange({ max: e.target.value })} />
                  </div>
                </>
              )}
              {tipo === "texto" && (
                <div className="flex flex-col gap-1">
                  <Label className="text-xs">{t("clientes.imp.largoMax")}</Label>
                  <Input className="h-8 w-28" type="number" value={v.max ?? ""} onChange={(e) => onChange({ max: e.target.value })} />
                </div>
              )}
              <ADefinir nota={t("clientes.imp.obligatorioNota")} />
            </>
          )}
        </div>
    </div>
  );
}

function FilaAdicional({
  columna,
  c,
  destinoUsado,
  repetido,
  onChange,
}: {
  columna: string;
  c: ConfigAdicional;
  destinoUsado: Map<string, { por: string; texto: string }>;
  repetido: boolean;
  onChange: (x: Partial<ConfigAdicional>) => void;
}) {
  const t = useT();
  const archivo = useArchivo();
  const existente = camposAdicionalesSistema.find((x) => x.id === c.destino);
  const distintos = Array.from(new Set(muestras(archivo, columna)));

  return (
    <div className={cn("flex flex-col gap-3 rounded-lg border p-3", !c.incluir && "opacity-60")}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <Switch
            checked={c.incluir}
            onCheckedChange={(v) => onChange({ incluir: v })}
            aria-label={t("clientes.imp.incluirColumna", { columna })}
          />
          <span className="font-mono text-xs font-semibold">{columna}</span>
          <Muestra columna={columna} />
        </div>
        {existente ? (
          <Badge variant="success">{t("clientes.imp.campoExistente")}</Badge>
        ) : (
          <Badge variant="info">{t("clientes.imp.campoNuevo")}</Badge>
        )}
      </div>

      {c.incluir && (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <Label>{t("clientes.imp.destino")}</Label>
              <DestinoSelect
                value={c.destino}
                propio={columna}
                destinoUsado={destinoUsado}
                onChange={(v) => {
                  const e = camposAdicionalesSistema.find((x) => x.id === v);
                  onChange(
                    e
                      ? { destino: v, nombre: e.nombre, tipo: e.tipo, obligatorio: e.obligatorio }
                      : { destino: "nuevo", nombre: columna, tipo: adivinarTipo(archivo, columna) }
                  );
                }}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`n-${columna}`}>{t("clientes.imp.nombreSistema")}</Label>
              <Input
                id={`n-${columna}`}
                value={c.nombre}
                disabled={!!existente}
                aria-invalid={repetido}
                onChange={(e) => onChange({ nombre: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>{t("clientes.imp.tipo")}</Label>
              <TipoSelect value={c.tipo} disabled={!!existente} onChange={(tipo) => onChange({ tipo })} />
            </div>
          </div>
          {repetido && <span className="text-xs text-destructive">{t("clientes.imp.nombreRepetido")}</span>}

          {existente ? (
            <p className="text-xs text-muted-foreground">{t("clientes.imp.validacionesExistente")}</p>
          ) : (
            <ValidacionesEditor tipo={c.tipo} v={c} onChange={onChange} valoresDetectados={distintos} />
          )}

          <div className="flex flex-wrap items-center gap-2">
            <Label className="text-xs text-muted-foreground">{t("clientes.imp.siExiste")}</Label>
            <div className="w-60">
              <ComboSelect
                size="sm"
                ariaLabel={t("clientes.imp.siExiste")}
                value={c.siExiste}
                onChange={(v) => onChange({ siExiste: v as SiExiste })}
                options={(["reemplazar", "siVacio", "noTocar"] as SiExiste[]).map((s) => ({
                  value: s,
                  label: t(`clientes.imp.siExiste.${s}`),
                }))}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── Paso 5: Opciones ──────────────────────────────────────────────────────
function PasoOpciones({
  basicos,
  contactos,
  clave,
  setClave,
  catalogo,
  setCatalogo,
  etiquetas,
  setEtiquetas,
  reglas,
  setReglas,
  infoColumna,
  errores,
  setErrores,
}: {
  basicos: Record<BasicoKey, string>;
  contactos: MapeoContacto[];
  clave: string;
  setClave: (v: string) => void;
  catalogo: Etiqueta[];
  setCatalogo: React.Dispatch<React.SetStateAction<Etiqueta[]>>;
  etiquetas: string[];
  setEtiquetas: React.Dispatch<React.SetStateAction<string[]>>;
  reglas: ReglaEtiqueta[];
  setReglas: React.Dispatch<React.SetStateAction<ReglaEtiqueta[]>>;
  infoColumna: (c: string) => { nombre: string; tipo: TipoCampo; importa: boolean; valorSi?: string };
  errores: string;
  setErrores: (v: string) => void;
}) {
  const t = useT();
  const archivo = useArchivo();
  const [nuevaEtiqueta, setNuevaEtiqueta] = useState(false);

  // Cómo reconocer a un cliente que ya existe: un solo campo, a elegir entre
  // los datos que lo identifican y cualquier otra columna del archivo.
  const telPrincipal = contactos.find((c) => c.principal && c.columna && c.tipo !== "email");
  const opcionesClave: ComboOption[] = [
    ...(basicos.nroDoc
      ? [{ value: "nroDoc", label: t("clientes.imp.basico.nroDoc"), hint: basicos.nroDoc, group: t("clientes.imp.claveGrupoDatos") }]
      : []),
    ...(basicos.idExterno
      ? [{ value: "idExterno", label: t("clientes.imp.basico.idExterno"), hint: basicos.idExterno, group: t("clientes.imp.claveGrupoDatos") }]
      : []),
    ...(telPrincipal
      ? [{ value: "telPrincipal", label: t("clientes.imp.telPrincipal"), hint: telPrincipal.columna, group: t("clientes.imp.claveGrupoDatos") }]
      : []),
    ...archivo.columnas
      .filter((c) => c !== basicos.nroDoc && c !== basicos.idExterno && c !== telPrincipal?.columna)
      .map((c) => ({
        value: `col:${c}`,
        label: <span className="font-mono text-xs">{c}</span>,
        searchText: c,
        group: t("clientes.imp.claveGrupoOtras"),
      })),
  ];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <Label htmlFor="imp-clave">{t("clientes.imp.clave")}</Label>
        <p className="text-xs text-muted-foreground">{t("clientes.imp.claveDesc")}</p>
        <div className="w-full sm:w-96">
          <ComboSelect
            id="imp-clave"
            value={clave}
            placeholder={t("clientes.imp.elegirClave")}
            onChange={setClave}
            options={opcionesClave}
          />
        </div>
      </div>

      <div className="grid gap-6 border-t pt-6 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium">{t("clientes.imp.etiquetas")}</span>
            <Button variant="ghost" size="sm" onClick={() => setNuevaEtiqueta(true)}>
              <Plus />
              {t("clientes.et.nueva")}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">{t("clientes.imp.etiquetasDesc")}</p>
          <EtiquetasPicker catalogo={catalogo} value={etiquetas} onChange={setEtiquetas} />
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium">{t("clientes.imp.errores")}</span>
            <ADefinir nota={t("clientes.imp.erroresNota")} />
          </div>
          <ComboSelect
            ariaLabel={t("clientes.imp.errores")}
            value={errores}
            onChange={setErrores}
            options={[
              { value: "saltear", label: t("clientes.imp.errores.saltear") },
              { value: "cancelar", label: t("clientes.imp.errores.cancelar") },
            ]}
          />
        </div>
      </div>

      <ReglasEtiquetas catalogo={catalogo} reglas={reglas} setReglas={setReglas} infoColumna={infoColumna} />

      <EtiquetaDialog
        key={nuevaEtiqueta ? "abierto" : "cerrado"}
        etiqueta={nuevaEtiqueta ? "nueva" : null}
        existentes={catalogo}
        onClose={() => setNuevaEtiqueta(false)}
        onSave={(e) => {
          setCatalogo((cs) => [...cs, e]);
          setEtiquetas((xs) => [...xs, e.id]);
          setNuevaEtiqueta(false);
        }}
      />
    </div>
  );
}

// Selector de etiquetas: con hasta 10 se muestran todas como chips; con más
// pasa a un desplegable con buscador (pedido de producto 2026-10-14).
function EtiquetasPicker({
  catalogo,
  value,
  onChange,
}: {
  catalogo: Etiqueta[];
  value: string[];
  onChange: (fn: (xs: string[]) => string[]) => void;
}) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const toggle = (id: string) => onChange((xs) => (xs.includes(id) ? xs.filter((x) => x !== id) : [...xs, id]));

  if (catalogo.length <= 10) {
    return (
      <div className="flex flex-wrap gap-2">
        {catalogo.map((e) => {
          const on = value.includes(e.id);
          return (
            <button
              key={e.id}
              type="button"
              aria-pressed={on}
              onClick={() => toggle(e.id)}
              className={cn("rounded-full p-0.5", on ? "ring-2 ring-primary" : "opacity-60 hover:opacity-100")}
            >
              <EtiquetaBadge etiqueta={e} />
            </button>
          );
        })}
      </div>
    );
  }

  const elegidas = catalogo.filter((e) => value.includes(e.id));
  return (
    <div className="flex flex-wrap items-center gap-2">
      {elegidas.map((e) => (
        <EtiquetaBadge key={e.id} etiqueta={e}>
          <button
            type="button"
            aria-label={t("clientes.ficha.quitarEtiqueta", { nombre: e.nombre })}
            className="-mr-1 rounded-full opacity-70 hover:opacity-100"
            onClick={() => toggle(e.id)}
          >
            ×
          </button>
        </EtiquetaBadge>
      ))}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm">
            <Tags />
            {t("clientes.imp.elegirEtiquetas")}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-0" align="start">
          <Command>
            <CommandInput placeholder={t("clientes.ficha.buscarEtiqueta")} />
            <CommandList>
              <CommandEmpty>{t("clientes.combo.sinResultados")}</CommandEmpty>
              <CommandGroup>
                {catalogo.map((e) => (
                  <CommandItem key={e.id} value={e.nombre} onSelect={() => toggle(e.id)}>
                    <Check className={cn("size-4", value.includes(e.id) ? "opacity-100" : "opacity-0")} />
                    <EtiquetaBadge etiqueta={e} />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

// Etiquetas automáticas: "si <campo> <condición> <valor> → poner estas
// etiquetas". Se listan todas las columnas, separando las que se importan de
// las que no (una columna se puede usar solo para etiquetar). Las reglas se
// recuerdan siempre; si el mapeo cambió, esta importación pisa la anterior.
function ReglasEtiquetas({
  catalogo,
  reglas,
  setReglas,
  infoColumna,
}: {
  catalogo: Etiqueta[];
  reglas: ReglaEtiqueta[];
  setReglas: React.Dispatch<React.SetStateAction<ReglaEtiqueta[]>>;
  infoColumna: (c: string) => { nombre: string; tipo: TipoCampo; importa: boolean; valorSi?: string };
}) {
  const t = useT();
  const archivo = useArchivo();
  const upd = (id: string, c: Partial<ReglaEtiqueta>) =>
    setReglas((rs) => rs.map((r) => (r.id === id ? { ...r, ...c } : r)));

  const opcionesCampo: ComboOption[] = archivo.columnas.map((col) => {
    const info = infoColumna(col);
    return {
      value: col,
      label: (
        <span className="flex items-center gap-2">
          {info.nombre}
          <span className="font-mono text-[11px] text-muted-foreground">{col}</span>
        </span>
      ),
      searchText: `${info.nombre} ${col}`,
      group: info.importa ? t("clientes.imp.auto.seImportan") : t("clientes.imp.auto.noSeImportan"),
      muted: !info.importa,
    };
  });

  return (
    <div className="flex flex-col gap-3 border-t pt-6">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <span className="flex items-center gap-1.5 text-sm font-medium">
            <Wand2 className="size-4 text-primary" />
            {t("clientes.imp.auto.titulo")}
          </span>
          <p className="text-xs text-muted-foreground">{t("clientes.imp.auto.desc")}</p>
        </div>
      </div>

      {reglas.map((r) => {
        const info = r.columna ? infoColumna(r.columna) : { nombre: "", tipo: "texto" as TipoCampo, importa: true };
        const fam = familia(info.tipo);
        const ops = OPERADORES[fam];
        const operador = ops.includes(r.operador) ? r.operador : ops[0];
        const valores = r.columna ? Array.from(new Set(muestras(archivo, r.columna))) : [];
        const i = archivo.columnas.indexOf(r.columna);
        const coinciden = r.columna
          ? archivo.filas.filter((f) => cumple({ ...r, operador }, info.tipo, f[i], "valorSi" in info ? info.valorSi : undefined)).length
          : 0;
        const tipoInput = fam === "numero" ? "number" : fam === "fecha" ? "date" : "text";

        return (
          <div key={r.id} className="flex flex-col gap-3 rounded-lg border p-3">
            <div className="flex flex-wrap items-end gap-2">
              <span className="pb-2 text-sm font-medium">{t("clientes.imp.auto.si")}</span>
              <div className="w-60">
                <ComboSelect
                  ariaLabel={t("clientes.imp.auto.campo")}
                  placeholder={t("clientes.imp.auto.elegirCampo")}
                  value={r.columna}
                  options={opcionesCampo}
                  onChange={(v) => {
                    const nuevaFam = familia(infoColumna(v).tipo);
                    upd(r.id, { columna: v, operador: OPERADORES[nuevaFam][0], valor: "", valor2: "" });
                  }}
                />
              </div>
              <div className="w-44">
                <ComboSelect
                  ariaLabel={t("clientes.imp.auto.operador")}
                  value={operador}
                  disabled={!r.columna}
                  onChange={(v) => upd(r.id, { operador: v as Operador })}
                  options={ops.map((o) => ({ value: o, label: t(`clientes.imp.op.${o}`) }))}
                />
              </div>
              {!SIN_VALOR.includes(operador) &&
                (info.tipo === "lista" && (operador === "igual" || operador === "distinto") ? (
                  <div className="w-48">
                    <ComboSelect
                      ariaLabel={t("clientes.imp.auto.valor")}
                      placeholder={t("clientes.imp.elegirValor")}
                      value={r.valor}
                      onChange={(v) => upd(r.id, { valor: v })}
                      options={valores.map((v) => ({ value: v, label: v }))}
                    />
                  </div>
                ) : (
                  <Input
                    aria-label={t("clientes.imp.auto.valor")}
                    className="w-40"
                    type={tipoInput}
                    placeholder={t("clientes.imp.auto.valor")}
                    value={r.valor}
                    onChange={(e) => upd(r.id, { valor: e.target.value })}
                  />
                ))}
              {operador === "entre" && (
                <>
                  <span className="pb-2 text-sm text-muted-foreground">{t("clientes.imp.auto.y")}</span>
                  <Input
                    aria-label={t("clientes.imp.auto.valor2")}
                    className="w-40"
                    type={tipoInput}
                    value={r.valor2}
                    onChange={(e) => upd(r.id, { valor2: e.target.value })}
                  />
                </>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="ml-auto text-destructive"
                aria-label={t("clientes.imp.auto.eliminar")}
                onClick={() => setReglas((rs) => rs.filter((x) => x.id !== r.id))}
              >
                <Trash2 />
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium">{t("clientes.imp.auto.entonces")}</span>
              <EtiquetasPicker
                catalogo={catalogo}
                value={r.etiquetas}
                onChange={(fn) => upd(r.id, { etiquetas: fn(r.etiquetas) })}
              />
            </div>
            {r.columna && (
              <span className="text-xs text-muted-foreground">
                {t("clientes.imp.auto.coincide", { n: coinciden, total: archivo.filas.length })}
                {!info.importa && ` ${t("clientes.imp.auto.soloEtiqueta")}`}
              </span>
            )}
          </div>
        );
      })}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            setReglas((rs) => [...rs, { id: `r-${Date.now()}`, columna: "", operador: "igual", valor: "", valor2: "", etiquetas: [] }])
          }
        >
          <Plus />
          {t("clientes.imp.auto.agregar")}
        </Button>
        <span className="text-xs text-muted-foreground">{t("clientes.imp.auto.seRecuerdan")}</span>
      </div>
    </div>
  );
}

// ── Paso 6: Revisión ──────────────────────────────────────────────────────
function PasoRevision({
  config,
  restantes,
  cfg,
  vacios,
  basicosAsociados,
  basicos,
  contactos,
  clave,
  catalogo,
  reglas,
  infoColumna,
}: {
  config: ConfigArchivo;
  restantes: string[];
  cfg: (c: string) => ConfigAdicional;
  vacios: CampoVacio[];
  basicosAsociados: number;
  basicos: Record<BasicoKey, string>;
  contactos: MapeoContacto[];
  clave: string;
  catalogo: Etiqueta[];
  reglas: ReglaEtiqueta[];
  infoColumna: (c: string) => { nombre: string; tipo: TipoCampo; importa: boolean };
}) {
  const t = useT();
  const archivo = useArchivo();
  const incluidos = restantes.filter((c) => cfg(c).incluir);
  const nuevos = incluidos.filter((c) => cfg(c).destino === "nuevo");
  const existentes = incluidos.filter((c) => cfg(c).destino !== "nuevo");
  const reglasValidas = reglas.filter((r) => r.columna && r.etiquetas.length > 0);
  const etiquetaDe = (id: string) => catalogo.find((e) => e.id === id);

  const claveTexto =
    clave === "nroDoc"
      ? t("clientes.imp.basico.nroDoc")
      : clave === "idExterno"
        ? t("clientes.imp.basico.idExterno")
        : clave === "telPrincipal"
          ? t("clientes.imp.telPrincipal")
          : clave.replace(/^col:/, "");

  const errores = [
    { fila: 14, columna: basicos.nroDoc || "DNI", problema: t("clientes.imp.err.faltaDoc") },
    { fila: 233, columna: "SALDO_DEUDA", problema: t("clientes.imp.err.noNumero", { valor: "N/D" }) },
    { fila: 870, columna: "EMAIL", problema: t("clientes.imp.err.mailInvalido") },
  ];

  const stats = [
    { label: t("clientes.imp.stat.filas"), valor: "1.240", tono: "" },
    { label: t("clientes.imp.stat.nuevos"), valor: "85", tono: "text-info" },
    { label: t("clientes.imp.stat.actualizados"), valor: "1.130", tono: "text-success" },
    { label: t("clientes.imp.stat.errores"), valor: "25", tono: "text-destructive" },
  ];

  const detalleArchivo = [
    t(`clientes.imp.fmt.${config.formato}`),
    config.header ? t("clientes.imp.conHeader") : t("clientes.imp.sinHeader"),
    ...(ES_TEXTO(config.formato)
      ? [
          t("clientes.imp.resumenSep", { sep: config.sepCampos }),
          ...(config.sepTexto ? [t("clientes.imp.resumenSepTexto", { sep: config.sepTexto })] : []),
          t(`clientes.imp.cod.${config.codificacion}`),
        ]
      : [t("clientes.imp.resumenHoja", { hoja: config.hoja })]),
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <FileText className="size-4" />
        <span className="font-medium text-foreground">{archivo.nombre}</span>
        {detalleArchivo.map((d) => (
          <Badge key={d} variant="outline">
            {d}
          </Badge>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="flex flex-col gap-1 rounded-lg border p-3">
            <span className={cn("text-2xl font-semibold tabular-nums", s.tono)}>{s.valor}</span>
            <span className="text-xs text-muted-foreground">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">{t("clientes.imp.resumenMapeo")}</span>
          <ul className="flex flex-col gap-1.5 text-sm">
            <li>{t("clientes.imp.resumenClave", { clave: claveTexto })}</li>
            <li>{t("clientes.imp.resumenBasicos", { n: basicosAsociados })}</li>
            <li>{t("clientes.imp.resumenContactos", { n: contactos.filter((c) => c.columna).length })}</li>
            <li>{t("clientes.imp.resumenExistentes", { n: existentes.length })}</li>
            <li>{t("clientes.imp.resumenIgnoradas", { n: restantes.length - incluidos.length })}</li>
          </ul>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">{t("clientes.imp.camposACrear")}</span>
          {nuevos.length + vacios.length === 0 ? (
            <span className="text-sm text-muted-foreground">—</span>
          ) : (
            <ul className="flex flex-col gap-1.5">
              {nuevos.map((c) => (
                <li key={c} className="flex flex-wrap items-center gap-2 text-sm">
                  <Badge variant="info">{cfg(c).nombre}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {t(`clientes.imp.tipoCampo.${cfg(c).tipo}`)}
                    {cfg(c).tipo === "moneda" ? ` (${cfg(c).moneda})` : ""}
                    {cfg(c).obligatorio ? ` · ${t("clientes.imp.obligatorio").toLowerCase()}` : ""} ·{" "}
                    {t("clientes.imp.desdeColumna", { columna: c })}
                  </span>
                </li>
              ))}
              {vacios
                .filter((v) => v.destino === "nuevo")
                .map((v) => (
                  <li key={v.id} className="flex flex-wrap items-center gap-2 text-sm">
                    <Badge variant="outline">{v.nombre}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {t(`clientes.imp.tipoCampo.${v.tipo}`)} · {t("clientes.imp.loCompletaAgente")}
                    </span>
                  </li>
                ))}
            </ul>
          )}
        </div>
      </div>

      {reglasValidas.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="flex items-center gap-1.5 text-sm font-medium">
            <Wand2 className="size-4 text-primary" />
            {t("clientes.imp.auto.titulo")}
          </span>
          <ul className="flex flex-col gap-1.5">
            {reglasValidas.map((r) => {
              const fam = familia(infoColumna(r.columna).tipo);
              const operador = OPERADORES[fam].includes(r.operador) ? r.operador : OPERADORES[fam][0];
              return (
                <li key={r.id} className="flex flex-wrap items-center gap-2 text-sm">
                  <span>
                    {t("clientes.imp.auto.si")} <b>{infoColumna(r.columna).nombre}</b>{" "}
                    {t(`clientes.imp.op.${operador}`).toLowerCase()} {!SIN_VALOR.includes(operador) && <b>{r.valor}</b>}
                    {operador === "entre" && (
                      <>
                        {" "}
                        {t("clientes.imp.auto.y")} <b>{r.valor2}</b>
                      </>
                    )}
                  </span>
                  <ArrowRight className="size-3.5 text-muted-foreground" />
                  {r.etiquetas.map((id) => {
                    const e = etiquetaDe(id);
                    return e ? <EtiquetaBadge key={id} etiqueta={e} /> : null;
                  })}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <span className="flex items-center gap-1.5 text-sm font-medium">
          <CircleAlert className="size-4 text-destructive" />
          {t("clientes.imp.ejemplosErrores")}
        </span>
        <div className="overflow-x-auto rounded-lg ring-1 ring-foreground/10">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("clientes.imp.err.fila")}</TableHead>
                <TableHead>{t("clientes.imp.columna")}</TableHead>
                <TableHead>{t("clientes.imp.err.problema")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {errores.map((e) => (
                <TableRow key={e.fila}>
                  <TableCell className="tabular-nums">{e.fila}</TableCell>
                  <TableCell className="font-mono text-xs">{e.columna}</TableCell>
                  <TableCell>{e.problema}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <Button variant="link" size="sm" className="self-start px-0">
          {t("clientes.imp.descargarErrores")}
        </Button>
      </div>

      <p className="flex items-start gap-2 rounded-lg bg-accent px-4 py-3 text-sm text-accent-foreground">
        <Sparkles className="mt-0.5 size-4 shrink-0" />
        {t("clientes.imp.proximaVez")}
      </p>
    </div>
  );
}

function Resultado({ onOtra }: { onOtra: () => void }) {
  const t = useT();
  return (
    <div className="flex flex-col items-center gap-3 py-10 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-success/15 text-success">
        <Check className="size-6" />
      </span>
      <span className="text-lg font-semibold">{t("clientes.imp.listo")}</span>
      <p className="max-w-md text-sm text-muted-foreground">{t("clientes.imp.listoDesc")}</p>
      <div className="mt-2 flex flex-wrap justify-center gap-2">
        <Button variant="outline" onClick={onOtra}>
          {t("clientes.imp.otraImportacion")}
        </Button>
        <Button asChild>
          <Link href="/clientes">{t("clientes.imp.volverClientes")}</Link>
        </Button>
      </div>
    </div>
  );
}

// Panel lateral: cómo queda cada campo del sistema respecto del archivo, en
// vivo mientras se avanza.
function ResumenCampos({
  cargado,
  basicos,
  tipoDocFijo,
  contactos,
  restantes,
  cfg,
  vacios,
}: {
  cargado: boolean;
  basicos: Record<BasicoKey, string>;
  tipoDocFijo: string | null;
  contactos: MapeoContacto[];
  restantes: string[];
  cfg: (c: string) => ConfigAdicional;
  vacios: CampoVacio[];
}) {
  const t = useT();
  const archivo = useArchivo();

  type Fila = { campo: string; origen: React.ReactNode; ejemplo?: string; falta?: boolean; asociado: boolean };
  const ej = (col: string) => (col ? muestras(archivo, col)[0] : undefined);
  const colTag = (col: string) => <span className="font-mono text-[11px]">{col}</span>;

  const grupos: { titulo: string; filas: Fila[] }[] = [
    {
      titulo: t("clientes.imp.paso.basicos"),
      filas: BASICOS.map((b) => {
        if (b.key === "tipoDoc" && tipoDocFijo) {
          return {
            campo: t(`clientes.imp.basico.${b.key}`),
            origen: t("clientes.imp.res.valorFijo", { v: tipoDocTexto(tipoDocFijo) }),
            ejemplo: tipoDocTexto(tipoDocFijo),
            asociado: true,
          };
        }
        const col = basicos[b.key];
        return {
          campo: t(`clientes.imp.basico.${b.key}`),
          origen: col ? (
            colTag(col)
          ) : b.obligatorio ? (
            <span className="text-destructive">{t("clientes.imp.res.falta")}</span>
          ) : (
            <span className="text-muted-foreground">{t("clientes.imp.res.sinAsociar")}</span>
          ),
          ejemplo: ej(col),
          falta: !col && b.obligatorio,
          asociado: !!col,
        };
      }),
    },
    {
      titulo: t("clientes.imp.paso.contacto"),
      filas: contactos
        .filter((c) => c.columna)
        .map((c) => ({
          campo: `${t(`clientes.imp.forma.${c.tipo}`)}${c.descripcion ? ` (${c.descripcion})` : ""}${c.principal ? " ★" : ""}`,
          origen: colTag(c.columna),
          ejemplo: ej(c.columna),
          asociado: true,
        })),
    },
    {
      titulo: t("clientes.imp.paso.adicionales"),
      filas: [
        ...restantes
          .filter((col) => cfg(col).incluir)
          .map((col) => ({ campo: cfg(col).nombre, origen: colTag(col), ejemplo: ej(col), asociado: true })),
        ...vacios
          .filter((v) => v.nombre.trim())
          .map((v) => ({
            campo: v.nombre,
            origen: <span className="text-muted-foreground">{t("clientes.imp.res.agente")}</span>,
            asociado: true,
          })),
      ],
    },
  ];
  const asociados = grupos.flatMap((g) => g.filas).filter((f) => f.asociado).length;

  return (
    <Card className="xl:min-h-0 xl:flex-1">
      <CardHeader>
        <CardTitle>{t("clientes.imp.res.titulo")}</CardTitle>
        <CardDescription>
          {cargado ? t("clientes.imp.res.asociados", { n: asociados }) : t("clientes.imp.res.sinArchivo")}
        </CardDescription>
      </CardHeader>
      {cargado && (
        <CardContent className="max-h-[60vh] overflow-y-auto pt-0 xl:max-h-none xl:min-h-0 xl:flex-1">
          {/* Tabla sin el contenedor con scroll horizontal de <Table>, para que
              la cabecera quede fija mientras se scrollea el panel. */}
          <table className="w-full caption-bottom text-sm">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                {[t("clientes.imp.res.campo"), t("clientes.imp.res.origen"), t("clientes.imp.res.ejemplo")].map((h) => (
                  <TableHead key={h} className="sticky top-0 z-10 bg-card shadow-[inset_0_-1px_0_var(--border)]">
                    {h}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {grupos.map((g) => (
                <GrupoFilas key={g.titulo} titulo={g.titulo} filas={g.filas} />
              ))}
            </TableBody>
          </table>
        </CardContent>
      )}
    </Card>
  );
}

function GrupoFilas({
  titulo,
  filas,
}: {
  titulo: string;
  filas: { campo: string; origen: React.ReactNode; ejemplo?: string; falta?: boolean }[];
}) {
  const t = useT();
  return (
    <>
      <TableRow className="hover:bg-transparent">
        <TableCell colSpan={3} className="bg-muted/50 py-1.5 text-xs font-semibold text-muted-foreground">
          {titulo}
        </TableCell>
      </TableRow>
      {filas.length === 0 ? (
        <TableRow className="hover:bg-transparent">
          <TableCell colSpan={3} className="text-xs text-muted-foreground">
            {t("clientes.imp.res.ninguno")}
          </TableCell>
        </TableRow>
      ) : (
        filas.map((f, i) => (
          <TableRow key={`${f.campo}-${i}`} className={cn(f.falta && "bg-destructive/5")}>
            <TableCell className="max-w-32 truncate text-xs font-medium">{f.campo}</TableCell>
            <TableCell className="max-w-28 truncate text-xs">{f.origen}</TableCell>
            <TableCell className="max-w-28 truncate text-xs text-muted-foreground">{f.ejemplo ?? "—"}</TableCell>
          </TableRow>
        ))
      )}
    </>
  );
}
