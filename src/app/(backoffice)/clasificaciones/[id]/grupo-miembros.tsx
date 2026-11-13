"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
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
  AgregarVariosDialog,
  CasillaTodos,
  QuitarVarios,
} from "@/components/asignacion/agregar-varios";
import { ancestros, descendientes } from "@/components/asignacion/lista-seleccionable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ActionTooltip } from "@/components/layout/action-tooltip";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { clasificaciones, clasificacionGrupos, type Clasificacion } from "@/lib/mock-data";
import { tipoClave } from "../clasificacion-dialog";

// Un tono distinto por tipo (feedback 2026-07-16: "distintos colores si son
// diferentes"), consistente con el pool de /clasificaciones.
const tipoVariant: Record<
  string,
  "success" | "destructive" | "warning" | "neutral"
> = {
  Exitoso: "success",
  "No exitoso": "destructive",
  "No efectivo": "warning",
  Neutro: "neutral",
};

// Membresía del grupo: agrega clasificaciones EXISTENTES del pool (searchable,
// nunca duplica la entidad) y las quita del grupo sin borrarlas del pool —
// una clasificación como "Venta exitosa" es cross a muchos grupos (DER:
// classifications_groups.classifications guarda solo uuids). Las altas o
// ediciones de una clasificación se hacen desde /clasificaciones (el pool).
//
// ATLAS-1353: agregar varias a la vez y quitar varias a la vez. Regla de
// padres: agregar una hija trae siempre a su padre; agregar un padre no trae a
// sus hijas, pero se pueden marcar con "Marcar sus hijas". Quitar un padre
// quita también a sus hijas (una hija no queda en el grupo sin su padre).
const padreDe = (id: string) => clasificaciones.find((c) => c.id === id)?.parentId;

export function GrupoMiembros({ grupoId, initialIds }: { grupoId: string; initialIds: string[] }) {
  const t = useT();
  const [ids, setIds] = useState<string[]>(initialIds);
  const [agregando, setAgregando] = useState(false);
  const [marcados, setMarcados] = useState<string[]>([]);
  // Quitar con la ✕ un padre que tiene hijas en el grupo pide confirmación.
  const [padreAQuitar, setPadreAQuitar] = useState<string | null>(null);

  // Quitar se lleva también a las hijas que estén en el grupo.
  const conHijas = (quitar: string[]) => [
    ...new Set(quitar.flatMap((id) => [id, ...descendientes(id, ids, padreDe)])),
  ];
  function quitar(lista: string[]) {
    const todas = conHijas(lista);
    setIds((prev) => prev.filter((id) => !todas.includes(id)));
    setMarcados((m) => m.filter((id) => !todas.includes(id)));
  }
  const hijasExtra = conHijas(marcados).filter((id) => !marcados.includes(id));
  // Padre con hijas en el catálogo pero ninguna en el grupo.
  const sinSusHijas = (c: Clasificacion) =>
    clasificaciones.some((h) => h.parentId === c.id) && !ids.some((id) => padreDe(id) === c.id);

  const miembros = clasificaciones.filter((c) => ids.includes(c.id));
  // Las de sistema no van en grupos: aplican solas en todas las campañas.
  const disponibles = clasificaciones.filter(
    (c) => !ids.includes(c.id) && !c.sistema
  );
  const raices = miembros.filter((c) => !c.parentId);
  const hijosDe = (padreId: string) =>
    miembros.filter((c) => c.parentId === padreId);

  function fila(c: Clasificacion, hija: boolean) {
    return (
      <div
        key={c.id}
        className={cn(
          "flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm ring-1 ring-foreground/10",
          hija && "ml-6"
        )}
      >
        <span className="flex min-w-0 items-center gap-2">
          <Checkbox
            aria-label={c.nombre}
            checked={marcados.includes(c.id)}
            onCheckedChange={(v) =>
              setMarcados((prev) => (v === true ? [...prev, c.id] : prev.filter((id) => id !== c.id)))
            }
          />
          {hija && <span className="text-muted-foreground">↳</span>}
          <span className="truncate font-medium">{c.nombre}</span>
          <Badge variant={tipoVariant[c.tipo]}>
            {t(`clasificaciones.tipo.${tipoClave(c.tipo)}`)}
          </Badge>
          {/* Un padre puede ser el resultado final, así que puede quedar solo
              en el grupo; se avisa para que no sea un descuido. */}
          {sinSusHijas(c) && (
            <span className="truncate text-xs text-amber-600 dark:text-amber-400">
              {t("clasificaciones.miembros.padreSinHijas")}
            </span>
          )}
        </span>
        <ActionTooltip label={t("clasificaciones.miembros.quitar")}>
          <button
            type="button"
            aria-label={t("clasificaciones.miembros.quitarAria", {
              nombre: c.nombre,
            })}
            onClick={() => (conHijas([c.id]).length > 1 ? setPadreAQuitar(c.id) : quitar([c.id]))}
            className="flex size-7 shrink-0 items-center justify-center rounded-lg text-destructive hover:bg-destructive/10"
          >
            <X className="size-3.5" />
          </button>
        </ActionTooltip>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle>{t("clasificaciones.miembros.titulo")}</CardTitle>
          <CardDescription>
            {t("clasificaciones.miembros.descripcion")}{" "}
            {t("clasificaciones.miembros.sistemaNota")}
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <QuitarVarios
            nombres={miembros.filter((c) => marcados.includes(c.id)).map((c) => c.nombre)}
            extra={
              hijasExtra.length > 0
                ? t("asignacion.quitarHijas", {
                    nombres: clasificaciones.filter((c) => hijasExtra.includes(c.id)).map((c) => c.nombre).join(", "),
                  })
                : undefined
            }
            onConfirmar={() => quitar(marcados)}
          />
          <Button variant="outline" onClick={() => setAgregando(true)}>
            <Plus />
            {t("clasificaciones.miembros.agregar")}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-1.5">
        {miembros.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t("clasificaciones.miembros.vacio")}
          </p>
        ) : (
          <CasillaTodos ids={miembros.map((c) => c.id)} marcados={marcados} onChange={setMarcados} />
        )}
        {raices.map((raiz) => (
          <div key={raiz.id} className="flex flex-col gap-1.5">
            {fila(raiz, false)}
            {hijosDe(raiz.id).map((hijo) => fila(hijo, true))}
          </div>
        ))}
        {/* Hijas cuyo padre no está en el grupo se muestran al nivel raíz. */}
        {miembros
          .filter((c) => c.parentId && !ids.includes(c.parentId))
          .map((c) => fila(c, false))}
      </CardContent>

      <Dialog open={padreAQuitar !== null} onOpenChange={(o) => !o && setPadreAQuitar(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {t("asignacion.quitarTitulo", { n: 1 })}
            </DialogTitle>
            <DialogDescription>
              {clasificaciones.find((c) => c.id === padreAQuitar)?.nombre}
            </DialogDescription>
          </DialogHeader>
          <p className="text-sm text-destructive">
            {t("asignacion.quitarHijas", {
              nombres: clasificaciones
                .filter((c) => padreAQuitar && conHijas([padreAQuitar]).includes(c.id) && c.id !== padreAQuitar)
                .map((c) => c.nombre)
                .join(", "),
            })}
          </p>
          <p className="text-sm text-muted-foreground">{t("asignacion.quitarAyuda")}</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPadreAQuitar(null)}>
              {t("common.acciones.cancelar")}
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (padreAQuitar) quitar([padreAQuitar]);
                setPadreAQuitar(null);
              }}
            >
              {t("asignacion.quitarN", { n: 1 })}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {agregando && (
        <AgregarVariosDialog
          titulo={t("clasificaciones.miembros.agregar")}
          descripcion={t("clasificaciones.miembros.agregarAyuda")}
          opciones={disponibles.map((c) => ({ id: c.id, nombre: c.nombre }))}
          padreDe={padreDe}
          filtros={[
            {
              id: "grupo",
              etiqueta: t("asignacion.filtroOtroGrupo"),
              textoTodos: t("asignacion.todosLosGrupos"),
              grupos: [
                {
                  opciones: clasificacionGrupos
                    .filter((g) => g.id !== grupoId)
                    .map((g) => ({ value: g.id, label: g.nombre })),
                },
              ],
              pasa: (v, id) => clasificacionGrupos.find((g) => g.id === v)?.clasificacionIds.includes(id) ?? false,
            },
          ]}
          placeholder={t("clasificaciones.campo.buscar")}
          vacio={t("clasificaciones.miembros.sinDisponibles")}
          onClose={() => setAgregando(false)}
          onAgregar={(nuevos) => {
            // La hija trae siempre a su padre, aunque el filtro lo haya dejado afuera.
            const conPadres = nuevos.flatMap((id) => [id, ...ancestros(id, padreDe)]);
            setIds((prev) => [...new Set([...prev, ...conPadres])]);
            setAgregando(false);
          }}
        />
      )}
    </Card>
  );
}
