"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailStatus = exports.NotificationType = void 0;
var NotificationType;
(function (NotificationType) {
    NotificationType["TICKET_ASSIGNED"] = "ticket_assigned";
    NotificationType["TICKET_UPDATED"] = "ticket_updated";
    NotificationType["TICKET_COMMENT"] = "ticket_comment";
    NotificationType["CHAT_MESSAGE"] = "chat_message";
    NotificationType["SLA_BREACH"] = "sla_breach";
    NotificationType["MENTION"] = "mention";
    NotificationType["SYSTEM"] = "system";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
var EmailStatus;
(function (EmailStatus) {
    EmailStatus["PENDING"] = "pending";
    EmailStatus["SENT"] = "sent";
    EmailStatus["FAILED"] = "failed";
    EmailStatus["BOUNCED"] = "bounced";
})(EmailStatus || (exports.EmailStatus = EmailStatus = {}));
//# sourceMappingURL=notification.enum.js.map