import { Injectable, Logger } from '@nestjs/common';
import { TicketStatus } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import {
  AppLanguage,
  resolveLanguage,
  translate,
  TranslationArgs,
} from '../../i18n';
import { generatePublicToken } from '../../common/utils/public-token';
import { renderEmail } from '../helpers/email-template.helper';
import { MailService } from './mail.service';

const STATUS_EMAILS: TicketStatus[] = [
  TicketStatus.WAITING_INFO,
  TicketStatus.RESOLVED,
  TicketStatus.CLOSED,
  TicketStatus.CANCELLED,
];

interface Recipient {
  id: number;
  code: string;
  title: string;
  email: string;
  language: AppLanguage;
  token: string;
  organizationName: string;
  closureComment: string | null;
}

@Injectable()
export class RequesterMailService {
  private readonly logger = new Logger(RequesterMailService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly mailService: MailService,
  ) {}

  get appUrl() {
    return this.mailService.appUrl;
  }

  get from() {
    return this.mailService.from;
  }

  isEnabled() {
    return this.mailService.isConfigured();
  }

  ticketReceived(ticketId: number) {
    this.dispatch(ticketId, (recipient, t) => ({
      subject: t('emails.received.subject', { code: recipient.code }),
      heading: t('emails.received.heading', { code: recipient.code }),
      intro: t('emails.received.intro', { title: recipient.title }),
    }));
  }

  publicReply(ticketId: number, message: string) {
    this.dispatch(ticketId, (recipient, t) => ({
      subject: t('emails.reply.subject', { code: recipient.code }),
      heading: t('emails.reply.heading', { code: recipient.code }),
      intro: t('emails.reply.intro', { title: recipient.title }),
      message,
      messageTitle: t('emails.common.messageTitle'),
    }));
  }

  statusChanged(ticketId: number, status: TicketStatus) {
    if (!STATUS_EMAILS.includes(status)) return;
    this.dispatch(ticketId, (recipient, t) => ({
      subject: t(`emails.status.${status}.subject`, { code: recipient.code }),
      heading: t(`emails.status.${status}.heading`, { code: recipient.code }),
      intro: t(`emails.status.${status}.intro`, { title: recipient.title }),
      ...(status === TicketStatus.CLOSED && recipient.closureComment
        ? {
            message: recipient.closureComment,
            messageTitle: t('emails.common.solutionTitle'),
          }
        : {}),
    }));
  }

  async sendAccessLink(email: string, url: string, language: AppLanguage) {
    const organizationName = await this.organizationName();
    const t = (key: string, args?: TranslationArgs) =>
      translate(language, key, args);
    return this.mailService.send({
      to: email,
      subject: t('emails.access.subject'),
      ...renderEmail({
        organizationName,
        heading: t('emails.access.heading'),
        intro: t('emails.access.intro'),
        ctaLabel: t('emails.access.cta'),
        ctaUrl: url,
        footer: t('emails.access.footer'),
      }),
    });
  }

  async sendTest(email: string, language: AppLanguage) {
    const organizationName = await this.organizationName();
    const t = (key: string) => translate(language, key);
    return this.mailService.send({
      to: email,
      subject: t('emails.test.subject'),
      ...renderEmail({
        organizationName,
        heading: t('emails.test.heading'),
        intro: t('emails.test.intro'),
        ctaLabel: t('emails.test.cta'),
        ctaUrl: `${this.mailService.appUrl}/#/portal`,
        footer: t('emails.common.footer'),
      }),
    });
  }

  private dispatch(
    ticketId: number,
    build: (
      recipient: Recipient,
      t: (key: string, args?: TranslationArgs) => string,
    ) => {
      subject: string;
      heading: string;
      intro: string;
      message?: string;
      messageTitle?: string;
    },
  ) {
    void this.loadRecipient(ticketId)
      .then(async (recipient) => {
        if (!recipient) return;
        const t = (key: string, args?: TranslationArgs) =>
          translate(recipient.language, key, args);
        const content = build(recipient, t);
        await this.mailService.send({
          to: recipient.email,
          subject: content.subject,
          ...renderEmail({
            organizationName: recipient.organizationName,
            heading: content.heading,
            intro: content.intro,
            message: content.message,
            messageTitle: content.messageTitle,
            ctaLabel: t('emails.common.cta'),
            ctaUrl: `${this.mailService.appUrl}/#/portal/t/${recipient.token}`,
            footer: t('emails.common.footer'),
          }),
        });
      })
      .catch((error) =>
        this.logger.error(
          `No se pudo preparar el correo del ticket ${ticketId}`,
          error instanceof Error ? error.message : error,
        ),
      );
  }

  private async loadRecipient(ticketId: number): Promise<Recipient | null> {
    if (!this.mailService.isConfigured()) return null;

    const [organization, ticket] = await Promise.all([
      this.prismaService.organization.findUnique({ where: { id: 1 } }),
      this.prismaService.ticket.findFirst({
        where: { id: ticketId, isDeleted: false },
      }),
    ]);
    if (
      !organization?.portalEnabled ||
      !organization.portalEmailEnabled ||
      !ticket?.requesterEmail ||
      !ticket.code
    )
      return null;

    const token =
      ticket.publicToken ??
      (
        await this.prismaService.ticket.update({
          where: { id: ticket.id },
          data: { publicToken: generatePublicToken() },
          select: { publicToken: true },
        })
      ).publicToken!;

    return {
      id: ticket.id,
      code: ticket.code,
      title: ticket.title,
      email: ticket.requesterEmail,
      language: resolveLanguage(ticket.requesterLanguage ?? undefined),
      token,
      organizationName: organization.name,
      closureComment: ticket.closureComment,
    };
  }

  private async organizationName() {
    const organization = await this.prismaService.organization.findUnique({
      where: { id: 1 },
      select: { name: true },
    });
    return organization?.name ?? 'Resolvo';
  }
}
