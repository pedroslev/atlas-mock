"use client";

import { use } from "react";
import Link from "next/link";
import { BotonConfirmar, CamposUnicos, CampoUnico } from "@/components/layout/campos-unicos";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useT } from "@/lib/i18n";
import { listasExclusion } from "@/lib/mock-data";

// Duplicar (ATLAS-1291) abre esta misma alta con los datos de la lista original.
// ATLAS-1444: sin tipo de lista. Duplicar copia los contactos con su canal y su
// sentido; la fecha y el usuario de alta son los de la copia.
// MOCK: los contactos no se ven acá y Crear no persiste.
// REAL: el alta recibe la lista de origen y copia también los contactos.
export default function NuevaListaExclusionPage({
  searchParams,
}: {
  searchParams: Promise<{ duplicar?: string }>;
}) {
  const t = useT();
  const { duplicar } = use(searchParams);
  const original = duplicar ? listasExclusion.find((l) => l.id === duplicar) : undefined;
  return (
    <CamposUnicos>
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("listas.nueva.titulo")}
        backHref="/listas-de-exclusion"
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/listas-de-exclusion">
                {t("common.acciones.cancelar")}
              </Link>
            </Button>
            <BotonConfirmar href="/listas-de-exclusion">{t("listas.nueva.crear")}</BotonConfirmar>
          </>
        }
      />

      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>{t("listas.datos")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="nombre">{t("common.comunes.nombre")}</Label>
            <CampoUnico
              id="nombre"
              existentes={listasExclusion.map((l) => l.nombre)}
              defaultValue={original?.nombre}
              obligatorio
              placeholder={t("listas.placeholderNombre")}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="descripcion">{t("common.comunes.descripcion")}</Label>
            <Textarea
              id="descripcion"
              rows={3}
              defaultValue={original?.descripcion}
              placeholder={t("listas.placeholderDescripcion")}
            />
          </div>
        </CardContent>
      </Card>
    </div>
    </CamposUnicos>
  );
}
