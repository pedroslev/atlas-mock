import type { NamespaceDict } from "@/lib/i18n/dict/types";

// Estados auxiliares: catálogo de estados de no-atención (pausa, capacitación,
// reunión…). El rótulo de sección sale de `common.nav.estadosAuxiliares`.
export const estados: NamespaceDict = {
  es: {
    descripcion:
      "Definí los estados que un asesor puede seleccionar cuando no está atendiendo, como pausa, capacitación o reunión.",

    crear: "Crear estado auxiliar",
    crearEstado: "Crear estado",

    "col.estado": "Estado",
    "col.color": "Color",
    "col.icono": "Ícono",

    "dialogo.editar": "Editar {nombre}",
    "dialogo.nuevo": "Nuevo estado auxiliar",
    "dialogo.descripcion":
      "Nombre, color e ícono con los que el asesor ve este estado en su pantalla de trabajo.",
    "dialogo.placeholderNombre": "Ej: Capacitación",
    "dialogo.iconoAria": "Ícono del estado auxiliar",
  },
  en: {
    descripcion:
      "Define the states an agent can select while not handling interactions, such as break, training or meeting.",

    crear: "Create auxiliary state",
    crearEstado: "Create state",

    "col.estado": "State",
    "col.color": "Color",
    "col.icono": "Icon",

    "dialogo.editar": "Edit {nombre}",
    "dialogo.nuevo": "New auxiliary state",
    "dialogo.descripcion":
      "Name, color and icon the agent sees for this state on their work screen.",
    "dialogo.placeholderNombre": "E.g.: Training",
    "dialogo.iconoAria": "Auxiliary state icon",
  },
  pt: {
    descripcion:
      "Defina os estados que um atendente pode selecionar quando não está em atendimento, como pausa, treinamento ou reunião.",

    crear: "Criar estado auxiliar",
    crearEstado: "Criar estado",

    "col.estado": "Estado",
    "col.color": "Cor",
    "col.icono": "Ícone",

    "dialogo.editar": "Editar {nombre}",
    "dialogo.nuevo": "Novo estado auxiliar",
    "dialogo.descripcion":
      "Nome, cor e ícone com que o atendente vê este estado na tela de trabalho.",
    "dialogo.placeholderNombre": "Ex.: Treinamento",
    "dialogo.iconoAria": "Ícone do estado auxiliar",
  },
  ca: {
    descripcion:
      "Defineix els estats que un agent pot seleccionar quan no està atenent, com ara pausa, formació o reunió.",

    crear: "Crea un estat auxiliar",
    crearEstado: "Crea l'estat",

    "col.estado": "Estat",
    "col.color": "Color",
    "col.icono": "Icona",

    "dialogo.editar": "Edita {nombre}",
    "dialogo.nuevo": "Nou estat auxiliar",
    "dialogo.descripcion":
      "Nom, color i icona amb què l'agent veu aquest estat a la seva pantalla de treball.",
    "dialogo.placeholderNombre": "Ex.: Formació",
    "dialogo.iconoAria": "Icona de l'estat auxiliar",
  },
};
