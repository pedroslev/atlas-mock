"use client";

// Filtro de cabecera para las columnas Grupos y Campañas de la tabla de
// Usuarios (ATLAS-1353): "está en" o "no está en", con uno o varios
// elementos, más la opción "Sin grupo" / "Sin campañas".

import { useState } from "react";
import type { MRT_Column, MRT_RowData } from "material-react-table";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n";
import { campanias, gruposTrabajo } from "@/lib/mock-data";
import { ListaSeleccionable, opcionesDeCampanias } from "./acciones-masivas";

export const NINGUNO = "__ninguno__";

export type ValorPertenencia = { modo: "en" | "no"; ids: string[] };

export function filtrarPertenencia(
  idsDelUsuario: string[],
  valor: ValorPertenencia | undefined
): boolean {
  if (!valor || valor.ids.length === 0) return true;
  const ninguno = valor.ids.includes(NINGUNO);
  const ids = valor.ids.filter((id) => id !== NINGUNO);
  const coincide =
    idsDelUsuario.some((id) => ids.includes(id)) ||
    (ninguno && idsDelUsuario.length === 0);
  return valor.modo === "en" ? coincide : !coincide;
}

/** Texto del filtro para el aviso de filtros activos: "Está en Cobranzas, Ventas". */
export function describirPertenencia(
  valor: ValorPertenencia,
  tipo: "grupos" | "campanias",
  t: (k: string) => string
): string {
  const nombre = (id: string) =>
    id === NINGUNO
      ? t(tipo === "grupos" ? "usuarios.masivo.filtro.sinGrupo" : "usuarios.masivo.filtro.sinCampanias")
      : (tipo === "grupos" ? gruposTrabajo : campanias).find((e) => e.id === id)?.nombre ?? id;
  return `${t(`usuarios.masivo.filtro.${valor.modo}`)} ${valor.ids.map(nombre).join(", ")}`;
}

export function FiltroPertenencia<T extends MRT_RowData>({
  column,
  tipo,
}: {
  column: MRT_Column<T>;
  tipo: "grupos" | "campanias";
}) {
  const t = useT();
  const guardado = column.getFilterValue() as ValorPertenencia | undefined;
  // El modo se recuerda aunque todavía no haya nada marcado (sin elementos
  // marcados el filtro no está activo).
  const [modo, setModo] = useState<ValorPertenencia["modo"]>(guardado?.modo ?? "en");
  const valor: ValorPertenencia = { modo, ids: guardado?.ids ?? [] };
  const opciones = [
    {
      id: NINGUNO,
      nombre: t(tipo === "grupos" ? "usuarios.masivo.filtro.sinGrupo" : "usuarios.masivo.filtro.sinCampanias"),
    },
    ...(tipo === "grupos"
      ? gruposTrabajo.map((g) => ({ id: g.id, nombre: g.nombre }))
      : opcionesDeCampanias()),
  ];

  function cambiar(nuevo: ValorPertenencia) {
    setModo(nuevo.modo);
    column.setFilterValue(nuevo.ids.length === 0 ? undefined : nuevo);
  }

  return (
    <div className="flex w-64 flex-col gap-2 p-1">
      <div className="flex gap-1 rounded-md bg-muted p-0.5">
        {(["en", "no"] as const).map((m) => (
          <Button
            key={m}
            type="button"
            size="sm"
            variant={valor.modo === m ? "default" : "ghost"}
            className="flex-1"
            onClick={() => cambiar({ ...valor, modo: m })}
          >
            {t(`usuarios.masivo.filtro.${m}`)}
          </Button>
        ))}
      </div>
      <ListaSeleccionable
        opciones={opciones}
        elegidos={valor.ids}
        onChange={(ids) => cambiar({ ...valor, ids })}
        placeholder={t(tipo === "grupos" ? "usuarios.masivo.buscarGrupo" : "usuarios.masivo.buscarCampania")}
        vacio={t("usuarios.masivo.sinResultados")}
      />
    </div>
  );
}
