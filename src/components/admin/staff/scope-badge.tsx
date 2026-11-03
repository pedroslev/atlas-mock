"use client";

import { Badge } from "@/components/ui/badge";
import type { RegionScope } from "@/lib/mock-staff";
import { useT } from "@/lib/i18n";

// Rótulo del alcance: "Todas las regiones" o "N regiones".
export function ScopeBadge({ scope }: { scope: RegionScope }) {
  const t = useT();
  if (scope === "all") return <Badge variant="outline">{t("staff.alcance.todos")}</Badge>;
  return (
    <Badge variant="secondary">
      {scope.length === 1 ? t("staff.alcance.uno") : t("staff.alcance.n", { n: scope.length })}
    </Badge>
  );
}
