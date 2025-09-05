'use client';

import { ComboBox } from '@carbon/react';
import { useTranslations } from 'next-intl';
import { Controller } from 'react-hook-form';

import { getSupportedLocales } from '@/shared/helpers/preferences';

import type { Control, FieldErrors } from 'react-hook-form';

export interface LocaleFieldProps {
  id?: string;
  name: string;
  control?: Control<any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  errors?: FieldErrors<any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  titleText?: string;
  helperText?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  direction?: 'top' | 'bottom';
  size?: 'sm' | 'md' | 'lg';
}

export function LocaleField({
  id,
  name,
  control,
  errors,
  titleText,
  helperText,
  placeholder,
  required,
  disabled,
  direction = 'bottom',
  size = 'md',
}: LocaleFieldProps) {
  const t = useTranslations('components.locale');
  const fieldError = errors?.[name];
  const locales = getSupportedLocales();

  return (
    <Controller
      name={name}
      control={control}
      rules={{ required }}
      render={({ field: { ref, value, onChange } }) => {
        const selected = locales.find((i) => i.value === value) ?? null;

        return (
          <ComboBox
            ref={ref}
            id={id ?? name}
            name={name}
            titleText={
              required ? (titleText ?? t('label')) : `${titleText ?? t('label')} (optional)`
            }
            helperText={helperText ?? t('helperText')}
            placeholder={placeholder ?? t('placeholder')}
            items={locales}
            itemToString={(item) => (item ? item.label : '')}
            selectedItem={selected || null}
            onChange={({ selectedItem }) => {
              onChange(selectedItem ? selectedItem.value : value);
            }}
            invalid={!!fieldError}
            invalidText={fieldError?.message as string}
            direction={direction}
            size={size}
            disabled={disabled}
          />
        );
      }}
    />
  );
}
