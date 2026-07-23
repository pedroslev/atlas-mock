"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { RowActions } from "@/components/data-table/row-actions";
import {
  MitrolTable,
  type MRT_ColumnDef,
} from "@/components/data-table/mitrol-table";
import { Button } from "@/components/ui/button";
import { useLocale, useT, type Locale } from "@/lib/i18n";
import { feriados, type Feriado } from "@/lib/mock-data";

// Tags BCP-47 por idioma de la app: el mes abreviado sale de Intl, no de un
// diccionario. Español = es-AR (el producto es rioplatense).
const INTL_TAG: Record<Locale, string> = {
  es: "es-AR",
  en: "en-US",
  pt: "pt-BR",
  ca: "ca-ES",
};

function proximoFeriado(grupo: Feriado) {
  // Mock estático: mostramos la primera fecha del grupo como referencia.
  const ordenadas = [...grupo.holidays].sort((a, b) =>
    a.date.localeCompare(b.date)
  );
  return ordenadas[0];
}

export default function FeriadosPage() {
  const t = useT();
  const { locale } = useLocale();

  const columns = useMemo<MRT_ColumnDef<Feriado>[]>(
    () => [
      {
        accessorKey: "nombre",
        header: t("common.comunes.nombre"),
        Cell: ({ row }) => (
          <Link
            href={`/feriados/${row.original.id}`}
            className="font-medium hover:underline"
          >
            {row.original.nombre}
          </Link>
        ),
      },
      {
        id: "cantidad",
        header: t("feriados.col.fechas"),
        accessorFn: (grupo) => grupo.holidays.length,
        Cell: ({ cell }) => (
          <span className="text-muted-foreground">
            {t("feriados.cantidadFechas", { n: cell.getValue<number>() })}
          </span>
        ),
      },
      {
        id: "primera",
        header: t("feriados.col.primeraFecha"),
        accessorFn: (grupo) => proximoFeriado(grupo)?.date ?? "",
        Cell: ({ row }) => {
          const primera = proximoFeriado(row.original);
          if (!primera) {
            return <span className="text-muted-foreground">—</span>;
          }
          const [y, m, d] = primera.date.split("-").map(Number);
          return (
            <span className="text-muted-foreground">
              {new Date(y, m - 1, d).toLocaleDateString(INTL_TAG[locale], {
                day: "2-digit",
                month: "short",
              })}{" "}
              · {primera.description}
            </span>
          );
        },
      },
    ],
    [t, locale]
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("feriados.titulo")}
        description={t("feriados.descripcion")}
        actions={
          <Button asChild>
            <Link href="/feriados/nuevo">
              <Plus />
              {t("feriados.nuevoGrupo")}
            </Link>
          </Button>
        }
      />

      <MitrolTable
        columns={columns}
        data={feriados}
        options={{
          enableRowActions: true,
          renderRowActions: ({ row }) => (
            <RowActions
              actions={[
                {
                  label: t("common.acciones.editar"),
                  href: `/feriados/${row.original.id}`,
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
