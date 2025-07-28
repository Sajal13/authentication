import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { Observable } from 'rxjs';
import { ROLES_KEY } from 'src/auth/decorator/roles.decorator';
import { AuthenticatedRequest } from 'src/auth/types/extended-request.interface';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass()
    ]);

    if (!requiredRoles) return true;

    const user = context.switchToHttp().getRequest<AuthenticatedRequest>().user;
    const hasRequiredRole = requiredRoles.some((role) => role === user.role);

    return hasRequiredRole;
  }
}
