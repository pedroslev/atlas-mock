"use client";

import { PageHeader } from "@/components/layout/page-header";
import { ConectarIa } from "@/components/layout/conectar-ia";
import { useT } from "@/lib/i18n";

// Configuración → Conectar con IA. La ven todos los usuarios: la IA opera con sus permisos.
export default function ConectarIaPage() {
  const t = useT();
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("common.nav.conectarIa")} description={t("common.conectarIa.descripcion")} />
      <ConectarIa />
    </div>
  );
}
