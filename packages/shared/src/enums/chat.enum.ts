export enum ChatSessionStatus {
  WAITING = 'waiting',
  ACTIVE = 'active',
  FINISHED = 'finished',
  ESCALATED = 'escalated',
  ABANDONED = 'abandoned',
}

export enum ChatSenderType {
  USER = 'user',
  AGENT = 'agent',
  AI = 'ai',
  SYSTEM = 'system',
}

export enum ChatChannelType {
  GENERAL = 'general',
  TEAM = 'team',
  DIRECT = 'direct',
}

export enum ChatChannelMemberRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
}
