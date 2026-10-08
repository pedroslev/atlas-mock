import { notFound } from "next/navigation";
import { RegionDetalle } from "@/components/admin/region-detalle";
import { regions, getRegion } from "@/lib/mock-admin";

export function generateStaticParams() {
  return regions.map((r) => ({ id: r.id }));
}

// Detalle de una región (cluster): sus datos y las claves de los proveedores
// de IA que usan los servicios de ese cluster (ADR-DATOS-003).
export default async function RegionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const region = getRegion(id);
  if (!region) notFound();

  return <RegionDetalle region={region} />;
}
