import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
            <Button asChild>
              <Link href="/feriados">
                <T k="common.acciones.confirmar" />
              </Link>
            </Button>
          </>
        }
      />

      <div className="flex max-w-md flex-col gap-1.5">
        <Label htmlFor="nombre">
          <T k="feriados.nombreGrupo" />
        </Label>
        <Input id="nombre" defaultValue={grupo.nombre} />
      </div>

      <FeriadoCalendario initialHolidays={grupo.holidays} />
    </div>
  );
}
