export declare enum SocketEvent {
    CHAT_MESSAGE_NEW = "chat:message:new",
    CHAT_MESSAGE_UPDATED = "chat:message:updated",
    CHAT_SESSION_STATUS = "chat:session:status",
    CHAT_AGENT_JOINED = "chat:agent:joined",
    CHAT_AI_SUGGESTION = "chat:ai:suggestion",
    CHAT_HEARTBEAT = "chat:heartbeat",
    CHAT_HEARTBEAT_ACK = "chat:heartbeat:ack",
    INTERNAL_MESSAGE_NEW = "internal:message:new",
    INTERNAL_MESSAGE_UPDATED = "internal:message:updated",
    INTERNAL_CHANNEL_UPDATED = "internal:channel:updated",
    TICKET_UPDATED = "ticket:updated",
    TICKET_COMMENT_NEW = "ticket:comment:new",
    NOTIFICATION_NEW = "notification:new",
    NOTIFICATION_READ = "notification:read",
    AI_RESPONSE_CHUNK = "ai:response:chunk",
    AI_RESPONSE_DONE = "ai:response:done",
    AI_SERVICE_UNAVAILABLE = "ai:service_unavailable",
    SLA_BREACH = "sla:breach",
    SLA_WARNING = "sla:warning"
}
export interface SocketRoom {
    TENANT: (slug: string) => string;
    TICKET: (slug: string, ticketId: string) => string;
    CHAT_SESSION: (slug: string, sessionId: string) => string;
    CHAT_QUEUE: (slug: string, queueId: string) => string;
    INTERNAL_CHANNEL: (slug: string, channelId: string) => string;
    USER: (slug: string, userId: string) => string;
}
export declare const SOCKET_ROOMS: SocketRoom;
//# sourceMappingURL=socket.types.d.ts.map