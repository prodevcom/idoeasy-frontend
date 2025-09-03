'use client';

import {
  Button,
  Form,
  InlineNotification,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Stack,
} from '@carbon/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useRef } from 'react';
import { useForm } from 'react-hook-form';

import type { ChangePasswordRequest } from '@idoeasy/contracts';

import { useChangePassword } from '@/features/me';
import { PasswordField } from '@/shared/components';
import { useNotificationHelpers } from '@/shared/contexts';
import { isRequired } from '@/shared/helpers';
import { useMeValidationSchemas } from '@/shared/validations';

type ChangePasswordFormProps = { onClosed: () => void };

export function ChangePasswordModal({ onClosed }: ChangePasswordFormProps) {
  const t = useTranslations('profile');
  const { showSuccess } = useNotificationHelpers();
  const { defaults, mutation } = useChangePassword();
  const { ChangePasswordSchema } = useMeValidationSchemas();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<ChangePasswordRequest>({
    resolver: zodResolver(ChangePasswordSchema),
    defaultValues: defaults,
    mode: 'onChange',
  });

  const submittingRef = useRef(false);

  const onSubmit = async (values: ChangePasswordRequest) => {
    if (submittingRef.current || mutation.isPending) return;
    submittingRef.current = true;
    try {
      await mutation.mutateAsync(values);
      onClosed();
      showSuccess(t('changePassword.successTitle'), t('changePassword.successMessage'));
    } catch {
      // (mutation.isError e mutation.error?.message já cuidam do UI)
    } finally {
      submittingRef.current = false;
    }
  };

  const disabled = isSubmitting || mutation.isPending;

  return (
    <Form onSubmit={handleSubmit(onSubmit)} id="changePasswordForm" /* noValidate opcional */>
      <ModalHeader closeModal={onClosed}>
        <h2 className="cds--type-heading-02">{t('changePassword.title')}</h2>
        <p className="cds--type-body-01">{t('changePassword.description')}</p>
      </ModalHeader>

      <ModalBody style={{ minHeight: 300 }}>
        <Stack gap={4}>
          {mutation.isError && (
            <InlineNotification
              kind="error"
              title={t('changePassword.errorTitle')}
              subtitle={String(mutation.error?.message ?? t('changePassword.errorGeneric'))}
              lowContrast
            />
          )}

          <PasswordField
            name="currentPassword"
            labelText={t('changePassword.currentPassword.label')}
            control={control}
            errors={errors}
            required={isRequired(ChangePasswordSchema, 'currentPassword') as boolean}
            disabled={disabled}
          />

          <PasswordField
            name="newPassword"
            labelText={t('changePassword.newPassword.label')}
            control={control}
            errors={errors}
            required={isRequired(ChangePasswordSchema, 'newPassword') as boolean}
            disabled={disabled}
          />

          <PasswordField
            name="confirmPassword"
            labelText={t('changePassword.confirmPassword.label')}
            control={control}
            errors={errors}
            required={isRequired(ChangePasswordSchema, 'confirmPassword') as boolean}
            disabled={disabled}
          />
        </Stack>
      </ModalBody>

      <ModalFooter>
        <Button kind="secondary" size="lg" onClick={onClosed}>
          {t('changePassword.cancel')}
        </Button>
        <Button kind="primary" size="lg" type="submit" disabled={disabled || !isValid}>
          {disabled ? t('changePassword.loading') : t('changePassword.save')}
        </Button>
      </ModalFooter>
    </Form>
  );
}
