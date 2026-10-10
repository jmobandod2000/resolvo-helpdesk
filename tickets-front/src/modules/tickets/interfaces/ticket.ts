import type { SiteSummary } from 'src/modules/organization/interfaces/organization';

export type TicketStatus =
  | 'OPEN'
  | 'IN_ANALYSIS'
  | 'WAITING_INFO'
  | 'ESCALATED_DEV'
  | 'RESOLVED'
  | 'CLOSED'
  | 'CANCELLED';

export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';


export type TicketChannel = 'WHATSAPP' | 'EMAIL' | 'CALL' | 'IN_PERSON' | 'OTHER';

export type TicketCategory =
  | 'INVENTORY'
  | 'RECEIVING'
  | 'RECHECK'
  | 'PICKING'
  | 'CYCLE_COUNT'
  | 'TRANSFERS'
  | 'BILLING'
  | 'REPORTS'
  | 'SYSTEM'
  | 'OTHER';

export type RootCause =
  | 'OPERATIONAL_ERROR'
  | 'SYSTEM_DEFECT'
  | 'USER_MISINTERPRETATION'
  | 'MASTER_DATA'
  | 'NO_ISSUE'
  | 'OTHER';

export type TicketEventType = 'CREATED' | 'STATUS_CHANGED' | 'NOTE' | 'ASSIGNED' | 'UPDATED';

export interface UserSummary {
  id: number;
  name: string;
  email: string;
}

export interface Ticket {
  id: number;
  code: string;
  title: string;
  description: string;
  requesterName: string;
  requesterArea: string | null;
  siteId: number | null;
  Site: SiteSummary | null;
  channel: TicketChannel;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  rootCause: RootCause | null;
  productCodes: string[];
  documents: string[];
  affectedUnits: number | null;
  diagnosis: string | null;
  closureComment: string | null;
  devRequestRef: string | null;
  evidencePaths: string[];
  reportedAt: string;
  firstResponseAt: string | null;
  resolvedAt: string | null;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
  assigneeId: number | null;
  Assignee: UserSummary | null;
  CreatedBy: UserSummary;
}

export interface TicketEvent {
  id: number;
  type: TicketEventType;
  fromStatus: TicketStatus | null;
  toStatus: TicketStatus | null;
  note: string | null;
  createdAt: string;
  User: UserSummary;
}

export interface TicketDetail extends Ticket {
  Events: TicketEvent[];
}

export interface TicketFilters {
  search: string;
  status: TicketStatus[];
  siteId: number | null;
  category: TicketCategory | null;
  priority: TicketPriority | null;
  rootCause: RootCause | null;
  assigneeId: number | null;
  onlyOpen: boolean;
}

export interface TicketPayload {
  title: string;
  description: string;
  requesterName: string;
  requesterArea?: string | undefined;
  siteId: number | null;
  channel: TicketChannel;
  category: TicketCategory;
  priority: TicketPriority;
  productCodes: string[];
  documents: string[];
  affectedUnits?: number | undefined;
  diagnosis?: string | undefined;
  devRequestRef?: string | undefined;
  evidencePaths: string[];
  assigneeId?: number | undefined;
  reportedAt: string;
  rootCause?: RootCause | undefined;
  closureComment?: string | undefined;
}

export interface ChangeStatusPayload {
  status: TicketStatus;
  note?: string | undefined;
  rootCause?: RootCause | undefined;
  closureComment?: string | undefined;
}
