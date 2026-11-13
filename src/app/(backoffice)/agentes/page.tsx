"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown, Plus } from "lucide-react";
import type { MRT_RowSelectionState } from "material-react-table";
import { PageHeader } from "@/components/layout/page-header";
import { RowActions } from "@/components/data-table/row-actions";
import {
  MitrolTable,
  type MRT_ColumnDef,
} from "@/components/data-table/mitrol-table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { useT } from "@/lib/i18n";
import {
  agentes,
  getCampaniasDeUsuario,
  getGruposDeUsuario,
  partirNombre,
  type Agente,
} from "@/lib/mock-data";
import { useVersionAsignaciones } from "@/lib/asignacion-masiva";
import {
  DialogoAccionMasiva,
  DialogoCopiar,
  type AccionMasiva,
} from "./acciones-masivas";
import {
  FiltroPertenencia,
  describirPertenencia,
  filtrarPertenencia,
  type ValorPertenencia,
} from "./filtro-pertenencia";

function iniciales(nombre: string) {
  return nombre
    .split(" ")
    .map((n) => n[0])
    .join("");
}

/** Etiquetas de grupos o campañas: muestra las dos primeras y "+N" con el resto. */
function Etiquetas({ nombres }: { nombres: string[] }) {
  if (nombres.length === 0) return <span className="text-muted-foreground">—</span>;
  const visibles = nombres.slice(0, 2);
  const resto = nombres.slice(2);
  return (
    <div className="flex flex-wrap items-center gap-1">
      {visibles.map((n) => (
        <Badge key={n} variant="outline">{n}</Badge>
      ))}
      {resto.length > 0 && (
        <HoverCard>
          <HoverCardTrigger asChild>
            <Badge variant="secondary" className="cursor-default">+{resto.length}</Badge>
          </HoverCardTrigger>
          <HoverCardContent className="flex w-auto max-w-72 flex-wrap gap-1">
            {resto.map((n) => (
              <Badge key={n} variant="outline">{n}</Badge>
            ))}
          </HoverCardContent>
        </HoverCard>
      )}
    </div>
  );
}

export default function AgentesPage() {
  const t = useT();
  const version = useVersionAsignaciones();
  const [seleccion, setSeleccion] = useState<MRT_RowSelectionState>({});
  const [accion, setAccion] = useState<AccionMasiva | null>(null);

  // MOCK: los datos de ejemplo se modifican en memoria; una copia nueva en
  // cada cambio hace que la tabla se redibuje.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const data = useMemo(() => [...agentes], [version]);

  const columns = useMemo<MRT_ColumnDef<Agente>[]>(
    () => [
      {
        accessorKey: "nombre",
        header: t("usuarios.usuario"),
        Cell: ({ row }) => {
          const agente = row.original;
          const grupos = getGruposDeUsuario(agente.id);
          return (
            <HoverCard>
              <HoverCardTrigger asChild>
                <Link
                  href={`/agentes/${agente.id}`}
                  className="flex w-fit items-center gap-2 font-medium hover:underline"
                >
                  <Avatar className="size-7">
                    <AvatarFallback className="text-xs">
                      {iniciales(agente.nombre)}
                    </AvatarFallback>
                  </Avatar>
                  {agente.nombre}
                </Link>
              </HoverCardTrigger>
              <HoverCardContent>
                <div className="flex items-center gap-3">
                  <Avatar className="size-9">
                    <AvatarFallback>{iniciales(agente.nombre)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-medium">{agente.nombre}</span>
                    <span className="text-xs text-muted-foreground">
                      {agente.email}
                    </span>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-1">
                  <Badge variant={agente.habilitado ? "default" : "neutral"}>
                    {agente.habilitado
                      ? t("usuarios.habilitado")
                      : t("usuarios.deshabilitado")}
                  </Badge>
                  {grupos.map((g) => (
                    <Badge key={g.id} variant="outline">
                      {g.nombre}
                    </Badge>
                  ))}
                </div>
              </HoverCardContent>
            </HoverCard>
          );
        },
      },
      {
        id: "nombres",
        header: t("usuarios.form.nombres"),
        accessorFn: (a) => partirNombre(a.nombre)[0],
      },
      {
        id: "apellidos",
        header: t("usuarios.form.apellidos"),
        accessorFn: (a) => partirNombre(a.nombre)[1],
      },
      {
        accessorKey: "email",
        header: t("usuarios.email"),
        Cell: ({ cell }) => (
          <span className="text-muted-foreground">{cell.getValue<string>()}</span>
        ),
      },
      {
        id: "estado",
        header: t("common.comunes.estado"),
        accessorFn: (agente) =>
          agente.habilitado
            ? t("usuarios.habilitado")
            : t("usuarios.deshabilitado"),
        filterVariant: "select",
        // Opciones explícitas: sin ellas el desplegable del filtro salía vacío.
        filterSelectOptions: [t("usuarios.habilitado"), t("usuarios.deshabilitado")],
        filterFn: "equals",
        Cell: ({ row }) => (
          <Badge variant={row.original.habilitado ? "default" : "neutral"}>
            {row.original.habilitado
              ? t("usuarios.habilitado")
              : t("usuarios.deshabilitado")}
          </Badge>
        ),
      },
      {
        id: "grupos",
        header: t("usuarios.masivo.colGrupos"),
        // El texto sirve para la búsqueda general; el filtro de la cabecera
        // usa los ids (filtrarPertenencia).
        accessorFn: (a) => getGruposDeUsuario(a.id).map((g) => g.nombre).join(", "),
        filterFn: (row, _id, valor) =>
          filtrarPertenencia(getGruposDeUsuario(row.original.id).map((g) => g.id), valor),
        Filter: ({ column }) => <FiltroPertenencia column={column} tipo="grupos" />,
        meta: { formatoFiltro: (v: unknown) => describirPertenencia(v as ValorPertenencia, "grupos", t) },
        Cell: ({ row }) => (
          <Etiquetas nombres={getGruposDeUsuario(row.original.id).map((g) => g.nombre)} />
        ),
      },
      {
        id: "campanias",
        header: t("usuarios.masivo.colCampanias"),
        accessorFn: (a) => getCampaniasDeUsuario(a.id).map((c) => c.nombre).join(", "),
        filterFn: (row, _id, valor) =>
          filtrarPertenencia(getCampaniasDeUsuario(row.original.id).map((c) => c.id), valor),
        Filter: ({ column }) => <FiltroPertenencia column={column} tipo="campanias" />,
        meta: { formatoFiltro: (v: unknown) => describirPertenencia(v as ValorPertenencia, "campanias", t) },
        Cell: ({ row }) => (
          <Etiquetas nombres={getCampaniasDeUsuario(row.original.id).map((c) => c.nombre)} />
        ),
      },
    ],
    [t]
  );

  const seleccionados = Object.keys(seleccion).filter((id) => seleccion[id]);
  const cerrar = () => setAccion(null);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("common.nav.usuarios")}
        description={t("usuarios.descripcion")}
        actions={
          <Button asChild>
            <Link href="/agentes/nuevo">
              <Plus />
              {t("usuarios.nuevo")}
            </Link>
          </Button>
        }
      />

      <MitrolTable
        columns={columns}
        data={data}
        options={{
          getRowId: (a) => a.id,
          // Grupos y Campañas filtran con un valor compuesto ("está en" /
          // "no está en" + lista): el aviso del filtro activo no lo muestra.
          localization: { filteringByColumn: t("usuarios.masivo.filtroActivo") },
          // Filtro desde la cabecera de cada columna (ícono en el título).
          columnFilterDisplayMode: "popover",
          enableRowSelection: true,
          // La casilla de la cabecera selecciona todos los que cumplen los
          // filtros, no solo los que se ven en pantalla.
          selectAllMode: "all",
          positionToolbarAlertBanner: "none",
          state: { rowSelection: seleccion },
          onRowSelectionChange: setSeleccion,
          initialState: {
            // Columnas por defecto: las mismas de siempre. El resto se suma
            // desde el botón de columnas de la barra.
            columnVisibility: {
              nombres: false,
              apellidos: false,
              grupos: false,
              campanias: false,
            },
          },
          renderTopToolbarCustomActions: ({ table }) => {
            const filtrados = table.getFilteredRowModel().rows.map((r) => r.id);
            const ocultos = seleccionados.filter((id) => !filtrados.includes(id)).length;
            return (
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className="text-muted-foreground">
                  {t("usuarios.masivo.conteo", { n: filtrados.length, total: data.length })}
                </span>
                {seleccionados.length > 0 && (
                  <>
                    <span className="font-medium">
                      {t("usuarios.masivo.seleccionadosCorto", { n: seleccionados.length })}
                      {ocultos > 0 && (
                        <span className="font-normal text-amber-600 dark:text-amber-400">
                          {" "}
                          {t("usuarios.masivo.ocultos", { n: ocultos })}
                        </span>
                      )}
                    </span>
                    <Button variant="link" size="sm" className="h-auto p-0" onClick={() => setSeleccion({})}>
                      {t("usuarios.masivo.quitarSeleccion")}
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm">
                          {t("usuarios.masivo.acciones", { n: seleccionados.length })}
                          <ChevronDown />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-64">
                        <DropdownMenuGroup>
                          <DropdownMenuLabel>{t("usuarios.masivo.colCampanias")}</DropdownMenuLabel>
                          <DropdownMenuItem onSelect={() => setAccion("campanias-agregar")}>
                            {t("usuarios.masivo.titulo.campanias-agregar")}
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => setAccion("campanias-quitar")}>
                            {t("usuarios.masivo.titulo.campanias-quitar")}
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                          <DropdownMenuLabel>{t("usuarios.masivo.colGrupos")}</DropdownMenuLabel>
                          <DropdownMenuItem onSelect={() => setAccion("grupos-agregar")}>
                            {t("usuarios.masivo.titulo.grupos-agregar")}
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => setAccion("grupos-quitar")}>
                            {t("usuarios.masivo.titulo.grupos-quitar")}
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onSelect={() => setAccion("copiar")}>
                          {t("usuarios.masivo.titulo.copiar")}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                          <DropdownMenuLabel>{t("common.comunes.estado")}</DropdownMenuLabel>
                          <DropdownMenuItem onSelect={() => setAccion("habilitar")}>
                            {t("usuarios.acciones.habilitar")}
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => setAccion("deshabilitar")}>
                            {t("usuarios.acciones.deshabilitar")}
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                )}
              </div>
            );
          },
          enableRowActions: true,
          renderRowActions: ({ row }) => (
            <RowActions
              actions={[
                {
                  label: t("common.acciones.editar"),
                  href: `/agentes/${row.original.id}`,
                },
                {
                  label: t("common.acciones.duplicar"),
                  href: `/agentes/nuevo?duplicar=${row.original.id}`,
                },
                {
                  label: row.original.habilitado
                    ? t("usuarios.acciones.deshabilitar")
                    : t("usuarios.acciones.habilitar"),
                  separatorBefore: true,
                },
                {
                  label: t("common.acciones.eliminar"),
                  destructive: true,
                  disabled: row.original.habilitado,
                  separatorBefore: true,
                  confirmDescription: row.original.habilitado
                    ? t("usuarios.eliminar.bloqueado")
                    : t("usuarios.eliminar.permanente"),
                },
              ]}
            />
          ),
        }}
      />

      {accion === "copiar" && (
        <DialogoCopiar usuarioIds={seleccionados} onClose={cerrar} />
      )}
      {accion && accion !== "copiar" && (
        <DialogoAccionMasiva accion={accion} usuarioIds={seleccionados} onClose={cerrar} />
      )}
    </div>
  );
}
