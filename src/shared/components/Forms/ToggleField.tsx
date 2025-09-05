import { Toggle } from '@carbon/react';
import { Controller } from 'react-hook-form';

import type { Control } from 'react-hook-form';

type ToggleFieldLabel = {
  labelA: string;
  labelB: string;
};

type ToggleFieldProps = {
  id?: string;
  name: string;
  control: Control<any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  label: ToggleFieldLabel;
  labelText: string;
  required?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md';
};

export function ToggleField({
  id,
  name,
  control,
  label,
  labelText,
  required,
  disabled,
  size = 'md',
}: ToggleFieldProps) {
  return (
    <Controller
      name={name}
      control={control}
      rules={{ required }}
      render={({ field }) => (
        <Toggle
          id={id ?? name}
          labelA={label.labelA}
          labelB={label.labelB}
          labelText={labelText}
          toggled={field.value}
          onToggle={field.onChange}
          disabled={disabled}
          size={size}
        />
      )}
    />
  );
}
