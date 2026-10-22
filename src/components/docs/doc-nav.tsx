"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useLocale, useT } from "@/lib/i18n";
import { CATEGORIAS, contenidoDe } from "@/lib/docs/paginas";

// Menú de la documentación: categorías con sus páginas. La página abierta
// muestra debajo sus secciones, que llevan a cada ancla.
export function DocNav() {
  const t = useT();
  const { locale } = useLocale();
  const pathname = usePathname();
  const actual = pathname.split("/")[2];

  return (
    <nav
      aria-label={t("documentacion.navegacion")}
      data-testid="documentacion-nav"
      className="flex flex-col gap-5 pt-6 pb-6 text-sm lg:sticky lg:top-0 lg:max-h-[calc(100dvh-4rem)] lg:w-60 lg:shrink-0 lg:self-start lg:overflow-y-auto"
    >
      {CATEGORIAS.map((categoria) => (
        <div key={categoria.id} className="flex flex-col gap-1">
          <span className="px-2 text-xs font-medium text-muted-foreground">
            {t(`documentacion.categoria.${categoria.id}`)}
          </span>
          {categoria.paginas.map((slug) => {
            const pagina = contenidoDe(slug, locale);
            if (!pagina) return null;
            const abierta = slug === actual;
            return (
              <div key={slug} className="flex flex-col">
                <Link
                  href={`/documentacion/${slug}`}
                  data-testid={`documentacion-nav-${slug}`}
                  aria-current={abierta ? "page" : undefined}
                  className={cn(
                    "rounded-md px-2 py-1.5 hover:bg-muted",
                    abierta && "bg-muted font-medium",
                  )}
                >
                  {pagina.titulo}
                </Link>
                {abierta && (
                  <ul className="ml-3 mt-1 flex flex-col border-l border-border pl-2">
                    {pagina.secciones.map((s) => (
                      <li key={s.id}>
                        <a
                          href={`#${s.id}`}
                          data-testid={`documentacion-seccion-${s.id}`}
                          className="block rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
                        >
                          {s.titulo}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
