'use client';

import { useRouter } from 'next/navigation';

import { Column, Form, Grid, Stack } from '@carbon/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { isEqual } from 'lodash';
import { useTranslations } from 'next-intl';
import { useEffect, useTransition } from 'react';
import { useForm } from 'react-hook-form';

import type { AuthUser, UpdateUserRequest } from '@idoeasy/contracts';

import { RolesField, SubmitForm, TextField, UserStatusField } from '@/shared/components';
import { applyFormErrors, isRequired, parseApiErrors } from '@/shared/helpers';
import { useUserValidationSchemas } from '@/shared/validations';

import { useUserUpdate } from '../hooks';

type UserFormProps = {
  currentUser: AuthUser;
  uid: string;
};

export function UpdateUserForm({ uid, currentUser }: UserFormProps) {
  const router = useRouter();

  /* ------------------------------ Hooks ------------------------------ */
  const t = useTranslations('users');
  const [isTransitionPending, startTransition] = useTransition();
  const { UpdateUserSchema } = useUserValidationSchemas();
  const { defaults, submit, isUpdating, isLoading, isReady } = useUserUpdate(uid);
  const { control, handleSubmit, setError, formState, reset } = useForm({
    defaultValues: defaults as UpdateUserRequest,
    resolver: zodResolver(UpdateUserSchema),
    mode: 'onChange',
  });

  /* ------------------------------ Keys ------------------------------ */
  const { isSubmitting, isValid, errors } = formState;
  const formKey = isReady ? `user-form-${uid}` : 'user-form-loading';
  const disabled = isLoading || isSubmitting || isTransitionPending || isUpdating;
  const editingMySelf = currentUser.id === uid;

  /* ------------------------------ Effects ------------------------------ */
  useEffect(() => {
    if (!isReady) return;
    if (isSubmitting || isTransitionPending) return;
    reset((currentValues) => {
      return isEqual(currentValues, defaults) ? currentValues : defaults;
    });
  }, [isReady, defaults, reset, isSubmitting, isTransitionPending]);

  // Prefetch the users page
  useEffect(() => {
    router.prefetch('/users');
  }, [router]);

  // Submit the form
  const submitForm = async (values: UpdateUserRequest) => {
    try {
      startTransition(async () => {
        await submit(values);
        router.replace(`/users`);
      });
    } catch (error) {
      const map = parseApiErrors(error);
      applyFormErrors(setError, map);
    }
  };

  /* ------------------------------ Render ------------------------------ */
  return (
    <Form onSubmit={handleSubmit(submitForm)} key={formKey}>
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
        submitting={isUpdating || isTransitionPending}
        isValid={isValid}
        onSubmitText={t('form.save')}
        onCancelText={t('form.cancel')}
        onCancel={() => router.back()}
      />
    </Form>
  );
}
