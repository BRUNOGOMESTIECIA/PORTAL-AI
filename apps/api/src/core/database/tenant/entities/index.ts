import { UserEntity } from './user.entity';
import { RoleEntity } from './role.entity';
import { PermissionEntity } from './permission.entity';
import { AuditLogEntity } from './audit-log.entity';

export { UserEntity, RoleEntity, PermissionEntity, AuditLogEntity };

export function getTenantEntities() {
  return [UserEntity, RoleEntity, PermissionEntity, AuditLogEntity];
}
