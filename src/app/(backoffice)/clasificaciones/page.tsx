"use client";

import { useMemo, useState } from "react";
import type { MRT_RowSelectionState } from "material-react-table";
import { columnaGrupos, opcionesDeSeleccion } from "@/components/asignacion/catalogo";
import { AsignarAGruposDialog } from "@/components/asignacion/asignar-a-grupos";
import Link from "next/link";
import { Lock, Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { RowActions } from "@/components/data-table/row-actions";
import {
  MitrolTable,
  type MRT_ColumnDef,
} from "@/components/data-table/mitrol-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DialogConAviso } from "@/components/layout/aviso-cambios";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useT } from "@/lib/i18n";
import { MensajeRepetido } from "@/components/layout/campos-unicos";
import { seRepite } from "@/lib/campos-unicos";
import {
  clasificaciones as clasificacionesIniciales,
  clasificacionGrupos,
  type Clasificacion,
  type ClasificacionGrupo,
} from "@/lib/mock-data";
import {
  ClasificacionDialog,
  EFECTOS,
  TIPOS,
  efectoClave,
  efectoVariant,
  tipoClave,
} from "./clasificacion-dialog";

function nombreSugerido(base: string, existentes: string[]) {
  if (!existentes.includes(base)) return base;
  let i = 2;
  while (existentes.includes(`${base} (${i})`)) i++;
  return `${base} (${i})`;
}

// Cada tipo de clasificación se pinta con un tono distinto (feedback
// 2026-07-16: "distintos colores si son diferentes") — así se leen de un
// vistazo en la tabla. Los tonos salen de las variantes del Badge.
const tipoBadgeVariant: Record<
  Clasificacion["tipo"],
  "success" | "destructive" | "warning" | "neutral"
> = {
  Exitoso: "success",
  "No exitoso": "destructive",
  "No efectivo": "warning",
  Neutro: "neutral",
};

// Pantalla partida en dos (feedback 2026-07-16): arriba los GRUPOS de
// clasificaciones, abajo el POOL de clasificaciones del tenant. Una
// clasificación se crea una sola vez y se reutiliza en todos los grupos que
// haga falta (el DER lo permite: classifications_groups guarda solo ids —
// "Venta exitosa" puede ser cross a muchos grupos y campañas).
export default function ClasificacionesPage() {
  const t = useT();
  const [items, setItems] = useState<Clasificacion[]>(clasificacionesIniciales);
  // Las de sistema van en su propia solapa: no se agregan a grupos (aplican
  // solas en todas las campañas), así que no tienen lugar en el catálogo.
  const pool = items.filter((c) => !c.sistema);
  const deSistema = items.filter((c) => c.sistema);
  const [grupos, setGrupos] = useState<ClasificacionGrupo[]>(clasificacionGrupos);
  // Asignación masiva desde el catálogo (ATLAS-1353).
  const [seleccion, setSeleccion] = useState<MRT_RowSelectionState>({});
  const [accionGrupo, setAccionGrupo] = useState<"agregar" | "quitar" | null>(null);
  const gruposDeCatalogo = useMemo(
    () => grupos.map((g) => ({ id: g.id, nombre: g.nombre, ids: g.clasificacionIds })),
    [grupos]
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Clasificacion | null>(null);
  const [duplicando, setDuplicando] = useState<Clasificacion | null>(null);
  const [grupoDialogOpen, setGrupoDialogOpen] = useState(false);
  const [grupoNombre, setGrupoNombre] = useState("");
  const [grupoDescripcion, setGrupoDescripcion] = useState("");
  // Grupo de origen al duplicar: la copia apunta a las mismas clasificaciones del pool.
  const [grupoOrigen, setGrupoOrigen] = useState<ClasificacionGrupo | null>(null);
  const grupoRepetido = seRepite(grupoNombre, grupos.map((g) => g.nombre));

  const columnasGrupos = useMemo<MRT_ColumnDef<ClasificacionGrupo>[]>(
    () => [
      {
        accessorKey: "nombre",
        header: t("clasificaciones.col.grupo"),
        Cell: ({ row }) => (
          <Link
            href={`/clasificaciones/${row.original.id}`}
            className="font-medium hover:underline"
          >
            {row.original.nombre}
          </Link>
        ),
      },
      {
        id: "cantidad",
        header: t("clasificaciones.titulo"),
        accessorFn: (grupo) => grupo.clasificacionIds.length,
        Cell: ({ cell }) => (
          <span className="text-muted-foreground">
            {cell.getValue<number>()}
          </span>
        ),
      },
    ],
    [t]
  );

  const columnaEfecto = useMemo<MRT_ColumnDef<Clasificacion>>(
    () => ({
      accessorKey: "efecto",
      header: t("clasificaciones.col.efecto"),
      filterVariant: "select",
      filterSelectOptions: EFECTOS.map((efecto) => ({
        value: efecto,
        label: t(`clasificaciones.efecto.${efectoClave(efecto)}`),
      })),
      Cell: ({ row }) => (
        <Badge variant={efectoVariant[row.original.efecto]}>
          {t(`clasificaciones.efecto.${efectoClave(row.original.efecto)}`)}
        </Badge>
      ),
    }),
    [t]
  );

  const columnasPool = useMemo<MRT_ColumnDef<Clasificacion>[]>(
    () => [
      {
        accessorKey: "nombre",
        header: t("clasificaciones.col.clasificacion"),
        Cell: ({ row }) => (
          <span className="font-medium">
            {row.original.parentId && (
              <span className="text-muted-foreground">↳ </span>
            )}
            {row.original.nombre}
          </span>
        ),
      },
      {
        accessorKey: "tipo",
        header: t("clasificaciones.col.tipo"),
        filterVariant: "select",
        // El dato de mock-data está en castellano: el filtro se muestra
        // traducido pero sigue filtrando por el valor crudo.
        filterSelectOptions: TIPOS.map((tipo) => ({
          value: tipo,
          label: t(`clasificaciones.tipo.${tipoClave(tipo)}`),
        })),
        Cell: ({ row }) => (
          <Badge variant={tipoBadgeVariant[row.original.tipo]}>
            {t(`clasificaciones.tipo.${tipoClave(row.original.tipo)}`)}
          </Badge>
        ),
      },
      columnaEfecto,
      columnaGrupos<Clasificacion>(t, gruposDeCatalogo),
    ],
    [t, columnaEfecto, gruposDeCatalogo]
  );

  const columnasSistema = useMemo<MRT_ColumnDef<Clasificacion>[]>(
    () => [
      {
        accessorKey: "nombre",
        header: t("clasificaciones.col.clasificacion"),
        Cell: ({ row }) => (
          <span className="flex items-center gap-1.5 font-medium">
            <Lock className="size-3.5 text-muted-foreground" />
            {row.original.nombre}
          </span>
        ),
      },
      {
        id: "cuando",
        header: t("clasificaciones.sistema.cuando"),
        accessorFn: (c) => c.sistema?.explicacion ?? "",
        Cell: ({ cell }) => (
          <span className="text-muted-foreground">
            {cell.getValue<string>()}
          </span>
        ),
      },
      columnaEfecto,
    ],
    [t, columnaEfecto]
  );

  function guardarClasificacion(clasificacion: Clasificacion) {
    setItems((prev) => {
      const existe = prev.some((c) => c.id === clasificacion.id);
      return existe
        ? prev.map((c) => (c.id === clasificacion.id ? clasificacion : c))
        : [...prev, clasificacion];
    });
  }

  function eliminarClasificacion(id: string) {
    setItems((prev) => prev.filter((c) => c.id !== id && c.parentId !== id));
    setGrupos((prev) =>
      prev.map((g) => ({
        ...g,
        clasificacionIds: g.clasificacionIds.filter((cid) => cid !== id),
      }))
    );
  }

  function abrirDuplicarGrupo(grupo: ClasificacionGrupo) {
    setGrupoOrigen(grupo);
    setGrupoNombre(grupo.nombre);
    setGrupoDescripcion(grupo.descripcion ?? "");
    setGrupoDialogOpen(true);
  }

  function abrirNuevoGrupo() {
    setGrupoOrigen(null);
    setGrupoNombre(
      nombreSugerido(
        t("clasificaciones.nuevoGrupo"),
        grupos.map((g) => g.nombre)
      )
    );
    setGrupoDescripcion("");
    setGrupoDialogOpen(true);
  }

  function crearGrupo() {
    if (!grupoNombre.trim() || grupoRepetido) return;
    setGrupos((prev) => [
      ...prev,
      {
        id: `cg-${prev.length + 1}-${grupoNombre.trim().toLowerCase().replace(/\s+/g, "-")}`,
        nombre: grupoNombre.trim(),
        descripcion: grupoDescripcion.trim() || undefined,
        clasificacionIds: grupoOrigen?.clasificacionIds ?? [],
      },
    ]);
    setGrupoDialogOpen(false);
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("clasificaciones.titulo")}
        description={t("clasificaciones.descripcion")}
      />

      {/* Solapas en vez de dos tablas apiladas (feedback 2026-07-16): se ve
          una sola tabla por vez. La acción de alta de cada solapa queda a la
          derecha de la lista de tabs para no perderla. */}
      <Tabs defaultValue="grupos" className="gap-4">
        <div className="flex items-center justify-between gap-3">
          <TabsList>
            <TabsTrigger value="grupos">
              {t("clasificaciones.tab.grupos")}
            </TabsTrigger>
            <TabsTrigger value="pool">
              {t("clasificaciones.tab.catalogo")}
            </TabsTrigger>
            <TabsTrigger value="sistema">
              {t("clasificaciones.tab.sistema")}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="grupos" className="contents">
            <Button onClick={abrirNuevoGrupo}>
              <Plus />
              {t("clasificaciones.nuevoGrupo")}
            </Button>
          </TabsContent>
          <TabsContent value="pool" className="contents">
            <Button
              variant="outline"
              onClick={() => {
                setEditing(null);
                setDuplicando(null);
                setDialogOpen(true);
              }}
            >
              <Plus />
              {t("clasificaciones.nuevaClasificacion")}
            </Button>
          </TabsContent>
        </div>

        <TabsContent value="grupos">
          <MitrolTable
            columns={columnasGrupos}
            data={grupos}
            options={{
              enableRowActions: true,
              renderRowActions: ({ row }) => (
                <RowActions
                  actions={[
                    {
                      label: t("common.acciones.editar"),
                      href: `/clasificaciones/${row.original.id}`,
                    },
                    {
                      label: t("common.acciones.duplicar"),
                      onSelect: () => abrirDuplicarGrupo(row.original),
                    },
                    {
                      label: t("common.acciones.eliminar"),
                      destructive: true,
                      separatorBefore: true,
                      confirmDescription: t(
                        "clasificaciones.grupo.eliminarConfirm"
                      ),
                      onSelect: () =>
                        setGrupos((prev) =>
                          prev.filter((g) => g.id !== row.original.id)
                        ),
                    },
                  ]}
                />
              ),
            }}
          />
        </TabsContent>

        <TabsContent value="pool">
          <MitrolTable
            columns={columnasPool}
            data={pool}
            options={{
              ...opcionesDeSeleccion<Clasificacion>({ t, seleccion, setSeleccion, onAccion: setAccionGrupo }),
              enableRowActions: true,
              renderRowActions: ({ row }) => (
                <RowActions
                  actions={[
                    {
                      label: t("common.acciones.editar"),
                      onSelect: () => {
                        setEditing(row.original);
                        setDuplicando(null);
                        setDialogOpen(true);
                      },
                    },
                    {
                      label: t("common.acciones.duplicar"),
                      onSelect: () => {
                        setEditing(null);
                        setDuplicando(row.original);
                        setDialogOpen(true);
                      },
                    },
                    {
                      label: t("common.acciones.eliminar"),
                      destructive: true,
                      separatorBefore: true,
                      confirmDescription: t(
                        "clasificaciones.pool.eliminarConfirm"
                      ),
                      onSelect: () => eliminarClasificacion(row.original.id),
                    },
                  ]}
                />
              ),
            }}
          />
          {accionGrupo && (
            <AsignarAGruposDialog
              modo={accionGrupo}
              elementoIds={Object.keys(seleccion).filter((id) => seleccion[id])}
              nombreDe={(id) => pool.find((x) => x.id === id)?.nombre ?? id}
              todosLosIds={pool.map((x) => x.id)}
              grupos={gruposDeCatalogo}
                padreDe={(id) => pool.find((c) => c.id === id)?.parentId}
              onAplicar={(nuevos) =>
                setGrupos((prev) =>
                  prev.map((g) => ({ ...g, clasificacionIds: nuevos.find((n) => n.id === g.id)?.ids ?? g.clasificacionIds }))
                )
              }
              onClose={() => setAccionGrupo(null)}
            />
          )}
        </TabsContent>

        <TabsContent value="sistema" className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            {t("clasificaciones.sistema.intro")}
          </p>
          {/* Sólo consulta: no tienen nada editable. */}
          <MitrolTable columns={columnasSistema} data={deSistema} />
        </TabsContent>
      </Tabs>

      <ClasificacionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initial={editing}
        duplicarDe={duplicando}
        pool={pool}
        onSave={guardarClasificacion}
      />

      <DialogConAviso open={grupoDialogOpen} onOpenChange={setGrupoDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("clasificaciones.nuevoGrupo.titulo")}</DialogTitle>
            <DialogDescription>
              {t("clasificaciones.nuevoGrupo.descripcion")}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="grupo-nombre">{t("common.comunes.nombre")}</Label>
              <Input
                id="grupo-nombre"
                value={grupoNombre}
                onChange={(e) => setGrupoNombre(e.target.value)}
                placeholder={t("clasificaciones.nuevoGrupo.placeholder")}
                autoFocus
                aria-invalid={grupoRepetido}
              />
              {grupoRepetido && <MensajeRepetido />}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="grupo-descripcion">
                {t("common.comunes.descripcion")}
              </Label>
              <Textarea
                id="grupo-descripcion"
                value={grupoDescripcion}
                onChange={(e) => setGrupoDescripcion(e.target.value)}
                rows={2}
                placeholder={t("common.comunes.opcional")}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">
              {t("common.acciones.cancelar")}
            </Button>
            </DialogClose>
            <Button onClick={crearGrupo} disabled={!grupoNombre.trim() || grupoRepetido}>
              {t("clasificaciones.nuevoGrupo.crear")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogConAviso>
    </div>
  );
}
