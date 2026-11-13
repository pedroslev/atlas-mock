"use client";

// MOCK: agregar y quitar plantillas del grupo cambia solo el estado local.
// REAL: la pertenencia plantilla↔grupo es una relación muchos a muchos en olimpo-api; quitar una
// plantilla del grupo no la elimina del catálogo.

import { useState } from "react";
import Link from "next/link";
import { Plus, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AgregarVariosDialog,
  CasillaTodos,
  QuitarVarios,
} from "@/components/asignacion/agregar-varios";
import type { Opcion } from "@/components/asignacion/lista-seleccionable";
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
import { CanalBadges } from "@/components/plantillas/mensaje-renderizado";
import { plantillaGrupos, plantillas, type Plantilla } from "@/lib/mock-data";
import { useT } from "@/lib/i18n";

// Membresía del grupo: agrega plantillas EXISTENTES del catálogo (buscador,
// nunca duplica) y las quita del grupo sin borrarlas del catálogo. Mismo
// patrón que los grupos de marcas.
//
// ATLAS-1353: agregar varias a la vez, agrupadas por tipo de canal (Email,
// SMS, Mensajería) con una casilla por tipo y filtro por otro grupo, y quitar
// varias a la vez.
export function tipoDeCanal(p: Plantilla): "email" | "sms" | "mensajeria" {
  if (p.canales.includes("email")) return "email";
  if (p.canales.includes("sms")) return "sms";
  return "mensajeria";
}

export function opcionesDePlantillas(
  lista: Plantilla[],
  t: (k: string) => string
): Opcion[] {
  const orden = ["mensajeria", "email", "sms"] as const;
  return orden.flatMap((tipo) =>
    lista
      .filter((p) => tipoDeCanal(p) === tipo)
      .map((p) => ({ id: p.id, nombre: p.nombre, grupo: { id: tipo, nombre: t(`asignacion.canal.${tipo}`) } }))
  );
}

export function GrupoPlantillas({ grupoId, initialIds }: { grupoId: string; initialIds: string[] }) {
  const t = useT();
  const [ids, setIds] = useState<string[]>(initialIds);
  const [agregando, setAgregando] = useState(false);
  const [marcados, setMarcados] = useState<string[]>([]);

  function quitar(lista: string[]) {
    setIds((prev) => prev.filter((id) => !lista.includes(id)));
    setMarcados((m) => m.filter((id) => !lista.includes(id)));
  }

  const miembros = plantillas.filter((p) => ids.includes(p.id));
  const disponibles = plantillas.filter((p) => !ids.includes(p.id));

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle>{t("plantillas.miembros.titulo")}</CardTitle>
          <CardDescription>{t("plantillas.miembros.descripcion")}</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <QuitarVarios
            nombres={miembros.filter((p) => marcados.includes(p.id)).map((p) => p.nombre)}
            onConfirmar={() => quitar(marcados)}
          />
          <Button variant="outline" onClick={() => setAgregando(true)}>
            <Plus />
            {t("plantillas.miembros.agregar")}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-1.5">
        {miembros.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t("plantillas.miembros.vacio")}
          </p>
        ) : (
          <CasillaTodos ids={miembros.map((p) => p.id)} marcados={marcados} onChange={setMarcados} />
        )}
        {miembros.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm ring-1 ring-foreground/10"
          >
            <span className="flex min-w-0 items-start gap-2">
            <Checkbox
              className="mt-0.5"
              aria-label={p.nombre}
              checked={marcados.includes(p.id)}
              onCheckedChange={(v) =>
                setMarcados((prev) => (v === true ? [...prev, p.id] : prev.filter((id) => id !== p.id)))
              }
            />
            <span className="flex min-w-0 flex-col gap-1">
              <span className="flex items-center gap-2">
                <Link
                  href={`/plantillas/catalogo/${p.id}`}
                  className="truncate font-medium hover:underline"
                >
                  {p.nombre}
                </Link>
                {!p.activa && (
                  <Badge variant="secondary">{t("common.comunes.inactivo")}</Badge>
                )}
              </span>
              {p.descripcion && (
                <span className="truncate text-xs text-muted-foreground">
                  {p.descripcion}
                </span>
              )}
              <CanalBadges canales={p.canales} />
            </span>
            </span>
            <ActionTooltip label={t("plantillas.miembros.quitar")}>
              <button
                type="button"
                aria-label={t("plantillas.miembros.quitarAria", { nombre: p.nombre })}
                onClick={() => quitar([p.id])}
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
          titulo={t("plantillas.miembros.agregar")}
          opciones={opcionesDePlantillas(disponibles, t)}
          filtros={[
            {
              id: "grupo",
              etiqueta: t("asignacion.filtroOtroGrupo"),
              textoTodos: t("asignacion.todosLosGrupos"),
              grupos: [
                {
                  opciones: plantillaGrupos
                    .filter((g) => g.id !== grupoId)
                    .map((g) => ({ value: g.id, label: g.nombre })),
                },
              ],
              pasa: (v, id) => plantillaGrupos.find((g) => g.id === v)?.plantillaIds.includes(id) ?? false,
            },
          ]}
          placeholder={t("plantillas.miembros.buscar")}
          vacio={t("plantillas.miembros.sinDisponibles")}
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
