import type { NamespaceDict } from "@/lib/i18n/dict/types";

// Copy del tour guiado (driver.js, src/lib/tour/). Se separa del resto del
// copy transversal (common.ts) porque es contenido narrativo largo, no
// rótulos de UI cortos.
//
// Nota de registro: el resto del mock usa voseo argentino ("gestioná",
// "definí"). El copy en español de ESTE namespace es deliberadamente
// distinto — español neutro apto LATAM (tú/puedes/elige), a pedido de
// producto, porque el tour es lo primero que lee un usuario nuevo y no
// se quiere asumir una región. Es una inconsistencia real con el resto
// del copy — señalada, no accidental.
export const tour: NamespaceDict = {
  es: {
    "orientacion.brand.titulo": "Bienvenido a Olimpo",
    "orientacion.brand.descripcion":
      "Este es el backoffice de Atlas: aquí tu equipo administra todo lo necesario para operar. Primero te mostramos los controles de la barra superior, y después el menú con las secciones.",

    "orientacion.search.titulo": "Encuentra cualquier cosa rápido",
    "orientacion.search.descripcion":
      "Con ⌘K (o Ctrl+K) puedes llegar a cualquier sección o encontrar un registro puntual por su nombre, sin importar dónde estés.",

    "orientacion.temaToggle.titulo": "Modo claro u oscuro",
    "orientacion.temaToggle.descripcion":
      "Elige cómo se ve la interfaz. Pruébalo — el cambio es inmediato y se guarda para la próxima vez que entres.",

    "orientacion.idioma.titulo": "Idioma",
    "orientacion.idioma.descripcion":
      "Olimpo está disponible en español, inglés, portugués y catalán. Abre el menú y elige el que prefieras — se aplica al instante, solo para ti, sin afectar a nadie más.",

    "orientacion.apps.titulo": "Más que Olimpo",
    "orientacion.apps.descripcion":
      "Este ícono abre el selector de aplicaciones de Atlas: hoy incluye Olimpo (donde estás) y Hermes, el PAD del agente. Ábrelo para ver cómo se pasa de una a otra sin cerrar sesión.",

    "orientacion.usuario.titulo": "Tu cuenta",
    "orientacion.usuario.descripcion":
      "Tu perfil y la opción para cerrar sesión están siempre aquí, en cualquier aplicación de Atlas.",

    "orientacion.sidebarToggle.titulo": "Contrae el menú cuando quieras",
    "orientacion.sidebarToggle.descripcion":
      "Este botón reduce el menú lateral a solo íconos, para ganar espacio de pantalla sin perder acceso a ninguna sección.",

    "orientacion.cuentas.titulo": "Cuentas",
    "orientacion.cuentas.descripcion":
      "El punto de partida de toda operación: las líneas por las que se reciben y hacen llamadas, WhatsApp, SMS o correo.",

    "orientacion.clasificaciones.titulo": "Clasificaciones",
    "orientacion.clasificaciones.descripcion":
      'Con qué resultado se cierra cada gestión —por ejemplo "Compromiso de pago" o "No contesta"—. Se definen una vez y se reutilizan en todas las campañas que las necesiten.',

    "orientacion.marcadores.titulo": "Marcas",
    "orientacion.marcadores.descripcion":
      'Etiquetas que un agente puede dejar sobre una gestión para señalar algo puntual, como "Cliente VIP" o "Reclamo activo".',

    "orientacion.feriados.titulo": "Feriados",
    "orientacion.feriados.descripcion":
      "Los días en que tu operación no trabaja. Arma el calendario una vez y asígnalo a los proyectos o campañas que corresponda.",

    "orientacion.listasExclusion.titulo": "Listas de exclusión",
    "orientacion.listasExclusion.descripcion":
      'Los contactos a los que no se debe llamar, ya sea porque lo pidieron o porque están en un registro oficial de "no llamar".',

    "orientacion.agentes.titulo": "Usuarios",
    "orientacion.agentes.descripcion": "Las personas que van a operar la plataforma.",

    "orientacion.gruposTrabajo.titulo": "Grupos y roles",
    "orientacion.gruposTrabajo.descripcion":
      "Aquí organizas a esas personas en equipos: qué pueden hacer, qué estados auxiliares tienen disponibles y quiénes lo integran.",

    "orientacion.estadosAuxiliares.titulo": "Estados auxiliares",
    "orientacion.estadosAuxiliares.descripcion":
      'El catálogo de estados en los que un agente puede estar cuando no está atendiendo, como "Almuerzo" o "Capacitación". Cada grupo de trabajo elige cuáles habilita.',

    "orientacion.campanias.titulo": "Campañas",
    "orientacion.campanias.descripcion":
      "Aquí se junta todo lo anterior: proyecto, cuenta, agentes, clasificaciones y marcas. Es la pieza final de tu operación — en el próximo tour te mostramos cómo armar una, paso a paso.",

    "orientacion.controles.siguiente": "Siguiente",
    "orientacion.controles.atras": "Atrás",
    "orientacion.controles.listo": "Listo",
    "orientacion.controles.progreso": "{{current}} de {{total}}",

    "orientacion.boton.tooltip": "Tour de orientación",
    "orientacion.boton.ariaLabel": "Iniciar tour de orientación",
  },
  en: {
    "orientacion.brand.titulo": "Welcome to Olimpo",
    "orientacion.brand.descripcion":
      "This is Atlas's backoffice: here your team manages everything needed to operate. We'll start with the controls in the top bar, then walk through the menu sections.",

    "orientacion.search.titulo": "Find anything fast",
    "orientacion.search.descripcion":
      "Press ⌘K (or Ctrl+K) to jump to any section or find a specific record by name, no matter where you are.",

    "orientacion.temaToggle.titulo": "Light or dark mode",
    "orientacion.temaToggle.descripcion":
      "Choose how the interface looks. Give it a try — the change is instant and saved for your next visit.",

    "orientacion.idioma.titulo": "Language",
    "orientacion.idioma.descripcion":
      "Olimpo is available in Spanish, English, Portuguese, and Catalan. Open the menu and pick the one you prefer — it applies instantly, just for you, without affecting anyone else.",

    "orientacion.apps.titulo": "More than Olimpo",
    "orientacion.apps.descripcion":
      "This icon opens the Atlas app switcher: today it includes Olimpo (where you are) and Hermes, the agent's PAD. Open it to see how you move between them without signing out.",

    "orientacion.usuario.titulo": "Your account",
    "orientacion.usuario.descripcion":
      "Your profile and the sign-out option always live here, in any Atlas app.",

    "orientacion.sidebarToggle.titulo": "Collapse the menu anytime",
    "orientacion.sidebarToggle.descripcion":
      "This button shrinks the side menu down to icons only, freeing up screen space without losing access to any section.",

    "orientacion.cuentas.titulo": "Accounts",
    "orientacion.cuentas.descripcion":
      "The starting point of every operation: the lines used to receive and make calls, WhatsApp, SMS, or email.",

    "orientacion.clasificaciones.titulo": "Classifications",
    "orientacion.clasificaciones.descripcion":
      'The outcome used to close each interaction — for example "Payment commitment" or "No answer". Defined once and reused across every campaign that needs them.',

    "orientacion.marcadores.titulo": "Tags",
    "orientacion.marcadores.descripcion":
      'Labels an agent can leave on an interaction to flag something specific, like "VIP customer" or "Open complaint".',

    "orientacion.feriados.titulo": "Holidays",
    "orientacion.feriados.descripcion":
      "The days your operation doesn't work. Build the calendar once and assign it to the relevant projects or campaigns.",

    "orientacion.listasExclusion.titulo": "Exclusion lists",
    "orientacion.listasExclusion.descripcion":
      "Contacts who shouldn't be called, either because they asked not to be or because they're on an official do-not-call registry.",

    "orientacion.agentes.titulo": "Users",
    "orientacion.agentes.descripcion": "The people who will operate the platform.",

    "orientacion.gruposTrabajo.titulo": "Groups and roles",
    "orientacion.gruposTrabajo.descripcion":
      "Here you organize those people into teams: what they can do, which auxiliary states are available to them, and who's part of each one.",

    "orientacion.estadosAuxiliares.titulo": "Auxiliary states",
    "orientacion.estadosAuxiliares.descripcion":
      'The catalog of states an agent can be in when not handling an interaction, like "Lunch" or "Training". Each work group chooses which ones to enable.',

    "orientacion.campanias.titulo": "Campaigns",
    "orientacion.campanias.descripcion":
      "This is where everything comes together: project, account, agents, classifications, and tags. It's the final piece of your operation — the next tour shows you how to build one, step by step.",

    "orientacion.controles.siguiente": "Next",
    "orientacion.controles.atras": "Back",
    "orientacion.controles.listo": "Done",
    "orientacion.controles.progreso": "{{current}} of {{total}}",

    "orientacion.boton.tooltip": "Orientation tour",
    "orientacion.boton.ariaLabel": "Start orientation tour",
  },
  pt: {
    "orientacion.brand.titulo": "Bem-vindo ao Olimpo",
    "orientacion.brand.descripcion":
      "Este é o backoffice do Atlas: aqui sua equipe administra tudo o que é necessário para operar. Vamos começar pelos controles da barra superior e depois percorrer as seções do menu.",

    "orientacion.search.titulo": "Encontre qualquer coisa rápido",
    "orientacion.search.descripcion":
      "Com ⌘K (ou Ctrl+K) você chega a qualquer seção ou encontra um registro específico pelo nome, não importa onde esteja.",

    "orientacion.temaToggle.titulo": "Modo claro ou escuro",
    "orientacion.temaToggle.descripcion":
      "Escolha como a interface aparece. Experimente — a mudança é imediata e fica salva para a próxima vez que você entrar.",

    "orientacion.idioma.titulo": "Idioma",
    "orientacion.idioma.descripcion":
      "O Olimpo está disponível em espanhol, inglês, português e catalão. Abra o menu e escolha o que preferir — a mudança é aplicada na hora, só para você, sem afetar mais ninguém.",

    "orientacion.apps.titulo": "Mais do que o Olimpo",
    "orientacion.apps.descripcion":
      "Este ícone abre o seletor de aplicativos do Atlas: hoje inclui o Olimpo (onde você está) e o Hermes, o PAD do agente. Abra para ver como alternar entre eles sem sair da sessão.",

    "orientacion.usuario.titulo": "Sua conta",
    "orientacion.usuario.descripcion":
      "Seu perfil e a opção de sair estão sempre aqui, em qualquer aplicativo do Atlas.",

    "orientacion.sidebarToggle.titulo": "Recolha o menu quando quiser",
    "orientacion.sidebarToggle.descripcion":
      "Este botão reduz o menu lateral para exibir só os ícones, ganhando espaço de tela sem perder acesso a nenhuma seção.",

    "orientacion.cuentas.titulo": "Contas",
    "orientacion.cuentas.descripcion":
      "O ponto de partida de toda operação: as linhas usadas para receber e fazer ligações, WhatsApp, SMS ou e-mail.",

    "orientacion.clasificaciones.titulo": "Classificações",
    "orientacion.clasificaciones.descripcion":
      'Com qual resultado cada atendimento é encerrado — por exemplo "Compromisso de pagamento" ou "Não atende". Definidas uma vez e reutilizadas em todas as campanhas que precisarem.',

    "orientacion.marcadores.titulo": "Marcadores",
    "orientacion.marcadores.descripcion":
      'Etiquetas que um agente pode deixar em um atendimento para sinalizar algo específico, como "Cliente VIP" ou "Reclamação em aberto".',

    "orientacion.feriados.titulo": "Feriados",
    "orientacion.feriados.descripcion":
      "Os dias em que sua operação não funciona. Monte o calendário uma vez e atribua a projetos ou campanhas conforme necessário.",

    "orientacion.listasExclusion.titulo": "Listas de exclusão",
    "orientacion.listasExclusion.descripcion":
      'Contatos que não devem ser chamados, seja porque pediram, seja porque estão em um registro oficial de "não perturbe".',

    "orientacion.agentes.titulo": "Usuários",
    "orientacion.agentes.descripcion": "As pessoas que vão operar a plataforma.",

    "orientacion.gruposTrabajo.titulo": "Grupos e funções",
    "orientacion.gruposTrabajo.descripcion":
      "Aqui você organiza essas pessoas em equipes: o que podem fazer, quais estados auxiliares têm disponíveis e quem faz parte de cada uma.",

    "orientacion.estadosAuxiliares.titulo": "Estados auxiliares",
    "orientacion.estadosAuxiliares.descripcion":
      'O catálogo de estados em que um agente pode estar quando não está atendendo, como "Almoço" ou "Treinamento". Cada grupo de trabalho escolhe quais habilitar.',

    "orientacion.campanias.titulo": "Campanhas",
    "orientacion.campanias.descripcion":
      "Aqui tudo se junta: projeto, conta, agentes, classificações e marcadores. É a peça final da sua operação — no próximo tour mostramos como montar uma, passo a passo.",

    "orientacion.controles.siguiente": "Próximo",
    "orientacion.controles.atras": "Voltar",
    "orientacion.controles.listo": "Concluído",
    "orientacion.controles.progreso": "{{current}} de {{total}}",

    "orientacion.boton.tooltip": "Tour de orientação",
    "orientacion.boton.ariaLabel": "Iniciar tour de orientação",
  },
  ca: {
    "orientacion.brand.titulo": "Benvingut a l'Olimpo",
    "orientacion.brand.descripcion":
      "Aquest és el backoffice d'Atlas: aquí el teu equip administra tot el que cal per operar. Comencem pels controls de la barra superior i després recorrem les seccions del menú.",

    "orientacion.search.titulo": "Troba qualsevol cosa ràpidament",
    "orientacion.search.descripcion":
      "Amb ⌘K (o Ctrl+K) pots arribar a qualsevol secció o trobar un registre concret pel seu nom, sigui on siguis.",

    "orientacion.temaToggle.titulo": "Mode clar o fosc",
    "orientacion.temaToggle.descripcion":
      "Tria com es veu la interfície. Prova-ho — el canvi és immediat i es desa per a la propera vegada que entris.",

    "orientacion.idioma.titulo": "Idioma",
    "orientacion.idioma.descripcion":
      "L'Olimpo està disponible en espanyol, anglès, portuguès i català. Obre el menú i tria el que prefereixis — s'aplica a l'instant, només per a tu, sense afectar ningú més.",

    "orientacion.apps.titulo": "Més que l'Olimpo",
    "orientacion.apps.descripcion":
      "Aquesta icona obre el selector d'aplicacions d'Atlas: avui inclou l'Olimpo (on ets) i l'Hermes, el PAD de l'agent. Obre-la per veure com es canvia d'una a l'altra sense tancar la sessió.",

    "orientacion.usuario.titulo": "El teu compte",
    "orientacion.usuario.descripcion":
      "El teu perfil i l'opció per tancar la sessió sempre hi són aquí, a qualsevol aplicació d'Atlas.",

    "orientacion.sidebarToggle.titulo": "Contreu el menú quan vulguis",
    "orientacion.sidebarToggle.descripcion":
      "Aquest botó redueix el menú lateral a només icones, per guanyar espai de pantalla sense perdre accés a cap secció.",

    "orientacion.cuentas.titulo": "Comptes",
    "orientacion.cuentas.descripcion":
      "El punt de partida de tota operació: les línies per les quals es reben i es fan trucades, WhatsApp, SMS o correu.",

    "orientacion.clasificaciones.titulo": "Classificacions",
    "orientacion.clasificaciones.descripcion":
      'Amb quin resultat es tanca cada gestió —per exemple "Compromís de pagament" o "No contesta"—. Es defineixen un cop i es reutilitzen a totes les campanyes que les necessitin.',

    "orientacion.marcadores.titulo": "Marques",
    "orientacion.marcadores.descripcion":
      'Etiquetes que un agent pot deixar sobre una gestió per assenyalar alguna cosa concreta, com "Client VIP" o "Reclamació activa".',

    "orientacion.feriados.titulo": "Festius",
    "orientacion.feriados.descripcion":
      "Els dies en què la teva operació no treballa. Munta el calendari un cop i assigna'l als projectes o campanyes que correspongui.",

    "orientacion.listasExclusion.titulo": "Llistes d'exclusió",
    "orientacion.listasExclusion.descripcion":
      "Els contactes als quals no s'ha de trucar, ja sigui perquè ho han demanat o perquè són en un registre oficial de \"no truqueu\".",

    "orientacion.agentes.titulo": "Usuaris",
    "orientacion.agentes.descripcion": "Les persones que operaran la plataforma.",

    "orientacion.gruposTrabajo.titulo": "Grups i rols",
    "orientacion.gruposTrabajo.descripcion":
      "Aquí organitzes aquestes persones en equips: què poden fer, quins estats auxiliars tenen disponibles i qui en forma part.",

    "orientacion.estadosAuxiliares.titulo": "Estats auxiliars",
    "orientacion.estadosAuxiliares.descripcion":
      'El catàleg d\'estats en què un agent pot estar quan no està atenent, com "Dinar" o "Formació". Cada grup de treball tria quins habilita.',

    "orientacion.campanias.titulo": "Campanyes",
    "orientacion.campanias.descripcion":
      "Aquí s'ajunta tot l'anterior: projecte, compte, agents, classificacions i marques. És la peça final de la teva operació — al proper tour et mostrem com muntar-ne una, pas a pas.",

    "orientacion.controles.siguiente": "Següent",
    "orientacion.controles.atras": "Enrere",
    "orientacion.controles.listo": "Fet",
    "orientacion.controles.progreso": "{{current}} de {{total}}",

    "orientacion.boton.tooltip": "Tour d'orientació",
    "orientacion.boton.ariaLabel": "Inicia el tour d'orientació",
  },
};
