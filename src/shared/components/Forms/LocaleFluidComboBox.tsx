import FluidComboBox from '@carbon/react/lib/components/FluidComboBox/FluidComboBox';
import { Controller } from 'react-hook-form';

import { getSupportedLocales } from '@/shared/helpers/preferences';

import type { Control, RegisterOptions } from 'react-hook-form';

export interface LocaleFluidComboBoxProps {
  id?: string;
  name: string;
  control?: Control<any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  rules?: RegisterOptions;
  invalid?: boolean;
  invalidText?: string;
  disabled?: boolean;
}

export function LocaleFluidComboBox({
  id,
  name,
  control,
  rules,
  invalid,
  invalidText,
  disabled,
}: LocaleFluidComboBoxProps) {
  const locales = getSupportedLocales();
  const hasRequiredRule = rules?.required;

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field: { ref, value, onChange } }) => {
        const selected = locales.find((i) => i.value === value) ?? null;
        return (
          <FluidComboBox
            ref={ref}
            id={id ?? name}
            name={name}
            label={hasRequiredRule ? 'Locale' : 'Locale (optional)'}
            titleText={hasRequiredRule ? 'Locale' : 'Locale (optional)'}
            placeholder="Select a locale"
            items={locales}
            itemToString={(item) => (item as { label: string })?.label ?? ''}
            selectedItem={selected}
            onChange={(d) =>
              onChange(d.selectedItem ? (d.selectedItem as { value: string }).value : '')
            }
            disabled={disabled}
            invalid={invalid}
            invalidText={invalidText}
            isCondensed
          />
        );
      }}
    />
  );
}
