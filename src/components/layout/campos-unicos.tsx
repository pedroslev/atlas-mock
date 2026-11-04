"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ComponentProps,
  type ReactNode,
} from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { seRepite } from "@/lib/campos-unicos";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type CampoRepetido = "nombre" | "nombrePadre" | "email" | "idExterno";

type Bloqueos = {
  bloqueados: ReadonlySet<string>;
  marcar: (id: string, bloqueado: boolean) => void;
};

const BloqueosContext = createContext<Bloqueos | null>(null);

// Une los campos de una pantalla con su botón de confirmar, que están en lugares
// distintos del árbol (el botón va en el PageHeader).
export function CamposUnicos({ children }: { children: ReactNode }) {
  const [bloqueados, setBloqueados] = useState<ReadonlySet<string>>(new Set());
  const marcar = useCallback((id: string, bloqueado: boolean) => {
    setBloqueados((prev) => {
      if (prev.has(id) === bloqueado) return prev;
      const next = new Set(prev);
      if (bloqueado) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);
  const value = useMemo(() => ({ bloqueados, marcar }), [bloqueados, marcar]);
  return <BloqueosContext.Provider value={value}>{children}</BloqueosContext.Provider>;
}

/** Bloquea el botón de la pantalla mientras `bloqueado` sea verdadero. */
export function useBloqueo(id: string, bloqueado: boolean) {
  const marcar = useContext(BloqueosContext)?.marcar;
  useEffect(() => {
    marcar?.(id, bloqueado);
    return () => marcar?.(id, false);
  }, [id, bloqueado, marcar]);
}

export function MensajeRepetido({ campo = "nombre" }: { campo?: CampoRepetido }) {
  const t = useT();
  return <span className="text-xs text-destructive">{t(`common.repetido.${campo}`)}</span>;
}

// Input que se marca en rojo si el valor ya existe. Al duplicar, el valor del
// original está en `existentes`, así que el campo abre en rojo sin lógica aparte.
export function CampoUnico({
  id,
  existentes,
  defaultValue = "",
  obligatorio = false,
  campo = "nombre",
  ...props
}: Omit<ComponentProps<typeof Input>, "id" | "defaultValue" | "value" | "onChange"> & {
  id: string;
  existentes: (string | undefined)[];
  defaultValue?: string;
  obligatorio?: boolean;
  campo?: CampoRepetido;
}) {
  const [valor, setValor] = useState(defaultValue);
  const repetido = seRepite(valor, existentes);
  useBloqueo(id, repetido || (obligatorio && !valor.trim()));

  return (
    <>
      <Input
        {...props}
        id={id}
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        aria-invalid={repetido}
      />
      {repetido && <MensajeRepetido campo={campo} />}
    </>
  );
}

// Botón de confirmar de una pantalla. Con `href` navega al confirmar (lo que ya hacen
// las altas del mock); deshabilitado no navega, igual que en el editor de plantillas.
export function BotonConfirmar({ href, children }: { href?: string; children: ReactNode }) {
  const bloqueado = (useContext(BloqueosContext)?.bloqueados.size ?? 0) > 0;
  // data-guarda-cambios (ATLAS-1288): confirmar deja la pantalla como guardada, salvo que esté bloqueado.
  if (!href) return <Button disabled={bloqueado} data-guarda-cambios>{children}</Button>;
  return (
    <Button asChild data-guarda-cambios className={cn(bloqueado && "cursor-not-allowed opacity-50")}>
      <Link
        href={href}
        aria-disabled={bloqueado}
        tabIndex={bloqueado ? -1 : undefined}
        onClick={(e) => {
          if (bloqueado) e.preventDefault();
        }}
      >
        {children}
      </Link>
    </Button>
  );
}
