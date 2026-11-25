"use client";

// Mostrar / ocultar columnas de la tabla de Clientes (ATLAS-1186): con
// buscador y separado en grupos (datos básicos, datos de contacto,
// información adicional, etiquetas), porque la información adicional crece
// con cada importación y la lista se vuelve larga.

import { useState } from "react";
import type { MRT_RowData, MRT_TableInstance } from "material-react-table";
import { IconButton, Tooltip } from "@mui/material";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useT } from "@/lib/i18n";

export type GrupoColumnas = { id: string; titulo: string; columnas: string[] };

export function ColumnasMenu<T extends MRT_RowData>({
  table,
  grupos,
}: {
  table: MRT_TableInstance<T>;
  grupos: GrupoColumnas[];
}) {
  const t = useT();
  const [busqueda, setBusqueda] = useState("");
  const q = busqueda.trim().toLowerCase();

  const nombre = (id: string) => {
    const header = table.getColumn(id)?.columnDef.header;
    return typeof header === "string" ? header : id;
  };

  const visibles = grupos
    .map((g) => ({
      ...g,
      columnas: g.columnas.filter((id) => !q || nombre(id).toLowerCase().includes(q)),
    }))
    .filter((g) => g.columnas.length > 0);

  return (
    <Popover onOpenChange={(open) => !open && setBusqueda("")}>
      {/* Mismo ícono y botón que el resto de las tablas (el de la librería). */}
      <Tooltip title={table.options.localization.showHideColumns}>
        <PopoverTrigger asChild>
          <IconButton aria-label={table.options.localization.showHideColumns}>
            <table.options.icons.ViewColumnIcon />
          </IconButton>
        </PopoverTrigger>
      </Tooltip>
      <PopoverContent align="end" className="w-72 max-w-[calc(100vw-2rem)] p-0">
        <div className="border-b p-2">
          <Input
            autoFocus
            placeholder={t("clientes.columnas.buscar")}
            aria-label={t("clientes.columnas.buscar")}
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        <div className="flex max-h-80 flex-col gap-3 overflow-y-auto p-2">
          {visibles.length === 0 && (
            <p className="px-1 py-2 text-sm text-muted-foreground">
              {t("clientes.columnas.sinResultados")}
            </p>
          )}
          {visibles.map((g) => {
            const todas = g.columnas.every((id) => table.getColumn(id)?.getIsVisible());
            return (
              <div key={g.id} className="flex flex-col gap-0.5">
                <div className="flex items-center justify-between px-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {g.titulo}
                  </p>
                  <Button
                    variant="link"
                    size="sm"
                    className="h-auto p-0 text-xs"
                    onClick={() =>
                      g.columnas.forEach((id) => table.getColumn(id)?.toggleVisibility(!todas))
                    }
                  >
                    {todas ? t("clientes.columnas.ocultarTodas") : t("clientes.columnas.mostrarTodas")}
                  </Button>
                </div>
                {g.columnas.map((id) => {
                  const col = table.getColumn(id);
                  if (!col) return null;
                  return (
                    <label
                      key={id}
                      className="flex cursor-pointer items-center gap-2 rounded px-1 py-1 text-sm hover:bg-muted"
                    >
                      <Checkbox
                        checked={col.getIsVisible()}
                        onCheckedChange={(v) => col.toggleVisibility(v === true)}
                      />
                      {nombre(id)}
                    </label>
                  );
                })}
              </div>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
