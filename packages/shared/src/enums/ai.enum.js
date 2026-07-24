"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlatformAlertType = exports.AiMessageRole = exports.AiConversationStatus = exports.AiConversationType = void 0;
var AiConversationType;
(function (AiConversationType) {
    AiConversationType["SEARCH"] = "search";
    AiConversationType["TICKET_CREATION"] = "ticket_creation";
    AiConversationType["COPILOT"] = "copilot";
    AiConversationType["GENERAL"] = "general";
})(AiConversationType || (exports.AiConversationType = AiConversationType = {}));
var AiConversationStatus;
(function (AiConversationStatus) {
    AiConversationStatus["ACTIVE"] = "active";
    AiConversationStatus["COMPLETED"] = "completed";
    AiConversationStatus["HANDED_OFF"] = "handed_off";
    AiConversationStatus["FAILED"] = "failed";
})(AiConversationStatus || (exports.AiConversationStatus = AiConversationStatus = {}));
var AiMessageRole;
(function (AiMessageRole) {
    AiMessageRole["USER"] = "user";
    AiMessageRole["ASSISTANT"] = "assistant";
    AiMessageRole["SYSTEM"] = "system";
})(AiMessageRole || (exports.AiMessageRole = AiMessageRole = {}));
var PlatformAlertType;
(function (PlatformAlertType) {
    PlatformAlertType["AI_FALLBACK"] = "ai_fallback";
    PlatformAlertType["SYSTEM_ERROR"] = "system_error";
    PlatformAlertType["QUOTA_EXCEEDED"] = "quota_exceeded";
})(PlatformAlertType || (exports.PlatformAlertType = PlatformAlertType = {}));
//# sourceMappingURL=ai.enum.js.map