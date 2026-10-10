import { api } from 'src/boot/axios';
import { i18n } from 'src/i18n';
import type {
  Category,
  CategoryPayload,
  Organization,
  OrganizationPayload,
  PortalSettingsPayload,
  PublicProfile,
  Site,
  SitePayload,
} from '../interfaces/organization';

const requestOptions = () => ({
  timeout: 1000 * 10,
  timeoutErrorMessage: i18n.global.t('errors.timeout.organization'),
});

export const getPublicProfile = async () => {
  const resp = await api.get<PublicProfile>('organization/public', requestOptions());
  return resp.data;
};

export const getOrganization = async () => {
  const resp = await api.get<Organization | null>('organization', requestOptions());
  return resp.data || null;
};

export const saveOrganization = async (payload: OrganizationPayload) => {
  const resp = await api.put<Organization>('organization', payload, requestOptions());
  return resp.data;
};

export const savePortalSettings = async (payload: PortalSettingsPayload) => {
  const resp = await api.patch<Organization>('organization/portal', payload, requestOptions());
  return resp.data;
};

export const getSites = async () => {
  const resp = await api.get<Site[]>('sites', requestOptions());
  return resp.data;
};

export const createSite = async (payload: SitePayload) => {
  const resp = await api.post<Site>('sites', payload, requestOptions());
  return resp.data;
};

export const updateSite = async (id: number, payload: Partial<SitePayload>) => {
  const resp = await api.patch<Site>(`sites/${id}`, payload, requestOptions());
  return resp.data;
};

export const deleteSite = async (id: number) => {
  const resp = await api.delete<Site>(`sites/${id}`, requestOptions());
  return resp.data;
};

export const getCategories = async () => {
  const resp = await api.get<Category[]>('categories', requestOptions());
  return resp.data;
};

export const createCategory = async (payload: CategoryPayload) => {
  const resp = await api.post<Category>('categories', payload, requestOptions());
  return resp.data;
};

export const updateCategory = async (id: number, payload: Partial<CategoryPayload>) => {
  const resp = await api.patch<Category>(`categories/${id}`, payload, requestOptions());
  return resp.data;
};

export const deleteCategory = async (id: number) => {
  const resp = await api.delete<Category>(`categories/${id}`, requestOptions());
  return resp.data;
};
