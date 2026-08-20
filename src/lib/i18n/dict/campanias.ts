import type { NamespaceDict } from "@/lib/i18n/dict/types";

// Área de Campañas: listado agrupado por proyecto, alta, edición (general +
// usuarios) y los tres controles compartidos (herencia, horarios, picker de
// cuentas salientes). Los nombres propios que salen de mock-data (campañas,
// proyectos, cuentas, personas) NO se traducen: son datos del cliente.
export const campanias: NamespaceDict = {
  es: {
    // Listado
    titulo: "Campañas",
    descripcion:
      "Gestioná las campañas de cada proyecto. Entrá a un proyecto para ajustar su configuración común o creá una campaña nueva.",
    proyecto: "Proyecto",
    sinProyecto: "Sin proyecto",
    editarProyecto: "Editar proyecto",
    editarProyectoAria: "Editar proyecto {nombre}",
    usuariosAsignados: "Usuarios asignados",
    cuentasSalientes: "Cuentas salientes",
    nuevoProyecto: "Nuevo proyecto",
    nuevaCampania: "Nueva campaña",
    "accion.asignarUsuarios": "Asignar usuarios",
    "accion.duplicar": "Duplicar",

    // Alta
    "nueva.descripcion":
      "Indicá nombre y proyecto para crearla. El resto de la configuración podés completarlo más adelante.",
    crearCampania: "Crear campaña",
    infoGeneral: "Información general",
    nombrePlaceholder: "Ej: Cobranzas Activa PCP",
    proyectoPlaceholder: "Seleccioná un proyecto",
    proyectoBuscar: "Buscar proyecto...",
    proyectoVacio: "No se encontró ningún proyecto.",
    objetivo: "Objetivo",
    cuentasSalientesDescNueva:
      "Líneas desde las que se pueden realizar llamadas para esta campaña. Es opcional; podés asociarlas más adelante.",
    cuentasSalientesDesc:
      "Líneas desde las que se pueden realizar llamadas para esta campaña.",
    configHeredada: "Configuración heredada del proyecto",
    configHeredadaDescNueva:
      "Todo lo que dejes sin asignar acá toma la configuración del proyecto elegido. Podés personalizarlo en cualquier momento desde la edición de la campaña.",
    horarios: "Horarios de atención",

    // Detalle / edición
    "detalle.descripcion": "Campaña de {proyecto}",
    "tab.general": "General",
    configHeredadaDescProyecto:
      "Se toma de {proyecto}, salvo lo que personalices acá.",
    configHeredadaDescLibre: "Podés personalizarla para esta campaña.",
    horariosDesc:
      "Heredados del proyecto salvo que los personalices para esta campaña.",
    usuariosOperan: "{n} usuario(s) operan esta campaña.",
    asignarUsuario: "Asignar usuario",
    buscarUsuario: "Buscar usuario...",
    sinUsuariosDisponibles: "No hay usuarios disponibles.",
    colUsuario: "Usuario",
    colEmail: "Email",
    sinUsuariosAsignados: "Todavía no hay usuarios asignados.",
    habilitado: "Habilitado",
    deshabilitado: "Deshabilitado",
    desasignar: "Desasignar",
    desasignarConfirm: "{nombre} deja de operar esta campaña.",

    // Herencia
    grupoClasificaciones: "Grupo de clasificaciones",
    buscarGrupoClasificaciones: "Buscar grupo de clasificaciones...",
    vacioGrupoClasificaciones: "No se encontró ningún grupo de clasificaciones.",
    verClasificaciones: "Ver clasificaciones del grupo",
    grupoMarcas: "Grupo de marcas",
    buscarGrupoMarcas: "Buscar grupo de marcas...",
    vacioGrupoMarcas: "No se encontró ningún grupo de marcas.",
    verMarcas: "Ver marcas del grupo",
    buscarFeriados: "Buscar grupo de feriados...",
    vacioFeriados: "No se encontró ningún grupo de feriados.",
    verFeriados: "Ver fechas del grupo",
    listaExclusion: "Lista de exclusión",
    buscarListaExclusion: "Buscar lista de exclusión...",
    vacioListaExclusion: "No se encontró ninguna lista de exclusión.",
    verContactos: "Ver contactos de la lista",
    heredaDe: "Sin asignar acá, hereda de {proyecto}",
    sinAsignar: "Sin asignar",
    "dialogo.clasificaciones": "Clasificaciones — {nombre}",
    "dialogo.marcas": "Marcas — {nombre}",
    "dialogo.feriados": "Feriados — {nombre}",
    "dialogo.exclusion": "Lista de exclusión — {nombre}",
    soloLecturaClasificaciones:
      "Vista de solo lectura. Para editar el grupo, hacelo desde Clasificaciones.",
    soloLecturaMarcas:
      "Vista de solo lectura. Para editar el grupo, hacelo desde Marcas.",
    soloLecturaFeriados:
      "Vista de solo lectura. Para editar el grupo, hacelo desde Feriados.",
    soloLecturaExclusion:
      "Vista de solo lectura. Para editar la lista, hacelo desde Listas de exclusión.",
    localeFecha: "es-AR",

    // Horarios
    horariosPersonalizados: "Personalizados para esta campaña.",
    horariosHeredadosDe:
      "Heredados de {proyecto}. Activá “Personalizar” para redefinirlos.",
    horariosHeredadosProyecto:
      "Heredados del proyecto. Activá “Personalizar” para redefinirlos.",
    personalizar: "Personalizar",
    horariosSinBandas:
      "Se heredan del proyecto. Si el proyecto no define horarios, la campaña atiende sin restricción horaria.",
    cerrado: "Cerrado",

    // Picker de cuentas salientes
    sinCuentasAsociadas: "Sin cuentas asociadas",
    buscarCuenta: "Buscar cuenta...",
    vacioCuenta: "No se encontró ninguna cuenta.",

    // Comboboxes (valores por defecto)
    comboPlaceholder: "Seleccioná una opción",
    comboMultiPlaceholder: "Seleccioná una o varias opciones",
    comboBuscar: "Buscar...",
    comboVacio: "No se encontró ningún resultado.",
    comboSeleccionadas: "{n} seleccionada(s)",
    comboQuitar: "Quitar {nombre}",

    // Parámetros de campaña (campaigns.parameters, ver
    // relevamiento-legacy/parametros-campaigns/propuesta/parametrizacion-propuesta.md)
    // — solo ES por ahora, el resto de los idiomas cae al fallback en
    // español (mock en construcción, se termina de traducir cuando se
    // cierre el contenido con el Chief Innovation Architect).
    "tab.controlesAgente": "Controles del agente",
    "tab.visualizacion": "Visualización",
    "tab.grabacion": "Grabación",
    "tab.configOperativa": "Config. operativa",
    "tab.urlInteraccion": "URLs externas",

    "parametros.controlesAgenteTitulo": "Controles del agente",
    "parametros.controlesAgenteDesc":
      "Qué acciones puede usar el agente durante la interacción, según canal.",
    "parametros.allowHold": "Permitir espera (hold)",
    "parametros.allowHoldDesc": "Permite poner la interacción en espera (hold).",
    "parametros.allowHoldAlcance": "Telefonía, Videollamada/Audio",
    "parametros.allowHangup": "Permitir cortar llamada",
    "parametros.allowHangupDesc": "Permite cortar la llamada en curso.",
    "parametros.allowHangupAlcance": "Telefonía, Videollamada/Audio",
    "parametros.allowAddBookmark": "Permitir agregar bookmark",
    "parametros.allowAddBookmarkDesc":
      "Permite agregar un bookmark durante la llamada.",
    "parametros.allowAddBookmarkAlcance": "Omnicanal",
    "parametros.allowMute": "Permitir silenciar (mute)",
    "parametros.allowMuteDesc":
      "Permite usar el botón de silenciar (mute) durante la llamada.",
    "parametros.allowMuteAlcance": "Telefonía, Videollamada/Audio",
    "parametros.allowClassification": "Permitir tipificar",
    "parametros.allowClassificationDesc":
      "Permite que el agente cargue un resultado de gestión en la interacción.",
    "parametros.allowClassificationAlcance": "Omnicanal",
    "parametros.forceClassification": "Obligar tipificación",
    "parametros.forceClassificationDesc":
      "Obliga a cargar un resultado de gestión antes de salir del ACW.",
    "parametros.forceClassificationAlcance": "Omnicanal",
    "parametros.forceClassificationDependeClassification":
      "Deshabilitado porque esta campaña no permite tipificar (Controles del agente → Permitir tipificar).",

    "parametros.visualizacionTitulo": "Visualización",
    "parametros.visualizacionDesc": "Qué ve el agente en el pad durante la interacción.",
    "parametros.allowRinging": "Sonido de timbre (ring)",
    "parametros.allowRingingDesc": "Determina si suena el ring en la campaña.",
    "parametros.allowRingingAlcance": "Omnicanal",

    "parametros.grabacionTitulo": "Grabación",
    "parametros.grabacionDesc": "Qué se graba durante la interacción.",
    "parametros.recordHold": "Grabar audio en hold",
    "parametros.recordHoldDesc":
      "Graba el audio del agente durante el hold de la llamada.",
    "parametros.recordHoldAlcance": "Omnicanal",
    "parametros.recordHoldDependeHold":
      "Deshabilitado porque esta campaña no permite poner interacciones en espera (Controles del agente → Permitir espera).",

    "parametros.configOperativaTitulo": "Configuración operativa",
    "parametros.configOperativaDesc": "Cómo se asignan las interacciones al agente.",
    "parametros.forcedAnswer": "Atención forzada",
    "parametros.forcedAnswerDesc":
      "Permite que la llamada sea atendida automáticamente sin intervención del agente.",
    "parametros.forcedAnswerAlcance": "Inbound, Discador Predictivo",

    "parametros.urlInteraccionTitulo": "URLs externas",
    "parametros.urlInteraccionDesc":
      "Configurá una o más URLs externas para esta campaña. Cada una tiene su propia URL, si se abre embebida dentro de Hermes o en una pestaña nueva del navegador, y en qué momento: al inicio de la interacción, al finalizar, o de forma manual (nunca sola — el agente la abre cuando quiere desde un botón). Si hay más de una URL en modo “Al inicio” o “Al finalizar”, se abren todas.",
    "parametros.agregarUrl": "Agregar URL",
    "parametros.eliminarUrl": "Eliminar URL",
    "parametros.sinUrls": "Todavía no hay URLs externas configuradas para esta campaña.",
    "parametros.urlNombre": "Nombre",
    "parametros.urlNombrePlaceholder": "Ej: Ficha del cliente",
    "parametros.url": "URL",
    "parametros.urlPlaceholder": "https://…",
    "parametros.urlAyuda": "Admite variables como {{userid}} o {{iditeraccion}} (a definir).",
    "parametros.openAs": "Modo de apertura",
    "parametros.openAsFrame": "Dentro de Hermes",
    "parametros.openAsBlank": "Pestaña nueva",
    "parametros.momento": "Momento de apertura",
    "parametros.modeStart": "Al inicio de la interacción",
    "parametros.modeEnd": "Al finalizar la interacción",
    "parametros.modeManual": "Manual",
  },
  en: {
    // Listado
    titulo: "Campaigns",
    descripcion:
      "Manage the campaigns of each project. Open a project to adjust its shared configuration, or create a new campaign.",
    proyecto: "Project",
    sinProyecto: "No project",
    editarProyecto: "Edit project",
    editarProyectoAria: "Edit project {nombre}",
    usuariosAsignados: "Assigned users",
    cuentasSalientes: "Outbound accounts",
    nuevoProyecto: "New project",
    nuevaCampania: "New campaign",
    "accion.asignarUsuarios": "Assign users",
    "accion.duplicar": "Duplicate",

    // Alta
    "nueva.descripcion":
      "Enter a name and a project to create it. You can complete the rest of the configuration later.",
    crearCampania: "Create campaign",
    infoGeneral: "General information",
    nombrePlaceholder: "E.g. Cobranzas Activa PCP",
    proyectoPlaceholder: "Select a project",
    proyectoBuscar: "Search project...",
    proyectoVacio: "No projects found.",
    objetivo: "Goal",
    cuentasSalientesDescNueva:
      "Lines that can be used to place calls for this campaign. It is optional; you can associate them later.",
    cuentasSalientesDesc:
      "Lines that can be used to place calls for this campaign.",
    configHeredada: "Configuration inherited from the project",
    configHeredadaDescNueva:
      "Anything you leave unassigned here takes the configuration of the selected project. You can customize it at any time from the campaign editor.",
    horarios: "Business hours",

    // Detalle / edición
    "detalle.descripcion": "Campaign of {proyecto}",
    "tab.general": "General",
    configHeredadaDescProyecto:
      "Taken from {proyecto}, except for what you customize here.",
    configHeredadaDescLibre: "You can customize it for this campaign.",
    horariosDesc:
      "Inherited from the project unless you customize them for this campaign.",
    usuariosOperan: "{n} user(s) operate this campaign.",
    asignarUsuario: "Assign user",
    buscarUsuario: "Search user...",
    sinUsuariosDisponibles: "No users available.",
    colUsuario: "User",
    colEmail: "Email",
    sinUsuariosAsignados: "No users assigned yet.",
    habilitado: "Enabled",
    deshabilitado: "Disabled",
    desasignar: "Unassign",
    desasignarConfirm: "{nombre} will no longer operate this campaign.",

    // Herencia
    grupoClasificaciones: "Classification group",
    buscarGrupoClasificaciones: "Search classification group...",
    vacioGrupoClasificaciones: "No classification groups found.",
    verClasificaciones: "View the group's classifications",
    grupoMarcas: "Mark group",
    buscarGrupoMarcas: "Search mark group...",
    vacioGrupoMarcas: "No mark groups found.",
    verMarcas: "View the group's marks",
    buscarFeriados: "Search holiday group...",
    vacioFeriados: "No holiday groups found.",
    verFeriados: "View the group's dates",
    listaExclusion: "Exclusion list",
    buscarListaExclusion: "Search exclusion list...",
    vacioListaExclusion: "No exclusion lists found.",
    verContactos: "View the list's contacts",
    heredaDe: "If left unassigned, inherits from {proyecto}",
    sinAsignar: "Unassigned",
    "dialogo.clasificaciones": "Classifications — {nombre}",
    "dialogo.marcas": "Marks — {nombre}",
    "dialogo.feriados": "Holidays — {nombre}",
    "dialogo.exclusion": "Exclusion list — {nombre}",
    soloLecturaClasificaciones:
      "Read-only view. To edit the group, go to Classifications.",
    soloLecturaMarcas: "Read-only view. To edit the group, go to Marks.",
    soloLecturaFeriados: "Read-only view. To edit the group, go to Holidays.",
    soloLecturaExclusion:
      "Read-only view. To edit the list, go to Exclusion lists.",
    localeFecha: "en-US",

    // Horarios
    horariosPersonalizados: "Customized for this campaign.",
    horariosHeredadosDe:
      "Inherited from {proyecto}. Turn on “Customize” to redefine them.",
    horariosHeredadosProyecto:
      "Inherited from the project. Turn on “Customize” to redefine them.",
    personalizar: "Customize",
    horariosSinBandas:
      "They are inherited from the project. If the project defines no hours, the campaign operates with no time restriction.",
    cerrado: "Closed",

    // Picker de cuentas salientes
    sinCuentasAsociadas: "No associated accounts",
    buscarCuenta: "Search account...",
    vacioCuenta: "No accounts found.",

    // Comboboxes (valores por defecto)
    comboPlaceholder: "Select an option",
    comboMultiPlaceholder: "Select one or more options",
    comboBuscar: "Search...",
    comboVacio: "No results found.",
    comboSeleccionadas: "{n} selected",
    comboQuitar: "Remove {nombre}",
  },
  pt: {
    // Listado
    titulo: "Campanhas",
    descripcion:
      "Gerencie as campanhas de cada projeto. Entre em um projeto para ajustar sua configuração comum ou crie uma campanha nova.",
    proyecto: "Projeto",
    sinProyecto: "Sem projeto",
    editarProyecto: "Editar projeto",
    editarProyectoAria: "Editar projeto {nombre}",
    usuariosAsignados: "Usuários atribuídos",
    cuentasSalientes: "Contas de saída",
    nuevoProyecto: "Novo projeto",
    nuevaCampania: "Nova campanha",
    "accion.asignarUsuarios": "Atribuir usuários",
    "accion.duplicar": "Duplicar",

    // Alta
    "nueva.descripcion":
      "Informe nome e projeto para criá-la. O restante da configuração você pode completar mais adiante.",
    crearCampania: "Criar campanha",
    infoGeneral: "Informações gerais",
    nombrePlaceholder: "Ex.: Cobranzas Activa PCP",
    proyectoPlaceholder: "Selecione um projeto",
    proyectoBuscar: "Pesquisar projeto...",
    proyectoVacio: "Nenhum projeto encontrado.",
    objetivo: "Objetivo",
    cuentasSalientesDescNueva:
      "Linhas a partir das quais é possível realizar chamadas para esta campanha. É opcional; você pode associá-las mais adiante.",
    cuentasSalientesDesc:
      "Linhas a partir das quais é possível realizar chamadas para esta campanha.",
    configHeredada: "Configuração herdada do projeto",
    configHeredadaDescNueva:
      "Tudo o que você deixar sem atribuição aqui assume a configuração do projeto escolhido. Você pode personalizá-lo a qualquer momento na edição da campanha.",
    horarios: "Horários de atendimento",

    // Detalle / edición
    "detalle.descripcion": "Campanha de {proyecto}",
    "tab.general": "Geral",
    configHeredadaDescProyecto:
      "É obtida de {proyecto}, exceto o que você personalizar aqui.",
    configHeredadaDescLibre: "Você pode personalizá-la para esta campanha.",
    horariosDesc:
      "Herdados do projeto, a menos que você os personalize para esta campanha.",
    usuariosOperan: "{n} usuário(s) operam esta campanha.",
    asignarUsuario: "Atribuir usuário",
    buscarUsuario: "Pesquisar usuário...",
    sinUsuariosDisponibles: "Não há usuários disponíveis.",
    colUsuario: "Usuário",
    colEmail: "E-mail",
    sinUsuariosAsignados: "Ainda não há usuários atribuídos.",
    habilitado: "Habilitado",
    deshabilitado: "Desabilitado",
    desasignar: "Remover atribuição",
    desasignarConfirm: "{nombre} deixa de operar esta campanha.",

    // Herencia
    grupoClasificaciones: "Grupo de classificações",
    buscarGrupoClasificaciones: "Pesquisar grupo de classificações...",
    vacioGrupoClasificaciones: "Nenhum grupo de classificações encontrado.",
    verClasificaciones: "Ver classificações do grupo",
    grupoMarcas: "Grupo de marcas",
    buscarGrupoMarcas: "Pesquisar grupo de marcas...",
    vacioGrupoMarcas: "Nenhum grupo de marcas encontrado.",
    verMarcas: "Ver marcas do grupo",
    buscarFeriados: "Pesquisar grupo de feriados...",
    vacioFeriados: "Nenhum grupo de feriados encontrado.",
    verFeriados: "Ver datas do grupo",
    listaExclusion: "Lista de exclusão",
    buscarListaExclusion: "Pesquisar lista de exclusão...",
    vacioListaExclusion: "Nenhuma lista de exclusão encontrada.",
    verContactos: "Ver contatos da lista",
    heredaDe: "Sem atribuição aqui, herda de {proyecto}",
    sinAsignar: "Sem atribuição",
    "dialogo.clasificaciones": "Classificações — {nombre}",
    "dialogo.marcas": "Marcas — {nombre}",
    "dialogo.feriados": "Feriados — {nombre}",
    "dialogo.exclusion": "Lista de exclusão — {nombre}",
    soloLecturaClasificaciones:
      "Visualização somente leitura. Para editar o grupo, faça isso em Classificações.",
    soloLecturaMarcas:
      "Visualização somente leitura. Para editar o grupo, faça isso em Marcas.",
    soloLecturaFeriados:
      "Visualização somente leitura. Para editar o grupo, faça isso em Feriados.",
    soloLecturaExclusion:
      "Visualização somente leitura. Para editar a lista, faça isso em Listas de exclusão.",
    localeFecha: "pt-BR",

    // Horarios
    horariosPersonalizados: "Personalizados para esta campanha.",
    horariosHeredadosDe:
      "Herdados de {proyecto}. Ative “Personalizar” para redefini-los.",
    horariosHeredadosProyecto:
      "Herdados do projeto. Ative “Personalizar” para redefini-los.",
    personalizar: "Personalizar",
    horariosSinBandas:
      "São herdados do projeto. Se o projeto não define horários, a campanha atende sem restrição de horário.",
    cerrado: "Fechado",

    // Picker de cuentas salientes
    sinCuentasAsociadas: "Sem contas associadas",
    buscarCuenta: "Pesquisar conta...",
    vacioCuenta: "Nenhuma conta encontrada.",

    // Comboboxes (valores por defecto)
    comboPlaceholder: "Selecione uma opção",
    comboMultiPlaceholder: "Selecione uma ou mais opções",
    comboBuscar: "Pesquisar...",
    comboVacio: "Nenhum resultado encontrado.",
    comboSeleccionadas: "{n} selecionada(s)",
    comboQuitar: "Remover {nombre}",
  },
  ca: {
    // Listado
    titulo: "Campanyes",
    descripcion:
      "Gestiona les campanyes de cada projecte. Entra en un projecte per ajustar-ne la configuració comuna o crea una campanya nova.",
    proyecto: "Projecte",
    sinProyecto: "Sense projecte",
    editarProyecto: "Edita el projecte",
    editarProyectoAria: "Edita el projecte {nombre}",
    usuariosAsignados: "Usuaris assignats",
    cuentasSalientes: "Comptes de sortida",
    nuevoProyecto: "Projecte nou",
    nuevaCampania: "Campanya nova",
    "accion.asignarUsuarios": "Assigna usuaris",
    "accion.duplicar": "Duplica",

    // Alta
    "nueva.descripcion":
      "Indica el nom i el projecte per crear-la. La resta de la configuració la pots completar més endavant.",
    crearCampania: "Crea la campanya",
    infoGeneral: "Informació general",
    nombrePlaceholder: "Ex.: Cobranzas Activa PCP",
    proyectoPlaceholder: "Selecciona un projecte",
    proyectoBuscar: "Cerca un projecte...",
    proyectoVacio: "No s'ha trobat cap projecte.",
    objetivo: "Objectiu",
    cuentasSalientesDescNueva:
      "Línies des de les quals es poden fer trucades per a aquesta campanya. És opcional; les pots associar més endavant.",
    cuentasSalientesDesc:
      "Línies des de les quals es poden fer trucades per a aquesta campanya.",
    configHeredada: "Configuració heretada del projecte",
    configHeredadaDescNueva:
      "Tot allò que deixis sense assignar aquí pren la configuració del projecte escollit. Ho pots personalitzar en qualsevol moment des de l'edició de la campanya.",
    horarios: "Horaris d'atenció",

    // Detalle / edición
    "detalle.descripcion": "Campanya de {proyecto}",
    "tab.general": "General",
    configHeredadaDescProyecto:
      "Es pren de {proyecto}, excepte allò que personalitzis aquí.",
    configHeredadaDescLibre: "La pots personalitzar per a aquesta campanya.",
    horariosDesc:
      "Heretats del projecte tret que els personalitzis per a aquesta campanya.",
    usuariosOperan: "{n} usuari(s) operen aquesta campanya.",
    asignarUsuario: "Assigna un usuari",
    buscarUsuario: "Cerca un usuari...",
    sinUsuariosDisponibles: "No hi ha usuaris disponibles.",
    colUsuario: "Usuari",
    colEmail: "Correu electrònic",
    sinUsuariosAsignados: "Encara no hi ha usuaris assignats.",
    habilitado: "Habilitat",
    deshabilitado: "Deshabilitat",
    desasignar: "Desassigna",
    desasignarConfirm: "{nombre} deixa d'operar aquesta campanya.",

    // Herencia
    grupoClasificaciones: "Grup de classificacions",
    buscarGrupoClasificaciones: "Cerca un grup de classificacions...",
    vacioGrupoClasificaciones: "No s'ha trobat cap grup de classificacions.",
    verClasificaciones: "Mostra les classificacions del grup",
    grupoMarcas: "Grup de marques",
    buscarGrupoMarcas: "Cerca un grup de marques...",
    vacioGrupoMarcas: "No s'ha trobat cap grup de marques.",
    verMarcas: "Mostra les marques del grup",
    buscarFeriados: "Cerca un grup de festius...",
    vacioFeriados: "No s'ha trobat cap grup de festius.",
    verFeriados: "Mostra les dates del grup",
    listaExclusion: "Llista d'exclusió",
    buscarListaExclusion: "Cerca una llista d'exclusió...",
    vacioListaExclusion: "No s'ha trobat cap llista d'exclusió.",
    verContactos: "Mostra els contactes de la llista",
    heredaDe: "Si no s'assigna aquí, hereta de {proyecto}",
    sinAsignar: "Sense assignar",
    "dialogo.clasificaciones": "Classificacions — {nombre}",
    "dialogo.marcas": "Marques — {nombre}",
    "dialogo.feriados": "Festius — {nombre}",
    "dialogo.exclusion": "Llista d'exclusió — {nombre}",
    soloLecturaClasificaciones:
      "Vista de només lectura. Per editar el grup, fes-ho des de Classificacions.",
    soloLecturaMarcas:
      "Vista de només lectura. Per editar el grup, fes-ho des de Marques.",
    soloLecturaFeriados:
      "Vista de només lectura. Per editar el grup, fes-ho des de Festius.",
    soloLecturaExclusion:
      "Vista de només lectura. Per editar la llista, fes-ho des de Llistes d'exclusió.",
    localeFecha: "ca-ES",

    // Horarios
    horariosPersonalizados: "Personalitzats per a aquesta campanya.",
    horariosHeredadosDe:
      "Heretats de {proyecto}. Activa «Personalitza» per redefinir-los.",
    horariosHeredadosProyecto:
      "Heretats del projecte. Activa «Personalitza» per redefinir-los.",
    personalizar: "Personalitza",
    horariosSinBandas:
      "S'hereten del projecte. Si el projecte no defineix horaris, la campanya atén sense restricció horària.",
    cerrado: "Tancat",

    // Picker de cuentas salientes
    sinCuentasAsociadas: "Sense comptes associats",
    buscarCuenta: "Cerca un compte...",
    vacioCuenta: "No s'ha trobat cap compte.",

    // Comboboxes (valores por defecto)
    comboPlaceholder: "Selecciona una opció",
    comboMultiPlaceholder: "Selecciona una o més opcions",
    comboBuscar: "Cerca...",
    comboVacio: "No s'ha trobat cap resultat.",
    comboSeleccionadas: "{n} seleccionat(s)",
    comboQuitar: "Treu {nombre}",
  },
};
