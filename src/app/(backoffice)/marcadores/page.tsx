"use client";

import { useMemo, useState } from "react";
import type { MRT_RowSelectionState } from "material-react-table";
import { columnaGrupos, opcionesDeSeleccion } from "@/components/asignacion/catalogo";
import { AsignarAGruposDialog } from "@/components/asignacion/asignar-a-grupos";
import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { RowActions } from "@/components/data-table/row-actions";
import {
  MitrolTable,
  type MRT_ColumnDef,
} from "@/components/data-table/mitrol-table";
import { Button } from "@/components/ui/button";
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
  marcadores as marcadoresIniciales,
  marcadorGrupos,
  type Marcador,
  type MarcadorGrupo,
} from "@/lib/mock-data";
import { useT } from "@/lib/i18n";
import { MarcadorDialog } from "./marcador-dialog";
import { MensajeRepetido } from "@/components/layout/campos-unicos";
import { seRepite } from "@/lib/campos-unicos";

function nombreSugerido(base: string, existentes: string[]) {
  if (!existentes.includes(base)) return base;
  let i = 2;
  while (existentes.includes(`${base} (${i})`)) i++;
  return `${base} (${i})`;
}

// Pantalla partida en dos, igual que Clasificaciones (feedback 2026-07-16):
// arriba los GRUPOS de bookmarks, abajo el POOL de marcas del tenant —
// una misma marca puede usarse en varios grupos (DER: bookmark_groups
// guarda solo uuids).
export default function MarcadoresPage() {
  const t = useT();
  const [items, setItems] = useState<Marcador[]>(marcadoresIniciales);
  const [grupos, setGrupos] = useState<MarcadorGrupo[]>(marcadorGrupos);
  // Asignación masiva desde el catálogo (ATLAS-1353).
  const [seleccion, setSeleccion] = useState<MRT_RowSelectionState>({});
  const [accionGrupo, setAccionGrupo] = useState<"agregar" | "quitar" | null>(null);
  const gruposDeCatalogo = useMemo(
    () => grupos.map((g) => ({ id: g.id, nombre: g.nombre, ids: g.marcadorIds })),
    [grupos]
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Marcador | null>(null);
  const [duplicando, setDuplicando] = useState<Marcador | null>(null);
  const [grupoDialogOpen, setGrupoDialogOpen] = useState(false);
  const [grupoNombre, setGrupoNombre] = useState("");
  // Grupo de origen al duplicar: la copia apunta a las mismas marcas del pool.
  const [grupoOrigen, setGrupoOrigen] = useState<MarcadorGrupo | null>(null);
  const grupoRepetido = seRepite(grupoNombre, grupos.map((g) => g.nombre));

  const columnasGrupos = useMemo<MRT_ColumnDef<MarcadorGrupo>[]>(
    () => [
      {
        accessorKey: "nombre",
        header: t("marcas.col.grupo"),
        Cell: ({ row }) => (
          <Link
            href={`/marcadores/${row.original.id}`}
            className="font-medium hover:underline"
          >
            {row.original.nombre}
          </Link>
        ),
      },
      {
        id: "cantidad",
        header: t("common.nav.marcas"),
        accessorFn: (grupo) => grupo.marcadorIds.length,
        Cell: ({ cell }) => (
          <span className="text-muted-foreground">
            {cell.getValue<number>()}
          </span>
        ),
      },
    ],
    [t]
  );

  const columnasPool = useMemo<MRT_ColumnDef<Marcador>[]>(
    () => [
      {
        accessorKey: "nombre",
        header: t("marcas.col.marca"),
        Cell: ({ row }) => (
          <span className="font-medium">{row.original.nombre}</span>
        ),
      },
      {
        accessorKey: "descripcion",
        header: t("common.comunes.descripcion"),
        Cell: ({ cell }) => (
          <span className="text-muted-foreground">
            {cell.getValue<string>() ?? "—"}
          </span>
        ),
      },
      columnaGrupos<Marcador>(t, gruposDeCatalogo),
    ],
    [t, gruposDeCatalogo]
  );

  function guardarMarcador(marcador: Marcador) {
    setItems((prev) => {
      const existe = prev.some((m) => m.id === marcador.id);
      return existe
        ? prev.map((m) => (m.id === marcador.id ? marcador : m))
        : [...prev, marcador];
    });
  }

  function eliminarMarcador(id: string) {
    setItems((prev) => prev.filter((m) => m.id !== id));
    setGrupos((prev) =>
      prev.map((g) => ({
        ...g,
        marcadorIds: g.marcadorIds.filter((mid) => mid !== id),
      }))
    );
  }

  function abrirDuplicarGrupo(grupo: MarcadorGrupo) {
    setGrupoOrigen(grupo);
    setGrupoNombre(grupo.nombre);
    setGrupoDialogOpen(true);
  }

  function abrirNuevoGrupo() {
    setGrupoOrigen(null);
    setGrupoNombre(
      nombreSugerido(
        t("marcas.nuevoGrupo"),
        grupos.map((g) => g.nombre)
      )
    );
    setGrupoDialogOpen(true);
  }

  function crearGrupo() {
    if (!grupoNombre.trim() || grupoRepetido) return;
    setGrupos((prev) => [
      ...prev,
      {
        id: `bg-${prev.length + 1}-${grupoNombre.trim().toLowerCase().replace(/\s+/g, "-")}`,
        nombre: grupoNombre.trim(),
        marcadorIds: grupoOrigen?.marcadorIds ?? [],
      },
    ]);
    setGrupoDialogOpen(false);
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("common.nav.marcas")}
        description={t("marcas.descripcion")}
      />

      {/* Solapas en vez de dos tablas apiladas (feedback 2026-07-16): se ve
          una sola tabla por vez. La acción de alta de cada solapa queda a la
          derecha de la lista de tabs para no perderla. */}
      <Tabs defaultValue="grupos" className="gap-4">
        <div className="flex items-center justify-between gap-3">
          <TabsList>
            <TabsTrigger value="grupos">{t("marcas.tabs.grupos")}</TabsTrigger>
            <TabsTrigger value="pool">{t("marcas.tabs.catalogo")}</TabsTrigger>
          </TabsList>
          <TabsContent value="grupos" className="contents">
            <Button onClick={abrirNuevoGrupo}>
              <Plus />
              {t("marcas.nuevoGrupo")}
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
              {t("marcas.nuevaMarca")}
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
                      href: `/marcadores/${row.original.id}`,
                    },
                    {
                      label: t("common.acciones.duplicar"),
                      onSelect: () => abrirDuplicarGrupo(row.original),
                    },
                    {
                      label: t("common.acciones.eliminar"),
                      destructive: true,
                      separatorBefore: true,
                      confirmDescription: t("marcas.eliminarGrupo"),
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
              ...opcionesDeSeleccion<Marcador>({ t, seleccion, setSeleccion, onAccion: setAccionGrupo }),
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
                      confirmDescription: t("marcas.eliminarMarca"),
                      onSelect: () => eliminarMarcador(row.original.id),
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
              nombreDe={(id) => items.find((x) => x.id === id)?.nombre ?? id}
              todosLosIds={items.map((x) => x.id)}
              grupos={gruposDeCatalogo}
              onAplicar={(nuevos) =>
                setGrupos((prev) =>
                  prev.map((g) => ({ ...g, marcadorIds: nuevos.find((n) => n.id === g.id)?.ids ?? g.marcadorIds }))
                )
              }
              onClose={() => setAccionGrupo(null)}
            />
          )}
        </TabsContent>
      </Tabs>

      <MarcadorDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initial={editing}
        duplicarDe={duplicando}
        pool={items}
        onSave={guardarMarcador}
      />

      <Dialog open={grupoDialogOpen} onOpenChange={setGrupoDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("marcas.dialogoGrupo.titulo")}</DialogTitle>
            <DialogDescription>
              {t("marcas.dialogoGrupo.descripcion")}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="grupo-nombre">{t("common.comunes.nombre")}</Label>
            <Input
              id="grupo-nombre"
              value={grupoNombre}
              onChange={(e) => setGrupoNombre(e.target.value)}
              placeholder={t("marcas.dialogoGrupo.placeholder")}
              autoFocus
              aria-invalid={grupoRepetido}
            />
            {grupoRepetido && <MensajeRepetido />}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGrupoDialogOpen(false)}>
              {t("common.acciones.cancelar")}
            </Button>
            <Button onClick={crearGrupo} disabled={!grupoNombre.trim() || grupoRepetido}>
              {t("marcas.crearGrupo")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
