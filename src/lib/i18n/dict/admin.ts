import type { NamespaceDict } from "@/lib/i18n/dict/types";

// Administración Mitrol — consola INTERNA de soporte (clientes/tenants,
// regiones, facturación). Conserva a propósito vocabulario técnico (tenant,
// multitenancy, settings, billing): el público son empleados de Mitrol.
// Los DATOS del mock (nombres de empresas, personas, emails, países) no viven
// acá; solo rótulos de interfaz.
export const admin: NamespaceDict = {
  es: {
    "nav.clientes": "Clientes",
    "nav.regiones": "Regiones",
    "nav.facturacion": "Facturación",

    "campos.region": "Región",
    "campos.pais": "País",

    "clientes.titulo": "Clientes",
    "clientes.descripcion":
      "Organizaciones cliente (base Global). Alta, gestión y contactos de cada cliente cloud.",
    "clientes.onboarding": "Onboarding de cliente",
    "clientes.col.cliente": "Cliente",
    "clientes.col.contactos": "Contactos",
    "clientes.accion.activar": "Activar",
    "clientes.accion.impersonar": "Impersonar cliente",
    "clientes.accion.observabilidad": "Ver observabilidad",
    "clientes.impersonar.titulo": "Impersonando a {nombre}",
    "clientes.impersonar.descripcion":
      "Estás operando el backoffice/pad como un usuario de este cliente, para diagnóstico.",
    "clientes.impersonar.salir": "Salir de la impersonación",

    "nuevo.descripcion":
      "Alta de una nueva organización cliente con su región de despliegue.",

    "form.datosCliente": "Datos del cliente",
    "form.nombrePlaceholder": "Ej: Banco Sur",
    "form.regionPlaceholder": "Seleccionar región",
    "form.regionAyuda":
      "El código de región lo define desarrollo (AR, COL, MX, CL, CUSTOM).",
    "form.paisPlaceholder": "Seleccionar país",
    "form.paisBuscar": "Buscar país...",
    "form.paisVacio": "No se encontró ningún país.",
    "form.clienteActivo": "Cliente activo",
    "form.clienteActivoAyuda":
      "Un cliente inactivo queda dado de alta pero deshabilitado.",
    "form.crearCliente": "Crear cliente",

    "detalle.sinRegion": "Sin región asignada",
    "detalle.activoAyuda": "Refleja el estado del cliente.",

    "soporte.titulo": "Soporte multitenancy",
    "soporte.descripcion":
      "Herramientas de asistencia y control para este cliente.",
    "soporte.impersonar.titulo": "Impersonar cliente",
    "soporte.impersonar.descripcion":
      "Operar el backoffice/pad como un usuario del cliente para diagnóstico.",
    "soporte.observabilidad.titulo": "Ver observabilidad",
    "soporte.observabilidad.descripcion":
      "Ir al dashboard de observabilidad filtrado por este cliente.",
    "soporte.observabilidad.dialogTitulo": "Observabilidad de {nombre}",
    "soporte.billing.titulo": "Eventos de billing",
    "soporte.billing.descripcion":
      "Consumo facturable del cliente (cuando se definan los eventos).",
    "soporte.proximamente": "Próximamente",
    "soporte.rol": "Soporte Mitrol",

    "contactos.descripcion":
      "Contactos comerciales y técnicos del cliente.",
    "contactos.agregar": "Agregar contacto",
    "contactos.nuevo": "Nuevo contacto",
    "contactos.editarTitulo": "Editar {nombre}",
    "contactos.dialogoDescripcion":
      "Datos de contacto dentro de la empresa del cliente.",
    "contactos.col.email": "Email",
    "contactos.col.telefono": "Teléfono",
    "contactos.col.rol": "Rol",
    "contactos.col.notas": "Notas",
    "contactos.nombrePlaceholder": "Ej: Lucía Fernández",
    "contactos.emailPlaceholder": "nombre@empresa.com",
    "contactos.telefonoPlaceholder": "+54 11 4000-0000",
    "contactos.rolPlaceholder": "Ej: Gerente de Contact Center",
    "contactos.eliminarDescripcion":
      "Se eliminará el contacto “{nombre}”. Esta acción no se puede deshacer.",

    "regiones.titulo": "Regiones",
    "regiones.descripcion":
      "Regiones de despliegue definidas por desarrollo. Referencia de solo lectura.",
    "regiones.col.codigo": "Código",
    "regiones.custom": "Despliegue dedicado",

    "facturacion.titulo": "Facturación",
    "facturacion.descripcion": "Eventos de billing por cliente (base Global).",
    "facturacion.vacio.titulo": "Pendiente de desarrollo",
    "facturacion.vacio.descripcion":
      "Esta sección todavía no está disponible. Cuando se defina el modelo de facturación se mostrará acá el consumo facturable por cliente.",
  },
  en: {
    "nav.clientes": "Clients",
    "nav.regiones": "Regions",
    "nav.facturacion": "Billing",

    "campos.region": "Region",
    "campos.pais": "Country",

    "clientes.titulo": "Clients",
    "clientes.descripcion":
      "Client organizations (Global database). Onboarding, management and contacts for each cloud client.",
    "clientes.onboarding": "Client onboarding",
    "clientes.col.cliente": "Client",
    "clientes.col.contactos": "Contacts",
    "clientes.accion.activar": "Activate",
    "clientes.accion.impersonar": "Impersonate client",
    "clientes.accion.observabilidad": "View observability",
    "clientes.impersonar.titulo": "Impersonating {nombre}",
    "clientes.impersonar.descripcion":
      "You're operating the backoffice/pad as a user of this client, for diagnostics.",
    "clientes.impersonar.salir": "Exit impersonation",

    "nuevo.descripcion":
      "Create a new client organization with its deployment region.",

    "form.datosCliente": "Client details",
    "form.nombrePlaceholder": "E.g. Banco Sur",
    "form.regionPlaceholder": "Select a region",
    "form.regionAyuda":
      "The region code is defined by development (AR, COL, MX, CL, CUSTOM).",
    "form.paisPlaceholder": "Select a country",
    "form.paisBuscar": "Search country...",
    "form.paisVacio": "No country found.",
    "form.clienteActivo": "Active client",
    "form.clienteActivoAyuda":
      "An inactive client is still created, but disabled.",
    "form.crearCliente": "Create client",

    "detalle.sinRegion": "No region assigned",
    "detalle.activoAyuda": "Reflects the client status.",

    "soporte.titulo": "Multitenancy support",
    "soporte.descripcion":
      "Assistance and control tools for this client.",
    "soporte.impersonar.titulo": "Impersonate client",
    "soporte.impersonar.descripcion":
      "Operate the backoffice/pad as a user of the client for diagnostics.",
    "soporte.observabilidad.titulo": "View observability",
    "soporte.observabilidad.descripcion":
      "Go to the observability dashboard filtered by this client.",
    "soporte.observabilidad.dialogTitulo": "Observability for {nombre}",
    "soporte.billing.titulo": "Billing events",
    "soporte.billing.descripcion":
      "Billable usage for the client (once the events are defined).",
    "soporte.proximamente": "Coming soon",
    "soporte.rol": "Mitrol Support",

    "contactos.descripcion":
      "Commercial and technical contacts of the client.",
    "contactos.agregar": "Add contact",
    "contactos.nuevo": "New contact",
    "contactos.editarTitulo": "Edit {nombre}",
    "contactos.dialogoDescripcion":
      "Contact details within the client's company.",
    "contactos.col.email": "Email",
    "contactos.col.telefono": "Phone",
    "contactos.col.rol": "Role",
    "contactos.col.notas": "Notes",
    "contactos.nombrePlaceholder": "E.g. Lucía Fernández",
    "contactos.emailPlaceholder": "name@company.com",
    "contactos.telefonoPlaceholder": "+54 11 4000-0000",
    "contactos.rolPlaceholder": "E.g. Contact Center Manager",
    "contactos.eliminarDescripcion":
      "The contact “{nombre}” will be deleted. This action cannot be undone.",

    "regiones.titulo": "Regions",
    "regiones.descripcion":
      "Deployment regions defined by development. Read-only reference.",
    "regiones.col.codigo": "Code",
    "regiones.custom": "Dedicated deployment",

    "facturacion.titulo": "Billing",
    "facturacion.descripcion": "Billing events per client (Global database).",
    "facturacion.vacio.titulo": "Pending development",
    "facturacion.vacio.descripcion":
      "This section is not available yet. Once the billing model is defined, the billable usage per client will be shown here.",
  },
  pt: {
    "nav.clientes": "Clientes",
    "nav.regiones": "Regiões",
    "nav.facturacion": "Faturamento",

    "campos.region": "Região",
    "campos.pais": "País",

    "clientes.titulo": "Clientes",
    "clientes.descripcion":
      "Organizações cliente (base Global). Cadastro, gestão e contatos de cada cliente cloud.",
    "clientes.onboarding": "Onboarding de cliente",
    "clientes.col.cliente": "Cliente",
    "clientes.col.contactos": "Contatos",
    "clientes.accion.activar": "Ativar",
    "clientes.accion.impersonar": "Personificar cliente",
    "clientes.accion.observabilidad": "Ver observabilidade",
    "clientes.impersonar.titulo": "Personificando {nombre}",
    "clientes.impersonar.descripcion":
      "Você está operando o backoffice/pad como um usuário deste cliente, para diagnóstico.",
    "clientes.impersonar.salir": "Sair da personificação",

    "nuevo.descripcion":
      "Cadastro de uma nova organização cliente com sua região de implantação.",

    "form.datosCliente": "Dados do cliente",
    "form.nombrePlaceholder": "Ex.: Banco Sur",
    "form.regionPlaceholder": "Selecionar região",
    "form.regionAyuda":
      "O código de região é definido pelo desenvolvimento (AR, COL, MX, CL, CUSTOM).",
    "form.paisPlaceholder": "Selecionar país",
    "form.paisBuscar": "Pesquisar país...",
    "form.paisVacio": "Nenhum país encontrado.",
    "form.clienteActivo": "Cliente ativo",
    "form.clienteActivoAyuda":
      "Um cliente inativo fica cadastrado, porém desabilitado.",
    "form.crearCliente": "Criar cliente",

    "detalle.sinRegion": "Sem região atribuída",
    "detalle.activoAyuda": "Reflete a situação do cliente.",

    "soporte.titulo": "Suporte multitenancy",
    "soporte.descripcion":
      "Ferramentas de assistência e controle para este cliente.",
    "soporte.impersonar.titulo": "Personificar cliente",
    "soporte.impersonar.descripcion":
      "Operar o backoffice/pad como um usuário do cliente para diagnóstico.",
    "soporte.observabilidad.titulo": "Ver observabilidade",
    "soporte.observabilidad.descripcion":
      "Ir ao dashboard de observabilidade filtrado por este cliente.",
    "soporte.observabilidad.dialogTitulo": "Observabilidade de {nombre}",
    "soporte.billing.titulo": "Eventos de billing",
    "soporte.billing.descripcion":
      "Consumo faturável do cliente (quando os eventos forem definidos).",
    "soporte.proximamente": "Em breve",
    "soporte.rol": "Suporte Mitrol",

    "contactos.descripcion":
      "Contatos comerciais e técnicos do cliente.",
    "contactos.agregar": "Adicionar contato",
    "contactos.nuevo": "Novo contato",
    "contactos.editarTitulo": "Editar {nombre}",
    "contactos.dialogoDescripcion":
      "Dados de contato dentro da empresa do cliente.",
    "contactos.col.email": "E-mail",
    "contactos.col.telefono": "Telefone",
    "contactos.col.rol": "Função",
    "contactos.col.notas": "Notas",
    "contactos.nombrePlaceholder": "Ex.: Lucía Fernández",
    "contactos.emailPlaceholder": "nome@empresa.com",
    "contactos.telefonoPlaceholder": "+54 11 4000-0000",
    "contactos.rolPlaceholder": "Ex.: Gerente de Contact Center",
    "contactos.eliminarDescripcion":
      "O contato “{nombre}” será excluído. Esta ação não pode ser desfeita.",

    "regiones.titulo": "Regiões",
    "regiones.descripcion":
      "Regiões de implantação definidas pelo desenvolvimento. Referência somente leitura.",
    "regiones.col.codigo": "Código",
    "regiones.custom": "Implantação dedicada",

    "facturacion.titulo": "Faturamento",
    "facturacion.descripcion": "Eventos de billing por cliente (base Global).",
    "facturacion.vacio.titulo": "Pendente de desenvolvimento",
    "facturacion.vacio.descripcion":
      "Esta seção ainda não está disponível. Quando o modelo de faturamento for definido, o consumo faturável por cliente será exibido aqui.",
  },
  ca: {
    "nav.clientes": "Clients",
    "nav.regiones": "Regions",
    "nav.facturacion": "Facturació",

    "campos.region": "Regió",
    "campos.pais": "País",

    "clientes.titulo": "Clients",
    "clientes.descripcion":
      "Organitzacions client (base Global). Alta, gestió i contactes de cada client cloud.",
    "clientes.onboarding": "Onboarding de client",
    "clientes.col.cliente": "Client",
    "clientes.col.contactos": "Contactes",
    "clientes.accion.activar": "Activa",
    "clientes.accion.impersonar": "Suplanta el client",
    "clientes.accion.observabilidad": "Veure observabilitat",
    "clientes.impersonar.titulo": "Suplantant {nombre}",
    "clientes.impersonar.descripcion":
      "Estàs operant el backoffice/pad com un usuari d'aquest client, per a diagnòstic.",
    "clientes.impersonar.salir": "Surt de la suplantació",

    "nuevo.descripcion":
      "Alta d'una nova organització client amb la seva regió de desplegament.",

    "form.datosCliente": "Dades del client",
    "form.nombrePlaceholder": "Ex.: Banco Sur",
    "form.regionPlaceholder": "Selecciona una regió",
    "form.regionAyuda":
      "El codi de regió el defineix desenvolupament (AR, COL, MX, CL, CUSTOM).",
    "form.paisPlaceholder": "Selecciona un país",
    "form.paisBuscar": "Cerca un país...",
    "form.paisVacio": "No s'ha trobat cap país.",
    "form.clienteActivo": "Client actiu",
    "form.clienteActivoAyuda":
      "Un client inactiu queda donat d'alta però deshabilitat.",
    "form.crearCliente": "Crea el client",

    "detalle.sinRegion": "Sense regió assignada",
    "detalle.activoAyuda": "Reflecteix l'estat del client.",

    "soporte.titulo": "Suport multitenancy",
    "soporte.descripcion":
      "Eines d'assistència i control per a aquest client.",
    "soporte.impersonar.titulo": "Suplantar el client",
    "soporte.impersonar.descripcion":
      "Operar el backoffice/pad com un usuari del client per a diagnòstic.",
    "soporte.observabilidad.titulo": "Veure observabilitat",
    "soporte.observabilidad.descripcion":
      "Anar al tauler d'observabilitat filtrat per aquest client.",
    "soporte.observabilidad.dialogTitulo": "Observabilitat de {nombre}",
    "soporte.billing.titulo": "Esdeveniments de billing",
    "soporte.billing.descripcion":
      "Consum facturable del client (quan es defineixin els esdeveniments).",
    "soporte.proximamente": "Properament",
    "soporte.rol": "Suport Mitrol",

    "contactos.descripcion":
      "Contactes comercials i tècnics del client.",
    "contactos.agregar": "Afegeix un contacte",
    "contactos.nuevo": "Contacte nou",
    "contactos.editarTitulo": "Edita {nombre}",
    "contactos.dialogoDescripcion":
      "Dades de contacte dins de l'empresa del client.",
    "contactos.col.email": "Correu electrònic",
    "contactos.col.telefono": "Telèfon",
    "contactos.col.rol": "Rol",
    "contactos.col.notas": "Notes",
    "contactos.nombrePlaceholder": "Ex.: Lucía Fernández",
    "contactos.emailPlaceholder": "nom@empresa.com",
    "contactos.telefonoPlaceholder": "+54 11 4000-0000",
    "contactos.rolPlaceholder": "Ex.: Gerent de Contact Center",
    "contactos.eliminarDescripcion":
      "S'eliminarà el contacte “{nombre}”. Aquesta acció no es pot desfer.",

    "regiones.titulo": "Regions",
    "regiones.descripcion":
      "Regions de desplegament definides per desenvolupament. Referència de només lectura.",
    "regiones.col.codigo": "Codi",
    "regiones.custom": "Desplegament dedicat",

    "facturacion.titulo": "Facturació",
    "facturacion.descripcion":
      "Esdeveniments de billing per client (base Global).",
    "facturacion.vacio.titulo": "Pendent de desenvolupament",
    "facturacion.vacio.descripcion":
      "Aquesta secció encara no està disponible. Quan es defineixi el model de facturació, aquí es mostrarà el consum facturable per client.",
  },
};
