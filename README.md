# Tickets WMS

[![License: Apache 2.0](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)
![Node 20+](https://img.shields.io/badge/node-%3E%3D20-339933)
![PostgreSQL 17](https://img.shields.io/badge/PostgreSQL-17-336791)
![i18n](https://img.shields.io/badge/i18n-es%20%7C%20en--US%20%7C%20pt--BR-informational)

Sistema web para que un equipo de TI registre, dé seguimiento y mida sus tickets de soporte. Ofrece historial completo, flujo de estados, métricas, reportes descargables y tres idiomas. Se instala en tu propio servidor; tus datos no salen de tu red.

> **English:** Tickets WMS is a self-hosted help-desk tracker for IT teams (NestJS + PostgreSQL + Vue/Quasar), available in Spanish, English and Portuguese. Setup and deployment steps are below; commands are the same in any language.

## Contenido

- [Funcionalidades](#funcionalidades)
- [Tecnología](#tecnología)
- [Requisitos](#requisitos)
- [Instalación para desarrollo](#instalación-para-desarrollo)
- [Variables de entorno](#variables-de-entorno)
- [Despliegue en producción](#despliegue-en-producción)
- [Respaldos](#respaldos)
- [Actualizar a una nueva versión](#actualizar-a-una-nueva-versión)
- [Solución de problemas](#solución-de-problemas)
- [API](#api)
- [Contribuir](#contribuir)
- [Licencia](#licencia)
- [Apoya el proyecto](#apoya-el-proyecto)

## Funcionalidades

- **Configuración empresarial:** asistente inicial con los datos de la empresa (nombre, identificación fiscal, contacto) y sus sedes o sucursales, con los nombres y códigos que cada empresa use. Se puede cambiar después en **Configuración**.
- **Tickets:** solicitante, área, sede (o general para todas), canal, categoría, prioridad, productos, documentos, unidades, diagnóstico, evidencias y referencia a la solicitud de desarrollo.
- **Flujo de estados:** Abierto → En análisis → Esperando información / Escalado a desarrollo → Resuelto → Cerrado (o Cancelado). Para cerrar se exigen causa raíz y comentario de cierre.
- **Historial:** cada creación, cambio de estado, reasignación, edición y nota queda registrada con usuario y hora.
- **Métricas:** totales, abiertos, tasa de resolución, escalados, tiempos de primera respuesta y de resolución, tendencia semanal, antigüedad del backlog y distribución por estado, sede, categoría, causa raíz, prioridad y responsable.
- **Reportes:** resumen por mes o por semana y vista por responsable (tickets resueltos y acciones registradas). Desglose por sede, categoría, prioridad, causa raíz y solicitante. Pendientes con días sin movimiento, detalle completo y descarga a Excel con todas las hojas.
- **Usuarios y roles:** administradores y analistas.
- **Idiomas:** español, inglés y portugués, tanto en la interfaz como en los mensajes del API.
- **Guía de uso:** tutorial integrado y bienvenida para usuarios nuevos.

## Tecnología

| Proyecto | Stack |
|---|---|
| `tickets-back` | NestJS 10, Prisma 6, PostgreSQL 17 (Docker), JWT + argon2, Joi, Swagger |
| `tickets-front` | Quasar 2, Vue 3 (`<script setup lang="ts">`), Pinia, TanStack Vue Query, vue-i18n, ExcelJS |

La base de datos oficial es **PostgreSQL**: viene lista en `docker-compose.yml` y el esquema usa funciones propias de PostgreSQL. No se soportan otros motores.

## Requisitos

- [Node.js](https://nodejs.org) 20 o superior
- [pnpm](https://pnpm.io) 10 (`npm install -g pnpm`)
- [Docker](https://www.docker.com) con Docker Compose, para PostgreSQL. También sirve un PostgreSQL 15+ ya instalado; en ese caso ajusta `DATABASE_URL`.
- Git

## Instalación para desarrollo

```bash
git clone https://github.com/jmobandod2000/tickets-app.git
cd tickets-app
```

### Backend

```bash
cd tickets-back
pnpm install
cp .env.example .env        # edita las contraseñas y el JWT_SECRET
docker compose up -d        # levanta PostgreSQL
npx prisma migrate dev      # crea las tablas
pnpm db:seed                # crea el usuario administrador
pnpm start:dev
```

- API: `http://localhost:3010/api`
- Documentación Swagger: `http://localhost:3010/docs`
- El seed crea el administrador definido en `LOGIN_EMAIL` / `LOGIN_PASSWORD`. Con `SEED_EXAMPLE_TICKETS=true` carga además dos sedes y tickets ficticios para explorar la app (solo si la tabla está vacía).

### Frontend

```bash
cd tickets-front
pnpm install
cp .env.example .env
pnpm dev
```

- App: `http://localhost:9010`
- Inicia sesión con el administrador del seed. La primera vez se abre el **asistente de configuración inicial**: registra el nombre de tu empresa y sus sedes. Después crea a los analistas en **Usuarios**.

## Variables de entorno

### `tickets-back/.env`

| Variable | Descripción |
|---|---|
| `APP_MODE` | `dev` o `prod` |
| `HOST`, `PORT` | URL pública del API y puerto en el que escucha (por defecto `3010`) |
| `JWT_SECRET` | Secreto para firmar las sesiones. Mínimo 16 caracteres; usa uno largo y aleatorio. |
| `JWT_EXPIRES_IN` | Duración de la sesión (por ejemplo `12h`) |
| `LOGIN_NAME`, `LOGIN_EMAIL`, `LOGIN_PASSWORD` | Administrador inicial que crea el seed |
| `SEED_EXAMPLE_TICKETS` | `true` para cargar tickets de ejemplo; `false` en producción |
| `DATABASE_URL` | Cadena de conexión de Prisma a PostgreSQL |
| `DB_PS_*` | Base, usuario, contraseña, puertos y carpeta de datos del contenedor PostgreSQL |

El API valida estas variables al arrancar y se detiene con un mensaje claro si falta alguna.

### `tickets-front/.env`

| Variable | Descripción |
|---|---|
| `BASE_URL` | URL del API en desarrollo (`pnpm dev`) |
| `BASE_URL_PROD` | URL del API en el build de producción. Si publicas front y API en el mismo dominio con el proxy de abajo, usa `/api`. |

Las variables del front se incrustan al compilar: si cambias `BASE_URL_PROD`, vuelve a ejecutar `pnpm build`.

## Despliegue en producción

Esquema recomendado: PostgreSQL en Docker, el API con PM2 y el front como archivos estáticos detrás de Nginx, que además hace de proxy hacia el API. Todo en un mismo servidor (Linux o Windows).

```
Navegador ──HTTPS──▶ Nginx ──┬── /        → tickets-front/dist/spa (archivos estáticos)
                             └── /api/    → http://127.0.0.1:3010 (NestJS + PM2) ──▶ PostgreSQL (Docker, 127.0.0.1:5437)
```

### 1. Base de datos

```bash
cd tickets-back
cp .env.example .env    # APP_MODE=prod, SEED_EXAMPLE_TICKETS=false y contraseñas propias
docker compose up -d
```

El contenedor publica PostgreSQL solo en `127.0.0.1`, así que no queda expuesto a la red. Los datos se guardan en la carpeta de `DB_PS_DOCKER_VOLUME`.

### 2. API

```bash
cd tickets-back
pnpm install --frozen-lockfile
pnpm build
npx prisma migrate deploy   # aplica las migraciones sin borrar datos
pnpm db:seed                # solo la primera vez: crea el administrador
npm install -g pm2
pm2 start dist/main.js --name tickets-api
pm2 save
```

- **Linux:** `pm2 startup` deja el API iniciando con el sistema.
- **Windows:** `pm2 startup` no está disponible. Registra el API como servicio con [NSSM](https://nssm.cc) (`nssm install tickets-api "C:\Program Files\nodejs\node.exe" dist\main.js`, con la carpeta `tickets-back` como directorio de inicio) o con [pm2-installer](https://github.com/jessety/pm2-installer).

### 3. Frontend

```bash
cd tickets-front
pnpm install --frozen-lockfile
# en .env: BASE_URL_PROD=/api
pnpm build
```

El resultado queda en `tickets-front/dist/spa`. Cópialo a la carpeta que servirá Nginx, por ejemplo `/var/www/tickets`. La app usa rutas con `#`, así que no necesita reglas especiales de reescritura.

Al entrar por primera vez con el administrador, la app abre el asistente de configuración inicial para registrar la empresa y sus sedes.

### 4. Nginx

```nginx
server {
    listen 80;
    server_name tickets.tuempresa.com;

    root /var/www/tickets;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:3010;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Activa HTTPS con el certificado de tu empresa o con [Certbot](https://certbot.eff.org) (`certbot --nginx -d tickets.tuempresa.com`). En Windows puedes usar Nginx para Windows o IIS con *URL Rewrite* y *Application Request Routing* siguiendo el mismo esquema.

### Lista de seguridad

- [ ] `JWT_SECRET` largo y aleatorio, por ejemplo con `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`.
- [ ] Contraseñas propias para PostgreSQL y para el administrador inicial. Cambia la del administrador desde la app después del primer ingreso.
- [ ] `.env` fuera del control de versiones (ya está en `.gitignore`) y con permisos solo para el usuario del servicio.
- [ ] HTTPS habilitado.
- [ ] Puertos `3010` y `5437` cerrados en el firewall; solo Nginx (80/443) queda expuesto.
- [ ] Si no necesitas Swagger en producción, no publiques `/docs` en el proxy.

## Respaldos

```bash
# respaldo comprimido
docker exec tickets_db pg_dump -U tickets -d tickets_db -Fc > tickets_$(date +%F).dump

# restaurar sobre una base vacía
docker exec -i tickets_db pg_restore -U tickets -d tickets_db --clean --if-exists < tickets_2026-10-10.dump
```

Programa el respaldo diario con `cron` (Linux) o con el Programador de tareas (Windows) y guarda las copias fuera del servidor.

## Actualizar a una nueva versión

```bash
git pull
cd tickets-back && pnpm install --frozen-lockfile && pnpm build && npx prisma migrate deploy && pm2 restart tickets-api
cd ../tickets-front && pnpm install --frozen-lockfile && pnpm build   # copia dist/spa al servidor web
```

Haz un respaldo antes de actualizar. Las notas de cada versión están en [Releases](https://github.com/jmobandod2000/tickets-app/releases).

## Solución de problemas

| Síntoma | Causa probable |
|---|---|
| El API no arranca y muestra `Config validation error` | Falta una variable en `tickets-back/.env` o tiene un formato inválido (por ejemplo, `JWT_SECRET` muy corto). |
| `Can't reach database server` | El contenedor no está corriendo (`docker compose ps`) o `DATABASE_URL` no coincide con `DB_PS_*`. |
| El front carga pero no inicia sesión | `BASE_URL_PROD` no apunta al API o el proxy `/api/` de Nginx no está configurado; revisa la pestaña Red del navegador. |
| Los reportes muestran fechas corridas un día | El servidor y los usuarios están en zonas horarias distintas. Los reportes usan la zona horaria del navegador; revisa la del equipo del usuario. |
| `EADDRINUSE: 3010` | Otro proceso usa el puerto; cambia `PORT` o detén el proceso. |

## API

Documentación interactiva completa en `/docs` (Swagger). Endpoints principales:

| Método | Ruta | Uso |
|---|---|---|
| POST | `/api/auth/login` | Inicio de sesión |
| GET | `/api/auth/check-auth-token` | Renovar sesión |
| GET/POST | `/api/tickets` | Listar con filtros (`siteId`, `category`, `status`...) y paginación / crear |
| GET | `/api/tickets/:term` | Detalle por id o código (`TK-00001`) |
| PATCH | `/api/tickets/:id` | Editar |
| PATCH | `/api/tickets/:id/status` | Cambiar estado |
| POST | `/api/tickets/:id/notes` | Agregar nota |
| DELETE | `/api/tickets/:id` | Borrado lógico (administrador) |
| GET | `/api/metrics/summary` | Métricas (`from`, `to`, `siteId`, `weeks`) |
| GET | `/api/reports` | Reporte (`from`, `to`, `groupBy`, `timeZone`, `siteId`, `category`, `priority`, `assigneeId`) |
| GET | `/api/drop-downs/catalogs` | Catálogos para los selectores |
| GET | `/api/organization/public` | Nombre de la empresa y si la configuración inicial está hecha (sin sesión) |
| GET/PUT | `/api/organization` | Datos de la empresa (editar: administrador) |
| GET/POST/PATCH/DELETE | `/api/sites` | Sedes o sucursales (editar: administrador) |
| GET/POST/PATCH/DELETE | `/api/users` | Usuarios |

El API responde en el idioma indicado en el encabezado `x-lang` (`es`, `en-US`, `pt-BR`) o, en su defecto, en el de `Accept-Language`.

`tickets-back/scripts/smoke-test.ps1` recorre login, permisos, filtros, búsqueda, reglas de cierre, reapertura, borrado lógico, métricas y catálogos contra el API en ejecución.

## Contribuir

Las contribuciones son bienvenidas. Lee la [guía de contribución](CONTRIBUTING.md) antes de abrir un pull request.

## Licencia

Distribuido bajo la [licencia Apache 2.0](LICENSE). Puedes usarlo, modificarlo y distribuirlo sin costo, también en tu empresa. Las redistribuciones y las versiones derivadas deben conservar el archivo [NOTICE](NOTICE) con la autoría original. La licencia no autoriza usar el nombre del proyecto ni el del autor para promocionar versiones derivadas.

El software se entrega tal cual, sin garantías de ningún tipo.

## Apoya el proyecto

Tickets WMS es y seguirá siendo gratuito. Si le ahorra tiempo a tu equipo, puedes colaborar de forma voluntaria con su mantenimiento:

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
