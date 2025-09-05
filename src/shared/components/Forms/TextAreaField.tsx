import { TextArea } from '@carbon/react';
import { Controller, type Control, type FieldErrors } from 'react-hook-form';

export interface TextAreaFieldProps {
  id?: string;
  name: string;
  control: Control<any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  errors: FieldErrors<any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  rows?: number;
  labelText: string;
  enableCounter?: boolean;
  maxCount?: number;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  counterMode?: 'character' | 'word';
}

export function TextAreaField({
  id,
  name,
  control,
  errors,
  rows = 8,
  labelText,
  enableCounter = true,
  maxCount,
  placeholder,
  required,
  disabled,
  counterMode = 'character',
}: TextAreaFieldProps) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <TextArea
          {...field}
          id={id ?? name}
          name={name}
          labelText={required ? `${labelText}*` : labelText}
          rows={rows}
          placeholder={placeholder}
          invalid={!!errors[name]}
          invalidText={errors[name]?.message as string}
          disabled={disabled}
          enableCounter={enableCounter}
          maxCount={maxCount}
          counterMode={counterMode}
        />
      )}
    />
  );
}
