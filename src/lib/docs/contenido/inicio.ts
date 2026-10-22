import type { ContenidoPagina } from "@/lib/docs/tipos";

// Primera página de la documentación: qué es Olimpo y cómo se organiza.
export const contenido: ContenidoPagina = {
  "es": {
    "titulo": "Qué es Olimpo",
    "resumen": "Olimpo es donde tu equipo configura todo lo que la operación necesita para atender a tus clientes.",
    "secciones": [
      {
        "id": "que-es",
        "titulo": "Qué es y para qué sirve",
        "bloques": [
          {
            "tipo": "p",
            "texto": "Olimpo es la aplicación donde se administra la operación de atención. Quienes supervisan y administran la usan para definir cómo se atiende a los clientes: qué campañas existen, por qué cuentas entran y salen, a quién se atiende y quiénes lo hacen."
          },
          {
            "tipo": "p",
            "texto": "Lo que se configura acá es lo que después usan los agentes en Hermes, la aplicación donde se atienden las interacciones en vivo."
          }
        ]
      },
      {
        "id": "moverse",
        "titulo": "Cómo moverte por la aplicación",
        "bloques": [
          {
            "tipo": "lista",
            "items": [
              "Menú lateral — Lista las secciones de Olimpo. Se contrae y se expande con el botón de arriba o con ⌘B (Ctrl+B). Al pie están Documentación y Configuración.",
              "Buscar — En la barra superior, o con ⌘K (Ctrl+K): llega a cualquier sección o a un registro puntual por su nombre, sin importar dónde estés.",
              "Modo claro u oscuro — Cambia cómo se ve la interfaz.",
              "Idioma — Español, inglés, portugués o catalán. Se aplica al instante y solo para vos.",
              "Aplicaciones — El selector de la barra superior para pasar de una aplicación a otra.",
              "Cuenta — Abre tu perfil y permite cerrar la sesión."
            ]
          }
        ]
      },
      {
        "id": "secciones",
        "titulo": "Las secciones de Olimpo",
        "bloques": [
          {
            "tipo": "p",
            "texto": "Esta documentación sigue el orden del menú, agrupada por tema:"
          },
          {
            "tipo": "lista",
            "items": [
              "Campañas — Tus campañas, agrupadas por proyecto.",
              "Clientes — La base de clientes.",
              "Cuentas — Las cuentas por las que entran y salen las interacciones, y el flujo con el que se atiende cada una.",
              "Clasificaciones y Marcas — Cómo se califican las interacciones.",
              "Feriados y Listas de exclusión — Los calendarios y las restricciones de contacto.",
              "Usuarios, Grupos y roles y Estados auxiliares — Quiénes operan, con qué permisos y qué estados pueden tomar.",
              "Claves de acceso API — Las claves que permiten que otro sistema de tu empresa, como tu página web, se conecte."
            ]
          }
        ]
      },
      {
        "id": "relaciones",
        "titulo": "Qué se relaciona con qué",
        "bloques": [
          {
            "tipo": "p",
            "texto": "Las secciones no son islas: configurar una suele depender de otra. Las relaciones más importantes:"
          },
          {
            "tipo": "lista",
            "items": [
              "Cuenta → Campaña — En el flujo de una cuenta, la Derivación a campaña elige entre tus campañas. Antes de armar el flujo conviene que la campaña de destino exista.",
              "Campaña → Cuenta saliente — Para salir, una campaña usa cuentas; el detalle está en la documentación de Campañas.",
              "Clave de acceso API → Tu sistema — Las capacidades de una clave (chat, videollamada, webcall, clientes) definen qué puede hacer el sistema que la usa."
            ]
          },
          {
            "tipo": "nota",
            "texto": "Cada página de esta documentación explica, además, de qué depende su sección y qué otras se ven afectadas al cambiarla."
          }
        ]
      },
      {
        "id": "ayuda-en-pantalla",
        "titulo": "Ayuda dentro de las pantallas",
        "bloques": [
          {
            "tipo": "p",
            "texto": "En el editor de flujo de una cuenta, cada macroestado tiene un botón con una «i»: abre en otra pestaña la sección de esa documentación que lo explica, sin que pierdas el flujo que estás armando."
          }
        ]
      }
    ]
  },
  "en": {
    "titulo": "What Olimpo is",
    "resumen": "Olimpo is where your team configures everything the operation needs to serve your customers.",
    "secciones": [
      {
        "id": "que-es",
        "titulo": "What it is and what it is for",
        "bloques": [
          {
            "tipo": "p",
            "texto": "Olimpo is the application where the service operation is managed. The people who supervise and manage it use it to define how customers are served: which campaigns exist, which accounts interactions come in and go out through, who is served and who serves them."
          },
          {
            "tipo": "p",
            "texto": "What is configured here is what agents later use in Hermes, the application where interactions are handled live."
          }
        ]
      },
      {
        "id": "moverse",
        "titulo": "Getting around the application",
        "bloques": [
          {
            "tipo": "lista",
            "items": [
              "Side menu — Lists Olimpo's sections. It collapses and expands with the button at the top or with ⌘B (Ctrl+B). Documentation and Settings are at the bottom.",
              "Search — In the top bar, or with ⌘K (Ctrl+K): reaches any section or a specific record by name, wherever you are.",
              "Light or dark mode — Changes how the interface looks.",
              "Language — Spanish, English, Portuguese or Catalan. It applies instantly and only for you.",
              "Applications — The top bar selector to switch from one application to another.",
              "Account — Opens your profile and lets you sign out."
            ]
          }
        ]
      },
      {
        "id": "secciones",
        "titulo": "Olimpo's sections",
        "bloques": [
          {
            "tipo": "p",
            "texto": "This documentation follows the menu order, grouped by topic:"
          },
          {
            "tipo": "lista",
            "items": [
              "Campaigns — Your campaigns, grouped by project.",
              "Customers — The customer base.",
              "Accounts — The accounts interactions come in and go out through, and the flow each one is handled with.",
              "Classifications and Marks — How interactions are qualified.",
              "Holidays and Exclusion lists — Calendars and contact restrictions.",
              "Users, Groups and roles and Auxiliary states — Who operates, with which permissions and which states they can take.",
              "API access keys — The keys that let another system of your company, such as your website, connect."
            ]
          }
        ]
      },
      {
        "id": "relaciones",
        "titulo": "What relates to what",
        "bloques": [
          {
            "tipo": "p",
            "texto": "Sections are not islands: configuring one often depends on another. The most important relationships:"
          },
          {
            "tipo": "lista",
            "items": [
              "Account → Campaign — In an account's flow, Campaign routing picks among your campaigns. It is best for the destination campaign to exist before building the flow.",
              "Campaign → Outbound account — To place calls out, a campaign uses accounts; the details are in the Campaigns documentation.",
              "API access key → Your system — A key's capabilities (chat, video call, webcall, customers) define what the system that uses it can do."
            ]
          },
          {
            "tipo": "nota",
            "texto": "Each page of this documentation also explains what its section depends on and which others are affected when it changes."
          }
        ]
      },
      {
        "id": "ayuda-en-pantalla",
        "titulo": "Help inside the screens",
        "bloques": [
          {
            "tipo": "p",
            "texto": "In an account's flow editor, each macrostate has a button with an «i»: it opens, in another tab, the section of this documentation that explains it, without losing the flow you are building."
          }
        ]
      }
    ]
  }
};
