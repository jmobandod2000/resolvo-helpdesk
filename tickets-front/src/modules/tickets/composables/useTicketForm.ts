import { ref } from 'vue';

import useDates from 'src/modules/shared/composables/useDates';
import type {
  Company,
  RootCause,
  Ticket,
  TicketCategory,
  TicketChannel,
  TicketPayload,
  TicketPriority,
} from '../interfaces/ticket';

export interface TicketFormModel {
  title: string;
  description: string;
  requesterName: string;
  requesterArea: string;
  company: Company | null;
  channel: TicketChannel;
  category: TicketCategory | null;
  priority: TicketPriority;
  productCodes: string[];
  documents: string[];
  affectedUnits: number | null;
  diagnosis: string;
  devRequestRef: string;
  evidencePaths: string[];
  assigneeId: number | null;
  reportedAt: string;
  rootCause: RootCause | null;
  closureComment: string;
}

const optionalText = (value: string) => value.trim() || undefined;

export const useTicketForm = () => {
  const { toInputDateTime, toIsoString } = useDates();

  const buildEmptyForm = (): TicketFormModel => ({
    title: '',
    description: '',
    requesterName: '',
    requesterArea: '',
    company: null,
    channel: 'WHATSAPP',
    category: null,
    priority: 'MEDIUM',
    productCodes: [],
    documents: [],
    affectedUnits: null,
    diagnosis: '',
    devRequestRef: '',
    evidencePaths: [],
    assigneeId: null,
    reportedAt: toInputDateTime(),
    rootCause: null,
    closureComment: '',
  });

  const form = ref<TicketFormModel>(buildEmptyForm());

  const loadTicket = (ticket: Ticket) => {
    form.value = {
      title: ticket.title,
      description: ticket.description,
      requesterName: ticket.requesterName,
      requesterArea: ticket.requesterArea ?? '',
      company: ticket.company,
      channel: ticket.channel,
      category: ticket.category,
      priority: ticket.priority,
      productCodes: [...ticket.productCodes],
      documents: [...ticket.documents],
      affectedUnits: ticket.affectedUnits,
      diagnosis: ticket.diagnosis ?? '',
      devRequestRef: ticket.devRequestRef ?? '',
      evidencePaths: [...ticket.evidencePaths],
      assigneeId: ticket.assigneeId,
      reportedAt: toInputDateTime(ticket.reportedAt),
      rootCause: ticket.rootCause,
      closureComment: ticket.closureComment ?? '',
    };
  };

  const resetForm = () => {
    form.value = buildEmptyForm();
  };

  const buildPayload = (): TicketPayload => {
    const value = form.value;
    return {
      title: value.title.trim(),
      description: value.description.trim(),
      requesterName: value.requesterName.trim(),
      requesterArea: optionalText(value.requesterArea),
      company: value.company as Company,
      channel: value.channel,
      category: value.category as TicketCategory,
      priority: value.priority,
      productCodes: value.productCodes,
      documents: value.documents,
      affectedUnits: value.affectedUnits ?? undefined,
      diagnosis: optionalText(value.diagnosis),
      devRequestRef: optionalText(value.devRequestRef),
      evidencePaths: value.evidencePaths,
      assigneeId: value.assigneeId ?? undefined,
      reportedAt: toIsoString(value.reportedAt),
      rootCause: value.rootCause ?? undefined,
      closureComment: optionalText(value.closureComment),
    };
  };

  return { form, loadTicket, resetForm, buildPayload };
};
