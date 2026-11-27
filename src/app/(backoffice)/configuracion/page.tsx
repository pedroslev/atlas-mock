import { redirect } from "next/navigation";
import { configItemVisible, configuracionItems } from "@/lib/nav";

// /configuracion no tiene contenido propio: abre el primer ítem que el usuario puede ver.
export default function ConfiguracionPage() {
  redirect((configuracionItems.find(configItemVisible) ?? configuracionItems[0]).href);
}
