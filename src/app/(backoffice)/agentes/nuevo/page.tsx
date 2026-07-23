"use client";

import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EntityCombobox } from "../../campanias/entity-combobox";
import { useT } from "@/lib/i18n";
import { gruposTrabajo } from "@/lib/mock-data";

export default function NuevoAgentePage() {
  const t = useT();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("usuarios.nuevo")}
        backHref="/agentes"
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/agentes">{t("common.acciones.cancelar")}</Link>
            </Button>
            <Button asChild>
              <Link href="/agentes">{t("usuarios.crear")}</Link>
            </Button>
          </>
        }
      />

      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>{t("usuarios.form.titulo")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="nombre">{t("common.comunes.nombre")}</Label>
            <Input id="nombre" placeholder={t("usuarios.form.nombrePlaceholder")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">{t("usuarios.email")}</Label>
            <Input
              id="email"
              type="email"
              placeholder={t("usuarios.form.emailPlaceholder")}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="grupo">{t("usuarios.form.grupo")}</Label>
            <EntityCombobox
              id="grupo"
              items={gruposTrabajo}
              placeholder={t("usuarios.form.grupoPlaceholder")}
              searchPlaceholder={t("usuarios.form.grupoBuscar")}
              emptyLabel={t("usuarios.form.grupoVacio")}
            />
            <p className="text-xs text-muted-foreground">
              {t("usuarios.form.grupoAyuda")}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
