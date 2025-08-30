import { useTranslations } from 'next-intl';
import { z } from 'zod';

import type { ChangePasswordRequest, UpdateMeRequest, UserPreferences } from '@entech/contracts';

export const useMeValidationSchemas = () => {
  const t = useTranslations('profile');

  const ChangePasswordSchema = z
    .object({
      currentPassword: z.string().min(1, t('changePassword.currentPassword.required')),
      newPassword: z.string().min(1, t('changePassword.newPassword.required')),
      confirmPassword: z.string().min(1, t('changePassword.confirmPassword.required')),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      path: ['confirmPassword'],
      message: t('changePassword.confirmPassword.match'),
    }) satisfies z.ZodType<ChangePasswordRequest>;

  const UpdateUserInfosSchema = z.object({
    name: z.string().min(1, t('changeUserInfos.name.required')),
    email: z.email(t('changeUserInfos.email.required')),
  }) satisfies z.ZodType<UpdateMeRequest>;

  const UpdatePreferencesSchema = z.object({
    locale: z.string().min(1, t('preferences.locale.required')),
    timeZone: z.string().min(1, t('preferences.timeZone.required')),
    showTimezoneOffset: z.boolean(),
  }) satisfies z.ZodType<UserPreferences>;

  return { ChangePasswordSchema, UpdateUserInfosSchema, UpdatePreferencesSchema };
};
