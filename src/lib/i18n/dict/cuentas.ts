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
      "Primero definí para qué se va a usar la línea: lo que se puede hacer depende del proveedor, así que los números se ofrecen recién después.",
    "uso.paso1": "¿Para qué se usa esta línea?",
    "uso.paso2": "¿Qué ve el destinatario cuando llamás?",
    "uso.paso3": "Elegí el número",
    "uso.elegiUsoPrimero":
      "Elegí primero para qué se va a usar la línea; con eso se filtran los números que podés usar.",
    "uso.entrante": "Recibe llamadas",
    "uso.entranteDesc": "Las llamadas entran por acá y se derivan a una campaña.",
    "uso.saliente": "Origina llamadas",
    "uso.salienteDesc": "Se usa para llamar desde las campañas.",
    "uso.ambas": "Recibe y origina",
    "uso.ambasDesc": "La misma línea recibe las llamadas y también llama.",
    "uso.salidaMisma": "Número visible",
    "uso.salidaMismaDesc":
      "Es el mismo número por el que entran las llamadas: el destinatario puede devolver el llamado y entra por esta cuenta.",
    "uso.salidaNumero": "Número visible",
    "uso.salidaNumeroDesc": "Se muestra un número del listado de disponibles.",
    "uso.salidaAleatorio": "Número aleatorio",
    "uso.salidaAleatorioDesc":
      "La llamada sale con un número aleatorio del país del destinatario: si llamás a Argentina, sale con un número de Argentina.",
    "uso.salidaOculto": "Número oculto",
    "uso.salidaOcultoDesc": "La llamada sale sin mostrar ningún número.",
    "uso.sinProveedorAleatorio":
      "No disponible: ningún proveedor permite salir con número aleatorio.",
    "uso.sinProveedorOculto":
      "No disponible: ningún proveedor permite salir con número oculto.",
    "uso.sinTarifas":
      "No disponible: no hay tarifas cargadas para elegir por dónde sale la llamada.",
    "uso.validado":
      "Las opciones se habilitan según lo que permitan los proveedores.",
    "uso.lineaEntrante": "Número por el que entran las llamadas",
    "uso.lineaEntranteYSaliente": "Número por el que entran y salen las llamadas",
    "uso.lineaSaliente": "Número que se muestra al llamar",
    "uso.elegirLinea": "Elegir un número…",
    "uso.soloDisponibles":
      "Solo se muestran las líneas disponibles y todavía no asignadas a otra cuenta.",
    "uso.sinNumeroElegible":
      "Con esta opción no elegís número: la plataforma resuelve por dónde sale cada llamada.",
    "uso.notaAltaNumero":
      "¿Necesitás usar un número propio? Pedile al administrador de Mitrol que lo dé de alta: una vez cargado aparece en este listado.",
    "campo.tipo": "Tipo",
    "tipo.telefoniaSip": "Telefonía SIP",
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
      "First define what the line is for: what it can do depends on the carrier, so numbers are offered only afterwards.",
    "uso.paso1": "What is this line used for?",
    "uso.paso2": "What does the other party see when you call?",
    "uso.paso3": "Choose the number",
    "uso.elegiUsoPrimero":
      "Choose what the line is for first; that filters the numbers you can use.",
    "uso.entrante": "Receives calls",
    "uso.entranteDesc": "Calls come in here and are routed to a campaign.",
    "uso.saliente": "Places calls",
    "uso.salienteDesc": "Used to call out from campaigns.",
    "uso.ambas": "Receives and places",
    "uso.ambasDesc": "The same line receives calls and also calls out.",
    "uso.salidaMisma": "Visible number",
    "uso.salidaMismaDesc":
      "It's the same number calls come in on: the other party can call back and reaches this account.",
    "uso.salidaNumero": "Visible number",
    "uso.salidaNumeroDesc": "Shows a number from the available list.",
    "uso.salidaAleatorio": "Random number",
    "uso.salidaAleatorioDesc":
      "The call goes out with a random number from the recipient's country: calling Argentina shows an Argentine number.",
    "uso.salidaOculto": "Hidden number",
    "uso.salidaOcultoDesc": "The call goes out without showing any number.",
    "uso.sinProveedorAleatorio":
      "Not available: no carrier allows calling out with a random number.",
    "uso.sinProveedorOculto":
      "Not available: no carrier allows calling out with a hidden number.",
    "uso.sinTarifas":
      "Not available: there are no rates loaded to choose how the call goes out.",
    "uso.validado": "Options are enabled based on what the carriers allow.",
    "uso.lineaEntrante": "Number calls come in on",
    "uso.lineaEntranteYSaliente": "Number calls come in and go out on",
    "uso.lineaSaliente": "Number shown when calling",
    "uso.elegirLinea": "Choose a number…",
    "uso.soloDisponibles":
      "Only lines that are available and not yet assigned to another account are listed.",
    "uso.sinNumeroElegible":
      "With this option you don't pick a number: the platform decides how each call goes out.",
    "uso.notaAltaNumero":
      "Need to use your own number? Ask the Mitrol administrator to onboard it: once loaded, it shows up in this list.",
    "campo.tipo": "Type",
    "tipo.telefoniaSip": "SIP telephony",
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
      "Primeiro defina para que a linha vai servir: o que ela pode fazer depende da operadora, então os números são oferecidos só depois.",
    "uso.paso1": "Para que serve esta linha?",
    "uso.paso2": "O que o destinatário vê quando você liga?",
    "uso.paso3": "Escolha o número",
    "uso.elegiUsoPrimero":
      "Escolha primeiro para que a linha vai servir; isso filtra os números que você pode usar.",
    "uso.entrante": "Recebe chamadas",
    "uso.entranteDesc": "As chamadas entram por aqui e são encaminhadas a uma campanha.",
    "uso.saliente": "Origina chamadas",
    "uso.salienteDesc": "Usada para ligar a partir das campanhas.",
    "uso.ambas": "Recebe e origina",
    "uso.ambasDesc": "A mesma linha recebe as chamadas e também liga.",
    "uso.salidaMisma": "Número visível",
    "uso.salidaMismaDesc":
      "É o mesmo número pelo qual entram as chamadas: o destinatário pode retornar a ligação e cai nesta conta.",
    "uso.salidaNumero": "Número visível",
    "uso.salidaNumeroDesc": "Mostra um número da lista de disponíveis.",
    "uso.salidaAleatorio": "Número aleatório",
    "uso.salidaAleatorioDesc":
      "A chamada sai com um número aleatório do país do destinatário: ligar para a Argentina mostra um número argentino.",
    "uso.salidaOculto": "Número oculto",
    "uso.salidaOcultoDesc": "A chamada sai sem mostrar nenhum número.",
    "uso.sinProveedorAleatorio":
      "Indisponível: nenhuma operadora permite sair com número aleatório.",
    "uso.sinProveedorOculto":
      "Indisponível: nenhuma operadora permite sair com número oculto.",
    "uso.sinTarifas":
      "Indisponível: não há tarifas carregadas para escolher por onde sai a chamada.",
    "uso.validado": "As opções são habilitadas conforme o que as operadoras permitem.",
    "uso.lineaEntrante": "Número pelo qual entram as chamadas",
    "uso.lineaEntranteYSaliente": "Número pelo qual entram e saem as chamadas",
    "uso.lineaSaliente": "Número exibido ao ligar",
    "uso.elegirLinea": "Escolher um número…",
    "uso.soloDisponibles":
      "Só aparecem as linhas disponíveis e ainda não atribuídas a outra conta.",
    "uso.sinNumeroElegible":
      "Com esta opção você não escolhe número: a plataforma resolve por onde sai cada chamada.",
    "uso.notaAltaNumero":
      "Precisa usar um número próprio? Peça ao administrador da Mitrol que o cadastre: depois de carregado, ele aparece nesta lista.",
    "campo.tipo": "Tipo",
    "tipo.telefoniaSip": "Telefonia SIP",
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
      "Primer defineix per a què s'utilitzarà la línia: el que pot fer depèn del proveïdor, així que els números s'ofereixen després.",
    "uso.paso1": "Per a què s'utilitza aquesta línia?",
    "uso.paso2": "Què veu el destinatari quan truques?",
    "uso.paso3": "Tria el número",
    "uso.elegiUsoPrimero":
      "Tria primer per a què s'utilitzarà la línia; això filtra els números que pots fer servir.",
    "uso.entrante": "Rep trucades",
    "uso.entranteDesc": "Les trucades entren per aquí i es deriven a una campanya.",
    "uso.saliente": "Origina trucades",
    "uso.salienteDesc": "S'utilitza per trucar des de les campanyes.",
    "uso.ambas": "Rep i origina",
    "uso.ambasDesc": "La mateixa línia rep les trucades i també truca.",
    "uso.salidaMisma": "Número visible",
    "uso.salidaMismaDesc":
      "És el mateix número pel qual entren les trucades: el destinatari pot tornar la trucada i entra per aquest compte.",
    "uso.salidaNumero": "Número visible",
    "uso.salidaNumeroDesc": "Es mostra un número del llistat de disponibles.",
    "uso.salidaAleatorio": "Número aleatori",
    "uso.salidaAleatorioDesc":
      "La trucada surt amb un número aleatori del país del destinatari: trucar a l'Argentina mostra un número argentí.",
    "uso.salidaOculto": "Número ocult",
    "uso.salidaOcultoDesc": "La trucada surt sense mostrar cap número.",
    "uso.sinProveedorAleatorio":
      "No disponible: cap proveïdor permet sortir amb número aleatori.",
    "uso.sinProveedorOculto":
      "No disponible: cap proveïdor permet sortir amb número ocult.",
    "uso.sinTarifas":
      "No disponible: no hi ha tarifes carregades per triar per on surt la trucada.",
    "uso.validado": "Les opcions s'habiliten segons el que permetin els proveïdors.",
    "uso.lineaEntrante": "Número pel qual entren les trucades",
    "uso.lineaEntranteYSaliente": "Número pel qual entren i surten les trucades",
    "uso.lineaSaliente": "Número que es mostra en trucar",
    "uso.elegirLinea": "Tria un número…",
    "uso.soloDisponibles":
      "Només es mostren les línies disponibles i encara no assignades a un altre compte.",
    "uso.sinNumeroElegible":
      "Amb aquesta opció no tries número: la plataforma resol per on surt cada trucada.",
    "uso.notaAltaNumero":
      "Necessites fer servir un número propi? Demana a l'administrador de Mitrol que el doni d'alta: un cop carregat, apareix en aquest llistat.",
    "campo.tipo": "Tipus",
    "tipo.telefoniaSip": "Telefonia SIP",
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
