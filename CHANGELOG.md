# Cambios

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/); las versiones siguen [Semantic Versioning](https://semver.org/lang/es/).

## [1.0.0] - 2026-10-10

Primera versión pública de Resolvo.

### Instalación y operación

- Instalación con un solo comando, `resolvo install`, con un asistente en la terminal. Docker es el único requisito.
- Comandos `start`, `stop`, `restart`, `status`, `logs`, `backup`, `restore`, `update`, `config`, `db` y `dev`.
- Imagen Docker única (API + web), con migraciones automáticas y administrador inicial creado al arrancar.
- Paquete de instalación en cada Release para quien solo quiere usar la app, sin el código fuente.
- Acceso opcional a PostgreSQL desde el servidor para TablePlus, DBeaver o pgAdmin.
- Aviso de nueva versión para administradores.

### Mesa de ayuda

- Tickets con solicitante, sede, categoría, prioridad, diagnóstico, evidencias e historial completo.
- Flujo de estados: abierto, en análisis, esperando información, escalado a desarrollo, resuelto, cerrado y cancelado.
- Notas internas y notas visibles para el solicitante.
- Métricas y reportes por mes, semana, responsable, sede y categoría, con descarga a Excel.
- Asistente de configuración inicial: empresa, sedes y categorías, todo configurable.
- Usuarios con rol de administrador o analista.

### Portal de solicitudes

- Portal sin login para reportar un problema en 3 pasos guiados y seguir la solicitud con un enlace privado.
- Avisos por correo al solicitante y opción "Mis solicitudes" por correo.
- Protección con límite de envíos, filtro contra bots, detección de duplicados y textos saneados.
- Pantalla de bienvenida que pregunta si eres usuario o del equipo de TI.

### Equipo de TI

- Campanita de notificaciones, sonido y avisos del sistema.
- Interfaz y mensajes del API en español, inglés y portugués.
- Servidor MCP para que asistentes de IA trabajen los tickets: Claude, Gemini, Codex, Copilot y Cursor.

[1.0.0]: https://github.com/jmobandod2000/resolvo-helpdesk/releases/tag/v1.0.0
