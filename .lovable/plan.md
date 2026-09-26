# Contador de multas de Lengua

## Objetivo
Crear una aplicación privada para que el profesor registre y controle el dinero de las multas de 4.º A, 4.º B y 4.º C.

## Experiencia
- Pantalla de acceso por correo y contraseña, sin registro público.
- Panel principal con selector de clase y resumen: recaudado, pendiente y total.
- Alta rápida de una multa con alumno, importe de 0,10 € a 0,50 €, fecha, estado pagado/pendiente y nota opcional.
- Historial filtrable por clase y estado, con edición, marcado como pagado y eliminación.
- Perfil básico del profesor con nombre visible.
- Diseño escolar claro, alegre y cómodo en móvil y ordenador.

## Datos y seguridad
- Crear perfiles de profesor y registros de multas en el Supabase externo ya conectado.
- Proteger toda la información para usuarios autenticados; no habrá acceso público a los registros.
- El primer profesor se crea desde el panel de usuarios de Supabase; la aplicación solo mostrará inicio de sesión.
- Guardar los importes como céntimos enteros para evitar errores de decimales.

## Firebase
- Inicializar Firebase con el proyecto `dinero-lengua` y activar Analytics en el navegador.
- Obtener de forma segura la clave pública y el identificador de medición ya guardados, sin escribirlos directamente en el código.
- Firebase se usará para Analytics; los datos del contador permanecerán en el Supabase principal solicitado.

## Implementación técnica
- Añadir Firebase y una inicialización que solo se ejecute en el navegador.
- Añadir autenticación, protección del panel y cierre de sesión mediante Supabase.
- Crear las tablas `profiles` (nombre visible) y `fines` (clase, alumno, importe, fecha, estado, notas y profesor), con permisos por usuario.
- Añadir lectura y escritura desde el panel con actualización inmediata de totales e historial.
- Completar metadatos propios de la aplicación y validar carga, acceso y flujo principal en móvil y escritorio.
