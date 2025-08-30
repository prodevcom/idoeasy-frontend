export interface PasswordFieldProps {
  id?: string;
  name: string;
  control: Control<any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  errors: FieldErrors<any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  labelText: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

import { PasswordInput } from '@carbon/react';
import { Controller, type Control, type FieldErrors } from 'react-hook-form';

export function PasswordField({
  id,
  name,
  control,
  errors,
  labelText,
  placeholder,
  required,
  disabled,
  size = 'lg',
}: PasswordFieldProps) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <PasswordInput
          {...field}
          id={id ?? name}
          labelText={required ? `${labelText}*` : labelText}
          placeholder={placeholder}
          invalid={!!errors[name]}
          invalidText={errors[name]?.message as string}
          disabled={disabled}
          size={size}
        />
      )}
    />
  );
}
