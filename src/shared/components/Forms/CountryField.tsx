import { ComboBox } from '@carbon/react';
import { Controller, type Control, type FieldErrors } from 'react-hook-form';

import { capitalizeWords } from '@/shared/helpers/strings';
import { useCountries } from '@/shared/hooks/forms/useCountries';

import type { Country } from 'world-countries';

export interface CountryFieldProps {
  id?: string;
  name: string;
  control: Control<any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  errors: FieldErrors<any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  titleText?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

export function CountryField({
  id,
  name,
  control,
  errors,
  titleText,
  placeholder,
  required = false,
  disabled,
}: CountryFieldProps) {
  const { countries } = useCountries();
  const fieldError = errors?.[name];

  return (
    <Controller
      name={name}
      control={control}
      rules={{ required }}
      render={({ field: { ref, value, onChange } }) => {
        const selectedItem: Country | null = value
          ? (countries.find((c) => c.cca2 === value) ?? null)
          : null;

        return (
          <ComboBox
            ref={ref}
            id={id ?? name}
            name={name}
            titleText={required ? (titleText ?? 'Country') : `${titleText ?? 'Country'} (optional)`}
            placeholder={placeholder ?? 'Select a country'}
            items={countries}
            itemToString={(item) => (item ? capitalizeWords((item as Country).name.common) : '')}
            selectedItem={selectedItem}
            onChange={(data) => {
              const { selectedItem } = data as { selectedItem?: Country | null };
              return onChange(selectedItem ? (selectedItem as Country).cca2 : '');
            }}
            invalid={!!fieldError}
            invalidText={(fieldError?.message as string) || undefined}
            disabled={disabled}
            size="lg"
            shouldFilterItem={({ item, inputValue }) =>
              (item as Country).name.common.toLowerCase().includes((inputValue ?? '').toLowerCase())
            }
          />
        );
      }}
    />
  );
}
