import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';

export type EmailTemplate =
  | 'ticket_created'
  | 'ticket_updated'
  | 'ticket_assigned'
  | 'ticket_closed'
  | 'ticket_escalated'
  | 'chat_csat'
  | 'sla_breach';

export interface EmailPayload {
  to: string;
  subject: string;
  template: EmailTemplate;
  data: Record<string, unknown>;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;
  private readonly fromName: string;
  private readonly fromEmail: string;

  constructor(private readonly config: ConfigService) {
    this.fromName = config.get('SMTP_FROM_NAME', 'Portal ITSM');
    this.fromEmail = config.get('SMTP_FROM_EMAIL', 'noreply@exemplo.com.br');
    this.transporter = nodemailer.createTransport({
      host: config.get('SMTP_HOST'),
      port: config.get<number>('SMTP_PORT', 587),
      secure: config.get('SMTP_SECURE', 'false') === 'true',
      auth: {
        user: config.get('SMTP_USER'),
        pass: config.get('SMTP_PASSWORD'),
      },
    });
  }

  async send(payload: EmailPayload): Promise<void> {
    const html = this.renderTemplate(payload.template, payload.data);
    const mailOptions: Mail.Options = {
      from: `"${this.fromName}" <${this.fromEmail}>`,
      to: payload.to,
      subject: payload.subject,
      html,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`E-mail enviado com sucesso para ${payload.to} [${payload.template}]`);
    } catch (err: unknown) {
      this.logger.warn(`[SMTP Offline/Dev] Não foi possível entregar e-mail para ${payload.to} (${(err as Error).message}). Log registrado com sucesso.`);
    }
  }


  private renderTemplate(template: EmailTemplate, data: Record<string, unknown>): string {
    // Minimal inline templates — in production, use a template engine (Handlebars, MJML)
    const templates: Record<EmailTemplate, string> = {
      ticket_created: `
        <h2>Novo Chamado Aberto #${data.ticketNumber}</h2>
        <p><strong>Título:</strong> ${data.title}</p>
        <p><strong>Prioridade:</strong> ${data.priority}</p>
        <p><strong>Status:</strong> ${data.status}</p>
        <a href="${data.ticketUrl}">Ver chamado</a>
      `,
      ticket_updated: `
        <h2>Chamado #${data.ticketNumber} Atualizado</h2>
        <p>${data.updateMessage}</p>
        <a href="${data.ticketUrl}">Ver chamado</a>
      `,
      ticket_assigned: `
        <h2>Chamado #${data.ticketNumber} atribuído a você</h2>
        <p><strong>Título:</strong> ${data.title}</p>
        <a href="${data.ticketUrl}">Ver chamado</a>
      `,
      ticket_closed: `
        <h2>Chamado #${data.ticketNumber} Encerrado</h2>
        <p>Seu chamado foi encerrado. Por favor avalie o atendimento.</p>
        <a href="${data.csatUrl}">Avaliar atendimento</a>
      `,
      ticket_escalated: `
        <h2>Chamado #${data.ticketNumber} Escalonado</h2>
        <p>O chamado foi escalonado para ${data.escalatedTo}.</p>
        <a href="${data.ticketUrl}">Ver chamado</a>
      `,
      chat_csat: `
        <h2>Avalie seu atendimento</h2>
        <p>Como foi seu atendimento via chat?</p>
        <a href="${data.csatUrl}">Avaliar agora</a>
      `,
      sla_breach: `
        <h2>⚠️ SLA em Risco — Chamado #${data.ticketNumber}</h2>
        <p>O chamado está prestes a violar o SLA.</p>
        <p><strong>Vencimento:</strong> ${data.dueAt}</p>
        <a href="${data.ticketUrl}">Atender agora</a>
      `,
    };

    return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 24px; }
h2 { color: #0f172a; }
a { background: #3b82f6; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; display: inline-block; margin-top: 16px; }
</style></head>
<body>${templates[template] ?? '<p>Email sem template definido.</p>'}</body>
</html>`;
  }
}
