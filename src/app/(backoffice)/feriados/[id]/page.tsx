import Link from "next/link";
import { notFound } from "next/navigation";
import { BotonConfirmar, CamposUnicos, CampoUnico } from "@/components/layout/campos-unicos";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { T } from "@/lib/i18n";
import { feriados } from "@/lib/mock-data";
import { FeriadoCalendario } from "./feriado-calendario";

export function generateStaticParams() {
  return feriados.map((f) => ({ id: f.id }));
}

export default async function EditarFeriadoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const grupo = feriados.find((f) => f.id === id);
  if (!grupo) notFound();

  return (
    <CamposUnicos>
    <div className="flex flex-col gap-6">
      <PageHeader
        title={grupo.nombre}
        backHref="/feriados"
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/feriados">
                <T k="common.acciones.cancelar" />
              </Link>
            </Button>
            <BotonConfirmar href="/feriados">
              <T k="common.acciones.confirmar" />
            </BotonConfirmar>
          </>
        }
      />

      <div className="flex max-w-md flex-col gap-1.5">
        <Label htmlFor="nombre">
          <T k="feriados.nombreGrupo" />
        </Label>
        <CampoUnico
          id="nombre"
          existentes={feriados.filter((f) => f.id !== id).map((f) => f.nombre)}
          defaultValue={grupo.nombre}
          obligatorio
        />
      </div>

      <FeriadoCalendario initialHolidays={grupo.holidays} />
    </div>
    </CamposUnicos>
  );
}
