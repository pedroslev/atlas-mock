import type { ContenidoPagina } from "@/lib/docs/tipos";

// Clientes: listado, ficha (solo lectura), catálogo de etiquetas e importación
// masiva por pasos.
export const contenido: ContenidoPagina = {
  es: {
    titulo: "Clientes",
    resumen:
      "La base de clientes de tu empresa: quiénes son, cómo contactarlos y qué datos propios tiene cada uno. Los clientes se cargan por importación masiva y se organizan con etiquetas.",
    secciones: [
      {
        id: "que-es",
        titulo: "Qué es y para qué sirve",
        bloques: [
          {
            tipo: "p",
            texto:
              "«Clientes» es la base de clientes de tu empresa. Cada cliente se carga una vez y después solo se actualiza, con cada nueva importación. No hay alta manual: por ahora los clientes entran únicamente por importación masiva.",
          },
          {
            tipo: "p",
            texto:
              "Qué guarda de cada cliente:\n• Datos básicos: nombre, apellido, tipo y número de identificación e ID externo.\n• Formas de contacto: teléfonos, mails, WhatsApp y redes sociales, por las que se reconoce al cliente cuando llama o escribe.\n• Información adicional: datos propios de cada cliente, por ejemplo la deuda.\n• Etiquetas: marcas para filtrar y segmentar.",
          },
          {
            tipo: "p",
            texto:
              "Se relaciona con otras secciones de Olimpo: los grupos de trabajo definen qué datos de la ficha del cliente pueden ver y modificar sus agentes en Hermes (el puesto de trabajo del agente) (solapa «Ficha del cliente» del grupo; ver «Grupos de trabajo»). Depende de las importaciones: sin importar un archivo no hay clientes.",
          },
        ],
      },
      {
        id: "listado",
        titulo: "El listado",
        bloques: [
          { tipo: "sub", texto: "Columnas" },
          {
            tipo: "lista",
            items: [
              "Nombre — Nombre del cliente. Es un link a su ficha.",
              "Apellido — Apellido del cliente. También es un link a la ficha.",
              "Identificación — Tipo y número de documento juntos, por ejemplo «DNI 28.456.789».",
              "ID externo — Identificador del cliente en el sistema de origen (por ejemplo, el número de cliente en tu sistema de gestión). Si no tiene, aparece «—».",
              "Teléfono principal — El teléfono marcado como principal. Si ninguno lo está, el primer teléfono que tenga. Si no tiene teléfonos, «—».",
              "Etiquetas — Las etiquetas del cliente, con su color.",
            ],
          },
          { tipo: "sub", texto: "Búsqueda y acciones" },
          {
            tipo: "lista",
            items: [
              "Buscador — El campo «Buscar» arriba de la tabla filtra los clientes por lo que escribas.",
              "Orden y filtros — La tabla permite ordenar y filtrar por columna. No hay páginas: todas las filas se ven en una lista que se desplaza dentro de la pantalla.",
              "«Ver ficha» — Menú de tres puntos de la fila. Abre la ficha del cliente.",
              "«Eliminar» — También en el menú de la fila, en rojo. Pide confirmación («¿Confirmás la eliminación?»).",
              "«Importar clientes» — Botón arriba a la derecha. Abre la importación.",
              "«Administrar etiquetas» — Botón arriba a la derecha. Abre el catálogo de etiquetas.",
            ],
          },
          {
            tipo: "p",
            texto: "El listado no tiene acciones masivas ni alta manual de clientes.",
          },
        ],
      },
      {
        id: "ficha",
        titulo: "La ficha del cliente",
        bloques: [
          {
            tipo: "p",
            texto:
              "La ficha es de solo lectura: se ve, pero no se edita desde acá. Para actualizar un cliente hay que importar un archivo nuevo. El historial de gestiones y los objetivos de contacto no van en la ficha.",
          },
          {
            tipo: "lista",
            items: [
              "Resumen — Nombre completo, etiquetas (o «Sin etiquetas.»), tipo de identificación, número e ID externo.",
              "Alta y Última actualización — Cuándo se hizo, quién y por qué vía. La vía puede ser «Importación», «Olimpo», «Hermes», «IVR» (el menú automático de voz), «API» o «Automático».",
              "Formas de contacto — Cada forma con su descripción (por ejemplo «Celular» o «Laboral») y marcas: «Principal», «Inválido» (el dato se ve tachado) y «No contactar».",
              "Información adicional — Datos propios del cliente, como producto, deuda o días de mora. Se actualizan con cada importación.",
            ],
          },
        ],
      },
      {
        id: "etiquetas",
        titulo: "Etiquetas de clientes",
        bloques: [
          {
            tipo: "p",
            texto:
              "Las etiquetas son marcas que se ponen a los clientes para filtrarlos y segmentarlos. El catálogo se administra en «Etiquetas de clientes» (botón «Administrar etiquetas»). Las mismas etiquetas se usan en la importación.",
          },
          {
            tipo: "p",
            texto:
              "La tabla muestra «Etiqueta» (con su color) y «Descripción». Cada fila tiene «Editar» y «Eliminar». Al eliminar, la pantalla avisa: «La etiqueta “X” se va a quitar de todos los clientes que la tengan.»",
          },
          { tipo: "sub", texto: "Cómo crear o editar una etiqueta" },
          {
            tipo: "pasos",
            items: [
              "Tocá «Nueva etiqueta», o «Editar» en la fila de una existente.",
              "Escribí el «Nombre». Se pasa solo a mayúsculas.",
              "Si querés, completá la «Descripción».",
              "Si querés, completá el «Prompt para IA».",
              "Elegí el «Color» de la paleta, o «Personalizado» para uno libre. Abajo ves la «Vista previa:».",
              "Tocá «Guardar».",
            ],
          },
          {
            tipo: "lista",
            items: [
              "Nombre — Obligatorio. Siempre en mayúsculas (ejemplo «MORA +60»). Único sin importar mayúsculas o minúsculas: si ya existe, aparece «Ya existe la etiqueta X.» y no se puede guardar.",
              "Descripción — Opcional. Se ve como texto de ayuda al pasar el mouse por la etiqueta.",
              "Prompt para IA — Opcional. Es una instrucción para que la IA pueda asignar la etiqueta sola durante la conversación. Ejemplo: «Poné esta etiqueta si el cliente dice que quiere dar de baja el servicio.»",
              "Color — Se elige de la paleta o con «Personalizado». Por defecto el primero de la paleta.",
            ],
          },
        ],
      },
      {
        id: "importar",
        titulo: "Importar clientes: cómo funciona",
        bloques: [
          {
            tipo: "p",
            texto:
              "La importación carga o actualiza clientes desde un archivo. Se hace en siete pasos: «Archivo», «Datos básicos», «Contacto», «Información adicional», «Etiquetas», «Opciones» y «Revisión». Los pasos están arriba y se pueden tocar para volver a uno anterior; no se puede saltar más allá del primer paso incompleto.",
          },
          {
            tipo: "p",
            texto:
              "A la derecha, el panel «Campos» muestra en vivo cómo se asocia cada campo del sistema con las columnas del archivo, con un ejemplo y los que todavía están sin asociar. «Anterior» y «Siguiente» están abajo; «Siguiente» se habilita cuando el paso está completo. Si falta algo, a su lado aparece el motivo.",
          },
          {
            tipo: "p",
            texto:
              "«Cancelar» (arriba a la derecha) sale de la importación. Si ya cargaste un archivo, pregunta «¿Cancelar la importación?» porque se pierde todo lo configurado; podés elegir «Seguir importando» o «Descartar y salir».",
          },
          {
            tipo: "nota",
            texto:
              "Si cambiás el encabezado, el separador de campos, la hoja o el formato del archivo en el paso «Archivo», cambian las columnas y el mapeo de los pasos siguientes vuelve a cero.",
          },
        ],
      },
      {
        id: "importar-archivo",
        titulo: "Paso 1. Archivo",
        bloques: [
          {
            tipo: "p",
            texto:
              "Elegí el archivo («Arrastrá el archivo acá o hacé clic para elegirlo»). Los formatos son TXT, CSV, XLSX o XLS. Con otro formato aparece «Formato no soportado. Usá un archivo TXT, CSV, XLSX o XLS.» Una vez cargado ves el nombre, la cantidad de filas y columnas, «Importación válida» y una vista previa de las primeras filas. Con «Cambiar archivo» elegís otro.",
          },
          {
            tipo: "lista",
            items: [
              "Archivo con encabezado — Casilla, tildada por defecto. Indica que la primera fila tiene los nombres de las columnas, que se usan en todos los pasos. Sin tilde, las columnas se llaman «Columna 1», «Columna 2», etc., y la primera fila se importa como un dato más.",
              "Separador de campos — Solo TXT y CSV. Obligatorio. Por defecto «;». Hay atajos para «;», «,», «|» y tabulación. Si con el separador elegido se detecta una sola columna, aparece un aviso para que lo revises.",
              "Separador de texto — Solo TXT y CSV. Opcional, un solo carácter, por ejemplo una comilla.",
              "Codificación — Solo TXT y CSV. Por defecto «UTF-8». También «Latin-1 (ISO-8859-1)» y «Windows-1252». Si elegís una distinta de la detectada, avisa que los acentos y la ñ se pueden ver mal en la vista previa.",
              "Hoja del libro — Solo XLSX y XLS. Elegí la hoja con los datos. Si la hoja no tiene datos aparece un aviso para que elijas otra.",
            ],
          },
          {
            tipo: "p",
            texto:
              "Para pasar al paso siguiente el archivo debe ser válido: formato soportado, sin problema de separador ni de hoja, y con separador de campos completo.",
          },
        ],
      },
      {
        id: "importar-basicos",
        titulo: "Paso 2. Datos básicos",
        bloques: [
          {
            tipo: "p",
            texto:
              "Elegí de qué columna del archivo sale cada dato básico. Al lado ves ejemplos de lo que trae la columna elegida. Ninguno es obligatorio, y con «No importar» dejás un dato sin asociar.",
          },
          {
            tipo: "lista",
            items: [
              "Nombre — Columna con el nombre.",
              "Apellido — Columna con el apellido.",
              "Tipo de identificación — Dos modos: «Columna del archivo» o «Valor fijo». Con «Valor fijo» el mismo tipo se aplica a todos los clientes del archivo («Se aplica a todos los clientes del archivo»). Se elige de una lista por país y por defecto es Argentina, DNI.",
              "Número de identificación — Columna con el número de documento.",
              "ID externo — Columna con el identificador del cliente en el sistema de origen.",
            ],
          },
          {
            tipo: "p",
            texto:
              "En los desplegables, las columnas que ya usaste en otro lado quedan en gris con la marca «En uso» y el detalle de dónde se usan. Igual se pueden elegir.",
          },
        ],
      },
      {
        id: "importar-contacto",
        titulo: "Paso 3. Contacto",
        bloques: [
          {
            tipo: "p",
            texto:
              "Asociá las columnas que traen teléfonos, mails, WhatsApp o redes sociales. Un cliente puede tener varias formas de contacto: agregá una fila por cada columna. Hace falta asociar al menos una columna.",
          },
          {
            tipo: "lista",
            items: [
              "Columna del archivo — La columna con el dato de contacto.",
              "Tipo — «Teléfono» (por defecto), «WhatsApp», «Email», «Instagram», «Facebook», «TikTok», «X (Twitter)», «Telegram» o «LinkedIn».",
              "Descripción — Texto libre para distinguir el contacto, por ejemplo «Celular, Laboral…». Opcional.",
              "Principal — Casilla. Marca cuál es el contacto principal. La primera fila arranca como principal. Solo puede haber uno principal por tipo: al marcar uno, se desmarca el otro del mismo tipo.",
              "Botón de eliminar — Quita la fila. Si quitás la principal, la primera que queda pasa a serlo.",
            ],
          },
          {
            tipo: "p",
            texto:
              "«Agregar columna de contacto» suma otra fila. Las formas de contacto que llegan se suman a las que el cliente ya tiene: las anteriores no se borran (salvo que elijas sobrescribir en el paso «Opciones»).",
          },
        ],
      },
      {
        id: "importar-adicionales",
        titulo: "Paso 4. Información adicional",
        bloques: [
          {
            tipo: "p",
            texto:
              "Acá van las columnas que no usaste en los pasos anteriores. Cada una puede guardarse como información adicional del cliente. Las que se llaman igual que un campo que ya existe (sin importar mayúsculas) se asocian solas y vienen encendidas. Las demás vienen apagadas: encendelas una por una o todas con el interruptor «Importar todas las columnas». Una columna apagada no se importa.",
          },
          {
            tipo: "lista",
            items: [
              "Importar la columna X — Interruptor de cada columna.",
              "Se guarda en — «Crear campo nuevo» o uno de los campos existentes. Los existentes que ya tomó otra columna se marcan «En uso». La fila muestra «Campo existente» o «Campo nuevo».",
              "Nombre en el sistema — Cómo se llama el campo. Por defecto es el encabezado de la columna. En campos existentes no se puede cambiar. No puede estar vacío ni repetirse con otro campo: aparece «Ya existe un campo con ese nombre. Elegí otro o guardalo en el campo existente.»",
              "Tipo — «Texto», «Número», «Moneda», «Fecha», «Lista de opciones» o «Sí / No». Se propone según lo que traen las celdas. En campos existentes no se puede cambiar.",
            ],
          },
          { tipo: "sub", texto: "Configuración y validaciones por tipo (campos nuevos)" },
          {
            tipo: "lista",
            items: [
              "Moneda — «Moneda», por defecto ARS. La lista trae las más frecuentes primero y después todas.",
              "Fecha — «Formato en el archivo». Por defecto DD/MM/AAAA, con otros habituales .",
              "Lista de opciones — «Separador de opciones en la celda», para celdas que traen varias opciones (por ejemplo «WhatsApp|Llamada»). Se detectan los caracteres usados y se muestra «Así se separa cada celda». También hay «Sin separador (una opción por celda)».",
              "Sí / No — «Valor del archivo que significa “Sí”». El resto se toma como «No».",
              "Validar este campo — Casilla, apagada por defecto, para texto, número y moneda. Al encenderla: «Mínimo» y «Máximo» en número y moneda, y «Largo máximo (caracteres)» en texto. Vacío es «Sin validar».",
            ],
          },
          {
            tipo: "p",
            texto:
              "Un campo existente usa las validaciones que ya tiene («Usa las validaciones del campo existente.»).",
          },
          { tipo: "sub", texto: "Campos sin dato en el archivo" },
          {
            tipo: "p",
            texto:
              "Al final, «Campos sin dato en el archivo» permite crear campos que no vienen en el archivo y quedan vacíos para que los complete el agente durante la gestión (por ejemplo, fecha y monto de una promesa de pago). Se agregan con «Agregar campo vacío». Cada uno tiene «Se guarda en», «Nombre en el sistema» y «Tipo». Si el tipo es lista, se cargan a mano las «Opciones permitidas» que va a poder elegir el agente.",
          },
          {
            tipo: "p",
            texto:
              "Para avanzar, las columnas encendidas y los campos vacíos tienen que tener nombre, y no puede haber nombres repetidos.",
          },
        ],
      },
      {
        id: "importar-etiquetas",
        titulo: "Paso 5. Etiquetas",
        bloques: [
          {
            tipo: "p",
            texto:
              "Opcional. Sirve para etiquetar a los clientes del archivo: algunas etiquetas fijas para todos y otras según el valor de una columna. Las etiquetas se suman a las que el cliente ya tenga. Estas etiquetas no se quitan desde la importación.",
          },
          {
            tipo: "lista",
            items: [
              "Etiquetas a asignar — Se agregan a todos los clientes del archivo, nuevos y actualizados. Con hasta 10 etiquetas se ven todas como botones que se prenden y apagan; con más, se elige desde «Elegir etiquetas», con buscador.",
              "Nueva etiqueta — Crea una etiqueta en el momento (mismo formulario del catálogo). Queda elegida.",
              "Reglas de etiquetado al importar — Asignan etiquetas según el valor de una columna: «Si» [campo] [condición] [valor], «Poner:» [etiquetas]. Se aplican una sola vez, al cargar el archivo.",
            ],
          },
          {
            tipo: "p",
            texto:
              "En cada regla elegís el «Campo» (las columnas que se importan y las que no, separadas), la «Condición» y el «Valor». Las condiciones dependen del tipo del campo: texto («Es igual a», «Es distinto de», «Contiene», «Está vacío», «No está vacío»), número («Es mayor que», «Es mayor o igual a», «Es menor que», «Es menor o igual a», «Está entre»), fecha («Es anterior a», «Es posterior a», «Está entre»), lista («Incluye», «No incluye») y Sí / No («Es Sí», «Es No»). Debajo de la regla ves «En la vista previa coincide con N de M filas».",
          },
          {
            tipo: "nota",
            texto:
              "Una columna puede usarse solo para etiquetar sin importarse: aparece como «No se importan» y avisa «Esta columna no se importa: se usa solo para etiquetar.» Las reglas se recuerdan para las próximas importaciones; si cambiás el mapeo, esta importación pisa la configuración anterior.",
          },
        ],
      },
      {
        id: "importar-opciones",
        titulo: "Paso 6. Opciones",
        bloques: [
          {
            tipo: "p",
            texto: "Define cómo reconocer a un cliente que ya existe y qué hacer con los datos.",
          },
          {
            tipo: "lista",
            items: [
              "Cómo reconocer a un cliente que ya existe — Obligatorio. Elegís un campo; si su valor coincide con un cliente existente, se actualiza en vez de crear uno nuevo. Las opciones son «Número de identificación», «ID externo» y «Teléfono principal» (solo si los asociaste en los pasos anteriores) y cualquier otra columna del archivo. Hasta elegirlo aparece «Elegí cómo reconocer a un cliente que ya existe».",
              "Si el mismo cliente aparece más de una vez en el archivo — «Usar la última fila» (por defecto), «Usar la primera fila» o «Rechazar todas sus filas». Las filas que no se usan quedan como advertencia en el reporte.",
              "Si el cliente ya existe y tiene el dato — «Reemplazarlo con el del archivo» (por defecto), «Completarlo solo si está vacío» o «No tocarlo». Aplica a datos básicos e información adicional.",
              "Si una celda viene vacía en el archivo — «No borrar el dato existente» (por defecto) o «Borrar el dato existente». Vacío suele significar que no vino el dato: borrar solo si el archivo es la fuente completa del cliente.",
              "Contactos de un cliente que ya existe — «Sumar los nuevos y actualizar los que ya tiene» (por defecto), «Sumar los nuevos y dejar como están los que ya tiene» o «Sobrescribir: reemplazar todos por los del archivo». «Actualizar» cambia la descripción, el tipo o la marca de principal de un contacto que ya existía; «Sobrescribir» borra los contactos que no vengan en el archivo.",
            ],
          },
          {
            tipo: "nota",
            texto:
              "Estas reglas valen para toda la importación. Las filas con errores nunca se importan: quedan en el reporte.",
          },
        ],
      },
      {
        id: "importar-revision",
        titulo: "Paso 7. Revisión",
        bloques: [
          {
            tipo: "p",
            texto:
              "Último control antes de importar. Muestra el archivo y su configuración, y los totales:",
          },
          {
            tipo: "lista",
            items: [
              "Filas en el archivo.",
              "Clientes a crear.",
              "Clientes a actualizar.",
              "Filas con errores (no se importan).",
              "Advertencias (se importan sin ese dato).",
            ],
          },
          {
            tipo: "p",
            texto:
              "También ves «Cómo se va a cargar» (cómo se reconoce a los existentes, las opciones elegidas y cuántas columnas van a datos básicos, contactos, campos existentes o no se importan), los «Campos nuevos que se van a crear» y «Ejemplos de errores y advertencias». Con «Descargar el detalle de errores y advertencias (CSV)» bajás el detalle.",
          },
          {
            tipo: "lista",
            items: [
              "Error — La fila no se importa. Ejemplos: falta el dato con el que se reconoce al cliente, coincide con más de un cliente existente, o no tiene ningún contacto válido.",
              "Advertencia — El cliente se importa, pero sin ese dato. Ejemplos: un importe, un mail o una fecha con formato inválido.",
            ],
          },
          {
            tipo: "p",
            texto:
              "Para importar tocá «Importar solo los válidos». Aparece «Importación en curso»: te avisan cuando termine . Desde ahí podés elegir «Importar otro archivo» o «Volver a clientes».",
          },
        ],
      },
      {
        id: "reglas",
        titulo: "Reglas y relaciones",
        bloques: [
          {
            tipo: "lista",
            items: [
              "Unicidad de clientes — Un cliente nuevo no se crea si coincide con uno existente según el campo que elijas en «Cómo reconocer a un cliente que ya existe»: se actualiza.",
              "Unicidad de etiquetas — El nombre es único sin distinguir mayúsculas.",
              "Eliminar una etiqueta — Se quita de todos los clientes que la tengan.",
              "Grupos de trabajo — Cada grupo define qué datos de la ficha ven y modifican sus agentes en Hermes (el puesto de trabajo del agente). La información adicional se arma con los campos que se fueron creando en las importaciones.",
              "Eliminar un cliente — Quita al cliente. Antes te pide confirmación, porque no se puede deshacer.",
            ],
          },
        ],
      },
      {
        id: "consejos",
        titulo: "Consejos y errores comunes",
        bloques: [
          {
            tipo: "lista",
            items: [
              "Si en el paso «Archivo» ves una sola columna enorme, el separador de campos no es el del archivo. Probá «;», «,», «|» o tabulación.",
              "Si los acentos o la ñ se ven raros, cambiá la «Codificación».",
              "Si elegís «ID externo» como forma de reconocer clientes, asegurate de haberlo asociado en «Datos básicos»: si no, no aparece en la lista.",
              "Antes de usar «Borrar el dato existente», confirmá que el archivo tiene todos los datos del cliente. Una celda vacía borraría lo que ya había.",
              "Con muchas columnas, usá «Importar todas las columnas» y apagá las que no quieras.",
              "Usá el nombre de la columna como «Nombre en el sistema» solo si te sirve: es el que van a ver los agentes.",
            ],
          },
        ],
      },
    ],
  },
  en: {
    titulo: "Customers",
    resumen:
      "Your company's customer base: who they are, how to contact them and what data each one has. Customers are loaded by bulk import and organized with tags.",
    secciones: [
      {
        id: "que-es",
        titulo: "What it is and what it is for",
        bloques: [
          {
            tipo: "p",
            texto:
              "«Clientes» (Customers) is your company's customer base. Each customer is loaded once and afterwards only updated, with each new import. There is no manual creation: for now customers come in only through bulk import.",
          },
          {
            tipo: "p",
            texto:
              "What it stores for each customer:\n• Basic data: first name, last name, ID type and number, and external ID.\n• Contact methods: phones, emails, WhatsApp and social networks, used to recognize the customer when they call or write.\n• Additional information: data specific to each customer, for example their debt.\n• Tags: labels used to filter and segment.",
          },
          {
            tipo: "p",
            texto:
              "It relates to other sections of Olimpo: work groups define which customer record data their agents can see and edit in Hermes (the group's «Ficha del cliente» tab; see «Grupos de trabajo»). It depends on imports: without importing a file there are no customers.",
          },
        ],
      },
      {
        id: "listado",
        titulo: "The list",
        bloques: [
          { tipo: "sub", texto: "Columns" },
          {
            tipo: "lista",
            items: [
              "Nombre (first name) — The customer's first name. It is a link to their record.",
              "Apellido (last name) — The customer's last name. Also a link to the record.",
              "Identificación — ID type and number together, for example «DNI 28.456.789».",
              "ID externo — The customer's identifier in the source system (for example, the customer number in your management system). If there is none it shows «—».",
              "Teléfono principal — The phone marked as main. If none is, the first phone they have. If they have no phones, «—».",
              "Etiquetas — The customer's tags, with their color.",
            ],
          },
          { tipo: "sub", texto: "Search and actions" },
          {
            tipo: "lista",
            items: [
              "Search box — The «Search» field above the table filters customers by what you type.",
              "Sorting and filters — The table lets you sort and filter by column. There are no pages: all rows show in one list that scrolls inside the screen.",
              "«Ver ficha» — In the row's three-dot menu. It opens the customer record.",
              "«Eliminar» (Delete) — Also in the row menu, in red. It asks for confirmation («Confirm deletion?»).",
              "«Importar clientes» — Button at the top right. It opens the import.",
              "«Administrar etiquetas» — Button at the top right. It opens the tag catalog.",
            ],
          },
          {
            tipo: "p",
            texto: "The list has no bulk actions and no manual creation of customers.",
          },
        ],
      },
      {
        id: "ficha",
        titulo: "The customer record",
        bloques: [
          {
            tipo: "p",
            texto:
              "The record is read-only: you can see it, but not edit it from here. To update a customer you import a new file. The history of interactions and the contact objectives are not part of the record.",
          },
          {
            tipo: "lista",
            items: [
              "Summary — Full name, tags (or «Sin etiquetas.»), ID type, number and external ID.",
              "Alta and Última actualización (created and last updated) — When it was done, by whom and through which channel. The channel can be «Importación», «Olimpo», «Hermes», «IVR» (el menú automático de voz), «API» or «Automático».",
              "Formas de contacto — Each contact method with its description (for example «Celular» or «Laboral») and marks: «Principal», «Inválido» (the value shows crossed out) and «No contactar».",
              "Información adicional — Data specific to the customer, such as product, debt or days overdue. It is updated with each import.",
            ],
          },
        ],
      },
      {
        id: "etiquetas",
        titulo: "Customer tags",
        bloques: [
          {
            tipo: "p",
            texto:
              "Tags are labels placed on customers to filter and segment them. The catalog is managed in «Etiquetas de clientes» (button «Administrar etiquetas»). The same tags are used in the import.",
          },
          {
            tipo: "p",
            texto:
              "The table shows «Etiqueta» (with its color) and «Descripción». Each row has «Edit» and «Delete». When deleting, the screen warns that the tag will be removed from every customer that has it.",
          },
          { tipo: "sub", texto: "How to create or edit a tag" },
          {
            tipo: "pasos",
            items: [
              "Click «Nueva etiqueta», or «Edit» on the row of an existing one.",
              "Write the «Nombre». It turns to uppercase on its own.",
              "If you want, fill in the «Descripción».",
              "If you want, fill in the «Prompt para IA».",
              "Choose the «Color» from the palette, or «Personalizado» for a free one. Below you see the preview («Vista previa:»).",
              "Click «Save».",
            ],
          },
          {
            tipo: "lista",
            items: [
              "Nombre — Required. Always uppercase (example «MORA +60»). Unique regardless of upper or lower case: if it already exists, «Ya existe la etiqueta X.» appears and you cannot save.",
              "Descripción — Optional. Shown as help text when hovering over the tag.",
              "Prompt para IA — Optional. An instruction so the AI can assign the tag by itself during the conversation. Example: «Poné esta etiqueta si el cliente dice que quiere dar de baja el servicio.»",
              "Color — Chosen from the palette or with «Personalizado». By default the first one in the palette.",
            ],
          },
        ],
      },
      {
        id: "importar",
        titulo: "Importing customers: how it works",
        bloques: [
          {
            tipo: "p",
            texto:
              "The import loads or updates customers from a file. It has seven steps: «Archivo», «Datos básicos», «Contacto», «Información adicional», «Etiquetas», «Opciones» and «Revisión». The steps are at the top and you can click one to go back; you cannot jump past the first incomplete step.",
          },
          {
            tipo: "p",
            texto:
              "On the right, the «Campos» panel shows live how each system field maps to the file's columns, with an example and the ones still unmapped. «Anterior» and «Siguiente» are at the bottom; «Siguiente» is enabled when the step is complete. If something is missing, the reason appears next to it.",
          },
          {
            tipo: "p",
            texto:
              "«Cancelar» (top right) leaves the import. If you already loaded a file, it asks «¿Cancelar la importación?» because everything configured is lost; you can choose «Seguir importando» or «Descartar y salir».",
          },
          {
            tipo: "nota",
            texto:
              "If you change the header, the field separator, the sheet or the file format in the «Archivo» step, the columns change and the mapping of the following steps goes back to zero.",
          },
        ],
      },
      {
        id: "importar-archivo",
        titulo: "Step 1. File",
        bloques: [
          {
            tipo: "p",
            texto:
              "Choose the file («Arrastrá el archivo acá o hacé clic para elegirlo»). Supported formats are TXT, CSV, XLSX or XLS. With any other format you see «Formato no soportado. Usá un archivo TXT, CSV, XLSX o XLS.» Once loaded you see the name, the number of rows and columns, «Importación válida» and a preview of the first rows. With «Cambiar archivo» you pick another one.",
          },
          {
            tipo: "lista",
            items: [
              "Archivo con encabezado — Checkbox, checked by default. It says the first row has the column names, which are used in all steps. Unchecked, the columns are called «Columna 1», «Columna 2», etc., and the first row is imported as one more record.",
              "Separador de campos — TXT and CSV only. Required. Default «;». There are shortcuts for «;», «,», «|» and tab. If the chosen separator yields a single column, a warning asks you to review it.",
              "Separador de texto — TXT and CSV only. Optional, a single character, for example a quote.",
              "Codificación — TXT and CSV only. Default «UTF-8». Also «Latin-1 (ISO-8859-1)» and «Windows-1252». If you choose one different from the detected one, it warns that accents and ñ may look wrong in the preview.",
              "Hoja del libro — XLSX and XLS only. Choose the sheet with the data. If the sheet has no data, a warning asks you to pick another.",
            ],
          },
          {
            tipo: "p",
            texto:
              "To move to the next step the file must be valid: supported format, no separator or sheet problem, and the field separator filled in.",
          },
        ],
      },
      {
        id: "importar-basicos",
        titulo: "Step 2. Basic data",
        bloques: [
          {
            tipo: "p",
            texto:
              "Choose which file column each basic data comes from. Next to it you see examples of what the chosen column holds. None is required, and with «No importar» you leave a field unmapped.",
          },
          {
            tipo: "lista",
            items: [
              "Nombre — Column with the first name.",
              "Apellido — Column with the last name.",
              "Tipo de identificación — Two modes: «Columna del archivo» or «Valor fijo». With «Valor fijo» the same type applies to every customer in the file («Se aplica a todos los clientes del archivo»). It is chosen from a list by country and defaults to Argentina, DNI.",
              "Número de identificación — Column with the ID number.",
              "ID externo — Column with the customer's identifier in the source system.",
            ],
          },
          {
            tipo: "p",
            texto:
              "In the dropdowns, columns you already used elsewhere are grayed out with the «En uso» mark and the detail of where they are used. You can still pick them.",
          },
        ],
      },
      {
        id: "importar-contacto",
        titulo: "Step 3. Contact",
        bloques: [
          {
            tipo: "p",
            texto:
              "Map the columns that hold phones, emails, WhatsApp or social networks. A customer can have several contact methods: add one row per column. At least one column must be mapped.",
          },
          {
            tipo: "lista",
            items: [
              "Columna del archivo — The column with the contact value.",
              "Tipo — «Teléfono» (default), «WhatsApp», «Email», «Instagram», «Facebook», «TikTok», «X (Twitter)», «Telegram» or «LinkedIn».",
              "Descripción — Free text to tell contacts apart, for example «Celular, Laboral…». Optional.",
              "Principal — Checkbox. Marks which one is the main contact. The first row starts as main. Only one can be main per type: checking one unchecks the other of the same type.",
              "Delete button — Removes the row. If you remove the main one, the first remaining becomes main.",
            ],
          },
          {
            tipo: "p",
            texto:
              "«Agregar columna de contacto» adds another row. Incoming contact methods are added to those the customer already has: the previous ones are not deleted (unless you choose to overwrite in the «Opciones» step).",
          },
        ],
      },
      {
        id: "importar-adicionales",
        titulo: "Step 4. Additional information",
        bloques: [
          {
            tipo: "p",
            texto:
              "Here go the columns you did not use in the previous steps. Each one can be saved as additional information of the customer. Those named the same as an existing field (regardless of case) map on their own and come turned on. The others come turned off: turn them on one by one or all at once with the «Importar todas las columnas» switch. A turned-off column is not imported.",
          },
          {
            tipo: "lista",
            items: [
              "Importar la columna X — Switch of each column.",
              "Se guarda en — «Crear campo nuevo» or one of the existing fields. Existing fields already taken by another column are marked «En uso». The row shows «Campo existente» or «Campo nuevo».",
              "Nombre en el sistema — The field's name. By default it is the column header. It cannot be changed on existing fields. It cannot be empty or repeat another field: you see «Ya existe un campo con ese nombre. Elegí otro o guardalo en el campo existente.»",
              "Tipo — «Texto», «Número», «Moneda», «Fecha», «Lista de opciones» or «Sí / No». It is suggested from what the cells hold. It cannot be changed on existing fields.",
            ],
          },
          { tipo: "sub", texto: "Configuration and validations by type (new fields)" },
          {
            tipo: "lista",
            items: [
              "Currency — «Moneda», default ARS. The list shows the most frequent first and then all of them.",
              "Date — «Formato en el archivo». Default DD/MM/AAAA, with other common ones .",
              "Option list — «Separador de opciones en la celda», for cells holding several options (for example «WhatsApp|Llamada»). The characters used are detected and «Así se separa cada celda» is shown. There is also «Sin separador (una opción por celda)».",
              "Yes / No — «Valor del archivo que significa “Sí”». Everything else counts as «No».",
              "Validar este campo — Checkbox, off by default, for text, number and currency. When on: «Mínimo» and «Máximo» for number and currency, and «Largo máximo (caracteres)» for text. Empty means «Sin validar».",
            ],
          },
          {
            tipo: "p",
            texto:
              "An existing field uses the validations it already has («Usa las validaciones del campo existente.»).",
          },
          { tipo: "sub", texto: "Fields with no data in the file" },
          {
            tipo: "p",
            texto:
              "At the end, «Campos sin dato en el archivo» lets you create fields that are not in the file and are left empty for the agent to fill in during the interaction (for example date and amount of a payment promise). They are added with «Agregar campo vacío». Each one has «Se guarda en», «Nombre en el sistema» and «Tipo». If the type is list, you enter by hand the «Opciones permitidas» the agent will be able to choose from.",
          },
          {
            tipo: "p",
            texto:
              "To continue, turned-on columns and empty fields must have a name, and there cannot be repeated names.",
          },
        ],
      },
      {
        id: "importar-etiquetas",
        titulo: "Step 5. Tags",
        bloques: [
          {
            tipo: "p",
            texto:
              "Optional. It tags the customers in the file: some fixed tags for everyone and others depending on the value of a column. Tags are added to those the customer already has. Imports never remove tags.",
          },
          {
            tipo: "lista",
            items: [
              "Etiquetas a asignar — Added to every customer in the file, new and updated. With up to 10 tags they all show as buttons you turn on and off; with more, you pick from «Elegir etiquetas», with a search box.",
              "Nueva etiqueta — Creates a tag on the spot (same form as the catalog). It is selected.",
              "Reglas de etiquetado al importar — Assign tags depending on a column's value: «Si» [field] [condition] [value], «Poner:» [tags]. They are applied only once, when the file is loaded.",
            ],
          },
          {
            tipo: "p",
            texto:
              "In each rule you choose the «Campo» (the columns that are imported and those that are not, listed separately), the «Condición» and the «Valor». Conditions depend on the field type: text («Es igual a», «Es distinto de», «Contiene», «Está vacío», «No está vacío»), number («Es mayor que», «Es mayor o igual a», «Es menor que», «Es menor o igual a», «Está entre»), date («Es anterior a», «Es posterior a», «Está entre»), list («Incluye», «No incluye») and Yes / No («Es Sí», «Es No»). Below the rule you see «En la vista previa coincide con N de M filas» (matches N of M rows in the preview).",
          },
          {
            tipo: "nota",
            texto:
              "A column can be used only to tag without being imported: it appears under «No se importan» and warns «Esta columna no se importa: se usa solo para etiquetar.» Rules are remembered for the next imports; if you change the mapping, this import replaces the previous configuration.",
          },
        ],
      },
      {
        id: "importar-opciones",
        titulo: "Step 6. Options",
        bloques: [
          {
            tipo: "p",
            texto: "It defines how to recognize a customer that already exists and what to do with the data.",
          },
          {
            tipo: "lista",
            items: [
              "Cómo reconocer a un cliente que ya existe — Required. You choose a field; if its value matches an existing customer, that customer is updated instead of creating a new one. The options are «Número de identificación», «ID externo» and «Teléfono principal» (only if you mapped them in earlier steps) and any other column in the file. Until you choose, you see «Elegí cómo reconocer a un cliente que ya existe».",
              "Si el mismo cliente aparece más de una vez en el archivo — «Usar la última fila» (default), «Usar la primera fila» or «Rechazar todas sus filas». Rows not used remain as a warning in the report.",
              "Si el cliente ya existe y tiene el dato — «Reemplazarlo con el del archivo» (default), «Completarlo solo si está vacío» or «No tocarlo». It applies to basic data and additional information.",
              "Si una celda viene vacía en el archivo — «No borrar el dato existente» (default) or «Borrar el dato existente». Empty usually means the value did not come: delete only if the file is the complete source of the customer.",
              "Contactos de un cliente que ya existe — «Sumar los nuevos y actualizar los que ya tiene» (default), «Sumar los nuevos y dejar como están los que ya tiene» or «Sobrescribir: reemplazar todos por los del archivo». «Actualizar» changes the description, type or main mark of a contact that already existed; «Sobrescribir» deletes the contacts that are not in the file.",
            ],
          },
          {
            tipo: "nota",
            texto:
              "These rules apply to the whole import. Rows with errors are never imported: they stay in the report.",
          },
        ],
      },
      {
        id: "importar-revision",
        titulo: "Step 7. Review",
        bloques: [
          {
            tipo: "p",
            texto:
              "Last check before importing. It shows the file and its configuration, and the totals:",
          },
          {
            tipo: "lista",
            items: [
              "Filas en el archivo (rows in the file).",
              "Clientes a crear (customers to create).",
              "Clientes a actualizar (customers to update).",
              "Filas con errores (no se importan) (rows with errors, not imported).",
              "Advertencias (se importan sin ese dato) (warnings, imported without that value).",
            ],
          },
          {
            tipo: "p",
            texto:
              "You also see «Cómo se va a cargar» (how customers are recognized, the chosen options and how many columns go to basic data, contacts, existing fields or are not imported), the «Campos nuevos que se van a crear» and «Ejemplos de errores y advertencias». With «Descargar el detalle de errores y advertencias (CSV)» you download the detail.",
          },
          {
            tipo: "lista",
            items: [
              "Error — The row is not imported. Examples: the value used to recognize the customer is missing, it matches more than one existing customer, or it has no valid contact.",
              "Warning — The customer is imported, but without that value. Examples: an amount, an email or a date with an invalid format.",
            ],
          },
          {
            tipo: "p",
            texto:
              "To import, click «Importar solo los válidos». «Importación en curso» appears: you are notified when it finishes. From there you can choose «Importar otro archivo» or «Volver a clientes».",
          },
        ],
      },
      {
        id: "reglas",
        titulo: "Rules and relationships",
        bloques: [
          {
            tipo: "lista",
            items: [
              "Customer uniqueness — A new customer is not created if it matches an existing one according to the field you choose in «Cómo reconocer a un cliente que ya existe»: the existing one is updated.",
              "Tag uniqueness — The name is unique regardless of case.",
              "Deleting a tag — It is removed from every customer that has it.",
              "Work groups — Each group defines which record data its agents see and edit in Hermes. Additional information is built from the fields created in imports.",
              "Deleting a customer — Removes the customer. It asks for confirmation first, because it cannot be undone.",
            ],
          },
        ],
      },
      {
        id: "consejos",
        titulo: "Tips and common mistakes",
        bloques: [
          {
            tipo: "lista",
            items: [
              "If in the «Archivo» step you see a single huge column, the field separator is not the file's. Try «;», «,», «|» or tab.",
              "If accents or ñ look odd, change the «Codificación».",
              "If you choose «ID externo» to recognize customers, make sure you mapped it in «Datos básicos»: otherwise it does not show in the list.",
              "Before using «Borrar el dato existente», confirm the file has all the customer's data. An empty cell would delete what was already there.",
              "With many columns, use «Importar todas las columnas» and turn off the ones you do not want.",
              "Use the column name as «Nombre en el sistema» only if it works for you: it is what agents will see.",
            ],
          },
        ],
      },
    ],
  },
};
