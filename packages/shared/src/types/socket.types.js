"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SOCKET_ROOMS = exports.SocketEvent = void 0;
var SocketEvent;
(function (SocketEvent) {
    // Chat external
    SocketEvent["CHAT_MESSAGE_NEW"] = "chat:message:new";
    SocketEvent["CHAT_MESSAGE_UPDATED"] = "chat:message:updated";
    SocketEvent["CHAT_SESSION_STATUS"] = "chat:session:status";
    SocketEvent["CHAT_AGENT_JOINED"] = "chat:agent:joined";
    SocketEvent["CHAT_AI_SUGGESTION"] = "chat:ai:suggestion";
    SocketEvent["CHAT_HEARTBEAT"] = "chat:heartbeat";
    SocketEvent["CHAT_HEARTBEAT_ACK"] = "chat:heartbeat:ack";
    // Internal chat
    SocketEvent["INTERNAL_MESSAGE_NEW"] = "internal:message:new";
    SocketEvent["INTERNAL_MESSAGE_UPDATED"] = "internal:message:updated";
    SocketEvent["INTERNAL_CHANNEL_UPDATED"] = "internal:channel:updated";
    // Tickets
    SocketEvent["TICKET_UPDATED"] = "ticket:updated";
    SocketEvent["TICKET_COMMENT_NEW"] = "ticket:comment:new";
    // Notifications
    SocketEvent["NOTIFICATION_NEW"] = "notification:new";
    SocketEvent["NOTIFICATION_READ"] = "notification:read";
    // AI
    SocketEvent["AI_RESPONSE_CHUNK"] = "ai:response:chunk";
    SocketEvent["AI_RESPONSE_DONE"] = "ai:response:done";
    SocketEvent["AI_SERVICE_UNAVAILABLE"] = "ai:service_unavailable";
    // SLA
    SocketEvent["SLA_BREACH"] = "sla:breach";
    SocketEvent["SLA_WARNING"] = "sla:warning";
})(SocketEvent || (exports.SocketEvent = SocketEvent = {}));
exports.SOCKET_ROOMS = {
    TENANT: (slug) => `tenant:${slug}`,
    TICKET: (slug, id) => `tenant:${slug}:ticket:${id}`,
    CHAT_SESSION: (slug, id) => `tenant:${slug}:chat:${id}`,
    CHAT_QUEUE: (slug, id) => `tenant:${slug}:queue:${id}`,
    INTERNAL_CHANNEL: (slug, id) => `tenant:${slug}:channel:${id}`,
    USER: (slug, id) => `tenant:${slug}:user:${id}`,
};
//# sourceMappingURL=socket.types.js.map