import { api } from 'src/boot/axios';
import { i18n } from 'src/i18n';
import type { ReportFilters, TicketsReport } from '../interfaces/report';

const browserTimeZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

export const getTicketsReport = async (filters: ReportFilters) => {
  const resp = await api.get<TicketsReport>('reports', {
    timeout: 1000 * 30,
    timeoutErrorMessage: i18n.global.t('errors.timeout.reports'),
    params: {
      from: filters.from,
      to: filters.to,
      groupBy: filters.groupBy,
      timeZone: browserTimeZone(),
      ...(filters.siteId && { siteId: filters.siteId }),
      ...(filters.categoryId && { categoryId: filters.categoryId }),
      ...(filters.priority && { priority: filters.priority }),
      ...(filters.assigneeId && { assigneeId: filters.assigneeId }),
    },
  });
  return resp.data;
};
