import { Injectable } from '@nestjs/common';
import { getTenantDataSource } from '../../core/database/tenant.context';

@Injectable()
export class ReportsService {
  async getTicketSummary(fromDate?: string, toDate?: string) {
    const ds = getTenantDataSource();
    const from = fromDate ?? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const to = toDate ?? new Date().toISOString();

    const [byStatus, byPriority, avgResolution, csat] = await Promise.all([
      ds.query(`SELECT status, COUNT(*) FROM tickets WHERE created_at BETWEEN $1 AND $2 GROUP BY status`, [from, to]),
      ds.query(`SELECT priority, COUNT(*) FROM tickets WHERE created_at BETWEEN $1 AND $2 GROUP BY priority`, [from, to]),
      ds.query(`SELECT AVG(EXTRACT(EPOCH FROM (closed_at - created_at))/3600)::numeric(10,2) AS avg_hours
        FROM tickets WHERE closed_at IS NOT NULL AND created_at BETWEEN $1 AND $2`, [from, to]),
      ds.query(`SELECT AVG(csat_score)::numeric(3,2) AS avg_score, COUNT(*) AS responses
        FROM tickets WHERE csat_submitted_at BETWEEN $1 AND $2`, [from, to]),
    ]);

    return { byStatus, byPriority, avgResolutionHours: avgResolution[0]?.avg_hours, csat: csat[0] };
  }

  async getSlaSummary(fromDate?: string, toDate?: string) {
    const ds = getTenantDataSource();
    const from = fromDate ?? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const to = toDate ?? new Date().toISOString();

    return ds.query(`
      SELECT
        COUNT(*) FILTER (WHERE sla_first_response_met = true) AS response_met,
        COUNT(*) FILTER (WHERE sla_first_response_met = false) AS response_breached,
        COUNT(*) FILTER (WHERE sla_resolution_met = true) AS resolution_met,
        COUNT(*) FILTER (WHERE sla_resolution_met = false) AS resolution_breached,
        COUNT(*) FILTER (WHERE sla_first_response_met IS NOT NULL) AS total_measured
      FROM tickets
      WHERE created_at BETWEEN $1 AND $2
    `, [from, to]);
  }

  async getAiUsage() {
    const ds = getTenantDataSource();
    return ds.query(`
      SELECT year, month, input_tokens, output_tokens
      FROM ai_token_usage_monthly
      ORDER BY year DESC, month DESC
      LIMIT 12
    `);
  }
}
