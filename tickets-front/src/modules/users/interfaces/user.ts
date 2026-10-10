import type { UserRole } from 'src/modules/auth/interfaces/auth';

export interface User {
  id: number;
  name: string;
  email: string;
  roles: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserPayload {
  name: string;
  email: string;
  password?: string;
  roles: UserRole;
  isActive?: boolean;
}
