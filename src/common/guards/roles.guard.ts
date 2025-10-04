import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../enums/user-role.enum';
import { ROLE_KEY } from '../decorators/roles.decorator';
import { JwtPayload } from '../../auth/strategies/jwt.strategy'; 

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. Get the required roles defined on the route handler
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLE_KEY, [
      context.getHandler(), // Target function 
      context.getClass(),  // Target class 
    ]);

    // If no roles are explicitly set on the route, it means the route is open to any authenticated user.
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // 2. Get the authenticated user from the request context
    const { user } = context.switchToHttp().getRequest();
    // 'user' object is returned by jwtpayload
    const authenticatedUser = user as JwtPayload;

    if (!authenticatedUser || !authenticatedUser.role) {
        return false; // User not authenticated or role is missing
    }
    
    // 3. Check if the user's role is in the list of required roles strictly
    return requiredRoles.includes(authenticatedUser.role);
  }
}