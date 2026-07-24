"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditActorType = exports.UserSsoProvider = void 0;
var UserSsoProvider;
(function (UserSsoProvider) {
    UserSsoProvider["GOOGLE"] = "google";
    UserSsoProvider["MICROSOFT"] = "microsoft";
    UserSsoProvider["LOCAL"] = "local";
})(UserSsoProvider || (exports.UserSsoProvider = UserSsoProvider = {}));
var AuditActorType;
(function (AuditActorType) {
    AuditActorType["USER"] = "user";
    AuditActorType["SYSTEM"] = "system";
    AuditActorType["AI"] = "ai";
    AuditActorType["WEBHOOK"] = "webhook";
})(AuditActorType || (exports.AuditActorType = AuditActorType = {}));
//# sourceMappingURL=user.enum.js.map