import { Injectable,CanActivate,ExecutionContext,ForbiddenException} from '@nestjs/common';
import  {Reflector } from '@nestjs/core';
import { UserRole } from '../enums/user-role.enum';
import { ROLE_KEY } from '../decorators/roles.decorator';
import { Observable } from 'rxjs';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

@Injectable()
export class RolesGuard  implements CanActivate{
    constructor(private reflector: Reflector){}
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        throw new Error('Method not implemented.');
    }
    CanActivate(context: ExecutionContext): boolean {
        // Get the required roles metadata set by @Roles() on the handler
        const requiredRoles=this.reflector.getAllAndOverride<UserRole[]>(ROLE_KEY,[
            context.getHandler(),// checking method handler
            context.getClass(), //Checking class controller
        ]);
        if(!requiredRoles){
            return true;
        }
        // Get user object from the request
        const {user} =context.switchToHttp().getRequest();
        // Check if the user role match any required role
        const hasPerm=requiredRoles.some((role)=>user.role===role);
        if(!hasPerm){
            throw new ForbiddenException(`User role ${user.role} does not have permission to access this route`);
        }
        return true;
        }
}