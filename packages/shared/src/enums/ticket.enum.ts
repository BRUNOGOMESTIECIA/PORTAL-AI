export enum TicketStatus {
  NEW = 'new',
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  PENDING = 'pending',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
  CANCELLED = 'cancelled',
}

export enum TicketPriority {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

export enum TicketSource {
  PORTAL = 'portal',
  EMAIL = 'email',
  CHAT = 'chat',
  API = 'api',
  AI = 'ai',
  TECHNICIAN = 'technician',
}
