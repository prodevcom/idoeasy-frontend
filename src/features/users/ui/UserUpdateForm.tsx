'use client';

import { useRouter } from 'next/navigation';

import { Column, Form, Grid, Stack } from '@carbon/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import type { AuthUser, UpdateUserRequest } from '@entech/contracts';

import { RolesField, SubmitForm, TextField, UserStatusField } from '@/shared/components';
import { applyFormErrors, isRequired, parseApiErrors } from '@/shared/helpers';
import { useUserValidationSchemas } from '@/shared/validations';

import { useUserUpsert } from '../hooks';

type UserFormProps = {
  currentUser: AuthUser;
  uid: string;
};

export function UpdateUserForm({ uid, currentUser }: UserFormProps) {
  const router = useRouter();
  const t = useTranslations('users');
  const { defaults, submit, isLoading } = useUserUpsert(uid);
  const { UpdateUserSchema } = useUserValidationSchemas();

  // Check if the user is editing their own profile
  const editingMySelf = currentUser.id === uid;

  const {
    control,
    handleSubmit,
    setError,
    formState: { isSubmitting, isValid, errors },
    reset,
  } = useForm({
    defaultValues: defaults as UpdateUserRequest,
    resolver: zodResolver(UpdateUserSchema),
    mode: 'onChange',
  });

  useEffect(() => {
    reset(defaults);
  }, [defaults, reset]);

  const disabled = isLoading || isSubmitting;

  // Submit the form
  const submitForm = async (values: UpdateUserRequest) => {
    try {
      await submit(values);
      router.back();
    } catch (error) {
      const map = parseApiErrors(error);
      applyFormErrors(setError, map);
    }
  };

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
              required={isRequired(UpdateUserSchema, 'name')}
            />
          </Column>
          <Column sm={4} md={8} lg={8}>
            <TextField
              name="email"
              labelText={t('form.email')}
              control={control}
              errors={errors}
              disabled={disabled}
              required={isRequired(UpdateUserSchema, 'email')}
            />
          </Column>
        </Grid>

        {/* Status */}
        <UserStatusField
          name="status"
          control={control}
          errors={errors}
          titleText={t('form.status')}
          disabled={disabled || editingMySelf}
          required={isRequired(UpdateUserSchema, 'status')}
        />

        {/* Role */}
        <RolesField
          name="role"
          control={control}
          errors={errors}
          titleText={t('form.role')}
          disabled={disabled || editingMySelf}
          required={isRequired(UpdateUserSchema, 'role')}
        />
      </Stack>

      {/* Submit */}
      <SubmitForm
        submitting={isSubmitting}
        isValid={isValid}
        onSubmitText={t('form.save')}
        onCancelText={t('form.cancel')}
        onCancel={() => router.back()}
      />
    </Form>
  );
}
