import { DatePicker, DatePickerInput } from '@carbon/react';
import { Controller, type Control, type FieldErrors } from 'react-hook-form';

import { useUserPreferencesContext } from '@/shared/contexts';
import { getFlatpickrDateFormat } from '@/shared/helpers';

type DatePickerFieldProps = {
  id?: string;
  name: string;
  control: Control<any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  errors: FieldErrors<any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  titleText: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
};
export function DatePickerField({
  id,
  name,
  control,
  errors,
  titleText,
  placeholder,
  required = false,
  disabled,
  size = 'lg',
}: DatePickerFieldProps) {
  const { locale = 'en-US' } = useUserPreferencesContext() || {};
  const fmt = getFlatpickrDateFormat(locale);
  const fieldError = errors?.[name];

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { value, onChange, ref } }) => {
        const dateValue =
          value instanceof Date ? value : value ? new Date(String(value)) : undefined;

        const dpKey = dateValue ? dateValue.toISOString().slice(0, 10) : 'empty';

        return (
          <DatePicker
            key={dpKey}
            datePickerType="single"
            dateFormat={fmt}
            maxDate={new Date()}
            allowInput
            value={dateValue ? [dateValue] : []}
            onChange={(dates) => {
              const d = dates?.[0];
              // IMPORTANT: send undefined (not null) when clearing
              onChange(d ?? undefined);
            }}
          >
            <DatePickerInput
              id={id ?? name}
              ref={ref}
              labelText={required ? titleText : `${titleText} (optional)`}
              placeholder={placeholder ?? fmt}
              invalid={!!fieldError}
              invalidText={(fieldError?.message as string) || undefined}
              disabled={disabled}
              size={size}
            />
          </DatePicker>
        );
      }}
    />
  );
}
