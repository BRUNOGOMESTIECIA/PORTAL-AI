// Tenant migrations are imported here in order
// New migrations must be added to this array
import { InitTenantSchema1700000000000 } from './1700000000000-InitTenantSchema';

export function getTenantMigrations() {
  return [InitTenantSchema1700000000000];
}
