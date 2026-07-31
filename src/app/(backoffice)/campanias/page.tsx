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
import { campanias, proyectos, getProyecto, type Campania } from "@/lib/mock-data";

// La pantalla de Campañas es también la puerta de entrada a los proyectos:
// las campañas se agrupan por proyecto (no hay sección "Proyectos" en el
// sidenav — feedback de producto 2026-07-16) y cada grupo permite editar su
// proyecto. Las rutas /proyectos/* siguen existiendo.
export default function CampaniasPage() {
  const t = useT();
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
        Cell: ({ row }) => (
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
        Cell: ({ cell }) => (
          <span className="text-muted-foreground">
            {cell.getValue<number>()}
          </span>
        ),
      },
      {
        id: "cuentas",
        header: t("campanias.cuentasSalientes"),
        accessorFn: (campania) => campania.outboundAccountIds.length,
        Cell: ({ cell }) => (
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
          data={campanias}
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
            renderRowActions: ({ row }) => (
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
