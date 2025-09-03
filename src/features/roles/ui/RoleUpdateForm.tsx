'use client';

import { useRouter } from 'next/navigation';

import { Column, Form, Grid, Stack } from '@carbon/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useEffect, useTransition } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import type { RoleWithPermissions, UpdateRoleRequest } from '@idoeasy/contracts';

import { useRoleUpdate } from '@/features/roles/hooks/useRoles';
import { PermissionField, SubmitForm, TextField } from '@/shared/components';
import { ToggleField } from '@/shared/components/Forms/ToggleField';
import { applyFormErrors, isRequired, parseApiErrors } from '@/shared/helpers';
import { useRoleValidationSchemas } from '@/shared/validations/roles.validation';

type RoleUpdateFormProps = {
  uuid: string;
  userRole?: RoleWithPermissions;
};

export function RoleUpdateForm({ uuid, userRole }: RoleUpdateFormProps) {
  const router = useRouter();

  /* ------------------------------ Hooks ------------------------------ */
  const t = useTranslations('roles');
  const [isTransitionPending, startTransition] = useTransition();
  const { defaultValues, submit, isUpdating } = useRoleUpdate(uuid);
  const { UpdateRoleSchema } = useRoleValidationSchemas();

  /* ------------------------------ Form ------------------------------ */
  const { control, handleSubmit, formState, reset, setError } = useForm<UpdateRoleRequest>({
    defaultValues,
    resolver: zodResolver(UpdateRoleSchema),
    mode: 'onChange',
  });

  useEffect(() => {
    reset(defaultValues as UpdateRoleRequest);
  }, [defaultValues, reset]);

  // Prefetch the roles page
  useEffect(() => {
    router.prefetch('/roles');
  }, [router]);

  /* ------------------------------ Keys ------------------------------ */
  const { isSubmitting, isValid, errors } = formState;
  const disabled = isUpdating || isSubmitting || isTransitionPending;
  const isAdmin = useWatch({ control, name: 'isAdmin' });

  /* ------------------------------ Submit ------------------------------ */
  const submitForm = async (values: UpdateRoleRequest) => {
    try {
      startTransition(async () => {
        await submit(values);
        router.replace(`/roles`);
      });
    } catch (error) {
      const map = parseApiErrors(error);
      applyFormErrors(setError, map);
    }
  };

  /* ------------------------------ Render ------------------------------ */
  return (
    <Form onSubmit={handleSubmit(submitForm)}>
      <Stack gap={6}>
        <Grid style={{ gap: '0.5rem' }} fullWidth condensed>
          <Column sm={4} md={8} lg={8}>
            <TextField
              name="name"
              labelText={t('form.name')}
              control={control}
              errors={errors}
              disabled={disabled}
              required={isRequired(UpdateRoleSchema, 'name')}
            />
          </Column>
          <Column sm={4} md={8} lg={8}>
            <TextField
              name="description"
              labelText={t('form.description')}
              control={control}
              errors={errors}
              disabled={disabled}
              required={isRequired(UpdateRoleSchema, 'description')}
            />
          </Column>
        </Grid>

        <Grid style={{ gap: '0.5rem' }} fullWidth condensed>
          <Column sm={4} md={8} lg={4}>
            <ToggleField
              name="isActive"
              control={control}
              label={{ labelA: t('status.inactive'), labelB: t('status.active') }}
              labelText={t('form.status')}
              disabled={disabled}
            />
          </Column>
        </Grid>

        <Grid style={{ gap: '0.5rem' }} fullWidth condensed>
          <Column sm={4} md={8} lg={12}>
            <Stack gap={3}>
              <h3 className="cds--type-heading-03">{t('form.permissions')}</h3>
              <p className="cds--type-label-01">{t('form.permissionDescription')}</p>
            </Stack>
          </Column>
          <Column sm={4} md={8} lg={4}>
            {userRole?.isAdmin && (
              <ToggleField
                name="isAdmin"
                control={control}
                label={{ labelA: t('form.no'), labelB: t('form.yes') }}
                labelText={t('form.fullAdminAccess')}
                disabled={disabled}
              />
            )}
          </Column>
        </Grid>

        <PermissionField
          name="permissionIds"
          control={control}
          disabled={(disabled || isAdmin) ?? false}
          userRole={userRole}
          initialModules={['me']}
        />
      </Stack>

      {/* Submit */}
      <SubmitForm
        submitting={disabled}
        isValid={isValid}
        onSubmitText={t('form.save')}
        onCancelText={t('form.cancel')}
        onCancel={() => router.back()}
      />
    </Form>
  );
}
