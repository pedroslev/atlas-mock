import { etiquetaAtender, etiquetaRechazar } from "@/lib/pad-mock/use-atajos-entrante";

// Lista común de atajos de los botones de Olimpo: mismas combinaciones que
// Hermes para confirmar y descartar, y Ctrl/Cmd+Alt+letra para el resto (la
// familia que Hermes usa para no chocar con el navegador). Quedan afuera a
// propósito las letras que Chrome o macOS ya usan con Cmd+Alt (B, C, D, F, H, I,
// J, M, U y W) y los signos que cambian de lugar según el teclado.
// Una misma combinación puede repetirse en pantallas distintas si nunca conviven
// (Cmd+Alt+S descarga errores en el importador y abre filtros en un listado).
// - `enCampo`: funciona con el foco en un campo de texto.
// - `soloEnCampo`: funciona solo ahí (formato del editor de plantillas).
export type DefinicionAtajo = {
  mod?: boolean;
  alt?: boolean;
  shift?: boolean;
  /** Tecla física (KeyboardEvent.code): con Alt, `key` cambia según el teclado. */
  code: string;
  etiqueta: (isMac: boolean) => string;
  enCampo?: boolean;
  soloEnCampo?: boolean;
};

function letra(tecla: string): DefinicionAtajo {
  return {
    mod: true,
    alt: true,
    code: /^\d$/.test(tecla) ? `Digit${tecla}` : `Key${tecla}`,
    etiqueta: (isMac) => (isMac ? `⌘⌥${tecla}` : `Ctrl+Alt+${tecla}`),
  };
}

function formato(tecla: string, shift = false): DefinicionAtajo {
  return {
    mod: true,
    shift,
    code: /^\d$/.test(tecla) ? `Digit${tecla}` : `Key${tecla}`,
    soloEnCampo: true,
    etiqueta: (isMac) =>
      isMac ? `⌘${shift ? "⇧" : ""}${tecla}` : `Ctrl+${shift ? "Shift+" : ""}${tecla}`,
  };
}

export const ATAJOS = {
  // Por tipo de botón
  confirmar: { mod: true, code: "Enter", enCampo: true, etiqueta: etiquetaAtender },
  cancelar: { code: "Escape", enCampo: true, etiqueta: () => "Esc" },
  eliminar: { mod: true, shift: true, code: "Backspace", enCampo: true, etiqueta: etiquetaRechazar },
  nuevo: letra("N"),
  nuevoSecundario: letra("G"),
  agregar: letra("A"),
  anterior: {
    mod: true,
    shift: true,
    code: "ArrowLeft",
    etiqueta: (isMac) => (isMac ? "⌘⇧←" : "Ctrl+Shift+←"),
  },
  siguiente: {
    mod: true,
    shift: true,
    code: "ArrowRight",
    etiqueta: (isMac) => (isMac ? "⌘⇧→" : "Ctrl+Shift+→"),
  },
  // Formato del editor de plantillas: los mismos del redactor de Hermes
  negrita: formato("B"),
  cursiva: formato("I"),
  tachado: formato("X", true),
  lista: formato("8", true),
  listaNumerada: formato("7", true),
  enlace: formato("K"),
  // Botones únicos
  acciones: { ...letra("."), code: "Period" },
  acercar: letra("G"),
  alejar: letra("S"),
  aplicaciones: letra("O"),
  archivo: letra("R"),
  centrar: letra("0"),
  contraer: letra("6"),
  contraerNodo: { ...letra(","), code: "Comma" },
  columnas: letra("T"),
  copiar: letra("Y"),
  cuenta: letra("Q"),
  descargar: letra("S"),
  emoji: letra("5"),
  escuchar: letra("4"),
  etiquetas: letra("E"),
  filtros: letra("S"),
  idioma: letra("L"),
  importar: letra("K"),
  limpiar: letra("Z"),
  ordenar: letra("7"),
  paleta: letra("N"),
  pantallaCompleta: letra("X"),
  probar: letra("T"),
  tema: letra("3"),
  tildar: letra("8"),
  terceraAlta: letra("E"),
  tour: letra("P"),
  variable: letra("V"),
  ver: letra("9"),
  vistaEscritorio: letra("1"),
  vistaMovil: letra("2"),
} satisfies Record<string, DefinicionAtajo>;

export type NombreAtajo = keyof typeof ATAJOS;
