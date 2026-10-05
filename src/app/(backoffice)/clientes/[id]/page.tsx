import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { T } from "@/lib/i18n";
import { getProyecto } from "@/lib/mock-data";
import { clientes, getCliente, nombreCompleto } from "@/lib/mock-clientes";
import { ClienteFicha } from "./cliente-ficha";

export function generateStaticParams() {
  return clientes.map((c) => ({ id: c.id }));
}

export default async function ClientePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cliente = getCliente(id);
  if (!cliente) notFound();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={nombreCompleto(cliente)}
        description={
          <T
            k="clientes.ficha.descripcion"
            vars={{
              doc: `${cliente.tipoDoc} ${cliente.nroDoc}`,
              proyecto: getProyecto(cliente.proyectoId)?.nombre ?? "—",
            }}
          />
        }
        backHref="/clientes"
        actions={
          <Button>
            <T k="common.acciones.guardar" />
          </Button>
        }
      />
      <ClienteFicha cliente={cliente} />
    </div>
  );
}
