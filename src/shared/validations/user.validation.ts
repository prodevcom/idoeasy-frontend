import { useTranslations } from 'next-intl';
import { z } from 'zod';

import type { CreateUserRequest, UpdateUserRequest } from '@idoeasy/contracts';
import { UserStatus } from '@idoeasy/contracts';

import { zodEnumFromConstRequired } from '../helpers';

export const useUserValidationSchemas = () => {
  const t = useTranslations('users');

  const UserStatusSchema = zodEnumFromConstRequired(UserStatus, t('errors.statusRequired'));

  //  -------- Create User --------
  const CreateUserSchema = z.object({
    email: z.email(t('errors.emailRequired')),
    password: z.string().min(8, t('errors.passwordRequired')),
    name: z.string().min(1, t('errors.nameRequired')),
    status: UserStatusSchema,
    roleId: z.string().min(1, t('errors.roleRequired')),
  }) satisfies z.ZodType<CreateUserRequest>;

  // -------- Update User --------
  const UpdateUserSchema = z.object({
    email: z.email(t('errors.emailRequired')).optional(),
    name: z.string().min(1, t('errors.nameRequired')).optional(),
    status: UserStatusSchema.optional(),
    roleId: z.string().min(1, t('errors.roleRequired')).optional(),
  }) satisfies z.ZodType<UpdateUserRequest>;

  return { CreateUserSchema, UpdateUserSchema };
};
