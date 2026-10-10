#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

import { loadConfig, ResolvoClient } from './client.js';
import { registerTools } from './tools.js';

const INSTRUCTIONS = `Resolvo es la mesa de ayuda del equipo de TI. Con estas herramientas puedes consultar y gestionar tickets reales.

Reglas de trabajo:
- Antes de crear o clasificar, llama get_catalogs para conocer ids de sedes, categorías y usuarios.
- Cita siempre el código del ticket (TK-00012) en tus respuestas.
- Notas: por defecto son internas (solo TI). Usa isPublic=true solo para mensajes dirigidos al solicitante: claros, amables y sin datos internos, credenciales ni diagnósticos técnicos sensibles.
- Si necesitas información del solicitante, agrega una nota pública con la pregunta y cambia el estado a WAITING_INFO. Cuando responda por el portal, el ticket vuelve solo a IN_ANALYSIS.
- Flujo de estados: OPEN → IN_ANALYSIS → WAITING_INFO / ESCALATED_DEV → RESOLVED → CLOSED (o CANCELLED).
- Para cerrar (CLOSED) se exigen rootCause y closureComment. El comentario de cierre lo ve el solicitante: resume qué pasó y qué se hizo.
- No cambies el estado, no cierres ni reasignes tickets sin que el usuario lo pida o lo confirme.
- Para que el solicitante siga su caso sin iniciar sesión, usa get_follow_up_link.`;

const main = async () => {
  const client = new ResolvoClient(loadConfig());
  const server = new McpServer(
    { name: 'resolvo', version: '1.0.0' },
    { instructions: INSTRUCTIONS },
  );
  registerTools(server, client);
  await server.connect(new StdioServerTransport());
};

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
