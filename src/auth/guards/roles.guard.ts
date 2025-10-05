import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../entities/user.entity';
import { ROLES_KEY } from '../decorators/roles.decorator';

// protect routes that need role based protection

@Injectable()
export class RolesGuard implements CanActivate {
  // reflector is a utility => helps to read the metadata that we set using decorators
  constructor(private reflector: Reflector) {}

  // canactivate retrieves role metadata sent by roles decorator
  //
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [
        context.getHandler(), // method level metadata (routes)
        context.getClass(), // class level metadata (controller class)
      ],
    );

    // no required roles, just return treue
    // if there are some requirement of roles, check them accordingly and then return
    if (!requiredRoles) {
      return true;
    }

    // this will get user because of jwt strategy validate method
    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    const hasRequiredRole = requiredRoles.some((role) => user.role === role);

    if (!hasRequiredRole) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
