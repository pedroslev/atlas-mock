import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { ConfirmarCuenta } from "@/components/cuentas/confirmar-cuenta";
import { T } from "@/lib/i18n";
import { campanias } from "@/lib/mock-data";
import { CuentaForm } from "@/components/cuentas/cuenta-form";

// Alta de cuenta: datos generales y flujo en la misma pantalla (CuentaForm),
// para crear la cuenta y definir su flujo de una vez. Sin campos de
// valorización (una interacción vale siempre 100).
export default function NuevaCuentaPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={<T k="cuentas.nueva.titulo" />}
        backHref="/cuentas"
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/cuentas">
                <T k="common.acciones.cancelar" />
              </Link>
            </Button>
            <ConfirmarCuenta href="/cuentas" etiqueta="cuentas.nueva.crear" />
          </>
        }
      />

      <CuentaForm campanias={campanias.map((c) => ({ id: c.id, nombre: c.nombre }))} />
    </div>
  );
}
