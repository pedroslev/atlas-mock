"use client";

import { useMemo, useRef, useState } from "react";
import { Check, FileSpreadsheet, FileText, Plus, RefreshCw, TriangleAlert, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { CanalExclusion, ContactoExcluido, SentidoExclusion } from "@/lib/mock-data";
import {
  CANALES,
  SENTIDOS,
  USUARIO_ACTUAL,
  clave,
  combinarSentido,
  nuevoId,
  validarContacto,
  type Limpieza,
} from "@/lib/listas-exclusion";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";

// Importar contactos y Quitar contactos por archivo (ATLAS-1444). Es el mismo
// asistente: Archivo → Limpieza (y Modo, al importar) → Vista previa. Se guarda
// al terminar, con barra de progreso cancelable.
// MOCK: el archivo se simula con los botones "Simular archivo"; las reglas de
// limpieza recordadas son de ejemplo.
// REAL: lee .txt, .csv, .xlsx y .xls (primera hoja); procesa en el servicio.

export type ModoArchivo = "importar" | "quitar";
type ModoImportar = "agregar" | "reemplazar";
type Simulado = "unaColumna" | "columnas" | "excel";
type Paso = "archivo" | "opciones" | "vista";
type Estado = "valido" | "repetido" | "invalido";

const ARCHIVOS: Record<Simulado, { nombre: string; columnas: string[]; filas: string[][] }> = {
  unaColumna: {
    nombre: "registro_no_llame_2026-11.txt",
    columnas: ["Contacto"],
    filas: [
      ["011 4222-3344"],
      ["(011) 4999-0000"],
      ["+54 11 4555-1122"],
      ["011.4300.7919"],
      ["011 4222-3344"],
      ["4300"],
      ["01147001234"],
      ["01147005678"],
    ],
  },
  columnas: {
    nombre: "excluidos_banco_sur.csv",
    columnas: ["Contacto", "Canal", "Sentido", "Fecha de alta"],
    filas: [
      ["+54 11 4222-3344", "Llamada", "Saliente", "02/11/2026"],
      ["+54 9 11 6011-2233", "whatsapp", "entrante", "02/11/2026"],
      ["reclamos@ejemplo.com", "EMAIL", "Saliente", ""],
      ["NUEVO@Ejemplo.com", "Email", "Bidireccional", ""],
      ["+54 11 4800-1122", "Llamada", "Salida", ""],
      ["+54 11 4800-3344", "Teléfono", "Saliente", ""],
      ["+54 11 4800-5566", "Llamada", "Saliente", ""],
    ],
  },
  excel: {
    nombre: "excluidos_banco_sur.xlsx",
    columnas: ["Contacto", "Canal", "Sentido", "Fecha de alta", "Usuario de alta"],
    filas: [
      ["5411 4555 1122", "Llamada", "Saliente", "02/11/2026", "Marina Acosta"],
      ["+54 9 11 7000-4455", "Llamada", "Saliente", "", ""],
      ["+54 9 11 6011-2233", "WhatsApp", "Saliente", "", ""],
      ["hola@ejemplo", "Email", "Saliente", "", ""],
    ],
  },
};

// MOCK: reglas de la última importación de la lista del registro nacional.
const REGLAS_RECORDADAS: Record<string, Limpieza> = {
  "dnc-1": { prefijos: [{ id: "r1", prefijo: "0", reemplazo: "54" }], caracteres: "." },
};

const canalDeTexto = (v: string): CanalExclusion | null =>
  ({ llamada: "calline", whatsapp: "wsp", email: "email" } as const)[v.trim().toLowerCase() as "llamada"] ?? null;
const sentidoDeTexto = (v: string): SentidoExclusion | null =>
  SENTIDOS.find((s) => s === v.trim().toLowerCase()) ?? null;

type Fila = {
  original: string;
  limpio: string;
  canal: CanalExclusion | null;
  sentido: SentidoExclusion | null;
  estado: Estado;
  enLista?: boolean;
};

type Resultado = {
  agregados: number;
  yaEstaban: number;
  actualizados: number;
  quitados: number;
  noEstaban: number;
  noValidos: number;
  cancelado: boolean;
};

export function ArchivoDialog({
  modo,
  listaId,
  contactos,
  onClose,
  onGuardado,
}: {
  modo: ModoArchivo;
  listaId: string;
  contactos: ContactoExcluido[];
  onClose: () => void;
  onGuardado: (nuevos: ContactoExcluido[]) => void;
}) {
  const t = useT();
  const [paso, setPaso] = useState<Paso>("archivo");
  const [simulado, setSimulado] = useState<Simulado>("unaColumna");
  const [cargado, setCargado] = useState(false);
  const [canalTodo, setCanalTodo] = useState<CanalExclusion>("calline");
  const [sentidoTodo, setSentidoTodo] = useState<SentidoExclusion>("saliente");
  const recordadas = REGLAS_RECORDADAS[listaId];
  const [limpieza, setLimpieza] = useState<Limpieza>(recordadas ?? { prefijos: [], caracteres: "" });
  const [modoImp, setModoImp] = useState<ModoImportar>("agregar");
  const [filtro, setFiltro] = useState<"todos" | Estado | "enLista" | "noEnLista">("todos");
  const [confirmarReemplazo, setConfirmarReemplazo] = useState(false);
  const [progreso, setProgreso] = useState<{ hecho: number; total: number } | null>(null);
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const cancelar = useRef(false);

  const archivo = ARCHIVOS[simulado];
  const iCanal = archivo.columnas.indexOf("Canal");
  const iSentido = archivo.columnas.indexOf("Sentido");

  const filas = useMemo<Fila[]>(() => {
    const vistos = new Set<string>();
    const enLista = new Set(contactos.map(clave));
    return archivo.filas.map((f) => {
      const canal = iCanal >= 0 ? canalDeTexto(f[iCanal]) : canalTodo;
      // Al quitar, el sentido no importa: se quita el contacto de ese canal.
      const sentido = modo === "quitar" ? sentidoTodo : iSentido >= 0 ? sentidoDeTexto(f[iSentido]) : sentidoTodo;
      const v = canal ? validarContacto(f[0], canal, limpieza) : null;
      if (!canal || !sentido || !v?.ok) {
        return { original: f[0], limpio: v?.ok ? v.valor : "", canal, sentido, estado: "invalido" as const };
      }
      const k = clave({ contacto: v.valor, canal });
      const estado: Estado = vistos.has(k) ? "repetido" : "valido";
      vistos.add(k);
      return { original: f[0], limpio: v.valor, canal, sentido, estado, enLista: enLista.has(k) };
    });
  }, [archivo, iCanal, iSentido, canalTodo, sentidoTodo, limpieza, contactos, modo]);

  const validas = filas.filter((f) => f.estado === "valido");
  const cuenta = {
    todos: filas.length,
    valido: validas.length,
    repetido: filas.filter((f) => f.estado === "repetido").length,
    invalido: filas.filter((f) => f.estado === "invalido").length,
    enLista: validas.filter((f) => f.enLista).length,
    noEnLista: validas.filter((f) => !f.enLista).length,
  };
  const orden: Record<Estado, number> = { invalido: 0, repetido: 1, valido: 2 };
  const visibles = [...filas]
    .sort((a, b) => orden[a.estado] - orden[b.estado])
    .filter((f) =>
      filtro === "todos"
        ? true
        : filtro === "enLista"
          ? f.estado === "valido" && f.enLista
          : filtro === "noEnLista"
            ? f.estado === "valido" && !f.enLista
            : f.estado === filtro
    );

  const combinaciones = [...new Set(validas.map((f) => `${f.canal}|${f.sentido}`))];
  const textoCombinaciones = combinaciones
    .map((c) => {
      const [canal, sentido] = c.split("|");
      return `${t(`listas.canal.${canal}`)} · ${t(`listas.sentido.${sentido}`)}`;
    })
    .join(", ");

  // Procesa de a una fila por paso: cancelar guarda lo procesado hasta ahí.
  function procesar() {
    cancelar.current = false;
    const lista = [...contactos];
    const r: Resultado = { agregados: 0, yaEstaban: 0, actualizados: 0, quitados: 0, noEstaban: 0, noValidos: cuenta.invalido, cancelado: false };
    const enArchivo = new Set<string>();
    let i = 0;
    setProgreso({ hecho: 0, total: validas.length });
    const paso = () => {
      if (cancelar.current) return terminar(true);
      if (i >= validas.length) return terminar(false);
      const f = validas[i++];
      const canal = f.canal as CanalExclusion;
      const sentido = f.sentido as SentidoExclusion;
      const k = clave({ contacto: f.limpio, canal });
      enArchivo.add(k);
      const j = lista.findIndex((c) => clave(c) === k);
      if (modo === "quitar") {
        if (j >= 0) {
          lista.splice(j, 1);
          r.quitados++;
        } else r.noEstaban++;
      } else if (j >= 0) {
        const nuevo = modoImp === "agregar" ? combinarSentido(lista[j].sentido, sentido) : sentido;
        if (nuevo !== lista[j].sentido) r.actualizados++;
        else r.yaEstaban++;
        lista[j] = { ...lista[j], sentido: nuevo };
      } else {
        lista.unshift({ id: nuevoId(), contacto: f.limpio, canal, sentido, fechaAlta: new Date().toISOString(), usuarioAlta: USUARIO_ACTUAL });
        r.agregados++;
      }
      setProgreso({ hecho: i, total: validas.length });
      setTimeout(paso, 350);
    };
    const terminar = (cancelado: boolean) => {
      let final = lista;
      // Reemplazar: se quitan los de las combinaciones del archivo que no vienen.
      if (!cancelado && modo === "importar" && modoImp === "reemplazar") {
        final = lista.filter((c) => {
          const quitar = combinaciones.includes(`${c.canal}|${c.sentido}`) && !enArchivo.has(clave(c));
          if (quitar) r.quitados++;
          return !quitar;
        });
      }
      onGuardado(final);
      setProgreso(null);
      setResultado({ ...r, cancelado });
    };
    setTimeout(paso, 350);
  }

  function descargarNoValidos() {
    const csv = ["Contacto"].concat(filas.filter((f) => f.estado === "invalido").map((f) => `"${f.original}"`)).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "no-validos.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  const procesando = progreso !== null;
  const PASOS: Paso[] = ["archivo", "opciones", "vista"];
  const idx = PASOS.indexOf(paso);

  return (
    <Dialog open onOpenChange={(abierto) => !abierto && !procesando && onClose()}>
      <DialogContent className="sm:max-w-3xl" showCloseButton={!procesando}>
        <DialogHeader>
          <DialogTitle>{t(modo === "importar" ? "listas.imp.tituloImportar" : "listas.imp.tituloQuitar")}</DialogTitle>
          {!resultado && !procesando && (
            <DialogDescription asChild>
              <ol className="flex items-center gap-2 text-xs">
                {PASOS.map((p, i) => (
                  <li key={p} className="flex items-center gap-2">
                    <span
                      className={cn(
                        "flex size-5 items-center justify-center rounded-full text-[11px] font-semibold",
                        i <= idx ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                      )}
                    >
                      {i < idx ? <Check className="size-3" /> : i + 1}
                    </span>
                    <span className={i === idx ? "font-medium text-foreground" : ""}>
                      {t(p === "opciones" && modo === "quitar" ? "listas.imp.limpieza" : `listas.imp.paso.${p}`)}
                    </span>
                    {i < PASOS.length - 1 && <span aria-hidden className="h-px w-6 bg-border" />}
                  </li>
                ))}
              </ol>
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto">
          {resultado ? (
            <ResultadoVista modo={modo} r={resultado} modoImp={modoImp} onDescargar={descargarNoValidos} />
          ) : procesando ? (
            <div className="flex flex-col gap-3 py-6">
              <span className="text-sm">{t("listas.imp.procesando", { hecho: progreso.hecho, total: progreso.total })}</span>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${progreso.total ? (progreso.hecho / progreso.total) * 100 : 0}%` }}
                />
              </div>
            </div>
          ) : paso === "archivo" ? (
            <PasoArchivo
              cargado={cargado}
              simulado={simulado}
              onSimular={setSimulado}
              onCargar={() => setCargado(true)}
              onCambiar={() => setCargado(false)}
              canalTodo={canalTodo}
              setCanalTodo={setCanalTodo}
              sentidoTodo={sentidoTodo}
              setSentidoTodo={setSentidoTodo}
              modo={modo}
            />
          ) : paso === "opciones" ? (
            <div className="flex flex-col gap-6">
              <PasoLimpieza limpieza={limpieza} setLimpieza={setLimpieza} recordadas={!!recordadas} />
              {modo === "importar" && (
                <fieldset className="flex flex-col gap-2">
                  <legend className="mb-2 text-sm font-medium">{t("listas.imp.modo")}</legend>
                  {(["agregar", "reemplazar"] as ModoImportar[]).map((m) => (
                    <label
                      key={m}
                      className={cn(
                        "flex cursor-pointer items-start gap-3 rounded-lg border p-3",
                        modoImp === m && "border-primary bg-primary/5"
                      )}
                    >
                      <input
                        type="radio"
                        name="modo-importar"
                        className="mt-1 accent-primary"
                        checked={modoImp === m}
                        onChange={() => setModoImp(m)}
                      />
                      <span className="flex flex-col">
                        <span className="font-medium">{t(`listas.imp.modo.${m}`)}</span>
                        <span className="text-xs text-muted-foreground">{t(`listas.imp.modo.${m}Desc`)}</span>
                      </span>
                    </label>
                  ))}
                </fieldset>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap gap-2">
                {(modo === "quitar"
                  ? (["todos", "enLista", "noEnLista", "repetido", "invalido"] as const)
                  : (["todos", "valido", "repetido", "invalido"] as const)
                ).map((k) => (
                  <button
                    key={k}
                    type="button"
                    aria-pressed={filtro === k}
                    onClick={() => setFiltro(k)}
                    className={cn(
                      "flex flex-col rounded-lg border px-3 py-2 text-left",
                      filtro === k ? "border-primary bg-primary/5" : "hover:bg-muted"
                    )}
                  >
                    <span className="text-lg font-semibold">{cuenta[k].toLocaleString("es-AR")}</span>
                    <span className="text-xs text-muted-foreground">
                      {t(
                        {
                          todos: "listas.imp.total",
                          valido: "listas.imp.validos",
                          repetido: "listas.imp.repetidos",
                          invalido: "listas.imp.noValidos",
                          enLista: "listas.imp.enLista",
                          noEnLista: "listas.imp.noEnLista",
                        }[k]
                      )}
                    </span>
                  </button>
                ))}
              </div>
              {modo === "importar" && modoImp === "reemplazar" && combinaciones.length > 0 && (
                <p className="flex items-start gap-2 rounded-lg border border-warning/50 bg-warning/10 px-3 py-2 text-sm">
                  <TriangleAlert className="mt-0.5 size-4 shrink-0 text-warning" />
                  {t("listas.imp.reemplazarAviso", { combinaciones: textoCombinaciones })}
                </p>
              )}
              <div className="overflow-x-auto rounded-lg ring-1 ring-foreground/10">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("listas.imp.original")}</TableHead>
                      <TableHead>{t("listas.imp.limpio")}</TableHead>
                      <TableHead>{t("listas.contactos.canal")}</TableHead>
                      {modo === "importar" && <TableHead>{t("listas.contactos.sentido")}</TableHead>}
                      <TableHead>{t("listas.imp.estado")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visibles.map((f, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-mono text-xs">{f.original}</TableCell>
                        <TableCell className="font-mono text-xs">{f.limpio || "—"}</TableCell>
                        <TableCell>{f.canal ? t(`listas.canal.${f.canal}`) : "—"}</TableCell>
                        {modo === "importar" && (
                          <TableCell>{f.sentido ? t(`listas.sentido.${f.sentido}`) : "—"}</TableCell>
                        )}
                        <TableCell>
                          {f.estado === "invalido" ? (
                            <Badge variant="destructive">{t("listas.imp.est.invalido")}</Badge>
                          ) : f.estado === "repetido" ? (
                            <Badge variant="warning">{t("listas.imp.est.repetido")}</Badge>
                          ) : modo === "quitar" ? (
                            <Badge variant={f.enLista ? "info" : "neutral"}>
                              {t(f.enLista ? "listas.imp.est.enLista" : "listas.imp.est.noEnLista")}
                            </Badge>
                          ) : (
                            <Badge variant="success">{t("listas.imp.est.valido")}</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          {resultado ? (
            <Button data-guarda-cambios onClick={onClose}>
              {t("listas.imp.cerrar")}
            </Button>
          ) : procesando ? (
            <Button variant="outline" onClick={() => (cancelar.current = true)}>
              {t("listas.imp.cancelarProceso")}
            </Button>
          ) : (
            <>
              {idx > 0 && (
                <Button variant="outline" className="sm:mr-auto" onClick={() => setPaso(PASOS[idx - 1])}>
                  {t("listas.imp.anterior")}
                </Button>
              )}
              <Button variant="outline" onClick={onClose}>
                {t("common.acciones.cancelar")}
              </Button>
              {paso === "vista" ? (
                <Button
                  variant={modo === "quitar" ? "destructive" : "default"}
                  disabled={modo === "quitar" ? cuenta.enLista === 0 : cuenta.valido === 0}
                  onClick={() => (modo === "importar" && modoImp === "reemplazar" ? setConfirmarReemplazo(true) : procesar())}
                >
                  {modo === "quitar"
                    ? t("listas.imp.confirmarQuitar", { n: cuenta.enLista })
                    : t("listas.imp.confirmarImportar", { n: cuenta.valido })}
                </Button>
              ) : (
                <Button disabled={paso === "archivo" && !cargado} onClick={() => setPaso(PASOS[idx + 1])}>
                  {t("listas.imp.siguiente")}
                </Button>
              )}
            </>
          )}
        </DialogFooter>

        <AlertDialog open={confirmarReemplazo} onOpenChange={setConfirmarReemplazo}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("listas.imp.reemplazoTitulo")}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("listas.imp.reemplazarAviso", { combinaciones: textoCombinaciones })}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("common.acciones.cancelar")}</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                onClick={() => {
                  setConfirmarReemplazo(false);
                  procesar();
                }}
              >
                {t("listas.imp.confirmarReemplazo")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogContent>
    </Dialog>
  );
}

function PasoArchivo({
  cargado,
  simulado,
  onSimular,
  onCargar,
  onCambiar,
  canalTodo,
  setCanalTodo,
  sentidoTodo,
  setSentidoTodo,
  modo,
}: {
  cargado: boolean;
  simulado: Simulado;
  onSimular: (s: Simulado) => void;
  onCargar: () => void;
  onCambiar: () => void;
  canalTodo: CanalExclusion;
  setCanalTodo: (c: CanalExclusion) => void;
  sentidoTodo: SentidoExclusion;
  setSentidoTodo: (s: SentidoExclusion) => void;
  modo: ModoArchivo;
}) {
  const t = useT();
  const archivo = ARCHIVOS[simulado];
  const unaColumna = archivo.columnas.length === 1;
  const usadas = ["Contacto", "Canal", "Sentido"];

  if (!cargado) {
    return (
      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={onCargar}
          className="flex h-36 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed text-sm text-muted-foreground hover:border-primary hover:bg-accent/40"
        >
          <Upload className="size-6" />
          <span className="font-medium text-foreground">{t("listas.imp.soltar")}</span>
          <span className="text-xs">{t("listas.imp.formatos")}</span>
        </button>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span>{t("listas.imp.simular")}</span>
          {(Object.keys(ARCHIVOS) as Simulado[]).map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={simulado === s}
              onClick={() => onSimular(s)}
              className={cn(
                "rounded-full border px-2.5 py-0.5 font-medium",
                simulado === s ? "border-primary bg-primary text-primary-foreground" : "hover:bg-muted"
              )}
            >
              {t(`listas.imp.sim.${s}`)}
            </button>
          ))}
        </div>
      </div>
    );
  }

  const Icono = simulado === "excel" ? FileSpreadsheet : FileText;
  const faltaCanal = !archivo.columnas.includes("Canal");
  const faltaSentido = !archivo.columnas.includes("Sentido");

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3 rounded-lg border p-3">
        <Icono className="size-5 text-success" />
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate font-medium">{archivo.nombre}</span>
          <span className="text-xs text-muted-foreground">{t("listas.imp.filas", { n: archivo.filas.length })}</span>
        </div>
        <Button variant="outline" size="sm" onClick={onCambiar}>
          <RefreshCw />
          {t("listas.imp.cambiar")}
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">
        {t(unaColumna ? "listas.imp.unaColumnaNota" : "listas.imp.columnasNota")}
      </p>
      {!unaColumna && (
        <div className="flex flex-wrap gap-2">
          {archivo.columnas.map((c) => (
            <Badge key={c} variant={usadas.includes(c) ? "info" : "neutral"}>
              {c} · {t(usadas.includes(c) ? "listas.imp.columnaUsada" : "listas.imp.columnaIgnorada")}
            </Badge>
          ))}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="imp-canal">{t("listas.contactos.canal")}</Label>
          {faltaCanal ? (
            <>
              <Select value={canalTodo} onValueChange={(v) => setCanalTodo(v as CanalExclusion)}>
                <SelectTrigger id="imp-canal" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CANALES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {t(`listas.canal.${c}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-xs text-muted-foreground">{t("listas.imp.paraTodoAyuda")}</span>
            </>
          ) : (
            <span className="text-sm text-muted-foreground">{t("listas.imp.deCadaFila")}</span>
          )}
        </div>
        {/* Al quitar, el sentido no importa: se quita el contacto del canal. */}
        {modo === "importar" && (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="imp-sentido">{t("listas.contactos.sentido")}</Label>
            {faltaSentido ? (
              <>
                <Select value={sentidoTodo} onValueChange={(v) => setSentidoTodo(v as SentidoExclusion)}>
                  <SelectTrigger id="imp-sentido" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SENTIDOS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {t(`listas.sentido.${s}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-xs text-muted-foreground">{t("listas.imp.paraTodoAyuda")}</span>
              </>
            ) : (
              <span className="text-sm text-muted-foreground">{t("listas.imp.deCadaFila")}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function PasoLimpieza({
  limpieza,
  setLimpieza,
  recordadas,
}: {
  limpieza: Limpieza;
  setLimpieza: (l: Limpieza) => void;
  recordadas: boolean;
}) {
  const t = useT();
  const upd = (id: string, cambios: Partial<Limpieza["prefijos"][number]>) =>
    setLimpieza({ ...limpieza, prefijos: limpieza.prefijos.map((p) => (p.id === id ? { ...p, ...cambios } : p)) });

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-medium">{t("listas.imp.limpieza")}</span>
        <span className="text-xs text-muted-foreground">{t("listas.imp.limpiezaAyuda")}</span>
        {recordadas && <span className="text-xs text-info">{t("listas.imp.recordadas")}</span>}
      </div>
      <div className="flex flex-col gap-2 rounded-lg bg-muted/50 p-3">
        {limpieza.prefijos.map((p) => (
          <div key={p.id} className="flex items-end gap-2">
            <div className="flex flex-col gap-1">
              <Label className="text-xs">{t("listas.imp.prefijo")}</Label>
              <Input className="w-28 font-mono" value={p.prefijo} onChange={(e) => upd(p.id, { prefijo: e.target.value })} />
            </div>
            <span className="pb-2 text-muted-foreground">→</span>
            <div className="flex flex-col gap-1">
              <Label className="text-xs">{t("listas.imp.reemplazarPor")}</Label>
              <Input className="w-28 font-mono" value={p.reemplazo} onChange={(e) => upd(p.id, { reemplazo: e.target.value })} />
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive"
              aria-label={t("listas.imp.quitarRegla")}
              onClick={() => setLimpieza({ ...limpieza, prefijos: limpieza.prefijos.filter((x) => x.id !== p.id) })}
            >
              <X />
            </Button>
          </div>
        ))}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setLimpieza({
                ...limpieza,
                prefijos: [...limpieza.prefijos, { id: `r-${Date.now()}`, prefijo: "", reemplazo: "" }],
              })
            }
          >
            <Plus />
            {t("listas.imp.agregarRegla")}
          </Button>
          <span className="text-xs text-muted-foreground">{t("listas.imp.prefijoAyuda")}</span>
        </div>
        <div className="mt-2 flex flex-col gap-1">
          <Label htmlFor="imp-caracteres" className="text-xs">{t("listas.imp.caracteres")}</Label>
          <Input
            id="imp-caracteres"
            className="w-40 font-mono"
            placeholder="- / ( ) ."
            value={limpieza.caracteres}
            onChange={(e) => setLimpieza({ ...limpieza, caracteres: e.target.value })}
          />
          <span className="text-xs text-muted-foreground">{t("listas.imp.caracteresAyuda")}</span>
        </div>
      </div>
    </div>
  );
}

function ResultadoVista({
  modo,
  r,
  modoImp,
  onDescargar,
}: {
  modo: ModoArchivo;
  r: Resultado;
  modoImp: ModoImportar;
  onDescargar: () => void;
}) {
  const t = useT();
  const items =
    modo === "quitar"
      ? [
          ["listas.imp.res.quitados", r.quitados],
          ["listas.imp.res.noEstaban", r.noEstaban],
          ["listas.imp.res.noValidos", r.noValidos],
        ]
      : [
          ["listas.imp.res.agregados", r.agregados],
          ["listas.imp.res.yaEstaban", r.yaEstaban],
          ["listas.imp.res.actualizados", r.actualizados],
          ...(modoImp === "reemplazar" ? [["listas.imp.res.quitados", r.quitados]] : []),
          ["listas.imp.res.noValidos", r.noValidos],
        ];
  return (
    <div className="flex flex-col gap-4">
      <span className="text-sm font-medium">{t("listas.imp.resultado")}</span>
      <div className="flex flex-wrap gap-2">
        {items.map(([k, n]) => (
          <div key={k as string} className="flex flex-col rounded-lg border px-3 py-2">
            <span className="text-lg font-semibold">{(n as number).toLocaleString("es-AR")}</span>
            <span className="text-xs text-muted-foreground">{t(k as string)}</span>
          </div>
        ))}
      </div>
      {r.cancelado && (
        <p className="flex items-start gap-2 rounded-lg border border-warning/50 bg-warning/10 px-3 py-2 text-sm">
          <TriangleAlert className="mt-0.5 size-4 shrink-0 text-warning" />
          {t("listas.imp.cancelado")}
        </p>
      )}
      <p className="text-sm text-muted-foreground">{t("listas.imp.guardado")}</p>
      {r.noValidos > 0 && (
        <Button variant="outline" size="sm" className="self-start" onClick={onDescargar}>
          {t("listas.imp.descargarNoValidos")}
        </Button>
      )}
    </div>
  );
}

