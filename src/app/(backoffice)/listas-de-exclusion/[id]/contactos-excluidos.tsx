"use client";

import { useMemo, useState } from "react";
import {
  Download,
  FileMinus,
  MoreVertical,
  Pencil,
  Plus,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ActionTooltip } from "@/components/layout/action-tooltip";
import { MitrolTable, type MRT_ColumnDef } from "@/components/data-table/mitrol-table";
import type { ContactoExcluido } from "@/lib/mock-data";
import { CANALES, SENTIDOS, formatearFecha } from "@/lib/listas-exclusion";
import { useT } from "@/lib/i18n";
import { ContactoDialog } from "./contacto-dialog";
import { ArchivoDialog, type ModoArchivo } from "./archivo-dialog";

const sentidoVariant = {
  saliente: "info",
  entrante: "warning",
  bidireccional: "neutral",
} as const;

type AccionMasiva = "importar" | "quitarArchivo" | "quitarTodos";

// Contactos de una lista de exclusión (ATLAS-1444).
// - Agregar, Editar y Quitar un contacto quedan pendientes hasta Confirmar.
// - Importar, Quitar por archivo y Quitar todos se guardan al terminar; si hay
//   cambios pendientes, primero se confirman o descartan.
// MOCK: estado local; la tabla pagina en el navegador.
// REAL: la tabla pagina, filtra y busca en el servicio (listas de 2M+).
export function ContactosExcluidos({
  initialContactos,
  listaId,
  listaNombre,
}: {
  initialContactos: ContactoExcluido[];
  listaId: string;
  listaNombre: string;
}) {
  const t = useT();
  const [contactos, setContactos] = useState(initialContactos);
  // Lo último guardado: para saber si hay cambios pendientes.
  const [guardados, setGuardados] = useState(initialContactos);
  const [agregarAbierto, setAgregarAbierto] = useState(false);
  const [editando, setEditando] = useState<ContactoExcluido | null>(null);
  const [archivo, setArchivo] = useState<ModoArchivo | null>(null);
  const [quitarTodosAbierto, setQuitarTodosAbierto] = useState(false);
  const [pendiente, setPendiente] = useState<AccionMasiva | null>(null);
  const [mensaje, setMensaje] = useState("");

  const hayPendientes = contactos !== guardados;

  function abrir(accion: AccionMasiva) {
    if (accion === "importar") setArchivo("importar");
    if (accion === "quitarArchivo") setArchivo("quitar");
    if (accion === "quitarTodos") setQuitarTodosAbierto(true);
  }

  function antesDeMasiva(accion: AccionMasiva) {
    if (hayPendientes) setPendiente(accion);
    else abrir(accion);
  }

  // Las acciones masivas guardan solas: lo que dejan pasa a ser lo guardado.
  function guardarMasiva(nuevos: ContactoExcluido[]) {
    setContactos(nuevos);
    setGuardados(nuevos);
  }

  function descargar() {
    const filas = [
      ["Contacto", "Canal", "Sentido", "Fecha de alta", "Usuario de alta"],
      ...contactos.map((c) => [
        c.contacto,
        t(`listas.canal.${c.canal}`),
        t(`listas.sentido.${c.sentido}`),
        formatearFecha(c.fechaAlta),
        c.usuarioAlta ?? "",
      ]),
    ];
    const csv = filas.map((f) => f.map((v) => `"${v.replace(/"/g, '""')}"`).join(";")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `${listaNombre}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const columns = useMemo<MRT_ColumnDef<ContactoExcluido>[]>(
    () => [
      {
        accessorKey: "contacto",
        header: t("listas.contactos.contacto"),
        size: 190,
        // El buscador de la tabla ya busca por contacto en toda la lista.
        enableColumnFilter: false,
        Cell: ({ row }) => <span className="font-mono text-sm">{row.original.contacto}</span>,
      },
      {
        id: "canal",
        header: t("listas.contactos.canal"),
        size: 130,
        accessorFn: (c) => t(`listas.canal.${c.canal}`),
        filterVariant: "select",
        filterSelectOptions: CANALES.map((c) => t(`listas.canal.${c}`)),
        Cell: ({ cell }) => <Badge variant="outline">{cell.getValue<string>()}</Badge>,
      },
      {
        id: "sentido",
        header: t("listas.contactos.sentido"),
        size: 150,
        accessorFn: (c) => t(`listas.sentido.${c.sentido}`),
        filterVariant: "select",
        filterSelectOptions: SENTIDOS.map((s) => t(`listas.sentido.${s}`)),
        Cell: ({ row, cell }) => (
          <Badge variant={sentidoVariant[row.original.sentido]}>{cell.getValue<string>()}</Badge>
        ),
      },
      {
        id: "fechaAlta",
        header: t("listas.contactos.fechaAlta"),
        size: 150,
        accessorFn: (c) => c.fechaAlta ?? "",
        enableColumnFilter: false,
        Cell: ({ row }) =>
          row.original.fechaAlta ? (
            <span className="text-muted-foreground">{formatearFecha(row.original.fechaAlta)}</span>
          ) : (
            <span className="text-muted-foreground" title={t("listas.contactos.sinDato")}>
              —
            </span>
          ),
      },
      {
        id: "usuarioAlta",
        header: t("listas.contactos.usuarioAlta"),
        accessorFn: (c) => c.usuarioAlta ?? "",
        enableColumnFilter: false,
        Cell: ({ row }) => (
          <span className="text-muted-foreground" title={row.original.usuarioAlta ? undefined : t("listas.contactos.sinDato")}>
            {row.original.usuarioAlta ?? "—"}
          </span>
        ),
      },
    ],
    [t]
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-sm text-muted-foreground">
          {t(contactos.length === 1 ? "listas.contactos.uno" : "listas.contactos.varios", {
            n: contactos.length.toLocaleString("es-AR"),
          })}
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setAgregarAbierto(true)}>
            <Plus />
            {t("listas.contactos.agregar")}
          </Button>
          <Button variant="outline" size="sm" onClick={() => antesDeMasiva("importar")}>
            <Upload />
            {t("listas.contactos.importar")}
          </Button>
          <DropdownMenu>
            <ActionTooltip label={t("listas.contactos.masAcciones")}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon-sm" aria-label={t("listas.contactos.masAcciones")}>
                  <MoreVertical />
                </Button>
              </DropdownMenuTrigger>
            </ActionTooltip>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={descargar}>
                <Download />
                {t("listas.contactos.descargar")}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onSelect={() => antesDeMasiva("quitarArchivo")}>
                <FileMinus />
                {t("listas.contactos.quitarArchivo")}
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                disabled={contactos.length === 0}
                onSelect={() => antesDeMasiva("quitarTodos")}
              >
                <Trash2 />
                {t("listas.contactos.quitarTodos")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {mensaje && <p className="text-sm text-muted-foreground">{mensaje}</p>}

      {/* Lo que vigila el aviso de cambios sin guardar es la lista, no la vista. */}
      <span
        hidden
        data-valor-vigilado={JSON.stringify(
          contactos.map((c) => `${c.contacto}|${c.canal}|${c.sentido}`).sort()
        )}
      />

      {contactos.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("listas.contactos.vacio")}</p>
      ) : (
        <div data-no-vigilar>
          <MitrolTable
            columns={columns}
            data={contactos}
            options={{
              enablePagination: true,
              enableBottomToolbar: true,
              enableRowActions: true,
              enableHiding: true,
              getRowId: (c) => c.id,
              initialState: {
                pagination: { pageIndex: 0, pageSize: 10 },
                sorting: [{ id: "fechaAlta", desc: true }],
                columnVisibility: { usuarioAlta: false },
                showColumnFilters: false,
              },
              displayColumnDefOptions: { "mrt-row-actions": { header: "", size: 88 } },
              renderRowActions: ({ row }) => (
                <div className="flex items-center gap-1">
                  <ActionTooltip label={t("listas.contactos.editar")}>
                    <button
                      type="button"
                      aria-label={t("listas.contactos.editarAria", { contacto: row.original.contacto })}
                      onClick={() => setEditando(row.original)}
                      className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    >
                      <Pencil className="size-4" />
                    </button>
                  </ActionTooltip>
                  <ActionTooltip label={t("listas.contactos.quitar")}>
                    <button
                      type="button"
                      aria-label={t("listas.contactos.quitarAria", { contacto: row.original.contacto })}
                      onClick={() => setContactos((xs) => xs.filter((x) => x.id !== row.original.id))}
                      className="flex size-8 items-center justify-center rounded-lg text-destructive hover:bg-destructive/10"
                    >
                      <X className="size-4" />
                    </button>
                  </ActionTooltip>
                </div>
              ),
            }}
          />
        </div>
      )}

      <ContactoDialog
        open={agregarAbierto}
        onOpenChange={setAgregarAbierto}
        contactos={contactos}
        onAplicar={(nuevos, resumen) => {
          setContactos(nuevos);
          setMensaje(resumen);
        }}
      />
      <ContactoDialog
        open={editando !== null}
        onOpenChange={(abierto) => !abierto && setEditando(null)}
        contactos={contactos}
        editando={editando ?? undefined}
        onAplicar={(nuevos) => setContactos(nuevos)}
      />

      {archivo && (
        <ArchivoDialog
          modo={archivo}
          listaId={listaId}
          contactos={contactos}
          onClose={() => setArchivo(null)}
          onGuardado={guardarMasiva}
        />
      )}

      {/* Quitar todos: se guarda en el momento. */}
      <AlertDialog open={quitarTodosAbierto} onOpenChange={setQuitarTodosAbierto}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("listas.contactos.quitarTodosTitulo")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("listas.contactos.quitarTodosDesc", { n: contactos.length.toLocaleString("es-AR") })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.acciones.cancelar")}</AlertDialogCancel>
            <AlertDialogAction variant="destructive" data-guarda-cambios onClick={() => guardarMasiva([])}>
              {t("listas.contactos.quitarTodosConfirmar")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cambios pendientes antes de una acción masiva. Confirmar guarda y deja
          al usuario en el detalle (el Confirmar de la cabecera vuelve al listado). */}
      <AlertDialog open={pendiente !== null} onOpenChange={(abierto) => !abierto && setPendiente(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("listas.pendientes.titulo")}</AlertDialogTitle>
            <AlertDialogDescription>{t("listas.pendientes.desc")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.acciones.cancelar")}</AlertDialogCancel>
            <AlertDialogAction
              variant="outline"
              className="text-destructive hover:text-destructive"
              onClick={() => {
                const accion = pendiente;
                setContactos(guardados);
                setPendiente(null);
                if (accion) abrir(accion);
              }}
            >
              {t("listas.pendientes.descartar")}
            </AlertDialogAction>
            <AlertDialogAction
              data-guarda-cambios
              onClick={() => {
                const accion = pendiente;
                setGuardados(contactos);
                setPendiente(null);
                if (accion) abrir(accion);
              }}
            >
              {t("listas.pendientes.confirmar")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
