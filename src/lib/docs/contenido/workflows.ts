import type { ContenidoPagina } from "@/lib/docs/tipos";

// Flujo de las cuentas: el editor de workflows y sus macroestados. Las anclas de
// cada macroestado (reproducir, capturar, condicion, segun-valor, consulta-http,
// calcular, derivacion) son a las que apunta el botón de información del editor.
export const contenido: ContenidoPagina = {
  "es": {
    "titulo": "Flujo de las cuentas",
    "resumen": "Cómo armar el flujo de una cuenta: qué hace cada macroestado, cómo se usan las variables y cómo escribir expresiones.",
    "secciones": [
      {
        "id": "como-se-arma",
        "titulo": "Cómo se arma un flujo",
        "bloques": [
          {
            "tipo": "p",
            "texto": "El flujo de una cuenta decide cómo se atiende cada interacción. Arranca en «Inicio de interacción» y sigue de macroestado en macroestado hasta que termina, normalmente en una «Derivación a campaña»."
          },
          {
            "tipo": "p",
            "texto": "Cada macroestado tiene salidas con nombre (por ejemplo Éxito y Error). Cada salida va a un solo destino: para abrir caminos se usan Condición y Según valor. Una salida sin conectar corta ese camino."
          },
          {
            "tipo": "p",
            "texto": "El botón de información de cada macroestado abre su sección de esta página."
          }
        ]
      },
      {
        "id": "variables",
        "titulo": "Variables",
        "bloques": [
          {
            "tipo": "p",
            "texto": "Una variable guarda un dato mientras dura la interacción. Nacen cuando un macroestado las llena: Capturar guarda lo que escribe o marca el cliente, Consulta HTTP guarda la respuesta del servicio y Calcular guarda el resultado de una expresión."
          },
          {
            "tipo": "p",
            "texto": "El nombre usa letras, números y guion bajo, y no empieza con un número."
          },
          {
            "tipo": "p",
            "texto": "Para usar una variable dentro de un texto, una URL, un encabezado o un cuerpo se escribe entre llaves dobles: {{ documento }}. Dentro de una expresión CEL se usa solo el nombre: documento."
          },
          {
            "tipo": "p",
            "texto": "Lo que captura el cliente siempre es texto. Para comparar o calcular con números hay que convertirlo: int(opcion)."
          }
        ]
      },
      {
        "id": "cel",
        "titulo": "Fórmulas (expresiones CEL)",
        "bloques": [
          {
            "tipo": "p",
            "texto": "Una expresión es una fórmula chica que calcula un valor a partir de las variables, sin cambiar nada por su cuenta. Se escribe en un lenguaje llamado CEL; no hace falta conocerlo, con los ejemplos de esta página alcanza para los casos más comunes. Se usa en Condición, Según valor (modo Avanzado) y Calcular."
          },
          {
            "tipo": "p",
            "texto": "Operadores: + - * / % para cuentas, == != < <= > >= para comparar, && (y), || (o) y ! (no). Para elegir un valor según una condición: condicion ? si_si : si_no."
          },
          {
            "tipo": "p",
            "texto": "Cuidados que evitan la mayoría de los errores:\n• La división de enteros descarta los decimales: 10 / 4 da 2. Para decimales, usá números con punto: 10.0 / 4.0.\n• No se mezclan enteros y decimales en una misma cuenta: convertí con int() o double().\n• Lo que llega de Capturar es texto: int(opcion) antes de comparar con un número.\n• Para unir textos se usa +, y los números se convierten con string().\n• Si el servicio puede no devolver un campo, preguntá antes con has(respuesta.body.saldo)."
          },
          {
            "tipo": "p",
            "texto": "Si una expresión falla al evaluarse, el macroestado sale por Error."
          },
          {
            "tipo": "sub",
            "texto": "Ejemplos"
          },
          {
            "tipo": "codigo",
            "items": [
              "Comparar: opcion == \"1\" && intentos < 3",
              "Convertir y operar: int(saldo) - int(pago)",
              "Unir texto: \"Su saldo es \" + string(total)",
              "Texto: documento.startsWith(\"20\") || documento.size() == 8",
              "Elegir un valor: total > 1000 ? \"alto\" : \"bajo\""
            ]
          }
        ]
      },
      {
        "id": "reproducir",
        "titulo": "Reproducir",
        "bloques": [
          {
            "tipo": "p",
            "texto": "Reproduce un audio en la llamada. En las cuentas de chat, videollamada y webcall se llama «Enviar mensaje» y envía un mensaje: texto, botones, una lista de opciones, un carrusel, una imagen o un archivo."
          },
          {
            "tipo": "sub",
            "texto": "Opciones"
          },
          {
            "tipo": "lista",
            "items": [
              "Qué reproduce — Audio. Texto a voz (TTS) todavía no está disponible. En cuentas de texto es siempre Texto.",
              "Audio — Se sube un archivo y se puede escuchar desde el macroestado.",
              "Se puede interrumpir marcando una tecla — Con el tilde, una tecla corta el audio y el flujo sigue al instante; la tecla la recibe el Capturar siguiente. Sin el tilde, el audio se escucha completo.",
              "Tipo de mensaje — Solo en cuentas de texto: Texto, Botones, Lista de opciones, Carrusel o Imagen o archivo. Cada tipo muestra sus propios campos.",
              "Espera (s) — Con Botones, Lista de opciones o Carrusel: cuánto se espera la elección antes de salir por Sin respuesta.",
              "Mensaje — El texto que recibe el cliente. En Botones y Lista de opciones es el texto que acompaña a las opciones, y en Texto es el mensaje completo. En Carrusel es el mensaje que acompaña a las tarjetas. Hasta 4096 caracteres en Texto y en Lista de opciones, y hasta 1024 en Botones y en Carrusel."
            ]
          },
          {
            "tipo": "sub",
            "texto": "Tipos de mensaje"
          },
          {
            "tipo": "lista",
            "items": [
              "Texto — Un mensaje de texto.",
              "Botones — Hasta 3 botones debajo del mensaje. Cada uno tiene un título de hasta 20 caracteres, que es lo que lee la persona, y su propia salida en el macroestado. Los títulos no se pueden repetir. Las opciones se numeran (1, 2, 3; en el carrusel, tarjeta.botón: 1.1, 1.2, 2.1) y la salida lleva ese número.",
              "Lista de opciones — Un menú de hasta 10 opciones. Se completa el texto del botón que abre la lista (hasta 20 caracteres) y, por cada opción, su título (hasta 24 caracteres) y, si se quiere, una descripción de hasta 72 caracteres. Cada opción tiene su propia salida en el macroestado.",
              "Carrusel — De 2 a 10 tarjetas que la persona recorre deslizando, con un mensaje que las acompaña. Cada tarjeta tiene una imagen (obligatoria), un texto opcional de hasta 160 caracteres y 2 saltos de línea, y de 1 a 2 botones con título de hasta 20 caracteres. Todas las tarjetas tienen que tener la misma cantidad de botones. Cada botón tiene su propia salida en el macroestado, numerada tarjeta.botón.",
              "Imagen o archivo — Se elige si se envía una Imagen o un Archivo, se sube desde el macroestado y se puede sumar un texto de hasta 1024 caracteres que lo acompañe. Se usa, por ejemplo, para cerrar un camino de autogestión con una imagen de instrucciones o un documento con los pasos a seguir.",
              "Imágenes admitidas — JPG, JPEG y PNG, de hasta 5 MB.",
              "Archivos admitidos — PDF, DOC, DOCX, XLS, XLSX y TXT, de hasta 100 MB."
            ]
          },
          {
            "tipo": "p",
            "texto": "Con Botones, Lista de opciones o Carrusel el macroestado espera a que la persona elija, y el flujo sigue por la salida de la opción que tocó: se conecta cada salida al paso que corresponde, sin necesitar un Condición ni un Según valor. Si el canal no puede mostrar un tipo de mensaje, la persona lo recibe como texto con las opciones numeradas y puede responder con el número."
          },
          {
            "tipo": "sub",
            "texto": "Salidas"
          },
          {
            "tipo": "lista",
            "items": [
              "Siguiente — El audio terminó o se interrumpió, o el mensaje se envió (Texto e Imagen o archivo).",
              "Una salida por opción — Con Botones, Lista de opciones o Carrusel: el flujo sigue por la salida de lo que la persona eligió.",
              "Otra respuesta — Con Botones, Lista de opciones o Carrusel: la persona escribió en vez de elegir.",
              "Sin respuesta — Con Botones, Lista de opciones o Carrusel: pasó la espera sin que la persona eligiera ni escribiera.",
              "Error — No se pudo reproducir o enviar."
            ]
          }
        ]
      },
      {
        "id": "capturar",
        "titulo": "Capturar dígitos y Capturar texto",
        "bloques": [
          {
            "tipo": "p",
            "texto": "Espera un dato del cliente y lo guarda en una variable. En telefonía captura dígitos del teclado; en chat, videollamada y webcall captura el próximo mensaje de texto."
          },
          {
            "tipo": "sub",
            "texto": "Opciones"
          },
          {
            "tipo": "lista",
            "items": [
              "Guardar en la variable — Dónde queda el dato.",
              "Dígitos mínimos — De 1 a 20. Solo en telefonía.",
              "Tecla de fin — Ninguna, # o *. Con tecla de fin, la captura termina al marcarla (si ya llegó al mínimo); sin ella, al llegar al mínimo.",
              "Espera (s) — Telefonía: el silencio máximo. Texto: cuánto se espera el mensaje.",
              "Reintentos — Cuántas veces se repite la captura antes de salir por Sin respuesta."
            ]
          },
          {
            "tipo": "sub",
            "texto": "Salidas"
          },
          {
            "tipo": "lista",
            "items": [
              "Completo — Ya hay dato.",
              "Sin respuesta — Se agotaron la espera y los reintentos.",
              "Error — No se pudo capturar."
            ]
          }
        ]
      },
      {
        "id": "condicion",
        "titulo": "Condición",
        "bloques": [
          {
            "tipo": "p",
            "texto": "Sigue por Sí o por No según se cumpla una condición. En modo Simple se elige una variable, un operador y un valor. En modo Avanzado (CEL) se escribe una expresión que da verdadero o falso."
          },
          {
            "tipo": "sub",
            "texto": "Opciones"
          },
          {
            "tipo": "lista",
            "items": [
              "Simple — Variable, operador (==, !=, >, <, >=, <= o contiene) y valor.",
              "Avanzado (CEL) — Una expresión que da verdadero o falso. Ver Fórmulas (expresiones CEL)."
            ]
          },
          {
            "tipo": "sub",
            "texto": "Salidas"
          },
          {
            "tipo": "lista",
            "items": [
              "Sí — La condición se cumple.",
              "No — No se cumple."
            ]
          },
          {
            "tipo": "sub",
            "texto": "Ejemplos"
          },
          {
            "tipo": "codigo",
            "items": [
              "opcion == \"1\" && intentos < 3",
              "respuesta.status == 200 && respuesta.body.saldo > 0"
            ]
          }
        ]
      },
      {
        "id": "segun-valor",
        "titulo": "Según valor",
        "bloques": [
          {
            "tipo": "p",
            "texto": "Sigue por una salida distinta según el valor de una variable, con una salida por cada opción y una más para cualquier otro valor. Quitar una opción también quita su conexión y no mueve las demás. En modo Avanzado (CEL), lo que se compara con las opciones es el resultado de una expresión."
          },
          {
            "tipo": "sub",
            "texto": "Opciones"
          },
          {
            "tipo": "lista",
            "items": [
              "Opciones — Cada una con su valor; cada una tiene su salida."
            ]
          },
          {
            "tipo": "sub",
            "texto": "Salidas"
          },
          {
            "tipo": "lista",
            "items": [
              "Otro valor — Cuando ninguna opción coincide."
            ]
          },
          {
            "tipo": "sub",
            "texto": "Ejemplos"
          },
          {
            "tipo": "codigo",
            "items": [
              "int(opcion) % 3"
            ]
          }
        ]
      },
      {
        "id": "consulta-http",
        "titulo": "Consulta HTTP",
        "bloques": [
          {
            "tipo": "p",
            "texto": "Le pide un dato a otro sistema de tu empresa (por ejemplo, donde guardás los saldos de tus clientes) y guarda la respuesta en una variable. Sirve para traer un dato del cliente (un saldo, un estado) o para avisarle algo a ese sistema. «HTTP» es la forma estándar en que los sistemas se piden datos entre sí; quien se encarga de tus sistemas te pasa la dirección y los datos que hay que enviar. Funciona igual en todos los canales."
          },
          {
            "tipo": "p",
            "texto": "La respuesta queda en la variable como un par: status (el código de la respuesta) y body (el contenido de la respuesta, ya ordenado en campos cuando el sistema lo envía así). Se lee con un punto: respuesta.status, respuesta.body.saldo."
          },
          {
            "tipo": "p",
            "texto": "No reintenta: lo que pasa cuando falla lo decide quien arma el flujo, conectando Error y Sin respuesta."
          },
          {
            "tipo": "sub",
            "texto": "Opciones"
          },
          {
            "tipo": "lista",
            "items": [
              "Método — GET, POST, PUT, PATCH o DELETE.",
              "URL — La dirección del sistema al que se le pide el dato. Admite variables: https://api.cliente.com/saldo/{{ documento }}.",
              "Encabezados — Pares de nombre y valor. El valor admite variables.",
              "Cuerpo (JSON) — Los datos que le mandás al otro sistema, escritos en formato JSON. Solo con POST, PUT y PATCH. Admite variables.",
              "Guardar respuesta en — La variable donde queda la respuesta.",
              "Espera (s) — De 1 a 30. Por defecto, 5."
            ]
          },
          {
            "tipo": "sub",
            "texto": "Salidas"
          },
          {
            "tipo": "lista",
            "items": [
              "Éxito — El sistema respondió que todo salió bien (un código 2xx).",
              "Error — Respondió con otro código o no se pudo conectar. Con otro código, la respuesta igual queda en la variable.",
              "Sin respuesta — Venció la espera."
            ]
          },
          {
            "tipo": "sub",
            "texto": "Ejemplos"
          },
          {
            "tipo": "codigo",
            "items": [
              "GET  https://api.cliente.com/saldo/{{ documento }}  →  variable: respuesta",
              "Después, en una Condición: respuesta.status == 200 && respuesta.body.saldo > 0"
            ]
          }
        ]
      },
      {
        "id": "calcular",
        "titulo": "Calcular",
        "bloques": [
          {
            "tipo": "p",
            "texto": "Guarda en variables el resultado de fórmulas (expresiones CEL). Sirve para sumar, restar, armar un texto o trabajar con fechas a partir de lo que el flujo ya sabe."
          },
          {
            "tipo": "p",
            "texto": "Cada cálculo tiene una variable de destino y una expresión. Se evalúan en orden: cada uno ve el resultado de los anteriores. Si la variable ya existe, se sobrescribe."
          },
          {
            "tipo": "p",
            "texto": "Si una expresión falla (por ejemplo, un texto que no es un número), el macroestado sale por Error y los cálculos anteriores se conservan."
          },
          {
            "tipo": "sub",
            "texto": "Opciones"
          },
          {
            "tipo": "lista",
            "items": [
              "Variable — Dónde se guarda el resultado.",
              "Expresión — Una expresión CEL sobre las variables del flujo. Ver Fórmulas (expresiones CEL)."
            ]
          },
          {
            "tipo": "sub",
            "texto": "Salidas"
          },
          {
            "tipo": "lista",
            "items": [
              "Siguiente — Se hicieron todos los cálculos.",
              "Error — Una expresión no se pudo evaluar."
            ]
          },
          {
            "tipo": "sub",
            "texto": "Ejemplos"
          },
          {
            "tipo": "codigo",
            "items": [
              "total = int(saldo) - int(pago)",
              "mensaje = \"Su saldo es \" + string(total)",
              "cuota = double(total) / 3.0"
            ]
          }
        ]
      },
      {
        "id": "derivacion",
        "titulo": "Derivación a campaña",
        "bloques": [
          {
            "tipo": "p",
            "texto": "Envía la interacción a una campaña para que la atienda un agente. Es el final del flujo: no tiene salidas de flujo."
          },
          {
            "tipo": "sub",
            "texto": "Opciones"
          },
          {
            "tipo": "lista",
            "items": [
              "Campaña — Se elige entre tus campañas."
            ]
          },
          {
            "tipo": "sub",
            "texto": "Salidas"
          },
          {
            "tipo": "lista",
            "items": [
              "Fuera de horario — Si la campaña está cerrada o es feriado, la interacción no deriva y sigue por acá, por ejemplo hacia otra campaña de guardia. Sin conectar, no se aplica ningún desvío."
            ]
          }
        ]
      }
    ]
  },
  "en": {
    "titulo": "Account flow",
    "resumen": "How to build an account's flow: what each macrostate does, how variables work and how to write expressions.",
    "secciones": [
      {
        "id": "como-se-arma",
        "titulo": "How a flow is built",
        "bloques": [
          {
            "tipo": "p",
            "texto": "An account's flow decides how each interaction is handled. It starts at \"Interaction start\" and goes from macrostate to macrostate until it ends, usually in a \"Campaign routing\"."
          },
          {
            "tipo": "p",
            "texto": "Each macrostate has named exits (for example Success and Error). Each exit goes to a single destination: to open several paths, use Condition and By value. An unconnected exit ends that path."
          },
          {
            "tipo": "p",
            "texto": "The information button on each macrostate opens its section on this page."
          }
        ]
      },
      {
        "id": "variables",
        "titulo": "Variables",
        "bloques": [
          {
            "tipo": "p",
            "texto": "A variable holds a piece of data for the duration of the interaction. They are created when a macrostate fills them: Collect saves what the customer types or presses, HTTP request saves the service's response and Calculate saves the result of an expression."
          },
          {
            "tipo": "p",
            "texto": "The name uses letters, digits and underscores, and does not start with a digit."
          },
          {
            "tipo": "p",
            "texto": "To use a variable inside a text, a URL, a header or a body, write it between double braces: {{ document }}. Inside a CEL expression, use just the name: document."
          },
          {
            "tipo": "p",
            "texto": "What the customer enters is always text. To compare or calculate with numbers, convert it: int(option)."
          }
        ]
      },
      {
        "id": "cel",
        "titulo": "Formulas (CEL expressions)",
        "bloques": [
          {
            "tipo": "p",
            "texto": "An expression is a small formula that computes a value from the variables without changing anything on its own. It is written in a language called CEL; you do not need to know it, the examples on this page cover the most common cases. It is used in Condition, By value (Advanced mode) and Calculate."
          },
          {
            "tipo": "p",
            "texto": "Operators: + - * / % for arithmetic, == != < <= > >= to compare, && (and), || (or) and ! (not). To pick a value by condition: condition ? if_yes : if_no."
          },
          {
            "tipo": "p",
            "texto": "Watch-outs that prevent most mistakes:\n• Integer division drops decimals: 10 / 4 gives 2. For decimals, use numbers with a point: 10.0 / 4.0.\n• Integers and decimals are not mixed in one operation: convert with int() or double().\n• What Collect returns is text: int(option) before comparing with a number.\n• Join texts with +, and convert numbers with string().\n• If the service may not return a field, check first with has(response.body.balance)."
          },
          {
            "tipo": "p",
            "texto": "If an expression fails while being evaluated, the macrostate leaves through Error."
          },
          {
            "tipo": "sub",
            "texto": "Examples"
          },
          {
            "tipo": "codigo",
            "items": [
              "Compare: option == \"1\" && attempts < 3",
              "Convert and operate: int(balance) - int(payment)",
              "Join text: \"Your balance is \" + string(total)",
              "Text: document.startsWith(\"20\") || document.size() == 8",
              "Pick a value: total > 1000 ? \"high\" : \"low\""
            ]
          }
        ]
      },
      {
        "id": "reproducir",
        "titulo": "Play",
        "bloques": [
          {
            "tipo": "p",
            "texto": "Plays an audio on the call. On chat, video call and webcall accounts it is called \"Send message\" and sends a message: text, buttons, an options list, a carousel, an image or a file."
          },
          {
            "tipo": "sub",
            "texto": "Options"
          },
          {
            "tipo": "lista",
            "items": [
              "What it plays — Audio. Text to speech (TTS) is not available yet. On text accounts it is always Text.",
              "Audio — A file is uploaded and can be played from the macrostate.",
              "Can be interrupted by pressing a key — When checked, a key stops the audio and the flow continues immediately; the next Collect receives the key. When unchecked, the audio plays in full.",
              "Message type — Text accounts only: Text, Buttons, Options list, Carousel or Image or file. Each type shows its own fields.",
              "Wait (s) — With Buttons, Options list or Carousel: how long to wait for the choice before leaving through No response.",
              "Message — The text the customer receives. With Buttons and Options list it is the text that goes with the options, and with Text it is the whole message. With Carousel it is the message that goes with the cards. Up to 4096 characters for Text and Options list, and up to 1024 for Buttons and Carousel."
            ]
          },
          {
            "tipo": "sub",
            "texto": "Message types"
          },
          {
            "tipo": "lista",
            "items": [
              "Text — A text message.",
              "Buttons — Up to 3 buttons below the message. Each has a title of up to 20 characters, which is what the person reads, and its own exit on the macrostate. Titles cannot be repeated. Options are numbered (1, 2, 3; in the carousel, card.button: 1.1, 1.2, 2.1) and the exit carries that number.",
              "Options list — A menu of up to 10 options. You fill in the text of the button that opens the list (up to 20 characters) and, for each option, its title (up to 24 characters) and, if you want, a description of up to 72 characters. Each option has its own exit on the macrostate.",
              "Carousel — From 2 to 10 cards the person swipes through, with a message that goes with them. Each card has an image (required), an optional text of up to 160 characters and 2 line breaks, and 1 to 2 buttons with a title of up to 20 characters. All cards must have the same number of buttons. Each button has its own exit on the macrostate, numbered card.button.",
              "Image or file — You choose whether to send an Image or a File, upload it from the macrostate and can add a text of up to 1024 characters that goes with it. It is used, for example, to close a self-service path with an image of instructions or a document with the steps to follow.",
              "Accepted images — JPG, JPEG and PNG, up to 5 MB.",
              "Accepted files — PDF, DOC, DOCX, XLS, XLSX and TXT, up to 100 MB."
            ]
          },
          {
            "tipo": "p",
            "texto": "With Buttons, Options list or Carousel the macrostate waits for the person to choose, and the flow continues through the exit of the option they tapped: each exit is connected to the step it corresponds to, with no need for a Condition or By value. If the channel cannot show a message type, the person receives it as text with numbered options and can reply with the number."
          },
          {
            "tipo": "sub",
            "texto": "Exits"
          },
          {
            "tipo": "lista",
            "items": [
              "Next — The audio ended or was interrupted, or the message was sent (Text and Image or file).",
              "One exit per option — With Buttons, Options list or Carousel: the flow continues through the exit of what the person chose.",
              "Other reply — With Buttons, Options list or Carousel: the person typed instead of choosing.",
              "No response — With Buttons, Options list or Carousel: the wait ended without the person choosing or typing.",
              "Error — It could not be played or sent."
            ]
          }
        ]
      },
      {
        "id": "capturar",
        "titulo": "Collect digits and Collect text",
        "bloques": [
          {
            "tipo": "p",
            "texto": "Waits for a piece of data from the customer and saves it in a variable. On telephony it collects keypad digits; on chat, video call and webcall it collects the next text message."
          },
          {
            "tipo": "sub",
            "texto": "Options"
          },
          {
            "tipo": "lista",
            "items": [
              "Save in variable — Where the data is kept.",
              "Minimum digits — From 1 to 20. Telephony only.",
              "End key — None, # or *. With an end key, collection ends when it is pressed (if the minimum was reached); without it, when the minimum is reached.",
              "Wait (s) — Telephony: the maximum silence. Text: how long the message is awaited.",
              "Retries — How many times collection is repeated before leaving through No response."
            ]
          },
          {
            "tipo": "sub",
            "texto": "Exits"
          },
          {
            "tipo": "lista",
            "items": [
              "Complete — There is data.",
              "No response — The wait and the retries ran out.",
              "Error — It could not be collected."
            ]
          }
        ]
      },
      {
        "id": "condicion",
        "titulo": "Condition",
        "bloques": [
          {
            "tipo": "p",
            "texto": "Continues through Yes or No depending on whether a condition is met. Simple mode picks a variable, an operator and a value. Advanced (CEL) mode takes an expression that gives true or false."
          },
          {
            "tipo": "sub",
            "texto": "Options"
          },
          {
            "tipo": "lista",
            "items": [
              "Simple — Variable, operator (==, !=, >, <, >=, <= or contains) and value.",
              "Advanced (CEL) — An expression that gives true or false. See Formulas (CEL expressions)."
            ]
          },
          {
            "tipo": "sub",
            "texto": "Exits"
          },
          {
            "tipo": "lista",
            "items": [
              "Yes — The condition is met.",
              "No — It is not met."
            ]
          },
          {
            "tipo": "sub",
            "texto": "Examples"
          },
          {
            "tipo": "codigo",
            "items": [
              "option == \"1\" && attempts < 3",
              "response.status == 200 && response.body.balance > 0"
            ]
          }
        ]
      },
      {
        "id": "segun-valor",
        "titulo": "By value",
        "bloques": [
          {
            "tipo": "p",
            "texto": "Continues through a different exit depending on a variable's value, with one exit per option and one more for any other value. Removing an option also removes its connection and does not move the others. In Advanced (CEL) mode, what is compared against the options is the result of an expression."
          },
          {
            "tipo": "sub",
            "texto": "Options"
          },
          {
            "tipo": "lista",
            "items": [
              "Options — Each with its value; each has its own exit."
            ]
          },
          {
            "tipo": "sub",
            "texto": "Exits"
          },
          {
            "tipo": "lista",
            "items": [
              "Other value — When no option matches."
            ]
          },
          {
            "tipo": "sub",
            "texto": "Examples"
          },
          {
            "tipo": "codigo",
            "items": [
              "int(option) % 3"
            ]
          }
        ]
      },
      {
        "id": "consulta-http",
        "titulo": "HTTP request",
        "bloques": [
          {
            "tipo": "p",
            "texto": "Asks another system of your company for a piece of data (for example, where you keep your customers' balances) and saves the answer in a variable. Use it to fetch a customer's data (a balance, a status) or to notify that system. «HTTP» is the standard way systems ask each other for data; whoever looks after your systems will give you the address and the data to send. It works the same on every channel."
          },
          {
            "tipo": "p",
            "texto": "The response is saved in the variable as a pair: status (the response code) and body (the content of the answer, already organized into fields when the system sends it that way). It is read with a dot: response.status, response.body.balance."
          },
          {
            "tipo": "p",
            "texto": "It does not retry: what happens on failure is up to whoever builds the flow, by connecting Error and No response."
          },
          {
            "tipo": "sub",
            "texto": "Options"
          },
          {
            "tipo": "lista",
            "items": [
              "Method — GET, POST, PUT, PATCH or DELETE.",
              "URL — The address of the system the data is requested from. Accepts variables: https://api.customer.com/balance/{{ document }}.",
              "Headers — Name and value pairs. The value accepts variables.",
              "Body (JSON) — The data you send to the other system, written in JSON format. Only with POST, PUT and PATCH. Accepts variables.",
              "Save response in — The variable where the response is kept.",
              "Wait (s) — From 1 to 30. Default 5."
            ]
          },
          {
            "tipo": "sub",
            "texto": "Exits"
          },
          {
            "tipo": "lista",
            "items": [
              "Success — The system answered that everything went well (a 2xx code).",
              "Error — It answered with another code or could not connect. With another code, the response is still saved in the variable.",
              "No response — The wait ran out."
            ]
          },
          {
            "tipo": "sub",
            "texto": "Examples"
          },
          {
            "tipo": "codigo",
            "items": [
              "GET  https://api.customer.com/balance/{{ document }}  →  variable: response",
              "Then, in a Condition: response.status == 200 && response.body.balance > 0"
            ]
          }
        ]
      },
      {
        "id": "calcular",
        "titulo": "Calculate",
        "bloques": [
          {
            "tipo": "p",
            "texto": "Saves the result of formulas (CEL expressions) in variables. Use it to add, subtract, build a text or work with dates from what the flow already knows."
          },
          {
            "tipo": "p",
            "texto": "Each calculation has a target variable and an expression. They are evaluated in order: each one sees the results of the previous ones. If the variable already exists, it is overwritten."
          },
          {
            "tipo": "p",
            "texto": "If an expression fails (for example, a text that is not a number), the macrostate leaves through Error and the previous calculations are kept."
          },
          {
            "tipo": "sub",
            "texto": "Options"
          },
          {
            "tipo": "lista",
            "items": [
              "Variable — Where the result is saved.",
              "Expression — A CEL expression over the flow's variables. See Formulas (CEL expressions)."
            ]
          },
          {
            "tipo": "sub",
            "texto": "Exits"
          },
          {
            "tipo": "lista",
            "items": [
              "Next — All calculations were done.",
              "Error — An expression could not be evaluated."
            ]
          },
          {
            "tipo": "sub",
            "texto": "Examples"
          },
          {
            "tipo": "codigo",
            "items": [
              "total = int(balance) - int(payment)",
              "message = \"Your balance is \" + string(total)",
              "installment = double(total) / 3.0"
            ]
          }
        ]
      },
      {
        "id": "derivacion",
        "titulo": "Campaign routing",
        "bloques": [
          {
            "tipo": "p",
            "texto": "Sends the interaction to a campaign so an agent handles it. It is the end of the flow: it has no flow exits."
          },
          {
            "tipo": "sub",
            "texto": "Options"
          },
          {
            "tipo": "lista",
            "items": [
              "Campaign — Chosen among your campaigns."
            ]
          },
          {
            "tipo": "sub",
            "texto": "Exits"
          },
          {
            "tipo": "lista",
            "items": [
              "Out of hours — If the campaign is closed or it is a holiday, the interaction is not routed and continues here, for example to another on-call campaign. Unconnected, no diversion is applied."
            ]
          }
        ]
      }
    ]
  }
};
