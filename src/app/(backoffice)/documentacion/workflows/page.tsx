"use client";

import { PageHeader } from "@/components/layout/page-header";
import { useT } from "@/lib/i18n";

// Cada sección es un macroestado o un tema del editor de workflows. El `id` es
// el ancla a la que apunta el botón de información de cada macroestado
// (/documentacion/workflows#<id>). Los textos salen del diccionario
// `documentacion`: `<id>.titulo`, `<id>.texto`, `<id>.campo.<c>`,
// `<id>.salida.<s>` y `<id>.ejemplos.<n>`.
type Seccion = {
  id: string;
  campos?: string[];
  salidas?: string[];
  ejemplos?: number;
};

const SECCIONES: Seccion[] = [
  { id: "como-se-arma" },
  { id: "variables" },
  { id: "cel", ejemplos: 5 },
  {
    id: "reproducir",
    campos: ["fuente", "audio", "interrumpible", "mensaje"],
    salidas: ["next", "error"],
  },
  {
    id: "capturar",
    campos: ["variable", "digitos", "teclaFin", "espera", "reintentos"],
    salidas: ["complete", "timeout", "error"],
  },
  { id: "condicion", campos: ["simple", "cel"], salidas: ["true", "false"], ejemplos: 2 },
  { id: "segun-valor", campos: ["opciones"], salidas: ["default"], ejemplos: 1 },
  {
    id: "consulta-http",
    campos: ["metodo", "url", "encabezados", "cuerpo", "variable", "espera"],
    salidas: ["success", "error", "timeout"],
    ejemplos: 2,
  },
  { id: "calcular", campos: ["variable", "expresion"], salidas: ["next", "error"], ejemplos: 3 },
  { id: "derivacion", campos: ["campania"], salidas: ["out_of_hours"] },
];

const rango = (n: number) => Array.from({ length: n }, (_, i) => i + 1);

// "Nombre — descripción": el nombre va en negrita.
function Fila({ texto }: { texto: string }) {
  const [nombre, ...resto] = texto.split(" — ");
  return (
    <li className="text-sm">
      <span className="font-medium">{nombre}</span>
      {resto.length > 0 && <span className="text-muted-foreground"> — {resto.join(" — ")}</span>}
    </li>
  );
}

export default function DocumentacionWorkflowsPage() {
  const t = useT();
  const k = (clave: string) => t(`documentacion.${clave}`);

  return (
    <>
      <PageHeader title={k("titulo")} description={k("descripcion")} />
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start" data-testid="documentacion-workflows">
        <nav
          aria-label={k("indice")}
          className="flex flex-col gap-1 text-sm lg:sticky lg:top-28 lg:w-56 lg:shrink-0"
        >
          <span className="mb-1 text-xs font-medium text-muted-foreground">{k("indice")}</span>
          {SECCIONES.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              data-testid={`documentacion-indice-${s.id}`}
              className="rounded-md px-2 py-1 hover:bg-muted"
            >
              {k(`${s.id}.titulo`)}
            </a>
          ))}
        </nav>

        <div className="flex min-w-0 max-w-3xl flex-1 flex-col gap-10">
          {SECCIONES.map((s) => (
            // scroll-mt: deja el título debajo del encabezado pegado al llegar por ancla.
            <section key={s.id} id={s.id} className="flex scroll-mt-28 flex-col gap-3">
              <h2 className="text-lg font-semibold">{k(`${s.id}.titulo`)}</h2>
              {k(`${s.id}.texto`)
                .split("\n\n")
                .map((p, i) => (
                  <p key={i} className="whitespace-pre-line text-sm leading-relaxed">
                    {p}
                  </p>
                ))}
              {s.campos && (
                <>
                  <h3 className="text-sm font-medium">{k("campos")}</h3>
                  <ul className="flex flex-col gap-1.5">
                    {s.campos.map((c) => (
                      <Fila key={c} texto={k(`${s.id}.campo.${c}`)} />
                    ))}
                  </ul>
                </>
              )}
              {s.salidas && (
                <>
                  <h3 className="text-sm font-medium">{k("salidas")}</h3>
                  <ul className="flex flex-col gap-1.5">
                    {s.salidas.map((o) => (
                      <Fila key={o} texto={k(`${s.id}.salida.${o}`)} />
                    ))}
                  </ul>
                </>
              )}
              {s.ejemplos && (
                <>
                  <h3 className="text-sm font-medium">{k("ejemplos")}</h3>
                  <ul className="flex flex-col gap-1.5">
                    {rango(s.ejemplos).map((n) => (
                      <li key={n}>
                        <code className="block rounded-md bg-muted px-2 py-1.5 font-mono text-xs">
                          {k(`${s.id}.ejemplos.${n}`)}
                        </code>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
