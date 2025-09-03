'use client';

import { useRouter } from 'next/navigation';

import { Column, Form, Grid, Stack } from '@carbon/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import type { CreateRoleRequest, Role, RoleWithPermissions } from '@idoeasy/contracts';

import { useRoleUpsert } from '@/features/roles/hooks/useRoleUpsert';
import { PermissionField, RolesField, SubmitForm, TextField } from '@/shared/components';
import { ToggleField } from '@/shared/components/Forms/ToggleField';
import { isRequired } from '@/shared/helpers';
import { useRoleValidationSchemas } from '@/shared/validations/roles.validation';

type RoleCreateFormProps = {
  userRole?: RoleWithPermissions;
};

export function RoleCreateForm({ userRole }: RoleCreateFormProps) {
  const router = useRouter();
  const t = useTranslations('roles');
  const { defaults, submit, isLoading } = useRoleUpsert();
  const { CreateRoleSchema } = useRoleValidationSchemas();

  const submitForm = async (values: CreateRoleRequest) => {
    const response = await submit(values);
    const role = response?.data as Role;
    router.replace(`/roles/${role.id}`);
  };

  const {
    control,
    handleSubmit,
    formState: { isSubmitting, isValid, errors },
    reset,
  } = useForm<CreateRoleRequest>({
    defaultValues: defaults,
    resolver: zodResolver(CreateRoleSchema),
    mode: 'onChange',
  });

  const disabled = isLoading || isSubmitting;
  const isAdmin = useWatch({ control, name: 'isAdmin' });

  useEffect(() => {
    reset(defaults as CreateRoleRequest);
  }, [defaults, reset]);

  // Render the form
  return (
    <Form onSubmit={handleSubmit(submitForm)}>
      <Stack gap={6}>
        {/* {!!submitError && <InlineNotification kind="error" title="Failed" subtitle={submitError} />} */}

        <Grid style={{ gap: '0.5rem' }} fullWidth condensed>
          <Column sm={4} md={8} lg={8}>
            <TextField
              name="name"
              labelText={t('form.name')}
              control={control}
              errors={errors}
              disabled={disabled}
              required={isRequired(CreateRoleSchema, 'name')}
            />
          </Column>
          <Column sm={4} md={8} lg={8}>
            <TextField
              name="description"
              labelText={t('form.description')}
              control={control}
              errors={errors}
              disabled={disabled}
              required={isRequired(CreateRoleSchema, 'description')}
            />
          </Column>
        </Grid>

        <Grid style={{ gap: '0.5rem' }} fullWidth condensed>
          <Column sm={4} md={8} lg={12}>
            <RolesField
              name="parentId"
              titleText={t('form.parentId')}
              control={control}
              errors={errors}
              disabled={disabled}
              required={isRequired(CreateRoleSchema, 'parentId')}
            />
          </Column>
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
        onSubmitText={t('form.create')}
        onCancelText={t('form.cancel')}
        onCancel={() => router.back()}
      />
    </Form>
  );
}
