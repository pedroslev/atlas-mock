import type { NamespaceDict } from "@/lib/i18n/dict/types";

// Alta/edición de proyecto (se llega desde Campañas), su configuración
// heredable y el editor de horarios de atención.
//
// `dias.*` vive acá y no en common porque `diasSemana` de mock-data trae los
// labels hardcodeados en español: la UI traduce por `key`, no por `label`.
export const proyectos: NamespaceDict = {
  es: {
    "nuevo.titulo": "Nuevo proyecto",
    "nuevo.crear": "Crear proyecto",
    "nuevo.configurar": "Configurar proyecto",

    "detalle.descripcion":
      "Los horarios, clasificaciones y feriados que definas acá se aplican por defecto a todas las campañas del proyecto, salvo que una campaña los personalice.",
    "detalle.infoGeneral": "Información general",

    "campos.nombrePlaceholder": "Ej: Cobranzas",
    "campos.objetivo": "Objetivo",

    "acciones.titulo": "Acciones rápidas",
    "acciones.descripcion": "Atajos frecuentes al gestionar este proyecto.",
    "acciones.crearFeriados": "Crear grupo de feriados",
    "acciones.crearClasificaciones": "Crear grupo de clasificaciones",
    "acciones.nuevaCampania": "Nueva campaña en este proyecto",

    "herencia.titulo": "Configuración por defecto",
    "herencia.grupoClasificacion": "Grupo de clasificaciones",
    "herencia.grupoFeriados": "Grupo de feriados",
    "herencia.sinAsignar": "Sin asignar",
    "herencia.sinGrupos": "No se encontró ningún grupo.",
    "herencia.buscarGrupo": "Buscar grupo de clasificaciones...",
    "herencia.sinGruposFeriados": "No se encontró ningún grupo de feriados.",
    "herencia.buscarGrupoFeriados": "Buscar grupo de feriados...",

    "horarios.titulo": "Horarios de atención",
    "horarios.descripcion":
      "Una o varias bandas horarias por día (ej. con pausa de almuerzo). Los días sin banda quedan cerrados.",
    "horarios.cerrado": "Cerrado",
    "horarios.atencionDia": "Atención: {dia}",
    "horarios.horaInicio": "Hora de inicio, banda {n}, {dia}",
    "horarios.horaFin": "Hora de fin, banda {n}, {dia}",
    "horarios.quitarBanda": "Quitar banda horaria",
    "horarios.agregarBanda":
      "Agregar otra banda horaria (ej. pausa de almuerzo)",

    "dias.lunes": "Lunes",
    "dias.martes": "Martes",
    "dias.miercoles": "Miércoles",
    "dias.jueves": "Jueves",
    "dias.viernes": "Viernes",
    "dias.sabado": "Sábado",
    "dias.domingo": "Domingo",
  },
  en: {
    "nuevo.titulo": "New project",
    "nuevo.crear": "Create project",
    "nuevo.configurar": "Configure project",

    "detalle.descripcion":
      "The business hours, classifications and holidays you set here apply by default to every campaign in the project, unless a campaign overrides them.",
    "detalle.infoGeneral": "General information",

    "campos.nombrePlaceholder": "e.g. Collections",
    "campos.objetivo": "Objective",

    "acciones.titulo": "Quick actions",
    "acciones.descripcion": "Frequent shortcuts for managing this project.",
    "acciones.crearFeriados": "Create holiday group",
    "acciones.crearClasificaciones": "Create classification group",
    "acciones.nuevaCampania": "New campaign in this project",

    "herencia.titulo": "Default configuration",
    "herencia.grupoClasificacion": "Classification group",
    "herencia.grupoFeriados": "Holiday group",
    "herencia.sinAsignar": "Unassigned",
    "herencia.sinGrupos": "No group found.",
    "herencia.buscarGrupo": "Search classification group...",
    "herencia.sinGruposFeriados": "No holiday group found.",
    "herencia.buscarGrupoFeriados": "Search holiday group...",

    "horarios.titulo": "Business hours",
    "horarios.descripcion":
      "One or more time bands per day (e.g. with a lunch break). Days without a band stay closed.",
    "horarios.cerrado": "Closed",
    "horarios.atencionDia": "Business hours: {dia}",
    "horarios.horaInicio": "Start time, band {n}, {dia}",
    "horarios.horaFin": "End time, band {n}, {dia}",
    "horarios.quitarBanda": "Remove time band",
    "horarios.agregarBanda": "Add another time band (e.g. lunch break)",

    "dias.lunes": "Monday",
    "dias.martes": "Tuesday",
    "dias.miercoles": "Wednesday",
    "dias.jueves": "Thursday",
    "dias.viernes": "Friday",
    "dias.sabado": "Saturday",
    "dias.domingo": "Sunday",
  },
  pt: {
    "nuevo.titulo": "Novo projeto",
    "nuevo.crear": "Criar projeto",
    "nuevo.configurar": "Configurar projeto",

    "detalle.descripcion":
      "Os horários, as classificações e os feriados que você definir aqui se aplicam por padrão a todas as campanhas do projeto, a menos que uma campanha os personalize.",
    "detalle.infoGeneral": "Informações gerais",

    "campos.nombrePlaceholder": "Ex.: Cobranças",
    "campos.objetivo": "Objetivo",

    "acciones.titulo": "Ações rápidas",
    "acciones.descripcion": "Atalhos frequentes para gerenciar este projeto.",
    "acciones.crearFeriados": "Criar grupo de feriados",
    "acciones.crearClasificaciones": "Criar grupo de classificações",
    "acciones.nuevaCampania": "Nova campanha neste projeto",

    "herencia.titulo": "Configuração padrão",
    "herencia.grupoClasificacion": "Grupo de classificações",
    "herencia.grupoFeriados": "Grupo de feriados",
    "herencia.sinAsignar": "Não atribuído",
    "herencia.sinGrupos": "Nenhum grupo encontrado.",
    "herencia.buscarGrupo": "Pesquisar grupo de classificações...",
    "herencia.sinGruposFeriados": "Nenhum grupo de feriados encontrado.",
    "herencia.buscarGrupoFeriados": "Pesquisar grupo de feriados...",

    "horarios.titulo": "Horários de atendimento",
    "horarios.descripcion":
      "Uma ou várias faixas de horário por dia (ex.: com pausa para o almoço). Os dias sem faixa ficam fechados.",
    "horarios.cerrado": "Fechado",
    "horarios.atencionDia": "Atendimento: {dia}",
    "horarios.horaInicio": "Horário de início, faixa {n}, {dia}",
    "horarios.horaFin": "Horário de término, faixa {n}, {dia}",
    "horarios.quitarBanda": "Remover faixa de horário",
    "horarios.agregarBanda":
      "Adicionar outra faixa de horário (ex.: pausa para o almoço)",

    "dias.lunes": "Segunda-feira",
    "dias.martes": "Terça-feira",
    "dias.miercoles": "Quarta-feira",
    "dias.jueves": "Quinta-feira",
    "dias.viernes": "Sexta-feira",
    "dias.sabado": "Sábado",
    "dias.domingo": "Domingo",
  },
  ca: {
    "nuevo.titulo": "Nou projecte",
    "nuevo.crear": "Crea el projecte",
    "nuevo.configurar": "Configura el projecte",

    "detalle.descripcion":
      "Els horaris, les classificacions i els festius que defineixis aquí s'apliquen per defecte a totes les campanyes del projecte, tret que una campanya els personalitzi.",
    "detalle.infoGeneral": "Informació general",

    "campos.nombrePlaceholder": "Ex.: Cobraments",
    "campos.objetivo": "Objectiu",

    "acciones.titulo": "Accions ràpides",
    "acciones.descripcion": "Dreceres freqüents per gestionar aquest projecte.",
    "acciones.crearFeriados": "Crea un grup de festius",
    "acciones.crearClasificaciones": "Crea un grup de classificacions",
    "acciones.nuevaCampania": "Nova campanya en aquest projecte",

    "herencia.titulo": "Configuració per defecte",
    "herencia.grupoClasificacion": "Grup de classificacions",
    "herencia.grupoFeriados": "Grup de festius",
    "herencia.sinAsignar": "Sense assignar",
    "herencia.sinGrupos": "No s'ha trobat cap grup.",
    "herencia.buscarGrupo": "Cerca un grup de classificacions...",
    "herencia.sinGruposFeriados": "No s'ha trobat cap grup de festius.",
    "herencia.buscarGrupoFeriados": "Cerca un grup de festius...",

    "horarios.titulo": "Horaris d'atenció",
    "horarios.descripcion":
      "Una o diverses franges horàries per dia (p. ex., amb pausa per dinar). Els dies sense franja queden tancats.",
    "horarios.cerrado": "Tancat",
    "horarios.atencionDia": "Atenció: {dia}",
    "horarios.horaInicio": "Hora d'inici, franja {n}, {dia}",
    "horarios.horaFin": "Hora de fi, franja {n}, {dia}",
    "horarios.quitarBanda": "Treu la franja horària",
    "horarios.agregarBanda":
      "Afegeix una altra franja horària (p. ex., pausa per dinar)",

    "dias.lunes": "Dilluns",
    "dias.martes": "Dimarts",
    "dias.miercoles": "Dimecres",
    "dias.jueves": "Dijous",
    "dias.viernes": "Divendres",
    "dias.sabado": "Dissabte",
    "dias.domingo": "Diumenge",
  },
};
