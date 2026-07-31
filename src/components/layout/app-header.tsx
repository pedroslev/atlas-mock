"use client";

import Image from "next/image";
import Link from "next/link";
import { Grid3x3, Search, Phone, SlidersHorizontal } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { CommandMenu } from "@/components/layout/command-menu";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { ProductTour } from "@/lib/tour/product-tour";
import { ActionTooltip } from "@/components/layout/action-tooltip";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { LanguageMenu } from "@/components/layout/language-menu";
import { useT } from "@/lib/i18n";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// El app switcher del tenant solo lista las apps del tenant (Olimpo + Hermes).
// La Administración Mitrol es interna de Mitrol y NO aparece acá
// (fronted/README.md §3). "actual" marca la app en la que se está parado.
const apps = [
  {
    name: "Olimpo",
    taglineKey: "common.apps.olimpo.tagline",
    href: "/",
    disponible: true,
    actual: true,
    icon: SlidersHorizontal,
  },
  {
    name: "Hermes",
    taglineKey: "common.apps.hermes.tagline",
    href: "/pad",
    disponible: true,
    actual: false,
    icon: Phone,
  },
];

export function AppHeader() {
  const t = useT();

  return (
    <header className="flex h-14 w-full shrink-0 items-center gap-2 bg-header px-3 text-header-foreground sm:gap-3 sm:px-4">
      <ActionTooltip label={t("common.header.menu")} shortcut={["⌘", "B"]}>
        <SidebarTrigger className="text-header-foreground hover:bg-white/10 hover:text-header-foreground md:hidden" />
      </ActionTooltip>

      <div className="flex shrink-0 items-center gap-2" data-tour="brand">
        <Image
          src="/brand/logo-mitrol-aguila-roja.png"
          alt="Mitrol"
          width={1200}
          height={675}
          className="h-8 w-auto shrink-0 sm:h-10"
          priority
        />
      </div>

      <CommandMenu>
        {(open) => (
          <>
            <div className="hidden flex-1 sm:block" data-tour="search">
              <button
                type="button"
                onClick={open}
                className="mx-auto flex w-full max-w-md items-center gap-2 rounded-lg bg-white/10 px-3 py-1.5 text-left transition-colors hover:bg-white/15 focus-visible:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-header"
              >
                <Search className="size-4 shrink-0 text-header-foreground/70" />
                <span className="flex-1 truncate text-sm text-header-foreground/70">
                  {t("common.header.buscar")}
                </span>
                <kbd className="hidden shrink-0 items-center gap-0.5 rounded-md border border-white/20 bg-white/10 px-1.5 py-0.5 font-mono text-xs text-header-foreground/70 sm:flex">
                  ⌘K
                </kbd>
              </button>
            </div>
            <ActionTooltip label={t("common.header.buscar")} shortcut={["⌘", "K"]}>
              <button
                type="button"
                onClick={open}
                className="ml-auto flex size-8 items-center justify-center rounded-lg hover:bg-white/10 sm:hidden"
                aria-label={t("common.header.buscar")}
              >
                <Search className="size-4.5" />
              </button>
            </ActionTooltip>
          </>
        )}
      </CommandMenu>

      <div className="flex items-center gap-1 max-sm:ml-1 sm:ml-auto">
        <ProductTour />

        <ThemeToggle />

        <LanguageMenu />

        <Popover>
          <ActionTooltip label="Atlas">
            <PopoverTrigger asChild>
              <button
                type="button"
                data-tour="apps"
                className="flex size-8 items-center justify-center rounded-lg hover:bg-white/10"
                aria-label={t("common.header.aplicaciones")}
              >
                <Grid3x3 className="size-4.5" />
              </button>
            </PopoverTrigger>
          </ActionTooltip>
          <PopoverContent align="end" className="w-64 p-2">
            <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
              Atlas
            </p>
            <div className="flex flex-col">
              {apps.map((app) => (
                <a
                  key={app.name}
                  href={app.href}
                  aria-current={app.actual ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors",
                    app.actual
                      ? // En dark el azul-sobre-azul del tint no se lee: el ítem
                        // activo va con un pintado blanco translúcido y letras
                        // blancas. En light se mantiene el tint de marca.
                        "bg-accent font-medium text-accent-foreground dark:bg-white/10 dark:text-white"
                      : "hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <span
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-lg",
                      app.actual
                        ? "bg-primary/10 text-primary dark:bg-white/15 dark:text-white"
                        : "bg-secondary/10 text-secondary"
                    )}
                  >
                    <app.icon className="size-4.5" />
                  </span>
                  <span className="flex flex-1 flex-col">
                    <span
                      className={cn(
                        "font-mono text-sm font-semibold tracking-wide",
                        app.actual && "text-primary dark:text-white"
                      )}
                    >
                      {app.name}
                    </span>
                    {app.taglineKey && (
                      <span className="text-xs text-muted-foreground">
                        {t(app.taglineKey)}
                      </span>
                    )}
                  </span>
                </a>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <DropdownMenu>
          <ActionTooltip label="Marina Acosta">
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                data-tour="user-menu"
                className="ml-1 flex size-8 items-center justify-center rounded-full"
                aria-label={t("common.header.cuenta")}
              >
                <Avatar className="size-8">
                  <AvatarFallback className="bg-white/15 text-sm font-medium text-header-foreground">
                    MA
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
          </ActionTooltip>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Marina Acosta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/perfil">{t("common.header.miPerfil")}</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/login">{t("common.header.cerrarSesion")}</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
