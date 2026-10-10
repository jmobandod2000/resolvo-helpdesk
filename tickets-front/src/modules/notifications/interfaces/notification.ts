export type NotificationType = 'NEW_PORTAL_TICKET' | 'REQUESTER_REPLY' | 'TICKET_ASSIGNED';

export interface AppNotification {
  id: number;
  type: NotificationType;
  actorName: string | null;
  readAt: string | null;
  createdAt: string;
  Ticket: { id: number; code: string; title: string };
}

export interface NotificationsFeed {
  items: AppNotification[];
  unread: number;
}
