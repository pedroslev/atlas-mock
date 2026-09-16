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
    "nav.telefonia": "Telefonía",
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
      "Regiones de despliegue. El código de país lo define desarrollo; un despliegue dedicado por cliente se da de alta acá.",
    "regiones.col.codigo": "Código",
    "regiones.col.url": "URL de región",
    "regiones.col.anotaciones": "Anotaciones",
    "regiones.custom": "Despliegue dedicado",
    "regiones.nueva": "Nueva región",
    "regiones.nuevaDescripcion": "Alta de una nueva región de despliegue.",
    "regiones.form.datosRegion": "Datos de la región",
    "regiones.form.codigoPlaceholder": "Ej: AR, o CLIENTNAME para un dedicado",
    "regiones.form.codigoAyuda":
      "Código de país (AR, MX, COL, CL) o, para un despliegue dedicado, el nombre del cliente.",
    "regiones.form.urlPlaceholder": "ej.atlas.mitrol.com",
    "regiones.form.urlAyuda":
      "URL de la región, sin subdominio de aplicativo — zeus-api la usa para saber a qué olimpo-api de esa región pegarle al crear un tenant.",
    "regiones.form.crearRegion": "Crear región",

    "facturacion.titulo": "Facturación",
    "facturacion.descripcion": "Eventos de billing por cliente (base Global).",
    "facturacion.vacio.titulo": "Pendiente de desarrollo",
    "facturacion.vacio.descripcion":
      "Esta sección todavía no está disponible. Cuando se defina el modelo de facturación se mostrará acá el consumo facturable por cliente.",

    "telefonia.titulo": "Telefonía",
    "telefonia.descripcion":
      "Carriers de telefonía y las regiones donde operan: destinos SIP de salida y whitelist de IP de entrada en Kamailio.",
    "telefonia.tab.carriers": "Carriers",
    "telefonia.tab.numeros": "Números",
    "telefonia.tab.tarifas": "Tarifas por prefijo",
    "telefonia.nuevoCarrier": "Nuevo carrier",
    "telefonia.col.carrier": "Carrier",
    "telefonia.col.regiones": "Regiones",
    "telefonia.col.destinos": "Destinos SIP",
    "telefonia.col.whitelist": "IPs en whitelist",
    "telefonia.accion.activar": "Activar",
    "telefonia.accion.desactivar": "Desactivar",
    "telefonia.editarTitulo": "Editar {nombre}",
    "telefonia.dialogoDescripcion":
      "Alta de carrier: regiones donde opera, destinos SIP de salida (dispatcher) y whitelist de IP de origen (permissions).",
    "telefonia.nombrePlaceholder": "Ej: Telnyx",
    "telefonia.prioridad": "Prioridad",
    "telefonia.regiones.ayuda":
      "Regiones donde opera el carrier. Al sumar una región se copian sus IPs, destinos y tarifas.",
    "telefonia.regiones.placeholder": "Elegir regiones",
    "telefonia.regiones.seleccionadas": "{n} seleccionadas",
    "telefonia.regiones.buscar": "Buscar región",
    "telefonia.regiones.vacio": "Sin resultados.",
    "telefonia.regiones.quitarAria": "Quitar {nombre}",
    "telefonia.destinos.agregar": "Agregar destino",
    "telefonia.destinos.quitarAria": "Quitar destino",
    "telefonia.destinos.ayuda":
      "Kamailio prueba los destinos en orden de prioridad: si uno falla, pasa al siguiente.",
    "telefonia.whitelistLabel": "Whitelist de IP (una por línea)",
    "telefonia.whitelistAyuda":
      "IPs de origen autorizadas a mandar tráfico entrante de este carrier.",
    "telefonia.cliOculto": "Permite CLI oculto",
    "telefonia.cliOcultoAyuda": "La llamada puede salir sin mostrar número.",
    "telefonia.cliAleatorio": "Permite CLI aleatorio",
    "telefonia.cliAleatorioAyuda":
      "La llamada puede salir mostrando un número aleatorio.",
    "telefonia.carrierActivo": "Carrier activo",
    "telefonia.eliminarDescripcion":
      "Se eliminará el carrier “{nombre}” en todas sus regiones, con sus números y tarifas. Esta acción no se puede deshacer.",

    "telefonia.numeros.descripcion":
      "Por qué carrier sale o entra cada número, en qué región está disponible y a qué tenant está asignado.",
    "telefonia.numeros.agregar": "Agregar número",
    "telefonia.numeros.nuevo": "Nuevo número",
    "telefonia.numeros.editarTitulo": "Editar {numero}",
    "telefonia.numeros.dialogoDescripcion":
      "Alta de un número: carrier por el que sale/entra, región donde está disponible y, opcionalmente, el tenant al que está asignado.",
    "telefonia.numeros.col.numero": "Número",
    "telefonia.numeros.numeroPlaceholder": "Ej: 1161238744",
    "telefonia.numeros.numeroRepetido":
      "Este número ya está cargado. Un número no puede repetirse, tampoco en otra región.",
    "telefonia.numeros.regionAyuda":
      "Solo las regiones donde opera el carrier elegido.",
    "telefonia.numeros.col.direccion": "Dirección",
    "telefonia.numeros.direccion.saliente": "Origina llamadas",
    "telefonia.numeros.direccion.entrante": "Recibe llamadas",
    "telefonia.numeros.direccion.ambas": "Recibe y origina",
    "telefonia.numeros.col.tenant": "Tenant",
    "telefonia.numeros.tenantLabel": "Asignar a tenant",
    "telefonia.numeros.tenantLibre": "Libre para cualquier tenant",
    "telefonia.numeros.tenantAyuda":
      "Solo tenants de la región elegida. \"Libre\" deja el número disponible para que cualquier cuenta de esa región lo tome desde Cuentas.",
    "telefonia.numeros.eliminarDescripcion":
      "Se eliminará el número “{numero}”. Esta acción no se puede deshacer.",

    "telefonia.tarifas.descripcion":
      "Cuánto cobra cada carrier por minuto según el prefijo de destino, igual en todas sus regiones. Se usa para elegir el carrier más barato cuando la llamada sale con CLI oculto o aleatorio.",
    "telefonia.tarifas.agregar": "Agregar tarifa",
    "telefonia.tarifas.nuevo": "Nueva tarifa",
    "telefonia.tarifas.editarTitulo": "Editar tarifa {prefijo}",
    "telefonia.tarifas.dialogoDescripcion":
      "Costo por minuto de un carrier para un prefijo de destino.",
    "telefonia.tarifas.col.prefijo": "Prefijo destino",
    "telefonia.tarifas.col.tarifa": "Tarifa",
    "telefonia.tarifas.carrierAyuda":
      "Solo se listan carriers activos que permiten CLI oculto o aleatorio.",
    "telefonia.tarifas.eliminarDescripcion":
      "Se eliminará la tarifa del prefijo “{prefijo}”. Esta acción no se puede deshacer.",
  },
  en: {
    "nav.clientes": "Clients",
    "nav.regiones": "Regions",
    "nav.telefonia": "Telephony",
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
      "Deployment regions. The country code is defined by development; a dedicated per-client deployment is onboarded here.",
    "regiones.col.codigo": "Code",
    "regiones.col.url": "Region URL",
    "regiones.col.anotaciones": "Notes",
    "regiones.custom": "Dedicated deployment",
    "regiones.nueva": "New region",
    "regiones.nuevaDescripcion": "Onboard a new deployment region.",
    "regiones.form.datosRegion": "Region details",
    "regiones.form.codigoPlaceholder": "E.g. AR, or CLIENTNAME for a dedicated one",
    "regiones.form.codigoAyuda":
      "Country code (AR, MX, COL, CL) or, for a dedicated deployment, the client's name.",
    "regiones.form.urlPlaceholder": "eg.atlas.mitrol.com",
    "regiones.form.urlAyuda":
      "Region URL, without the app subdomain — zeus-api uses it to know which region's olimpo-api to call when creating a tenant.",
    "regiones.form.crearRegion": "Create region",

    "facturacion.titulo": "Billing",
    "facturacion.descripcion": "Billing events per client (Global database).",
    "facturacion.vacio.titulo": "Pending development",
    "facturacion.vacio.descripcion":
      "This section is not available yet. Once the billing model is defined, the billable usage per client will be shown here.",

    "telefonia.titulo": "Telephony",
    "telefonia.descripcion":
      "Telephony carriers and the regions where they operate: outbound SIP destinations and inbound IP whitelist in Kamailio.",
    "telefonia.tab.carriers": "Carriers",
    "telefonia.tab.numeros": "Numbers",
    "telefonia.tab.tarifas": "Rates by prefix",
    "telefonia.nuevoCarrier": "New carrier",
    "telefonia.col.carrier": "Carrier",
    "telefonia.col.regiones": "Regions",
    "telefonia.col.destinos": "SIP destinations",
    "telefonia.col.whitelist": "Whitelisted IPs",
    "telefonia.accion.activar": "Activate",
    "telefonia.accion.desactivar": "Deactivate",
    "telefonia.editarTitulo": "Edit {nombre}",
    "telefonia.dialogoDescripcion":
      "Carrier onboarding: regions where it operates, outbound SIP destinations (dispatcher) and source IP whitelist (permissions).",
    "telefonia.nombrePlaceholder": "E.g. Telnyx",
    "telefonia.prioridad": "Priority",
    "telefonia.regiones.ayuda":
      "Regions where the carrier operates. Adding a region copies its IPs, destinations and rates.",
    "telefonia.regiones.placeholder": "Choose regions",
    "telefonia.regiones.seleccionadas": "{n} selected",
    "telefonia.regiones.buscar": "Search region",
    "telefonia.regiones.vacio": "No results.",
    "telefonia.regiones.quitarAria": "Remove {nombre}",
    "telefonia.destinos.agregar": "Add destination",
    "telefonia.destinos.quitarAria": "Remove destination",
    "telefonia.destinos.ayuda":
      "Kamailio tries the destinations in priority order: if one fails, it moves to the next.",
    "telefonia.whitelistLabel": "IP whitelist (one per line)",
    "telefonia.whitelistAyuda":
      "Source IPs allowed to send inbound traffic for this carrier.",
    "telefonia.cliOculto": "Allows hidden CLI",
    "telefonia.cliOcultoAyuda": "The call can go out without showing a number.",
    "telefonia.cliAleatorio": "Allows random CLI",
    "telefonia.cliAleatorioAyuda":
      "The call can go out showing a random number.",
    "telefonia.carrierActivo": "Carrier active",
    "telefonia.eliminarDescripcion":
      "The carrier “{nombre}” will be deleted in all its regions, along with its numbers and rates. This action cannot be undone.",

    "telefonia.numeros.descripcion":
      "Which carrier each number uses to go out or come in, in which region it is available, and which tenant it is assigned to.",
    "telefonia.numeros.agregar": "Add number",
    "telefonia.numeros.nuevo": "New number",
    "telefonia.numeros.editarTitulo": "Edit {numero}",
    "telefonia.numeros.dialogoDescripcion":
      "Number onboarding: which carrier it goes out/comes in through, which region it is available in, and optionally which tenant it is assigned to.",
    "telefonia.numeros.col.numero": "Number",
    "telefonia.numeros.numeroPlaceholder": "E.g. 1161238744",
    "telefonia.numeros.numeroRepetido":
      "This number is already loaded. A number cannot be repeated, not even in another region.",
    "telefonia.numeros.regionAyuda":
      "Only the regions where the selected carrier operates.",
    "telefonia.numeros.col.direccion": "Direction",
    "telefonia.numeros.direccion.saliente": "Originates calls",
    "telefonia.numeros.direccion.entrante": "Receives calls",
    "telefonia.numeros.direccion.ambas": "Receives and originates",
    "telefonia.numeros.col.tenant": "Tenant",
    "telefonia.numeros.tenantLabel": "Assign to tenant",
    "telefonia.numeros.tenantLibre": "Free for any tenant",
    "telefonia.numeros.tenantAyuda":
      "Only tenants in the selected region. \"Free\" leaves the number available for any account in that region to take from Accounts.",
    "telefonia.numeros.eliminarDescripcion":
      "The number “{numero}” will be deleted. This action cannot be undone.",

    "telefonia.tarifas.descripcion":
      "How much each carrier charges per minute by destination prefix, the same in all its regions. Used to pick the cheapest carrier when the call goes out with hidden or random CLI.",
    "telefonia.tarifas.agregar": "Add rate",
    "telefonia.tarifas.nuevo": "New rate",
    "telefonia.tarifas.editarTitulo": "Edit rate {prefijo}",
    "telefonia.tarifas.dialogoDescripcion":
      "Per-minute cost of a carrier for a destination prefix.",
    "telefonia.tarifas.col.prefijo": "Destination prefix",
    "telefonia.tarifas.col.tarifa": "Rate",
    "telefonia.tarifas.carrierAyuda":
      "Only active carriers that allow hidden or random CLI are listed.",
    "telefonia.tarifas.eliminarDescripcion":
      "The rate for prefix “{prefijo}” will be deleted. This action cannot be undone.",
  },
  pt: {
    "nav.clientes": "Clientes",
    "nav.regiones": "Regiões",
    "nav.telefonia": "Telefonia",
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
      "Regiões de implantação. O código de país é definido pelo desenvolvimento; uma implantação dedicada por cliente é cadastrada aqui.",
    "regiones.col.codigo": "Código",
    "regiones.col.url": "URL da região",
    "regiones.col.anotaciones": "Notas",
    "regiones.custom": "Implantação dedicada",
    "regiones.nueva": "Nova região",
    "regiones.nuevaDescripcion": "Cadastro de uma nova região de implantação.",
    "regiones.form.datosRegion": "Dados da região",
    "regiones.form.codigoPlaceholder": "Ex.: AR, ou CLIENTNAME para uma dedicada",
    "regiones.form.codigoAyuda":
      "Código de país (AR, MX, COL, CL) ou, para uma implantação dedicada, o nome do cliente.",
    "regiones.form.urlPlaceholder": "ex.atlas.mitrol.com",
    "regiones.form.urlAyuda":
      "URL da região, sem o subdomínio do aplicativo — o zeus-api a usa para saber a qual olimpo-api dessa região recorrer ao criar um tenant.",
    "regiones.form.crearRegion": "Criar região",

    "facturacion.titulo": "Faturamento",
    "facturacion.descripcion": "Eventos de billing por cliente (base Global).",
    "facturacion.vacio.titulo": "Pendente de desenvolvimento",
    "facturacion.vacio.descripcion":
      "Esta seção ainda não está disponível. Quando o modelo de faturamento for definido, o consumo faturável por cliente será exibido aqui.",

    "telefonia.titulo": "Telefonia",
    "telefonia.descripcion":
      "Carriers de telefonia e as regiões onde operam: destinos SIP de saída e whitelist de IP de entrada no Kamailio.",
    "telefonia.tab.carriers": "Carriers",
    "telefonia.tab.numeros": "Números",
    "telefonia.tab.tarifas": "Tarifas por prefixo",
    "telefonia.nuevoCarrier": "Novo carrier",
    "telefonia.col.carrier": "Carrier",
    "telefonia.col.regiones": "Regiões",
    "telefonia.col.destinos": "Destinos SIP",
    "telefonia.col.whitelist": "IPs na whitelist",
    "telefonia.accion.activar": "Ativar",
    "telefonia.accion.desactivar": "Desativar",
    "telefonia.editarTitulo": "Editar {nombre}",
    "telefonia.dialogoDescripcion":
      "Cadastro de carrier: regiões onde opera, destinos SIP de saída (dispatcher) e whitelist de IP de origem (permissions).",
    "telefonia.nombrePlaceholder": "Ex.: Telnyx",
    "telefonia.prioridad": "Prioridade",
    "telefonia.regiones.ayuda":
      "Regiões onde o carrier opera. Ao adicionar uma região, seus IPs, destinos e tarifas são copiados.",
    "telefonia.regiones.placeholder": "Escolher regiões",
    "telefonia.regiones.seleccionadas": "{n} selecionadas",
    "telefonia.regiones.buscar": "Buscar região",
    "telefonia.regiones.vacio": "Sem resultados.",
    "telefonia.regiones.quitarAria": "Remover {nombre}",
    "telefonia.destinos.agregar": "Adicionar destino",
    "telefonia.destinos.quitarAria": "Remover destino",
    "telefonia.destinos.ayuda":
      "O Kamailio tenta os destinos por ordem de prioridade: se um falhar, passa para o seguinte.",
    "telefonia.whitelistLabel": "Whitelist de IP (uma por linha)",
    "telefonia.whitelistAyuda":
      "IPs de origem autorizadas a enviar tráfego de entrada deste carrier.",
    "telefonia.cliOculto": "Permite CLI oculto",
    "telefonia.cliOcultoAyuda": "A chamada pode sair sem mostrar número.",
    "telefonia.cliAleatorio": "Permite CLI aleatório",
    "telefonia.cliAleatorioAyuda":
      "A chamada pode sair mostrando um número aleatório.",
    "telefonia.carrierActivo": "Carrier ativo",
    "telefonia.eliminarDescripcion":
      "O carrier “{nombre}” será excluído em todas as suas regiões, com seus números e tarifas. Esta ação não pode ser desfeita.",

    "telefonia.numeros.descripcion":
      "Por qual carrier sai ou entra cada número, em qual região ele está disponível e a qual tenant está atribuído.",
    "telefonia.numeros.agregar": "Adicionar número",
    "telefonia.numeros.nuevo": "Novo número",
    "telefonia.numeros.editarTitulo": "Editar {numero}",
    "telefonia.numeros.dialogoDescripcion":
      "Cadastro de um número: carrier pelo qual sai/entra, região onde está disponível e, opcionalmente, o tenant ao qual está atribuído.",
    "telefonia.numeros.col.numero": "Número",
    "telefonia.numeros.numeroPlaceholder": "Ex.: 1161238744",
    "telefonia.numeros.numeroRepetido":
      "Este número já está cadastrado. Um número não pode se repetir, nem em outra região.",
    "telefonia.numeros.regionAyuda":
      "Só as regiões onde o carrier escolhido opera.",
    "telefonia.numeros.col.direccion": "Direção",
    "telefonia.numeros.direccion.saliente": "Origina chamadas",
    "telefonia.numeros.direccion.entrante": "Recebe chamadas",
    "telefonia.numeros.direccion.ambas": "Recebe e origina",
    "telefonia.numeros.col.tenant": "Tenant",
    "telefonia.numeros.tenantLabel": "Atribuir a um tenant",
    "telefonia.numeros.tenantLibre": "Livre para qualquer tenant",
    "telefonia.numeros.tenantAyuda":
      "Só tenants da região escolhida. \"Livre\" deixa o número disponível para qualquer conta dessa região tomá-lo em Contas.",
    "telefonia.numeros.eliminarDescripcion":
      "O número “{numero}” será excluído. Esta ação não pode ser desfeita.",

    "telefonia.tarifas.descripcion":
      "Quanto cada carrier cobra por minuto conforme o prefixo de destino, igual em todas as suas regiões. Usado para escolher o carrier mais barato quando a chamada sai com CLI oculto ou aleatório.",
    "telefonia.tarifas.agregar": "Adicionar tarifa",
    "telefonia.tarifas.nuevo": "Nova tarifa",
    "telefonia.tarifas.editarTitulo": "Editar tarifa {prefijo}",
    "telefonia.tarifas.dialogoDescripcion":
      "Custo por minuto de um carrier para um prefixo de destino.",
    "telefonia.tarifas.col.prefijo": "Prefixo destino",
    "telefonia.tarifas.col.tarifa": "Tarifa",
    "telefonia.tarifas.carrierAyuda":
      "Só são listados carriers ativos que permitem CLI oculto ou aleatório.",
    "telefonia.tarifas.eliminarDescripcion":
      "A tarifa do prefixo “{prefijo}” será excluída. Esta ação não pode ser desfeita.",
  },
  ca: {
    "nav.clientes": "Clients",
    "nav.regiones": "Regions",
    "nav.telefonia": "Telefonia",
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
      "Regions de desplegament. El codi de país el defineix desenvolupament; un desplegament dedicat per client es dona d'alta aquí.",
    "regiones.col.codigo": "Codi",
    "regiones.col.url": "URL de la regió",
    "regiones.col.anotaciones": "Notes",
    "regiones.custom": "Desplegament dedicat",
    "regiones.nueva": "Nova regió",
    "regiones.nuevaDescripcion": "Alta d'una nova regió de desplegament.",
    "regiones.form.datosRegion": "Dades de la regió",
    "regiones.form.codigoPlaceholder": "Ex.: AR, o CLIENTNAME per a un dedicat",
    "regiones.form.codigoAyuda":
      "Codi de país (AR, MX, COL, CL) o, per a un desplegament dedicat, el nom del client.",
    "regiones.form.urlPlaceholder": "ex.atlas.mitrol.com",
    "regiones.form.urlAyuda":
      "URL de la regió, sense el subdomini d'aplicatiu — zeus-api l'utilitza per saber a quina olimpo-api d'aquesta regió trucar en crear un tenant.",
    "regiones.form.crearRegion": "Crea la regió",

    "facturacion.titulo": "Facturació",
    "facturacion.descripcion":
      "Esdeveniments de billing per client (base Global).",
    "facturacion.vacio.titulo": "Pendent de desenvolupament",
    "facturacion.vacio.descripcion":
      "Aquesta secció encara no està disponible. Quan es defineixi el model de facturació, aquí es mostrarà el consum facturable per client.",

    "telefonia.titulo": "Telefonia",
    "telefonia.descripcion":
      "Carriers de telefonia i les regions on operen: destins SIP de sortida i whitelist d'IP d'entrada a Kamailio.",
    "telefonia.tab.carriers": "Carriers",
    "telefonia.tab.numeros": "Números",
    "telefonia.tab.tarifas": "Tarifes per prefix",
    "telefonia.nuevoCarrier": "Nou carrier",
    "telefonia.col.carrier": "Carrier",
    "telefonia.col.regiones": "Regions",
    "telefonia.col.destinos": "Destins SIP",
    "telefonia.col.whitelist": "IPs a la whitelist",
    "telefonia.accion.activar": "Activa",
    "telefonia.accion.desactivar": "Desactiva",
    "telefonia.editarTitulo": "Edita {nombre}",
    "telefonia.dialogoDescripcion":
      "Alta de carrier: regions on opera, destins SIP de sortida (dispatcher) i whitelist d'IP d'origen (permissions).",
    "telefonia.nombrePlaceholder": "Ex.: Telnyx",
    "telefonia.prioridad": "Prioritat",
    "telefonia.regiones.ayuda":
      "Regions on opera el carrier. En afegir una regió se'n copien les IPs, els destins i les tarifes.",
    "telefonia.regiones.placeholder": "Tria regions",
    "telefonia.regiones.seleccionadas": "{n} seleccionades",
    "telefonia.regiones.buscar": "Cerca una regió",
    "telefonia.regiones.vacio": "Sense resultats.",
    "telefonia.regiones.quitarAria": "Treu {nombre}",
    "telefonia.destinos.agregar": "Afegeix un destí",
    "telefonia.destinos.quitarAria": "Treu el destí",
    "telefonia.destinos.ayuda":
      "Kamailio prova els destins per ordre de prioritat: si un falla, passa al següent.",
    "telefonia.whitelistLabel": "Whitelist d'IP (una per línia)",
    "telefonia.whitelistAyuda":
      "IPs d'origen autoritzades a enviar trànsit d'entrada d'aquest carrier.",
    "telefonia.cliOculto": "Permet CLI ocult",
    "telefonia.cliOcultoAyuda": "La trucada pot sortir sense mostrar número.",
    "telefonia.cliAleatorio": "Permet CLI aleatori",
    "telefonia.cliAleatorioAyuda":
      "La trucada pot sortir mostrant un número aleatori.",
    "telefonia.carrierActivo": "Carrier actiu",
    "telefonia.eliminarDescripcion":
      "S'eliminarà el carrier “{nombre}” a totes les seves regions, amb els seus números i tarifes. Aquesta acció no es pot desfer.",

    "telefonia.numeros.descripcion":
      "Per quin carrier surt o entra cada número, a quina regió està disponible i a quin tenant està assignat.",
    "telefonia.numeros.agregar": "Afegeix un número",
    "telefonia.numeros.nuevo": "Nou número",
    "telefonia.numeros.editarTitulo": "Edita {numero}",
    "telefonia.numeros.dialogoDescripcion":
      "Alta d'un número: carrier pel qual surt/entra, regió on està disponible i, opcionalment, el tenant al qual està assignat.",
    "telefonia.numeros.col.numero": "Número",
    "telefonia.numeros.numeroPlaceholder": "Ex.: 1161238744",
    "telefonia.numeros.numeroRepetido":
      "Aquest número ja està carregat. Un número no es pot repetir, tampoc en una altra regió.",
    "telefonia.numeros.regionAyuda":
      "Només les regions on opera el carrier triat.",
    "telefonia.numeros.col.direccion": "Direcció",
    "telefonia.numeros.direccion.saliente": "Origina trucades",
    "telefonia.numeros.direccion.entrante": "Rep trucades",
    "telefonia.numeros.direccion.ambas": "Rep i origina",
    "telefonia.numeros.col.tenant": "Tenant",
    "telefonia.numeros.tenantLabel": "Assigna a un tenant",
    "telefonia.numeros.tenantLibre": "Lliure per a qualsevol tenant",
    "telefonia.numeros.tenantAyuda":
      "Només tenants de la regió triada. \"Lliure\" deixa el número disponible perquè qualsevol compte d'aquesta regió el prengui des de Comptes.",
    "telefonia.numeros.eliminarDescripcion":
      "S'eliminarà el número “{numero}”. Aquesta acció no es pot desfer.",

    "telefonia.tarifas.descripcion":
      "Quant cobra cada carrier per minut segons el prefix de destinació, igual a totes les seves regions. S'usa per triar el carrier més barat quan la trucada surt amb CLI ocult o aleatori.",
    "telefonia.tarifas.agregar": "Afegeix una tarifa",
    "telefonia.tarifas.nuevo": "Nova tarifa",
    "telefonia.tarifas.editarTitulo": "Edita la tarifa {prefijo}",
    "telefonia.tarifas.dialogoDescripcion":
      "Cost per minut d'un carrier per a un prefix de destinació.",
    "telefonia.tarifas.col.prefijo": "Prefix destinació",
    "telefonia.tarifas.col.tarifa": "Tarifa",
    "telefonia.tarifas.carrierAyuda":
      "Només es llisten carriers actius que permeten CLI ocult o aleatori.",
    "telefonia.tarifas.eliminarDescripcion":
      "S'eliminarà la tarifa del prefix “{prefijo}”. Aquesta acció no es pot desfer.",
  },
};
