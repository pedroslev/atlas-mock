"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";
import { useT } from "@/lib/i18n";

type PageHeaderProps = {
  // ReactNode y no string: los Server Components pasan <T k="…" /> acá.
  title: ReactNode;
  description?: ReactNode;
  backHref?: string;
  actions?: ReactNode;
};

export function PageHeader({
  title,
  description,
  backHref,
  actions,
}: PageHeaderProps) {
  const t = useT();
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex min-w-0 flex-col gap-1">
        {backHref && (
          <Link
            href={backHref}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="size-4" />
            {t("common.acciones.volver")}
          </Link>
        )}
        <h1 className="text-xl font-semibold text-foreground sm:text-2xl">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}
