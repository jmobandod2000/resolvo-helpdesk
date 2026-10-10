import dayjs from 'dayjs';
import { api } from 'src/boot/axios';
import type { MetricsFilters, MetricsSummary } from '../interfaces/metrics';

export const getMetricsSummary = async ({ company, from, to, weeks }: MetricsFilters) => {
  const resp = await api.get<MetricsSummary>('metrics/summary', {
    timeout: 1000 * 20,
    timeoutErrorMessage: 'Tiempo de espera agotado al calcular las métricas',
    params: {
      weeks,
      ...(company && { company }),
      ...(from && { from: dayjs(from).startOf('day').toISOString() }),
      ...(to && { to: dayjs(to).endOf('day').toISOString() }),
    },
  });
  return resp.data;
};
