"use client";

import { useMemo } from "react";
import Link from "next/link";
import { FolderKanban, Pencil, Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { RowActions } from "@/components/data-table/row-actions";
import {
  MitrolTable,
  type MRT_ColumnDef,
} from "@/components/data-table/mitrol-table";
import { Button } from "@/components/ui/button";
import { ActionTooltip } from "@/components/layout/action-tooltip";
import { useT } from "@/lib/i18n";
import {
  proyectos,
  getProyecto,
  defaultParametros,
  type Campania,
} from "@/lib/mock-data";
import { useCampanias } from "@/lib/campanias-store";

// La pantalla de Campañas es también la puerta de entrada a los proyectos:
// las campañas se agrupan por proyecto (no hay sección "Proyectos" en el
// sidenav — feedback de producto 2026-07-16) y cada grupo permite editar su
// proyecto. Las rutas /proyectos/* siguen existiendo.
// Un proyecto sin campañas seguiría sin aparecer en la tabla (se agrupa por
// las campañas que tiene), y es justo el único que se puede eliminar. Para que
// se pueda llegar a él, se suma una fila vacía por proyecto sin campañas.
const FILA_VACIA = "sin-campanias:";

function esFilaVacia(c: Campania) {
  return c.id.startsWith(FILA_VACIA);
}

export default function CampaniasPage() {
  const t = useT();
  const { campanias, eliminar } = useCampanias();

  const filas = useMemo<Campania[]>(() => {
    const vacios = proyectos
      .filter((p) => !campanias.some((c) => c.proyectoId === p.id))
      .map<Campania>((p) => ({
        id: `${FILA_VACIA}${p.id}`,
        nombre: "",
        proyectoId: p.id,
        usuariosAsignados: [],
        outboundAccountIds: [],
        parametros: defaultParametros(),
      }));
    return [...campanias, ...vacios];
  }, [campanias]);
  const columns = useMemo<MRT_ColumnDef<Campania>[]>(
    () => [
      {
        id: "proyecto",
        header: t("campanias.proyecto"),
        accessorFn: (campania) =>
          getProyecto(campania.proyectoId)?.nombre ??
          t("campanias.sinProyecto"),
        GroupedCell: ({ cell }) => {
          const nombre = cell.getValue<string>();
          const proyecto = proyectos.find((p) => p.nombre === nombre);
          return (
            <span className="inline-flex items-center gap-2 font-medium">
              <FolderKanban className="size-4 text-secondary" />
              {nombre}
              {proyecto && (
                <ActionTooltip label={t("campanias.editarProyecto")}>
                  <Link
                    href={`/proyectos/${proyecto.id}`}
                    aria-label={t("campanias.editarProyectoAria", { nombre })}
                    className="flex size-6 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  >
                    <Pencil className="size-3.5" />
                  </Link>
                </ActionTooltip>
              )}
            </span>
          );
        },
      },
      {
        accessorKey: "nombre",
        header: t("common.comunes.nombre"),
        Cell: ({ row }) =>
          esFilaVacia(row.original) ? (
            <span className="text-sm text-muted-foreground">
              {t("campanias.sinCampanias")}
            </span>
          ) : (
            <Link
              href={`/campanias/${row.original.id}`}
              className="font-medium hover:underline"
            >
              {row.original.nombre}
            </Link>
          ),
      },
      {
        id: "usuarios",
        header: t("campanias.usuariosAsignados"),
        accessorFn: (campania) => campania.usuariosAsignados.length,
        Cell: ({ cell, row }) =>
          esFilaVacia(row.original) ? null : (
            <span className="text-muted-foreground">
              {cell.getValue<number>()}
            </span>
          ),
      },
      {
        id: "cuentas",
        header: t("campanias.cuentasSalientes"),
        accessorFn: (campania) => campania.outboundAccountIds.length,
        Cell: ({ cell, row }) =>
          esFilaVacia(row.original) ? null : (
            <span className="text-muted-foreground">
              {cell.getValue<number>()}
            </span>
          ),
      },
    ],
    [t]
  );

  return (
    <div className="flex flex-col gap-6">
      <div data-tour="campanias-intro">
        <PageHeader
          title={t("campanias.titulo")}
          description={t("campanias.descripcion")}
          actions={
            <>
              <Button variant="outline" asChild>
                <Link href="/proyectos/nuevo">
                  <Plus />
                  {t("campanias.nuevoProyecto")}
                </Link>
              </Button>
              <Button asChild data-tour="campanias-nueva">
                <Link href="/campanias/nueva">
                  <Plus />
                  {t("campanias.nuevaCampania")}
                </Link>
              </Button>
            </>
          }
        />
      </div>

      <div data-tour="campanias-tabla">
        <MitrolTable
          columns={columns}
          data={filas}
          options={{
            enableGrouping: true,
            groupedColumnMode: "reorder",
            positionToolbarAlertBanner: "none",
            enableRowActions: true,
            initialState: {
              grouping: ["proyecto"],
              expanded: true,
              density: "compact",
              showGlobalFilter: true,
              pagination: { pageIndex: 0, pageSize: 25 },
            },
            renderRowActions: ({ row }) =>
              esFilaVacia(row.original) ? null : (
                <RowActions
                  actions={[
                    {
                      label: t("common.acciones.editar"),
                      href: `/campanias/${row.original.id}`,
                    },
                    {
                      label: t("campanias.accion.asignarUsuarios"),
                      href: `/campanias/${row.original.id}?tab=usuarios`,
                    },
                    { label: t("campanias.accion.duplicar") },
                    {
                      label: t("common.acciones.eliminar"),
                      destructive: true,
                      separatorBefore: true,
                      onSelect: () => eliminar(row.original.id),
                    },
                  ]}
                />
              ),
          }}
        />
      </div>
    </div>
  );
}
