import {
  RootCause,
  TicketChannel,
  TicketPriority,
  TicketStatus,
} from '@prisma/client';

export const OPEN_STATUSES: TicketStatus[] = [
  TicketStatus.OPEN,
  TicketStatus.IN_ANALYSIS,
  TicketStatus.WAITING_INFO,
  TicketStatus.ESCALATED_DEV,
];

export const DONE_STATUSES: TicketStatus[] = [
  TicketStatus.RESOLVED,
  TicketStatus.CLOSED,
];

export const STATUS_LABELS: Record<TicketStatus, string> = {
  OPEN: 'Abierto',
  IN_ANALYSIS: 'En análisis',
  WAITING_INFO: 'Esperando información',
  ESCALATED_DEV: 'Escalado a desarrollo',
  RESOLVED: 'Resuelto',
  CLOSED: 'Cerrado',
  CANCELLED: 'Cancelado',
};

export const PRIORITY_LABELS: Record<TicketPriority, string> = {
  LOW: 'Baja',
  MEDIUM: 'Media',
  HIGH: 'Alta',
  CRITICAL: 'Crítica',
};

export const CHANNEL_LABELS: Record<TicketChannel, string> = {
  WHATSAPP: 'WhatsApp',
  EMAIL: 'Correo',
  CALL: 'Llamada',
  IN_PERSON: 'Presencial',
  PORTAL: 'Portal',
  OTHER: 'Otro',
};

export const ROOT_CAUSE_LABELS: Record<RootCause, string> = {
  OPERATIONAL_ERROR: 'Error operativo',
  SYSTEM_DEFECT: 'Defecto del sistema',
  USER_MISINTERPRETATION: 'Mala interpretación del usuario',
  MASTER_DATA: 'Datos maestros',
  NO_ISSUE: 'Sin incidencia',
  OTHER: 'Otro',
};
