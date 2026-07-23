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
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useT } from "@/lib/i18n";
import { feriados, clasificacionGrupos } from "@/lib/mock-data";
import { ProyectoHerencia } from "../[id]/proyecto-herencia";
import { BusinessHoursEditor } from "../business-hours-editor";

export default function NuevoProyectoPage() {
  const t = useT();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("proyectos.nuevo.titulo")}
        backHref="/campanias"
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/campanias">{t("common.acciones.cancelar")}</Link>
            </Button>
            <Button asChild>
              <Link href="/campanias">{t("proyectos.nuevo.crear")}</Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("proyectos.nuevo.configurar")}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="nombre">{t("common.comunes.nombre")}</Label>
                <Input
                  id="nombre"
                  placeholder={t("proyectos.campos.nombrePlaceholder")}
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
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="objetivo">
                  {t("proyectos.campos.objetivo")}
                </Label>
                <Textarea
                  id="objetivo"
                  rows={3}
                  placeholder={t("common.comunes.opcional")}
                />
              </div>
            </CardContent>
          </Card>

          <ProyectoHerencia
            gruposClasificacion={clasificacionGrupos}
            feriados={feriados}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t("proyectos.horarios.titulo")}</CardTitle>
            <CardDescription>
              {t("proyectos.horarios.descripcion")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BusinessHoursEditor />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
