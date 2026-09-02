import type { NamespaceDict } from "@/lib/i18n/dict/types";

// Cuentas (líneas telefónicas) + el editor de flujo de atención que vive en la
// solapa de derivación del detalle de cuenta. Las claves `flujo.*` las consume
// `components/workflow/workflow-editor.tsx`.
export const cuentas: NamespaceDict = {
  es: {
    "titulo": "Cuentas",
    "descripcion":
      "Administrá las líneas telefónicas por las que ingresan y se realizan las llamadas.",
    "nueva": "Nueva cuenta",

    "col.linea": "Línea",

    "nueva.titulo": "Nueva cuenta telefónica",
    "nueva.crear": "Crear cuenta",

    "detalle.subtitulo": "Cuenta telefónica",

    "datos.titulo": "Datos de la cuenta",
    "campo.linea": "Línea telefónica",
    "campo.nombrePlaceholder": "Ej: Línea Cobranzas AR",
    "campo.descripcionPlaceholder": "Para qué se usa esta cuenta",

    "tab.general": "General",
    "tab.derivacion": "Derivación",

    "derivacion.titulo": "Derivación de llamadas",
    "derivacion.descripcion":
      "Definí a qué campaña se envía cada llamada que ingresa por esta cuenta: conectá el inicio de la llamada con la campaña que la va a atender.",

    "flujo.inicio": "Inicio de interacción",
    "flujo.derivacion": "Derivación a campaña",
    "flujo.quitarNodo": "Quitar nodo",
    "flujo.quitarNodoAria": "Quitar nodo de derivación",
    "flujo.elegirCampania": "Elegir campaña…",
    "flujo.macroestados": "Macroestados",
    "flujo.ayuda":
      "Arrastralo al lienzo y conectá el inicio de interacción con la campaña de destino.",
    "flujo.pantallaCompleta": "Pantalla completa",
    "flujo.salirPantallaCompleta": "Salir de pantalla completa",
    "flujo.outOfHours": "Fuera de horario",
    "flujo.outOfHoursAyuda":
      "Salida opcional: a dónde deriva si la llamada cae fuera del horario de atención o en un feriado de la campaña elegida. Sin conectar, no se aplica ningún desvío.",
  },
  en: {
    "titulo": "Accounts",
    "descripcion":
      "Manage the phone lines that calls come in through and go out from.",
    "nueva": "New account",

    "col.linea": "Line",

    "nueva.titulo": "New phone account",
    "nueva.crear": "Create account",

    "detalle.subtitulo": "Phone account",

    "datos.titulo": "Account details",
    "campo.linea": "Phone line",
    "campo.nombrePlaceholder": "E.g. Collections Line AR",
    "campo.descripcionPlaceholder": "What this account is used for",

    "tab.general": "General",
    "tab.derivacion": "Routing",

    "derivacion.titulo": "Call routing",
    "derivacion.descripcion":
      "Define which campaign each call coming in through this account is sent to: connect the start of the call with the campaign that will handle it.",

    "flujo.inicio": "Interaction start",
    "flujo.derivacion": "Route to campaign",
    "flujo.quitarNodo": "Remove node",
    "flujo.quitarNodoAria": "Remove routing node",
    "flujo.elegirCampania": "Choose a campaign…",
    "flujo.macroestados": "Macro-states",
    "flujo.ayuda":
      "Drag it onto the canvas and connect the interaction start with the target campaign.",
    "flujo.pantallaCompleta": "Full screen",
    "flujo.salirPantallaCompleta": "Exit full screen",
    "flujo.outOfHours": "Out of hours",
    "flujo.outOfHoursAyuda":
      "Optional exit: where to route the call when it falls outside the chosen campaign's business hours or on a holiday. Unconnected, no diversion is applied.",
  },
  pt: {
    "titulo": "Contas",
    "descripcion":
      "Administre as linhas telefônicas pelas quais as chamadas entram e são feitas.",
    "nueva": "Nova conta",

    "col.linea": "Linha",

    "nueva.titulo": "Nova conta telefônica",
    "nueva.crear": "Criar conta",

    "detalle.subtitulo": "Conta telefônica",

    "datos.titulo": "Dados da conta",
    "campo.linea": "Linha telefônica",
    "campo.nombrePlaceholder": "Ex.: Linha Cobranças AR",
    "campo.descripcionPlaceholder": "Para que serve esta conta",

    "tab.general": "Geral",
    "tab.derivacion": "Encaminhamento",

    "derivacion.titulo": "Encaminhamento de chamadas",
    "derivacion.descripcion":
      "Defina para qual campanha é enviada cada chamada que entra por esta conta: conecte o início da chamada com a campanha que vai atendê-la.",

    "flujo.inicio": "Início da interação",
    "flujo.derivacion": "Encaminhamento para campanha",
    "flujo.quitarNodo": "Remover nó",
    "flujo.quitarNodoAria": "Remover nó de encaminhamento",
    "flujo.elegirCampania": "Escolher campanha…",
    "flujo.macroestados": "Macroestados",
    "flujo.ayuda":
      "Arraste-o para a tela e conecte o início da interação com a campanha de destino.",
    "flujo.pantallaCompleta": "Tela cheia",
    "flujo.salirPantallaCompleta": "Sair da tela cheia",
    "flujo.outOfHours": "Fora do horário",
    "flujo.outOfHoursAyuda":
      "Saída opcional: para onde encaminhar quando a chamada cai fora do horário de atendimento ou em feriado da campanha escolhida. Sem conectar, nenhum desvio é aplicado.",
  },
  ca: {
    "titulo": "Comptes",
    "descripcion":
      "Administra les línies telefòniques per les quals entren i es fan les trucades.",
    "nueva": "Compte nou",

    "col.linea": "Línia",

    "nueva.titulo": "Compte telefònic nou",
    "nueva.crear": "Crea el compte",

    "detalle.subtitulo": "Compte telefònic",

    "datos.titulo": "Dades del compte",
    "campo.linea": "Línia telefònica",
    "campo.nombrePlaceholder": "Ex.: Línia Cobraments AR",
    "campo.descripcionPlaceholder": "Per a què s'utilitza aquest compte",

    "tab.general": "General",
    "tab.derivacion": "Derivació",

    "derivacion.titulo": "Derivació de trucades",
    "derivacion.descripcion":
      "Defineix a quina campanya s'envia cada trucada que entra per aquest compte: connecta l'inici de la trucada amb la campanya que l'atendrà.",

    "flujo.inicio": "Inici de la interacció",
    "flujo.derivacion": "Derivació a campanya",
    "flujo.quitarNodo": "Treu el node",
    "flujo.quitarNodoAria": "Treu el node de derivació",
    "flujo.elegirCampania": "Tria una campanya…",
    "flujo.macroestados": "Macroestats",
    "flujo.ayuda":
      "Arrossega'l al llenç i connecta l'inici de la interacció amb la campanya de destinació.",
    "flujo.pantallaCompleta": "Pantalla completa",
    "flujo.salirPantallaCompleta": "Surt de la pantalla completa",
    "flujo.outOfHours": "Fora d'horari",
    "flujo.outOfHoursAyuda":
      "Sortida opcional: on derivar quan la trucada cau fora de l'horari d'atenció o en un festiu de la campanya triada. Sense connectar, no s'aplica cap desviament.",
  },
};
