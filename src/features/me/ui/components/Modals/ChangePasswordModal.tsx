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
import { PasswordField, SubmitButton } from '@/shared/components';
import { useNotificationHelpers } from '@/shared/contexts';
import { isRequired } from '@/shared/helpers';
import { useMeValidationSchemas } from '@/shared/validations';

type ChangePasswordFormProps = { onClosed: () => void };

export function ChangePasswordModal({ onClosed }: ChangePasswordFormProps) {
  const t = useTranslations('profile.changePassword');
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
      showSuccess(t('successTitle'), t('successMessage'));
    } catch {
    } finally {
      submittingRef.current = false;
    }
  };

  const disabled = isSubmitting || mutation.isPending;

  return (
    <>
      <ModalHeader closeModal={onClosed}>
        <h2 className="cds--type-heading-02">{t('title')}</h2>
        <p className="cds--type-body-01">{t('description')}</p>
      </ModalHeader>

      <ModalBody hasForm>
        <Form onSubmit={handleSubmit(onSubmit)} id="changePasswordForm">
          <Stack gap={4}>
            {mutation.isError && (
              <InlineNotification
                kind="error"
                title={t('errorTitle')}
                subtitle={String(mutation.error?.message ?? t('errorGeneric'))}
                lowContrast
              />
            )}

            <PasswordField
              name="currentPassword"
              labelText={t('currentPassword.label')}
              control={control}
              errors={errors}
              required={isRequired(ChangePasswordSchema, 'currentPassword') as boolean}
              disabled={disabled}
            />

            <PasswordField
              name="newPassword"
              labelText={t('newPassword.label')}
              control={control}
              errors={errors}
              required={isRequired(ChangePasswordSchema, 'newPassword') as boolean}
              disabled={disabled}
            />

            <PasswordField
              name="confirmPassword"
              labelText={t('confirmPassword.label')}
              control={control}
              errors={errors}
              required={isRequired(ChangePasswordSchema, 'confirmPassword') as boolean}
              disabled={disabled}
            />
          </Stack>
        </Form>
      </ModalBody>

      <ModalFooter>
        <Button kind="secondary" size="lg" onClick={onClosed}>
          {t('cancel')}
        </Button>
        <SubmitButton
          form="changePasswordForm"
          isSubmitting={isSubmitting}
          isValid={isValid}
          label={t('save')}
          loadingLabel={t('loading')}
        />
      </ModalFooter>
    </>
  );
}
