import * as argon2 from 'argon2';

export const encryptData = (data: string) => argon2.hash(data);

export const compareData = (plain: string, hash: string) =>
  argon2.verify(hash, plain);
