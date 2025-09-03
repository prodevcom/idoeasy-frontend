'use client';

import { useRouter } from 'next/navigation';

import { Column, Form, Grid, Stack } from '@carbon/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
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
  const t = useTranslations('users');
  const { defaults, submit, isLoading } = useUserCreate();
  const { CreateUserSchema } = useUserValidationSchemas();

  const {
    control,
    handleSubmit,
    setError,
    formState: { isSubmitting, isValid, errors },
  } = useForm({
    defaultValues: defaults as CreateUserRequest,
    resolver: zodResolver(CreateUserSchema),
    mode: 'onChange',
  });

  const submitForm = async (values: CreateUserRequest) => {
    try {
      const response = await submit(values);
      const user = response?.data as User;
      router.replace(`/users/${user.id}`);
    } catch (error) {
      const map = parseApiErrors(error);
      applyFormErrors(setError, map);
    }
  };
  const disabled = isLoading || isSubmitting;

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
          name="role"
          control={control}
          errors={errors}
          titleText={t('form.role')}
          disabled={disabled}
          required={isRequired(CreateUserSchema, 'role')}
        />
      </Stack>

      {/* Submit */}
      <SubmitForm
        submitting={isSubmitting}
        isValid={isValid}
        onSubmitText={t('form.create')}
        onCancelText={t('form.cancel')}
        onCancel={() => router.back()}
      />
    </Form>
  );
}
