"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Upload } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { RowActions } from "@/components/data-table/row-actions";
import {
  MitrolTable,
  type MRT_ColumnDef,
} from "@/components/data-table/mitrol-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ADefinir } from "@/components/clientes/clientes-ui";
import { proyectos, getProyecto } from "@/lib/mock-data";
import {
  clientes,
  esActivo,
  formatFecha,
  getInteraccionesDeCliente,
  getObjetivosDeCliente,
  nombreCompleto,
  telefonoPrincipal,
  visibleEn,
  type Cliente,
} from "@/lib/mock-clientes";
import { useT } from "@/lib/i18n";

type Fila = Cliente & {
  nombreCompleto: string;
  objetivosActivos: number;
  ultimaInteraccion?: string;
};

export default function ClientesPage() {
  const t = useT();
  const [proyectoId, setProyectoId] = useState<string>("todos");

  // Clientes globales: un cliente se ve en un proyecto salvo que se le haya
  // sacado la visibilidad ahí.
  const filas = useMemo<Fila[]>(
    () =>
      clientes
        .filter((c) => proyectoId === "todos" || visibleEn(c, proyectoId))
        .map((c) => ({
          ...c,
          nombreCompleto: nombreCompleto(c),
          objetivosActivos: getObjetivosDeCliente(c.id).filter(esActivo).length,
          ultimaInteraccion: getInteraccionesDeCliente(c.id)[0]?.fecha,
        })),
    [proyectoId]
  );

  const columns = useMemo<MRT_ColumnDef<Fila>[]>(
    () => [
      {
        accessorKey: "nombreCompleto",
        header: t("clientes.col.cliente"),
        Cell: ({ row }) => (
          <Link
            href={`/clientes/${row.original.id}`}
            className="font-medium hover:underline"
          >
            {row.original.nombreCompleto}
          </Link>
        ),
      },
      {
        id: "identificacion",
        header: t("clientes.col.identificacion"),
        accessorFn: (c) => `${c.tipoDoc} ${c.nroDoc}`,
        Cell: ({ cell }) => (
          <span className="text-muted-foreground">{cell.getValue<string>()}</span>
        ),
      },
      {
        id: "telefono",
        header: t("clientes.col.telefono"),
        accessorFn: (c) => telefonoPrincipal(c) ?? "—",
      },
      {
        id: "visibilidad",
        header: t("clientes.col.visibilidad"),
        accessorFn: (c) => c.ocultoEn.length,
        Cell: ({ row }) =>
          row.original.ocultoEn.length === 0 ? (
            <span className="text-muted-foreground">{t("clientes.visibleTodos")}</span>
          ) : (
            <div className="flex flex-wrap items-center gap-1">
              <span className="text-xs text-muted-foreground">{t("clientes.todosMenos")}</span>
              {row.original.ocultoEn.map((pid) => (
                <Badge key={pid} variant="neutral">
                  {getProyecto(pid)?.nombre}
                </Badge>
              ))}
            </div>
          ),
      },
      {
        accessorKey: "objetivosActivos",
        header: t("clientes.col.objetivosActivos"),
        Cell: ({ cell }) => {
          const n = cell.getValue<number>();
          return n > 0 ? (
            <Badge variant="warning">{n}</Badge>
          ) : (
            <span className="text-muted-foreground">0</span>
          );
        },
      },
      {
        accessorKey: "ultimaInteraccion",
        header: t("clientes.col.ultimaInteraccion"),
        Cell: ({ cell }) => {
          const v = cell.getValue<string | undefined>();
          return (
            <span className="text-muted-foreground">
              {v ? formatFecha(v, true) : "—"}
            </span>
          );
        },
      },
    ],
    [t]
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("common.nav.clientes")}
        description={t("clientes.descripcion")}
        actions={
          <>
            <ADefinir nota={t("clientes.obj.cargar.inputNota")} />
            <Button variant="outline">
              <Upload />
              {t("clientes.importar")}
            </Button>
            <Button>
              <Plus />
              {t("clientes.nuevo")}
            </Button>
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium">{t("clientes.proyecto")}</span>
        <Select value={proyectoId} onValueChange={setProyectoId}>
          <SelectTrigger className="w-60">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">{t("clientes.todosProyectos")}</SelectItem>
            {proyectos.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <MitrolTable
        columns={columns}
        data={filas}
        options={{
          enableRowActions: true,
          renderRowActions: ({ row }) => (
            <RowActions
              actions={[
                {
                  label: t("clientes.verFicha"),
                  href: `/clientes/${row.original.id}`,
                },
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
  );
}
