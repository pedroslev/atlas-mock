"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { ActionTooltip } from "@/components/layout/action-tooltip";
import { useT } from "@/lib/i18n";

const STORAGE_KEY = "atlas-theme";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);
  const t = useT();

  useEffect(() => {
    // Sync from the DOM (set synchronously by the anti-flash script in
    // layout.tsx before hydration) — same "read external state on mount"
    // pattern already used by hooks/use-mobile.ts in this codebase.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem(STORAGE_KEY, next ? "dark" : "light");
  }

  const label = dark
    ? t("common.header.temaClaro")
    : t("common.header.temaOscuro");

  return (
    <ActionTooltip label={label}>
      <button
        type="button"
        onClick={toggle}
        data-tour="theme-toggle"
        className="flex size-8 items-center justify-center rounded-lg hover:bg-white/10"
        aria-label={label}
      >
        {dark ? <Sun className="size-4.5" /> : <Moon className="size-4.5" />}
      </button>
    </ActionTooltip>
  );
}
