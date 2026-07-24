import { Injectable } from '@nestjs/common';
import { getTenantDataSource } from '../../core/database/tenant.context';

@Injectable()
export class ServiceCatalogService {
  async findCategories() {
    const ds = getTenantDataSource();
    return ds.query(`SELECT * FROM service_categories WHERE is_active = true ORDER BY sort_order, name`);
  }

  async findItems(categoryId?: string) {
    const ds = getTenantDataSource();
    const where = categoryId ? `WHERE si.category_id = $1 AND si.is_active = true` : `WHERE si.is_active = true`;
    const params = categoryId ? [categoryId] : [];
    return ds.query(`SELECT si.*, sc.name AS category_name FROM service_items si
      JOIN service_categories sc ON sc.id = si.category_id ${where} ORDER BY si.sort_order, si.name`, params);
  }

  async submitRequest(itemId: string, requesterId: string, fieldValues: Record<string, unknown>) {
    const ds = getTenantDataSource();
    // Create a ticket first
    const item = await ds.query(`SELECT * FROM service_items WHERE id = $1`, [itemId]);
    if (!item.length) throw new Error('Item não encontrado');
    const si = item[0];

    const [ticket] = await ds.query(
      `INSERT INTO tickets (title, status, priority, requester_id, team_id, sla_policy_id, source, created_by_id)
       VALUES ($1,'new','medium',$2,$3,$4,'portal',$2) RETURNING *`,
      [`Solicitação: ${si.name}`, requesterId, si.auto_assign_team_id, si.sla_policy_id],
    );

    const status = si.approval_required ? 'pending_approval' : 'approved';
    const [request] = await ds.query(
      `INSERT INTO service_requests (service_item_id, ticket_id, requester_id, status, approver_id, field_values)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [itemId, ticket.id, requesterId, status, si.approver_id ?? null, JSON.stringify(fieldValues)],
    );

    return { ticket, request };
  }
}
