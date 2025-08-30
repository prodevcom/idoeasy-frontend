import { useTranslations } from 'next-intl';
import { z } from 'zod';

import type { CreateUserRequest, UpdateUserRequest } from '@entech/contracts';
import { UserStatus } from '@entech/contracts';

import { zodEnumFromConstUIRequired } from '../helpers';

export const UserStatusSchema = zodEnumFromConstUIRequired(UserStatus, 'Status is required');

export const useUserValidationSchemas = () => {
  const t = useTranslations('users');

  //  -------- Create User --------
  const CreateUserSchema = z.object({
    email: z.email(t('errors.emailRequired')),
    password: z.string().min(8, t('errors.passwordRequired')),
    name: z.string().min(1, t('errors.nameRequired')),
    status: UserStatusSchema,
    role: z.string().min(1, t('errors.roleRequired')),
  }) satisfies z.ZodType<CreateUserRequest>;

  // -------- Update User --------
  const UpdateUserSchema = z.object({
    email: z.email(t('errors.emailRequired')),
    name: z.string().min(1, t('errors.nameRequired')),
    status: UserStatusSchema,
    role: z.string().min(1, t('errors.roleRequired')),
  }) satisfies z.ZodType<UpdateUserRequest>;

  return { CreateUserSchema, UpdateUserSchema };
};
