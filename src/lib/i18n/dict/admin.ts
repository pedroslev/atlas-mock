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
      "Proveedores (carriers) de telefonía por región: trunk de ruteo saliente y whitelist de IP entrante en Kamailio.",
    "telefonia.tab.proveedores": "Proveedores",
    "telefonia.tab.salientes": "Números salientes",
    "telefonia.tab.tarifas": "Tarifas por prefijo",
    "telefonia.nuevoProveedor": "Nuevo proveedor",
    "telefonia.col.carrier": "Proveedor",
    "telefonia.col.destino": "Destino (trunk)",
    "telefonia.col.whitelist": "IPs en whitelist",
    "telefonia.accion.activar": "Activar",
    "telefonia.accion.desactivar": "Desactivar",
    "telefonia.editarTitulo": "Editar {nombre}",
    "telefonia.dialogoDescripcion":
      "Alta de proveedor: trunk de ruteo saliente (dispatcher) y whitelist de IP de origen (permissions).",
    "telefonia.nombrePlaceholder": "Ej: Telnyx AR",
    "telefonia.prioridad": "Prioridad",
    "telefonia.whitelistLabel": "Whitelist de IP (una por línea)",
    "telefonia.whitelistAyuda":
      "IPs de origen autorizadas a mandar tráfico entrante de este proveedor.",
    "telefonia.proveedorActivo": "Proveedor activo",
    "telefonia.eliminarDescripcion":
      "Se eliminará el proveedor “{nombre}”. Esta acción no se puede deshacer.",
    "telefonia.salidaAnonima": "Permite salida oculta/aleatoria",
    "telefonia.salidaAnonimaAyuda":
      "Este carrier puede usarse cuando la cuenta pide salir con CLI oculto o aleatorio (ver Tarifas por prefijo).",

    "telefonia.salientes.titulo": "Números salientes (ANI)",
    "telefonia.salientes.descripcion":
      "Por qué carrier sale cada número saliente. No depende del tenant: esa validación ya la hace olimpo-api antes de elegir el ANI.",
    "telefonia.salientes.agregar": "Agregar número",
    "telefonia.salientes.nuevo": "Nuevo número saliente",
    "telefonia.salientes.editarTitulo": "Editar {numero}",
    "telefonia.salientes.dialogoDescripcion":
      "Mapeo de un ANI saliente al carrier por el que sale.",
    "telefonia.salientes.col.numero": "Número (ANI)",
    "telefonia.salientes.col.carrier": "Carrier",
    "telefonia.salientes.numeroPlaceholder": "Ej: 1161238744",
    "telefonia.salientes.eliminarDescripcion":
      "Se eliminará el número saliente “{numero}”. Esta acción no se puede deshacer.",

    "telefonia.tarifas.titulo": "Tarifas por prefijo (LCR)",
    "telefonia.tarifas.descripcion":
      "Cuánto cobra cada carrier por minuto según el prefijo de destino. Se usa para elegir el carrier más barato cuando la llamada sale con CLI oculto o aleatorio.",
    "telefonia.tarifas.agregar": "Agregar tarifa",
    "telefonia.tarifas.nuevo": "Nueva tarifa",
    "telefonia.tarifas.editarTitulo": "Editar tarifa {prefijo}",
    "telefonia.tarifas.dialogoDescripcion":
      "Costo por minuto de un carrier para un prefijo de destino.",
    "telefonia.tarifas.col.prefijo": "Prefijo destino",
    "telefonia.tarifas.col.tarifa": "Tarifa",
    "telefonia.tarifas.carrierAyuda":
      "Solo se listan carriers activos que permiten salida oculta/aleatoria.",
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
      "Telephony providers (carriers) per region: outbound routing trunk and inbound IP whitelist in Kamailio.",
    "telefonia.tab.proveedores": "Providers",
    "telefonia.tab.salientes": "Outbound numbers",
    "telefonia.tab.tarifas": "Rates by prefix",
    "telefonia.nuevoProveedor": "New provider",
    "telefonia.col.carrier": "Provider",
    "telefonia.col.destino": "Destination (trunk)",
    "telefonia.col.whitelist": "Whitelisted IPs",
    "telefonia.accion.activar": "Activate",
    "telefonia.accion.desactivar": "Deactivate",
    "telefonia.editarTitulo": "Edit {nombre}",
    "telefonia.dialogoDescripcion":
      "Provider onboarding: outbound routing trunk (dispatcher) and source IP whitelist (permissions).",
    "telefonia.nombrePlaceholder": "E.g. Telnyx AR",
    "telefonia.prioridad": "Priority",
    "telefonia.whitelistLabel": "IP whitelist (one per line)",
    "telefonia.whitelistAyuda":
      "Source IPs allowed to send inbound traffic for this provider.",
    "telefonia.proveedorActivo": "Provider active",
    "telefonia.eliminarDescripcion":
      "The provider “{nombre}” will be deleted. This action cannot be undone.",
    "telefonia.salidaAnonima": "Allows hidden/random outbound CLI",
    "telefonia.salidaAnonimaAyuda":
      "This carrier can be used when the account requests hidden or random CLI (see Rates by prefix).",

    "telefonia.salientes.titulo": "Outbound numbers (ANI)",
    "telefonia.salientes.descripcion":
      "Which carrier each outbound number uses. Not tenant-dependent: that check already happens in olimpo-api before the ANI is picked.",
    "telefonia.salientes.agregar": "Add number",
    "telefonia.salientes.nuevo": "New outbound number",
    "telefonia.salientes.editarTitulo": "Edit {numero}",
    "telefonia.salientes.dialogoDescripcion":
      "Mapping of an outbound ANI to the carrier it goes out through.",
    "telefonia.salientes.col.numero": "Number (ANI)",
    "telefonia.salientes.col.carrier": "Carrier",
    "telefonia.salientes.numeroPlaceholder": "E.g. 1161238744",
    "telefonia.salientes.eliminarDescripcion":
      "The outbound number “{numero}” will be deleted. This action cannot be undone.",

    "telefonia.tarifas.titulo": "Rates by prefix (LCR)",
    "telefonia.tarifas.descripcion":
      "How much each carrier charges per minute by destination prefix. Used to pick the cheapest carrier when the call goes out with hidden or random CLI.",
    "telefonia.tarifas.agregar": "Add rate",
    "telefonia.tarifas.nuevo": "New rate",
    "telefonia.tarifas.editarTitulo": "Edit rate {prefijo}",
    "telefonia.tarifas.dialogoDescripcion":
      "Per-minute cost of a carrier for a destination prefix.",
    "telefonia.tarifas.col.prefijo": "Destination prefix",
    "telefonia.tarifas.col.tarifa": "Rate",
    "telefonia.tarifas.carrierAyuda":
      "Only active carriers that allow anonymous outbound are listed.",
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
      "Provedores (carriers) de telefonia por região: trunk de roteamento de saída e whitelist de IP de entrada no Kamailio.",
    "telefonia.tab.proveedores": "Provedores",
    "telefonia.tab.salientes": "Números de saída",
    "telefonia.tab.tarifas": "Tarifas por prefixo",
    "telefonia.nuevoProveedor": "Novo provedor",
    "telefonia.col.carrier": "Provedor",
    "telefonia.col.destino": "Destino (trunk)",
    "telefonia.col.whitelist": "IPs na whitelist",
    "telefonia.accion.activar": "Ativar",
    "telefonia.accion.desactivar": "Desativar",
    "telefonia.editarTitulo": "Editar {nombre}",
    "telefonia.dialogoDescripcion":
      "Cadastro de provedor: trunk de roteamento de saída (dispatcher) e whitelist de IP de origem (permissions).",
    "telefonia.nombrePlaceholder": "Ex.: Telnyx AR",
    "telefonia.prioridad": "Prioridade",
    "telefonia.whitelistLabel": "Whitelist de IP (uma por linha)",
    "telefonia.whitelistAyuda":
      "IPs de origem autorizadas a enviar tráfego de entrada deste provedor.",
    "telefonia.proveedorActivo": "Provedor ativo",
    "telefonia.eliminarDescripcion":
      "O provedor “{nombre}” será excluído. Esta ação não pode ser desfeita.",
    "telefonia.salidaAnonima": "Permite saída oculta/aleatória",
    "telefonia.salidaAnonimaAyuda":
      "Este carrier pode ser usado quando a conta pede saída com CLI oculto ou aleatório (ver Tarifas por prefixo).",

    "telefonia.salientes.titulo": "Números de saída (ANI)",
    "telefonia.salientes.descripcion":
      "Por qual carrier sai cada número de saída. Não depende do tenant: essa validação já é feita pela olimpo-api antes de escolher o ANI.",
    "telefonia.salientes.agregar": "Adicionar número",
    "telefonia.salientes.nuevo": "Novo número de saída",
    "telefonia.salientes.editarTitulo": "Editar {numero}",
    "telefonia.salientes.dialogoDescripcion":
      "Mapeamento de um ANI de saída para o carrier pelo qual ele sai.",
    "telefonia.salientes.col.numero": "Número (ANI)",
    "telefonia.salientes.col.carrier": "Carrier",
    "telefonia.salientes.numeroPlaceholder": "Ex.: 1161238744",
    "telefonia.salientes.eliminarDescripcion":
      "O número de saída “{numero}” será excluído. Esta ação não pode ser desfeita.",

    "telefonia.tarifas.titulo": "Tarifas por prefixo (LCR)",
    "telefonia.tarifas.descripcion":
      "Quanto cada carrier cobra por minuto conforme o prefixo de destino. Usado para escolher o carrier mais barato quando a chamada sai com CLI oculto ou aleatório.",
    "telefonia.tarifas.agregar": "Adicionar tarifa",
    "telefonia.tarifas.nuevo": "Nova tarifa",
    "telefonia.tarifas.editarTitulo": "Editar tarifa {prefijo}",
    "telefonia.tarifas.dialogoDescripcion":
      "Custo por minuto de um carrier para um prefixo de destino.",
    "telefonia.tarifas.col.prefijo": "Prefixo destino",
    "telefonia.tarifas.col.tarifa": "Tarifa",
    "telefonia.tarifas.carrierAyuda":
      "Só são listados carriers ativos que permitem saída anônima.",
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
      "Proveïdors (carriers) de telefonia per regió: trunk d'encaminament de sortida i whitelist d'IP d'entrada a Kamailio.",
    "telefonia.tab.proveedores": "Proveïdors",
    "telefonia.tab.salientes": "Números de sortida",
    "telefonia.tab.tarifas": "Tarifes per prefix",
    "telefonia.nuevoProveedor": "Nou proveïdor",
    "telefonia.col.carrier": "Proveïdor",
    "telefonia.col.destino": "Destí (trunk)",
    "telefonia.col.whitelist": "IPs a la whitelist",
    "telefonia.accion.activar": "Activa",
    "telefonia.accion.desactivar": "Desactiva",
    "telefonia.editarTitulo": "Edita {nombre}",
    "telefonia.dialogoDescripcion":
      "Alta de proveïdor: trunk d'encaminament de sortida (dispatcher) i whitelist d'IP d'origen (permissions).",
    "telefonia.nombrePlaceholder": "Ex.: Telnyx AR",
    "telefonia.prioridad": "Prioritat",
    "telefonia.whitelistLabel": "Whitelist d'IP (una per línia)",
    "telefonia.whitelistAyuda":
      "IPs d'origen autoritzades a enviar trànsit d'entrada d'aquest proveïdor.",
    "telefonia.proveedorActivo": "Proveïdor actiu",
    "telefonia.eliminarDescripcion":
      "S'eliminarà el proveïdor “{nombre}”. Aquesta acció no es pot desfer.",
    "telefonia.salidaAnonima": "Permet sortida oculta/aleatòria",
    "telefonia.salidaAnonimaAyuda":
      "Aquest carrier es pot fer servir quan el compte demana sortir amb CLI ocult o aleatori (veure Tarifes per prefix).",

    "telefonia.salientes.titulo": "Números de sortida (ANI)",
    "telefonia.salientes.descripcion":
      "Per quin carrier surt cada número de sortida. No depèn del tenant: aquesta validació ja la fa olimpo-api abans de triar l'ANI.",
    "telefonia.salientes.agregar": "Afegeix un número",
    "telefonia.salientes.nuevo": "Nou número de sortida",
    "telefonia.salientes.editarTitulo": "Edita {numero}",
    "telefonia.salientes.dialogoDescripcion":
      "Mapeig d'un ANI de sortida al carrier pel qual surt.",
    "telefonia.salientes.col.numero": "Número (ANI)",
    "telefonia.salientes.col.carrier": "Carrier",
    "telefonia.salientes.numeroPlaceholder": "Ex.: 1161238744",
    "telefonia.salientes.eliminarDescripcion":
      "S'eliminarà el número de sortida “{numero}”. Aquesta acció no es pot desfer.",

    "telefonia.tarifas.titulo": "Tarifes per prefix (LCR)",
    "telefonia.tarifas.descripcion":
      "Quant cobra cada carrier per minut segons el prefix de destinació. S'usa per triar el carrier més barat quan la trucada surt amb CLI ocult o aleatori.",
    "telefonia.tarifas.agregar": "Afegeix una tarifa",
    "telefonia.tarifas.nuevo": "Nova tarifa",
    "telefonia.tarifas.editarTitulo": "Edita la tarifa {prefijo}",
    "telefonia.tarifas.dialogoDescripcion":
      "Cost per minut d'un carrier per a un prefix de destinació.",
    "telefonia.tarifas.col.prefijo": "Prefix destinació",
    "telefonia.tarifas.col.tarifa": "Tarifa",
    "telefonia.tarifas.carrierAyuda":
      "Només es llisten carriers actius que permeten sortida anònima.",
    "telefonia.tarifas.eliminarDescripcion":
      "S'eliminarà la tarifa del prefix “{prefijo}”. Aquesta acció no es pot desfer.",
  },
};
