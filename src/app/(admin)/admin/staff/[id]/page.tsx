import { notFound } from "next/navigation";
import { StaffUserEditor } from "@/components/admin/staff/staff-user-editor";
import { directoryUsers, getStaffUser } from "@/lib/mock-staff";

export function generateStaticParams() {
  return directoryUsers.map((u) => ({ id: u.directoryId }));
}

// Habilitar con la persona preelegida (desde el listado) o editar sus permisos.
export default async function EditarStaffPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!getStaffUser(id)) notFound();
  return <StaffUserEditor directoryId={id} />;
}
