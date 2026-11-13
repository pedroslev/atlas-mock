"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { RotateCcw } from "lucide-react";
import {
  MaterialReactTable,
  MRT_ShowHideColumnsButton,
  MRT_ToggleFiltersButton,
  useMaterialReactTable,
  type MRT_ColumnDef,
  type MRT_ColumnFiltersState,
  type MRT_RowData,
  type MRT_TableOptions,
  type MRT_Updater,
  type MRT_VisibilityState,
} from "material-react-table";
import { IconButton, Tooltip } from "@mui/material";
import { agentes } from "@/lib/mock-data";
import { MRT_Localization_ES } from "material-react-table/locales/es";
import { MRT_Localization_EN } from "material-react-table/locales/en";
import { MRT_Localization_PT_BR } from "material-react-table/locales/pt-BR";
import { createTheme, ThemeProvider } from "@mui/material";
import { useLocale, useT, type Locale } from "@/lib/i18n";

// Tabla estándar del backoffice: material-react-table (feedback de producto
// 2026-07-16 — filtros por columna, búsqueda global y paginación superiores a
// la tabla shadcn) puenteada a la identidad Mitrol. Los hex de la paleta MUI
// son los mismos tokens de globals.css (MUI necesita valores concretos para
// derivar hover/selected/disabled; no re-inventan color).

// Localización interna de MRT (paginación, filtros, menús de columna) por
// idioma. material-react-table trae `es`, `en` y `pt-BR` (usamos el brasileño,
// que es el portugués del producto) — NO trae catalán, así que `ca` cae al
// inglés hasta que la librería lo publique.
const MRT_LOCALIZATION: Record<Locale, typeof MRT_Localization_ES> = {
  es: MRT_Localization_ES,
  en: MRT_Localization_EN,
  pt: MRT_Localization_PT_BR,
  // ca: no existe `material-react-table/locales/ca` — fallback a inglés.
  ca: MRT_Localization_EN,
};

// Suscribe a cambios de la clase `dark` en <html> (toggle de tema en runtime).
function subscribeTheme(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => observer.disconnect();
}

function getThemeSnapshot(): "light" | "dark" {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

// Devuelve "server" en SSR y durante la hidratación (el server no conoce el
// tema del cliente), y "light"/"dark" real recién en el cliente ya montado.
// useSyncExternalStore usa el server-snapshot en la hidratación, de modo que el
// primer render de cliente coincide con el del server (sin hydration mismatch)
// y no hay setState-en-efecto. El gate en MitrolTable evita el flash blanco.
function useThemeMode(): "server" | "light" | "dark" {
  return useSyncExternalStore(
    subscribeTheme,
    getThemeSnapshot,
    () => "server" as const
  );
}

// --- Vista recordada (ATLAS-1353) -----------------------------------------
// Cada tabla recuerda, por usuario y por pantalla, las columnas visibles y los
// filtros de columna. "Restablecer filtros y columnas" vuelve a la vista por
// defecto de la pantalla (su initialState).
// MOCK: se guarda en el navegador (localStorage), con el primer usuario de los
// datos de ejemplo como usuario conectado.
// REAL: se guarda por usuario autenticado y por pantalla; a definir con el
// Architect si vive en el navegador (como el AW) o en el servicio, para que
// siga a la persona entre equipos.
const USUARIO_CONECTADO = agentes[0]?.id ?? "anonimo";

type Vista = { columnVisibility: MRT_VisibilityState; columnFilters: MRT_ColumnFiltersState };

function leerVista(clave: string): Vista | null {
  if (typeof window === "undefined") return null;
  try {
    const crudo = window.localStorage.getItem(clave);
    return crudo ? (JSON.parse(crudo) as Vista) : null;
  } catch {
    return null;
  }
}

function guardarVista(clave: string, vista: Vista) {
  try {
    window.localStorage.setItem(clave, JSON.stringify(vista));
  } catch {
    // Sin almacenamiento disponible: la vista dura lo que la pantalla abierta.
  }
}

function resolver<V>(updater: MRT_Updater<V>, previo: V): V {
  return typeof updater === "function" ? (updater as (v: V) => V)(previo) : updater;
}

/** Saca los filtros de columnas ocultas o que ya no existen: un filtro siempre se ve. */
function limpiarFiltros(
  filtros: MRT_ColumnFiltersState,
  visibles: MRT_VisibilityState,
  ids: string[]
): MRT_ColumnFiltersState {
  return filtros.filter((f) => ids.includes(f.id) && visibles[f.id] !== false);
}

function idDeColumna<T extends MRT_RowData>(c: MRT_ColumnDef<T>): string {
  return (c.id ?? (c.accessorKey as string | undefined) ?? "") as string;
}

export function MitrolTable<T extends MRT_RowData>({
  columns,
  data,
  options,
}: {
  columns: MRT_ColumnDef<T>[];
  data: T[];
  /** Overrides de MRT por pantalla (agrupado, row actions, etc.). */
  options?: Partial<MRT_TableOptions<T>>;
}) {
  // El tema (dark/light) que usa MUI sólo se conoce en el cliente. Si el server
  // renderiza la tabla con un tema y el cliente hidrata con otro, React aborta
  // el parcheo del subárbol y queda el DOM del server (tabla blanca en dark tras
  // un F5 — hydration mismatch). useThemeMode devuelve "server" en SSR y en la
  // hidratación (mismo output → sin mismatch) y el tema real recién en el
  // cliente montado; abajo gateamos el render con eso (sin flash blanco).
  const mode = useThemeMode();
  const dark = mode === "dark";
  // useLocale() usa el mismo patrón useSyncExternalStore con server-snapshot,
  // así que no reintroduce el mismatch de hidratación que arregla el gate de
  // abajo (en SSR y primer render de cliente devuelve DEFAULT_LOCALE).
  const { locale } = useLocale();
  const t = useT();

  const theme = useMemo(
    () =>
      createTheme({
        palette: dark
          ? {
              mode: "dark",
              primary: { main: "#084AF3" },
              secondary: { main: "#334155" },
              // Superficies slate oscuras frías, alineadas a --background/--card
              // del token dark. NUNCA blanco: el paper es el --card (#1E293B).
              background: { default: "#0F172A", paper: "#1E293B" },
              text: { primary: "#F1F5F9", secondary: "#94A3B8" },
              divider: "#334155",
              // Iconos del toolbar (filtro, columnas) legibles sobre el
              // paper oscuro — el rgba(255,255,255,0.54) por defecto de MUI
              // queda demasiado apagado y era parte del "no se entiende nada".
              action: {
                active: "#CBD5E1",
                hover: "rgba(241, 245, 249, 0.08)",
                selected: "rgba(8, 74, 243, 0.24)",
              },
            }
          : {
              mode: "light",
              primary: { main: "#084AF3" },
              secondary: { main: "#475569" },
              background: { default: "#FFFFFF", paper: "#FFFFFF" },
              text: { primary: "#1E293B", secondary: "#475569" },
              divider: "#E2E8F0",
            },
        typography: {
          fontFamily: "var(--font-sans), Poppins, sans-serif",
          fontSize: 13,
        },
        shape: { borderRadius: 8 },
        components: {
          // MUI en dark pinta un gradiente de "elevation overlay" sobre cada
          // Paper (menús, popovers, tooltips renderizados en portales). Ese
          // overlay lavaba el color y bajaba el contraste del texto: lo
          // anulamos para que toda superficie flotante use un color sólido
          // alineado a los tokens.
          MuiPaper: {
            styleOverrides: { root: { backgroundImage: "none" } },
          },
          // Menús flotantes de MRT (mostrar/ocultar columnas, acciones de
          // columna, acciones de fila) — se renderizan en portales pero MUI
          // los alcanza vía contexto de React, así que el ThemeProvider basta;
          // sólo les fijamos fondo/borde token para que floten y contrasten.
          MuiMenu: {
            styleOverrides: {
              paper: dark
                ? {
                    backgroundColor: "#273449",
                    border: "1px solid #334155",
                  }
                : {},
            },
          },
          MuiPopover: {
            styleOverrides: {
              paper: dark
                ? {
                    backgroundColor: "#273449",
                    border: "1px solid #334155",
                  }
                : {},
            },
          },
          MuiTooltip: {
            styleOverrides: {
              tooltip: {
                backgroundColor: dark ? "#273449" : "#1E293B",
                color: "#F1F5F9",
                fontSize: "0.75rem",
                border: dark ? "1px solid #334155" : undefined,
              },
              arrow: { color: dark ? "#273449" : "#1E293B" },
            },
          },
        },
      }),
    [dark]
  );

  const {
    initialState: optionsInitialState,
    displayColumnDefOptions: optionsDisplayColumnDefOptions,
    localization: optionsLocalization,
    state: optionsState,
    ...restOptions
  } = options ?? {};

  // Vista recordada: la clave combina usuario, pantalla y columnas, así dos
  // tablas de la misma pantalla (por ejemplo, solapas) no se pisan.
  const pathname = usePathname();
  const idsColumnas = columns.map(idDeColumna).filter(Boolean);
  const clave = `atlas-mock:vista:${USUARIO_CONECTADO}:${pathname}:${idsColumnas.join(",")}`;
  const porDefecto: Vista = {
    columnVisibility: optionsInitialState?.columnVisibility ?? {},
    columnFilters: optionsInitialState?.columnFilters ?? [],
  };
  const [vista, setVista] = useState<Vista>(() => leerVista(clave) ?? porDefecto);

  function cambiarVista(cambio: (v: Vista) => Vista) {
    setVista((previa) => {
      const nueva = cambio(previa);
      nueva.columnFilters = limpiarFiltros(nueva.columnFilters, nueva.columnVisibility, idsColumnas);
      guardarVista(clave, nueva);
      return nueva;
    });
  }

  // El aviso del ícono de filtro arma el texto con el valor del filtro. Para
  // valores compuestos (por ejemplo "está en" + lista), la columna da su
  // propio texto con meta.formatoFiltro; acá se le enseña al valor a
  // mostrarse así, sin cambiar lo que se guarda.
  const filtrosConTexto = useMemo(
    () =>
      vista.columnFilters.map((f) => {
        const col = columns.find((c) => idDeColumna(c) === f.id);
        const formato = (col?.meta as { formatoFiltro?: (v: unknown) => string } | undefined)
          ?.formatoFiltro;
        if (!formato || typeof f.value !== "object" || f.value === null || Array.isArray(f.value)) return f;
        const valor = { ...(f.value as object) };
        Object.defineProperty(valor, "toString", { value: () => formato(f.value), enumerable: false });
        return { ...f, value: valor };
      }),
    [vista.columnFilters, columns]
  );

  const visibilidadPorDefecto = (id: string) => porDefecto.columnVisibility[id] !== false;
  const esPorDefecto =
    JSON.stringify(vista.columnFilters) === JSON.stringify(porDefecto.columnFilters) &&
    idsColumnas.every((id) => (vista.columnVisibility[id] !== false) === visibilidadPorDefecto(id));

  const table = useMaterialReactTable<T>({
    columns,
    data,
    // Una pantalla puede pisar textos puntuales sin perder el resto del idioma.
    localization: { ...MRT_LOCALIZATION[locale], ...optionsLocalization },
    enableDensityToggle: false,
    enableFullScreenToggle: false,
    positionActionsColumn: "last",
    positionGlobalFilter: "left",
    // Sin paginación: la tabla muestra todas las filas y scrollea internamente
    // si excede el alto disponible, con header sticky (feedback 2026-07-16 —
    // "prefiero que todas tengan un scroll si exceden el tamaño de pantalla").
    enablePagination: false,
    enableBottomToolbar: false,
    enableStickyHeader: true,
    // Colores de superficie deliberados (en vez de los lighten()/darken()
    // que MRT deriva por defecto y que en dark quedaban en tonos casi
    // idénticos): el cuerpo usa el token --card y los menús flotantes un
    // tono levemente más claro para separarse.
    mrtTheme: dark
      ? {
          baseBackgroundColor: "#1E293B",
          menuBackgroundColor: "#273449",
          selectedRowBackgroundColor: "rgba(8, 74, 243, 0.24)",
        }
      : {
          baseBackgroundColor: "#FFFFFF",
        },
    muiTableContainerProps: {
      sx: { maxHeight: "calc(100vh - 15rem)" },
    },
    // Header de columnas visualmente distinto del cuerpo: en dark el cuerpo
    // y el header compartían casi el mismo gris y no se leía la estructura.
    muiTableHeadCellProps: ({ column }) => ({
      sx: {
        fontWeight: 600,
        // Siempre presentes (ver muiTableBodyCellProps): en dark, header con
        // un tono más claro que el cuerpo y borde inferior; en light, sin
        // override (superficie blanca plana).
        backgroundColor: dark ? "#273449" : undefined,
        color: dark ? "#F1F5F9" : undefined,
        borderBottom: dark ? "1px solid #334155" : undefined,
        "& .MuiTableSortLabel-icon, & svg": { color: dark ? "#CBD5E1" : undefined },
        // Columna filtrada (ATLAS-1353): el ícono de filtro de la cabecera
        // pasa al color primario; al pasar el mouse dice qué filtro aplica.
        ...(column.getIsFiltered() && {
          "& svg[data-testid='FilterAltIcon']": { color: dark ? "#6B93FF" : "#084AF3" },
        }),
      },
    }),
    // Siempre presente (nunca `...(dark && {...})`): tanstack-table mergea las
    // opciones contra las del render anterior, así que omitir esta key en
    // light dejaba el borderBottom de dark pegado al volver.
    muiTableBodyCellProps: {
      sx: { borderBottom: dark ? "1px solid #2A3547" : undefined },
    },
    // Campos de filtro por columna e input de búsqueda: outlined con texto
    // token para que no hereden un gris ilegible en dark.
    muiFilterTextFieldProps: {
      variant: "outlined",
      sx: {
        "& .MuiInputBase-input": { color: dark ? "#F1F5F9" : "#1E293B" },
        "& .MuiInputBase-input::placeholder": {
          color: dark ? "#94A3B8" : "#475569",
          opacity: 1,
        },
      },
    },
    initialState: {
      density: "compact",
      showGlobalFilter: true,
      ...optionsInitialState,
    },
    displayColumnDefOptions: {
      "mrt-row-actions": { header: "", size: 56 },
      ...optionsDisplayColumnDefOptions,
    },
    muiSearchTextFieldProps: {
      size: "small",
      variant: "outlined",
      placeholder: t("common.acciones.buscar"),
    },
    muiPaginationProps: {
      shape: "rounded",
      variant: "outlined",
      showRowsPerPage: false,
    },
    muiTablePaperProps: {
      elevation: 0,
      sx: {
        borderRadius: "var(--radius-xl)",
        // Mismo resting ring que las Cards (DESIGN.md: superficies planas
        // con ring, sin sombra) en lugar del Paper elevado de MUI.
        boxShadow: dark
          ? "0 0 0 1px rgba(241, 245, 249, 0.10)"
          : "0 0 0 1px rgba(30, 41, 59, 0.10)",
        overflow: "hidden",
        backgroundImage: "none",
      },
    },
    muiTopToolbarProps: { sx: { minHeight: "52px" } },
    renderToolbarInternalActions: ({ table }) => (
      <>
        <Tooltip title={t("common.tabla.restablecer")}>
          <span>
            <IconButton
              aria-label={t("common.tabla.restablecer")}
              disabled={esPorDefecto}
              onClick={() => {
                cambiarVista(() => ({
                  columnVisibility: { ...porDefecto.columnVisibility },
                  columnFilters: [...porDefecto.columnFilters],
                }));
                table.setGlobalFilter(undefined);
              }}
            >
              <RotateCcw className="size-5" />
            </IconButton>
          </span>
        </Tooltip>
        {table.options.columnFilterDisplayMode !== "popover" && (
          <MRT_ToggleFiltersButton table={table} />
        )}
        <MRT_ShowHideColumnsButton table={table} />
      </>
    ),
    ...restOptions,
    state: {
      columnVisibility: vista.columnVisibility,
      columnFilters: filtrosConTexto,
      ...optionsState,
    },
    onColumnVisibilityChange: (u) =>
      cambiarVista((v) => ({ ...v, columnVisibility: resolver(u, v.columnVisibility) })),
    onColumnFiltersChange: (u) =>
      cambiarVista((v) => ({ ...v, columnFilters: resolver(u, v.columnFilters) })),
  });


  // Placeholder determinístico (mismo en server y primer render de cliente):
  // reserva alto para evitar salto de layout y usa tokens, así se ve bien en
  // light y dark hasta que la tabla real monta con el tema correcto.
  if (mode === "server") {
    return (
      <div className="h-64 w-full animate-pulse rounded-xl bg-muted/40 ring-1 ring-foreground/10" />
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <MaterialReactTable table={table} />
    </ThemeProvider>
  );
}

export type { MRT_ColumnDef };
