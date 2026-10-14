import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { T } from "@/lib/i18n";
import { clientes, getCliente } from "@/lib/mock-clientes";
import { ClienteFicha } from "./cliente-ficha";

export function generateStaticParams() {
  return clientes.map((c) => ({ id: c.id }));
}

// Ficha del cliente: solo lectura (feedback de producto 2026-10-14).
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
      <PageHeader title={<T k="clientes.ficha.titulo" />} backHref="/clientes" />
      <ClienteFicha cliente={cliente} />
    </div>
  );
}
