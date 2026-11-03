"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Dialog } from "@/components/ui/dialog";
import { Kbd } from "@/components/ui/kbd";
import { useLocale, useT } from "@/lib/i18n";
import {
  etiquetaAtender,
  etiquetaRechazar,
  useAtajosEntrante,
} from "@/lib/pad-mock/use-atajos-entrante";
import { useIsMac } from "@/lib/pad-mock/use-is-mac";

// Aviso de cambios sin guardar (ATLAS-1288). El comportamiento está en
// documentacion/producto/funcionalidades/aviso-cambios-sin-guardar/.
//
// Como el mock no guarda nada de verdad, "hay cambios" se decide comparando lo
// que muestra la pantalla contra la foto que se saca antes del primer toque:
// si el usuario vuelve a dejar todo como estaba, no hay aviso. Lo que no se
// puede leer de la pantalla (pasos del importador, flujo, pestañas de la
// plantilla) se marca con data-no-vigilar y se informa con useCambiosDeValor.
//
// MOCK: compara la foto de la pantalla porque los formularios no tienen estado
// común ni guardan de verdad.
// REAL: "hay cambios" sale de comparar el formulario con lo último guardado, y
// guardar bien lo actualiza. Los textos, botones, atajos y salidas son estos.

// Pantallas que editan algo y guardan con un botón. Los listados no entran:
// solo tienen sus modales, y esos usan DialogConAviso.
const PANTALLAS_CON_AVISO = [
  /^\/(agentes|campanias|clasificaciones|cuentas|feriados|grupos-de-trabajo|listas-de-exclusion|marcadores|proyectos|configuracion\/claves-api|plantillas\/catalogo|plantillas\/grupos)\/[^/]+$/,
  /^\/clientes\/importar$/,
];

const CONTROLES =
  'input,textarea,select,[role="switch"],[role="checkbox"],[role="radio"],[role="combobox"],[data-valor-vigilado]';
const NO_VIGILAR = '[data-no-vigilar],.react-flow,input[type="search"]';

function fotoDeCampos(raiz: Element): string {
  const controles = Array.from(raiz.querySelectorAll<HTMLElement>(CONTROLES))
    .filter((el) => !el.closest(NO_VIGILAR))
    .map((el) => {
      const campo = el as HTMLInputElement;
      return [
        campo.value,
        campo.checked,
        el.getAttribute("aria-checked"),
        el.getAttribute("data-valor-vigilado"),
        el.getAttribute("role") === "combobox" ? el.textContent : null,
      ].join("|");
    });
  // El texto cubre lo que no es un campo: miembros agregados, fechas, chips.
  const copia = raiz.cloneNode(true) as Element;
  copia.querySelectorAll(`${NO_VIGILAR},script,style`).forEach((el) => el.remove());
  return JSON.stringify([controles, copia.textContent]);
}

function pantallaAnterior(pathname: string) {
  return pathname.split("/").slice(0, -1).join("/") || "/";
}

// Los mismos atajos que los botones de Hermes. Va aparte para escuchar el
// teclado solo mientras el aviso está abierto.
function AtajosDelAviso({
  onSeguir,
  onDescartar,
}: {
  onSeguir: () => void;
  onDescartar: () => void;
}) {
  useAtajosEntrante(onSeguir, onDescartar);
  return null;
}

function DialogoDeAviso({
  open,
  onSeguir,
  onDescartar,
}: {
  open: boolean;
  onSeguir: () => void;
  onDescartar: () => void;
}) {
  const t = useT();
  const isMac = useIsMac();
  return (
    <AlertDialog open={open} onOpenChange={(abierto) => !abierto && onSeguir()}>
      {/* Radix deja el foco en «Seguir editando» al abrir, y Esc equivale a ese
          botón. */}
      <AlertDialogContent data-testid="aviso-cambios" className="data-[size=default]:sm:max-w-xl">
        <AtajosDelAviso onSeguir={onSeguir} onDescartar={onDescartar} />
        <AlertDialogHeader>
          <AlertDialogTitle>{t("common.avisoCambios.titulo")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("common.avisoCambios.descripcion")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction
            variant="outline"
            className="text-destructive hover:text-destructive"
            onClick={onDescartar}
          >
            {t("common.avisoCambios.descartar")}
            <Kbd className="ml-1">{etiquetaRechazar(isMac)}</Kbd>
          </AlertDialogAction>
          <AlertDialogCancel variant="default">
            {t("common.avisoCambios.seguir")}
            <Kbd className="ml-1 bg-white/20 text-white">{etiquetaAtender(isMac)}</Kbd>
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

type Salida = { tipo: "ruta"; href: string } | { tipo: "atras" };

const AvisoCambiosContext = React.createContext<{
  navegar: (href: string) => void;
  reportar: (id: string, hayCambios: boolean) => void;
} | null>(null);

export function AvisoCambiosProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { locale } = useLocale();
  const [salida, setSalida] = React.useState<Salida | null>(null);

  const foto = React.useRef<string | null>(null);
  const reportados = React.useRef(new Map<string, boolean>());
  // Quedaron cambios de antes de que algo cambiara la foto (ej. el idioma).
  const forzado = React.useRef(false);
  const sucioAlTocar = React.useRef(false);
  const liberado = React.useRef(false);
  const entradaExtra = React.useRef(false);

  const hayCambios = React.useCallback(() => {
    const ruta = window.location.pathname;
    if (liberado.current || !PANTALLAS_CON_AVISO.some((r) => r.test(ruta))) return false;
    const main = document.querySelector("main");
    if (!main || main.querySelector("[data-sin-aviso]")) return false;
    if (forzado.current) return true;
    if ([...reportados.current.values()].some(Boolean)) return true;
    return foto.current !== null && fotoDeCampos(main) !== foto.current;
  }, []);

  // Cada pantalla arranca de cero.
  React.useEffect(() => {
    foto.current = null;
    forzado.current = false;
    liberado.current = false;
    entradaExtra.current = false;
  }, [pathname]);

  // Cambiar de idioma traduce la pantalla: no es un cambio del usuario.
  const primerLocale = React.useRef(true);
  React.useEffect(() => {
    if (primerLocale.current) {
      primerLocale.current = false;
      return;
    }
    const main = document.querySelector("main");
    if (foto.current === null || !main) return;
    forzado.current = forzado.current || sucioAlTocar.current;
    foto.current = fotoDeCampos(main);
  }, [locale]);

  React.useEffect(() => {
    // La foto se saca antes del primer toque, así no cuenta lo que la pantalla
    // acomoda sola al abrir. Ahí también se suma una entrada al historial para
    // poder frenar la flecha "atrás" del navegador.
    const alTocar = () => {
      const main = document.querySelector("main");
      if (!main || !PANTALLAS_CON_AVISO.some((r) => r.test(window.location.pathname))) return;
      if (foto.current === null) {
        foto.current = fotoDeCampos(main);
        if (!entradaExtra.current) {
          entradaExtra.current = true;
          window.history.pushState(window.history.state, "", window.location.href);
        }
      }
      sucioAlTocar.current = hayCambios();
    };

    const frenarLink = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const link = (e.target as Element).closest?.<HTMLAnchorElement>("a[href]");
      if (!link || link.target === "_blank" || link.closest("[data-guarda-cambios]")) return;
      const url = new URL(link.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;
      if (!hayCambios()) return;
      e.preventDefault();
      e.stopPropagation();
      setSalida({ tipo: "ruta", href: url.pathname + url.search + url.hash });
    };

    // Los botones de guardar que no salen de la pantalla dejan todo como nuevo.
    const alGuardar = (e: MouseEvent) => {
      if (e.defaultPrevented) return;
      if (!(e.target as Element).closest?.("[data-guarda-cambios]")) return;
      setTimeout(() => {
        const main = document.querySelector("main");
        if (!main) return;
        forzado.current = false;
        foto.current = fotoDeCampos(main);
      }, 0);
    };

    const alCerrarPestania = (e: BeforeUnloadEvent) => {
      if (hayCambios()) e.preventDefault();
    };

    const alIrAtras = () => {
      if (!entradaExtra.current) return;
      if (hayCambios()) {
        window.history.pushState(window.history.state, "", window.location.href);
        setSalida({ tipo: "atras" });
      } else {
        entradaExtra.current = false;
        window.history.back();
      }
    };

    document.addEventListener("pointerdown", alTocar, true);
    document.addEventListener("keydown", alTocar, true);
    document.addEventListener("click", frenarLink, true);
    document.addEventListener("click", alGuardar);
    window.addEventListener("beforeunload", alCerrarPestania);
    window.addEventListener("popstate", alIrAtras);
    return () => {
      document.removeEventListener("pointerdown", alTocar, true);
      document.removeEventListener("keydown", alTocar, true);
      document.removeEventListener("click", frenarLink, true);
      document.removeEventListener("click", alGuardar);
      window.removeEventListener("beforeunload", alCerrarPestania);
      window.removeEventListener("popstate", alIrAtras);
    };
  }, [hayCambios]);

  const navegar = React.useCallback(
    (href: string) => {
      if (hayCambios()) setSalida({ tipo: "ruta", href });
      else router.push(href);
    },
    [hayCambios, router]
  );

  const reportar = React.useCallback((id: string, valor: boolean) => {
    reportados.current.set(id, valor);
  }, []);

  function descartar() {
    const destino = salida;
    setSalida(null);
    liberado.current = true;
    entradaExtra.current = false;
    if (destino?.tipo === "ruta") {
      router.push(destino.href);
    } else if (destino?.tipo === "atras") {
      const ruta = window.location.pathname;
      window.history.go(-2);
      // Si la pantalla se abrió directo no hay a dónde volver: sube un nivel.
      setTimeout(() => {
        if (window.location.pathname === ruta) router.push(pantallaAnterior(ruta));
      }, 400);
    }
  }

  const valor = React.useMemo(() => ({ navegar, reportar }), [navegar, reportar]);

  return (
    <AvisoCambiosContext.Provider value={valor}>
      {children}
      <DialogoDeAviso
        open={salida !== null}
        onSeguir={() => setSalida(null)}
        onDescartar={descartar}
      />
    </AvisoCambiosContext.Provider>
  );
}

// Para salir por código (el buscador ⌘K), no por un link.
export function useNavegarConAviso() {
  const contexto = React.useContext(AvisoCambiosContext);
  const router = useRouter();
  return contexto?.navegar ?? router.push;
}

// Informa cambios que no se pueden leer de la pantalla: compara `valor` contra
// el primero que recibe con `listo` en true.
export function useCambiosDeValor(id: string, valor: unknown, listo = true) {
  const contexto = React.useContext(AvisoCambiosContext);
  const reportar = contexto?.reportar;
  const firma = JSON.stringify(valor, (clave, v) => (clave === "colapsado" ? undefined : v));
  const inicial = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (!listo) return;
    if (inicial.current === null) inicial.current = firma;
    reportar?.(id, firma !== inicial.current);
  }, [id, firma, listo, reportar]);

  React.useEffect(() => () => reportar?.(id, false), [id, reportar]);
}

// Reemplaza a Dialog en los modales con formulario. Cancelar tiene que ser un
// DialogClose: así pasa por acá igual que la X, Esc y el clic afuera. Guardar
// cierra cambiando `open` desde afuera, y por eso no avisa.
export function DialogConAviso({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}) {
  const [avisando, setAvisando] = React.useState(false);
  const foto = React.useRef<string | null>(null);

  const contenido = () => {
    const abiertos = document.querySelectorAll('[data-slot="dialog-content"]');
    return abiertos[abiertos.length - 1] ?? null;
  };

  React.useEffect(() => {
    if (!open) {
      foto.current = null;
      return;
    }
    // Se espera a que el contenido del modal esté en pantalla.
    const pedido = setTimeout(() => {
      const el = contenido();
      if (el) foto.current = fotoDeCampos(el);
    }, 50);
    return () => clearTimeout(pedido);
  }, [open]);

  function alCambiar(abierto: boolean) {
    const el = contenido();
    if (!abierto && el && foto.current !== null && fotoDeCampos(el) !== foto.current) {
      setAvisando(true);
      return;
    }
    onOpenChange(abierto);
  }

  return (
    <>
      <Dialog open={open} onOpenChange={alCambiar}>
        {children}
      </Dialog>
      <DialogoDeAviso
        open={avisando}
        onSeguir={() => setAvisando(false)}
        onDescartar={() => {
          setAvisando(false);
          onOpenChange(false);
        }}
      />
    </>
  );
}
