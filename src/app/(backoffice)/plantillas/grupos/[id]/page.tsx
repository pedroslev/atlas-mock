// MOCK: busca el grupo en los datos de ejemplo.
// REAL: GET del grupo a olimpo-api (404 si no existe o es de otro tenant).

import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { plantillaGrupos, getPlantillaGrupo } from "@/lib/mock-data";
import { T } from "@/lib/i18n";
import { DatosGrupoPlantillas } from "./datos-grupo";
import { GrupoPlantillas } from "./grupo-plantillas";

export function generateStaticParams() {
  return plantillaGrupos.map((g) => ({ id: g.id }));
}

// Detalle de un grupo de plantillas: sus datos + qué plantillas del catálogo
// contiene. Las plantillas en sí se crean/editan desde el catálogo.
export default async function GrupoPlantillasPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const grupo = getPlantillaGrupo(id);
  if (!grupo) notFound();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={grupo.nombre}
        description={<T k="plantillas.detalle.subtitulo" />}
        backHref="/plantillas"
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/plantillas">
                <T k="common.acciones.cancelar" />
              </Link>
            </Button>
            <Button asChild>
              <Link href="/plantillas">
                <T k="common.acciones.confirmar" />
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(280px,380px)_1fr]">
        <DatosGrupoPlantillas nombre={grupo.nombre} descripcion={grupo.descripcion} />
        <GrupoPlantillas initialIds={grupo.plantillaIds} />
      </div>
    </div>
  );
}
