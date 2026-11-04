import Link from "next/link";
import { notFound } from "next/navigation";
import { BotonConfirmar, CamposUnicos } from "@/components/layout/campos-unicos";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { T } from "@/lib/i18n";
import { gruposTrabajo, getGrupoTrabajo, agentes } from "@/lib/mock-data";
import { GrupoDetalleTabs } from "./grupo-detalle-tabs";

export function generateStaticParams() {
  return gruposTrabajo.map((g) => ({ id: g.id }));
}

export default async function EditarGrupoTrabajoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const grupo = getGrupoTrabajo(id);
  if (!grupo) notFound();

  return (
    <CamposUnicos>
    <div className="flex flex-col gap-6">
      <PageHeader
        title={grupo.nombre}
        backHref="/grupos-de-trabajo"
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/grupos-de-trabajo">
                <T k="common.acciones.cancelar" />
              </Link>
            </Button>
            <BotonConfirmar>
              <T k="common.acciones.confirmar" />
            </BotonConfirmar>
          </>
        }
      />

      {/* A pedido: mismas secciones que Campañas, salvo General + Usuarios
          que van juntas acá — la info general de un grupo es liviana
          (nombre y descripción nomás, a diferencia de Campañas) así que no
          justifica solapa propia; queda al lado de sus usuarios. */}
      <GrupoDetalleTabs
        grupo={grupo}
        agentes={agentes}
        nombresExistentes={gruposTrabajo.filter((g) => g.id !== id).map((g) => g.nombre)}
      />
    </div>
    </CamposUnicos>
  );
}
