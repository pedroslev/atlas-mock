"use client";

// Acciones masivas sobre los usuarios seleccionados en la tabla de Usuarios
// (ATLAS-1353). Cada acción pasa por tres pasos dentro de la misma ventana:
// elegir (campañas, grupos o el usuario de origen) → resumen antes de
// confirmar → resultado, con los que fallaron y "Reintentar los que fallaron".
// Los cambios se aplican al confirmar la ventana: el listado no tiene
// "Confirmar" en el encabezado.

import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useT } from "@/lib/i18n";
import {
  agentes,
  campanias,
  getAgente,
  gruposTrabajo,
  proyectos,
} from "@/lib/mock-data";
import {
  agregarACampanias,
  agregarAGrupos,
  aplicarCopia,
  calcularCopia,
  cambiarEstado,
  hayCambios,
  permisosPropios,
  quitarDeCampanias,
  quitarDeGrupos,
  type CambioCopia,
  type ModoCopia,
  type QueCopiar,
  type ResultadoMasivo,
} from "@/lib/asignacion-masiva";

export type AccionMasiva =
  | "campanias-agregar"
  | "campanias-quitar"
  | "grupos-agregar"
  | "grupos-quitar"
  | "habilitar"
  | "deshabilitar"
  | "copiar";

type Opcion = { id: string; nombre: string; grupo?: { id: string; nombre: string } };

const nombreDe = (id: string) => getAgente(id)?.nombre ?? id;

// --- Lista con buscador y casillas ----------------------------------------
// Si las opciones traen `grupo` (las campañas traen su proyecto), la lista se
// agrupa: cada grupo tiene su propia casilla para marcar todas las suyas.

export function ListaSeleccionable({
  opciones,
  elegidos,
  onChange,
  placeholder,
  vacio,
}: {
  opciones: Opcion[];
  elegidos: string[];
  onChange: (ids: string[]) => void;
  placeholder: string;
  vacio: string;
}) {
  const t = useT();
  const [consulta, setConsulta] = useState("");
  const q = consulta.trim().toLowerCase();
  // La búsqueda encuentra por el nombre del elemento o por el de su grupo
  // (buscar un proyecto trae todas sus campañas).
  const visibles = opciones.filter(
    (o) => o.nombre.toLowerCase().includes(q) || (o.grupo?.nombre.toLowerCase().includes(q) ?? false)
  );
  const agrupada = opciones.some((o) => o.grupo);

  function estado(ids: string[]): boolean | "indeterminate" {
    const n = ids.filter((id) => elegidos.includes(id)).length;
    return n === 0 ? false : n === ids.length ? true : "indeterminate";
  }
  function marcar(ids: string[], v: boolean) {
    onChange(v ? [...new Set([...elegidos, ...ids])] : elegidos.filter((id) => !ids.includes(id)));
  }

  const idsVisibles = visibles.map((o) => o.id);
  const grupos: { id: string; nombre: string; items: Opcion[] }[] = [];
  if (agrupada) {
    for (const o of visibles) {
      const g = o.grupo ?? { id: "", nombre: "" };
      let grupo = grupos.find((x) => x.id === g.id);
      if (!grupo) grupos.push((grupo = { ...g, items: [] }));
      grupo.items.push(o);
    }
  }

  const fila = (o: Opcion, sangria = false) => (
    <li key={o.id}>
      <label className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted ${sangria ? "pl-7" : ""}`}>
        <Checkbox checked={elegidos.includes(o.id)} onCheckedChange={(v) => marcar([o.id], v === true)} />
        <span className="min-w-0 truncate">{o.nombre}</span>
      </label>
    </li>
  );

  return (
    <div className="flex flex-col gap-2">
      <Input
        placeholder={placeholder}
        value={consulta}
        onChange={(e) => setConsulta(e.target.value)}
      />
      {visibles.length > 1 && (
        <label className="flex items-center gap-2 px-1 text-sm">
          <Checkbox
            checked={estado(idsVisibles)}
            onCheckedChange={(v) => marcar(idsVisibles, v === true)}
          />
          {t("usuarios.masivo.seleccionarTodos", { n: visibles.length })}
        </label>
      )}
      <ul className="flex max-h-60 flex-col gap-0.5 overflow-y-auto rounded-md ring-1 ring-foreground/10 p-1">
        {visibles.length === 0 && (
          <li className="px-2 py-3 text-center text-sm text-muted-foreground">{vacio}</li>
        )}
        {!agrupada && visibles.map((o) => fila(o))}
        {agrupada &&
          grupos.map((g) => {
            const ids = g.items.map((o) => o.id);
            return (
              <li key={g.id || "sin-grupo"}>
                {g.nombre ? (
                  <label className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium hover:bg-muted">
                    <Checkbox
                      aria-label={t("usuarios.masivo.todasDelProyecto", { proyecto: g.nombre })}
                      checked={estado(ids)}
                      onCheckedChange={(v) => marcar(ids, v === true)}
                    />
                    <span className="min-w-0 truncate">{g.nombre}</span>
                    <span className="text-xs font-normal text-muted-foreground">({ids.length})</span>
                  </label>
                ) : null}
                <ul className="flex flex-col gap-0.5">{g.items.map((o) => fila(o, !!g.nombre))}</ul>
              </li>
            );
          })}
      </ul>
    </div>
  );
}

/** Campañas agrupadas por proyecto, en el orden de los proyectos. */
export function opcionesDeCampanias(lista = campanias): Opcion[] {
  return proyectos.flatMap((p) =>
    lista
      .filter((c) => c.proyectoId === p.id)
      .map((c) => ({ id: c.id, nombre: c.nombre, grupo: { id: p.id, nombre: p.nombre } }))
  );
}

// --- Resultado --------------------------------------------------------------

function Resultado({
  resultado,
  onReintentar,
}: {
  resultado: ResultadoMasivo;
  onReintentar: () => void;
}) {
  const t = useT();
  return (
    <div className="flex flex-col gap-3 text-sm">
      {resultado.aplicados.length > 0 && (
        <p className="flex items-center gap-2">
          <CheckCircle2 className="size-4 text-emerald-600" />
          {t("usuarios.masivo.resultado.aplicados", { n: resultado.aplicados.length })}
        </p>
      )}
      {resultado.sinCambios.length > 0 && (
        <p className="text-muted-foreground">
          {t("usuarios.masivo.resultado.sinCambios", { n: resultado.sinCambios.length })}
        </p>
      )}
      {resultado.fallidos.length > 0 && (
        <div className="flex flex-col gap-2 rounded-md bg-destructive/10 p-3">
          <p className="flex items-center gap-2 font-medium text-destructive">
            <AlertTriangle className="size-4" />
            {t("usuarios.masivo.resultado.fallidos", { n: resultado.fallidos.length })}
          </p>
          <ul className="flex flex-col gap-1">
            {resultado.fallidos.map((f) => (
              <li key={f.usuarioId}>
                <span className="font-medium">{nombreDe(f.usuarioId)}</span>
                <span className="text-muted-foreground"> — {f.motivo}</span>
              </li>
            ))}
          </ul>
          <Button size="sm" variant="outline" className="w-fit" onClick={onReintentar}>
            {t("usuarios.masivo.reintentar")}
          </Button>
        </div>
      )}
    </div>
  );
}

function Nombres({ ids, max = 5 }: { ids: string[]; max?: number }) {
  const t = useT();
  const nombres = ids.map(nombreDe);
  return (
    <span>
      {nombres.slice(0, max).join(", ")}
      {nombres.length > max && ` ${t("usuarios.masivo.yMas", { n: nombres.length - max })}`}
    </span>
  );
}

// --- Acciones de agregar / quitar / estado --------------------------------

export function DialogoAccionMasiva({
  accion,
  usuarioIds,
  onClose,
}: {
  accion: Exclude<AccionMasiva, "copiar">;
  usuarioIds: string[];
  onClose: () => void;
}) {
  const t = useT();
  const esCampania = accion.startsWith("campanias");
  const esEstado = accion === "habilitar" || accion === "deshabilitar";
  const quita = accion.endsWith("quitar") || accion === "deshabilitar";

  const [paso, setPaso] = useState<"elegir" | "resumen" | "resultado">(
    esEstado ? "resumen" : "elegir"
  );
  const [elegidos, setElegidos] = useState<string[]>([]);
  const [resultado, setResultado] = useState<ResultadoMasivo | null>(null);

  const opciones: Opcion[] = esCampania
    ? opcionesDeCampanias()
    : gruposTrabajo.map((g) => ({ id: g.id, nombre: g.nombre }));
  const nombresElegidos = opciones.filter((o) => elegidos.includes(o.id)).map((o) => o.nombre);

  // Para el resumen: a quiénes no les cambia nada.
  const sinCambio = useMemo(() => {
    if (paso !== "resumen") return [];
    return usuarioIds.filter((u) => {
      if (esEstado) return getAgente(u)?.habilitado === (accion === "habilitar");
      const lista = esCampania
        ? campanias.filter((c) => elegidos.includes(c.id)).map((c) => c.usuariosAsignados)
        : gruposTrabajo.filter((g) => elegidos.includes(g.id)).map((g) => g.usuarioIds);
      return quita ? lista.every((l) => !l.includes(u)) : lista.every((l) => l.includes(u));
    });
  }, [paso, usuarioIds, elegidos, esEstado, esCampania, quita, accion]);

  function aplicar(ids: string[]) {
    switch (accion) {
      case "campanias-agregar": return agregarACampanias(ids, elegidos);
      case "campanias-quitar": return quitarDeCampanias(ids, elegidos);
      case "grupos-agregar": return agregarAGrupos(ids, elegidos);
      case "grupos-quitar": return quitarDeGrupos(ids, elegidos);
      case "habilitar": return cambiarEstado(ids, true);
      case "deshabilitar": return cambiarEstado(ids, false);
    }
  }

  function confirmar() {
    setResultado(aplicar(usuarioIds));
    setPaso("resultado");
  }

  function reintentar() {
    if (!resultado) return;
    const r = aplicar(resultado.fallidos.map((f) => f.usuarioId));
    setResultado({
      aplicados: [...resultado.aplicados, ...r.aplicados],
      sinCambios: [...resultado.sinCambios, ...r.sinCambios],
      fallidos: r.fallidos,
    });
  }

  const n = usuarioIds.length;
  const titulo = t(`usuarios.masivo.titulo.${accion}`);

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{titulo}</DialogTitle>
          <DialogDescription>
            {t("usuarios.masivo.seleccionados", { n })}
          </DialogDescription>
        </DialogHeader>

        {paso === "elegir" && (
          <ListaSeleccionable
            opciones={opciones}
            elegidos={elegidos}
            onChange={setElegidos}
            placeholder={t(esCampania ? "usuarios.masivo.buscarCampania" : "usuarios.masivo.buscarGrupo")}
            vacio={t("usuarios.masivo.sinResultados")}
          />
        )}

        {paso === "resumen" && (
          <div className="flex flex-col gap-3 text-sm">
            <p className={quita ? "text-destructive" : undefined}>
              {esEstado
                ? t(`usuarios.masivo.resumen.${accion}`, { n })
                : t(`usuarios.masivo.resumen.${accion}`, {
                    n,
                    m: elegidos.length,
                    nombres: nombresElegidos.join(", "),
                  })}
            </p>
            <p className="text-muted-foreground">
              <Nombres ids={usuarioIds} />
            </p>
            {sinCambio.length > 0 && (
              <p className="rounded-md bg-muted p-2 text-muted-foreground">
                {t(`usuarios.masivo.resumen.sinCambio.${esEstado ? accion : quita ? "quitar" : "agregar"}`, {
                  n: sinCambio.length,
                })}{" "}
                <Nombres ids={sinCambio} max={3} />
              </p>
            )}
          </div>
        )}

        {paso === "resultado" && resultado && (
          <Resultado resultado={resultado} onReintentar={reintentar} />
        )}

        <DialogFooter>
          {paso === "elegir" && (
            <>
              <Button variant="outline" onClick={onClose}>{t("common.acciones.cancelar")}</Button>
              <Button disabled={elegidos.length === 0} onClick={() => setPaso("resumen")}>
                {t("usuarios.masivo.continuar")}
              </Button>
            </>
          )}
          {paso === "resumen" && (
            <>
              <Button variant="outline" onClick={() => (esEstado ? onClose() : setPaso("elegir"))}>
                {t(esEstado ? "common.acciones.cancelar" : "usuarios.masivo.volver")}
              </Button>
              <Button
                variant={quita ? "destructive" : "default"}
                disabled={sinCambio.length === n}
                onClick={confirmar}
              >
                {t("common.acciones.confirmar")}
              </Button>
            </>
          )}
          {paso === "resultado" && (
            <Button onClick={onClose}>{t("usuarios.masivo.cerrar")}</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// --- Copiar asignaciones de otro usuario ---------------------------------

export function DialogoCopiar({
  usuarioIds,
  onClose,
}: {
  usuarioIds: string[];
  onClose: () => void;
}) {
  const t = useT();
  const [paso, setPaso] = useState<"elegir" | "resumen" | "resultado">("elegir");
  const [origenId, setOrigenId] = useState<string | null>(null);
  const [consulta, setConsulta] = useState("");
  const [que, setQue] = useState<QueCopiar>({ campanias: true, grupos: true, permisos: false });
  const [modo, setModo] = useState<ModoCopia>("sumar");
  const [cambios, setCambios] = useState<CambioCopia[]>([]);
  const [resultado, setResultado] = useState<ResultadoMasivo | null>(null);

  const candidatos = agentes.filter((a) =>
    `${a.nombre} ${a.email}`.toLowerCase().includes(consulta.trim().toLowerCase())
  );
  const origen = origenId ? getAgente(origenId) : undefined;
  const campOrigen = origenId ? campanias.filter((c) => c.usuariosAsignados.includes(origenId)) : [];
  const grpOrigen = origenId ? gruposTrabajo.filter((g) => g.usuarioIds.includes(origenId)) : [];
  const permOrigen = origenId ? permisosPropios(origenId) : [];

  const conCambios = cambios.filter(hayCambios);
  const sinCambios = usuarioIds.filter((u) => !conCambios.some((c) => c.usuarioId === u));
  const quitan = conCambios.filter(
    (c) => c.campaniasQuitar.length + c.gruposQuitar.length + c.permisosQuitar.length > 0
  );
  const nombreCamp = (id: string) => campanias.find((c) => c.id === id)?.nombre ?? id;
  const nombreGrp = (id: string) => gruposTrabajo.find((g) => g.id === id)?.nombre ?? id;

  function irAlResumen() {
    if (!origenId) return;
    setCambios(calcularCopia(origenId, usuarioIds, que, modo));
    setPaso("resumen");
  }

  function confirmar() {
    setResultado(aplicarCopia(conCambios));
    setPaso("resultado");
  }

  function reintentar() {
    if (!resultado) return;
    const r = aplicarCopia(cambios, resultado.fallidos.map((f) => f.usuarioId));
    setResultado({
      aplicados: [...resultado.aplicados, ...r.aplicados],
      sinCambios: [...resultado.sinCambios, ...r.sinCambios],
      fallidos: r.fallidos,
    });
  }

  const n = usuarioIds.length;
  const nadaQueCopiar = !que.campanias && !que.grupos && !que.permisos;

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{t("usuarios.masivo.titulo.copiar")}</DialogTitle>
          <DialogDescription>{t("usuarios.masivo.seleccionados", { n })}</DialogDescription>
        </DialogHeader>

        {paso === "elegir" && (
          <div className="flex flex-col gap-4 text-sm">
            <div className="flex flex-col gap-1.5">
              <Label>{t("usuarios.masivo.copiar.origen")}</Label>
              <Input
                placeholder={t("usuarios.masivo.copiar.buscarOrigen")}
                value={consulta}
                onChange={(e) => setConsulta(e.target.value)}
              />
              <ul className="flex max-h-40 flex-col gap-0.5 overflow-y-auto rounded-md p-1 ring-1 ring-foreground/10">
                {candidatos.map((a) => (
                  <li key={a.id}>
                    <button
                      type="button"
                      onClick={() => setOrigenId(a.id)}
                      className={`flex w-full flex-col rounded-md px-2 py-1.5 text-left hover:bg-muted ${
                        origenId === a.id ? "bg-primary/10 ring-1 ring-primary" : ""
                      }`}
                    >
                      <span>{a.nombre}</span>
                      <span className="text-xs text-muted-foreground">{a.email}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {origen && (
              <div className="flex flex-col gap-3 rounded-md bg-muted/50 p-3">
                <p className="font-medium">{t("usuarios.masivo.copiar.tiene", { nombre: origen.nombre })}</p>
                {(
                  [
                    ["campanias", campOrigen.map((c) => c.nombre)],
                    ["grupos", grpOrigen.map((g) => g.nombre)],
                    ["permisos", permOrigen.map((p) => `${p.modulo} (${p.acciones.join(", ")})`)],
                  ] as const
                ).map(([clave, items]) => (
                  <label key={clave} className="flex items-start gap-2">
                    <Checkbox
                      className="mt-0.5"
                      checked={que[clave]}
                      onCheckedChange={(v) => setQue((q) => ({ ...q, [clave]: v === true }))}
                    />
                    <span className="flex flex-col gap-1">
                      <span>{t(`usuarios.masivo.copiar.${clave}`)}</span>
                      <span className="flex flex-wrap gap-1">
                        {items.length === 0 ? (
                          <span className="text-xs text-muted-foreground">{t("usuarios.masivo.copiar.ninguno")}</span>
                        ) : (
                          items.map((i) => <Badge key={i} variant="outline">{i}</Badge>)
                        )}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            )}

            {origen && (
              <fieldset className="flex flex-col gap-2">
                <legend className="mb-1 text-sm font-medium">{t("usuarios.masivo.copiar.como")}</legend>
                {(["sumar", "igualar"] as const).map((m) => (
                  <label key={m} className="flex items-start gap-2">
                    <input
                      type="radio"
                      name="modo-copia"
                      className="mt-1 accent-primary"
                      checked={modo === m}
                      onChange={() => setModo(m)}
                    />
                    <span className="flex flex-col">
                      <span>{t(`usuarios.masivo.copiar.modo.${m}`)}</span>
                      <span className="text-xs text-muted-foreground">
                        {t(`usuarios.masivo.copiar.modo.${m}Ayuda`, { nombre: origen.nombre })}
                      </span>
                    </span>
                  </label>
                ))}
              </fieldset>
            )}
          </div>
        )}

        {paso === "resumen" && origen && (
          <div className="flex flex-col gap-3 text-sm">
            <p>
              {t("usuarios.masivo.resumen.copiar", { n: conCambios.length, nombre: origen.nombre })}
            </p>
            {quitan.length > 0 && (
              <div className="rounded-md bg-destructive/10 p-2 text-destructive">
                <p className="font-medium">{t("usuarios.masivo.resumen.copiarQuita", { n: quitan.length })}</p>
                <ul className="mt-1 flex flex-col gap-0.5">
                  {quitan.slice(0, 5).map((c) => (
                    <li key={c.usuarioId}>
                      {nombreDe(c.usuarioId)}:{" "}
                      {[
                        ...c.campaniasQuitar.map(nombreCamp),
                        ...c.gruposQuitar.map(nombreGrp),
                        ...c.permisosQuitar,
                      ].join(", ")}
                    </li>
                  ))}
                  {quitan.length > 5 && <li>{t("usuarios.masivo.yMas", { n: quitan.length - 5 })}</li>}
                </ul>
              </div>
            )}
            {sinCambios.length > 0 && (
              <p className="rounded-md bg-muted p-2 text-muted-foreground">
                {t("usuarios.masivo.resumen.sinCambio.copiar", { n: sinCambios.length })}{" "}
                <Nombres ids={sinCambios} max={3} />
              </p>
            )}
          </div>
        )}

        {paso === "resultado" && resultado && (
          <Resultado resultado={resultado} onReintentar={reintentar} />
        )}

        <DialogFooter>
          {paso === "elegir" && (
            <>
              <Button variant="outline" onClick={onClose}>{t("common.acciones.cancelar")}</Button>
              <Button disabled={!origenId || nadaQueCopiar} onClick={irAlResumen}>
                {t("usuarios.masivo.continuar")}
              </Button>
            </>
          )}
          {paso === "resumen" && (
            <>
              <Button variant="outline" onClick={() => setPaso("elegir")}>{t("usuarios.masivo.volver")}</Button>
              <Button
                variant={quitan.length > 0 ? "destructive" : "default"}
                disabled={conCambios.length === 0}
                onClick={confirmar}
              >
                {t("common.acciones.confirmar")}
              </Button>
            </>
          )}
          {paso === "resultado" && <Button onClick={onClose}>{t("usuarios.masivo.cerrar")}</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
