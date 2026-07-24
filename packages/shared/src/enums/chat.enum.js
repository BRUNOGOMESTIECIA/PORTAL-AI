"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatChannelMemberRole = exports.ChatChannelType = exports.ChatSenderType = exports.ChatSessionStatus = void 0;
var ChatSessionStatus;
(function (ChatSessionStatus) {
    ChatSessionStatus["WAITING"] = "waiting";
    ChatSessionStatus["ACTIVE"] = "active";
    ChatSessionStatus["FINISHED"] = "finished";
    ChatSessionStatus["ESCALATED"] = "escalated";
    ChatSessionStatus["ABANDONED"] = "abandoned";
})(ChatSessionStatus || (exports.ChatSessionStatus = ChatSessionStatus = {}));
var ChatSenderType;
(function (ChatSenderType) {
    ChatSenderType["USER"] = "user";
    ChatSenderType["AGENT"] = "agent";
    ChatSenderType["AI"] = "ai";
    ChatSenderType["SYSTEM"] = "system";
})(ChatSenderType || (exports.ChatSenderType = ChatSenderType = {}));
var ChatChannelType;
(function (ChatChannelType) {
    ChatChannelType["GENERAL"] = "general";
    ChatChannelType["TEAM"] = "team";
    ChatChannelType["DIRECT"] = "direct";
})(ChatChannelType || (exports.ChatChannelType = ChatChannelType = {}));
var ChatChannelMemberRole;
(function (ChatChannelMemberRole) {
    ChatChannelMemberRole["OWNER"] = "owner";
    ChatChannelMemberRole["ADMIN"] = "admin";
    ChatChannelMemberRole["MEMBER"] = "member";
})(ChatChannelMemberRole || (exports.ChatChannelMemberRole = ChatChannelMemberRole = {}));
//# sourceMappingURL=chat.enum.js.map