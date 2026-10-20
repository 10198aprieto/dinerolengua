# La Hucha de Lengua

Contador público de multas para las clases de Lengua de 3.º y 4.º de ESO del **Centro Cultural Vallisoletano (CCV)**.

🌐 **Web:** [dinerolengua.es](https://www.dinerolengua.es)

## ¿Qué es?

La Hucha de Lengua es una iniciativa educativa de aula: se ponen pequeñas multas por usar palabrotas o muletillas acordadas, interrumpir sin necesidad las explicaciones o faltar al respeto a un compañero. No es un castigo, sino una forma de tomar conciencia de cómo hablamos y de cuidar el ambiente de clase.

Lo recaudado se destina a un desayuno de final de curso y, lo que sobre, a una causa solidaria con la ONGD SED (Solidaridad, Educación y Desarrollo). Las normas completas están en la página de [Metodología](https://www.dinerolengua.es/metodologia) de la web.

Esta web lleva la cuenta: cualquiera puede consultar lo recaudado y lo pendiente de cada clase, y el profesorado gestiona los registros desde un panel privado.

## Funcionalidades

- **Contador público** por clase (3.º A, 4.º A, 4.º B y 4.º C) con importe recaudado, pendiente y total, e historial filtrable por «Todas», «Pendientes» y «Pagadas».
- **Panel privado para el profesorado**, con inicio de sesión y registros protegidos por profesor: alta, edición, pago, filtros y eliminación de multas, con importe libre en euros y botón rápido de +0,10 €.
- **Fichas de alumno** con correo electrónico y desplegable de alumnos al poner una multa.
- **Recordatorios por correo** enviados con Resend: avisos a los alumnos, resumen semanal al profesor y botón manual junto a cada alumno.
- **Cuentas de profesor** mediante código de invitación, y delegados por clase con sus propios códigos.
- **Animación de hucha** con monedas y sonido al añadir una multa.
- **Páginas legales** (aviso legal, privacidad, cookies y términos de uso) y consentimiento de cookies previo a la analítica.

> La lista de funcionalidades se ha elaborado a partir de [`roadmap.md`](roadmap.md).

## Tecnologías

| Área | Herramientas |
| --- | --- |
| Framework | [TanStack Start](https://tanstack.com/start) + [TanStack Router](https://tanstack.com/router) y [React 19](https://react.dev) |
| Lenguaje y build | TypeScript y [Vite](https://vite.dev) |
| Estilos | [Tailwind CSS 4](https://tailwindcss.com), componentes [shadcn/ui](https://ui.shadcn.com) (Radix UI) e iconos de Lucide |
| Datos y autenticación | [Supabase](https://supabase.com) (`@supabase/supabase-js`) |
| Formularios y datos | React Hook Form, Zod y TanStack Query |
| Correo | [Resend](https://resend.com) |
| Analítica | Firebase Analytics |
| Despliegue | [Vercel](https://vercel.com) |
| Calidad | ESLint y Prettier |

El proyecto se creó con [Lovable](https://lovable.dev) y se sigue desarrollando sobre este repositorio.

## Estructura del repositorio

```
├── .lovable/        Configuración de Lovable
├── public/          Recursos estáticos (iconos, imágenes, audio)
├── src/             Código de la aplicación
├── supabase/        Configuración y migraciones de Supabase
├── GUIA-VERCEL.md   Guía de despliegue en Vercel
├── roadmap.md       Historial de tareas y funcionalidades
└── AGENTS.md        Instrucciones para asistentes de código
```

## Puesta en marcha en local

Requisitos: [Node.js](https://nodejs.org) y [npm](https://www.npmjs.com) (o [Bun](https://bun.sh), ya que el repositorio incluye `bun.lock`).

```bash
git clone https://github.com/10198aprieto/dinerolengua.git
cd dinerolengua
npm install      # o: bun install
cp .env.example .env   # y rellena las variables (ver abajo)
npm run dev
```

### Scripts disponibles

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Compilación de producción |
| `npm run build:dev` | Compilación en modo desarrollo |
| `npm run preview` | Vista previa de la compilación |
| `npm run lint` | Revisión con ESLint |
| `npm run format` | Formateo con Prettier |

## Variables de entorno

Crea un archivo `.env` en la raíz (no lo subas al repositorio) o configúralas en el panel de Vercel.

| Variable | Descripción | ¿Secreta? |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | URL del proyecto de Supabase (cliente) | No |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Clave pública (anon) de Supabase (cliente) | No |
| `SUPABASE_URL` | URL del proyecto de Supabase (servidor) | No |
| `SUPABASE_PUBLISHABLE_KEY` | Clave pública de Supabase (servidor) | No |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave `service_role` de Supabase | **Sí** |
| `RESEND_API_KEY` | Clave de la API de Resend para los correos | **Sí** |
| `TEACHER_INVITE_CODE` | Código para crear cuentas de profesor | **Sí** |
| `GOOGLE_API_KEY` | Clave de Firebase | Sí |
| `GOOGLE_ANALYTICS_MEASUREMENT_ID` | ID de medición de Analytics (`G-XXXXXXXXXX`) | No |

> **Importante:** las variables marcadas como secretas nunca deben escribirse en el repositorio, ni en la documentación ni en archivos de ejemplo. Un archivo `.env.example` solo debe contener los nombres con valores vacíos.

## Despliegue

La web se publica en Vercel y la compilación ya está preparada. Los pasos completos (importar el repositorio, variables de entorno, dominio propio y correos programados) están en [`GUIA-VERCEL.md`](GUIA-VERCEL.md).

## Privacidad

La web gestiona datos de alumnado menor de edad (nombres, importes y correos electrónicos). Consulta la [política de privacidad](https://www.dinerolengua.es/politica-de-privacidad) y el [aviso legal](https://www.dinerolengua.es/aviso-legal) para saber qué datos se tratan y con qué finalidad.

## Contribuir

1. Haz un fork del repositorio y crea una rama (`git checkout -b mi-mejora`).
2. Asegúrate de que `npm run lint` y `npm run build` pasan sin errores.
3. Abre una *pull request* explicando el cambio.

## Autoría

Diseño y creación por **Mateo Fernández Prieto**.

## Licencia

Pendiente de definir. Mientras no se añada un archivo `LICENSE`, todos los derechos están reservados.
