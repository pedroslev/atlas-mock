import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { listasExclusion } from "@/lib/mock-data";
import { T } from "@/lib/i18n";
import { ContactosExcluidos } from "./contactos-excluidos";

export function generateStaticParams() {
  return listasExclusion.map((l) => ({ id: l.id }));
}

export default async function EditarListaExclusionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lista = listasExclusion.find((l) => l.id === id);
  if (!lista) notFound();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={lista.nombre}
        description={
          <T
            k="listas.contactosCount"
            vars={{ n: lista.contactos.length.toLocaleString("es-AR") }}
          />
        }
        backHref="/listas-de-exclusion"
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/listas-de-exclusion">
                <T k="common.acciones.cancelar" />
              </Link>
            </Button>
            <Button>
              <T k="common.acciones.confirmar" />
            </Button>
          </>
        }
      />

      {/* Cards lado a lado a ancho completo, no apiladas (feedback 2026-07-16). */}
      <div className="grid gap-6 lg:grid-cols-[minmax(280px,420px)_1fr]">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>
              <T k="listas.datos" />
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="nombre">
                <T k="common.comunes.nombre" />
              </Label>
              <Input id="nombre" defaultValue={lista.nombre} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="tipo">
                <T k="listas.col.tipo" />
              </Label>
              {/* `value` es el valor de dominio (ListaExclusion["tipo"]), en
                  español y sin traducir; lo que se traduce es la etiqueta. */}
              <Select defaultValue={lista.tipo}>
                <SelectTrigger id="tipo" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Exclusión de tareas">
                    <T k="listas.tipo.tareas" />
                  </SelectItem>
                  <SelectItem value="Gubernamental">
                    <T k="listas.tipo.gubernamental" />
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <T k="listas.contactos.titulo" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ContactosExcluidos initialContactos={lista.contactos} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
