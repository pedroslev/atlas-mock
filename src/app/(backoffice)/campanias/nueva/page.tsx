"use client";

import { use, useState } from "react";
import Link from "next/link";
import { BotonConfirmar, CamposUnicos, CampoUnico, useBloqueo } from "@/components/layout/campos-unicos";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
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
import { campanias, getCampania, getProyecto, proyectos } from "@/lib/mock-data";

// Alta de campaña: lo justo y necesario. Solo nombre y proyecto son
// obligatorios (los únicos campos non-nullable en campaigns por fuera de la
// PK, ver ADR-BD-002) — todo lo demás (descripción, objetivo, herencia,
// cuentas salientes) se puede dejar en blanco y la campaña hereda del
// proyecto hasta que alguien lo redefina desde la edición.
//
// Duplicar (ATLAS-1291) abre esta misma alta con los datos de la campaña original.
// MOCK: los parámetros y los agentes asociados no se ven acá y Crear no persiste.
// REAL: el alta recibe la campaña de origen y copia también parámetros y agentes.
export default function NuevaCampaniaPage({
  searchParams,
}: {
  searchParams: Promise<{ duplicar?: string }>;
}) {
  const t = useT();
  const { duplicar } = use(searchParams);
  const original = duplicar ? getCampania(duplicar) : undefined;
  const [proyectoId, setProyectoId] = useState(original?.proyectoId);
  // El alta común no nombra al proyecto; al duplicar, los textos de herencia siguen al elegido.
  const proyecto = original && proyectoId ? getProyecto(proyectoId) : undefined;
  return (
    <CamposUnicos>
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
            <BotonConfirmar href="/campanias">{t("campanias.crearCampania")}</BotonConfirmar>
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
                <CampoUnico
                  id="nombre"
                  existentes={campanias.map((c) => c.nombre)}
                  defaultValue={original?.nombre}
                  obligatorio
                  placeholder={t("campanias.nombrePlaceholder")}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="proyecto">
                  {t("campanias.proyecto")}{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <CampoProyecto value={proyectoId} onChange={setProyectoId} />
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
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="objetivo">{t("campanias.objetivo")}</Label>
                <Textarea
                  id="objetivo"
                  defaultValue={original?.objetivo}
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
              <CuentasSalientesPicker initialIds={original?.outboundAccountIds} />
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
            <CampaniaHerencia
              nombreProyecto={proyecto?.nombre}
              initialGrupoClasificacionId={original?.grupoClasificacionId}
              initialGrupoBookmarksId={original?.grupoBookmarksId}
              initialGrupoPlantillasId={original?.grupoPlantillasId}
              initialFeriadosId={original?.feriadosId}
              initialListaExclusionId={original?.listaExclusionId}
            />
            <div className="flex flex-col gap-1.5">
              <h3 className="text-sm font-medium">{t("campanias.horarios")}</h3>
              <CampaniaHorarios
                nombreProyecto={proyecto?.nombre}
                projectHours={proyecto?.businessHours}
                initialValue={original?.businessHours}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </CamposUnicos>
  );
}

function CampoProyecto({
  value,
  onChange,
}: {
  value?: string;
  onChange: (value: string | undefined) => void;
}) {
  const t = useT();
  useBloqueo("proyecto", !value);
  return (
    <EntityCombobox
      id="proyecto"
      items={proyectos}
      value={value ?? ""}
      onChange={onChange}
      placeholder={t("campanias.proyectoPlaceholder")}
      searchPlaceholder={t("campanias.proyectoBuscar")}
      emptyLabel={t("campanias.proyectoVacio")}
    />
  );
}
