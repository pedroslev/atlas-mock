import type { ContenidoPagina } from "@/lib/docs/tipos";

// Plantillas de mensajes: catálogo, grupos, editor y uso desde Hermes.
export const contenido: ContenidoPagina = {
  es: {
    titulo: "Plantillas de mensajes",
    resumen:
      "Cómo dejar precargados los mensajes que tus asesores usan todo el tiempo en chat, email y SMS, agruparlos y asignarlos a tus campañas.",
    secciones: [
      {
        id: "que-es",
        titulo: "Qué es una plantilla de mensaje",
        bloques: [
          {
            tipo: "p",
            texto:
              "Una plantilla es un mensaje escrito de antemano que el asesor carga en el cuadro de mensaje de Hermes con un clic o escribiendo «/», lo ajusta si hace falta y lo envía: el saludo inicial, un pedido de datos, un aviso de demora, una propuesta con su archivo adjunto.",
          },
          {
            tipo: "p",
            texto:
              "Las plantillas se crean una sola vez en el «Catálogo» y se reutilizan. Un grupo de plantillas es el conjunto que ofrecés para trabajar, y el grupo es lo que se asigna a una campaña: en «Campañas», el campo «Grupo de plantillas» te deja elegirlo. Si no se asigna, la campaña hereda el del proyecto.",
          },
          { tipo: "p", texto: "La pantalla tiene dos solapas: «Grupos» y «Catálogo»." },
        ],
      },
      {
        id: "editor",
        titulo: "Crear o editar una plantilla",
        bloques: [
          {
            tipo: "p",
            texto:
              "La pantalla tiene dos partes: «Datos» (nombre, descripción, si está activa y en qué canales se ofrece) y «Mensaje» (el texto, las variables y los archivos). El mensaje se escribe una vez y Atlas lo adapta a lo que admite cada canal: en email, chat web y WhatsApp va con negrita, cursiva, tachado, listas y enlaces; en SMS y en las redes sociales va solo el texto. La vista previa queda al lado del mensaje y muestra cómo lo recibe el cliente («Chat y WhatsApp», «Redes», «Email», «SMS»), mientras lo escribís.",
          },
          { tipo: "sub", texto: "Campos" },
          {
            tipo: "lista",
            items: [
              "Nombre — Lo que busca el asesor en el selector.",
              "Descripción — Cuándo conviene usarla. El asesor la ve debajo del nombre.",
              "Activa — Inactiva no se ofrece al asesor, pero no se pierde.",
              "Canales en los que se ofrece — Los canales escritos: Chat, WhatsApp, Email, SMS y las redes sociales. Desmarcá los que no correspondan: una firma larga, por ejemplo, solo en email; una plantilla con imágenes, no en SMS.",
              "Asunto — Solo para email. Puede llevar variables.",
              "Mensaje — El texto, con la barra de formato (negrita, cursiva, tachado, lista, lista numerada, enlace y emoji) y los botones «Insertar variable» e «Insertar archivo». La barra tiene solo lo que WhatsApp, el chat web y el email muestran los tres; lo que solo entiende el email (colores, títulos, tablas) queda afuera para que el mismo mensaje sirva en todos los canales.",
              "Archivos — «Insertar archivo» abre el selector de archivos de tu equipo y deja el archivo dentro del texto, donde está el cursor. En chat sale como mensaje aparte en ese punto (texto, archivo, texto); en email va adjunto; SMS no los admite.",
            ],
          },
          { tipo: "sub", texto: "Variables" },
          {
            tipo: "p",
            texto:
              "Una variable es un dato que Atlas completa solo al cargar la plantilla: el nombre del cliente, su deuda, el nombre de la campaña, el del asesor. Se eligen de la lista «Insertar variable», agrupadas por origen (datos básicos, formas de contacto e información adicional del cliente; campaña; asesor); no hace falta escribir nada a mano. Las variables del cliente son los campos de su ficha, y ves solo los que tu grupo de trabajo puede ver en «Ficha del cliente».",
          },
          {
            tipo: "p",
            texto:
              "Si el cliente no tiene ese dato, la variable queda visible en el mensaje tal cual, igual que la ves en el editor, y Hermes avisa al asesor, que la completa a mano antes de enviar.",
          },
        ],
      },
      {
        id: "grupos",
        titulo: "Grupos y campañas",
        bloques: [
          {
            tipo: "p",
            texto:
              "Un grupo reúne plantillas del catálogo. Desde la edición del grupo, «Agregar del catálogo» suma plantillas existentes y la cruz las quita del grupo sin borrarlas. Una misma plantilla puede estar en varios grupos.",
          },
          {
            tipo: "p",
            texto:
              "Cada campaña tiene, como mucho, un grupo de plantillas. En la campaña, además, elegís la «Plantilla por defecto» para cada canal: Hermes la deja precargada en el cuadro de mensaje al abrir la conversación, con las variables ya resueltas. El asesor la revisa y la envía; nunca se envía sola.",
          },
          {
            tipo: "nota",
            texto:
              "Eliminar un grupo no borra sus plantillas, pero las campañas que lo usaban quedan sin grupo de plantillas hasta que les asignes otro.",
          },
        ],
      },
      {
        id: "hermes",
        titulo: "Cómo la usa el asesor",
        bloques: [
          {
            tipo: "pasos",
            items: [
              "En el cuadro de mensaje, escribe «/» (con el cuadro vacío) o toca el botón «Plantillas».",
              "Busca por nombre o por una palabra del mensaje. Arriba ve sus favoritas (estrella) y las que más usa.",
              "Elige una: el texto entra con los datos del cliente ya puestos y los archivos en su lugar, que al enviar salen como mensaje aparte. Si ya había texto escrito, elige entre «Insertar debajo» o «Reemplazar»: Enter reemplaza, Shift+Enter inserta debajo.",
              "Ajusta lo que quiera y envía con Enter.",
            ],
          },
          {
            tipo: "p",
            texto:
              "El asesor ve solo las plantillas activas del grupo de la campaña que se ofrecen en el canal de esa conversación.",
          },
        ],
      },
    ],
  },
};
