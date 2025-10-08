import { SetMetadata } from "@nestjs/common";
import { UserRole } from "../enums/user-role.enum";


export const ROLE_KEY= 'roles';

/**
 * Custom decorator to specify which roles are allowed to access a route.
 * @param roles - Array of user roles that are allowed to access the route.
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLE_KEY, roles);