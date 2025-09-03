'use client';

import { useRouter } from 'next/navigation';

import { Column, Form, Grid, Stack } from '@carbon/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useTransition } from 'react';
import { useForm } from 'react-hook-form';

import { type CreateUserRequest, type User } from '@idoeasy/contracts';

import {
  PasswordField,
  RolesField,
  SubmitForm,
  TextField,
  UserStatusField,
} from '@/shared/components';
import { applyFormErrors, isRequired, parseApiErrors } from '@/shared/helpers';
import { useUserValidationSchemas } from '@/shared/validations';

import { useUserCreate } from '../hooks';

export function UserCreateForm() {
  const router = useRouter();

  /* ------------------------------ Hooks ------------------------------ */
  const t = useTranslations('users');
  const [isTransitionPending, startTransition] = useTransition();
  const { defaultValues, submit, isCreating } = useUserCreate();
  const { CreateUserSchema } = useUserValidationSchemas();

  const { control, handleSubmit, setError, formState } = useForm<CreateUserRequest>({
    mode: 'onChange',
    defaultValues,
    resolver: zodResolver(CreateUserSchema),
  });

  /* ------------------------------ Keys ------------------------------ */
  const { isSubmitting, isValid, errors } = formState;
  const disabled = isCreating || isSubmitting || isTransitionPending;

  /* ------------------------------ Submit ------------------------------ */
  const submitForm = async (values: CreateUserRequest) => {
    try {
      startTransition(async () => {
        const response = await submit(values);
        const user = response?.data as User;
        router.replace(`/users/${user.id}`);
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
        {/* Name and Email */}
        <Grid style={{ gap: '0.5rem' }} fullWidth condensed>
          <Column sm={4} md={8} lg={8}>
            <TextField
              name="name"
              labelText={t('form.name')}
              control={control}
              errors={errors}
              disabled={disabled}
              required={isRequired(CreateUserSchema, 'name')}
            />
          </Column>
          <Column sm={4} md={8} lg={8}>
            <TextField
              name="email"
              labelText={t('form.email')}
              control={control}
              errors={errors}
              disabled={disabled}
              required={isRequired(CreateUserSchema, 'email')}
            />
          </Column>
        </Grid>

        {/* Password */}
        <PasswordField
          name="password"
          control={control}
          errors={errors}
          labelText={t('form.password')}
          disabled={disabled}
          required={isRequired(CreateUserSchema, 'password')}
        />

        {/* Status */}
        <UserStatusField
          name="status"
          control={control}
          errors={errors}
          titleText={t('form.status')}
          disabled={disabled}
          required={isRequired(CreateUserSchema, 'status')}
        />

        {/* Role */}
        <RolesField
          name="roleId"
          control={control}
          errors={errors}
          titleText={t('form.role')}
          disabled={disabled}
          required={isRequired(CreateUserSchema, 'roleId')}
        />
      </Stack>

      {/* Submit */}
      <SubmitForm
        submitting={disabled || isCreating}
        isValid={isValid}
        onSubmitText={t('form.create')}
        onCancelText={t('form.cancel')}
        onCancel={() => router.back()}
      />
    </Form>
  );
}
