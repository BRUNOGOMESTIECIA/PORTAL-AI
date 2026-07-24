import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { UserEntity } from '../../database/tenant/entities/user.entity';
import { RoleEntity } from '../../database/tenant/entities/role.entity';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required || required.length === 0) return true;

    const request = context.switchToHttp().getRequest();
    const user: UserEntity & { role?: RoleEntity } = request.user;
    if (!user) throw new ForbiddenException('Autenticação necessária');

    const userPermissions = user.role?.permissions?.map((p) => p.code) ?? [];
    const hasAll = required.every((perm) => userPermissions.includes(perm));
    if (!hasAll) throw new ForbiddenException('Permissão insuficiente');

    return true;
  }
}
