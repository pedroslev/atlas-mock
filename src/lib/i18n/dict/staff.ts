import type { NamespaceDict } from "@/lib/i18n/dict/types";

// Control de acceso del staff de Mitrol a Zeus (ATLAS-1282). Público: personal
// interno de Mitrol (soporte, ventas, administración). Solo español: el resto
// de los idiomas cae al español por la cadena de fallback del diccionario.
export const staff: NamespaceDict = {
  es: {
    "nav": "Staff",

    "titulo": "Usuarios del staff",
    "descripcion":
      "Personas del directorio de Mitrol. Habilitá a quienes necesiten usar Zeus y asignales permisos.",
    "sync.boton": "Sincronizar con el directorio",
    "sync.enCurso": "Sincronizando…",
    "sync.okTitulo": "Directorio sincronizado",
    "sync.ok": "Se actualizaron las {n} personas activas del directorio.",
    "sync.errorTitulo": "No se pudo sincronizar",
    "sync.error": "El directorio no respondió. Nadie perdió el acceso; probá de nuevo en unos minutos.",
    "tab.personas": "Personas",
    "tab.grupos": "Grupos de permisos",
    "form.grupo": "Grupo de permisos",
    "form.grupoAyuda": "Obligatorio. La persona tiene exactamente los permisos y el alcance del grupo.",
    "form.grupoPlaceholder": "Elegir un grupo",
    "form.sinGrupos": "No hay grupos de permisos.",
    "grupos.noEliminable": "No se puede eliminar “{nombre}”: tiene {n} persona(s) asignada(s). Reasignalas a otro grupo desde cada persona y volvé a intentar.",
    "grupos.noEliminableTitulo": "El grupo tiene personas",
    "grupos.noEncontrado": "El grupo ya no existe.",

    "col.nombre": "Nombre",
    "col.mail": "Mail",
    "col.estado": "Estado en Zeus",
    "col.grupo": "Grupo",
    "col.sync": "Última sincronización",

    "estado.no-habilitado": "No habilitado",
    "estado.invitado": "Invitado",
    "estado.activo": "Activo",
    "estado.deshabilitado": "Deshabilitado",

    "sinGrupos": "—",
    "alcance.todos": "Todas las regiones",
    "alcance.n": "{n} regiones",
    "alcance.uno": "1 región",

    "accion.habilitar": "Habilitar",
    "accion.efectivos": "Ver permisos efectivos",
    "accion.deshabilitar": "Deshabilitar",
    "accion.deshabilitarTitulo": "¿Deshabilitar a {nombre}?",
    "accion.deshabilitarDescripcion":
      "{nombre} dejará de poder ingresar a Zeus. Podés volver a habilitarla cuando quieras.",

    "habilitar.descripcion":
      "Elegí un grupo de permisos y habilitala. Le llegará un mail para fijar su contraseña.",
    "habilitada": "Habilitada en Zeus",
    "habilitada.ayudaSi":
      "Puede ingresar a Zeus. Deshabilitarla le quita el acceso en el momento; podés volver a habilitarla cuando quieras.",
    "habilitada.ayudaNo":
      "No puede ingresar a Zeus. Al habilitarla le llega un mail para fijar su contraseña.",
    "habilitada.ayudaSinGrupo":
      "No puede ingresar a Zeus. Para habilitarla, elegí primero un grupo de permisos.",
    "editar.descripcion":
      "Cambiale el grupo de permisos.",
    "form.persona": "Nombre",
    "form.mail": "Mail",
    "form.directorioAyuda": "El nombre y el mail vienen del directorio y no se cambian desde Zeus.",
    "persona.datos": "Datos de la persona",
    "miembros.buscar": "Buscar...",

    "enviado.titulo": "Mail de alta enviado",
    "enviado.descripcion":
      "Le enviamos un mail a {mail} para que fije su contraseña. Hasta entonces figura como Invitada.",
    "enviado.volver": "Volver al listado",

    "efectivos.titulo": "Permisos efectivos",
    "efectivos.descripcion": "Lo que da el grupo: permisos y alcance por región.",
    "efectivos.sinPermisos": "Todavía no tiene permisos.",
    "efectivos.alcance": "Alcance",

    "area.clientes": "Clientes",
    "area.telefonia": "Telefonía",
    "area.facturacion": "Facturación",
    "area.regiones": "Regiones",
    "area.impersonacion": "Impersonación de clientes",
    "area.proveedoresIa": "Proveedores de IA",
    "area.staff": "Staff y permisos",
    "area.acotadaPorRegion": "Acotada por región",
    "perm.ver": "Ver",
    "perm.editar": "Editar",
    "perm.crear": "Dar de alta",
    "perm.deshabilitar": "Dar de baja",
    "perm.ejecutar": "Impersonar",

    "grupos.nuevo": "Nuevo grupo",
    "accion.editar": "Editar",
    "efectivos.dialogoTitulo": "Permisos efectivos de {nombre}",
    "grupos.col.nombre": "Grupo",
    "grupos.col.descripcion": "Descripción",
    "grupos.col.permisos": "Permisos",
    "grupos.col.usuarios": "Personas",
    "grupos.col.alcance": "Alcance por región",
    "grupos.eliminarDescripcion": "Se eliminará el grupo “{nombre}”.",
    "grupos.nuevoTitulo": "Nuevo grupo de permisos",
    "grupos.subtitulo": "Qué puede hacer quien tenga este grupo y a quién se lo asignaste.",
    "grupos.personas.titulo": "Personas del grupo",
    "grupos.personas.descripcion": "Para asignar o cambiar el grupo de alguien, entrá a la persona.",
    "grupos.personas.vacio": "Este grupo todavía no tiene personas.",
    "grupos.form.datos": "Datos del grupo",
    "grupos.form.permisos": "Permisos",
    "grupos.form.alcance": "Alcance por región",
  },
  en: {},
  pt: {},
  ca: {},
};
