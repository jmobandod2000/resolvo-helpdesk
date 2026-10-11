import type { TicketStatus } from 'src/modules/tickets/interfaces/ticket';

export interface PortalSite {
  id: number;
  label: string;
}

export interface PortalCategory {
  id: number;
  name: string;
  description: string | null;
}

export interface PortalConfig {
  enabled: boolean;
  organizationName: string | null;
  message?: string | null;
  contactEmail?: string | null;
  emailEnabled?: boolean;
  sites?: PortalSite[];
  categories?: PortalCategory[];
}

export interface PortalTicketPayload {
  title: string;
  description: string;
  requesterName: string;
  requesterArea?: string;
  requesterEmail?: string;
  siteId?: number;
  categoryId?: number;
  urgent: boolean;
  website: string;
  elapsedMs: number;
}

export interface PortalTicketCreated {
  code: string;
  token: string;
  duplicate: boolean;
}

export type PortalEventType = 'CREATED' | 'STATUS_CHANGED' | 'NOTE';

export interface PortalEvent {
  type: PortalEventType;
  toStatus: TicketStatus | null;
  message: string | null;
  fromRequester: boolean;
  authorName: string;
  createdAt: string;
}

export interface PortalTicket {
  code: string;
  title: string;
  description: string;
  status: TicketStatus;
  requesterName: string;
  site: string | null;
  category: string | null;
  assignee: string | null;
  reportedAt: string;
  resolvedAt: string | null;
  closedAt: string | null;
  resolution: string | null;
  canReply: boolean;
  events: PortalEvent[];
}

export interface MyRequestItem {
  code: string;
  title: string;
  status: TicketStatus;
  reportedAt: string;
  updatedAt: string;
  token: string;
}

export interface MyRequests {
  email: string;
  expiresAt: string;
  tickets: MyRequestItem[];
}

export interface SavedPortalTicket {
  code: string;
  title: string;
  token: string;
  createdAt: string;
}

export interface RequesterProfile {
  requesterName: string;
  requesterArea: string;
  requesterEmail: string;
  siteId: number | null;
}

export enum PortalRoutes {
  HOME = 'portal',
  NEW = 'portal-new',
  TRACK = 'portal-track',
  MY_REQUESTS = 'portal-my-requests',
}
