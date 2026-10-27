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
              "El mensaje se escribe una vez y Atlas lo adapta a lo que admite cada canal: en email y chat va con negrita, cursiva y listas; en SMS va solo el texto. La vista previa de la derecha muestra cómo lo recibe el cliente en cada canal elegido.",
          },
          { tipo: "sub", texto: "Campos" },
          {
            tipo: "lista",
            items: [
              "Nombre — Lo que busca el asesor en el selector.",
              "Descripción — Cuándo conviene usarla. El asesor la ve debajo del nombre.",
              "Activa — Inactiva no se ofrece al asesor, pero no se pierde.",
              "Canales en los que se ofrece — Chat, Email y SMS. Desmarcá los que no correspondan: una firma larga, por ejemplo, solo en email.",
              "Asunto — Solo para email. Puede llevar variables.",
              "Mensaje — El texto, con la barra de formato y el botón «Insertar variable».",
              "Archivos adjuntos — Viajan con el mensaje en los canales que lo permiten. SMS no admite adjuntos.",
            ],
          },
          { tipo: "sub", texto: "Variables" },
          {
            tipo: "p",
            texto:
              "Una variable es un dato que Atlas completa solo al cargar la plantilla: el nombre del cliente, su número de cliente, el nombre de la campaña, el del asesor. Se eligen de la lista «Insertar variable», agrupadas por origen (Cliente, Campaña, Asesor); no hace falta escribir nada a mano.",
          },
          {
            tipo: "p",
            texto:
              "Cada variable usada tiene un campo «Si falta el dato»: lo que se pone cuando el cliente no tiene ese dato. Por ejemplo, «Hola {{nombre}}» con respaldo «estimado cliente» queda «Hola estimado cliente». Si lo dejás vacío, la variable se omite. Si una variable no tiene dato ni respaldo, Hermes avisa al asesor antes de enviar.",
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
              "Elige una: el texto entra con los datos del cliente ya puestos y los adjuntos se suman debajo. Si ya había texto escrito, elige entre «Insertar debajo» o «Reemplazar».",
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
