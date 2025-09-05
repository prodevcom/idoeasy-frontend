import { ComboBox } from '@carbon/react';
import { Controller } from 'react-hook-form';

import { getSupportedTimeZones } from '@/shared/helpers/preferences';

import type { Control, FieldErrors } from 'react-hook-form';

export interface TimeZoneFieldProps {
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

export function TimeZoneField({
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
}: TimeZoneFieldProps) {
  const supportedTimeZones = getSupportedTimeZones();
  const fieldError = errors?.[name];

  return (
    <Controller
      name={name}
      control={control}
      rules={{ required }}
      render={({ field: { onChange, value } }) => {
        const selectedTimeZone = supportedTimeZones.find((tz) => tz.value === value);
        return (
          <ComboBox
            id={id ?? name}
            name={name}
            titleText={
              required ? (titleText ?? 'Timezone') : `${titleText ?? 'Timezone'} (optional)`
            }
            helperText={helperText ?? 'Choose your timezone for date and time display'}
            placeholder={placeholder ?? 'Type city name or timezone...'}
            items={supportedTimeZones}
            itemToString={(item) => (item ? item.label : '')}
            selectedItem={selectedTimeZone || null}
            onChange={({ selectedItem }) => {
              onChange(selectedItem ? selectedItem.value : value); // Keep current value if null
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
