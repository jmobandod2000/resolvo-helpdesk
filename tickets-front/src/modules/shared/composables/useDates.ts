import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useI18n } from 'vue-i18n';

import { toDayjsLocale } from './useLocale';

dayjs.extend(relativeTime);

const useDates = () => {
  const { t, locale } = useI18n();

  const formatDateTime = (value?: string | null) =>
    value ? dayjs(value).format('DD/MM/YYYY HH:mm') : '—';

  const formatDate = (value?: string | null) => (value ? dayjs(value).format('DD/MM/YYYY') : '—');

  const fromNow = (value?: string | null) =>
    value ? dayjs(value).locale(toDayjsLocale(locale.value)).fromNow() : '—';

  const toInputDateTime = (value?: string | null) =>
    dayjs(value ?? undefined).format('YYYY-MM-DDTHH:mm');

  const toIsoString = (value: string) => dayjs(value).toISOString();

  const formatNumber = (value?: number | null) =>
    value === null || value === undefined ? '—' : value.toLocaleString(locale.value);

  const formatHours = (hours: number | null) => {
    if (hours === null) return '—';
    if (hours < 24) return t('dates.hours', { n: formatNumber(hours) });
    return t('dates.days', { n: formatNumber(Math.round((hours / 24) * 10) / 10) });
  };

  return {
    formatDateTime,
    formatDate,
    fromNow,
    toInputDateTime,
    toIsoString,
    formatHours,
    formatNumber,
  };
};

export default useDates;
