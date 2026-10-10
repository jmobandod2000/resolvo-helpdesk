import dayjs from 'dayjs';
import { api } from 'src/boot/axios';
import { i18n } from 'src/i18n';
import type { MetricsFilters, MetricsSummary } from '../interfaces/metrics';

export const getMetricsSummary = async ({ siteId, from, to, weeks }: MetricsFilters) => {
  const resp = await api.get<MetricsSummary>('metrics/summary', {
    timeout: 1000 * 20,
    timeoutErrorMessage: i18n.global.t('errors.timeout.metrics'),
    params: {
      weeks,
      ...(siteId && { siteId }),
      ...(from && { from: dayjs(from).startOf('day').toISOString() }),
      ...(to && { to: dayjs(to).endOf('day').toISOString() }),
    },
  });
  return resp.data;
};
