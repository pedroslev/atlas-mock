"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ActionTooltip } from "@/components/layout/action-tooltip";
import {
  AgregarVariosDialog,
  CasillaTodos,
  QuitarVarios,
} from "@/components/asignacion/agregar-varios";
import { marcadores, marcadorGrupos } from "@/lib/mock-data";
import { useT } from "@/lib/i18n";

// Membresía del grupo de bookmarks: agrega marcas EXISTENTES del pool
// (searchable, nunca duplica) y los quita del grupo sin borrarlos del pool.
// ATLAS-1353: agregar varias a la vez (con filtro por otro grupo) y quitar
// varias a la vez.
export function GrupoMarcadores({ grupoId, initialIds }: { grupoId: string; initialIds: string[] }) {
  const t = useT();
  const [ids, setIds] = useState<string[]>(initialIds);
  const [agregando, setAgregando] = useState(false);
  const [marcados, setMarcados] = useState<string[]>([]);

  const miembros = marcadores.filter((m) => ids.includes(m.id));
  const disponibles = marcadores.filter((m) => !ids.includes(m.id));

  function quitar(lista: string[]) {
    setIds((prev) => prev.filter((id) => !lista.includes(id)));
    setMarcados((m) => m.filter((id) => !lista.includes(id)));
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle>{t("marcas.miembros.titulo")}</CardTitle>
          <CardDescription>{t("marcas.miembros.descripcion")}</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <QuitarVarios
            nombres={miembros.filter((m) => marcados.includes(m.id)).map((m) => m.nombre)}
            onConfirmar={() => quitar(marcados)}
          />
          <Button variant="outline" onClick={() => setAgregando(true)}>
            <Plus />
            {t("marcas.miembros.agregar")}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-1.5">
        {miembros.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t("marcas.miembros.vacio")}
          </p>
        ) : (
          <CasillaTodos ids={miembros.map((m) => m.id)} marcados={marcados} onChange={setMarcados} />
        )}
        {miembros.map((m) => (
          <div
            key={m.id}
            className="flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm ring-1 ring-foreground/10"
          >
            <span className="flex min-w-0 items-center gap-2">
              <Checkbox
                aria-label={m.nombre}
                checked={marcados.includes(m.id)}
                onCheckedChange={(v) =>
                  setMarcados((prev) => (v === true ? [...prev, m.id] : prev.filter((id) => id !== m.id)))
                }
              />
              <span className="flex min-w-0 flex-col">
                <span className="truncate font-medium">{m.nombre}</span>
                {m.descripcion && (
                  <span className="truncate text-xs text-muted-foreground">
                    {m.descripcion}
                  </span>
                )}
              </span>
            </span>
            <ActionTooltip label={t("marcas.miembros.quitar")}>
              <button
                type="button"
                aria-label={t("marcas.miembros.quitarAria", {
                  nombre: m.nombre,
                })}
                onClick={() => quitar([m.id])}
                className="flex size-7 shrink-0 items-center justify-center rounded-lg text-destructive hover:bg-destructive/10"
              >
                <X className="size-3.5" />
              </button>
            </ActionTooltip>
          </div>
        ))}
      </CardContent>

      {agregando && (
        <AgregarVariosDialog
          titulo={t("marcas.miembros.agregar")}
          opciones={disponibles.map((m) => ({ id: m.id, nombre: m.nombre }))}
          filtros={[
            {
              id: "grupo",
              etiqueta: t("asignacion.filtroOtroGrupo"),
              textoTodos: t("asignacion.todosLosGrupos"),
              grupos: [
                {
                  opciones: marcadorGrupos
                    .filter((g) => g.id !== grupoId)
                    .map((g) => ({ value: g.id, label: g.nombre })),
                },
              ],
              pasa: (v, id) => marcadorGrupos.find((g) => g.id === v)?.marcadorIds.includes(id) ?? false,
            },
          ]}
          placeholder={t("marcas.miembros.buscar")}
          vacio={t("marcas.miembros.sinDisponibles")}
          onClose={() => setAgregando(false)}
          onAgregar={(nuevos) => {
            setIds((prev) => [...new Set([...prev, ...nuevos])]);
            setAgregando(false);
          }}
        />
      )}
    </Card>
  );
}
