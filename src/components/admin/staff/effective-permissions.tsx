"use client";

import { Badge } from "@/components/ui/badge";
import { regions, regionBadgeVariant } from "@/lib/mock-admin";
import {
  permissionCatalog,
  type EffectivePermissions,
} from "@/lib/mock-staff";
import { useT } from "@/lib/i18n";

// Resumen de solo lectura de lo que da un grupo de permisos: permisos por área
// y alcance por cluster. Se usa en el detalle de la persona (en vivo) y en el
// diálogo del listado.
//
// REAL: los permisos efectivos de una persona son exactamente los de su grupo
// (una persona = un grupo, sin permisos individuales) y los calcula
// `zeus-api`; la UI nunca los decide.
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
                    <Badge key={p.key} variant="secondary">
                      {t(`staff.perm.${p.labelKey}`)}
                    </Badge>
                  ))}
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}
