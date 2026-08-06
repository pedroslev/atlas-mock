import type { NamespaceDict } from "@/lib/i18n/dict/types";

// Pantallas de GRUPOS Y ROLES (carpeta técnica `grupos-de-trabajo`): listado,
// alta, detalle, árbol de permisos, miembros y selector de auxiliares. El
// título de la sección sale de `common.nav.gruposRoles`; los nombres de los
// módulos del árbol de permisos, de `common.nav.*` / `common.buscador.*`.
export const grupos: NamespaceDict = {
  es: {
    "descripcion":
      "Definí qué puede hacer cada equipo: sus permisos, los estados auxiliares habilitados y las personas que lo integran.",
    "nuevo": "Nuevo grupo de trabajo",
    "crear": "Crear grupo",
    "acciones.duplicar": "Duplicar",
    "col.auxiliares": "Auxiliares habilitados",

    "infoGeneral": "Información general",
    "form.nombrePlaceholder": "Ej: Cobranzas",

    "aux.titulo": "Estados auxiliares habilitados",
    "aux.desc":
      "Buscá y habilitá los estados que estarán disponibles para todos los usuarios de este grupo.",
    "aux.descNuevo":
      "Buscá y habilitá los estados que estarán disponibles para este grupo. Los usuarios y permisos se asignan después, desde la edición del grupo.",
    "aux.placeholder": "Buscar y habilitar estados auxiliares",
    "aux.seleccionados": "{n} habilitado(s)",
    "aux.buscar": "Buscar estado auxiliar...",
    "aux.vacio": "No se encontró ningún estado auxiliar.",
    "aux.deshabilitarAria": "Deshabilitar {nombre}",

    "permisos.titulo": "Permisos",
    "permisos.descripcion":
      "Definí qué puede hacer este grupo en cada sección: consultar, editar o eliminar. Aplica a todos sus usuarios.",
    "permisos.modulo": "Módulo",
    "permisos.aria": "{accion} en {modulo}",
    "permiso.lectura": "Lectura",
    "permiso.escritura": "Escritura",
    "permiso.eliminacion": "Eliminación",
    "permisos.seccionOlimpo": "Olimpo",
    "permisos.seccionHermes": "Hermes",
    "permisos.hermesDescripcion":
      "Habilita el acceso de este grupo al PAD del agente.",
    "permisos.hermesAcceso": "Acceso",
    "permisos.hermesAria": "Acceso al PAD (Hermes)",

    "miembros.titulo": "Usuarios del grupo",
    "miembros.conteo": "{n} usuario(s).",
    "miembros.agregar": "Agregar usuario",
    "miembros.buscar": "Buscar usuario...",
    "miembros.sinDisponibles": "No hay más usuarios para agregar.",
    "miembros.vacio": "Todavía no hay usuarios en este grupo.",
    "miembros.permisosIndividuales": "+ permisos individuales",
    "miembros.quitar": "Quitar del grupo",
    "miembros.quitarAria": "Quitar a {nombre} del grupo",
  },
  en: {
    "descripcion":
      "Define what each team can do: its permissions, the auxiliary states it has enabled and the people who belong to it.",
    "nuevo": "New working group",
    "crear": "Create group",
    "acciones.duplicar": "Duplicate",
    "col.auxiliares": "Enabled auxiliaries",

    "infoGeneral": "General information",
    "form.nombrePlaceholder": "e.g. Cobranzas",

    "aux.titulo": "Enabled auxiliary states",
    "aux.desc":
      "Search and enable the states that will be available to every user in this group.",
    "aux.descNuevo":
      "Search and enable the states that will be available for this group. Users and permissions are assigned later, from the group's edit screen.",
    "aux.placeholder": "Search and enable auxiliary states",
    "aux.seleccionados": "{n} enabled",
    "aux.buscar": "Search auxiliary state...",
    "aux.vacio": "No auxiliary state found.",
    "aux.deshabilitarAria": "Disable {nombre}",

    "permisos.titulo": "Permissions",
    "permisos.descripcion":
      "Define what this group can do in each section: view, edit or delete. It applies to all of its users.",
    "permisos.modulo": "Module",
    "permisos.aria": "{accion} in {modulo}",
    "permiso.lectura": "Read",
    "permiso.escritura": "Write",
    "permiso.eliminacion": "Delete",
    "permisos.seccionOlimpo": "Olimpo",
    "permisos.seccionHermes": "Hermes",
    "permisos.hermesDescripcion":
      "Grants this group access to the agent's PAD.",
    "permisos.hermesAcceso": "Access",
    "permisos.hermesAria": "Access to the PAD (Hermes)",

    "miembros.titulo": "Group users",
    "miembros.conteo": "{n} user(s).",
    "miembros.agregar": "Add user",
    "miembros.buscar": "Search user...",
    "miembros.sinDisponibles": "There are no more users to add.",
    "miembros.vacio": "There are no users in this group yet.",
    "miembros.permisosIndividuales": "+ individual permissions",
    "miembros.quitar": "Remove from group",
    "miembros.quitarAria": "Remove {nombre} from the group",
  },
  pt: {
    "descripcion":
      "Defina o que cada equipe pode fazer: suas permissões, os estados auxiliares habilitados e as pessoas que a integram.",
    "nuevo": "Novo grupo de trabalho",
    "crear": "Criar grupo",
    "acciones.duplicar": "Duplicar",
    "col.auxiliares": "Auxiliares habilitados",

    "infoGeneral": "Informações gerais",
    "form.nombrePlaceholder": "Ex.: Cobranzas",

    "aux.titulo": "Estados auxiliares habilitados",
    "aux.desc":
      "Pesquise e habilite os estados que estarão disponíveis para todos os usuários deste grupo.",
    "aux.descNuevo":
      "Pesquise e habilite os estados que estarão disponíveis para este grupo. Os usuários e as permissões são atribuídos depois, na edição do grupo.",
    "aux.placeholder": "Pesquisar e habilitar estados auxiliares",
    "aux.seleccionados": "{n} habilitado(s)",
    "aux.buscar": "Pesquisar estado auxiliar...",
    "aux.vacio": "Nenhum estado auxiliar encontrado.",
    "aux.deshabilitarAria": "Desabilitar {nombre}",

    "permisos.titulo": "Permissões",
    "permisos.descripcion":
      "Defina o que este grupo pode fazer em cada seção: consultar, editar ou excluir. Vale para todos os seus usuários.",
    "permisos.modulo": "Módulo",
    "permisos.aria": "{accion} em {modulo}",
    "permiso.lectura": "Leitura",
    "permiso.escritura": "Escrita",
    "permiso.eliminacion": "Exclusão",
    "permisos.seccionOlimpo": "Olimpo",
    "permisos.seccionHermes": "Hermes",
    "permisos.hermesDescripcion":
      "Habilita o acesso deste grupo ao PAD do agente.",
    "permisos.hermesAcceso": "Acesso",
    "permisos.hermesAria": "Acesso ao PAD (Hermes)",

    "miembros.titulo": "Usuários do grupo",
    "miembros.conteo": "{n} usuário(s).",
    "miembros.agregar": "Adicionar usuário",
    "miembros.buscar": "Pesquisar usuário...",
    "miembros.sinDisponibles": "Não há mais usuários para adicionar.",
    "miembros.vacio": "Ainda não há usuários neste grupo.",
    "miembros.permisosIndividuales": "+ permissões individuais",
    "miembros.quitar": "Remover do grupo",
    "miembros.quitarAria": "Remover {nombre} do grupo",
  },
  ca: {
    "descripcion":
      "Defineix què pot fer cada equip: els seus permisos, els estats auxiliars habilitats i les persones que l'integren.",
    "nuevo": "Nou grup de treball",
    "crear": "Crea grup",
    "acciones.duplicar": "Duplica",
    "col.auxiliares": "Auxiliars habilitats",

    "infoGeneral": "Informació general",
    "form.nombrePlaceholder": "Ex.: Cobranzas",

    "aux.titulo": "Estats auxiliars habilitats",
    "aux.desc":
      "Cerca i habilita els estats que estaran disponibles per a tots els usuaris d'aquest grup.",
    "aux.descNuevo":
      "Cerca i habilita els estats que estaran disponibles per a aquest grup. Els usuaris i els permisos s'assignen després, des de l'edició del grup.",
    "aux.placeholder": "Cerca i habilita estats auxiliars",
    "aux.seleccionados": "{n} habilitat(s)",
    "aux.buscar": "Cerca un estat auxiliar...",
    "aux.vacio": "No s'ha trobat cap estat auxiliar.",
    "aux.deshabilitarAria": "Deshabilita {nombre}",

    "permisos.titulo": "Permisos",
    "permisos.descripcion":
      "Defineix què pot fer aquest grup a cada secció: consultar, editar o eliminar. S'aplica a tots els seus usuaris.",
    "permisos.modulo": "Mòdul",
    "permisos.aria": "{accion} a {modulo}",
    "permiso.lectura": "Lectura",
    "permiso.escritura": "Escriptura",
    "permiso.eliminacion": "Eliminació",
    "permisos.seccionOlimpo": "Olimpo",
    "permisos.seccionHermes": "Hermes",
    "permisos.hermesDescripcion":
      "Habilita l'accés d'aquest grup al PAD de l'agent.",
    "permisos.hermesAcceso": "Accés",
    "permisos.hermesAria": "Accés al PAD (Hermes)",

    "miembros.titulo": "Usuaris del grup",
    "miembros.conteo": "{n} usuari(s).",
    "miembros.agregar": "Afegeix usuari",
    "miembros.buscar": "Cerca un usuari...",
    "miembros.sinDisponibles": "No hi ha més usuaris per afegir.",
    "miembros.vacio": "Encara no hi ha usuaris en aquest grup.",
    "miembros.permisosIndividuales": "+ permisos individuals",
    "miembros.quitar": "Treu del grup",
    "miembros.quitarAria": "Treu {nombre} del grup",
  },
};
