'use client';

import { useTranslations } from 'next-intl';
import { z } from 'zod';

import type { CreateRoleRequest, UpdateRoleRequest } from '@idoeasy/contracts';

export function useRoleValidationSchemas() {
  const t = useTranslations('roles');

  const CreateRoleSchema = z.object({
    name: z.string().min(1, t('errors.nameRequired')),
    description: z.string().min(1, t('errors.descriptionRequired')),
    permissionIds: z.array(z.string()).min(1, t('errors.permissionsRequired')),
    isActive: z.boolean(),
    isAdmin: z.boolean(),
    parentId: z.string().optional(),
  }) satisfies z.ZodType<CreateRoleRequest>;

  const UpdateRoleSchema = z.object({
    name: z.string().min(1, t('errors.nameRequired')),
    description: z.string().min(1, t('errors.descriptionRequired')),
    permissionIds: z.array(z.string()).min(1, t('errors.permissionsRequired')),
    isActive: z.boolean(),
    isAdmin: z.boolean(),
  }) satisfies z.ZodType<UpdateRoleRequest>;

  return { CreateRoleSchema, UpdateRoleSchema };
}
