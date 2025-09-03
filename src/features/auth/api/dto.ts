import type { AuthUser } from '@idoeasy/contracts';

export type LoginInput = {
  email: string;
  password: string;
};

export type LoginResponse = {
  ok: true;
  user: AuthUser;
};
