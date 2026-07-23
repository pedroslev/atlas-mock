import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { T } from "@/lib/i18n";
import { campanias, getCampania, getProyecto } from "@/lib/mock-data";
import { CampaniaEditor } from "./campania-editor";

export function generateStaticParams() {
  return campanias.map((c) => ({ id: c.id }));
}

export default async function EditarCampaniaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const campania = getCampania(id);
  if (!campania) notFound();

  const proyecto = getProyecto(campania.proyectoId);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={campania.nombre}
        description={
          <T
            k="campanias.detalle.descripcion"
            vars={{ proyecto: proyecto?.nombre ?? "—" }}
          />
        }
        backHref="/campanias"
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/campanias">
                <T k="common.acciones.cancelar" />
              </Link>
            </Button>
            <Button>
              <T k="common.acciones.confirmar" />
            </Button>
          </>
        }
      />

      <CampaniaEditor campania={campania} nombreProyecto={proyecto?.nombre} />
    </div>
  );
}
