"use client";

import { use } from "react";
import Link from "next/link";
import { BotonConfirmar, CamposUnicos, CampoUnico } from "@/components/layout/campos-unicos";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AuxMultiSelect } from "../aux-multi-select";
import { useT } from "@/lib/i18n";
import { getGrupoTrabajo, gruposTrabajo } from "@/lib/mock-data";

// Duplicar (ATLAS-1291) abre esta misma alta con los datos del grupo original.
// MOCK: los usuarios, los permisos y el resto de la configuración no se ven acá y Crear no persiste.
// REAL: el alta recibe el grupo de origen y lo copia tal cual, con sus mismos usuarios.
export default function NuevoGrupoTrabajoPage({
  searchParams,
}: {
  searchParams: Promise<{ duplicar?: string }>;
}) {
  const t = useT();
  const { duplicar } = use(searchParams);
  const original = duplicar ? getGrupoTrabajo(duplicar) : undefined;

  return (
    <CamposUnicos>
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("grupos.nuevo")}
        backHref="/grupos-de-trabajo"
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/grupos-de-trabajo">
                {t("common.acciones.cancelar")}
              </Link>
            </Button>
            <BotonConfirmar href="/grupos-de-trabajo">{t("grupos.crear")}</BotonConfirmar>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("grupos.infoGeneral")}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="nombre">{t("common.comunes.nombre")}</Label>
              <CampoUnico
                id="nombre"
                existentes={gruposTrabajo.map((g) => g.nombre)}
                defaultValue={original?.nombre}
                obligatorio
                placeholder={t("grupos.form.nombrePlaceholder")}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="descripcion">
                {t("common.comunes.descripcion")}
              </Label>
              <Textarea
                id="descripcion"
                defaultValue={original?.descripcion}
                rows={3}
                placeholder={t("common.comunes.opcional")}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("grupos.aux.titulo")}</CardTitle>
            <CardDescription>{t("grupos.aux.descNuevo")}</CardDescription>
          </CardHeader>
          <CardContent>
            <AuxMultiSelect initialIds={original?.estadosAuxiliares ?? []} />
          </CardContent>
        </Card>
      </div>
    </div>
    </CamposUnicos>
  );
}
