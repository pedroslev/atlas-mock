"use client";

import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

export default function NuevoGrupoTrabajoPage() {
  const t = useT();

  return (
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
            <Button asChild>
              <Link href="/grupos-de-trabajo">{t("grupos.crear")}</Link>
            </Button>
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
              <Input
                id="nombre"
                placeholder={t("grupos.form.nombrePlaceholder")}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="descripcion">
                {t("common.comunes.descripcion")}
              </Label>
              <Textarea
                id="descripcion"
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
            <AuxMultiSelect initialIds={[]} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
