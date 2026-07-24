export enum AutomationTriggerType {
  TICKET_CREATED = 'ticket_created',
  TICKET_UPDATED = 'ticket_updated',
  TICKET_STATUS_CHANGED = 'ticket_status_changed',
  SLA_BREACHED = 'sla_breached',
  TIME_ELAPSED = 'time_elapsed',
  CHAT_CREATED = 'chat_created',
}

export enum AutomationLogStatus {
  SUCCESS = 'success',
  FAILED = 'failed',
  SKIPPED = 'skipped',
}

export enum WebhookDeliveryStatus {
  PENDING = 'pending',
  DELIVERED = 'delivered',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum ServiceRequestStatus {
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  IN_PROGRESS = 'in_progress',
  FULFILLED = 'fulfilled',
  CANCELLED = 'cancelled',
}
