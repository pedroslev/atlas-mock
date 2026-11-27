"use client";

import { PageHeader } from "@/components/layout/page-header";
import { ConectarIa } from "@/components/layout/conectar-ia";
import { useT } from "@/lib/i18n";
import { puedeConectarIa } from "@/lib/mock-claves-api";
import { ShieldAlert } from "lucide-react";

// Configuración → Conectar con IA. Pide el permiso ia.conectar de Grupos y roles.
export default function ConectarIaPage() {
  const t = useT();
  if (!puedeConectarIa()) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title={t("common.nav.conectarIa")} />
        <p className="flex items-start gap-2 text-sm text-muted-foreground" data-testid="conectar-ia-sin-acceso">
          <ShieldAlert className="mt-0.5 size-4 shrink-0" />
          {t("common.conectarIa.sinAcceso")}
        </p>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("common.nav.conectarIa")} description={t("common.conectarIa.descripcion")} />
      <ConectarIa />
    </div>
  );
}
