import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { T } from "@/lib/i18n";
import { cuentas, campanias } from "@/lib/mock-data";
import { CuentaTabs } from "./cuenta-tabs";

export function generateStaticParams() {
  return cuentas.map((c) => ({ id: c.id }));
}

// Fase 0: solo cuentas telefónicas — el tipo es fijo y los campos de
// valorización quedan ocultos (una llamada vale siempre 100: un asesor
// atiende una llamada a la vez). Feedback de producto 2026-07-16.
export default async function EditarCuentaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cuenta = cuentas.find((c) => c.id === id);
  if (!cuenta) notFound();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={cuenta.nombre}
        description={<T k="cuentas.detalle.subtitulo" />}
        backHref="/cuentas"
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/cuentas">
                <T k="common.acciones.cancelar" />
              </Link>
            </Button>
            <Button asChild>
              <Link href="/cuentas">
                <T k="common.acciones.confirmar" />
              </Link>
            </Button>
          </>
        }
      />

      <CuentaTabs
        cuenta={cuenta}
        campanias={campanias.map((c) => ({ id: c.id, nombre: c.nombre }))}
      />
    </div>
  );
}
