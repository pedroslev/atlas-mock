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
    "gruposBoton": "Grupos de permisos",

    "col.nombre": "Nombre",
    "col.mail": "Mail",
    "col.estado": "Estado en Zeus",
    "col.grupos": "Grupos",
    "col.alcance": "Alcance",
    "col.sync": "Última sincronización",

    "estado.no-habilitado": "No habilitado",
    "estado.invitado": "Invitado",
    "estado.activo": "Activo",
    "estado.deshabilitado": "Deshabilitado",
    "estado.deshabilitado-baja": "Deshabilitado por baja en el directorio",

    "alcance.todos": "Todos los clusters",
    "alcance.n": "{n} clusters",
    "alcance.uno": "1 cluster",
    "sinGrupos": "—",

    "accion.habilitar": "Habilitar",
    "accion.editar": "Editar permisos",
    "accion.efectivos": "Ver permisos efectivos",
    "accion.deshabilitar": "Deshabilitar",
    "accion.deshabilitarDescripcion":
      "{nombre} dejará de poder ingresar a Zeus. Podés volver a habilitarla cuando quieras.",

    "habilitar.titulo": "Habilitar persona",
    "habilitar.descripcion":
      "Elegí a la persona del directorio de Mitrol y asignale permisos. Le llegará un mail para fijar su contraseña.",
    "editar.titulo": "Permisos de {nombre}",
    "editar.descripcion":
      "Cambiá los grupos, los permisos individuales o el alcance por cluster.",
    "form.persona": "Persona del directorio",
    "form.personaPlaceholder": "Elegir una persona",
    "form.personaAyuda":
      "Solo aparecen personas activas en el directorio que todavía no están habilitadas.",
    "form.mail": "Mail",
    "form.mailAyuda": "Viene del directorio y no se puede cambiar. Debe terminar en @mitrol.net.",
    "form.grupos": "Grupos de permisos",
    "form.gruposAyuda": "Los permisos de todos los grupos elegidos se suman.",
    "form.extras": "Permisos individuales extra",
    "form.extrasAyuda":
      "Se suman a los del grupo. Los que ya da un grupo aparecen marcados y bloqueados.",
    "form.alcance": "Alcance por cluster",
    "form.alcanceAyuda":
      "Limita los permisos de Clientes, Telefonía y Facturación a los clusters elegidos.",
    "form.todosClusters": "Todos los clusters",
    "form.clustersPlaceholder": "Elegir clusters",
    "form.guardar": "Guardar cambios",
    "form.habilitar": "Habilitar y enviar mail",
    "form.cancelar": "Cancelar",

    "enviado.titulo": "Mail de alta enviado",
    "enviado.descripcion":
      "Le enviamos un mail a {mail} para que fije su contraseña. Hasta entonces figura como Invitada.",
    "guardado.titulo": "Cambios guardados",
    "guardado.descripcion": "Los permisos de {nombre} quedaron actualizados.",
    "enviado.volver": "Volver al listado",

    "efectivos.titulo": "Permisos efectivos",
    "efectivos.descripcion": "Suma de los grupos y los permisos extra, con el alcance por cluster.",
    "efectivos.sinPermisos": "Todavía no tiene permisos.",
    "efectivos.extra": "extra",
    "efectivos.alcance": "Alcance",
    "efectivos.dialogoTitulo": "Permisos efectivos de {nombre}",

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

    "grupos.titulo": "Grupos de permisos",
    "grupos.descripcion": "Conjuntos de permisos que se asignan al staff.",
    "grupos.nuevo": "Nuevo grupo",
    "grupos.col.nombre": "Grupo",
    "grupos.col.descripcion": "Descripción",
    "grupos.col.permisos": "Permisos",
    "grupos.col.usuarios": "Personas",
    "grupos.col.alcance": "Alcance por defecto",
    "grupos.eliminarDescripcion":
      "Se eliminará el grupo “{nombre}”. Las personas que lo tengan lo pierden.",
    "grupos.nuevoTitulo": "Nuevo grupo de permisos",
    "grupos.nuevoDescripcion": "Definí qué puede hacer quien tenga este grupo.",
    "grupos.editarTitulo": "Editar grupo {nombre}",
    "grupos.form.datos": "Datos del grupo",
    "grupos.form.nombre": "Nombre",
    "grupos.form.descripcion": "Descripción",
    "grupos.form.permisos": "Permisos",
    "grupos.form.alcance": "Alcance por defecto",
    "grupos.form.crear": "Crear grupo",
    "grupos.form.guardar": "Guardar grupo",
    "grupos.form.guardadoTitulo": "Grupo guardado",
    "grupos.form.guardadoDescripcion": "El grupo “{nombre}” quedó guardado.",
    "grupos.form.volver": "Volver a los grupos",
  },
  en: {},
  pt: {},
  ca: {},
};
