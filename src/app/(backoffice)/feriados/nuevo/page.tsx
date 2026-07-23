"use client";

import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useT } from "@/lib/i18n";
import { FeriadoCalendario } from "../[id]/feriado-calendario";

export default function NuevoFeriadoPage() {
  const t = useT();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("feriados.nuevoGrupo")}
        backHref="/feriados"
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/feriados">{t("common.acciones.cancelar")}</Link>
            </Button>
            <Button asChild>
              <Link href="/feriados">{t("feriados.crearGrupo")}</Link>
            </Button>
          </>
        }
      />

      <div className="flex max-w-md flex-col gap-1.5">
        <Label htmlFor="nombre">{t("feriados.nombreGrupo")}</Label>
        <Input
          id="nombre"
          placeholder={t("feriados.nombreGrupoPlaceholder")}
        />
      </div>

      <FeriadoCalendario initialHolidays={[]} />
    </div>
  );
}
