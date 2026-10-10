export type UserRole = 'admin' | 'user';

export interface LoginForm {
  email: string;
  password: string;
  remember: boolean;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  roles: UserRole;
  isActive: boolean;
  jwt: string;
}

export enum AuthRoutes {
  LOGIN = 'login',
}
