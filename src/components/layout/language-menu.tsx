"use client";

import { Globe, Check } from "lucide-react";
import { ActionTooltip } from "@/components/layout/action-tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LOCALES, LOCALE_META, useLocale, useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

// Selector de idioma, único para las tres apps (Olimpo, Hermes y la consola
// Mitrol) — antes estaba triplicado e inline en cada header. Muestra el código
// ISO en un chip en vez de banderas: un idioma no es un país (Portugués: PT/BR;
// Catalán directamente no tiene bandera emoji con soporte real).
export function LanguageMenu() {
  const { locale, setLocale } = useLocale();
  const t = useT();

  return (
    <DropdownMenu>
      <ActionTooltip label={t("common.header.idioma")}>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex size-8 items-center justify-center rounded-lg text-sm font-medium hover:bg-white/10"
            aria-label={t("common.header.idioma")}
          >
            <Globe className="size-4.5" />
          </button>
        </DropdownMenuTrigger>
      </ActionTooltip>
      <DropdownMenuContent align="end" className="min-w-44">
        {LOCALES.map((code) => {
          const meta = LOCALE_META[code];
          const active = code === locale;
          return (
            <DropdownMenuItem
              key={code}
              onSelect={() => setLocale(code)}
              aria-current={active ? "true" : undefined}
              className={cn(active && "font-medium")}
            >
              <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-muted font-mono text-[0.625rem] font-semibold tracking-wide text-muted-foreground">
                {meta.code}
              </span>
              <span className="flex-1">{meta.label}</span>
              <Check className={cn("size-4", active ? "opacity-100" : "opacity-0")} />
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
