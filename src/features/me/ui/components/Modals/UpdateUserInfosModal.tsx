import { useRouter } from 'next/navigation';

import { Button, Form, ModalBody, ModalFooter, ModalHeader } from '@carbon/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useRef } from 'react';
import { useForm } from 'react-hook-form';

import type { AuthUser, UpdateMeRequest } from '@idoeasy/contracts';

import { useUpdateUserInfos } from '@/features/me/hooks/useUpdateUserInfos';
import { SubmitButton, TextField } from '@/shared/components';
import { isRequired } from '@/shared/helpers';
import { useMeValidationSchemas } from '@/shared/validations';

export type UpdateUserInfosModalProps = {
  currentUser: AuthUser;
  onClosed: () => void;
};

export function UpdateUserInfosModal({ currentUser, onClosed }: UpdateUserInfosModalProps) {
  const router = useRouter();
  const t = useTranslations('profile.changeUserInfos');
  const { defaults, mutation } = useUpdateUserInfos({ currentUser });
  const { UpdateUserInfosSchema } = useMeValidationSchemas();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<UpdateMeRequest>({
    resolver: zodResolver(UpdateUserInfosSchema),
    defaultValues: defaults,
    mode: 'onChange',
  });

  const submittingRef = useRef(false);

  const onSubmit = async (values: UpdateMeRequest) => {
    if (submittingRef.current || mutation.isPending) return;
    submittingRef.current = true;
    try {
      await mutation.mutateAsync(values);
      onClosed();

      sessionStorage.setItem(
        'successMessage',
        JSON.stringify({ title: t('successTitle'), msg: t('successMessage') }),
      );

      router.refresh();
    } catch {
      // (mutation.isError e mutation.error?.message já cuidam do UI)
    } finally {
      submittingRef.current = false;
    }
  };

  const disabled = isSubmitting || mutation.isPending;

  return (
    <Form onSubmit={handleSubmit(onSubmit)} id="updateUserInfosForm">
      <ModalHeader closeModal={onClosed}>
        <h2 className="cds--type-heading-02">{t('title')}</h2>
        <p className="cds--type-body-01">{t('description')}</p>
      </ModalHeader>

      <ModalBody>
        <TextField
          name="name"
          labelText={t('name.label')}
          placeholder={t('name.placeholder')}
          control={control}
          errors={errors}
          disabled={disabled}
          required={isRequired(UpdateUserInfosSchema, 'name')}
        />

        <TextField
          name="email"
          labelText={t('email.label')}
          placeholder={t('email.placeholder')}
          control={control}
          errors={errors}
          disabled={disabled}
          required={isRequired(UpdateUserInfosSchema, 'email')}
        />
      </ModalBody>

      <ModalFooter>
        <Button kind="secondary" size="lg" onClick={onClosed}>
          {t('cancel')}
        </Button>

        <SubmitButton
          isSubmitting={isSubmitting}
          isValid={isValid}
          label={t('save')}
          loadingLabel={t('loading')}
        />
      </ModalFooter>
    </Form>
  );
}
