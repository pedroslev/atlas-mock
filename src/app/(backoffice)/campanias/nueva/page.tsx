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
import { EntityCombobox } from "../entity-combobox";
import { CampaniaHerencia } from "../campania-herencia";
import { CampaniaHorarios } from "../campania-horarios";
import { CuentasSalientesPicker } from "../cuentas-salientes-picker";
import { useT } from "@/lib/i18n";
import { proyectos } from "@/lib/mock-data";

// Alta de campaña: lo justo y necesario. Solo nombre y proyecto son
// obligatorios (los únicos campos non-nullable en campaigns por fuera de la
// PK, ver ADR-BD-002) — todo lo demás (descripción, objetivo, herencia,
// cuentas salientes) se puede dejar en blanco y la campaña hereda del
// proyecto hasta que alguien lo redefina desde la edición.
export default function NuevaCampaniaPage() {
  const t = useT();
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("campanias.nuevaCampania")}
        description={t("campanias.nueva.descripcion")}
        backHref="/campanias"
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/campanias">{t("common.acciones.cancelar")}</Link>
            </Button>
            <Button asChild>
              <Link href="/campanias">{t("campanias.crearCampania")}</Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("campanias.infoGeneral")}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="nombre">
                  {t("common.comunes.nombre")}{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="nombre"
                  placeholder={t("campanias.nombrePlaceholder")}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="proyecto">
                  {t("campanias.proyecto")}{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <EntityCombobox
                  id="proyecto"
                  items={proyectos}
                  placeholder={t("campanias.proyectoPlaceholder")}
                  searchPlaceholder={t("campanias.proyectoBuscar")}
                  emptyLabel={t("campanias.proyectoVacio")}
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
                <Label htmlFor="objetivo">{t("campanias.objetivo")}</Label>
                <Textarea
                  id="objetivo"
                  rows={3}
                  placeholder={t("common.comunes.opcional")}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("campanias.cuentasSalientes")}</CardTitle>
              <CardDescription>
                {t("campanias.cuentasSalientesDescNueva")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CuentasSalientesPicker />
            </CardContent>
          </Card>
        </div>

        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>{t("campanias.configHeredada")}</CardTitle>
            <CardDescription>
              {t("campanias.configHeredadaDescNueva")}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <CampaniaHerencia />
            <div className="flex flex-col gap-1.5">
              <h3 className="text-sm font-medium">{t("campanias.horarios")}</h3>
              <CampaniaHorarios />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
