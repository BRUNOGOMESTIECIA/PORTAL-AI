import { Injectable, Logger } from '@nestjs/common';
import { getTenantDataSource } from '../../core/database/tenant.context';
import * as crypto from 'crypto';

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  async deliver(tenantDataSource: any, tenantSlug: string, eventType: string, payload: Record<string, unknown>): Promise<void> {
    const ds = getTenantDataSource();
    const endpoints = await ds.query(
      `SELECT * FROM webhook_endpoints WHERE is_active = true AND $1 = ANY(events)`,
      [eventType],
    );

    for (const endpoint of endpoints) {
      await ds.query(
        `INSERT INTO webhook_deliveries (endpoint_id, event_type, payload, status)
         VALUES ($1,$2,$3,'pending') RETURNING *`,
        [endpoint.id, eventType, JSON.stringify(payload)],
      );

      // Deliver synchronously (in production, use BullMQ queue with retry)
      try {
        const body = JSON.stringify({ event: eventType, data: payload, timestamp: new Date().toISOString() });
        const signature = this.sign(body, endpoint.secret);
        const response = await fetch(endpoint.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Portal-Signature': signature, 'X-Tenant': tenantSlug },
          body,
          signal: AbortSignal.timeout(endpoint.timeout_seconds * 1000),
        });
        await ds.query(
          `UPDATE webhook_deliveries SET status = 'delivered', response_status = $1 WHERE endpoint_id = $2 AND status = 'pending'`,
          [response.status, endpoint.id],
        );
      } catch (err: unknown) {
        this.logger.error(`Webhook delivery failed: ${(err as Error).message}`);
        await ds.query(
          `UPDATE webhook_deliveries SET status = 'failed' WHERE endpoint_id = $1 AND status = 'pending'`,
          [endpoint.id],
        );
      }
    }
  }

  // ─── Inbound webhook (external system closing ticket) ───────────────────────

  async processInbound(source: string, externalId: string, eventType: string, payload: Record<string, unknown>): Promise<void> {
    const ds = getTenantDataSource();
    await ds.query(
      `INSERT INTO webhook_inbound_logs (source, external_id, event_type, payload) VALUES ($1,$2,$3,$4)`,
      [source, externalId, eventType, JSON.stringify(payload)],
    );

    if (eventType === 'ticket.acknowledged') {
      const rows = await ds.query(`SELECT id FROM tickets WHERE external_id = $1`, [externalId]);
      if (rows.length) {
        await ds.query(`UPDATE tickets SET status = 'closed', closed_at = now(), updated_at = now() WHERE id = $1`, [rows[0].id]);
        await ds.query(`UPDATE webhook_inbound_logs SET processed = true, ticket_id = $1 WHERE external_id = $2`, [rows[0].id, externalId]);
      }
    }
  }

  private sign(body: string, secret: string): string {
    return `sha256=${crypto.createHmac('sha256', secret).update(body).digest('hex')}`;
  }

  async findAll() {
    const ds = getTenantDataSource();
    return ds.query(`SELECT * FROM webhook_endpoints ORDER BY created_at DESC`);
  }
}
