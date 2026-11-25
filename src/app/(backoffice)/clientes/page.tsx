"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, ChevronDown, Tags, Upload, X } from "lucide-react";
import type {
  MRT_ColumnFiltersState,
  MRT_VisibilityState,
  MRT_RowSelectionState,
  MRT_SortingState,
} from "material-react-table";
import { PageHeader } from "@/components/layout/page-header";
import { RowActions } from "@/components/data-table/row-actions";
import {
  MitrolTable,
  type MRT_ColumnDef,
} from "@/components/data-table/mitrol-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EtiquetaBadge } from "@/components/clientes/clientes-ui";
import { ColumnasMenu, type GrupoColumnas } from "@/components/clientes/columnas-menu";
import { ConsultaAvanzada } from "@/components/clientes/consulta-avanzada";
import { consultaAFiltros, filtrosAConsulta } from "@/components/clientes/consulta-sync";
import {
  ErrorConsulta,
  cumple,
  interpretar,
  type Consulta,
} from "@/lib/consulta-clientes";
import { CargarEnCampaniaDialog } from "@/components/clientes/cargar-en-campania-dialog";
import { RetirarDeCampaniaDialog } from "@/components/clientes/retirar-de-campania-dialog";
import {
  FiltroEtiquetas,
  FiltroFecha,
  FiltroLista,
  FiltroRango,
  FiltroSiNo,
  aNumero,
  cumpleEtiquetas,
  cumpleFecha,
  cumpleLista,
  cumpleRango,
  type ValorEtiquetas,
  type ValorFecha,
  type ValorLista,
  type ValorRango,
} from "@/components/clientes/filtros-cabecera";
import {
  camposAdicionalesSistema,
  clientes,
  getEtiqueta,
  telefonoPrincipal,
  type CampoAdicional,
  type Cliente,
} from "@/lib/mock-clientes";
import { useT } from "@/lib/i18n";
import { CAMPOS_ACTIVIDAD } from "@/lib/mock-actividad-clientes";

/** Valores que aparecen hoy en un campo de tipo lista (opciones del filtro). */
function valoresDe(dato: (c: Cliente) => string | undefined) {
  return [...new Set(clientes.map(dato).filter((v): v is string => !!v))].sort();
}

/** Primer dato de contacto de un tipo (el principal si hay). */
function contacto(c: Cliente, tipo: "email" | "whatsapp") {
  return (
    c.formasContacto.find((f) => f.tipo === tipo && f.principal) ??
    c.formasContacto.find((f) => f.tipo === tipo)
  )?.valor;
}

function formatoFecha(iso: string | undefined) {
  if (!iso) return "—";
  const [a, m, d] = iso.split("-");
  return d && m && a ? `${d}/${m}/${a}` : iso;
}

/**
 * Columna con el filtro de cabecera que corresponde a su tipo. La usan la
 * información adicional (el tipo se define al importar) y la actividad del
 * cliente (la calcula Atlas).
 */
function columnaPorTipo(
  id: string,
  nombre: string,
  tipo: CampoAdicional["tipo"],
  dato: (c: Cliente) => string | undefined,
  sinDatoEsAntiguo = false
): MRT_ColumnDef<Cliente> {
  const base: MRT_ColumnDef<Cliente> = {
    id,
    header: nombre,
    accessorFn: (c) => dato(c) ?? "",
  };
  switch (tipo) {
    case "numero":
    case "moneda":
      return {
        ...base,
        filterFn: (row, _id, v) => cumpleRango(dato(row.original), v as ValorRango),
        Filter: ({ column }) => <FiltroRango column={column} />,
        sortingFn: (a, b, id) =>
          aNumero(String(a.getValue(id) || "0")) - aNumero(String(b.getValue(id) || "0")),
        muiTableBodyCellProps: { align: "right" },
      };
    case "fecha":
      return {
        ...base,
        filterFn: (row, _id, v) =>
          cumpleFecha(dato(row.original), v as ValorFecha, sinDatoEsAntiguo),
        Filter: ({ column }) => <FiltroFecha column={column} />,
        Cell: ({ row }) => formatoFecha(dato(row.original)),
      };
    case "lista":
      return {
        ...base,
        filterFn: (row, _id, v) => cumpleLista(dato(row.original), v as ValorLista),
        Filter: ({ column }) => <FiltroLista column={column} valores={valoresDe(dato)} />,
      };
    case "booleano":
      return {
        ...base,
        filterFn: "equals",
        Filter: ({ column }) => <FiltroSiNo column={column} />,
      };
    default:
      // Texto: "contiene", el filtro de texto de la tabla.
      return { ...base, filterFn: "contains" };
  }
}

// El listado muestra solo datos básicos y etiquetas (feedback de producto
// 2026-10-09 y 2026-10-14): nombre y apellido separados, sin alta/última
// actualización (quedan en la ficha) y sin alta manual: por ahora los
// clientes entran solo por importación masiva.
//
// Carga manual en campañas (ATLAS-1186): copia la idea de la tabla de
// Usuarios de la asignación masiva (ATLAS-1353). Se suman columnas de
// información adicional desde el botón de columnas, cada columna se filtra
// desde su cabecera según su tipo, se seleccionan clientes y se elige la
// acción. Filtrar y seleccionar es una copia de ese momento.
export default function ClientesPage() {
  const t = useT();
  const [seleccion, setSeleccion] = useState<MRT_RowSelectionState>({});
  const [cargando, setCargando] = useState(false);
  const [retirando, setRetirando] = useState(false);
  // Aviso de la última acción masiva (cargar o retirar).
  const [aviso, setAviso] = useState<{ texto: string; detalle?: string } | null>(null);

  // Búsqueda: básico = filtros de la cabecera; avanzado = consulta escrita
  // (estilo JQL). Se sincronizan al cambiar de modo.
  const [modo, setModo] = useState<"basico" | "avanzado">("basico");
  const [filtros, setFiltros] = useState<MRT_ColumnFiltersState>([]);
  const [orden, setOrden] = useState<MRT_SortingState>([]);
  // Columnas por defecto: las de siempre. La información adicional y el
  // email / WhatsApp se suman desde el selector de columnas.
  const [columnas, setColumnas] = useState<MRT_VisibilityState>(() => ({
    email: false,
    whatsapp: false,
    ...Object.fromEntries(
      [...camposAdicionalesSistema, ...CAMPOS_ACTIVIDAD].map((c) => [c.id, false])
    ),
  }));
  const [texto, setTexto] = useState("");
  const [aplicada, setAplicada] = useState<Consulta | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [noBasico, setNoBasico] = useState<string | null>(null);

  const data = useMemo(
    () =>
      modo === "avanzado" && aplicada
        ? clientes.filter((c) => cumple(c, aplicada.filtro))
        : clientes,
    [modo, aplicada]
  );

  function buscar(consulta = texto): Consulta | null {
    try {
      const q = interpretar(consulta);
      setAplicada(q);
      setError(null);
      setOrden(q.orden ? [{ id: q.orden.campo.id, desc: q.orden.desc }] : []);
      return q;
    } catch (e) {
      if (e instanceof ErrorConsulta) setError(e.message);
      else throw e;
      return null;
    }
  }

  function pasarAAvanzado() {
    const q = filtrosAConsulta(filtros, orden);
    setTexto(q);
    // Los filtros de cabecera pasan a la consulta: se limpian para que no
    // sigan recortando la tabla sin verse.
    setFiltros([]);
    setNoBasico(null);
    setModo("avanzado");
    buscar(q);
  }

  function pasarABasico(forzar = false) {
    if (!forzar && texto.trim()) {
      let q: Consulta;
      try {
        q = interpretar(texto);
      } catch (e) {
        if (!(e instanceof ErrorConsulta)) throw e;
        setNoBasico(t("clientes.consulta.noBasico.error"));
        return;
      }
      const r = consultaAFiltros(q, t);
      if (!r.ok) {
        setNoBasico(r.motivo);
        return;
      }
      setFiltros(r.filtros);
      setOrden(r.orden);
      // Un filtro siempre se ve: se muestran las columnas filtradas.
      setColumnas((v) => ({
        ...v,
        ...Object.fromEntries([...r.filtros.map((f) => f.id), ...r.orden.map((o) => o.id)].map((id) => [id, true])),
      }));
    } else {
      setFiltros([]);
      setOrden([]);
    }
    setNoBasico(null);
    setAplicada(null);
    setError(null);
    setModo("basico");
  }

  const columns = useMemo<MRT_ColumnDef<Cliente>[]>(
    () => [
      {
        accessorKey: "nombre",
        header: t("clientes.col.nombre"),
        filterFn: "contains",
        Cell: ({ row }) => (
          <Link href={`/clientes/${row.original.id}`} className="font-medium hover:underline">
            {row.original.nombre}
          </Link>
        ),
      },
      {
        accessorKey: "apellido",
        header: t("clientes.col.apellido"),
        filterFn: "contains",
        Cell: ({ row }) => (
          <Link href={`/clientes/${row.original.id}`} className="font-medium hover:underline">
            {row.original.apellido}
          </Link>
        ),
      },
      {
        id: "identificacion",
        header: t("clientes.col.identificacion"),
        accessorFn: (c) => `${c.tipoDoc} ${c.nroDoc}`,
        filterFn: "contains",
        Cell: ({ cell }) => <span className="text-muted-foreground">{cell.getValue<string>()}</span>,
      },
      {
        id: "idExterno",
        header: t("clientes.col.idExterno"),
        accessorFn: (c) => c.idExterno ?? "—",
        filterFn: "contains",
        Cell: ({ cell }) => <span className="font-mono text-xs">{cell.getValue<string>()}</span>,
      },
      {
        id: "telefono",
        header: t("clientes.col.telefono"),
        accessorFn: (c) => telefonoPrincipal(c) ?? "—",
        filterFn: "contains",
      },
      {
        id: "email",
        header: t("clientes.col.email"),
        accessorFn: (c) => contacto(c, "email") ?? "—",
        filterFn: "contains",
      },
      {
        id: "whatsapp",
        header: t("clientes.col.whatsapp"),
        accessorFn: (c) => contacto(c, "whatsapp") ?? "—",
        filterFn: "contains",
      },
      {
        id: "etiquetas",
        header: t("clientes.col.etiquetas"),
        // El texto sirve para la búsqueda general; el filtro usa los ids.
        accessorFn: (c) => c.etiquetas.map((id) => getEtiqueta(id)?.nombre).join(", "),
        filterFn: (row, _id, v) => cumpleEtiquetas(row.original.etiquetas, v as ValorEtiquetas),
        Filter: ({ column }) => <FiltroEtiquetas column={column} />,
        Cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            {row.original.etiquetas.map((id) => {
              const e = getEtiqueta(id);
              return e ? <EtiquetaBadge key={id} etiqueta={e} /> : null;
            })}
          </div>
        ),
      },
      ...camposAdicionalesSistema.map((c) =>
        columnaPorTipo(c.id, c.nombre, c.tipo, (cl) => cl.infoAdicional[c.nombre])
      ),
      ...CAMPOS_ACTIVIDAD.map((c) =>
        columnaPorTipo(c.id, c.nombre, c.tipo, (cl) => c.valor(cl.id), "sinDatoEsAntiguo" in c)
      ),
    ],
    [t]
  );

  const seleccionados = clientes.filter((c) => seleccion[c.id]);

  // Grupos del selector de columnas.
  const grupos: GrupoColumnas[] = [
    {
      id: "basicos",
      titulo: t("clientes.columnas.basicos"),
      columnas: ["nombre", "apellido", "identificacion", "idExterno"],
    },
    {
      id: "contacto",
      titulo: t("clientes.columnas.contacto"),
      columnas: ["telefono", "email", "whatsapp"],
    },
    {
      id: "adicional",
      titulo: t("clientes.columnas.adicional"),
      columnas: camposAdicionalesSistema.map((c) => c.id),
    },
    {
      id: "actividad",
      titulo: t("clientes.columnas.actividad"),
      columnas: CAMPOS_ACTIVIDAD.map((c) => c.id),
    },
    { id: "etiquetas", titulo: t("clientes.columnas.etiquetas"), columnas: ["etiquetas"] },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("common.nav.clientes")}
        description={t("clientes.descripcion")}
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/clientes/etiquetas">
                <Tags />
                {t("clientes.administrarEtiquetas")}
              </Link>
            </Button>
            <Button asChild>
              <Link href="/clientes/importar">
                <Upload />
                {t("clientes.importar")}
              </Link>
            </Button>
          </>
        }
      />

      {aviso && (
        <div className="flex items-start gap-3 rounded-lg border border-emerald-600/40 bg-emerald-600/5 px-4 py-3 text-sm">
          <CheckCircle2 className="mt-0.5 size-4 text-emerald-600" />
          <div className="flex-1">
            <p>{aviso.texto}</p>
            {aviso.detalle && <p className="text-muted-foreground">{aviso.detalle}</p>}
          </div>
          <Button variant="ghost" size="icon" aria-label={t("common.acciones.cerrar")} onClick={() => setAviso(null)}>
            <X />
          </Button>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-1 self-start rounded-md bg-muted p-0.5">
          {(["basico", "avanzado"] as const).map((m) => (
            <Button
              key={m}
              size="sm"
              variant={modo === m ? "default" : "ghost"}
              onClick={() => (m === "avanzado" ? modo !== m && pasarAAvanzado() : modo !== m && pasarABasico())}
            >
              {t(`clientes.consulta.modo.${m}`)}
            </Button>
          ))}
        </div>
        {noBasico && (
          <div className="flex flex-wrap items-center gap-3 rounded-lg border border-amber-500/40 bg-amber-500/5 px-4 py-2 text-sm">
            <span className="flex-1">{noBasico}</span>
            <Button size="sm" variant="ghost" onClick={() => setNoBasico(null)}>
              {t("clientes.consulta.noBasico.quedarme")}
            </Button>
            <Button size="sm" variant="outline" onClick={() => pasarABasico(true)}>
              {t("clientes.consulta.noBasico.borrar")}
            </Button>
          </div>
        )}
        {modo === "avanzado" && (
          <ConsultaAvanzada
            valor={texto}
            onChange={setTexto}
            onBuscar={() => buscar()}
            error={error}
            resultados={aplicada && !error ? data.length : null}
          />
        )}
      </div>

      <MitrolTable
        columns={columns}
        data={data}
        options={{
          getRowId: (c) => c.id,
          // Filtro desde la cabecera de cada columna (ícono en el título).
          columnFilterDisplayMode: "popover",
          enableRowSelection: true,
          // La casilla de la cabecera selecciona todos los que cumplen los
          // filtros, no solo los que se ven en pantalla.
          selectAllMode: "all",
          positionToolbarAlertBanner: "none",
          state: {
            rowSelection: seleccion,
            columnFilters: filtros,
            sorting: orden,
            columnVisibility: columnas,
          },
          onColumnVisibilityChange: setColumnas,
          onRowSelectionChange: setSeleccion,
          onColumnFiltersChange: setFiltros,
          onSortingChange: setOrden,
          // En el modo avanzado filtra la consulta: la cabecera no filtra.
          enableColumnFilters: modo === "basico",
          initialState: {
            // Las casillas quedan fijas a la izquierda (y las acciones de la
            // fila a la derecha) aunque se haga scroll horizontal.
            columnPinning: { left: ["mrt-row-select"], right: ["mrt-row-actions"] },
          },
          enableColumnPinning: true,
          // Selector de columnas propio: con buscador y por grupos.
          renderToolbarInternalActions: ({ table }) => (
            <ColumnasMenu table={table} grupos={grupos} />
          ),
          renderTopToolbarCustomActions: ({ table }) => {
            const filtrados = table.getFilteredRowModel().rows.map((r) => r.id);
            const ocultos = seleccionados.filter((c) => !filtrados.includes(c.id)).length;
            return (
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className="text-muted-foreground">
                  {t("clientes.masivo.conteo", { n: filtrados.length, total: clientes.length })}
                </span>
                {/* Acciones siempre a la vista; sin selección, deshabilitado. */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="sm"
                      disabled={seleccionados.length === 0}
                      title={seleccionados.length === 0 ? t("clientes.masivo.sinSeleccion") : undefined}
                    >
                      {seleccionados.length === 0
                        ? t("clientes.masivo.accionesSinSeleccion")
                        : t("clientes.masivo.acciones", { n: seleccionados.length })}
                      <ChevronDown />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56">
                    <DropdownMenuItem onSelect={() => setCargando(true)}>
                      {t("clientes.cargar.titulo")}
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setRetirando(true)}>
                      {t("clientes.retirar.titulo")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                {seleccionados.length === 0 ? (
                  <span className="text-xs text-muted-foreground">{t("clientes.masivo.sinSeleccion")}</span>
                ) : (
                  <>
                    <span className="font-medium">
                      {t("clientes.masivo.seleccionados", { n: seleccionados.length })}
                      {ocultos > 0 && (
                        <span className="font-normal text-amber-600 dark:text-amber-400">
                          {" "}
                          {t("clientes.masivo.ocultos", { n: ocultos })}
                        </span>
                      )}
                    </span>
                    <Button variant="link" size="sm" className="h-auto p-0" onClick={() => setSeleccion({})}>
                      {t("clientes.masivo.quitarSeleccion")}
                    </Button>
                  </>
                )}
              </div>
            );
          },
          enableRowActions: true,
          renderRowActions: ({ row }) => (
            <RowActions
              actions={[
                { label: t("clientes.verFicha"), href: `/clientes/${row.original.id}` },
                { label: t("common.acciones.eliminar"), destructive: true, separatorBefore: true },
              ]}
            />
          ),
        }}
      />

      <CargarEnCampaniaDialog
        open={cargando}
        onOpenChange={setCargando}
        seleccion={seleccionados}
        onCargar={(r) => {
          setAviso({
            texto: t("clientes.cargar.listo", { n: r.cargados, campania: r.campania }),
            detalle: r.omitidos > 0 ? t("clientes.cargar.listoOmitidos", { n: r.omitidos }) : undefined,
          });
          setSeleccion({});
        }}
      />

      <RetirarDeCampaniaDialog
        open={retirando}
        onOpenChange={setRetirando}
        seleccion={seleccionados}
        onRetirar={(r) => {
          setAviso({ texto: t("clientes.retirar.listo", { n: r.retiros, c: r.campanias }) });
          setSeleccion({});
        }}
      />
    </div>
  );
}
