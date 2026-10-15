import { redirect } from "next/navigation";
import { configuracionItems } from "@/lib/nav";

// /configuracion no tiene contenido propio: abre el primer ítem del submenú.
export default function ConfiguracionPage() {
  redirect(configuracionItems[0].href);
}
