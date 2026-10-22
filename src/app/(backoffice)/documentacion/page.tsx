import { redirect } from "next/navigation";

// /documentacion abre la primera página.
export default function DocumentacionPage() {
  redirect("/documentacion/inicio");
}
