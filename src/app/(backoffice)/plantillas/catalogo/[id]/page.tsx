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
