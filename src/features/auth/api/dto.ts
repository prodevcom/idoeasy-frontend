import type { AuthUser } from '@entech/contracts';

export type LoginInput = {
  email: string;
  password: string;
};

export type LoginResponse = {
  ok: true;
  user: AuthUser;
};
