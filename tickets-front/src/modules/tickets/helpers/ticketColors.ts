import type { TicketPriority, TicketStatus } from '../interfaces/ticket';

export const STATUS_COLORS: Record<TicketStatus, string> = {
  OPEN: 'blue-7',
  IN_ANALYSIS: 'indigo-6',
  WAITING_INFO: 'orange-8',
  ESCALATED_DEV: 'deep-purple-6',
  RESOLVED: 'teal-7',
  CLOSED: 'green-8',
  CANCELLED: 'grey-6',
};

export const PRIORITY_COLORS: Record<TicketPriority, string> = {
  LOW: 'grey-6',
  MEDIUM: 'blue-6',
  HIGH: 'orange-8',
  CRITICAL: 'red-8',
};

export const OPEN_STATUSES: TicketStatus[] = ['OPEN', 'IN_ANALYSIS', 'WAITING_INFO', 'ESCALATED_DEV'];
