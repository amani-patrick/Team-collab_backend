
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../../entity/user.entity';

/**
 * Defines the type of the user object retrieved after successful authentication.
 */
export type AuthUser = Omit<User, 'passwordHash'>;

/**
 * Custom decorator to extract the fully typed user object from the request.
 * Use it like: @CurrentUser() user: AuthUser
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): AuthUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as AuthUser; 
  },
);