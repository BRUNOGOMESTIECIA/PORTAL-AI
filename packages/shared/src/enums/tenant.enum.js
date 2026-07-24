"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SsoProvider = exports.TenantStatus = void 0;
var TenantStatus;
(function (TenantStatus) {
    TenantStatus["ACTIVE"] = "active";
    TenantStatus["SUSPENDED"] = "suspended";
    TenantStatus["TRIAL"] = "trial";
    TenantStatus["CANCELLED"] = "cancelled";
})(TenantStatus || (exports.TenantStatus = TenantStatus = {}));
var SsoProvider;
(function (SsoProvider) {
    SsoProvider["GOOGLE"] = "google";
    SsoProvider["MICROSOFT"] = "microsoft";
    SsoProvider["NONE"] = "none";
})(SsoProvider || (exports.SsoProvider = SsoProvider = {}));
//# sourceMappingURL=tenant.enum.js.map