"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useT } from "@/lib/i18n";
import {
  clasificaciones as clasificacionesIniciales,
  clasificacionGrupos,
  type Clasificacion,
  type ClasificacionGrupo,
} from "@/lib/mock-data";
import { ClasificacionDialog, TIPOS, tipoClave } from "./clasificacion-dialog";

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
  const [grupos, setGrupos] = useState<ClasificacionGrupo[]>(clasificacionGrupos);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Clasificacion | null>(null);
  const [grupoDialogOpen, setGrupoDialogOpen] = useState(false);
  const [grupoNombre, setGrupoNombre] = useState("");
  const [grupoDescripcion, setGrupoDescripcion] = useState("");

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
    ],
    [t]
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

  function abrirNuevoGrupo() {
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
    if (!grupoNombre.trim()) return;
    setGrupos((prev) => [
      ...prev,
      {
        id: `cg-${prev.length + 1}-${grupoNombre.trim().toLowerCase().replace(/\s+/g, "-")}`,
        nombre: grupoNombre.trim(),
        descripcion: grupoDescripcion.trim() || undefined,
        clasificacionIds: [],
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
            data={items}
            options={{
              enableRowActions: true,
              renderRowActions: ({ row }) => (
                <RowActions
                  actions={[
                    {
                      label: t("common.acciones.editar"),
                      onSelect: () => {
                        setEditing(row.original);
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
        </TabsContent>
      </Tabs>

      <ClasificacionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initial={editing}
        pool={items}
        onSave={guardarClasificacion}
      />

      <Dialog open={grupoDialogOpen} onOpenChange={setGrupoDialogOpen}>
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
                autoFocus
              />
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
            <Button variant="outline" onClick={() => setGrupoDialogOpen(false)}>
              {t("common.acciones.cancelar")}
            </Button>
            <Button onClick={crearGrupo} disabled={!grupoNombre.trim()}>
              {t("clasificaciones.nuevoGrupo.crear")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
