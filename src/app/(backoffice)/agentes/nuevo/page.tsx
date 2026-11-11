"use client";

import { use, useState } from "react";
import Link from "next/link";
import { BotonConfirmar, CamposUnicos, CampoUnico } from "@/components/layout/campos-unicos";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MultiEntityCombobox } from "../../campanias/multi-entity-combobox";
import { useT } from "@/lib/i18n";
import { agentes, getGruposDeUsuario, gruposTrabajo, partirNombre } from "@/lib/mock-data";

// Duplicar (ATLAS-1291) abre esta misma alta con los datos del usuario original,
// salvo el email, que es único en toda la instalación y se carga nuevo.
// Nombre/s y Apellido/s van separados y el alta es por invitación al email
// (REAL: identity-api crea el usuario con first_name/last_name y le manda el
// mail para fijar la contraseña; el administrador no define contraseña). El
// único campo que no se repite es el email.
// MOCK: las campañas del original no se ven acá y Crear no persiste.
// REAL: la copia es un alta normal del usuario (nombre, apellido y email) y el front, en pasos
// aparte, lo agrega a los mismos grupos y campañas del original; si un paso falla, avisa
// qué quedó hecho y permite reintentar. Los permisos y estados vienen de los grupos.
// La copia nace habilitada, como cualquier alta, aunque el original esté deshabilitado.
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
  // El mock guarda el nombre completo en un solo campo: se parte en la última
  // palabra para precargar Nombre/s y Apellido/s al duplicar.
  const [nombresOriginal, apellidosOriginal] = partirNombre(original?.nombre);

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
            <Label htmlFor="email">{t("usuarios.email")}</Label>
            <CampoUnico
              id="email"
              campo="email"
              type="email"
              existentes={agentes.map((a) => a.email)}
              obligatorio
              placeholder={t("usuarios.form.emailPlaceholder")}
            />
            <p className="text-xs text-muted-foreground">{t("usuarios.form.emailAyuda")}</p>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="nombres">{t("usuarios.form.nombres")}</Label>
            <Input
              id="nombres"
              required
              autoComplete="given-name"
              defaultValue={nombresOriginal}
              placeholder={t("usuarios.form.nombresPlaceholder")}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="apellidos">{t("usuarios.form.apellidos")}</Label>
            <Input
              id="apellidos"
              required
              autoComplete="family-name"
              defaultValue={apellidosOriginal}
              placeholder={t("usuarios.form.apellidosPlaceholder")}
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
