"use client";

import { Badge } from "@/components/ui/badge";
import { regions, regionBadgeVariant } from "@/lib/mock-admin";
import {
  permissionCatalog,
  type EffectivePermissions,
} from "@/lib/mock-staff";
import { useT } from "@/lib/i18n";

// Resumen de solo lectura de los permisos efectivos de una persona: grupos ∪
// extras, más el alcance por cluster. Se usa en el editor (en vivo) y en el
// diálogo del listado.
//
// REAL: los permisos efectivos los calcula `zeus-api` (unión de los permisos de
// los grupos y los extras); la UI nunca los decide.
export function EffectivePermissionsSummary({
  effective,
}: {
  effective: EffectivePermissions;
}) {
  const t = useT();
  const granted = new Set(effective.permissions);

  return (
    <div className="flex flex-col gap-4" data-testid="staff-efectivos">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium">{t("staff.efectivos.alcance")}:</span>
        {effective.scope === "all" ? (
          <Badge variant="outline">{t("staff.alcance.todos")}</Badge>
        ) : (
          regions
            .filter((r) => effective.scope.includes(r.id))
            .map((r) => (
              <Badge key={r.id} variant={regionBadgeVariant(r.code)}>
                {r.code}
              </Badge>
            ))
        )}
      </div>

      {effective.permissions.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {t("staff.efectivos.sinPermisos")}
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {permissionCatalog
            .filter((area) => area.permissions.some((p) => granted.has(p.key)))
            .map((area) => (
              <li
                key={area.areaKey}
                className="flex flex-wrap items-center gap-2"
                data-testid={`staff-efectivos-area-${area.areaKey}`}
              >
                <span className="w-56 text-sm">{t(`staff.area.${area.areaKey}`)}</span>
                {area.permissions
                  .filter((p) => granted.has(p.key))
                  .map((p) => (
                    <Badge
                      key={p.key}
                      variant={effective.extraOnly.includes(p.key) ? "info" : "secondary"}
                    >
                      {t(`staff.perm.${p.labelKey}`)}
                      {effective.extraOnly.includes(p.key) &&
                        ` · ${t("staff.efectivos.extra")}`}
                    </Badge>
                  ))}
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}
