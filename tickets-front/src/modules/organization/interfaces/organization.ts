export interface Organization {
  id: number;
  name: string;
  taxId: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  website: string | null;
  portalEnabled: boolean;
  portalMessage: string | null;
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

export interface PortalSettingsPayload {
  portalEnabled: boolean;
  portalMessage: string | null;
}

export interface PublicProfile {
  configured: boolean;
  name: string | null;
  portalEnabled: boolean;
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

export interface CategorySummary {
  id: number;
  name: string;
}

export interface Category extends CategorySummary {
  description: string | null;
  isActive: boolean;
  _count: { Tickets: number };
}

export interface CategoryPayload {
  name: string;
  description: string | null;
  isActive?: boolean;
}

export enum OrganizationRoutes {
  SETUP = 'setup',
  SETTINGS = 'settings',
}
