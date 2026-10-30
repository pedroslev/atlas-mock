// MOCK: busca la plantilla en los datos de ejemplo.
// REAL: GET de la plantilla a olimpo-api (404 si no existe o es de otro tenant).

import { notFound } from "next/navigation";
import { plantillas, getPlantilla } from "@/lib/mock-data";
import { PlantillaEditor } from "@/components/plantillas/plantilla-editor";

export function generateStaticParams() {
  return plantillas.map((p) => ({ id: p.id }));
}

export default async function EditarPlantillaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const plantilla = getPlantilla(id);
  if (!plantilla) notFound();
  return <PlantillaEditor initial={plantilla} />;
}
