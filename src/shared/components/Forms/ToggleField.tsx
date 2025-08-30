import { Toggle } from '@carbon/react';
import { Controller, type Control } from 'react-hook-form';

type ToggleFieldLabel = {
  labelA: string;
  labelB: string;
};

type ToggleFieldProps = {
  name: string;
  control: Control<any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  label: ToggleFieldLabel;
  labelText: string;
  disabled?: boolean;
  size?: 'sm' | 'md';
};

export function ToggleField({
  name,
  control,
  label,
  labelText,
  disabled,
  size = 'md',
}: ToggleFieldProps) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <Toggle
          id={name}
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
