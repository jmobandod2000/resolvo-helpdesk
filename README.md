<p align="center">
  <img src="assets/brand/resolvo-logo.png" alt="Resolvo, help desk de TI open source" width="300" />
</p>

<p align="center">
  <b>Mesa de ayuda de TI open source y autoalojada.</b><br />
  Registra, da seguimiento y mide los tickets de soporte de tu equipo, en español, English y português.
</p>

<p align="center">
  <a href="LICENSE"><img alt="License: Apache 2.0" src="https://img.shields.io/badge/license-Apache%202.0-blue.svg" /></a>
  <img alt="Docker" src="https://img.shields.io/badge/deploy-docker%20compose-2496ED" />
  <img alt="PostgreSQL 17" src="https://img.shields.io/badge/PostgreSQL-17-336791" />
  <img alt="i18n" src="https://img.shields.io/badge/i18n-es%20%7C%20en--US%20%7C%20pt--BR-informational" />
  <a href="https://github.com/jmobandod2000/resolvo-helpdesk/stargazers"><img alt="GitHub stars" src="https://img.shields.io/github/stars/jmobandod2000/resolvo-helpdesk?style=social" /></a>
</p>

<p align="center">
  <a href="#instalación-rápida">Instalar</a> ·
  <a href="#desarrollo">Desarrollar</a> ·
  <a href="#funcionalidades">Funcionalidades</a> ·
  <a href="#apoya-el-proyecto">Apoyar</a>
</p>

**Resolvo** es un *help desk* y sistema de tickets para equipos de TI de pequeñas y medianas empresas: solicitudes con historial completo, flujo de estados, sedes y categorías configurables, métricas, reportes en Excel, un portal de solicitudes sin login, notificaciones, un asistente de configuración inicial e integración con IA (Claude, Gemini, Codex) mediante MCP. Es una alternativa ligera a herramientas como osTicket, GLPI o Zendesk que se instala en tu propio servidor con un solo comando; tus datos no salen de tu red.

Si te resulta útil, **dale una ⭐ al repositorio**: así más equipos de TI lo encuentran.

> 🇺🇸 **English:** Resolvo is an open-source, self-hosted IT help desk and ticketing system for small and mid-sized teams (NestJS + PostgreSQL + Vue/Quasar). It covers ticket tracking, a no-login requester portal, notifications, configurable sites and categories, metrics, Excel reports, a setup wizard and an MCP server so AI assistants (Claude, Gemini, Codex, Copilot) can work tickets, in English, Spanish and Portuguese. A lightweight alternative to osTicket, GLPI or Zendesk. Install with one command, `./resolvo install` (Docker is the only requirement). The commands below are the same in any language.
>
> 🇧🇷 **Português:** Resolvo é uma central de ajuda (help desk) de TI de código aberto e auto-hospedada, com controle de tickets, unidades e categorias configuráveis, métricas, relatórios em Excel e assistente de configuração, em português, espanhol e inglês. Os comandos de instalação abaixo valem para qualquer idioma.

## Contenido

- [Funcionalidades](#funcionalidades)
- [Tecnología](#tecnología)
- [Instalación rápida](#instalación-rápida)
- [Respaldos](#respaldos)
- [Actualizar a una nueva versión](#actualizar-a-una-nueva-versión)
- [Desarrollo](#desarrollo)
- [Solución de problemas](#solución-de-problemas)
- [Usa tu IA con Resolvo](#usa-tu-ia-con-resolvo)
- [API](#api)
- [Contribuir](#contribuir)
- [Licencia](#licencia)
- [Apoya el proyecto](#apoya-el-proyecto)

## Funcionalidades

- **Configuración empresarial:** asistente inicial con los datos de la empresa (nombre, identificación fiscal, contacto), sus sedes o sucursales y las categorías de los tickets, con los nombres que cada empresa use. Incluye un juego de categorías sugeridas para TI (hardware, software, red, accesos, correo, impresoras, sistemas de la empresa). Se puede cambiar después en **Configuración**.
- **Tickets:** solicitante, área, sede (o general para todas), canal, categoría, prioridad, productos, documentos, unidades, diagnóstico, evidencias y referencia a la solicitud de desarrollo.
- **Flujo de estados:** Abierto → En análisis → Esperando información / Escalado a desarrollo → Resuelto → Cerrado (o Cancelado). Para cerrar se exigen causa raíz y comentario de cierre.
- **Historial:** cada creación, cambio de estado, reasignación, edición y nota queda registrada con usuario y hora.
- **Métricas:** totales, abiertos, tasa de resolución, escalados, tiempos de primera respuesta y de resolución, tendencia semanal, antigüedad del backlog y distribución por estado, sede, categoría, causa raíz, prioridad y responsable.
- **Reportes:** resumen por mes o por semana y vista por responsable (tickets resueltos y acciones registradas). Desglose por sede, categoría, prioridad, causa raíz y solicitante. Pendientes con días sin movimiento, detalle completo y descarga a Excel con todas las hojas.
- **Usuarios y roles:** administradores y analistas.
- **Idiomas:** español, inglés y portugués, tanto en la interfaz como en los mensajes del API.
- **Portal de solicitudes sin login:** cualquier persona de la empresa reporta un problema en 3 pasos guiados y sigue su caso con un enlace privado: ve el estado, lee las respuestas y contesta. Protegido con límite de envíos, filtro contra bots y detección de duplicados.
- **Notas internas y públicas:** el equipo decide qué ve el solicitante. Enlace de seguimiento para cualquier ticket, también para compartir por WhatsApp.
- **Notificaciones:** campanita con contador, sonido y avisos del sistema para el equipo de TI (tickets nuevos del portal, respuestas, asignaciones), y avisos al solicitante cuando TI le responde.
- **Integración con IA:** servidor MCP incluido para que Claude, Gemini, Codex, Copilot o Cursor busquen, atiendan y reporten tickets. Ver [Usa tu IA con Resolvo](#usa-tu-ia-con-resolvo).
- **Guía de uso:** tutorial integrado y bienvenida para usuarios nuevos.

## Tecnología

| Proyecto | Stack |
|---|---|
| `tickets-back` | NestJS 10, Prisma 6, PostgreSQL 17 (Docker), JWT + argon2, Joi, Swagger |
| `tickets-front` | Quasar 2, Vue 3 (`<script setup lang="ts">`), Pinia, TanStack Vue Query, vue-i18n, ExcelJS |

La base de datos oficial es **PostgreSQL**: viene lista en `docker-compose.yml` y el esquema usa funciones propias de PostgreSQL. No se soportan otros motores.

## Instalación rápida

Solo necesitas **[Docker](https://docs.docker.com/get-docker/)**: Docker Desktop en Windows o macOS, o Docker Engine en Linux. Resolvo trae su propia base PostgreSQL, aplica las migraciones y crea el administrador automáticamente.

```bash
git clone https://github.com/jmobandod2000/resolvo-helpdesk.git
cd resolvo-helpdesk
./resolvo install        # Linux / macOS
resolvo install          # Windows (en PowerShell: .\resolvo install)
```

El asistente pregunta en la terminal lo esencial: puerto, dirección de la app, zona horaria, administrador inicial y, si quieres, el correo para avisar a los solicitantes. Genera las contraseñas internas, guarda todo en `.env`, descarga la imagen y deja Resolvo funcionando:

```
✔ Resolvo está listo

  Abre  http://servidor:8080
  Entra con admin@tuempresa.com
```

Al entrar por primera vez, el **asistente de configuración** de la app pide los datos de la empresa, sus sedes y las categorías de los tickets. Después crea a los analistas en **Usuarios**.

> Si el equipo no tiene Node.js, `resolvo` ejecuta el asistente dentro de un contenedor: Docker sigue siendo el único requisito.

### Comandos

| Comando | Qué hace |
|---|---|
| `resolvo install` | Asistente inicial: crea `.env` y levanta Resolvo |
| `resolvo config` | Cambia puerto, administrador o correo y reinicia |
| `resolvo start` / `stop` / `restart` | Inicia, detiene o reinicia. Al detener, los datos se conservan. |
| `resolvo status` | Estado de los servicios y de la app |
| `resolvo logs` | Registros en vivo |
| `resolvo backup` | Respaldo de la base en `./backups` |
| `resolvo restore <archivo>` | Restaura un respaldo (pide confirmación) |
| `resolvo update` | Respaldo, última versión y reinicio, sin perder datos |
| `resolvo dev` | Modo desarrollo: API y web locales con recarga automática |

Resolvo se inicia solo cuando arranca el servidor (`restart: unless-stopped`).

### Qué queda instalado

```
Navegador ──▶ :8080  app (API + web, una sola imagen) ──▶ db (PostgreSQL 17, red interna de Docker)
```

- **Una sola imagen** con la API y la web compiladas, sin dependencias de desarrollo. Al iniciar aplica las migraciones pendientes (`prisma migrate deploy`) y, si la base está vacía, crea el administrador de `LOGIN_*`.
- **PostgreSQL** no se publica fuera de Docker; los datos viven en el volumen `resolvo_db-data`.
- La imagen se publica en `ghcr.io/jmobandod2000/resolvo-helpdesk`. Si prefieres compilarla en tu servidor, responde *no* a "¿Descargar la imagen lista?" o usa `docker compose build`.

### Sin el asistente

```bash
cp .env.example .env     # cambia contraseñas, JWT_SECRET y administrador
docker compose up -d
```

| Variable (`.env` de la raíz) | Descripción |
|---|---|
| `RESOLVO_PORT` | Puerto web (por defecto `8080`) |
| `RESOLVO_BIND` | `0.0.0.0` para toda la red; `127.0.0.1` si pones un proxy con HTTPS delante |
| `RESOLVO_VERSION` | `latest` o una versión fija, por ejemplo `1.0.0` |
| `APP_URL` | Dirección pública; se usa en los enlaces de los correos |
| `TZ` | Zona horaria, por ejemplo `America/Caracas` |
| `DB_NAME`, `DB_USER`, `DB_PASSWORD` | Base PostgreSQL interna |
| `JWT_SECRET`, `JWT_EXPIRES_IN` | Firma y duración de las sesiones |
| `LOGIN_NAME`, `LOGIN_EMAIL`, `LOGIN_PASSWORD` | Administrador inicial (solo se usa con la base vacía) |
| `SMTP_*`, `MAIL_FROM` | Correo opcional para avisar al solicitante del portal |

### HTTPS

Para publicar con certificado, pon `RESOLVO_BIND=127.0.0.1` y un proxy delante. Con Nginx:

```nginx
server {
    listen 443 ssl;
    server_name tickets.tuempresa.com;
    # ssl_certificate ... (certificado de tu empresa o Certbot)

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Caddy lo hace con certificado automático: `tickets.tuempresa.com { reverse_proxy 127.0.0.1:8080 }`.

### Lista de seguridad

- [ ] `.env` fuera del control de versiones (ya está en `.gitignore`) y solo legible por el administrador del servidor.
- [ ] Cambia la contraseña del administrador desde la app después del primer ingreso.
- [ ] HTTPS si Resolvo se usa fuera de la red local.
- [ ] Solo el puerto de Resolvo (o el del proxy) abierto en el firewall.
- [ ] Respaldos programados y guardados fuera del servidor.

## Respaldos

```bash
resolvo backup                                       # crea backups/resolvo_AAAAMMDD_HHMM.dump
resolvo restore backups/resolvo_20261010_2300.dump
```

Para respaldar todos los días, programa `resolvo backup` con `cron` en Linux (`0 2 * * * cd /opt/resolvo-helpdesk && ./resolvo backup`) o con el Programador de tareas en Windows, y copia la carpeta `backups` fuera del servidor.

## Actualizar a una nueva versión

```bash
resolvo update
```

Hace un respaldo, descarga la nueva versión, aplica las migraciones y reinicia. Los datos se conservan. Las novedades de cada versión están en [Releases](https://github.com/jmobandod2000/resolvo-helpdesk/releases).

## Desarrollo

Requisitos: [Node.js](https://nodejs.org) 22.22 o superior (recomendado 24 LTS), [pnpm](https://pnpm.io) 10 (`npm install -g pnpm`), Docker y Git.

```bash
git clone https://github.com/jmobandod2000/resolvo-helpdesk.git
cd resolvo-helpdesk
./resolvo dev            # Windows: resolvo dev
```

`resolvo dev` crea los `.env` de desarrollo si faltan, instala dependencias, levanta PostgreSQL en Docker, aplica las migraciones y arranca la API y la web con recarga automática, con la salida de ambas en la misma terminal.

- App: `http://localhost:9010`
- API: `http://localhost:3010/api` · Swagger: `http://localhost:3010/docs`
- Datos de prueba: `pnpm demo:setup` y `pnpm demo:start` en `tickets-back` crean una base aparte con 60 tickets ficticios.

Si prefieres levantar cada parte por separado:

```bash
cd tickets-back
pnpm install
cp .env.example .env        # edita las contraseñas y el JWT_SECRET
docker compose up -d        # PostgreSQL en 127.0.0.1:5437
npx prisma migrate dev
pnpm start:dev              # crea el administrador de LOGIN_* si la base está vacía

cd ../tickets-front
pnpm install
cp .env.example .env
pnpm dev
```

Para conectarte a la base de desarrollo con un cliente como TablePlus, DBeaver o pgAdmin usa `127.0.0.1:5437` y el usuario y la contraseña de `tickets-back/.env`.

### Variables de desarrollo

| `tickets-back/.env` | Descripción |
|---|---|
| `PORT` | Puerto del API (por defecto `3010`) |
| `JWT_SECRET`, `JWT_EXPIRES_IN` | Firma y duración de las sesiones (mínimo 16 caracteres) |
| `LOGIN_NAME`, `LOGIN_EMAIL`, `LOGIN_PASSWORD` | Administrador inicial |
| `SEED_EXAMPLE_TICKETS` | `true` para que `pnpm db:seed` cargue tickets de ejemplo |
| `DATABASE_URL` | Conexión de Prisma a PostgreSQL |
| `DB_PS_*` | Base, usuario, contraseña, puertos y carpeta del contenedor PostgreSQL de desarrollo |
| `WEB_DIR` | Opcional: carpeta del front compilado para que la API también sirva la web |
| `APP_URL`, `SMTP_*`, `MAIL_FROM` | Correo opcional (para pruebas: `docker compose --profile mail up -d`, buzón en `http://localhost:8025`) |

| `tickets-front/.env` | Descripción |
|---|---|
| `BASE_URL` | URL del API en desarrollo |
| `BASE_URL_PROD` | URL del API al compilar. Vacía = `/api` en la misma dirección de la web. |

## Solución de problemas

| Síntoma | Causa probable |
|---|---|
| `resolvo` dice que Docker no responde | Abre Docker Desktop (Windows/macOS) o inicia el servicio: `sudo systemctl start docker`. |
| "Resolvo no respondió a tiempo" | Revisa `resolvo logs`. Lo más común: una variable inválida en `.env` (`Config validation error`). |
| `port is already allocated` | Otro programa usa el puerto; cámbialo con `resolvo config`. |
| La app abre pero no inicia sesión | Si usas proxy, verifica que reenvíe todas las rutas (incluida `/api/`) a Resolvo. |
| Los reportes muestran fechas corridas un día | El servidor y los usuarios están en zonas horarias distintas; ajusta `TZ` y la hora del equipo del usuario. |
| En desarrollo: `EADDRINUSE: 3010` | Otro proceso usa el puerto; cambia `PORT` o detén el proceso. |

## Usa tu IA con Resolvo

Resolvo trae un servidor **MCP** ([`resolvo-mcp`](resolvo-mcp)) para que el asistente de IA de tu equipo trabaje los tickets como un analista más: buscar, leer el historial, clasificar, redactar respuestas, cambiar estados y sacar reportes. Funciona con **Claude** (Code y Desktop), **Gemini CLI**, **Codex CLI**, **GitHub Copilot**, **Cursor** y cualquier cliente MCP.

```bash
cd resolvo-mcp && pnpm install && pnpm build
claude mcp add resolvo -e RESOLVO_API_URL=https://tickets.tuempresa.com/api -e RESOLVO_EMAIL=ia@tuempresa.com -e RESOLVO_PASSWORD=... -- node /ruta/resolvo-mcp/dist/index.js
```

La [guía de integración con IA](docs/ai/README.md) explica la configuración para cada herramienta, la seguridad y la privacidad, y trae un [archivo de contexto](docs/ai/CONTEXTO_IA.md) para que tu IA conozca las reglas de trabajo de Resolvo.

## API

Documentación interactiva completa en `/docs` (Swagger). Endpoints principales:

| Método | Ruta | Uso |
|---|---|---|
| POST | `/api/auth/login` | Inicio de sesión |
| GET | `/api/auth/check-auth-token` | Renovar sesión |
| GET/POST | `/api/tickets` | Listar con filtros (`siteId`, `categoryId`, `status`...) y paginación / crear |
| GET | `/api/tickets/:term` | Detalle por id o código (`TK-00001`) |
| PATCH | `/api/tickets/:id` | Editar |
| PATCH | `/api/tickets/:id/status` | Cambiar estado |
| POST | `/api/tickets/:id/notes` | Agregar nota |
| DELETE | `/api/tickets/:id` | Borrado lógico (administrador) |
| GET | `/api/metrics/summary` | Métricas (`from`, `to`, `siteId`, `categoryId`, `weeks`) |
| GET | `/api/reports` | Reporte (`from`, `to`, `groupBy`, `timeZone`, `siteId`, `categoryId`, `priority`, `assigneeId`) |
| GET | `/api/drop-downs/catalogs` | Catálogos para los selectores |
| GET | `/api/organization/public` | Nombre de la empresa y si la configuración inicial está hecha (sin sesión) |
| GET/PUT | `/api/organization` | Datos de la empresa (editar: administrador) |
| GET/POST/PATCH/DELETE | `/api/sites` | Sedes o sucursales (editar: administrador) |
| GET/POST/PATCH/DELETE | `/api/categories` | Categorías de los tickets (editar: administrador) |
| PATCH | `/api/organization/portal` | Activar el portal y su mensaje (administrador) |
| POST | `/api/tickets/:id/public-link` | Enlace de seguimiento del ticket |
| GET/PATCH | `/api/notifications` | Notificaciones del usuario (`/:id/read`, `/read-all`) |
| GET | `/api/portal/config` | Configuración pública del portal (sin sesión) |
| POST | `/api/portal/tickets` | Crear una solicitud desde el portal (sin sesión, con límite) |
| GET/POST | `/api/portal/tickets/:token` | Seguimiento y respuestas del solicitante (sin sesión) |
| GET/POST/PATCH/DELETE | `/api/users` | Usuarios |

El API responde en el idioma indicado en el encabezado `x-lang` (`es`, `en-US`, `pt-BR`) o, en su defecto, en el de `Accept-Language`.

`tickets-back/scripts/smoke-test.ps1` recorre login, permisos, filtros, búsqueda, reglas de cierre, reapertura, borrado lógico, métricas y catálogos contra el API en ejecución.

## Contribuir

Las contribuciones son bienvenidas. Lee la [guía de contribución](CONTRIBUTING.md) antes de abrir un pull request.

## Licencia

Distribuido bajo la [licencia Apache 2.0](LICENSE). Puedes usarlo, modificarlo y distribuirlo sin costo, también en tu empresa. Las redistribuciones y las versiones derivadas deben conservar el archivo [NOTICE](NOTICE) con la autoría original. La licencia no autoriza usar el nombre del proyecto ni el del autor para promocionar versiones derivadas.

El software se entrega tal cual, sin garantías de ningún tipo.

## Apoya el proyecto

Resolvo es y seguirá siendo gratuito. Si le ahorra tiempo a tu equipo, puedes colaborar de forma voluntaria con su mantenimiento:

| Método | Dato |
|---|---|
| Binance Pay | ID **761259318** |

<p align="center">
  <img src="tickets-front/src/assets/support/binance-qr.png" alt="Código QR de Binance Pay" width="220" />
</p>

<!-- Buy Me a Coffee: agregar la fila con el enlace cuando la cuenta esté activa. -->

Estos son los **únicos** canales oficiales; también aparecen en la pantalla **Acerca de** de la app. Si encuentras una copia del proyecto que pide colaboraciones por otros medios, no está asociada a este repositorio.

---

Creado y mantenido por **Juan M. Obando**.
