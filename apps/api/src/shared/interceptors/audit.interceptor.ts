import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';
import { getTenantContext } from '../../core/database/tenant.context';
import { UserEntity } from '../../core/database/tenant/entities/user.entity';
import { AuditActorType } from '@portal/shared';

export interface AuditMetadata {
  action: string;
  entityType: string;
}

export const AUDIT_KEY = 'audit_metadata';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<Request>();
    const user = (req as any).user as UserEntity | undefined;

    return next.handle().pipe(
      tap(async (responseData) => {
        // Audit logging is done explicitly by service methods for state changes.
        // This interceptor adds the request context for services that need it.
        // Actual INSERT to audit_logs happens in service layer.
      }),
    );
  }
}

export function getRequestMeta(req: Request): { ipAddress: string; userAgent: string } {
  return {
    ipAddress:
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ??
      req.socket.remoteAddress ??
      '',
    userAgent: req.headers['user-agent'] ?? '',
  };
}
