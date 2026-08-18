"use client";

import Image from "next/image";
import Link from "next/link";
import { Grid3x3, Phone, SlidersHorizontal } from "lucide-react";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { ActionTooltip } from "@/components/layout/action-tooltip";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { agentePad } from "@/lib/mock-pad";
import { cn } from "@/lib/utils";
import { LanguageMenu } from "@/components/layout/language-menu";
import { useT } from "@/lib/i18n";

// App switcher del tenant: Olimpo (backoffice) + Hermes (pad). Hermes es la app
// actual acá. La Administración Mitrol es interna y NO aparece (README §3).
const apps = [
  {
    name: "Olimpo",
    taglineKey: "common.apps.olimpo.tagline",
    href: "/",
    actual: false,
    icon: SlidersHorizontal,
  },
  {
    name: "Hermes",
    taglineKey: "common.apps.hermes.tagline",
    href: "/pad",
    actual: true,
    icon: Phone,
  },
];

// Header propio del pad (no reusa el del backoffice: no lleva SidebarTrigger ni
// buscador global, y suma el selector de estado del agente — el control que
// define al pad). Mismo App Bar Azul Institucional y mismo app switcher: "un
// solo producto, no dos apps".
export function PadHeader() {
  const t = useT();

  return (
    <header className="flex h-14 w-full shrink-0 items-center gap-3 bg-header px-4 text-header-foreground">
      <div className="flex items-center gap-2">
        <Image
          src="/brand/logo-mitrol-aguila-roja.png"
          alt="Mitrol"
          width={1200}
          height={675}
          className="h-10 w-auto shrink-0 brightness-0 invert"
          priority
        />
      </div>

      <div className="flex items-center gap-1 max-sm:ml-auto sm:ml-auto">
        <ThemeToggle />

        <LanguageMenu />

        <Popover>
          <ActionTooltip label="Atlas">
            <PopoverTrigger asChild>
              <button
                type="button"
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
                      ? "bg-accent font-medium text-accent-foreground"
                      : "hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <span
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-lg",
                      app.actual
                        ? "bg-primary/10 text-primary"
                        : "bg-secondary/10 text-secondary"
                    )}
                  >
                    <app.icon className="size-4.5" />
                  </span>
                  <span className="flex flex-1 flex-col">
                    <span
                      className={cn(
                        "font-mono text-sm font-semibold tracking-wide",
                        app.actual && "text-primary"
                      )}
                    >
                      {app.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {t(app.taglineKey)}
                    </span>
                  </span>
                </a>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <DropdownMenu>
          <ActionTooltip label={agentePad.nombre}>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="ml-1 flex size-8 items-center justify-center rounded-full"
                aria-label={t("common.header.cuenta")}
              >
                <Avatar className="size-8">
                  <AvatarFallback className="bg-white/15 text-sm font-medium text-header-foreground">
                    {agentePad.iniciales}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
          </ActionTooltip>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{agentePad.nombre}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {/* Mismo destino que en Olimpo: el perfil y el logout son de la
                plataforma, no de una app puntual. */}
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
