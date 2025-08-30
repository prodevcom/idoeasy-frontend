'use client';

import { ComboBox } from '@carbon/react';
import { useQuery } from '@tanstack/react-query';
import { Controller } from 'react-hook-form';

import type { Role } from '@entech/contracts';

import { searchRoles } from '@/features/roles';

import type { Control, FieldError, FieldErrors } from 'react-hook-form';

export interface RolesFieldProps {
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

export function RolesField({
  id,
  name,
  control,
  errors,
  titleText,
  placeholder,
  required,
  disabled,
  size = 'lg',
}: RolesFieldProps) {
  const { data: roles, isLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: () => searchRoles({ page: 1, limit: 1000, isActive: true }),
  });

  const items = roles?.data ?? [];

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { ref, value, onChange, onBlur } }) => {
        const fieldError = errors[name] as FieldError;
        const selectedItem: Role | null = value
          ? (items.find((i) => i.id === value) ?? null)
          : null;

        return (
          <ComboBox
            ref={ref}
            id={id ?? name}
            name={name}
            titleText={required ? `${titleText}*` : titleText}
            placeholder={isLoading ? 'Loading...' : (placeholder ?? 'Select a role')}
            items={items}
            itemToString={(item) => (item ? item.name : '')}
            selectedItem={selectedItem}
            onChange={(data) => {
              const { selectedItem } = data as { selectedItem?: Role | null };
              return onChange(selectedItem ? selectedItem.id : '');
            }}
            onBlur={onBlur}
            allowCustomValue={false}
            invalid={!!fieldError}
            invalidText={fieldError?.message as string}
            disabled={disabled || isLoading}
            size={size}
          />
        );
      }}
    />
  );
}
