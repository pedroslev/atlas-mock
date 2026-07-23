import { redirect } from "next/navigation";

// La lista standalone de proyectos ya no existe: los proyectos se gestionan
// desde Campañas (agrupadas por proyecto) — feedback de producto 2026-07-16.
// Se conserva la ruta solo para redirigir el código/enlaces viejos; las rutas
// /proyectos/nuevo y /proyectos/[id] siguen vivas (se llega desde Campañas).
export default function ProyectosPage() {
  redirect("/campanias");
}
