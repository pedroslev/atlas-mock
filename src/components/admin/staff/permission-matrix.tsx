"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { permissionCatalog } from "@/lib/mock-staff";
import { useT } from "@/lib/i18n";

// Matriz de permisos agrupada por área, con una casilla por permiso. La usa el
// editor de grupos: los permisos solo se asignan a grupos, nunca a una persona.
//
// MOCK: las reglas "editar incluye ver" se aplican acá, en el cliente.
// REAL: `zeus-api` valida el catálogo: un permiso desconocido responde 422
// (`unknown_permission`) y la regla "write incluye read" se vuelve a aplicar en
// el servidor al calcular los permisos efectivos.
export function PermissionMatrix({
  value,
  onChange,
  lockedKeys = [],
  testIdPrefix,
}: {
  value: string[];
  onChange: (keys: string[]) => void;
  /** Permisos ya otorgados por otra vía (grupo): marcados y no editables. */
  lockedKeys?: string[];
  testIdPrefix: string;
}) {
  const t = useT();

  // Marca/desmarca un permiso. Editar (`.write`) arrastra Ver; quitar Ver
  // quita también Editar, para no dejar un estado imposible.
  function toggle(key: string, checked: boolean) {
    const next = new Set(value);
    const read = key.replace(/\.write$/, ".read");
    if (checked) {
      next.add(key);
      if (key.endsWith(".write") && !lockedKeys.includes(read)) next.add(read);
    } else {
      next.delete(key);
      if (key.endsWith(".read")) next.delete(key.replace(/\.read$/, ".write"));
    }
    onChange([...next]);
  }

  return (
    <div className="flex flex-col divide-y rounded-lg border">
      {permissionCatalog.map((area) => (
        <div
          key={area.areaKey}
          className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:gap-6"
          data-testid={`${testIdPrefix}-area-${area.areaKey}`}
        >
          <div className="flex w-56 shrink-0 flex-col gap-1">
            <span className="text-sm font-medium">
              {t(`staff.area.${area.areaKey}`)}
            </span>
            {area.scoped && (
              <Badge variant="outline" className="w-fit">
                {t("staff.area.acotadaPorRegion")}
              </Badge>
            )}
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {area.permissions.map((perm) => {
              const locked = lockedKeys.includes(perm.key);
              const id = `${testIdPrefix}-${perm.key}`;
              return (
                <div key={perm.key} className="flex items-center gap-2">
                  <Checkbox
                    id={id}
                    data-testid={id}
                    checked={locked || value.includes(perm.key)}
                    disabled={locked}
                    onCheckedChange={(c) => toggle(perm.key, c === true)}
                  />
                  <Label htmlFor={id} className="font-normal">
                    {t(`staff.perm.${perm.labelKey}`)}
                  </Label>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
