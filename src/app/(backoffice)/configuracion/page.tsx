import { redirect } from "next/navigation";
import { configuracionItems } from "@/lib/nav";

// /configuracion no tiene contenido propio: abre el primer ítem del submenú. Es server component:
// no evalúa permisos (son de cliente); cada pantalla muestra su aviso si el usuario no tiene el suyo.
export default function ConfiguracionPage() {
  redirect(configuracionItems[0].href);
}
