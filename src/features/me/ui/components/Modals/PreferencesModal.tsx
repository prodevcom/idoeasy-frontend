'use client';

import { usePathname, useRouter } from 'next/navigation';

import {
  Button,
  ComboBox,
  Form,
  InlineNotification,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Stack,
  Toggle,
} from '@carbon/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';

import type { UserPreferences } from '@entech/contracts';

import { getSupportedLocales, getSupportedTimeZones } from '@/shared/helpers/preferences';
import { useMeValidationSchemas } from '@/shared/validations';

import { useUpdateUserPreferences } from '../../../hooks/useUserPreferences';

type PreferencesModalProps = {
  onClosed: () => void;
};

export function PreferencesModal({ onClosed }: PreferencesModalProps) {
  const router = useRouter();
  const pathname = usePathname();

  const t = useTranslations('profile.preferences');
  const { mutation, defaults } = useUpdateUserPreferences();
  const { UpdatePreferencesSchema } = useMeValidationSchemas();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UserPreferences>({
    defaultValues: defaults,
    resolver: zodResolver(UpdatePreferencesSchema),
    mode: 'onChange',
  });

  const supportedLocales = getSupportedLocales();
  const supportedTimeZones = getSupportedTimeZones();

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
    <Form onSubmit={handleSubmit(onSubmit)} id="preferencesForm">
      <ModalHeader closeModal={onClosed}>
        <h2 className="cds--type-heading-02">{t('title')}</h2>
        <p className="cds--type-body-01">{t('description')}</p>
      </ModalHeader>

      <ModalBody style={{ minHeight: 300 }}>
        <Stack gap={6}>
          {mutation.isError && (
            <InlineNotification
              kind="error"
              title="Error"
              subtitle={mutation.error?.message || 'Failed to update preferences'}
              lowContrast
            />
          )}

          <Controller
            control={control}
            name="locale"
            rules={{ required: 'Locale is required' }}
            render={({ field: { onChange, value } }) => {
              const selectedLocale = supportedLocales.find((loc) => loc.value === value);
              return (
                <ComboBox
                  id="locale"
                  titleText="Language / Locale"
                  helperText="Choose your preferred language and region format"
                  placeholder="Type to search languages..."
                  items={supportedLocales}
                  itemToString={(item) => (item ? item.label : '')}
                  selectedItem={selectedLocale || null}
                  onChange={({ selectedItem }) => {
                    onChange(selectedItem ? selectedItem.value : value);
                  }}
                  invalid={!!errors.locale}
                  invalidText={errors.locale?.message}
                  direction="bottom"
                  size="md"
                />
              );
            }}
          />

          <Controller
            control={control}
            name="timeZone"
            rules={{ required: 'Timezone is required' }}
            render={({ field: { onChange, value } }) => {
              const selectedTimeZone = supportedTimeZones.find((tz) => tz.value === value);
              return (
                <ComboBox
                  id="timeZone"
                  titleText="Timezone"
                  helperText="Choose your timezone for date and time display"
                  placeholder="Type city name or timezone..."
                  items={supportedTimeZones}
                  itemToString={(item) => (item ? item.label : '')}
                  selectedItem={selectedTimeZone || null}
                  onChange={({ selectedItem }) => {
                    onChange(selectedItem ? selectedItem.value : value); // Keep current value if null
                  }}
                  invalid={!!errors.timeZone}
                  invalidText={errors.timeZone?.message}
                  direction="bottom"
                  size="md"
                />
              );
            }}
          />

          <Controller
            control={control}
            name="showTimezoneOffset"
            render={({ field: { onChange, value } }) => (
              <Toggle
                id="showTimezoneOffset"
                labelText="Show timezone offset"
                labelA="Hide"
                labelB="Show"
                toggled={value}
                onToggle={onChange}
                size="md"
              />
            )}
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
      </ModalBody>

      <ModalFooter>
        <Button kind="secondary" size="lg" onClick={onClosed}>
          {t('cancel')}
        </Button>
        <Button
          kind="primary"
          size="lg"
          type="submit"
          disabled={mutation.isPending || isSubmitting}
        >
          {t('save')}
        </Button>
      </ModalFooter>
    </Form>
  );
}
