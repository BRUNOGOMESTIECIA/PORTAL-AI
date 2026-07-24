"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketSource = exports.TicketPriority = exports.TicketStatus = void 0;
var TicketStatus;
(function (TicketStatus) {
    TicketStatus["NEW"] = "new";
    TicketStatus["OPEN"] = "open";
    TicketStatus["IN_PROGRESS"] = "in_progress";
    TicketStatus["PENDING"] = "pending";
    TicketStatus["RESOLVED"] = "resolved";
    TicketStatus["CLOSED"] = "closed";
    TicketStatus["CANCELLED"] = "cancelled";
})(TicketStatus || (exports.TicketStatus = TicketStatus = {}));
var TicketPriority;
(function (TicketPriority) {
    TicketPriority["CRITICAL"] = "critical";
    TicketPriority["HIGH"] = "high";
    TicketPriority["MEDIUM"] = "medium";
    TicketPriority["LOW"] = "low";
})(TicketPriority || (exports.TicketPriority = TicketPriority = {}));
var TicketSource;
(function (TicketSource) {
    TicketSource["PORTAL"] = "portal";
    TicketSource["EMAIL"] = "email";
    TicketSource["CHAT"] = "chat";
    TicketSource["API"] = "api";
    TicketSource["AI"] = "ai";
    TicketSource["TECHNICIAN"] = "technician";
})(TicketSource || (exports.TicketSource = TicketSource = {}));
//# sourceMappingURL=ticket.enum.js.map