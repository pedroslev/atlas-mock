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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  plantillas as plantillasIniciales,
  plantillaGrupos,
  variablesPlantilla,
  type Plantilla,
  type PlantillaGrupo,
  type VariablePlantilla,
} from "@/lib/mock-data";
import { useT } from "@/lib/i18n";
import { CanalBadges } from "@/components/plantillas/mensaje-renderizado";

function nombreSugerido(base: string, existentes: string[]) {
  if (!existentes.includes(base)) return base;
  let i = 2;
  while (existentes.includes(`${base} (${i})`)) i++;
  return `${base} (${i})`;
}

// Plantillas de mensajes (ATLAS-1191): mismo modelo que Clasificaciones y
// Marcas — solapa GRUPOS (lo que se asigna a una campaña) y solapa CATÁLOGO
// (el maestro de plantillas del tenant). Una plantilla puede estar en varios
// grupos. La plantilla se edita en pantalla propia (tiene editor, variables,
// adjuntos y vista previa: no entra en un modal).
export default function PlantillasPage() {
  const t = useT();
  const [items, setItems] = useState<Plantilla[]>(plantillasIniciales);
  const [grupos, setGrupos] = useState<PlantillaGrupo[]>(plantillaGrupos);
  const [grupoDialogOpen, setGrupoDialogOpen] = useState(false);
  const [grupoNombre, setGrupoNombre] = useState("");
  // Solapa VARIABLES: qué dato completa cada variable y qué se pone si falta
  // (una sola configuración para todas las plantillas del tenant).
  const [variables, setVariables] = useState<VariablePlantilla[]>(variablesPlantilla);

  const columnasGrupos = useMemo<MRT_ColumnDef<PlantillaGrupo>[]>(
    () => [
      {
        accessorKey: "nombre",
        header: t("plantillas.col.grupo"),
        Cell: ({ row }) => (
          <span className="flex flex-col">
            <Link
              href={`/plantillas/grupos/${row.original.id}`}
              className="font-medium hover:underline"
            >
              {row.original.nombre}
            </Link>
            {row.original.descripcion && (
              <span className="text-xs text-muted-foreground">
                {row.original.descripcion}
              </span>
            )}
          </span>
        ),
      },
      {
        id: "cantidad",
        header: t("plantillas.col.cantidad"),
        accessorFn: (grupo) => grupo.plantillaIds.length,
        Cell: ({ cell }) => (
          <span className="text-muted-foreground">
            {cell.getValue<number>()}
          </span>
        ),
      },
    ],
    [t]
  );

  const columnasCatalogo = useMemo<MRT_ColumnDef<Plantilla>[]>(
    () => [
      {
        accessorKey: "nombre",
        header: t("plantillas.col.plantilla"),
        Cell: ({ row }) => (
          <span className="flex flex-col">
            <Link
              href={`/plantillas/catalogo/${row.original.id}`}
              className="font-medium hover:underline"
            >
              {row.original.nombre}
            </Link>
            {row.original.descripcion && (
              <span className="text-xs text-muted-foreground">
                {row.original.descripcion}
              </span>
            )}
          </span>
        ),
      },
      {
        id: "canales",
        header: t("plantillas.col.canales"),
        accessorFn: (p) => p.canales.join(","),
        Cell: ({ row }) => <CanalBadges canales={row.original.canales} />,
      },
      {
        id: "adjuntos",
        header: t("plantillas.col.adjuntos"),
        accessorFn: (p) => p.adjuntos.length,
        Cell: ({ cell }) => (
          <span className="text-muted-foreground">
            {cell.getValue<number>() || "—"}
          </span>
        ),
      },
      {
        id: "estado",
        header: t("common.comunes.estado"),
        accessorFn: (p) => (p.activa ? "activa" : "inactiva"),
        Cell: ({ row }) =>
          row.original.activa ? (
            <Badge className="bg-success/15 text-success">{t("common.comunes.activo")}</Badge>
          ) : (
            <Badge variant="secondary">{t("common.comunes.inactivo")}</Badge>
          ),
      },
    ],
    [t]
  );

  const columnasVariables = useMemo<MRT_ColumnDef<VariablePlantilla>[]>(
    () => [
      {
        id: "variable",
        header: t("plantillas.variables.col.variable"),
        accessorFn: (v) => t(`plantillas.variable.${v.clave}`),
        Cell: ({ row }) => (
          <span className="flex items-center gap-2">
            <span className="font-medium">{t(`plantillas.variable.${row.original.clave}`)}</span>
            <Badge variant="outline" className="font-mono">{`{{${row.original.clave}}}`}</Badge>
          </span>
        ),
      },
      {
        id: "origen",
        header: t("plantillas.variables.col.origen"),
        accessorFn: (v) => t(`plantillas.origen.${v.origen}`),
      },
      {
        accessorKey: "ejemplo",
        header: t("plantillas.variables.col.ejemplo"),
        Cell: ({ cell }) => (
          <span className="text-muted-foreground">{cell.getValue<string>()}</span>
        ),
      },
      {
        id: "respaldo",
        header: t("plantillas.variables.col.respaldo"),
        accessorFn: (v) => v.respaldo ?? "",
        Cell: ({ row }) => (
          <Input
            value={row.original.respaldo ?? ""}
            placeholder={t("plantillas.variables.placeholderRespaldo")}
            aria-label={`${t("plantillas.variables.col.respaldo")}: ${t(`plantillas.variable.${row.original.clave}`)}`}
            onChange={(e) =>
              setVariables((prev) =>
                prev.map((v) =>
                  v.clave === row.original.clave
                    ? { ...v, respaldo: e.target.value === "" ? undefined : e.target.value }
                    : v
                )
              )
            }
            className="h-8 max-w-xs"
          />
        ),
      },
    ],
    [t]
  );

  function eliminarPlantilla(id: string) {
    setItems((prev) => prev.filter((p) => p.id !== id));
    setGrupos((prev) =>
      prev.map((g) => ({
        ...g,
        plantillaIds: g.plantillaIds.filter((pid) => pid !== id),
      }))
    );
  }

  function abrirNuevoGrupo() {
    setGrupoNombre(
      nombreSugerido(
        t("plantillas.nuevoGrupo"),
        grupos.map((g) => g.nombre)
      )
    );
    setGrupoDialogOpen(true);
  }

  function crearGrupo() {
    if (!grupoNombre.trim()) return;
    setGrupos((prev) => [
      ...prev,
      {
        id: `pg-${prev.length + 1}-${grupoNombre.trim().toLowerCase().replace(/\s+/g, "-")}`,
        nombre: grupoNombre.trim(),
        plantillaIds: [],
      },
    ]);
    setGrupoDialogOpen(false);
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("common.nav.plantillas")}
        description={t("plantillas.descripcion")}
      />

      <Tabs defaultValue="grupos" className="gap-4">
        <div className="flex items-center justify-between gap-3">
          <TabsList>
            <TabsTrigger value="grupos">{t("plantillas.tabs.grupos")}</TabsTrigger>
            <TabsTrigger value="catalogo">{t("plantillas.tabs.catalogo")}</TabsTrigger>
            <TabsTrigger value="variables">{t("plantillas.tabs.variables")}</TabsTrigger>
          </TabsList>
          <TabsContent value="grupos" className="contents">
            <Button onClick={abrirNuevoGrupo}>
              <Plus />
              {t("plantillas.nuevoGrupo")}
            </Button>
          </TabsContent>
          <TabsContent value="catalogo" className="contents">
            <Button variant="outline" asChild>
              <Link href="/plantillas/catalogo/nueva">
                <Plus />
                {t("plantillas.nuevaPlantilla")}
              </Link>
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
                      href: `/plantillas/grupos/${row.original.id}`,
                    },
                    {
                      label: t("common.acciones.eliminar"),
                      destructive: true,
                      separatorBefore: true,
                      confirmDescription: t("plantillas.eliminarGrupo"),
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

        <TabsContent value="catalogo">
          <MitrolTable
            columns={columnasCatalogo}
            data={items}
            options={{
              enableRowActions: true,
              renderRowActions: ({ row }) => (
                <RowActions
                  actions={[
                    {
                      label: t("common.acciones.editar"),
                      href: `/plantillas/catalogo/${row.original.id}`,
                    },
                    {
                      label: t("common.acciones.eliminar"),
                      destructive: true,
                      separatorBefore: true,
                      confirmDescription: t("plantillas.eliminarPlantilla"),
                      onSelect: () => eliminarPlantilla(row.original.id),
                    },
                  ]}
                />
              ),
            }}
          />
        </TabsContent>

        <TabsContent value="variables" className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">{t("plantillas.variables.descripcion")}</p>
          <MitrolTable columns={columnasVariables} data={variables} />
        </TabsContent>
      </Tabs>

      <Dialog open={grupoDialogOpen} onOpenChange={setGrupoDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("plantillas.dialogoGrupo.titulo")}</DialogTitle>
            <DialogDescription>
              {t("plantillas.dialogoGrupo.descripcion")}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="grupo-nombre">{t("common.comunes.nombre")}</Label>
            <Input
              id="grupo-nombre"
              value={grupoNombre}
              onChange={(e) => setGrupoNombre(e.target.value)}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGrupoDialogOpen(false)}>
              {t("common.acciones.cancelar")}
            </Button>
            <Button onClick={crearGrupo} disabled={!grupoNombre.trim()}>
              {t("plantillas.crearGrupo")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
