"use client";

// Asignación masiva desde un catálogo (clasificaciones, marcas, plantillas),
// ATLAS-1353: columna "Grupos" con filtro "está en / no está en", selección de
// filas y botón "Acciones (n)" con "Agregar a grupos" y "Quitar de grupos".
// Mismo patrón que la tabla de Usuarios.

import { ChevronDown } from "lucide-react";
import type {
  MRT_ColumnDef,
  MRT_RowData,
  MRT_RowSelectionState,
  MRT_TableOptions,
} from "material-react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  describirPertenenciaCon,
  filtrarPertenencia,
  FiltroPertenencia,
  type ValorPertenencia,
} from "@/app/(backoffice)/agentes/filtro-pertenencia";
import type { GrupoDeCatalogo } from "./asignar-a-grupos";

type T = (k: string, v?: Record<string, string | number>) => string;

/** Columna "Grupos" (oculta por defecto): a qué grupos pertenece cada elemento. */
export function columnaGrupos<R extends MRT_RowData & { id: string }>(
  t: T,
  grupos: GrupoDeCatalogo[]
): MRT_ColumnDef<R> {
  const de = (id: string) => grupos.filter((g) => g.ids.includes(id));
  return {
    id: "grupos",
    header: t("asignacion.colGrupos"),
    accessorFn: (r) => de(r.id).map((g) => g.nombre).join(", "),
    filterFn: (row, _id, valor) => filtrarPertenencia(de(row.original.id).map((g) => g.id), valor),
    Filter: ({ column }) => (
      <FiltroPertenencia
        column={column}
        opciones={grupos.map((g) => ({ id: g.id, nombre: g.nombre }))}
        textoSin={t("asignacion.sinGrupo")}
      />
    ),
    meta: {
      formatoFiltro: (v: unknown) =>
        describirPertenenciaCon(
          v as ValorPertenencia,
          (id) => grupos.find((g) => g.id === id)?.nombre ?? id,
          t("asignacion.sinGrupo"),
          t
        ),
    },
    Cell: ({ row }) => {
      const suyos = de(row.original.id);
      if (suyos.length === 0) return <span className="text-muted-foreground">—</span>;
      return (
        <div className="flex flex-wrap gap-1">
          {suyos.slice(0, 2).map((g) => (
            <Badge key={g.id} variant="outline">{g.nombre}</Badge>
          ))}
          {suyos.length > 2 && <Badge variant="secondary">+{suyos.length - 2}</Badge>}
        </div>
      );
    },
  };
}

/** Opciones de la tabla del catálogo: selección de filas y barra de acciones. */
export function opcionesDeSeleccion<R extends MRT_RowData & { id: string }>({
  t,
  seleccion,
  setSeleccion,
  onAccion,
}: {
  t: T;
  seleccion: MRT_RowSelectionState;
  setSeleccion: (s: MRT_RowSelectionState) => void;
  onAccion: (modo: "agregar" | "quitar") => void;
}): Partial<MRT_TableOptions<R>> {
  const n = Object.values(seleccion).filter(Boolean).length;
  return {
    getRowId: (r) => r.id,
    columnFilterDisplayMode: "popover",
    enableRowSelection: true,
    selectAllMode: "all",
    positionToolbarAlertBanner: "none",
    state: { rowSelection: seleccion },
    onRowSelectionChange: (u) =>
      setSeleccion(typeof u === "function" ? u(seleccion) : u),
    initialState: { columnVisibility: { grupos: false } },
    // Aviso al pasar el mouse por el ícono de una columna filtrada.
    localization: { filteringByColumn: t("usuarios.masivo.filtroActivo") },
    renderTopToolbarCustomActions: () =>
      n === 0 ? null : (
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="font-medium">{t("asignacion.seleccionados", { n })}</span>
          <Button variant="link" size="sm" className="h-auto p-0" onClick={() => setSeleccion({})}>
            {t("asignacion.quitarSeleccion")}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm">
                {t("asignacion.acciones", { n })}
                <ChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onSelect={() => onAccion("agregar")}>
                {t("asignacion.agregarAGrupos")}
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => onAccion("quitar")}>
                {t("asignacion.quitarDeGrupos")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
  };
}
