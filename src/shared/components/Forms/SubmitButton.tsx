'use client';

import { Button, type ButtonProps } from '@carbon/react';

type BaseProps = {
  isSubmitting: boolean;
  isValid: boolean;
  label: string;
  loadingLabel?: string;
};

/** Merge Carbon's button props (rendering a <button>) with our custom props */
export type SubmitButtonProps = BaseProps & ButtonProps<'button'>;

export function SubmitButton({
  isSubmitting,
  isValid,
  label,
  loadingLabel = 'Saving…',
  type = 'submit', // default submit
  disabled,
  ...rest
}: SubmitButtonProps) {
  return (
    <Button type={type} disabled={disabled ?? (isSubmitting || !isValid)} {...rest}>
      {isSubmitting ? loadingLabel : label}
    </Button>
  );
}
