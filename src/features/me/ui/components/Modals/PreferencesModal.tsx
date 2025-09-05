'use client';

import { usePathname, useRouter } from 'next/navigation';

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

import type { UserPreferences } from '@idoeasy/contracts';

import { LocaleField, SubmitButton, TimeZoneField, ToggleField } from '@/shared/components';
import { isRequired } from '@/shared/helpers';
import { useMeValidationSchemas } from '@/shared/validations';

import { useUpdateUserPreferences } from '../../../hooks/useUserPreferences';

type PreferencesModalProps = {
  onClosed: () => void;
};

export function PreferencesModal({ onClosed }: PreferencesModalProps) {
  const router = useRouter();
  const pathname = usePathname();

  const t = useTranslations('profile.preferences');
  const tComponents = useTranslations('components');
  const { mutation, defaults } = useUpdateUserPreferences();
  const { UpdatePreferencesSchema } = useMeValidationSchemas();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<UserPreferences>({
    defaultValues: defaults,
    resolver: zodResolver(UpdatePreferencesSchema),
    mode: 'onChange',
  });

  const submittingRef = useRef(false);

  const onSubmit = async (values: UserPreferences) => {
    if (submittingRef.current || mutation.isPending) return;
    try {
      submittingRef.current = true;
      await mutation.mutateAsync(values);
      onClosed();
    } catch {
      // (mutation.isError e mutation.error?.message já cuidam do UI)
    } finally {
      submittingRef.current = false;
    }

    // Update the locale
    const locale = values.locale;

    // Get current pathname to preserve the route
    const currentPath = pathname;
    const pathSegments = currentPath.split('/').filter(Boolean);

    // Map locale preferences to Nex  tIntl locales
    const mapLocaleToNextIntl = (prefLocale: string): string => {
      if (prefLocale.startsWith('en')) return 'en';
      if (prefLocale.startsWith('pt')) return 'pt-BR';
      return 'en'; // fallback
    };

    const nextIntlLocale = mapLocaleToNextIntl(locale || 'en');

    sessionStorage.setItem(
      'successMessage',
      JSON.stringify({ title: t('successTitle'), msg: t('successMessage') }),
    );

    // If we're already in a locale route, replace the locale
    if (pathSegments.length > 0 && ['en', 'pt-BR'].includes(pathSegments[0])) {
      const newPath = `/${nextIntlLocale}${pathSegments
        .slice(1)
        .map((segment) => `/${segment}`)
        .join('')}`;

      // Force a hard reload to ensure NextIntl picks up the new locale
      router.replace(newPath);
    } else {
      // If not in a locale route, just redirect to the new locale
      router.replace(`/${nextIntlLocale}`);
    }
  };

  return (
    <>
      <ModalHeader closeModal={onClosed}>
        <h2 className="cds--type-heading-02">{t('title')}</h2>
        <p className="cds--type-body-01">{t('description')}</p>
      </ModalHeader>

      <ModalBody style={{ minHeight: 300 }}>
        <Form onSubmit={handleSubmit(onSubmit)} id="preferencesForm">
          <Stack gap={6}>
            {mutation.isError && (
              <InlineNotification
                kind="error"
                title={t('errorTitle')}
                subtitle={mutation.error?.message || t('errorGeneric')}
                lowContrast
              />
            )}

            <LocaleField
              name="locale"
              control={control}
              errors={errors}
              required={isRequired(UpdatePreferencesSchema, 'locale')}
              disabled={mutation.isPending || isSubmitting}
            />

            <TimeZoneField
              name="timeZone"
              control={control}
              errors={errors}
              required={isRequired(UpdatePreferencesSchema, 'timeZone')}
              disabled={mutation.isPending || isSubmitting}
            />

            <ToggleField
              name="showTimezoneOffset"
              control={control}
              label={{
                labelA: tComponents('showTimezoneOffset.labelA'),
                labelB: tComponents('showTimezoneOffset.labelB'),
              }}
              labelText={tComponents('showTimezoneOffset.label')}
              required={isRequired(UpdatePreferencesSchema, 'showTimezoneOffset')}
              disabled={mutation.isPending || isSubmitting}
            />

            <div
              style={{
                marginTop: '1rem',
                padding: '1rem',
                backgroundColor: '#f4f4f4',
                borderRadius: '4px',
              }}
            >
              <p style={{ fontSize: '0.875rem', color: '#525252', margin: 0 }}>{t('disclaimer')}</p>
            </div>
          </Stack>
        </Form>
      </ModalBody>

      <ModalFooter>
        <Button kind="secondary" size="lg" onClick={onClosed}>
          {t('cancel')}
        </Button>
        <SubmitButton
          form="preferencesForm"
          isSubmitting={isSubmitting}
          isValid={isValid}
          label={t('save')}
          loadingLabel={t('loading')}
        />
      </ModalFooter>
    </>
  );
}
