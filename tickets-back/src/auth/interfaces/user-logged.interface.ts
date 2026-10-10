import { User } from '@prisma/client';

export type UserLogged = Omit<User, 'password'>;
