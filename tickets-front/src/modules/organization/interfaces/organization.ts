export interface Organization {
  id: number;
  name: string;
  taxId: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  website: string | null;
  updatedAt: string;
}

export interface OrganizationPayload {
  name: string;
  taxId: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  website: string | null;
}

export interface PublicProfile {
  configured: boolean;
  name: string | null;
}

export interface SiteSummary {
  id: number;
  code: string | null;
  name: string;
}

export interface Site extends SiteSummary {
  isActive: boolean;
  _count: { Tickets: number };
}

export interface SitePayload {
  code: string | null;
  name: string;
  isActive?: boolean;
}

export enum OrganizationRoutes {
  SETUP = 'setup',
  SETTINGS = 'settings',
}
