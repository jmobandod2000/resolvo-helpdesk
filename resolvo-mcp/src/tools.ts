import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import { ResolvoApiError, ResolvoClient } from './client.js';

const STATUSES = [
  'OPEN',
  'IN_ANALYSIS',
  'WAITING_INFO',
  'ESCALATED_DEV',
  'RESOLVED',
  'CLOSED',
  'CANCELLED',
] as const;
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;
const CHANNELS = ['WHATSAPP', 'EMAIL', 'CALL', 'IN_PERSON', 'PORTAL', 'OTHER'] as const;
const ROOT_CAUSES = [
  'OPERATIONAL_ERROR',
  'SYSTEM_DEFECT',
  'USER_MISINTERPRETATION',
  'MASTER_DATA',
  'NO_ISSUE',
  'OTHER',
] as const;

const DATE = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato YYYY-MM-DD');

interface TicketSummary {
  id: number;
  code: string;
  title: string;
  status: string;
  priority: string;
  channel: string;
  requesterName: string;
  reportedAt: string;
  Site: { code: string | null; name: string } | null;
  Category: { name: string } | null;
  Assignee: { name: string } | null;
}

const ok = (data: unknown) => ({
  content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
});

const fail = (error: unknown) => ({
  isError: true,
  content: [
    {
      type: 'text' as const,
      text:
        error instanceof ResolvoApiError
          ? `Error ${error.status}: ${error.message}`
          : `Error: ${error instanceof Error ? error.message : String(error)}`,
    },
  ],
});

const run = async (action: () => Promise<unknown>) => {
  try {
    return ok(await action());
  } catch (error) {
    return fail(error);
  }
};

const summarize = (ticket: TicketSummary) => ({
  id: ticket.id,
  code: ticket.code,
  title: ticket.title,
  status: ticket.status,
  priority: ticket.priority,
  channel: ticket.channel,
  requester: ticket.requesterName,
  site: ticket.Site ? [ticket.Site.code, ticket.Site.name].filter(Boolean).join(' ') : null,
  category: ticket.Category?.name ?? null,
  assignee: ticket.Assignee?.name ?? null,
  reportedAt: ticket.reportedAt,
});

const ticketFields = {
  title: z.string().min(5).max(200).describe('Asunto corto del ticket'),
  description: z.string().min(5).describe('Mensaje original del solicitante'),
  requesterName: z.string().min(2).max(80).describe('Quién reporta'),
  requesterArea: z.string().max(80).optional().describe('Área o departamento del solicitante'),
  requesterEmail: z.string().email().optional().describe('Correo del solicitante'),
  siteId: z.number().int().positive().nullable().optional().describe('Id de la sede; null = todas las sedes'),
  categoryId: z.number().int().positive().nullable().optional().describe('Id de la categoría (ver get_catalogs)'),
  channel: z.enum(CHANNELS).optional().describe('Por dónde llegó la solicitud'),
  priority: z.enum(PRIORITIES).optional(),
  productCodes: z.array(z.string()).optional().describe('Códigos de producto o equipo relacionados'),
  documents: z.array(z.string()).optional().describe('Documentos relacionados (pedidos, facturas, etc.)'),
  affectedUnits: z.number().int().optional(),
  diagnosis: z.string().optional().describe('Diagnóstico técnico (interno)'),
  devRequestRef: z.string().optional().describe('Referencia de la solicitud a desarrollo'),
  evidencePaths: z.array(z.string()).optional().describe('Rutas de scripts, informes o evidencias'),
  assigneeId: z.number().int().positive().optional().describe('Id del usuario responsable'),
  reportedAt: z.string().optional().describe('Fecha y hora ISO en que se reportó'),
};

export const registerTools = (server: McpServer, client: ResolvoClient) => {
  const { appUrl, timeZone } = client.config;

  server.registerTool(
    'get_catalogs',
    {
      title: 'Catálogos',
      description:
        'Devuelve estados, prioridades, canales, causas raíz, sedes, categorías y usuarios con sus ids. Úsalo antes de crear o clasificar tickets.',
      annotations: { readOnlyHint: true },
    },
    () =>
      run(async () => {
        const [catalogs, sites, categories, users] = await Promise.all([
          client.get('drop-downs/catalogs'),
          client.get<{ id: number; code: string | null; name: string; isActive: boolean }[]>('sites'),
          client.get<{ id: number; name: string; description: string | null; isActive: boolean }[]>('categories'),
          client.get<{ id: number; name: string; email: string; roles: string; isActive: boolean }[]>('users'),
        ]);
        return {
          ...(catalogs as object),
          sites: sites.map(({ id, code, name, isActive }) => ({ id, code, name, isActive })),
          categories: categories.map(({ id, name, description, isActive }) => ({ id, name, description, isActive })),
          users: users.map(({ id, name, email, roles, isActive }) => ({ id, name, email, role: roles, isActive })),
        };
      }),
  );

  server.registerTool(
    'search_tickets',
    {
      title: 'Buscar tickets',
      description:
        'Lista tickets con filtros. "search" busca en código, título, descripción, solicitante, productos y documentos. Devuelve un resumen; usa get_ticket para el detalle.',
      inputSchema: {
        search: z.string().optional(),
        status: z.array(z.enum(STATUSES)).optional(),
        onlyOpen: z.boolean().optional().describe('Solo abiertos, en análisis, esperando información o escalados'),
        siteId: z.number().int().positive().optional(),
        categoryId: z.number().int().positive().optional(),
        priority: z.enum(PRIORITIES).optional(),
        rootCause: z.enum(ROOT_CAUSES).optional(),
        assigneeId: z.number().int().positive().optional(),
        from: DATE.optional().describe('Reportado desde (YYYY-MM-DD)'),
        to: DATE.optional().describe('Reportado hasta (YYYY-MM-DD)'),
        limit: z.number().int().min(1).max(100).default(20),
        offset: z.number().int().min(0).default(0),
      },
      annotations: { readOnlyHint: true },
    },
    (args) =>
      run(async () => {
        const result = await client.get<{ data: TicketSummary[]; total: number }>('tickets', {
          ...args,
          status: args.status?.join(','),
          from: args.from ? `${args.from}T00:00:00` : undefined,
          to: args.to ? `${args.to}T23:59:59` : undefined,
        });
        return { total: result.total, tickets: result.data.map(summarize) };
      }),
  );

  server.registerTool(
    'get_ticket',
    {
      title: 'Ver ticket',
      description:
        'Detalle completo de un ticket por código (TK-00012) o id, con su historial: cambios de estado, notas internas y públicas, y respuestas del solicitante.',
      inputSchema: { term: z.string().min(1).describe('Código TK-00012 o id numérico') },
      annotations: { readOnlyHint: true },
    },
    ({ term }) => run(() => client.get(`tickets/${encodeURIComponent(term)}`)),
  );

  server.registerTool(
    'create_ticket',
    {
      title: 'Crear ticket',
      description:
        'Registra un ticket nuevo. Usa get_catalogs para obtener ids de sede, categoría y usuario.',
      inputSchema: ticketFields,
    },
    (args) => run(async () => summarize(await client.post<TicketSummary>('tickets', args))),
  );

  server.registerTool(
    'update_ticket',
    {
      title: 'Editar ticket',
      description:
        'Actualiza campos de un ticket (clasificación, diagnóstico, responsable, productos, evidencias...). No cambia el estado: para eso usa change_status.',
      inputSchema: {
        id: z.number().int().positive(),
        ...Object.fromEntries(
          Object.entries(ticketFields).map(([key, schema]) => [key, schema.optional()]),
        ),
      },
    },
    ({ id, ...fields }) =>
      run(async () => summarize(await client.patch<TicketSummary>(`tickets/${id}`, fields))),
  );

  server.registerTool(
    'change_status',
    {
      title: 'Cambiar estado',
      description:
        'Cambia el estado del ticket. Para CLOSED se exigen rootCause y closureComment (si el ticket no los tiene). Pasar de RESOLVED/CLOSED/CANCELLED a otro estado lo reabre.',
      inputSchema: {
        id: z.number().int().positive(),
        status: z.enum(STATUSES),
        note: z.string().max(4000).optional().describe('Nota interna del cambio'),
        rootCause: z.enum(ROOT_CAUSES).optional(),
        closureComment: z.string().optional().describe('Comentario de cierre; el solicitante lo ve en el portal'),
      },
    },
    ({ id, ...body }) =>
      run(async () => summarize(await client.patch<TicketSummary>(`tickets/${id}/status`, body))),
  );

  server.registerTool(
    'add_note',
    {
      title: 'Agregar nota',
      description:
        'Agrega una nota al historial. isPublic=false (por defecto) = nota interna, solo para TI. isPublic=true = respuesta que el solicitante ve en el portal: escríbela clara, amable y sin datos internos.',
      inputSchema: {
        id: z.number().int().positive(),
        note: z.string().min(2).max(4000),
        isPublic: z.boolean().default(false),
      },
    },
    ({ id, note, isPublic }) => run(() => client.post(`tickets/${id}/notes`, { note, isPublic })),
  );

  server.registerTool(
    'get_follow_up_link',
    {
      title: 'Enlace de seguimiento',
      description:
        'Devuelve el enlace privado para que el solicitante siga su ticket en el portal y responda sin iniciar sesión.',
      inputSchema: { id: z.number().int().positive() },
    },
    ({ id }) =>
      run(async () => {
        const { token } = await client.post<{ token: string }>(`tickets/${id}/public-link`);
        return {
          token,
          url: appUrl ? `${appUrl}/#/portal/t/${token}` : null,
          hint: appUrl ? undefined : 'Define RESOLVO_APP_URL para recibir la URL completa',
        };
      }),
  );

  server.registerTool(
    'get_metrics',
    {
      title: 'Métricas',
      description: 'Indicadores generales: totales, tiempos de respuesta y resolución, distribución por estado, sede, categoría, prioridad y responsable.',
      inputSchema: {
        from: DATE.optional(),
        to: DATE.optional(),
        siteId: z.number().int().positive().optional(),
        categoryId: z.number().int().positive().optional(),
        weeks: z.number().int().min(4).max(52).optional(),
      },
      annotations: { readOnlyHint: true },
    },
    (args) =>
      run(() =>
        client.get('metrics/summary', {
          ...args,
          from: args.from ? `${args.from}T00:00:00` : undefined,
          to: args.to ? `${args.to}T23:59:59` : undefined,
        }),
      ),
  );

  server.registerTool(
    'get_report',
    {
      title: 'Reporte',
      description:
        'Reporte del período agrupado por mes o semana: recibidos, resueltos, tiempos, por responsable, por sede, categoría, prioridad, causa raíz y solicitante, y pendientes. includeTickets=true agrega el detalle de tickets.',
      inputSchema: {
        from: DATE,
        to: DATE,
        groupBy: z.enum(['month', 'week']).default('month'),
        siteId: z.number().int().positive().optional(),
        categoryId: z.number().int().positive().optional(),
        priority: z.enum(PRIORITIES).optional(),
        assigneeId: z.number().int().positive().optional(),
        includeTickets: z.boolean().default(false),
      },
      annotations: { readOnlyHint: true },
    },
    ({ includeTickets, ...args }) =>
      run(async () => {
        const report = await client.get<Record<string, unknown>>('reports', { ...args, timeZone });
        if (includeTickets) return report;
        const { tickets: _tickets, ...summary } = report;
        return summary;
      }),
  );

  server.registerTool(
    'list_notifications',
    {
      title: 'Notificaciones',
      description: 'Notificaciones recientes del usuario de la IA: tickets nuevos del portal, respuestas de solicitantes y asignaciones.',
      annotations: { readOnlyHint: true },
    },
    () => run(() => client.get('notifications', { limit: 20 })),
  );
};
