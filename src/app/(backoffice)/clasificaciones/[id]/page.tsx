import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { T } from "@/lib/i18n";
import { clasificacionGrupos, getClasificacionGrupo } from "@/lib/mock-data";
import { DatosGrupo } from "./datos-grupo";
import { GrupoMiembros } from "./grupo-miembros";

export function generateStaticParams() {
  return clasificacionGrupos.map((g) => ({ id: g.id }));
}

// Detalle de un grupo: sus datos + qué clasificaciones del pool contiene.
// Las clasificaciones en sí se crean/editan desde el pool en /clasificaciones.
export default async function GrupoClasificacionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const grupo = getClasificacionGrupo(id);
  if (!grupo) notFound();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={grupo.nombre}
        description={<T k="clasificaciones.grupo.subtitulo" />}
        backHref="/clasificaciones"
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/clasificaciones">
                <T k="common.acciones.cancelar" />
              </Link>
            </Button>
            <Button asChild>
              <Link href="/clasificaciones">
                <T k="common.acciones.confirmar" />
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(280px,380px)_1fr]">
        <DatosGrupo nombre={grupo.nombre} descripcion={grupo.descripcion} />

        <GrupoMiembros initialIds={grupo.clasificacionIds} />
      </div>
    </div>
  );
}
