"use client";

import { useState } from "react";
import {
  ArrowRight,
  Check,
  CircleAlert,
  FileSpreadsheet,
  Plus,
  Sparkles,
  Trash2,
  Upload,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { cn } from "@/lib/utils";
import { proyectos } from "@/lib/mock-data";
import {
  camposAdicionalesSistema,
  csvEjemplo,
  etiquetasCatalogo,
  getEtiqueta,
  type TipoCampo,
} from "@/lib/mock-clientes";
import { useT } from "@/lib/i18n";

// Wizard de importación de clientes (propuesta 2026-10-09). Mapea datos
// básicos, formas de contacto y campos adicionales; los campos adicionales se
// definen acá mismo a partir de las columnas del archivo (nombre en el
// sistema + tipo + validaciones), lo que reemplaza a las plantillas.
// Todos los desplegables tienen buscador y las opciones ya usadas se ven en
// gris sin desaparecer. Las etiquetas se pueden asignar por regla según el
// valor de un campo.

const PASOS = ["archivo", "basicos", "contacto", "adicionales", "opciones", "revision"] as const;
type Paso = (typeof PASOS)[number];

const BASICOS = [
  { key: "nombre", obligatorio: true, sugeridas: ["NOMBRE"] },
  { key: "apellido", obligatorio: false, sugeridas: ["APELLIDO"] },
  { key: "tipoDoc", obligatorio: false, sugeridas: ["TIPO_DOC"] },
  { key: "nroDoc", obligatorio: true, sugeridas: ["DNI", "NRO_DOC", "DOCUMENTO"] },
  { key: "idExterno", obligatorio: false, sugeridas: ["COD_CLIENTE", "ID_EXTERNO"] },
] as const;
type BasicoKey = (typeof BASICOS)[number]["key"];

type TipoForma = "telefono" | "whatsapp" | "email";
type MapeoContacto = {
  id: string;
  columna: string;
  tipo: TipoForma;
  etiqueta: string;
  principal: boolean;
};

type SiExiste = "reemplazar" | "siVacio" | "noTocar";
type ConfigAdicional = {
  incluir: boolean;
  destino: string; // "nuevo" o id de un campo existente
  nombre: string;
  tipo: TipoCampo;
  obligatorio: boolean;
  min?: string;
  max?: string;
  formatoFecha?: string;
  siExiste: SiExiste;
};

type CampoVacio = {
  id: string;
  nombre: string;
  tipo: TipoCampo;
  obligatorioEnGestion: boolean;
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

function muestras(columna: string) {
  const i = csvEjemplo.columnas.indexOf(columna);
  return csvEjemplo.filas.map((f) => f[i]).filter(Boolean);
}

function adivinarTipo(columna: string): TipoCampo {
  const vs = muestras(columna);
  if (vs.length === 0) return "texto";
  if (vs.every((v) => /^\d{2}\/\d{2}\/\d{4}$/.test(v))) return "fecha";
  if (vs.every((v) => /^(si|no|s|n|true|false)$/i.test(v))) return "booleano";
  if (vs.every((v) => /^-?\d+([.,]\d+)?$/.test(v))) return "numero";
  if (new Set(vs).size < vs.length) return "lista";
  return "texto";
}

function familia(tipo: TipoCampo): keyof typeof OPERADORES {
  if (tipo === "numero" || tipo === "moneda") return "numero";
  if (tipo === "fecha") return "fecha";
  if (tipo === "booleano") return "booleano";
  return "texto";
}

function prettify(columna: string) {
  // Si la columna ya viene escrita "linda" (ej. "Nro Socio"), se respeta.
  if (/[a-z]/.test(columna)) return columna;
  const s = columna.replace(/_/g, " ").toLowerCase();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function configInicial(columna: string): ConfigAdicional {
  const existente = camposAdicionalesSistema.find((c) => c.columnasConocidas.includes(columna));
  if (existente) {
    return {
      incluir: true,
      destino: existente.id,
      nombre: existente.nombre,
      tipo: existente.tipo,
      obligatorio: existente.obligatorio,
      siExiste: "reemplazar",
    };
  }
  return {
    incluir: true,
    destino: "nuevo",
    nombre: prettify(columna),
    tipo: adivinarTipo(columna),
    obligatorio: false,
    formatoFecha: "DD/MM/AAAA",
    siExiste: "reemplazar",
  };
}

function sugerirBasicos(): Record<BasicoKey, string> {
  const r = {} as Record<BasicoKey, string>;
  for (const b of BASICOS) {
    r[b.key] = b.sugeridas.find((s) => csvEjemplo.columnas.includes(s)) ?? "";
  }
  return r;
}

function sugerirContactos(): MapeoContacto[] {
  const out: MapeoContacto[] = [];
  const col = (c: string) => csvEjemplo.columnas.includes(c);
  if (col("TEL_CEL")) out.push({ id: "m1", columna: "TEL_CEL", tipo: "telefono", etiqueta: "Celular", principal: true });
  if (col("TEL_LABORAL")) out.push({ id: "m2", columna: "TEL_LABORAL", tipo: "telefono", etiqueta: "Laboral", principal: false });
  if (col("EMAIL")) out.push({ id: "m3", columna: "EMAIL", tipo: "email", etiqueta: "Personal", principal: false });
  return out;
}

function reglasIniciales(): ReglaEtiqueta[] {
  return [
    { id: "r1", columna: "DIAS_MORA", operador: "mayor", valor: "30", valor2: "", etiquetas: ["et-mora30"] },
    { id: "r2", columna: "SEGMENTO", operador: "igual", valor: "Premium", valor2: "", etiquetas: ["et-vip"] },
  ];
}

function parseFecha(v: string) {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(v);
  return m ? new Date(`${m[3]}-${m[2]}-${m[1]}`).getTime() : NaN;
}

function cumple(regla: ReglaEtiqueta, tipo: TipoCampo, valor: string) {
  const fam = familia(tipo);
  const v = valor?.trim() ?? "";
  switch (regla.operador) {
    case "vacio":
      return v === "";
    case "noVacio":
      return v !== "";
    case "esSi":
      return /^(si|s|true)$/i.test(v);
    case "esNo":
      return /^(no|n|false)$/i.test(v);
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

export function ImportarWizard({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const t = useT();
  const [paso, setPaso] = useState<Paso>("archivo");
  const [cargado, setCargado] = useState(false);
  const [basicos, setBasicos] = useState<Record<BasicoKey, string>>(sugerirBasicos);
  const [clave, setClave] = useState<"idExterno" | "nroDoc">("idExterno");
  const [contactos, setContactos] = useState<MapeoContacto[]>(sugerirContactos);
  const [adicionales, setAdicionales] = useState<Record<string, ConfigAdicional>>({});
  const [vacios, setVacios] = useState<CampoVacio[]>([]);
  const [ocultoEn, setOcultoEn] = useState<string[]>([]);
  const [etiquetas, setEtiquetas] = useState<string[]>([]);
  const [reglas, setReglas] = useState<ReglaEtiqueta[]>(reglasIniciales);
  const [errores, setErrores] = useState("saltear");
  const [importado, setImportado] = useState(false);

  const idx = PASOS.indexOf(paso);

  // Dónde se usa cada columna, para mostrarla en gris en los desplegables.
  const usos = new Map<string, string>();
  for (const b of BASICOS) {
    if (basicos[b.key]) usos.set(basicos[b.key], t(`clientes.imp.basico.${b.key}`));
  }
  for (const c of contactos) {
    if (c.columna) usos.set(c.columna, t("clientes.imp.usoContacto", { etiqueta: c.etiqueta || t(`clientes.imp.forma.${c.tipo}`) }));
  }
  const restantes = csvEjemplo.columnas.filter((c) => !usos.has(c));
  const cfg = (col: string) => adicionales[col] ?? configInicial(col);
  const setCfg = (col: string, cambios: Partial<ConfigAdicional>) =>
    setAdicionales((a) => ({ ...a, [col]: { ...cfg(col), ...cambios } }));

  // Tipo y nombre "en el sistema" de cualquier columna (para las reglas).
  const infoColumna = (col: string): { nombre: string; tipo: TipoCampo } => {
    const b = BASICOS.find((x) => basicos[x.key] === col);
    if (b) return { nombre: t(`clientes.imp.basico.${b.key}`), tipo: "texto" };
    const c = contactos.find((x) => x.columna === col);
    if (c) return { nombre: c.etiqueta || t(`clientes.imp.forma.${c.tipo}`), tipo: "texto" };
    const a = cfg(col);
    return { nombre: a.nombre, tipo: a.tipo };
  };

  const faltanBasicos = BASICOS.filter((b) => b.obligatorio && !basicos[b.key]);
  const puedeAvanzar =
    (paso === "archivo" && cargado) ||
    (paso === "basicos" && faltanBasicos.length === 0) ||
    (paso === "contacto" && contactos.some((c) => c.columna)) ||
    (paso === "adicionales" &&
      restantes.every((c) => !cfg(c).incluir || cfg(c).nombre.trim()) &&
      vacios.every((v) => v.nombre.trim())) ||
    paso === "opciones";

  const reset = () => {
    setPaso("archivo");
    setCargado(false);
    setBasicos(sugerirBasicos());
    setClave("idExterno");
    setContactos(sugerirContactos());
    setAdicionales({});
    setVacios([]);
    setOcultoEn([]);
    setEtiquetas([]);
    setReglas(reglasIniciales());
    setErrores("saltear");
    setImportado(false);
  };
  const cerrar = () => {
    onOpenChange(false);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? onOpenChange(true) : cerrar())}>
      <DialogContent className="flex max-h-[90vh] flex-col gap-0 p-0 sm:max-w-4xl">
        <DialogHeader className="border-b p-5 pb-4">
          <DialogTitle>{t("clientes.imp.titulo")}</DialogTitle>
          <DialogDescription>{t("clientes.imp.descripcion")}</DialogDescription>
          <Stepper actual={idx} />
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          {importado ? (
            <Resultado />
          ) : (
            <>
              {paso === "archivo" && <PasoArchivo cargado={cargado} onCargar={() => setCargado(true)} />}
              {paso === "basicos" && (
                <PasoBasicos basicos={basicos} setBasicos={setBasicos} clave={clave} setClave={setClave} usos={usos} />
              )}
              {paso === "contacto" && <PasoContacto contactos={contactos} setContactos={setContactos} usos={usos} />}
              {paso === "adicionales" && (
                <PasoAdicionales restantes={restantes} cfg={cfg} setCfg={setCfg} vacios={vacios} setVacios={setVacios} />
              )}
              {paso === "opciones" && (
                <PasoOpciones
                  ocultoEn={ocultoEn}
                  setOcultoEn={setOcultoEn}
                  etiquetas={etiquetas}
                  setEtiquetas={setEtiquetas}
                  reglas={reglas}
                  setReglas={setReglas}
                  infoColumna={infoColumna}
                  columnasImportadas={csvEjemplo.columnas.filter((c) => usos.has(c) || cfg(c).incluir)}
                  errores={errores}
                  setErrores={setErrores}
                />
              )}
              {paso === "revision" && (
                <PasoRevision
                  restantes={restantes}
                  cfg={cfg}
                  vacios={vacios}
                  basicos={basicos}
                  contactos={contactos}
                  reglas={reglas}
                  infoColumna={infoColumna}
                />
              )}
            </>
          )}
        </div>

        <DialogFooter className="m-0 flex-row items-center justify-between gap-2 border-t p-4 sm:justify-between">
          {importado ? (
            <>
              <span />
              <Button onClick={cerrar}>{t("clientes.imp.cerrar")}</Button>
            </>
          ) : (
            <>
              <Button variant="outline" disabled={idx === 0} onClick={() => setPaso(PASOS[idx - 1])}>
                {t("clientes.imp.anterior")}
              </Button>
              <div className="flex items-center gap-3">
                {paso === "basicos" && faltanBasicos.length > 0 && (
                  <span className="text-xs text-destructive">{t("clientes.imp.faltanObligatorios")}</span>
                )}
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
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Stepper({ actual }: { actual: number }) {
  const t = useT();
  return (
    <ol className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1">
      {PASOS.map((p, i) => (
        <li key={p} className="flex items-center gap-2">
          <span
            className={cn(
              "flex size-5 items-center justify-center rounded-full text-[11px] font-semibold",
              i < actual && "bg-primary text-primary-foreground",
              i === actual && "bg-primary text-primary-foreground ring-4 ring-primary/20",
              i > actual && "bg-muted text-muted-foreground"
            )}
            aria-current={i === actual ? "step" : undefined}
          >
            {i < actual ? <Check className="size-3" /> : i + 1}
          </span>
          <span className={cn("text-xs", i === actual ? "font-medium text-foreground" : "text-muted-foreground")}>
            {t(`clientes.imp.paso.${p}`)}
          </span>
          {i < PASOS.length - 1 && <span aria-hidden className="h-px w-4 bg-border" />}
        </li>
      ))}
    </ol>
  );
}

// Desplegable de columnas del archivo: las ya usadas en otro lado quedan en
// gris con la aclaración de dónde se usan, pero se pueden elegir igual.
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
  const opciones: ComboOption[] = [
    ...(permitirVacio ? [{ value: NADA, label: t("clientes.imp.noImportar") }] : []),
    ...csvEjemplo.columnas.map((c) => {
      const uso = c !== value ? usos.get(c) : undefined;
      return {
        value: c,
        label: <span className="font-mono text-xs">{c}</span>,
        searchText: c,
        muted: !!uso,
        hint: uso ? t("clientes.imp.usadaEn", { donde: uso }) : undefined,
      };
    }),
  ];
  return (
    <ComboSelect
      id={id}
      ariaLabel={ariaLabel}
      value={value || (permitirVacio ? NADA : "")}
      onChange={(v) => onChange(v === NADA ? "" : v)}
      options={opciones}
    />
  );
}

function Muestra({ columna }: { columna: string }) {
  const vs = columna ? muestras(columna).slice(0, 2) : [];
  if (vs.length === 0) return <span className="text-xs text-muted-foreground">—</span>;
  return <span className="truncate text-xs text-muted-foreground">{vs.join(" · ")}</span>;
}

// ── Paso 1 ────────────────────────────────────────────────────────────────
function PasoArchivo({ cargado, onCargar }: { cargado: boolean; onCargar: () => void }) {
  const t = useT();
  if (!cargado) {
    return (
      <button
        type="button"
        onClick={onCargar}
        className="flex h-48 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed text-sm text-muted-foreground hover:border-primary hover:bg-accent/40"
      >
        <Upload className="size-6" />
        <span className="font-medium text-foreground">{t("clientes.imp.soltar")}</span>
        <span className="text-xs">{t("clientes.imp.formatos")}</span>
      </button>
    );
  }
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3 rounded-lg border p-3">
        <FileSpreadsheet className="size-5 text-success" />
        <div className="flex flex-col">
          <span className="font-medium">{csvEjemplo.nombreArchivo}</span>
          <span className="text-xs text-muted-foreground">
            {t("clientes.imp.resumenArchivo", {
              filas: csvEjemplo.totalFilas.toLocaleString("es-AR"),
              columnas: csvEjemplo.columnas.length,
            })}
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">{t("clientes.imp.vistaPrevia")}</span>
        <div className="overflow-x-auto rounded-lg ring-1 ring-foreground/10">
          <Table>
            <TableHeader>
              <TableRow>
                {csvEjemplo.columnas.map((c) => (
                  <TableHead key={c} className="font-mono text-xs whitespace-nowrap">
                    {c}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {csvEjemplo.filas.slice(0, 3).map((f, i) => (
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
      </div>
    </div>
  );
}

// ── Paso 2 ────────────────────────────────────────────────────────────────
function PasoBasicos({
  basicos,
  setBasicos,
  clave,
  setClave,
  usos,
}: {
  basicos: Record<BasicoKey, string>;
  setBasicos: React.Dispatch<React.SetStateAction<Record<BasicoKey, string>>>;
  clave: "idExterno" | "nroDoc";
  setClave: (c: "idExterno" | "nroDoc") => void;
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
            <ColumnaSelect
              id={`b-${b.key}`}
              value={basicos[b.key]}
              usos={usos}
              permitirVacio={!b.obligatorio}
              onChange={(v) => setBasicos((x) => ({ ...x, [b.key]: v }))}
            />
            <Muestra columna={basicos[b.key]} />
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="imp-clave">{t("clientes.imp.clave")}</Label>
        <p className="text-xs text-muted-foreground">{t("clientes.imp.claveDesc")}</p>
        <div className="w-full sm:w-80">
          <ComboSelect
            id="imp-clave"
            value={clave}
            onChange={(v) => setClave(v as "idExterno" | "nroDoc")}
            options={[
              { value: "idExterno", label: t("clientes.imp.basico.idExterno") },
              { value: "nroDoc", label: t("clientes.imp.basico.nroDoc") },
            ]}
          />
        </div>
      </div>
    </div>
  );
}

// ── Paso 3 ────────────────────────────────────────────────────────────────
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
              <Label>{t("clientes.imp.etiquetaContacto")}</Label>
              <Input value={c.etiqueta} onChange={(e) => upd(c.id, { etiqueta: e.target.value })} />
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
              onClick={() => setContactos((xs) => xs.filter((x) => x.id !== c.id))}
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
        onClick={() =>
          setContactos((xs) => [
            ...xs,
            { id: `m-${Date.now()}`, columna: "", tipo: "telefono", etiqueta: "", principal: false },
          ])
        }
      >
        <Plus />
        {t("clientes.imp.agregarContacto")}
      </Button>
      <p className="text-xs text-muted-foreground">{t("clientes.imp.contactoNota")}</p>
    </div>
  );
}

// ── Paso 4 ────────────────────────────────────────────────────────────────
function PasoAdicionales({
  restantes,
  cfg,
  setCfg,
  vacios,
  setVacios,
}: {
  restantes: string[];
  cfg: (c: string) => ConfigAdicional;
  setCfg: (c: string, x: Partial<ConfigAdicional>) => void;
  vacios: CampoVacio[];
  setVacios: React.Dispatch<React.SetStateAction<CampoVacio[]>>;
}) {
  const t = useT();
  // Qué campo existente ya tomó cada columna (para mostrarlo en gris).
  const destinoUsado = new Map<string, string>();
  for (const col of restantes) {
    const c = cfg(col);
    if (c.incluir && c.destino !== "nuevo") destinoUsado.set(c.destino, col);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <p className="text-sm text-muted-foreground">{t("clientes.imp.adicionalesDesc")}</p>
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Sparkles className="size-3.5 text-primary" />
          {t("clientes.imp.recordarNota")}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {restantes.map((col) => (
          <FilaAdicional
            key={col}
            columna={col}
            c={cfg(col)}
            destinoUsado={destinoUsado}
            onChange={(x) => setCfg(col, x)}
          />
        ))}
      </div>

      <div className="flex flex-col gap-3 border-t pt-5">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium">{t("clientes.imp.vaciosTitulo")}</span>
          <p className="text-xs text-muted-foreground">{t("clientes.imp.vaciosDesc")}</p>
        </div>
        {vacios.map((v) => (
          <div
            key={v.id}
            className="grid items-end gap-3 rounded-lg border border-dashed p-3 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_auto_auto]"
          >
            <div className="flex flex-col gap-1.5">
              <Label>{t("clientes.imp.nombreSistema")}</Label>
              <Input
                value={v.nombre}
                placeholder={t("clientes.imp.vacioPlaceholder")}
                onChange={(e) => setVacios((xs) => xs.map((x) => (x.id === v.id ? { ...x, nombre: e.target.value } : x)))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>{t("clientes.imp.tipo")}</Label>
              <TipoSelect
                value={v.tipo}
                onChange={(tipo) => setVacios((xs) => xs.map((x) => (x.id === v.id ? { ...x, tipo } : x)))}
              />
            </div>
            <label className="flex h-8 items-center gap-2 text-sm">
              <Checkbox
                checked={v.obligatorioEnGestion}
                onCheckedChange={() =>
                  setVacios((xs) =>
                    xs.map((x) => (x.id === v.id ? { ...x, obligatorioEnGestion: !x.obligatorioEnGestion } : x))
                  )
                }
              />
              {t("clientes.imp.obligatorioGestion")}
            </label>
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
        ))}
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setVacios((xs) => [...xs, { id: `v-${Date.now()}`, nombre: "", tipo: "texto", obligatorioEnGestion: false }])
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

function FilaAdicional({
  columna,
  c,
  destinoUsado,
  onChange,
}: {
  columna: string;
  c: ConfigAdicional;
  destinoUsado: Map<string, string>;
  onChange: (x: Partial<ConfigAdicional>) => void;
}) {
  const t = useT();
  const existente = camposAdicionalesSistema.find((x) => x.id === c.destino);
  const distintos = Array.from(new Set(muestras(columna)));

  const opcionesDestino: ComboOption[] = [
    { value: "nuevo", label: t("clientes.imp.crearNuevo") },
    ...camposAdicionalesSistema.map((e) => {
      const otra = destinoUsado.get(e.id);
      const usado = otra && otra !== columna;
      return {
        value: e.id,
        label: e.nombre,
        group: t("clientes.imp.camposExistentes"),
        muted: !!usado,
        hint: usado ? t("clientes.imp.usadoPor", { columna: otra }) : undefined,
      };
    }),
  ];

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
              <ComboSelect
                ariaLabel={t("clientes.imp.destino")}
                value={c.destino}
                options={opcionesDestino}
                onChange={(v) => {
                  const e = camposAdicionalesSistema.find((x) => x.id === v);
                  onChange(
                    e
                      ? { destino: v, nombre: e.nombre, tipo: e.tipo, obligatorio: e.obligatorio }
                      : { destino: "nuevo", nombre: prettify(columna), tipo: adivinarTipo(columna) }
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
                onChange={(e) => onChange({ nombre: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>{t("clientes.imp.tipo")}</Label>
              <TipoSelect value={c.tipo} disabled={!!existente} onChange={(tipo) => onChange({ tipo })} />
            </div>
          </div>

          {existente ? (
            <p className="text-xs text-muted-foreground">
              {t("clientes.imp.validacionesExistente", {
                obligatorio: existente.obligatorio ? t("clientes.imp.si") : t("clientes.imp.no"),
              })}
            </p>
          ) : (
            <div className="flex flex-wrap items-end gap-x-5 gap-y-3 rounded-md bg-muted/50 p-3">
              <span className="w-full text-xs font-medium text-muted-foreground">{t("clientes.imp.validaciones")}</span>
              <label className="flex h-8 items-center gap-2 text-sm">
                <Checkbox checked={c.obligatorio} onCheckedChange={() => onChange({ obligatorio: !c.obligatorio })} />
                {t("clientes.imp.obligatorio")}
              </label>
              {(c.tipo === "numero" || c.tipo === "moneda") && (
                <>
                  <div className="flex flex-col gap-1">
                    <Label className="text-xs">{t("clientes.imp.minimo")}</Label>
                    <Input className="h-8 w-28" type="number" value={c.min ?? ""} onChange={(e) => onChange({ min: e.target.value })} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label className="text-xs">{t("clientes.imp.maximo")}</Label>
                    <Input className="h-8 w-28" type="number" value={c.max ?? ""} onChange={(e) => onChange({ max: e.target.value })} />
                  </div>
                </>
              )}
              {c.tipo === "texto" && (
                <div className="flex flex-col gap-1">
                  <Label className="text-xs">{t("clientes.imp.largoMax")}</Label>
                  <Input className="h-8 w-28" type="number" value={c.max ?? ""} onChange={(e) => onChange({ max: e.target.value })} />
                </div>
              )}
              {c.tipo === "fecha" && (
                <div className="flex w-44 flex-col gap-1">
                  <Label className="text-xs">{t("clientes.imp.formatoFecha")}</Label>
                  <ComboSelect
                    size="sm"
                    ariaLabel={t("clientes.imp.formatoFecha")}
                    value={c.formatoFecha ?? "DD/MM/AAAA"}
                    onChange={(v) => onChange({ formatoFecha: v })}
                    options={["DD/MM/AAAA", "AAAA-MM-DD", "MM/DD/AAAA"].map((f) => ({ value: f, label: f }))}
                  />
                </div>
              )}
              {c.tipo === "lista" && (
                <div className="flex flex-col gap-1">
                  <Label className="text-xs">{t("clientes.imp.opcionesDetectadas")}</Label>
                  <div className="flex flex-wrap gap-1">
                    {distintos.map((d) => (
                      <Badge key={d} variant="outline">
                        {d}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {c.tipo === "booleano" && (
                <span className="text-xs text-muted-foreground">
                  {t("clientes.imp.booleanoNota", { valores: distintos.join(" / ") })}
                </span>
              )}
            </div>
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

// ── Paso 5 ────────────────────────────────────────────────────────────────
function PasoOpciones({
  ocultoEn,
  setOcultoEn,
  etiquetas,
  setEtiquetas,
  reglas,
  setReglas,
  infoColumna,
  columnasImportadas,
  errores,
  setErrores,
}: {
  ocultoEn: string[];
  setOcultoEn: React.Dispatch<React.SetStateAction<string[]>>;
  etiquetas: string[];
  setEtiquetas: React.Dispatch<React.SetStateAction<string[]>>;
  reglas: ReglaEtiqueta[];
  setReglas: React.Dispatch<React.SetStateAction<ReglaEtiqueta[]>>;
  infoColumna: (c: string) => { nombre: string; tipo: TipoCampo };
  columnasImportadas: string[];
  errores: string;
  setErrores: (v: string) => void;
}) {
  const t = useT();
  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium">{t("clientes.imp.visibilidad")}</span>
            <ADefinir nota={t("clientes.imp.visibilidadNota")} />
          </div>
          <p className="text-xs text-muted-foreground">{t("clientes.imp.visibilidadDesc")}</p>
          <ul className="flex flex-col divide-y rounded-lg border">
            {proyectos.map((p) => {
              const visible = !ocultoEn.includes(p.id);
              return (
                <li key={p.id} className="flex items-center justify-between px-3 py-2">
                  <label htmlFor={`imp-vis-${p.id}`} className="text-sm">
                    {p.nombre}
                  </label>
                  <Switch
                    id={`imp-vis-${p.id}`}
                    checked={visible}
                    onCheckedChange={(on) => setOcultoEn((ids) => (on ? ids.filter((x) => x !== p.id) : [...ids, p.id]))}
                  />
                </li>
              );
            })}
          </ul>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">{t("clientes.imp.etiquetas")}</span>
          <p className="text-xs text-muted-foreground">{t("clientes.imp.etiquetasDesc")}</p>
          <EtiquetasPicker value={etiquetas} onChange={setEtiquetas} />
          <div className="mt-4 flex flex-col gap-2">
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
      </div>

      <ReglasEtiquetas
        reglas={reglas}
        setReglas={setReglas}
        infoColumna={infoColumna}
        columnasImportadas={columnasImportadas}
      />
    </div>
  );
}

function EtiquetasPicker({
  value,
  onChange,
}: {
  value: string[];
  onChange: React.Dispatch<React.SetStateAction<string[]>>;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {etiquetasCatalogo.map((e) => {
        const on = value.includes(e.id);
        return (
          <button
            key={e.id}
            type="button"
            aria-pressed={on}
            onClick={() => onChange((xs) => (on ? xs.filter((x) => x !== e.id) : [...xs, e.id]))}
            className={cn("rounded-full p-0.5", on ? "ring-2 ring-primary" : "opacity-60 hover:opacity-100")}
          >
            <EtiquetaBadge etiqueta={e} />
          </button>
        );
      })}
    </div>
  );
}

// Etiquetas automáticas: "si <campo> <operador> <valor> → poner estas
// etiquetas" (pedido de producto 2026-10-09).
function ReglasEtiquetas({
  reglas,
  setReglas,
  infoColumna,
  columnasImportadas,
}: {
  reglas: ReglaEtiqueta[];
  setReglas: React.Dispatch<React.SetStateAction<ReglaEtiqueta[]>>;
  infoColumna: (c: string) => { nombre: string; tipo: TipoCampo };
  columnasImportadas: string[];
}) {
  const t = useT();
  const [recordar, setRecordar] = useState(true);
  const upd = (id: string, c: Partial<ReglaEtiqueta>) =>
    setReglas((rs) => rs.map((r) => (r.id === id ? { ...r, ...c } : r)));

  const opcionesCampo: ComboOption[] = columnasImportadas.map((col) => {
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
        <ADefinir nota={t("clientes.imp.auto.notaDinamica")} />
      </div>

      {reglas.map((r) => {
        const info = r.columna ? infoColumna(r.columna) : { nombre: "", tipo: "texto" as TipoCampo };
        const fam = familia(info.tipo);
        const ops = OPERADORES[fam];
        const operador = ops.includes(r.operador) ? r.operador : ops[0];
        const valores = r.columna ? Array.from(new Set(muestras(r.columna))) : [];
        const coinciden = r.columna
          ? csvEjemplo.filas.filter((f) => cumple({ ...r, operador }, info.tipo, f[csvEjemplo.columnas.indexOf(r.columna)])).length
          : 0;
        const tipoInput = fam === "numero" ? "number" : fam === "fecha" ? "date" : "text";

        return (
          <div key={r.id} className="flex flex-col gap-3 rounded-lg border p-3">
            <div className="flex flex-wrap items-end gap-2">
              <span className="pb-2 text-sm font-medium">{t("clientes.imp.auto.si")}</span>
              <div className="w-56">
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
                      placeholder={t("clientes.imp.auto.elegirValor")}
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
                value={r.etiquetas}
                onChange={(fn) =>
                  upd(r.id, { etiquetas: typeof fn === "function" ? fn(r.etiquetas) : fn })
                }
              />
            </div>
            {r.columna && (
              <span className="text-xs text-muted-foreground">
                {t("clientes.imp.auto.coincide", { n: coinciden, total: csvEjemplo.filas.length })}
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
        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={recordar} onCheckedChange={() => setRecordar((x) => !x)} />
          {t("clientes.imp.auto.recordar")}
        </label>
      </div>
    </div>
  );
}

// ── Paso 6 ────────────────────────────────────────────────────────────────
function PasoRevision({
  restantes,
  cfg,
  vacios,
  basicos,
  contactos,
  reglas,
  infoColumna,
}: {
  restantes: string[];
  cfg: (c: string) => ConfigAdicional;
  vacios: CampoVacio[];
  basicos: Record<BasicoKey, string>;
  contactos: MapeoContacto[];
  reglas: ReglaEtiqueta[];
  infoColumna: (c: string) => { nombre: string; tipo: TipoCampo };
}) {
  const t = useT();
  const incluidos = restantes.filter((c) => cfg(c).incluir);
  const nuevos = incluidos.filter((c) => cfg(c).destino === "nuevo");
  const existentes = incluidos.filter((c) => cfg(c).destino !== "nuevo");
  const reglasValidas = reglas.filter((r) => r.columna && r.etiquetas.length > 0);

  const errores = [
    { fila: 14, columna: basicos.nroDoc || "DNI", problema: t("clientes.imp.err.faltaDoc") },
    { fila: 233, columna: "SALDO_DEUDA", problema: t("clientes.imp.err.noNumero", { valor: "N/D" }) },
    { fila: 870, columna: "EMAIL", problema: t("clientes.imp.err.mailInvalido") },
  ].filter((x) => x.columna !== "SALDO_DEUDA" || incluidos.includes("SALDO_DEUDA"));

  const stats = [
    { label: t("clientes.imp.stat.filas"), valor: "1.240", tono: "" },
    { label: t("clientes.imp.stat.nuevos"), valor: "85", tono: "text-info" },
    { label: t("clientes.imp.stat.actualizados"), valor: "1.130", tono: "text-success" },
    { label: t("clientes.imp.stat.errores"), valor: "25", tono: "text-destructive" },
  ];

  return (
    <div className="flex flex-col gap-6">
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
            <li>{t("clientes.imp.resumenBasicos", { n: Object.values(basicos).filter(Boolean).length })}</li>
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
                    {cfg(c).obligatorio ? ` · ${t("clientes.imp.obligatorio").toLowerCase()}` : ""} ·{" "}
                    {t("clientes.imp.desdeColumna", { columna: c })}
                  </span>
                </li>
              ))}
              {vacios.map((v) => (
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
                    {t("clientes.imp.auto.si")} <b>{infoColumna(r.columna).nombre}</b> {t(`clientes.imp.op.${operador}`).toLowerCase()}{" "}
                    {!SIN_VALOR.includes(operador) && <b>{r.valor}</b>}
                    {operador === "entre" && (
                      <>
                        {" "}
                        {t("clientes.imp.auto.y")} <b>{r.valor2}</b>
                      </>
                    )}
                  </span>
                  <ArrowRight className="size-3.5 text-muted-foreground" />
                  {r.etiquetas.map((id) => {
                    const e = getEtiqueta(id);
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

function Resultado() {
  const t = useT();
  return (
    <div className="flex flex-col items-center gap-3 py-10 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-success/15 text-success">
        <Check className="size-6" />
      </span>
      <span className="text-lg font-semibold">{t("clientes.imp.listo")}</span>
      <p className="max-w-md text-sm text-muted-foreground">{t("clientes.imp.listoDesc")}</p>
    </div>
  );
}
