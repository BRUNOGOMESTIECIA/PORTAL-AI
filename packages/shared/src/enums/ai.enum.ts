export enum AiConversationType {
  SEARCH = 'search',
  TICKET_CREATION = 'ticket_creation',
  COPILOT = 'copilot',
  GENERAL = 'general',
}

export enum AiConversationStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  HANDED_OFF = 'handed_off',
  FAILED = 'failed',
}

export enum AiMessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system',
}

export enum PlatformAlertType {
  AI_FALLBACK = 'ai_fallback',
  SYSTEM_ERROR = 'system_error',
  QUOTA_EXCEEDED = 'quota_exceeded',
}
