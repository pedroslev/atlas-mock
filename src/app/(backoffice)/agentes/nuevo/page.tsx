"use client";

import { use, useState } from "react";
import Link from "next/link";
import { BotonConfirmar, CamposUnicos, CampoUnico } from "@/components/layout/campos-unicos";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MultiEntityCombobox } from "../../campanias/multi-entity-combobox";
import { useT } from "@/lib/i18n";
import { agentes, getGruposDeUsuario, gruposTrabajo } from "@/lib/mock-data";

// Duplicar (ATLAS-1291) abre esta misma alta con los datos del usuario original,
// salvo el email, que es único en toda la instalación y se carga nuevo.
// MOCK: las campañas y los permisos y estados propios no se ven acá y Crear no persiste.
// REAL: el alta recibe el usuario de origen y copia también campañas, permisos y estados.
export default function NuevoAgentePage({
  searchParams,
}: {
  searchParams: Promise<{ duplicar?: string }>;
}) {
  const t = useT();
  const { duplicar } = use(searchParams);
  const original = duplicar ? agentes.find((a) => a.id === duplicar) : undefined;
  const [grupoIds, setGrupoIds] = useState<string[]>(
    original ? getGruposDeUsuario(original.id).map((g) => g.id) : []
  );

  return (
    <CamposUnicos>
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("usuarios.nuevo")}
        backHref="/agentes"
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/agentes">{t("common.acciones.cancelar")}</Link>
            </Button>
            <BotonConfirmar href="/agentes">{t("usuarios.crear")}</BotonConfirmar>
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
            <CampoUnico
              id="nombre"
              existentes={agentes.map((a) => a.nombre)}
              defaultValue={original?.nombre}
              obligatorio
              placeholder={t("usuarios.form.nombrePlaceholder")}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">{t("usuarios.email")}</Label>
            <CampoUnico
              id="email"
              campo="email"
              type="email"
              existentes={agentes.map((a) => a.email)}
              obligatorio
              placeholder={t("usuarios.form.emailPlaceholder")}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="grupo">{t("usuarios.form.grupo")}</Label>
            <MultiEntityCombobox
              id="grupo"
              items={gruposTrabajo}
              value={grupoIds}
              onChange={setGrupoIds}
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
    </CamposUnicos>
  );
}
