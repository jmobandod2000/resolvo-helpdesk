import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, Transporter } from 'nodemailer';

const MAX_ATTEMPTS = 2;
const RETRY_DELAY_MS = 3000;

export interface OutgoingMail {
  to: string;
  subject: string;
  html: string;
  text: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter | null = null;

  constructor(private readonly configService: ConfigService) {}

  get appUrl() {
    return (this.configService.get<string>('APP_URL') ?? '').replace(
      /\/+$/,
      '',
    );
  }

  get from() {
    return this.configService.get<string>('MAIL_FROM') ?? '';
  }

  isConfigured() {
    return (
      !!this.configService.get<string>('SMTP_HOST') &&
      !!this.from &&
      !!this.appUrl
    );
  }

  async send(mail: OutgoingMail) {
    if (!this.isConfigured()) return false;
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
      try {
        await this.getTransporter().sendMail({ from: this.from, ...mail });
        return true;
      } catch (error) {
        if (attempt < MAX_ATTEMPTS) {
          await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
          continue;
        }
        this.logger.error(
          `No se pudo enviar el correo "${mail.subject}"`,
          error instanceof Error ? error.message : error,
        );
      }
    }
    return false;
  }

  private getTransporter() {
    if (this.transporter) return this.transporter;
    const user = this.configService.get<string>('SMTP_USER');
    this.transporter = createTransport({
      pool: true,
      maxConnections: 2,
      host: this.configService.get<string>('SMTP_HOST'),
      port: Number(this.configService.get('SMTP_PORT') ?? 587),
      secure: String(this.configService.get('SMTP_SECURE')) === 'true',
      ...(user && {
        auth: { user, pass: this.configService.get<string>('SMTP_PASS') },
      }),
    });
    return this.transporter;
  }
}
