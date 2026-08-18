"use client";

import Image from "next/image";
import Link from "next/link";
import { SidebarTrigger } from "@/components/ui/sidebar";
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
import { mitrolSupportTech } from "@/lib/mock-admin";
import { LanguageMenu } from "@/components/layout/language-menu";
import { useT } from "@/lib/i18n";

// App bar de la Administración Mitrol: mismo Azul Institucional (#004468) y
// águila Mitrol que el backoffice. Solo el logo, sin wordmark (feedback): el
// contexto ya lo da el sidenav. El avatar es el de un TÉCNICO DE SOPORTE Mitrol
// (no un usuario de tenant). Sin app switcher: esta app no vive en la grilla de
// apps del tenant (fronted/README.md §3).
export function AdminHeader() {
  const t = useT();

  return (
    <header className="flex h-14 w-full shrink-0 items-center gap-2 bg-header px-3 text-header-foreground sm:gap-3 sm:px-4">
      <ActionTooltip label={t("common.header.menu")} shortcut={["⌘", "B"]}>
        <SidebarTrigger className="text-header-foreground hover:bg-white/10 hover:text-header-foreground md:hidden" />
      </ActionTooltip>

      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <Image
          src="/brand/logo-mitrol-aguila-roja.png"
          alt="Mitrol"
          width={1200}
          height={675}
          className="h-8 w-auto shrink-0 brightness-0 invert sm:h-10"
          priority
        />
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-1">
        <ThemeToggle />

        <LanguageMenu />

        <DropdownMenu>
          <ActionTooltip label={mitrolSupportTech.name}>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="ml-1 flex size-8 items-center justify-center rounded-full"
                aria-label={t("common.header.cuenta")}
              >
                <Avatar className="size-8">
                  <AvatarFallback className="bg-white/15 text-sm font-medium text-header-foreground">
                    {mitrolSupportTech.initials}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
          </ActionTooltip>
          <DropdownMenuContent align="end" className="min-w-52">
            <DropdownMenuLabel className="flex flex-col gap-0.5">
              <span>{mitrolSupportTech.name}</span>
              <span className="text-xs font-normal text-muted-foreground">
                {t(mitrolSupportTech.roleKey)}
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/login">{t("common.header.cerrarSesion")}</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
