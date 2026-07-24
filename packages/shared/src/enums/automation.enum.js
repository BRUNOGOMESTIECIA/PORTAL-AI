"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceRequestStatus = exports.WebhookDeliveryStatus = exports.AutomationLogStatus = exports.AutomationTriggerType = void 0;
var AutomationTriggerType;
(function (AutomationTriggerType) {
    AutomationTriggerType["TICKET_CREATED"] = "ticket_created";
    AutomationTriggerType["TICKET_UPDATED"] = "ticket_updated";
    AutomationTriggerType["TICKET_STATUS_CHANGED"] = "ticket_status_changed";
    AutomationTriggerType["SLA_BREACHED"] = "sla_breached";
    AutomationTriggerType["TIME_ELAPSED"] = "time_elapsed";
    AutomationTriggerType["CHAT_CREATED"] = "chat_created";
})(AutomationTriggerType || (exports.AutomationTriggerType = AutomationTriggerType = {}));
var AutomationLogStatus;
(function (AutomationLogStatus) {
    AutomationLogStatus["SUCCESS"] = "success";
    AutomationLogStatus["FAILED"] = "failed";
    AutomationLogStatus["SKIPPED"] = "skipped";
})(AutomationLogStatus || (exports.AutomationLogStatus = AutomationLogStatus = {}));
var WebhookDeliveryStatus;
(function (WebhookDeliveryStatus) {
    WebhookDeliveryStatus["PENDING"] = "pending";
    WebhookDeliveryStatus["DELIVERED"] = "delivered";
    WebhookDeliveryStatus["FAILED"] = "failed";
    WebhookDeliveryStatus["CANCELLED"] = "cancelled";
})(WebhookDeliveryStatus || (exports.WebhookDeliveryStatus = WebhookDeliveryStatus = {}));
var ServiceRequestStatus;
(function (ServiceRequestStatus) {
    ServiceRequestStatus["PENDING_APPROVAL"] = "pending_approval";
    ServiceRequestStatus["APPROVED"] = "approved";
    ServiceRequestStatus["REJECTED"] = "rejected";
    ServiceRequestStatus["IN_PROGRESS"] = "in_progress";
    ServiceRequestStatus["FULFILLED"] = "fulfilled";
    ServiceRequestStatus["CANCELLED"] = "cancelled";
})(ServiceRequestStatus || (exports.ServiceRequestStatus = ServiceRequestStatus = {}));
//# sourceMappingURL=automation.enum.js.map