import { AsyncLocalStorage } from 'async_hooks';
import { DataSource } from 'typeorm';

export interface TenantRequestContext {
  tenantId: string;
  tenantSlug: string;
  dbName: string;
  dataSource: DataSource;
  aiEnabled: boolean;
  aiModel: string | null;
  ssoAllowedDomains: string[];
}

export const tenantStorage = new AsyncLocalStorage<TenantRequestContext>();

export function getTenantContext(): TenantRequestContext {
  const ctx = tenantStorage.getStore();
  if (!ctx) throw new Error('TenantContext not available outside request scope');
  return ctx;
}

export function getTenantDataSource(): DataSource {
  return getTenantContext().dataSource;
}
