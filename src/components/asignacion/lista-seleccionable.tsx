"use client";

// Lista con buscador y casillas para elegir varios elementos a la vez
// (ATLAS-1353). Se usa en toda la asignación masiva de Olimpo.
//
// - Si las opciones traen `grupo` (las campañas traen su proyecto, las
//   plantillas su tipo de canal), la lista se agrupa y cada grupo tiene su
//   propia casilla para marcar todos los suyos.
// - Si se pasa `padreDe` (clasificaciones), la lista es un árbol: marcar una
//   hija marca también a su padre (y a los padres del padre); marcar un padre
//   NO marca a sus hijas, pero la fila del padre ofrece "Marcar sus hijas".
//   Desmarcar un padre desmarca a sus hijas.

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useT } from "@/lib/i18n";
import { campanias, proyectos } from "@/lib/mock-data";

export type Opcion = {
  id: string;
  nombre: string;
  grupo?: { id: string; nombre: string };
  /** Texto secundario (por ejemplo, el email de un usuario). */
  detalle?: string;
};

/** Ids de los padres de un elemento, del más cercano al más lejano. */
export function ancestros(id: string, padreDe: (id: string) => string | undefined): string[] {
  const res: string[] = [];
  let p = padreDe(id);
  while (p && !res.includes(p)) {
    res.push(p);
    p = padreDe(p);
  }
  return res;
}

/** Ids de las hijas de un elemento, a cualquier profundidad. */
export function descendientes(
  id: string,
  todos: string[],
  padreDe: (id: string) => string | undefined
): string[] {
  return todos.filter((x) => ancestros(x, padreDe).includes(id));
}

export function ListaSeleccionable({
  opciones,
  elegidos,
  onChange,
  placeholder,
  vacio,
  padreDe,
}: {
  opciones: Opcion[];
  elegidos: string[];
  onChange: (ids: string[]) => void;
  placeholder: string;
  vacio: string;
  padreDe?: (id: string) => string | undefined;
}) {
  const t = useT();
  const [consulta, setConsulta] = useState("");
  const q = consulta.trim().toLowerCase();
  // La búsqueda encuentra por el nombre del elemento o por el de su grupo
  // (buscar un proyecto trae todas sus campañas).
  const visibles = opciones.filter(
    (o) =>
      o.nombre.toLowerCase().includes(q) ||
      (o.detalle?.toLowerCase().includes(q) ?? false) ||
      (o.grupo?.nombre.toLowerCase().includes(q) ?? false)
  );
  const idsVisibles = [...new Set(visibles.map((o) => o.id))];
  const todosLosIds = opciones.map((o) => o.id);

  function estado(ids: string[]): boolean | "indeterminate" {
    const n = ids.filter((id) => elegidos.includes(id)).length;
    return n === 0 ? false : n === ids.length ? true : "indeterminate";
  }

  function marcar(ids: string[], v: boolean) {
    if (!padreDe) {
      onChange(v ? [...new Set([...elegidos, ...ids])] : elegidos.filter((id) => !ids.includes(id)));
      return;
    }
    if (v) {
      // Marcar una hija trae a su padre (solo si el padre se puede elegir acá).
      const conPadres = ids.flatMap((id) => [id, ...ancestros(id, padreDe)]).filter((id) => todosLosIds.includes(id));
      onChange([...new Set([...elegidos, ...conPadres])]);
    } else {
      // Desmarcar un padre desmarca a sus hijas.
      const conHijas = ids.flatMap((id) => [id, ...descendientes(id, todosLosIds, padreDe)]);
      onChange(elegidos.filter((id) => !conHijas.includes(id)));
    }
  }

  const fila = (o: Opcion, sangria: number, clave: string, extra?: React.ReactNode) => (
    <li key={clave}>
      <div
        className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted"
        style={{ paddingLeft: `${0.5 + sangria * 1.25}rem` }}
      >
        <label className="flex min-w-0 flex-1 items-center gap-2">
          <Checkbox
            checked={elegidos.includes(o.id)}
            onCheckedChange={(v) => marcar([o.id], v === true)}
          />
          {sangria > 0 && padreDe && <span className="text-muted-foreground">↳</span>}
          <span className="min-w-0 truncate">{o.nombre}</span>
          {o.detalle && <span className="truncate text-xs text-muted-foreground">{o.detalle}</span>}
        </label>
        {extra}
      </div>
    </li>
  );

  let contenido: React.ReactNode;
  if (padreDe) {
    // Árbol: raíces = sin padre o con el padre fuera de la lista.
    const ids = new Set(visibles.map((o) => o.id));
    const hijas = (id: string) => visibles.filter((o) => padreDe(o.id) === id);
    const render = (o: Opcion, nivel: number): React.ReactNode[] => {
      const susHijas = hijas(o.id);
      const extra =
        susHijas.length > 0 ? (
          <button
            type="button"
            className="shrink-0 text-xs text-primary hover:underline"
            onClick={() => marcar([o.id, ...descendientes(o.id, visibles.map((v) => v.id), padreDe)], true)}
          >
            {t("asignacion.marcarHijas", { n: susHijas.length })}
          </button>
        ) : undefined;
      return [fila(o, nivel, o.id, extra), ...susHijas.flatMap((h) => render(h, nivel + 1))];
    };
    contenido = visibles
      .filter((o) => {
        const p = padreDe(o.id);
        return !p || !ids.has(p);
      })
      .flatMap((o) => render(o, 0));
  } else if (opciones.some((o) => o.grupo)) {
    const grupos: { id: string; nombre: string; items: Opcion[] }[] = [];
    for (const o of visibles) {
      const g = o.grupo ?? { id: "", nombre: "" };
      let grupo = grupos.find((x) => x.id === g.id);
      if (!grupo) grupos.push((grupo = { ...g, items: [] }));
      grupo.items.push(o);
    }
    contenido = grupos.map((g) => {
      const ids = g.items.map((o) => o.id);
      return (
        <li key={g.id || "sin-grupo"}>
          {g.nombre ? (
            <label className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium hover:bg-muted">
              <Checkbox
                aria-label={t("asignacion.todosDelGrupo", { grupo: g.nombre })}
                checked={estado(ids)}
                onCheckedChange={(v) => marcar(ids, v === true)}
              />
              <span className="min-w-0 truncate">{g.nombre}</span>
              <span className="text-xs font-normal text-muted-foreground">({ids.length})</span>
            </label>
          ) : null}
          <ul className="flex flex-col gap-0.5">
            {g.items.map((o) => fila(o, g.nombre ? 1 : 0, `${g.id}:${o.id}`))}
          </ul>
        </li>
      );
    });
  } else {
    contenido = visibles.map((o) => fila(o, 0, o.id));
  }

  return (
    <div className="flex flex-col gap-2">
      <Input placeholder={placeholder} value={consulta} onChange={(e) => setConsulta(e.target.value)} />
      {idsVisibles.length > 1 && (
        <label className="flex items-center gap-2 px-1 text-sm">
          <Checkbox checked={estado(idsVisibles)} onCheckedChange={(v) => marcar(idsVisibles, v === true)} />
          {t("asignacion.seleccionarTodos", { n: idsVisibles.length })}
        </label>
      )}
      <ul className="flex max-h-60 flex-col gap-0.5 overflow-y-auto rounded-md p-1 ring-1 ring-foreground/10">
        {visibles.length === 0 && (
          <li className="px-2 py-3 text-center text-sm text-muted-foreground">{vacio}</li>
        )}
        {contenido}
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
