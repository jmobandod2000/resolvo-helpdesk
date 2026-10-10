# Resolvo + tu asistente de IA

Resolvo se puede manejar con un asistente de IA (**Claude**, **Gemini**, **Codex/ChatGPT**, **GitHub Copilot**, **Cursor** u otro) como un analista más del equipo de TI:

> "¿Qué tickets urgentes siguen abiertos en la sede Norte?"
> "Lee el TK-00052, revisa el historial y prepárame una respuesta para el solicitante."
> "Registra un ticket: Ana de Contabilidad no puede imprimir facturas desde esta mañana."
> "Dame el resumen del mes por responsable y dime qué categorías crecieron."

La conexión usa **MCP (Model Context Protocol)**, el estándar abierto que soportan Claude, Gemini CLI, Codex CLI, Copilot y Cursor. Resolvo incluye su propio servidor MCP en la carpeta [`resolvo-mcp`](../../resolvo-mcp).

## Qué puede hacer la IA

| Herramienta | Para qué sirve |
|---|---|
| `get_catalogs` | Conocer estados, prioridades, sedes, categorías y usuarios (con sus ids) |
| `search_tickets` | Buscar y filtrar tickets |
| `get_ticket` | Leer un ticket completo con todo su historial |
| `create_ticket` | Registrar un ticket nuevo |
| `update_ticket` | Clasificar, asignar, documentar el diagnóstico |
| `change_status` | Mover el ticket de estado (cerrar exige causa raíz y comentario de cierre) |
| `add_note` | Nota interna, o respuesta visible para el solicitante en el portal |
| `get_follow_up_link` | Enlace privado para que el solicitante siga su caso |
| `get_metrics` / `get_report` | Indicadores y reportes por período |
| `list_notifications` | Novedades: tickets del portal, respuestas, asignaciones |

El servidor también le entrega a la IA las **reglas de trabajo** de Resolvo (notas internas vs. públicas, flujo de estados, qué pedir antes de cerrar), así que no hace falta explicárselas cada vez.

## 1. Prepara un usuario para la IA

1. En Resolvo, entra como administrador → **Usuarios** → crea un usuario, por ejemplo **"Asistente IA"**, con rol **Analista** (no administrador).
2. Usa una contraseña larga y exclusiva para este fin.
3. Todo lo que haga la IA quedará firmado por ese usuario en el historial de cada ticket.

## 2. Compila el servidor MCP (una sola vez)

```bash
cd resolvo-mcp
pnpm install
pnpm build
```

Esto genera `resolvo-mcp/dist/index.js`. Necesita Node.js 20 o superior en el equipo donde corre la IA.

## 3. Variables de configuración

| Variable | Obligatoria | Descripción |
|---|---|---|
| `RESOLVO_API_URL` | Sí | URL del API, por ejemplo `https://tickets.tuempresa.com/api` |
| `RESOLVO_EMAIL` | Sí | Correo del usuario de la IA |
| `RESOLVO_PASSWORD` | Sí | Contraseña del usuario de la IA |
| `RESOLVO_APP_URL` | No | URL de la app, para que la IA entregue enlaces de seguimiento completos |
| `RESOLVO_LANG` | No | Idioma de los mensajes del API: `es` (por defecto), `en-US` o `pt-BR` |
| `RESOLVO_TIMEZONE` | No | Zona horaria de los reportes (por defecto la del equipo) |

En los ejemplos, reemplaza `/ruta/resolvo-helpdesk` por la carpeta donde clonaste el proyecto.

## 4. Conéctalo a tu IA

### Claude Code (terminal)

```bash
claude mcp add resolvo \
  -e RESOLVO_API_URL=https://tickets.tuempresa.com/api \
  -e RESOLVO_EMAIL=ia@tuempresa.com \
  -e RESOLVO_PASSWORD=tu-contraseña \
  -e RESOLVO_APP_URL=https://tickets.tuempresa.com \
  -- node /ruta/resolvo-helpdesk/resolvo-mcp/dist/index.js
```

### Claude Desktop

Archivo `claude_desktop_config.json` (en Claude Desktop: **Configuración → Desarrollador → Editar configuración**):

```json
{
  "mcpServers": {
    "resolvo": {
      "command": "node",
      "args": ["/ruta/resolvo-helpdesk/resolvo-mcp/dist/index.js"],
      "env": {
        "RESOLVO_API_URL": "https://tickets.tuempresa.com/api",
        "RESOLVO_EMAIL": "ia@tuempresa.com",
        "RESOLVO_PASSWORD": "tu-contraseña",
        "RESOLVO_APP_URL": "https://tickets.tuempresa.com"
      }
    }
  }
}
```

En Windows usa rutas con doble barra: `"C:\\ruta\\resolvo-helpdesk\\resolvo-mcp\\dist\\index.js"`.

### Gemini CLI

Archivo `~/.gemini/settings.json` (o `.gemini/settings.json` en tu carpeta de trabajo):

```json
{
  "mcpServers": {
    "resolvo": {
      "command": "node",
      "args": ["/ruta/resolvo-helpdesk/resolvo-mcp/dist/index.js"],
      "env": {
        "RESOLVO_API_URL": "https://tickets.tuempresa.com/api",
        "RESOLVO_EMAIL": "ia@tuempresa.com",
        "RESOLVO_PASSWORD": "tu-contraseña"
      }
    }
  }
}
```

### Codex CLI (OpenAI)

Archivo `~/.codex/config.toml`:

```toml
[mcp_servers.resolvo]
command = "node"
args = ["/ruta/resolvo-helpdesk/resolvo-mcp/dist/index.js"]

[mcp_servers.resolvo.env]
RESOLVO_API_URL = "https://tickets.tuempresa.com/api"
RESOLVO_EMAIL = "ia@tuempresa.com"
RESOLVO_PASSWORD = "tu-contraseña"
```

### GitHub Copilot (VS Code), Cursor y otros

Cualquier cliente compatible con MCP por `stdio` funciona con la misma receta: comando `node`, argumento `resolvo-mcp/dist/index.js` y las variables de entorno de arriba. Consulta dónde guarda tu herramienta la configuración de servidores MCP.

## 5. Dale el contexto de trabajo

Además de las reglas que entrega el servidor, puedes copiar [`CONTEXTO_IA.md`](CONTEXTO_IA.md) en tu carpeta de trabajo como `CLAUDE.md` (Claude), `GEMINI.md` (Gemini) o `AGENTS.md` (Codex, Copilot y otros). Ahí está cómo funciona Resolvo, el significado de cada estado y campo, y la forma recomendada de atender un ticket. Edítalo con las costumbres de tu equipo.

## Seguridad y privacidad

- **Lo que la IA lee sale hacia el proveedor de IA** (Anthropic, Google, OpenAI…). Usa planes empresariales que no entrenen con tus datos y revisa la política de tu empresa antes de conectar tickets con información sensible.
- Usa un usuario **Analista** exclusivo para la IA; no le des rol de administrador.
- Guarda la contraseña solo en la configuración local de tu IA; nunca la subas a un repositorio.
- Pide a la IA que te muestre lo que va a escribir antes de enviar respuestas públicas o cerrar tickets. Las reglas del servidor ya le indican no cerrar ni reasignar sin tu confirmación.
- Puedes revocar el acceso cuando quieras desactivando ese usuario en **Usuarios**.

## Sin MCP

Si tu herramienta no soporta MCP, la IA puede usar directamente el API REST documentado en `/docs` (Swagger) del backend. El archivo [`CONTEXTO_IA.md`](CONTEXTO_IA.md) incluye los endpoints principales y cómo autenticarse.
