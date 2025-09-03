'use client';

import { useRouter } from 'next/navigation';

import { Column, Form, Grid, Stack } from '@carbon/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import type { RoleWithPermissions, UpdateRoleRequest } from '@idoeasy/contracts';

import { useRoleUpsert } from '@/features/roles/hooks/useRoleUpsert';
import { PermissionField, SubmitForm, TextField } from '@/shared/components';
import { ToggleField } from '@/shared/components/Forms/ToggleField';
import { isRequired } from '@/shared/helpers';
import { useRoleValidationSchemas } from '@/shared/validations/roles.validation';

type RoleUpdateFormProps = {
  uuid: string;
  userRole?: RoleWithPermissions;
};

export function RoleUpdateForm({ uuid, userRole }: RoleUpdateFormProps) {
  const router = useRouter();
  const t = useTranslations('roles');
  const { defaults, submit, isLoading } = useRoleUpsert(uuid);
  const { UpdateRoleSchema } = useRoleValidationSchemas();

  // Submit
  const submitForm = async (values: UpdateRoleRequest) => {
    await submit(values);
    router.back();
  };

  // Form Hooks
  const {
    control,
    handleSubmit,
    formState: { isSubmitting, isValid, errors },
    reset,
  } = useForm({
    defaultValues: defaults as UpdateRoleRequest,
    resolver: zodResolver(UpdateRoleSchema),
    mode: 'onChange',
  });

  // Form State Hooks
  const disabled = isLoading || isSubmitting;
  const isAdmin = useWatch({ control, name: 'isAdmin' });

  // Reset Form
  useEffect(() => reset(defaults as UpdateRoleRequest), [defaults, reset]);

  // Render
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
          name="permissions"
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
