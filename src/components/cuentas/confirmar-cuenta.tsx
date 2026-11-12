"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useT } from "@/lib/i18n";
import {
  marcarSinConectar,
  useEstadoConexiones,
} from "@/components/workflow/estado-conexiones";

// «Confirmar» del alta y del detalle de cuenta. Si el flujo tiene partes sin
// conectar no bloquea: avisa, marca esos nodos en rojo en la solapa Flujo y deja
// elegir entre revisar o guardar igual (una salida sin conectar termina la
// interacción ahí; es trabajo que se puede terminar después).
// `data-guarda-cambios` le dice al aviso de cambios sin guardar que este link
// es la salida que guarda.
export function ConfirmarCuenta({
  href,
  // Clave del texto del botón: «Confirmar» en el detalle, «Crear cuenta» en el alta.
  etiqueta = "common.acciones.confirmar",
}: {
  href: string;
  etiqueta?: string;
}) {
  const t = useT();
  const { sinConectar } = useEstadoConexiones();
  const [abierto, setAbierto] = useState(false);

  if (sinConectar === 0) {
    return (
      <Button asChild data-guarda-cambios data-testid="confirmar-cuenta">
        <Link href={href}>{t(etiqueta)}</Link>
      </Button>
    );
  }

  return (
    <AlertDialog
      open={abierto}
      onOpenChange={(abre) => {
        setAbierto(abre);
        // Las marcas aparecen al abrir el aviso y se quedan mientras se corrige.
        if (abre) marcarSinConectar();
      }}
    >
      <AlertDialogTrigger asChild>
        <Button data-testid="confirmar-cuenta">{t(etiqueta)}</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("cuentas.flujo.sinConectar.titulo")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("cuentas.flujo.sinConectar.descripcion", { n: sinConectar })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel data-testid="revisar-flujo">
            {t("cuentas.flujo.sinConectar.revisar")}
          </AlertDialogCancel>
          <AlertDialogAction asChild data-guarda-cambios data-testid="guardar-igual">
            <Link href={href}>{t("cuentas.flujo.sinConectar.guardarIgual")}</Link>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
