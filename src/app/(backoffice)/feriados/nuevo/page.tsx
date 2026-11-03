"use client";

import { use } from "react";
import Link from "next/link";
import { BotonConfirmar, CamposUnicos, CampoUnico } from "@/components/layout/campos-unicos";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useT } from "@/lib/i18n";
import { feriados } from "@/lib/mock-data";
import { FeriadoCalendario } from "../[id]/feriado-calendario";

// Duplicar (ATLAS-1291) abre esta misma alta con el nombre y las fechas del grupo original.
export default function NuevoFeriadoPage({
  searchParams,
}: {
  searchParams: Promise<{ duplicar?: string }>;
}) {
  const t = useT();
  const { duplicar } = use(searchParams);
  const original = duplicar ? feriados.find((f) => f.id === duplicar) : undefined;

  return (
    <CamposUnicos>
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("feriados.nuevoGrupo")}
        backHref="/feriados"
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/feriados">{t("common.acciones.cancelar")}</Link>
            </Button>
            <BotonConfirmar href="/feriados">{t("feriados.crearGrupo")}</BotonConfirmar>
          </>
        }
      />

      <div className="flex max-w-md flex-col gap-1.5">
        <Label htmlFor="nombre">{t("feriados.nombreGrupo")}</Label>
        <CampoUnico
          id="nombre"
          existentes={feriados.map((f) => f.nombre)}
          defaultValue={original?.nombre}
          obligatorio
          placeholder={t("feriados.nombreGrupoPlaceholder")}
        />
      </div>

      <FeriadoCalendario initialHolidays={original?.holidays ?? []} />
    </div>
    </CamposUnicos>
  );
}
