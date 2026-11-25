"use client";

import { Label } from "@/components/ui/label";
import { useT } from "@/lib/i18n";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EntityCombobox } from "../../campanias/entity-combobox";
import {
  clasificacionGrupos,
  marcadorGrupos,
  plantillaGrupos,
  feriados,
  listasExclusion,
} from "@/lib/mock-data";

// Configuración por defecto del proyecto: los cinco valores que sus campañas
// heredan mientras no los redefinan (ATLAS-1432). Son los mismos cinco campos
// y en el mismo orden que la tarjeta de herencia de la campaña
// (campanias/campania-herencia.tsx); si se suma uno allá, se suma acá.
// Sin persistencia real: el combobox guarda su propia selección (PRODUCT.md).
export function ProyectoHerencia({
  initialGrupoClasificacionId,
  initialGrupoBookmarksId,
  initialGrupoPlantillasId,
  initialFeriadosId,
  initialListaExclusionId,
}: {
  initialGrupoClasificacionId?: string;
  initialGrupoBookmarksId?: string;
  initialGrupoPlantillasId?: string;
  initialFeriadosId?: string;
  initialListaExclusionId?: string;
}) {
  const t = useT();

  // Un campo por valor heredable. Los textos de marcas, plantillas y lista de
  // exclusión son los mismos que usa la campaña para esos campos.
  const campos = [
    {
      id: "grupo-clasificacion",
      label: t("proyectos.herencia.grupoClasificacion"),
      items: clasificacionGrupos,
      inicial: initialGrupoClasificacionId,
      buscar: t("proyectos.herencia.buscarGrupo"),
      vacio: t("proyectos.herencia.sinGrupos"),
    },
    {
      id: "grupo-bookmarks",
      label: t("campanias.grupoMarcas"),
      items: marcadorGrupos,
      inicial: initialGrupoBookmarksId,
      buscar: t("campanias.buscarGrupoMarcas"),
      vacio: t("campanias.vacioGrupoMarcas"),
    },
    {
      id: "grupo-plantillas",
      label: t("plantillas.campania.grupo"),
      items: plantillaGrupos,
      inicial: initialGrupoPlantillasId,
      buscar: t("plantillas.campania.buscarGrupo"),
      vacio: t("plantillas.campania.vacioGrupo"),
    },
    {
      id: "grupo-feriados",
      label: t("proyectos.herencia.grupoFeriados"),
      items: feriados,
      inicial: initialFeriadosId,
      buscar: t("proyectos.herencia.buscarGrupoFeriados"),
      vacio: t("proyectos.herencia.sinGruposFeriados"),
    },
    {
      id: "lista-exclusion",
      label: t("campanias.listaExclusion"),
      items: listasExclusion,
      inicial: initialListaExclusionId,
      buscar: t("campanias.buscarListaExclusion"),
      vacio: t("campanias.vacioListaExclusion"),
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("proyectos.herencia.titulo")}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {campos.map((campo) => (
          <div key={campo.id} className="flex flex-col gap-1.5">
            <Label htmlFor={campo.id}>{campo.label}</Label>
            <EntityCombobox
              id={campo.id}
              items={campo.items}
              defaultValue={campo.inicial}
              placeholder={t("proyectos.herencia.sinAsignar")}
              searchPlaceholder={campo.buscar}
              emptyLabel={campo.vacio}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
