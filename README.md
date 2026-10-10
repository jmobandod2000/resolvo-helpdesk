# Tickets WMS

Sistema interno para registrar, dar seguimiento y medir los tickets de soporte del WMS (Maturín y Barquisimeto).

Sigue el estándar del equipo (proyecto `vital-assets`, principios de Fernando Herrera):

| Proyecto | Stack |
|---|---|
| `tickets-back` | NestJS 10, Prisma 6, PostgreSQL 17 (Docker), JWT + argon2, Joi, Swagger |
| `tickets-front` | Quasar 2, Vue 3 (`<script setup lang="ts">`), Pinia, TanStack Vue Query, Axios |

## Puesta en marcha

### Backend

```bash
cd tickets-back
pnpm install
cp .env.example .env
docker compose up -d
npx prisma migrate dev
pnpm db:seed
pnpm start:dev
```

- API: `http://localhost:3010/api`
- Swagger: `http://localhost:3010/docs`
- El seed crea el usuario administrador definido en `LOGIN_EMAIL` / `LOGIN_PASSWORD` del `.env` y carga los tickets históricos solo si la tabla de tickets está vacía.

### Frontend

```bash
cd tickets-front
pnpm install
cp .env.example .env
pnpm dev
```

- App: `http://localhost:9010`
- `BASE_URL` apunta a la API.

## Funcionalidad

- **Tickets:** registro con solicitante, sede, canal, categoría, prioridad, productos, documentos, unidades, diagnóstico, evidencias y referencia a la solicitud de desarrollo.
- **Estados:** Abierto → En análisis → Esperando información / Escalado a desarrollo → Resuelto → Cerrado (o Cancelado). Cerrar exige causa raíz y comentario de cierre. Reabrir limpia las fechas de resolución y cierre.
- **Historial:** cada creación, cambio de estado, reasignación, edición y nota queda en la línea de tiempo del ticket con usuario y hora.
- **Métricas:** totales, abiertos, resueltos, tasa de resolución, escalados, tiempo de primera respuesta y de resolución (promedio y mediana), tendencia semanal, antigüedad del backlog y distribución por estado, sede, categoría, causa raíz, prioridad, responsable y productos más reportados. Cada barra abre el listado filtrado.
- **Usuarios:** administración de analistas (solo rol administrador).

## Endpoints principales

| Método | Ruta | Uso |
|---|---|---|
| POST | `/api/auth/login` | Inicio de sesión |
| GET | `/api/auth/check-auth-token` | Renovar sesión |
| GET/POST | `/api/tickets` | Listar con filtros y paginación / crear |
| GET | `/api/tickets/:term` | Detalle por id o código (`TK-00001`) |
| PATCH | `/api/tickets/:id` | Editar |
| PATCH | `/api/tickets/:id/status` | Cambiar estado |
| POST | `/api/tickets/:id/notes` | Agregar nota |
| DELETE | `/api/tickets/:id` | Borrado lógico (admin) |
| GET | `/api/metrics/summary` | Métricas (`from`, `to`, `company`, `weeks`) |
| GET | `/api/drop-downs/catalogs` | Catálogos para los selectores |
| GET/POST/PATCH/DELETE | `/api/users` | Usuarios |

## Pruebas

`tickets-back/scripts/smoke-test.ps1` recorre login, permisos, filtros, búsqueda, reglas de cierre, reapertura, borrado lógico, métricas y catálogos contra la API en ejecución.
