import { z } from 'zod';

import type { LoginRequest } from '@idoeasy/contracts';

export const LoginSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
}) satisfies z.ZodType<LoginRequest>;
