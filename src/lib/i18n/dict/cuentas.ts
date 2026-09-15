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

    "uso.titulo": "Uso de la línea",
    "uso.descripcion":
      "Primero definí para qué se va a usar la línea: lo que se puede hacer depende del proveedor de tu región, así que los números se ofrecen recién después.",
    "uso.paso1": "¿Para qué se usa esta línea?",
    "uso.paso2": "¿Qué ve el destinatario cuando llamás?",
    "uso.paso3": "Elegí el número",
    "uso.elegiUsoPrimero":
      "Elegí primero para qué se va a usar la línea; con eso se filtran los números que podés usar.",
    "uso.entrante": "Recibe llamadas",
    "uso.entranteDesc": "Las llamadas entran por acá y se derivan a una campaña.",
    "uso.saliente": "Origina llamadas",
    "uso.salienteDesc": "Se usa para llamar desde las campañas.",
    "uso.ambas": "Las dos cosas",
    "uso.ambasDesc": "Recibe y origina llamadas por la misma línea.",
    "uso.salidaMisma": "El mismo número por el que entran",
    "uso.salidaMismaDesc": "El destinatario puede devolver el llamado y entra por esta cuenta.",
    "uso.salidaPropio": "Otro número propio",
    "uso.salidaPropioDesc": "Se muestra otro de los números disponibles en tu región.",
    "uso.salidaAleatorio": "Número aleatorio",
    "uso.salidaAleatorioDesc": "Cada llamada sale con un número distinto.",
    "uso.salidaOculto": "Número oculto",
    "uso.salidaOcultoDesc": "La llamada sale sin mostrar ningún número.",
    "uso.sinProveedorAleatorio":
      "No disponible: ningún proveedor de tu región ({region}) permite salir con número aleatorio.",
    "uso.sinProveedorOculto":
      "No disponible: ningún proveedor de tu región ({region}) permite salir con número oculto.",
    "uso.sinTarifas":
      "No disponible: tu región no tiene tarifas cargadas para elegir por dónde sale la llamada.",
    "uso.validadoRegion":
      "Las opciones se habilitan según lo que permitan los proveedores de tu región ({region}).",
    "uso.lineaEntrante": "Número por el que entran las llamadas",
    "uso.lineaSaliente": "Número que se muestra al llamar",
    "uso.elegirLinea": "Elegir un número…",
    "uso.soloDisponibles":
      "Solo se muestran las líneas disponibles en tu región ({region}) y todavía no asignadas a otra cuenta.",
    "uso.sinNumeroElegible":
      "Con esta opción no elegís número: la plataforma resuelve por dónde sale cada llamada.",
    "uso.noEncuentroNumero": "No encuentro mi número",
    "uso.numeroPropioAviso": "Requiere que Mitrol dé de alta tu proveedor",
    "col.uso": "Uso",

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

    "uso.titulo": "Line usage",
    "uso.descripcion":
      "First define what the line is for: what it can do depends on your region's carrier, so numbers are offered only afterwards.",
    "uso.paso1": "What is this line used for?",
    "uso.paso2": "What does the other party see when you call?",
    "uso.paso3": "Choose the number",
    "uso.elegiUsoPrimero":
      "Choose what the line is for first; that filters the numbers you can use.",
    "uso.entrante": "Receives calls",
    "uso.entranteDesc": "Calls come in here and are routed to a campaign.",
    "uso.saliente": "Places calls",
    "uso.salienteDesc": "Used to call out from campaigns.",
    "uso.ambas": "Both",
    "uso.ambasDesc": "Receives and places calls on the same line.",
    "uso.salidaMisma": "The same number calls come in on",
    "uso.salidaMismaDesc": "The other party can call back and reaches this account.",
    "uso.salidaPropio": "Another own number",
    "uso.salidaPropioDesc": "Shows another number available in your region.",
    "uso.salidaAleatorio": "Random number",
    "uso.salidaAleatorioDesc": "Each call goes out with a different number.",
    "uso.salidaOculto": "Hidden number",
    "uso.salidaOcultoDesc": "The call goes out without showing any number.",
    "uso.sinProveedorAleatorio":
      "Not available: no carrier in your region ({region}) allows calling out with a random number.",
    "uso.sinProveedorOculto":
      "Not available: no carrier in your region ({region}) allows calling out with a hidden number.",
    "uso.sinTarifas":
      "Not available: your region has no rates loaded to choose how the call goes out.",
    "uso.validadoRegion":
      "Options are enabled based on what your region's carriers allow ({region}).",
    "uso.lineaEntrante": "Number calls come in on",
    "uso.lineaSaliente": "Number shown when calling",
    "uso.elegirLinea": "Choose a number…",
    "uso.soloDisponibles":
      "Only lines available in your region ({region}) and not yet assigned to another account are listed.",
    "uso.sinNumeroElegible":
      "With this option you don't pick a number: the platform decides how each call goes out.",
    "uso.noEncuentroNumero": "I can't find my number",
    "uso.numeroPropioAviso": "Requires Mitrol to onboard your carrier",
    "col.uso": "Usage",

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

    "uso.titulo": "Uso da linha",
    "uso.descripcion":
      "Primeiro defina para que a linha vai servir: o que ela pode fazer depende da operadora da sua região, então os números são oferecidos só depois.",
    "uso.paso1": "Para que serve esta linha?",
    "uso.paso2": "O que o destinatário vê quando você liga?",
    "uso.paso3": "Escolha o número",
    "uso.elegiUsoPrimero":
      "Escolha primeiro para que a linha vai servir; isso filtra os números que você pode usar.",
    "uso.entrante": "Recebe chamadas",
    "uso.entranteDesc": "As chamadas entram por aqui e são encaminhadas a uma campanha.",
    "uso.saliente": "Origina chamadas",
    "uso.salienteDesc": "Usada para ligar a partir das campanhas.",
    "uso.ambas": "As duas coisas",
    "uso.ambasDesc": "Recebe e origina chamadas pela mesma linha.",
    "uso.salidaMisma": "O mesmo número pelo qual entram",
    "uso.salidaMismaDesc": "O destinatário pode retornar a ligação e cai nesta conta.",
    "uso.salidaPropio": "Outro número próprio",
    "uso.salidaPropioDesc": "Mostra outro dos números disponíveis na sua região.",
    "uso.salidaAleatorio": "Número aleatório",
    "uso.salidaAleatorioDesc": "Cada chamada sai com um número diferente.",
    "uso.salidaOculto": "Número oculto",
    "uso.salidaOcultoDesc": "A chamada sai sem mostrar nenhum número.",
    "uso.sinProveedorAleatorio":
      "Indisponível: nenhuma operadora da sua região ({region}) permite sair com número aleatório.",
    "uso.sinProveedorOculto":
      "Indisponível: nenhuma operadora da sua região ({region}) permite sair com número oculto.",
    "uso.sinTarifas":
      "Indisponível: sua região não tem tarifas carregadas para escolher por onde sai a chamada.",
    "uso.validadoRegion":
      "As opções são habilitadas conforme o que permitem as operadoras da sua região ({region}).",
    "uso.lineaEntrante": "Número pelo qual entram as chamadas",
    "uso.lineaSaliente": "Número exibido ao ligar",
    "uso.elegirLinea": "Escolher um número…",
    "uso.soloDisponibles":
      "Só aparecem as linhas disponíveis na sua região ({region}) e ainda não atribuídas a outra conta.",
    "uso.sinNumeroElegible":
      "Com esta opção você não escolhe número: a plataforma resolve por onde sai cada chamada.",
    "uso.noEncuentroNumero": "Não encontro meu número",
    "uso.numeroPropioAviso": "Requer que a Mitrol cadastre sua operadora",
    "col.uso": "Uso",

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

    "uso.titulo": "Ús de la línia",
    "uso.descripcion":
      "Primer defineix per a què s'utilitzarà la línia: el que pot fer depèn del proveïdor de la teva regió, així que els números s'ofereixen després.",
    "uso.paso1": "Per a què s'utilitza aquesta línia?",
    "uso.paso2": "Què veu el destinatari quan truques?",
    "uso.paso3": "Tria el número",
    "uso.elegiUsoPrimero":
      "Tria primer per a què s'utilitzarà la línia; això filtra els números que pots fer servir.",
    "uso.entrante": "Rep trucades",
    "uso.entranteDesc": "Les trucades entren per aquí i es deriven a una campanya.",
    "uso.saliente": "Origina trucades",
    "uso.salienteDesc": "S'utilitza per trucar des de les campanyes.",
    "uso.ambas": "Les dues coses",
    "uso.ambasDesc": "Rep i origina trucades per la mateixa línia.",
    "uso.salidaMisma": "El mateix número pel qual entren",
    "uso.salidaMismaDesc": "El destinatari pot tornar la trucada i entra per aquest compte.",
    "uso.salidaPropio": "Un altre número propi",
    "uso.salidaPropioDesc": "Mostra un altre dels números disponibles a la teva regió.",
    "uso.salidaAleatorio": "Número aleatori",
    "uso.salidaAleatorioDesc": "Cada trucada surt amb un número diferent.",
    "uso.salidaOculto": "Número ocult",
    "uso.salidaOcultoDesc": "La trucada surt sense mostrar cap número.",
    "uso.sinProveedorAleatorio":
      "No disponible: cap proveïdor de la teva regió ({region}) permet sortir amb número aleatori.",
    "uso.sinProveedorOculto":
      "No disponible: cap proveïdor de la teva regió ({region}) permet sortir amb número ocult.",
    "uso.sinTarifas":
      "No disponible: la teva regió no té tarifes carregades per triar per on surt la trucada.",
    "uso.validadoRegion":
      "Les opcions s'habiliten segons el que permetin els proveïdors de la teva regió ({region}).",
    "uso.lineaEntrante": "Número pel qual entren les trucades",
    "uso.lineaSaliente": "Número que es mostra en trucar",
    "uso.elegirLinea": "Tria un número…",
    "uso.soloDisponibles":
      "Només es mostren les línies disponibles a la teva regió ({region}) i encara no assignades a un altre compte.",
    "uso.sinNumeroElegible":
      "Amb aquesta opció no tries número: la plataforma resol per on surt cada trucada.",
    "uso.noEncuentroNumero": "No trobo el meu número",
    "uso.numeroPropioAviso": "Requereix que Mitrol doni d'alta el teu proveïdor",
    "col.uso": "Ús",

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
