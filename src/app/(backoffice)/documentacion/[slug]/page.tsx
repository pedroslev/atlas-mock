"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Info } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { useLocale, useT } from "@/lib/i18n";
import { ORDEN, contenidoDe } from "@/lib/docs/paginas";
import type { Bloque } from "@/lib/docs/tipos";

// "Nombre — descripción": el nombre va en negrita.
function Fila({ texto }: { texto: string }) {
  const [nombre, ...resto] = texto.split(" — ");
  return (
    <li className="text-sm leading-relaxed">
      <span className="font-medium">{nombre}</span>
      {resto.length > 0 && <span className="text-muted-foreground"> — {resto.join(" — ")}</span>}
    </li>
  );
}

function BloqueDoc({ bloque }: { bloque: Bloque }) {
  switch (bloque.tipo) {
    case "p":
      return <p className="whitespace-pre-line text-sm leading-relaxed">{bloque.texto}</p>;
    case "sub":
      return <h3 className="mt-1 text-sm font-medium">{bloque.texto}</h3>;
    case "lista":
      return (
        <ul className="flex flex-col gap-1.5">
          {bloque.items.map((item, i) => (
            <Fila key={i} texto={item} />
          ))}
        </ul>
      );
    case "pasos":
      return (
        <ol className="flex list-decimal flex-col gap-1.5 pl-5 text-sm leading-relaxed marker:text-muted-foreground">
          {bloque.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ol>
      );
    case "codigo":
      return (
        <ul className="flex flex-col gap-1.5">
          {bloque.items.map((item, i) => (
            <li key={i}>
              <code className="block whitespace-pre-wrap rounded-md bg-muted px-2 py-1.5 font-mono text-xs">
                {item}
              </code>
            </li>
          ))}
        </ul>
      );
    case "nota":
      return (
        <div className="flex gap-2 rounded-lg border-l-2 border-secondary bg-muted/60 px-3 py-2 text-sm leading-relaxed">
          <Info className="mt-0.5 size-4 shrink-0 text-secondary" />
          <p className="whitespace-pre-line">{bloque.texto}</p>
        </div>
      );
  }
}

// Una página de la documentación: sus secciones con ancla y, al pie, los
// enlaces a la página anterior y a la siguiente del menú.
export default function DocumentacionPaginaPage() {
  const t = useT();
  const { locale } = useLocale();
  const { slug } = useParams<{ slug: string }>();
  const pagina = contenidoDe(slug, locale);
  if (!pagina) notFound();

  const posicion = ORDEN.indexOf(slug);
  const anterior = posicion > 0 ? ORDEN[posicion - 1] : undefined;
  const siguiente = posicion < ORDEN.length - 1 ? ORDEN[posicion + 1] : undefined;

  return (
    <>
      <PageHeader title={pagina.titulo} description={pagina.resumen} />
      <div className="flex max-w-3xl flex-col gap-10" data-testid={`documentacion-${slug}`}>
        {pagina.secciones.map((s) => (
          // scroll-mt: deja el título debajo del encabezado pegado al llegar por ancla.
          <section key={s.id} id={s.id} className="flex scroll-mt-28 flex-col gap-3">
            <h2 className="text-lg font-semibold">{s.titulo}</h2>
            {s.bloques.map((b, i) => (
              <BloqueDoc key={i} bloque={b} />
            ))}
          </section>
        ))}

        <div className="flex justify-between gap-4 border-t pt-4 text-sm">
          {anterior ? (
            <Link
              href={`/documentacion/${anterior}`}
              className="flex items-center gap-1 hover:underline"
              data-testid="documentacion-anterior"
            >
              <ChevronLeft className="size-4" />
              {t("documentacion.anterior")}: {contenidoDe(anterior, locale)?.titulo}
            </Link>
          ) : (
            <span />
          )}
          {siguiente && (
            <Link
              href={`/documentacion/${siguiente}`}
              className="flex items-center gap-1 hover:underline"
              data-testid="documentacion-siguiente"
            >
              {t("documentacion.siguiente")}: {contenidoDe(siguiente, locale)?.titulo}
              <ChevronRight className="size-4" />
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
