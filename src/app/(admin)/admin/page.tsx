import { redirect } from "next/navigation";

// /admin entra directo a la gestión de tenants (sección principal de Fase 0).
export default function AdminIndexPage() {
  redirect("/admin/tenants");
}
