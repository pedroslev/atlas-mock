"use client";

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RegionMultiSelect } from "@/components/admin/region-multi-select";
import { regions } from "@/lib/mock-admin";
import type { ClusterScope } from "@/lib/mock-staff";
import { useT } from "@/lib/i18n";

// Selector de alcance por cluster: "Todos los clusters" o una lista de
// regiones/clusters (reusa el selector de regiones de Telefonía).
//
// REAL: `zeus-api` rechaza con 422 (`unknown_cluster`) un cluster que no
// exista en `regions`; el alcance solo acota Clientes, Telefonía y Facturación.
export function ScopePicker({
  value,
  onChange,
  testIdPrefix,
}: {
  value: ClusterScope;
  onChange: (scope: ClusterScope) => void;
  testIdPrefix: string;
}) {
  const t = useT();
  const todos = value === "all";

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Switch
          id={`${testIdPrefix}-todos`}
          data-testid={`${testIdPrefix}-todos`}
          checked={todos}
          // Al apagar "todos" arranca con un cluster para no quedar sin alcance.
          onCheckedChange={(c) => onChange(c ? "all" : [regions[0].id])}
        />
        <Label htmlFor={`${testIdPrefix}-todos`}>
          {t("staff.alcance.todos")}
        </Label>
      </div>
      {!todos && (
        <RegionMultiSelect
          id={`${testIdPrefix}-clusters`}
          value={value}
          onChange={(ids) => onChange(ids.length > 0 ? ids : "all")}
        />
      )}
    </div>
  );
}
