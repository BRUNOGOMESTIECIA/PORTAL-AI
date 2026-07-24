import { Injectable, Logger } from '@nestjs/common';
import { getTenantDataSource } from '../../core/database/tenant.context';
import { AutomationLogStatus } from '@portal/shared';

interface AutomationCondition { field: string; operator: string; value: unknown; }
interface AutomationAction { type: string; params: Record<string, unknown>; }

@Injectable()
export class AutomationService {
  private readonly logger = new Logger(AutomationService.name);

  async evaluate(triggerType: string, entity: Record<string, unknown>): Promise<void> {
    const ds = getTenantDataSource();
    const rules = await ds.query(
      `SELECT * FROM automation_rules WHERE trigger_type = $1 AND is_active = true`,
      [triggerType],
    );

    for (const rule of rules) {
      const conditions: AutomationCondition[] = rule.trigger_conditions ?? [];
      const matches = conditions.every((c) => this.evaluateCondition(c, entity));

      if (!matches) {
        await this.logExecution(rule.id, entity['id'] as string, typeof entity['id'] === 'string' ? 'ticket' : 'unknown', AutomationLogStatus.SKIPPED, []);
        continue;
      }

      const actions: AutomationAction[] = rule.actions ?? [];
      const executedActions: unknown[] = [];

      for (const action of actions) {
        try {
          await this.executeAction(action, entity);
          executedActions.push({ type: action.type, status: 'success' });
        } catch (err: unknown) {
          executedActions.push({ type: action.type, status: 'failed', error: (err as Error).message });
        }
      }

      await ds.query(
        `UPDATE automation_rules SET run_count = run_count + 1, last_run_at = now() WHERE id = $1`,
        [rule.id],
      );

      await this.logExecution(rule.id, entity['id'] as string, 'ticket', AutomationLogStatus.SUCCESS, executedActions);
    }
  }

  private evaluateCondition(condition: AutomationCondition, entity: Record<string, unknown>): boolean {
    const val = entity[condition.field];
    switch (condition.operator) {
      case 'eq': return val === condition.value;
      case 'neq': return val !== condition.value;
      case 'contains': return String(val).includes(String(condition.value));
      case 'in': return Array.isArray(condition.value) && (condition.value as unknown[]).includes(val);
      default: return false;
    }
  }

  private async executeAction(action: AutomationAction, entity: Record<string, unknown>): Promise<void> {
    const ds = getTenantDataSource();
    switch (action.type) {
      case 'assign_ticket':
        await ds.query(`UPDATE tickets SET assignee_id = $1 WHERE id = $2`, [action.params.userId, entity['id']]);
        break;
      case 'set_priority':
        await ds.query(`UPDATE tickets SET priority = $1 WHERE id = $2`, [action.params.priority, entity['id']]);
        break;
      case 'change_status':
        await ds.query(`UPDATE tickets SET status = $1, updated_at = now() WHERE id = $2`, [action.params.status, entity['id']]);
        break;
      default:
        this.logger.warn(`Unknown automation action: ${action.type}`);
    }
  }

  private async logExecution(ruleId: string, entityId: string, entityType: string, status: AutomationLogStatus, actions: unknown[]): Promise<void> {
    const ds = getTenantDataSource();
    await ds.query(
      `INSERT INTO automation_logs (rule_id, trigger_entity_type, trigger_entity_id, status, actions_executed)
       VALUES ($1,$2,$3,$4,$5)`,
      [ruleId, entityType, entityId, status, JSON.stringify(actions)],
    ).catch(() => {}); // non-critical
  }

  async findAll() {
    const ds = getTenantDataSource();
    return ds.query(`SELECT * FROM automation_rules ORDER BY created_at DESC`);
  }

  async create(data: Record<string, unknown>, creatorId: string) {
    const ds = getTenantDataSource();
    const [rule] = await ds.query(
      `INSERT INTO automation_rules (name, description, trigger_type, trigger_conditions, actions, created_by_id)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [data.name, data.description ?? null, data.triggerType, JSON.stringify(data.conditions ?? []), JSON.stringify(data.actions ?? []), creatorId],
    );
    return rule;
  }
}
