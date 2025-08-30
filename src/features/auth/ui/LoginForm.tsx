'use client';

import { useRouter, useSearchParams } from 'next/navigation';

import { Form, Link, Stack } from '@carbon/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { memo, useMemo } from 'react';
import { useForm } from 'react-hook-form';

import type { LoginRequest } from '@entech/contracts';

import { PasswordField, SubmitButton, TextField } from '@/shared/components';
import { isRequired } from '@/shared/helpers';
import { LoginSchema } from '@/shared/validations';

export const LoginForm = memo(function LoginForm() {
  const t = useTranslations('login');
  const router = useRouter();
  const search = useSearchParams();
  const next = useMemo(() => search.get('next') || '/dash', [search]);

  // Show loading while checking authentication
  const {
    control,
    handleSubmit,
    setError,
    formState: { isSubmitting, isValid, errors },
  } = useForm<LoginRequest>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: LoginRequest) => {
    const res = await signIn('credentials', {
      email: values.email,
      password: values.password,
      redirect: false,
    });

    if (res?.error) {
      setError('email', { type: 'server', message: res.error });
      setError('password', { type: 'server', message: res.error });
      return;
    }

    router.replace(next);
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Stack gap={6}>
        <TextField
          name="email"
          labelText={t('form.email')}
          placeholder={t('form.email')}
          errors={errors}
          control={control}
          required={isRequired(LoginSchema, 'email')}
        />

        <PasswordField
          name="password"
          labelText={t('form.password')}
          placeholder={t('form.password')}
          errors={errors}
          control={control}
          required={isRequired(LoginSchema, 'password')}
        />

        <Stack
          orientation="horizontal"
          gap={3}
          style={{ justifyContent: 'space-between', alignItems: 'center' }}
        >
          <SubmitButton isSubmitting={isSubmitting} isValid={isValid} label={t('form.signIn')} />
          <Link href="/forgot-password">{t('form.forgotPassword')}</Link>
        </Stack>
      </Stack>
    </Form>
  );
});
