import { DatePicker, DatePickerInput, FormLabel } from '@carbon/react';
import { useController, type Control, type FieldErrors } from 'react-hook-form';

import { useUserPreferencesContext } from '@/shared/contexts';
import { getFlatpickrDateFormat } from '@/shared/helpers';

type DatePickerRangeFieldProps = {
  id?: string;
  startName: string;
  endName: string;
  control: Control<any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  errors: FieldErrors<any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  titleText: string;
  startLabelText?: string;
  endLabelText?: string;
  startPlaceholder?: string;
  endPlaceholder?: string;
  required?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

export function DatePickerRangeField({
  id,
  startName,
  endName,
  control,
  titleText,
  startLabelText = 'Start date',
  endLabelText = 'End date',
  startPlaceholder,
  endPlaceholder,
  required = false,
  disabled,
  size = 'lg',
}: DatePickerRangeFieldProps) {
  const { locale = 'en-US' } = useUserPreferencesContext() || {};
  const fmt = getFlatpickrDateFormat(locale);

  const {
    field: startField,
    fieldState: { error: startError },
  } = useController({ name: startName, control });

  const {
    field: endField,
    fieldState: { error: endError },
  } = useController({ name: endName, control });

  const startDate =
    startField.value instanceof Date
      ? startField.value
      : startField.value
        ? new Date(String(startField.value))
        : undefined;

  const endDate =
    endField.value instanceof Date
      ? endField.value
      : endField.value
        ? new Date(String(endField.value))
        : undefined;

  const dpKey = `${startDate ? startDate.toISOString().slice(0, 10) : 'empty'}_${endDate ? endDate.toISOString().slice(0, 10) : 'empty'}`;
  const hasError = !!(startError || endError);
  const errorText = (startError?.message as string) || (endError?.message as string) || undefined;

  return (
    <>
      <div style={{ marginBottom: '0.5rem' }}>
        <FormLabel>{titleText}</FormLabel>
      </div>
      <DatePicker
        key={dpKey}
        dateFormat={fmt}
        datePickerType="range"
        value={[startDate, endDate].filter(Boolean) as Date[]}
        onChange={(dates) => {
          const [s, e] = dates ?? [];
          startField.onChange(s ?? undefined);
          endField.onChange(e ?? undefined);
        }}
        allowInput
      >
        <DatePickerInput
          id={(id ?? startName) + '-start'}
          labelText={required ? ` ${startLabelText}` : ` ${startLabelText} (optional)`}
          placeholder={startPlaceholder ?? fmt}
          invalid={hasError}
          invalidText={errorText}
          disabled={disabled}
          size={size}
          onBlur={startField.onBlur}
          ref={startField.ref}
        />
        <DatePickerInput
          id={(id ?? endName) + '-end'}
          labelText={required ? endLabelText : `${endLabelText} (optional)`}
          placeholder={endPlaceholder ?? fmt}
          invalid={hasError}
          invalidText={errorText}
          disabled={disabled}
          size={size}
          onBlur={endField.onBlur}
          ref={endField.ref}
        />
      </DatePicker>
    </>
  );
}
