# Guía: publicar La Hucha de Lengua en Vercel

La web ya está preparada para Vercel. Solo tienes que seguir estos pasos (unos 10 minutos). Necesitas una cuenta gratuita de **GitHub** y una de **Vercel**.

## 1. Lleva el código a GitHub

1. En Lovable, abre **Project Settings → Git** (integración con GitHub).
2. Conecta tu cuenta de GitHub y pulsa para sincronizar/subir el código.
3. El archivo `.env` de este proyecto no se sube (está excluido); los datos se pondrán directamente en Vercel en el paso 3.

## 2. Crea el proyecto en Vercel

1. Entra en [vercel.com](https://vercel.com) → **Add New… → Project**.
2. Autoriza a Vercel a ver tus repositorios y elige el de La Hucha de Lengua.
3. Vercel detecta la web y su funcionamiento automáticamente: **no cambies** los ajustes de compilación.
4. Antes de pulsar **Deploy**, despliega la sección **Environment Variables** y añade las variables de la tabla del paso 3.
5. Pulsa **Deploy** y espera a que termine.

## 3. Variables que hay que añadir en Vercel

| Nombre | Valor | De dónde sale |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | `https://pwucpqeyfjnptlcdozxp.supabase.co` | Ya te lo doy aquí |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3dWNwcWV5ZmpucHRsY2RvenhwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY1Mjk0NTcsImV4cCI6MjEwMjEwNTQ1N30.EBw_0GtND5Gwvc666vUZB2ax_2x9gMXXxlrwtZf2Ngs` | Ya te lo doy aquí (es público) |
| `SUPABASE_URL` | `https://pwucpqeyfjnptlcdozxp.supabase.co` | Igual que `VITE_SUPABASE_URL` |
| `SUPABASE_PUBLISHABLE_KEY` | (la misma clave larga que arriba) | Igual que `VITE_SUPABASE_PUBLISHABLE_KEY` |
| `SUPABASE_SERVICE_ROLE_KEY` | (clave secreta, empieza por `sb_secret_` o `eyJ…`) | En [supabase.com/dashboard](https://supabase.com/dashboard) → tu proyecto → **Project Settings → API Keys** → copia la clave **service_role** (secreta) |
| `RESEND_API_KEY` | tu clave de Resend | En [resend.com](https://resend.com) → **API Keys** (la misma que ya usas para los correos) |
| `TEACHER_INVITE_CODE` | `liepins` | El código de invitación que ya conoces |
| `GOOGLE_API_KEY` | tu clave de Firebase | En [console.firebase.google.com](https://console.firebase.google.com) → tu proyecto → ⚙️ **Configuración del proyecto** → Tus apps → SDK setup and configuration |
| `GOOGLE_ANALYTICS_MEASUREMENT_ID` | tu `G-XXXXXXXXXX` | En el mismo sitio de Firebase, sección Analytics |

Consejo: marca todas como disponibles en **Production, Preview y Development** (Vercel lo propone por defecto).

## 4. Comprueba que funciona

Abre la dirección que Vercel te da (algo como `la-hucha-de-lengua.vercel.app`) y prueba:

- El contador público y el historial de cada clase.
- **Iniciar sesión** (arriba a la derecha) con tu cuenta de profesor.
- El panel, los alumnos y el botón del sobre de recordatorio.

## 5. Los recordatorios automáticos por correo

Los correos programados (avisos diarios a los alumnos y el resumen del viernes para Kevin) se envían ahora desde la web publicada en Lovable, y **seguirán llegando sin que hagas nada** mientras esa web siga publicada.

Cuando quieras que salgan desde Vercel:

1. Conecta tu dominio **dinerolengua.es** en Vercel (tu proyecto → **Settings → Domains**) o quédate con la dirección de Vercel.
2. Dime la dirección definitiva y yo cambio a dónde apuntan los correos programados.

## 6. Tu dominio propio (opcional)

- En Vercel: tu proyecto → **Settings → Domains** → añade `dinerolengua.es` y sigue sus instrucciones.
- En Lovable: quita el dominio de Project Settings → Domains para que no haya conflicto.
