import { PermissionGroupEditor } from "@/components/admin/staff/permission-group-editor";
import { seedGroups } from "@/lib/mock-staff";

// Solo se pre-generan los grupos de ejemplo; los creados en la sesión se
// resuelven al pedirlos y el editor los lee del store en memoria.
export function generateStaticParams() {
  return seedGroups.map((g) => ({ id: g.id }));
}

export default async function EditarGrupoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PermissionGroupEditor groupId={id} />;
}
