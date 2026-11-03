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
    "habilitarPersona": "Habilitar persona",
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
    "alcance.todos": "Todos los clusters",
    "alcance.n": "{n} clusters",
    "alcance.uno": "1 cluster",

    "accion.habilitar": "Habilitar",
    "accion.efectivos": "Ver permisos efectivos",
    "accion.deshabilitar": "Deshabilitar",
    "accion.deshabilitarDescripcion":
      "{nombre} dejará de poder ingresar a Zeus. Podés volver a habilitarla cuando quieras.",

    "habilitar.titulo": "Habilitar persona",
    "habilitar.descripcion":
      "Elegí a la persona del directorio de Mitrol y asignale un grupo de permisos. Le llegará un mail para fijar su contraseña.",
    "editar.descripcion":
      "Cambiale el grupo de permisos.",
    "form.persona": "Persona del directorio",
    "form.personaPlaceholder": "Elegir una persona",
    "form.personaAyuda":
      "Solo aparecen personas activas en el directorio que todavía no están habilitadas.",
    "form.mail": "Mail",
    "form.mailAyuda": "Viene del directorio y no se puede cambiar. Debe terminar en @mitrol.net.",
    "persona.datos": "Datos de la persona",
    "form.sinCandidatas": "No hay personas del directorio para habilitar.",
    "miembros.buscar": "Buscar...",

    "enviado.titulo": "Mail de alta enviado",
    "enviado.descripcion":
      "Le enviamos un mail a {mail} para que fije su contraseña. Hasta entonces figura como Invitada.",
    "enviado.volver": "Volver al listado",

    "efectivos.titulo": "Permisos efectivos",
    "efectivos.descripcion": "Lo que da el grupo: permisos y alcance por cluster.",
    "efectivos.sinPermisos": "Todavía no tiene permisos.",
    "efectivos.alcance": "Alcance",

    "area.clientes": "Clientes",
    "area.telefonia": "Telefonía",
    "area.facturacion": "Facturación",
    "area.regiones": "Regiones y clusters",
    "area.impersonacion": "Impersonación de clientes",
    "area.proveedoresIa": "Proveedores de IA",
    "area.staff": "Staff y permisos",
    "area.acotadaPorCluster": "Acotada por cluster",
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
    "grupos.col.alcance": "Alcance por cluster",
    "grupos.eliminarDescripcion": "Se eliminará el grupo “{nombre}”.",
    "grupos.nuevoTitulo": "Nuevo grupo de permisos",
    "grupos.subtitulo": "Qué puede hacer quien tenga este grupo y a quién se lo asignaste.",
    "grupos.personas.titulo": "Personas del grupo",
    "grupos.personas.descripcion": "Para asignar o cambiar el grupo de alguien, entrá a la persona.",
    "grupos.personas.vacio": "Este grupo todavía no tiene personas.",
    "grupos.form.datos": "Datos del grupo",
    "grupos.form.permisos": "Permisos",
    "grupos.form.alcance": "Alcance por cluster",
  },
  en: {},
  pt: {},
  ca: {},
};
