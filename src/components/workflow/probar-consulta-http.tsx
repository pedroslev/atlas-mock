"use client";

import { useMemo, useState } from "react";
import { useEdges, useNodes } from "@xyflow/react";
import { AlertTriangle, Check, ChevronRight, Copy, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ActionTooltip } from "@/components/layout/action-tooltip";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import {
  METODOS_QUE_MODIFICAN,
  comoCurl,
  cuerpoPorDefecto,
  llenadaPor,
  resolverConsulta,
  rutaHija,
  simularRespuesta,
  tipoDeValor,
  variablesAnteriores,
  variablesDeConsulta,
  type ConfigHttp,
  type RespuestaSimulada,
  type SalidaHttp,
  type Simulacion,
} from "@/lib/probar-http";

// "Probar consulta HTTP": panel lateral del nodo Consulta HTTP. Usa la
// configuración del nodo tal como está en el editor (sin guardar ni publicar).
// Los valores de prueba y el historial viven solo en el estado React del
// editor: no van al documento del flujo ni a localStorage.
// En el mock la respuesta es SIMULADA: un selector elige el resultado.

type Prueba = {
  id: number;
  hora: string;
  metodo: string;
  urlResumida: string;
  salida: SalidaHttp;
  valores: Record<string, string>;
};

type Resultado = { respuesta: RespuestaSimulada; duracionMs: number };

const SIMULACIONES: Simulacion[] = ["exito", "404", "500", "timeout", "conexion", "grande"];
const SALIDAS: SalidaHttp[] = ["success", "error", "timeout"];
const MAX_HISTORIAL = 5;

/** Resumen corto de una URL para el historial: host y ruta, sin esquema. */
function resumirUrl(url: string) {
  const sin = url.replace(/^https?:\/\//, "");
  return sin.length > 40 ? `${sin.slice(0, 40)}…` : sin;
}

/** Botón «Probar» del encabezado del nodo y su panel lateral. */
export function ProbarConsultaHttp({
  nodoId,
  config,
  variableGuardado,
  timeoutSeg,
}: {
  nodoId: string;
  config: ConfigHttp;
  /** «Guardar respuesta en»; si está vacío se usa "respuesta". */
  variableGuardado?: string;
  timeoutSeg: number;
}) {
  const t = useT();
  const [abierto, setAbierto] = useState(false);
  const [valores, setValores] = useState<Record<string, string>>({});
  const [simulacion, setSimulacion] = useState<Simulacion>("exito");
  const [cuerpoSimulado, setCuerpoSimulado] = useState<string | null>(null);
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [historial, setHistorial] = useState<Prueba[]>([]);
  const [copiado, setCopiado] = useState<string | null>(null);
  const [curlCopiado, setCurlCopiado] = useState(false);
  const [contador, setContador] = useState(1);

  const nodos = useNodes();
  const aristas = useEdges();

  const variables = useMemo(() => variablesDeConsulta(config), [config]);
  const declaradas = useMemo(
    () => variablesAnteriores(nodoId, nodos as never, aristas),
    [nodoId, nodos, aristas]
  );
  const resuelta = useMemo(() => resolverConsulta(config, valores), [config, valores]);
  const bloqueada = resuelta.errores.length > 0;
  const nombreVariable = variableGuardado?.trim() || "respuesta";
  const cuerpoExito = cuerpoSimulado ?? cuerpoPorDefecto(config.url);

  const textoError = (e: { codigo: string; datos?: Record<string, string> }) =>
    t(`cuentas.flujo.probar.error.${e.codigo}`, e.datos ?? {});

  async function copiar(texto: string, alCopiar: () => void) {
    try {
      await navigator.clipboard.writeText(texto);
    } catch {
      /* sin permiso de portapapeles: igual se avisa en el mock */
    }
    alCopiar();
  }

  function ejecutar() {
    setConfirmando(false);
    setEnviando(true);
    setResultado(null);
    // Demora simulada de 300 a 900 ms.
    const demora = 300 + Math.round(Math.random() * 600);
    window.setTimeout(() => {
      const respuesta = simularRespuesta(simulacion, cuerpoExito);
      setResultado({ respuesta, duracionMs: respuesta.salida === "timeout" ? timeoutSeg * 1000 : demora });
      setEnviando(false);
      setHistorial((h) =>
        [
          {
            id: contador,
            hora: new Date().toLocaleTimeString("es-AR", { hour12: false }),
            metodo: config.metodo,
            urlResumida: resumirUrl(resuelta.url),
            salida: respuesta.salida,
            valores,
          },
          ...h,
        ].slice(0, MAX_HISTORIAL)
      );
      setContador((c) => c + 1);
    }, demora);
  }

  // Con POST, PUT, PATCH y DELETE puede modificar datos reales: pide confirmar.
  function pedirEnvio() {
    if (METODOS_QUE_MODIFICAN.includes(config.metodo)) setConfirmando(true);
    else ejecutar();
  }

  const salidaEtiqueta = (s: SalidaHttp) => t(`cuentas.flujo.salida.${s}`);

  return (
    <>
      <ActionTooltip label={t("cuentas.flujo.probar")}>
        <button
          type="button"
          aria-label={t("cuentas.flujo.probar")}
          disabled={config.url.trim() === ""}
          onClick={() => setAbierto(true)}
          data-testid="workflow-http-probar"
          className="flex size-6 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
        >
          <Play className="size-3.5" />
        </button>
      </ActionTooltip>

      <Sheet open={abierto} onOpenChange={setAbierto}>
        <SheetContent
          side="right"
          className="w-full gap-0 overflow-y-auto p-0 sm:max-w-xl"
          data-testid="workflow-http-panel"
        >
          <SheetHeader className="border-b">
            <SheetTitle>{t("cuentas.flujo.probar.titulo")}</SheetTitle>
            <SheetDescription>{t("cuentas.flujo.probar.descripcion")}</SheetDescription>
          </SheetHeader>

          <div className="flex flex-col gap-5 p-4">
            {/* Variables ---------------------------------------------------- */}
            <section className="flex flex-col gap-2" data-testid="workflow-http-variables">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">{t("cuentas.flujo.probar.variables")}</h3>
                {variables.length > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    onClick={() => setValores({})}
                    data-testid="workflow-http-limpiar"
                  >
                    {t("cuentas.flujo.probar.limpiar")}
                  </Button>
                )}
              </div>
              {variables.length === 0 ? (
                <p className="text-xs text-muted-foreground">{t("cuentas.flujo.probar.sinVariables")}</p>
              ) : (
                variables.map((v) => {
                  const valor = valores[v] ?? "";
                  return (
                    <div key={v} className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`http-prueba-${v}`} className="font-mono text-xs">
                          {v}
                        </Label>
                        {valor !== "" && (
                          <span className="rounded bg-muted px-1.5 text-[10px] text-muted-foreground">
                            {t(`cuentas.flujo.probar.tipo.${tipoDeValor(valor)}`)}
                          </span>
                        )}
                      </div>
                      <Input
                        id={`http-prueba-${v}`}
                        className="h-7 font-mono text-xs"
                        placeholder={t("cuentas.flujo.probar.valorPrueba")}
                        value={valor}
                        data-testid={`workflow-http-variable-${v}`}
                        onChange={(e) => setValores((x) => ({ ...x, [v]: e.target.value }))}
                      />
                      {!llenadaPor(v, declaradas) && (
                        <p
                          className="flex items-center gap-1 text-[11px] text-warning"
                          data-testid={`workflow-http-sin-origen-${v}`}
                        >
                          <AlertTriangle className="size-3" />
                          {t("cuentas.flujo.probar.sinOrigen")}
                        </p>
                      )}
                    </div>
                  );
                })
              )}
            </section>

            {/* Consulta resuelta --------------------------------------------- */}
            <section className="flex flex-col gap-2" data-testid="workflow-http-resuelta">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">{t("cuentas.flujo.probar.resuelta")}</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  disabled={bloqueada}
                  data-testid="workflow-http-curl"
                  onClick={() =>
                    copiar(comoCurl(resuelta), () => {
                      setCurlCopiado(true);
                      window.setTimeout(() => setCurlCopiado(false), 1500);
                    })
                  }
                >
                  {curlCopiado ? <Check /> : <Copy />}
                  {curlCopiado ? t("cuentas.flujo.probar.copiado") : t("cuentas.flujo.probar.curl")}
                </Button>
              </div>
              <pre className="max-h-48 overflow-auto rounded-md bg-muted p-2 font-mono text-xs whitespace-pre-wrap break-all">
                {`${resuelta.metodo} ${resuelta.url}`}
                {resuelta.encabezados.map((h) => `\n${h.nombre}: ${h.valor}`)}
                {resuelta.cuerpo !== undefined && `\n\n${resuelta.cuerpo}`}
              </pre>
              {resuelta.errores.map((e, i) => (
                <p key={i} className="flex items-start gap-1 text-xs text-destructive" data-testid="workflow-http-error">
                  <AlertTriangle className="mt-0.5 size-3 shrink-0" />
                  {textoError(e)}
                </p>
              ))}
            </section>

            {/* Enviar consulta ------------------------------------------------ */}
            <section className="flex flex-col gap-2">
              <div className="flex flex-col gap-1">
                <Label htmlFor="http-simulacion" className="text-xs">
                  {t("cuentas.flujo.probar.simulacion")}
                </Label>
                <Select value={simulacion} onValueChange={(v) => setSimulacion(v as Simulacion)}>
                  <SelectTrigger id="http-simulacion" size="sm" data-testid="workflow-http-simulacion">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SIMULACIONES.map((s) => (
                      <SelectItem key={s} value={s} data-testid={`workflow-http-simulacion-${s}`}>
                        {t(`cuentas.flujo.probar.sim.${s}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {simulacion === "exito" && (
                <div className="flex flex-col gap-1">
                  <Label htmlFor="http-cuerpo-simulado" className="text-xs">
                    {t("cuentas.flujo.probar.sim.cuerpo")}
                  </Label>
                  <Textarea
                    id="http-cuerpo-simulado"
                    className="min-h-24 font-mono text-xs"
                    value={cuerpoExito}
                    data-testid="workflow-http-cuerpo-simulado"
                    onChange={(e) => setCuerpoSimulado(e.target.value)}
                  />
                </div>
              )}
              <p className="text-xs text-muted-foreground">{t("cuentas.flujo.probar.aviso")}</p>
              <Button
                type="button"
                disabled={bloqueada || enviando}
                onClick={pedirEnvio}
                data-testid="workflow-http-enviar"
              >
                <Play />
                {enviando ? t("cuentas.flujo.probar.enviando") : t("cuentas.flujo.probar.enviar")}
              </Button>
            </section>

            {/* Resultado ------------------------------------------------------ */}
            <section className="flex flex-col gap-2" data-testid="workflow-http-resultado">
              <h3 className="text-sm font-medium">{t("cuentas.flujo.probar.resultado")}</h3>
              {!resultado ? (
                <p className="text-xs text-muted-foreground">{t("cuentas.flujo.probar.sinResultado")}</p>
              ) : (
                <>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                    <span>
                      {t("cuentas.flujo.probar.status")}:{" "}
                      <strong data-testid="workflow-http-status">{resultado.respuesta.status ?? "—"}</strong>
                    </span>
                    <span>
                      {t("cuentas.flujo.probar.duracion")}: <strong>{resultado.duracionMs} ms</strong>
                    </span>
                  </div>
                  {resultado.respuesta.motivo && (
                    <p className="text-xs text-muted-foreground">
                      {t(`cuentas.flujo.probar.motivo.${resultado.respuesta.motivo}`)}
                    </p>
                  )}
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">{t("cuentas.flujo.probar.salida")}</span>
                    <div className="flex gap-1.5">
                      {SALIDAS.map((s) => (
                        <span
                          key={s}
                          data-testid={`workflow-http-salida-${s}`}
                          data-activa={resultado.respuesta.salida === s}
                          className={cn(
                            "rounded-md border px-2 py-0.5 text-xs",
                            resultado.respuesta.salida === s
                              ? s === "success"
                                ? "border-success bg-success/15 font-medium text-success"
                                : "border-destructive bg-destructive/10 font-medium text-destructive"
                              : "text-muted-foreground opacity-60"
                          )}
                        >
                          {salidaEtiqueta(s)}
                        </span>
                      ))}
                    </div>
                  </div>
                  {Object.keys(resultado.respuesta.headers).length > 0 && (
                    <details className="text-xs">
                      <summary className="cursor-pointer text-muted-foreground">
                        {t("cuentas.flujo.probar.encabezadosRespuesta")}
                      </summary>
                      <pre className="mt-1 rounded-md bg-muted p-2 font-mono whitespace-pre-wrap">
                        {Object.entries(resultado.respuesta.headers).map(([k, v]) => `${k}: ${v}\n`)}
                      </pre>
                    </details>
                  )}
                  {resultado.respuesta.body !== undefined && (
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-muted-foreground">{t("cuentas.flujo.probar.cuerpo")}</span>
                      <div className="max-h-56 overflow-auto rounded-md bg-muted p-2 font-mono text-xs" data-testid="workflow-http-arbol">
                        <ArbolJson
                          valor={resultado.respuesta.body}
                          ruta={`${nombreVariable}.body`}
                          onCopiar={(ruta) => copiar(ruta, () => setCopiado(ruta))}
                        />
                      </div>
                      {copiado && (
                        <p className="text-xs text-success" data-testid="workflow-http-ruta-copiada">
                          {t("cuentas.flujo.probar.rutaCopiada", { ruta: copiado })}
                        </p>
                      )}
                    </div>
                  )}
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">
                      {t("cuentas.flujo.probar.guardado", { variable: nombreVariable })}
                    </span>
                    <pre className="max-h-40 overflow-auto rounded-md bg-muted p-2 font-mono text-xs whitespace-pre-wrap" data-testid="workflow-http-guardado">
                      {JSON.stringify(
                        { status: resultado.respuesta.status ?? null, body: resultado.respuesta.body ?? null },
                        null,
                        2
                      )}
                    </pre>
                  </div>
                </>
              )}
            </section>

            {/* Historial ------------------------------------------------------ */}
            <section className="flex flex-col gap-2" data-testid="workflow-http-historial">
              <h3 className="text-sm font-medium">{t("cuentas.flujo.probar.historial")}</h3>
              {historial.length === 0 ? (
                <p className="text-xs text-muted-foreground">{t("cuentas.flujo.probar.historialVacio")}</p>
              ) : (
                <>
                  <p className="text-xs text-muted-foreground">{t("cuentas.flujo.probar.historialAyuda")}</p>
                  <ul className="flex flex-col gap-1">
                    {historial.map((p) => (
                      <li key={p.id}>
                        <button
                          type="button"
                          data-testid="workflow-http-historial-item"
                          onClick={() => setValores(p.valores)}
                          className="flex w-full items-center gap-2 rounded-md border px-2 py-1 text-left text-xs hover:bg-muted"
                        >
                          <span className="shrink-0 text-muted-foreground">{p.hora}</span>
                          <span className="min-w-0 flex-1 truncate font-mono">
                            {p.metodo} {p.urlResumida}
                          </span>
                          <span className={p.salida === "success" ? "text-success" : "text-destructive"}>
                            {salidaEtiqueta(p.salida)}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </section>
          </div>
        </SheetContent>
      </Sheet>

      {/* Confirmación antes de enviar con un método que puede modificar datos. */}
      <AlertDialog open={confirmando} onOpenChange={setConfirmando}>
        <AlertDialogContent data-testid="workflow-http-confirmar">
          <AlertDialogHeader>
            <AlertDialogTitle>{t("cuentas.flujo.probar.confirmarTitulo", { metodo: config.metodo })}</AlertDialogTitle>
            <AlertDialogDescription>{t("cuentas.flujo.probar.confirmarDescripcion")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.acciones.cancelar")}</AlertDialogCancel>
            <AlertDialogAction onClick={ejecutar} data-testid="workflow-http-confirmar-enviar">
              {t("cuentas.flujo.probar.enviar")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

/**
 * Cuerpo de la respuesta como árbol navegable. Un clic en un campo copia su
 * ruta (respuesta.body.saldo, respuesta.body.items[0].id). Los valores se
 * dibujan como texto: nada de HTML de la respuesta.
 */
function ArbolJson({
  valor,
  ruta,
  onCopiar,
}: {
  valor: unknown;
  ruta: string;
  onCopiar: (ruta: string) => void;
}) {
  const esContenedor = valor !== null && typeof valor === "object";
  if (!esContenedor) {
    return (
      <button
        type="button"
        data-testid={`workflow-http-valor-${ruta}`}
        onClick={() => onCopiar(ruta)}
        className="rounded px-0.5 text-left hover:bg-background"
      >
        {typeof valor === "string" ? `"${valor}"` : String(valor)}
      </button>
    );
  }
  const entradas: [string | number, unknown][] = Array.isArray(valor)
    ? valor.map((v, i) => [i, v])
    : Object.entries(valor as Record<string, unknown>);
  return (
    <ul className="flex flex-col gap-0.5 border-l border-border pl-3">
      {entradas.map(([clave, v]) => {
        const hija = rutaHija(ruta, clave);
        const contenedor = v !== null && typeof v === "object";
        return (
          <li key={String(clave)}>
            <span className="flex items-start gap-1">
              <button
                type="button"
                data-testid={`workflow-http-campo-${hija}`}
                onClick={() => onCopiar(hija)}
                className="flex shrink-0 items-center gap-0.5 rounded px-0.5 font-medium text-secondary hover:bg-background"
              >
                {contenedor && <ChevronRight className="size-3" />}
                {String(clave)}:
              </button>
              {!contenedor && <ArbolJson valor={v} ruta={hija} onCopiar={onCopiar} />}
            </span>
            {contenedor && <ArbolJson valor={v} ruta={hija} onCopiar={onCopiar} />}
          </li>
        );
      })}
    </ul>
  );
}
