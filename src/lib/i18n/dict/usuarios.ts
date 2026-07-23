import type { NamespaceDict } from "@/lib/i18n/dict/types";

// Pantallas de USUARIOS (carpeta técnica `agentes`): listado, alta, detalle y
// eliminación. El título de la sección sale de `common.nav.usuarios`; las
// acciones repetidas, de `common.acciones.*`.
export const usuarios: NamespaceDict = {
  es: {
    "descripcion":
      "Administrá las personas con acceso a la plataforma y su estado de acceso. Los grupos y permisos de cada una se definen en Grupos y roles.",
    "nuevo": "Nuevo usuario",
    "crear": "Crear usuario",
    "usuario": "Usuario",
    "email": "Email",

    "habilitado": "Habilitado",
    "deshabilitado": "Deshabilitado",
    "acciones.habilitar": "Habilitar",
    "acciones.deshabilitar": "Deshabilitar",

    "form.titulo": "Datos del usuario",
    "form.nombrePlaceholder": "Ej: Marina Acosta",
    "form.emailPlaceholder": "Ej: marina.acosta@bancosur.com",
    "form.grupo": "Grupo de trabajo",
    "form.grupoPlaceholder": "Sin asignar",
    "form.grupoBuscar": "Buscar grupo de trabajo...",
    "form.grupoVacio": "No se encontró ningún grupo de trabajo.",
    "form.grupoAyuda":
      "Opcional. Un usuario sin grupo puede iniciar sesión pero no tiene permisos ni estados auxiliares operativos hasta que se lo asigne a uno.",

    "detalle.descripcion":
      "Datos del usuario, sus grupos de trabajo y los permisos que tiene asignados.",
    "detalle.habilitadoAyuda":
      "Deshabilitar bloquea el acceso del usuario sin eliminar su historial ni sus asignaciones — se puede volver a habilitar en cualquier momento. Eliminar el usuario es una acción aparte y definitiva, y solo está disponible con el usuario ya deshabilitado.",
    "detalle.permisosTitulo": "Permisos y estados auxiliares",
    "detalle.permisosDesc":
      "Lo que le habilitan sus {n} grupo(s). Los grupos se administran desde Grupos y roles.",
    "detalle.permisosDescOverride":
      "Lo que le habilitan sus {n} grupo(s) más lo que tiene asignado de forma individual. Los grupos se administran desde Grupos y roles.",
    "detalle.permisos": "Permisos",
    "detalle.sinPermisos": "Sin permisos asignados.",
    "detalle.sinAuxiliares": "Sin estados auxiliares asignados.",
    "detalle.individual": "+ individual",
    "detalle.peligroTitulo": "Zona de peligro",
    "detalle.peligroDesc":
      "Eliminar el usuario es permanente. Solo se habilita cuando ya está deshabilitado.",

    "eliminar.boton": "Eliminar usuario",
    "eliminar.tooltip": "Eliminar usuario",
    "eliminar.tooltipBloqueado":
      "Deshabilitá el usuario antes de poder eliminarlo",
    "eliminar.titulo": "¿Eliminar a {nombre}?",
    "eliminar.descripcion":
      "Esta acción es permanente y no se puede deshacer: se pierde el registro del usuario. Deshabilitarlo, en cambio, solo bloquea su acceso y se puede revertir en cualquier momento.",
    "eliminar.bloqueado": "Deshabilitá primero al usuario para poder eliminarlo.",
    "eliminar.permanente": "Esta acción es permanente y no se puede deshacer.",
  },
  en: {
    "descripcion":
      "Manage the people with access to the platform and their access status. Each person's groups and permissions are defined in Groups and roles.",
    "nuevo": "New user",
    "crear": "Create user",
    "usuario": "User",
    "email": "Email",

    "habilitado": "Enabled",
    "deshabilitado": "Disabled",
    "acciones.habilitar": "Enable",
    "acciones.deshabilitar": "Disable",

    "form.titulo": "User details",
    "form.nombrePlaceholder": "e.g. Marina Acosta",
    "form.emailPlaceholder": "e.g. marina.acosta@bancosur.com",
    "form.grupo": "Working group",
    "form.grupoPlaceholder": "Unassigned",
    "form.grupoBuscar": "Search working group...",
    "form.grupoVacio": "No working group found.",
    "form.grupoAyuda":
      "Optional. A user without a group can sign in but has no permissions or operational auxiliary states until they are assigned to one.",

    "detalle.descripcion":
      "User details, their working groups and the permissions they have assigned.",
    "detalle.habilitadoAyuda":
      "Disabling blocks the user's access without deleting their history or their assignments — they can be enabled again at any time. Deleting the user is a separate, final action, and it is only available once the user is already disabled.",
    "detalle.permisosTitulo": "Permissions and auxiliary states",
    "detalle.permisosDesc":
      "What their {n} group(s) enable. Groups are managed from Groups and roles.",
    "detalle.permisosDescOverride":
      "What their {n} group(s) enable, plus what is assigned to them individually. Groups are managed from Groups and roles.",
    "detalle.permisos": "Permissions",
    "detalle.sinPermisos": "No permissions assigned.",
    "detalle.sinAuxiliares": "No auxiliary states assigned.",
    "detalle.individual": "+ individual",
    "detalle.peligroTitulo": "Danger zone",
    "detalle.peligroDesc":
      "Deleting the user is permanent. It is only enabled once the user is already disabled.",

    "eliminar.boton": "Delete user",
    "eliminar.tooltip": "Delete user",
    "eliminar.tooltipBloqueado": "Disable the user before you can delete them",
    "eliminar.titulo": "Delete {nombre}?",
    "eliminar.descripcion":
      "This action is permanent and cannot be undone: the user's record is lost. Disabling them, on the other hand, only blocks their access and can be reverted at any time.",
    "eliminar.bloqueado": "Disable the user first in order to delete them.",
    "eliminar.permanente": "This action is permanent and cannot be undone.",
  },
  pt: {
    "descripcion":
      "Gerencie as pessoas com acesso à plataforma e a situação de acesso de cada uma. Os grupos e as permissões de cada pessoa são definidos em Grupos e funções.",
    "nuevo": "Novo usuário",
    "crear": "Criar usuário",
    "usuario": "Usuário",
    "email": "E-mail",

    "habilitado": "Habilitado",
    "deshabilitado": "Desabilitado",
    "acciones.habilitar": "Habilitar",
    "acciones.deshabilitar": "Desabilitar",

    "form.titulo": "Dados do usuário",
    "form.nombrePlaceholder": "Ex.: Marina Acosta",
    "form.emailPlaceholder": "Ex.: marina.acosta@bancosur.com",
    "form.grupo": "Grupo de trabalho",
    "form.grupoPlaceholder": "Sem atribuição",
    "form.grupoBuscar": "Pesquisar grupo de trabalho...",
    "form.grupoVacio": "Nenhum grupo de trabalho encontrado.",
    "form.grupoAyuda":
      "Opcional. Um usuário sem grupo consegue entrar, mas não tem permissões nem estados auxiliares operacionais até ser atribuído a um.",

    "detalle.descripcion":
      "Dados do usuário, seus grupos de trabalho e as permissões atribuídas.",
    "detalle.habilitadoAyuda":
      "Desabilitar bloqueia o acesso do usuário sem excluir seu histórico nem suas atribuições — é possível habilitá-lo novamente a qualquer momento. Excluir o usuário é uma ação separada e definitiva, e só fica disponível com o usuário já desabilitado.",
    "detalle.permisosTitulo": "Permissões e estados auxiliares",
    "detalle.permisosDesc":
      "O que os seus {n} grupo(s) habilitam. Os grupos são administrados em Grupos e funções.",
    "detalle.permisosDescOverride":
      "O que os seus {n} grupo(s) habilitam mais o que está atribuído de forma individual. Os grupos são administrados em Grupos e funções.",
    "detalle.permisos": "Permissões",
    "detalle.sinPermisos": "Sem permissões atribuídas.",
    "detalle.sinAuxiliares": "Sem estados auxiliares atribuídos.",
    "detalle.individual": "+ individual",
    "detalle.peligroTitulo": "Zona de perigo",
    "detalle.peligroDesc":
      "Excluir o usuário é permanente. Só fica habilitado quando ele já está desabilitado.",

    "eliminar.boton": "Excluir usuário",
    "eliminar.tooltip": "Excluir usuário",
    "eliminar.tooltipBloqueado":
      "Desabilite o usuário antes de poder excluí-lo",
    "eliminar.titulo": "Excluir {nombre}?",
    "eliminar.descripcion":
      "Esta ação é permanente e não pode ser desfeita: o registro do usuário é perdido. Desabilitá-lo, por outro lado, apenas bloqueia o acesso e pode ser revertido a qualquer momento.",
    "eliminar.bloqueado": "Desabilite o usuário primeiro para poder excluí-lo.",
    "eliminar.permanente": "Esta ação é permanente e não pode ser desfeita.",
  },
  ca: {
    "descripcion":
      "Administra les persones amb accés a la plataforma i el seu estat d'accés. Els grups i els permisos de cadascuna es defineixen a Grups i rols.",
    "nuevo": "Nou usuari",
    "crear": "Crea usuari",
    "usuario": "Usuari",
    "email": "Correu electrònic",

    "habilitado": "Habilitat",
    "deshabilitado": "Deshabilitat",
    "acciones.habilitar": "Habilita",
    "acciones.deshabilitar": "Deshabilita",

    "form.titulo": "Dades de l'usuari",
    "form.nombrePlaceholder": "Ex.: Marina Acosta",
    "form.emailPlaceholder": "Ex.: marina.acosta@bancosur.com",
    "form.grupo": "Grup de treball",
    "form.grupoPlaceholder": "Sense assignar",
    "form.grupoBuscar": "Cerca un grup de treball...",
    "form.grupoVacio": "No s'ha trobat cap grup de treball.",
    "form.grupoAyuda":
      "Opcional. Un usuari sense grup pot iniciar sessió, però no té permisos ni estats auxiliars operatius fins que se l'assigna a un.",

    "detalle.descripcion":
      "Dades de l'usuari, els seus grups de treball i els permisos que té assignats.",
    "detalle.habilitadoAyuda":
      "Deshabilitar bloqueja l'accés de l'usuari sense eliminar-ne l'historial ni les assignacions: es pot tornar a habilitar en qualsevol moment. Eliminar l'usuari és una acció a part i definitiva, i només està disponible amb l'usuari ja deshabilitat.",
    "detalle.permisosTitulo": "Permisos i estats auxiliars",
    "detalle.permisosDesc":
      "El que li habiliten els seus {n} grup(s). Els grups s'administren des de Grups i rols.",
    "detalle.permisosDescOverride":
      "El que li habiliten els seus {n} grup(s) més el que té assignat de manera individual. Els grups s'administren des de Grups i rols.",
    "detalle.permisos": "Permisos",
    "detalle.sinPermisos": "Sense permisos assignats.",
    "detalle.sinAuxiliares": "Sense estats auxiliars assignats.",
    "detalle.individual": "+ individual",
    "detalle.peligroTitulo": "Zona de perill",
    "detalle.peligroDesc":
      "Eliminar l'usuari és permanent. Només s'habilita quan ja està deshabilitat.",

    "eliminar.boton": "Elimina l'usuari",
    "eliminar.tooltip": "Elimina l'usuari",
    "eliminar.tooltipBloqueado":
      "Deshabilita l'usuari abans de poder-lo eliminar",
    "eliminar.titulo": "Vols eliminar {nombre}?",
    "eliminar.descripcion":
      "Aquesta acció és permanent i no es pot desfer: es perd el registre de l'usuari. Deshabilitar-lo, en canvi, només li bloqueja l'accés i es pot revertir en qualsevol moment.",
    "eliminar.bloqueado":
      "Primer has de deshabilitar l'usuari per poder eliminar-lo.",
    "eliminar.permanente": "Aquesta acció és permanent i no es pot desfer.",
  },
};
