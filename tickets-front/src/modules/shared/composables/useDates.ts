import dayjs from 'dayjs';
import 'dayjs/locale/es';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);
dayjs.locale('es');

const useDates = () => {
  const formatDateTime = (value?: string | null) =>
    value ? dayjs(value).format('DD/MM/YYYY HH:mm') : '—';

  const formatDate = (value?: string | null) => (value ? dayjs(value).format('DD/MM/YYYY') : '—');

  const fromNow = (value?: string | null) => (value ? dayjs(value).fromNow() : '—');

  const toInputDateTime = (value?: string | null) =>
    dayjs(value ?? undefined).format('YYYY-MM-DDTHH:mm');

  const toIsoString = (value: string) => dayjs(value).toISOString();

  const formatHours = (hours: number | null) => {
    if (hours === null) return '—';
    if (hours < 24) return `${hours} h`;
    return `${Math.round((hours / 24) * 10) / 10} días`;
  };

  return { formatDateTime, formatDate, fromNow, toInputDateTime, toIsoString, formatHours };
};

export default useDates;
