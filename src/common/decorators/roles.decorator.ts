import { SetMetadata } from "@nestjs/common";
import { UserRole } from "../enums/user-role.enum";

//key for storing  metadata
export const ROLE_KEY= 'roles';

/**
 * Custom decorator to specify which roles are allowed to access a route.
 * Example: @Roles(UserRole.OWNER, UserRole.MANAGER)
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLE_KEY, roles);