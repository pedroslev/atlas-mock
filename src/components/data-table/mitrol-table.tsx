"use client";

import { useMemo, useSyncExternalStore } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
  type MRT_RowData,
  type MRT_TableOptions,
} from "material-react-table";
import { MRT_Localization_ES } from "material-react-table/locales/es";
import { MRT_Localization_EN } from "material-react-table/locales/en";
import { MRT_Localization_PT_BR } from "material-react-table/locales/pt-BR";
import { createTheme, ThemeProvider } from "@mui/material";
import { useLocale, useT, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

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

export function MitrolTable<T extends MRT_RowData>({
  columns,
  data,
  options,
  fillHeight = false,
}: {
  columns: MRT_ColumnDef<T>[];
  data: T[];
  /** Overrides de MRT por pantalla (agrupado, row actions, etc.). */
  options?: Partial<MRT_TableOptions<T>>;
  /**
   * En vez de acotar el alto de la tabla a la altura de la ventana (el
   * `calc(100vh - 15rem)` de siempre, pensado para una página de backoffice
   * que scrollea), la estira al 100% de su contenedor — para paneles que ya
   * manejan su propio alto flex (p. ej. el historial del pad, que no tiene
   * el "página que scrollea" del backoffice alrededor).
   */
  fillHeight?: boolean;
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
    ...restOptions
  } = options ?? {};

  const table = useMaterialReactTable<T>({
    columns,
    data,
    localization: MRT_LOCALIZATION[locale],
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
      sx: fillHeight
        ? { flex: 1, minHeight: 0 }
        : { maxHeight: "calc(100vh - 15rem)" },
    },
    // Header de columnas visualmente distinto del cuerpo: en dark el cuerpo
    // y el header compartían casi el mismo gris y no se leía la estructura.
    muiTableHeadCellProps: {
      sx: {
        fontWeight: 600,
        // Sólo en dark: header con un tono más claro que el cuerpo y borde
        // inferior visible para que se lea la estructura (light se deja como
        // estaba, superficie blanca plana).
        ...(dark && {
          backgroundColor: "#273449",
          color: "#F1F5F9",
          borderBottom: "1px solid #334155",
          "& .MuiTableSortLabel-icon, & svg": { color: "#CBD5E1" },
        }),
      },
    },
    ...(dark && {
      muiTableBodyCellProps: {
        sx: { borderBottom: "1px solid #2A3547" },
      },
    }),
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
        // fillHeight: Paper pasa a columna flex para que el TableContainer
        // (flex:1 arriba) reparta el alto real del panel entre el toolbar y
        // la grilla, en vez de crecer con el contenido.
        ...(fillHeight && { height: "100%", display: "flex", flexDirection: "column" }),
      },
    },
    muiTopToolbarProps: { sx: { minHeight: "52px" } },
    ...restOptions,
  });

  // Placeholder determinístico (mismo en server y primer render de cliente):
  // reserva alto para evitar salto de layout y usa tokens, así se ve bien en
  // light y dark hasta que la tabla real monta con el tema correcto.
  if (mode === "server") {
    return (
      <div
        className={cn(
          "w-full animate-pulse rounded-xl bg-muted/40 ring-1 ring-foreground/10",
          fillHeight ? "h-full" : "h-64"
        )}
      />
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <MaterialReactTable table={table} />
    </ThemeProvider>
  );
}

export type { MRT_ColumnDef };
