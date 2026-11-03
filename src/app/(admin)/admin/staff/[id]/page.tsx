import { notFound } from "next/navigation";
import { StaffUserEditor } from "@/components/admin/staff/staff-user-editor";
import { seedUsers } from "@/lib/mock-staff";

export function generateStaticParams() {
  return seedUsers.map((u) => ({ id: u.directoryId }));
}

// Habilitar con la persona preelegida (desde el listado) o editar sus permisos.
export default async function EditarStaffPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!seedUsers.some((u) => u.directoryId === id)) notFound();
  return <StaffUserEditor directoryId={id} />;
}
