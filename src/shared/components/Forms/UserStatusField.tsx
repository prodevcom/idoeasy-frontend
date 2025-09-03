import { ComboBox } from '@carbon/react';
import { useTranslations } from 'next-intl';
import { Controller } from 'react-hook-form';

import { UserStatus } from '@idoeasy/contracts';

import { capitalizeWords } from '@/shared/helpers';

import type { Control, FieldError, FieldErrors } from 'react-hook-form';

export interface UserStatusFieldProps {
  id?: string;
  name: string;
  control: Control<any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  errors: FieldErrors<any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  titleText?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function UserStatusField({
  id,
  name,
  control,
  errors,
  titleText,
  placeholder,
  required = false,
  disabled,
  size = 'lg',
}: UserStatusFieldProps) {
  const t = useTranslations('users');
  const fieldError = errors[name] as FieldError;
  const items = Object.values(UserStatus) as UserStatus[];

  const innerTitle = titleText ?? t('status.title');
  const innerPlaceholder = placeholder ?? t('status.placeholder');

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { ref, value, onChange, onBlur } }) => {
        const selected = items.find((i) => i === value) ?? null;

        const translate = (status: UserStatus) => {
          switch (status) {
            case UserStatus.ACTIVE:
              return t('status.active');
            case UserStatus.INACTIVE:
              return t('status.inactive');
            case UserStatus.PROVISIONED:
              return t('status.provisioned');
            default:
              return status;
          }
        };

        return (
          <ComboBox
            ref={ref}
            id={id ?? name}
            name={name}
            titleText={required ? `${innerTitle}*` : innerTitle}
            placeholder={innerPlaceholder}
            items={items}
            itemToString={(item) => (item ? capitalizeWords(translate(item as UserStatus)) : '')}
            selectedItem={selected}
            onChange={(data) => {
              const { selectedItem } = data as { selectedItem?: string | null };
              return onChange(selectedItem ?? '');
            }}
            onBlur={onBlur}
            allowCustomValue={false}
            invalid={!!fieldError}
            invalidText={fieldError?.message as string}
            disabled={disabled}
            size={size}
          />
        );
      }}
    />
  );
}
