"use client";

import { Receipt } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { useT } from "@/lib/i18n";

// Facturación (billing_events, base Global). El ADR-BD-001 deja el ENUM `type`
// y el JSONB `content` SIN DEFINIR (preguntas abiertas), así que esta pantalla
// es deliberadamente un placeholder: no se muestra ningún dato, solo un
// empty-state que comunica que la sección está pendiente de desarrollo.
export default function FacturacionPage() {
  const t = useT();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("admin.facturacion.titulo")}
        description={t("admin.facturacion.descripcion")}
      />

      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
          <span className="flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <Receipt className="size-6" />
          </span>
          <h2 className="text-base font-medium text-foreground">
            {t("admin.facturacion.vacio.titulo")}
          </h2>
          <p className="max-w-[52ch] text-sm text-muted-foreground">
            {t("admin.facturacion.vacio.descripcion")}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
