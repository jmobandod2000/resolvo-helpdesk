# resolvo-mcp

Servidor [MCP](https://modelcontextprotocol.io) de **Resolvo**. Conecta Claude, Gemini CLI, Codex CLI, GitHub Copilot, Cursor u otro asistente de IA con tu mesa de ayuda para buscar, leer, crear, clasificar, responder y cerrar tickets, y consultar métricas y reportes.

```bash
pnpm install
pnpm build
RESOLVO_API_URL=https://tickets.tuempresa.com/api \
RESOLVO_EMAIL=ia@tuempresa.com \
RESOLVO_PASSWORD=... \
node dist/index.js
```

Guía completa de instalación por herramienta, seguridad y contexto para la IA: [docs/ai/README.md](../docs/ai/README.md).

**English:** MCP server for Resolvo. It lets Claude, Gemini CLI, Codex CLI, Copilot, Cursor or any MCP client search, read, create, triage, answer and close tickets, and query metrics and reports. Set `RESOLVO_API_URL`, `RESOLVO_EMAIL` and `RESOLVO_PASSWORD` (a dedicated analyst account) and run `node dist/index.js`.
