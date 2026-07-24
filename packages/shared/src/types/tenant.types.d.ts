import { SsoProvider, TenantStatus } from '../enums/tenant.enum';
export interface TenantConfig {
    id: string;
    slug: string;
    name: string;
    status: TenantStatus;
    dbName: string;
    dbUser: string;
    ssoProvider: SsoProvider;
    ssoConfig: SsoConfig | null;
    ssoAllowedDomains: string[];
    aiEnabled: boolean;
    aiModel: string | null;
    aiTokenLimitMonthly: number | null;
    settings: TenantSettings;
}
export interface SsoConfig {
    clientId: string;
    clientSecret: string;
    tenantId?: string;
}
export interface TenantSettings {
    slaDefaultPolicyId?: string;
    timezone?: string;
    defaultBusinessHoursId?: string;
    chatHeartbeatIntervalSeconds?: number;
    chatHeartbeatToleranceSeconds?: number;
    dataRetentionDays?: number | null;
}
export interface TenantContext {
    tenantId: string;
    tenantSlug: string;
    dbName: string;
    dbUser: string;
    dbPasswordEncrypted: string;
}
//# sourceMappingURL=tenant.types.d.ts.map