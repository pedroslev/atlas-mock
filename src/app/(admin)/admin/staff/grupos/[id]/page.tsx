import { notFound } from "next/navigation";
import { PermissionGroupEditor } from "@/components/admin/staff/permission-group-editor";
import { getGroup, permissionGroups } from "@/lib/mock-staff";

export function generateStaticParams() {
  return permissionGroups.map((g) => ({ id: g.id }));
}

export default async function EditarGrupoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!getGroup(id)) notFound();
  return <PermissionGroupEditor groupId={id} />;
}
