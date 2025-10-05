import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../entities/user.entity';

// unique identifier for roles metadata on protected routes
export const ROLES_KEY = 'roles';

// roles decorator marks the routes with roles that are allowed to access them
// role guard will read this metadata to check if the user has the required role

export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
