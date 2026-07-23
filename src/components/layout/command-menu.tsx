"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { navItems } from "@/lib/nav";
import { campanias, proyectos, cuentas, getProyecto } from "@/lib/mock-data";
import { useT } from "@/lib/i18n";

// Preview del futuro `/api/search` unificado (fronted/README.md): navega
// directo a secciones y a un puñado de entidades del tenant único (Banco Sur).
// Sin fetch real — recorta cada lista a 4 resultados para simular ranking.
export function CommandMenu({
  children,
}: {
  /** Render prop: receives the open() handler so callers (e.g. a mobile icon button) can trigger the palette too. */
  children?: (open: () => void) => React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();
  const t = useT();

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((value) => !value);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <>
      {children ? (
        children(() => setOpen(true))
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mx-auto flex w-full max-w-md items-center gap-2 rounded-lg bg-white/10 px-3 py-1.5 text-left transition-colors hover:bg-white/15 focus-visible:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-header"
        >
          <svg
            className="size-4 shrink-0 text-header-foreground/70"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <span className="flex-1 truncate text-sm text-header-foreground/70">
            {t("common.header.buscar")}
          </span>
          <kbd className="hidden shrink-0 items-center gap-0.5 rounded-md border border-white/20 bg-white/10 px-1.5 py-0.5 font-mono text-xs text-header-foreground/70 sm:flex">
            ⌘K
          </kbd>
        </button>
      )}

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title={t("common.buscador.titulo")}
        description={t("common.buscador.descripcion")}
      >
        <Command>
          <CommandInput placeholder={t("common.buscador.placeholder")} />
          <CommandList>
            <CommandEmpty>{t("common.comunes.sinResultados")}</CommandEmpty>
            <CommandGroup heading={t("common.buscador.secciones")}>
              {navItems.map((item) => (
                <CommandItem key={item.href} onSelect={() => go(item.href)}>
                  <item.icon />
                  {t(item.labelKey)}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading={t("common.buscador.campanias")}>
              {campanias.slice(0, 4).map((campania) => (
                <CommandItem
                  key={campania.id}
                  onSelect={() => go(`/campanias/${campania.id}`)}
                >
                  {campania.nombre}
                  <CommandShortcut>
                    {getProyecto(campania.proyectoId)?.nombre}
                  </CommandShortcut>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup heading={t("common.buscador.proyectos")}>
              {proyectos.slice(0, 4).map((proyecto) => (
                <CommandItem
                  key={proyecto.id}
                  onSelect={() => go(`/proyectos/${proyecto.id}`)}
                >
                  {proyecto.nombre}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup heading={t("common.buscador.cuentas")}>
              {cuentas.slice(0, 4).map((cuenta) => (
                <CommandItem
                  key={cuenta.id}
                  onSelect={() => go(`/cuentas/${cuenta.id}`)}
                >
                  {cuenta.nombre}
                  <CommandShortcut>{cuenta.tipo}</CommandShortcut>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
