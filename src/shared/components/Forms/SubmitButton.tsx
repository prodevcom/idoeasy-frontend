import { Button, Loading } from '@carbon/react';

import type { ButtonKind, ButtonSize } from '@carbon/react';

type SubmitButtonProps = {
  isSubmitting: boolean;
  isValid: boolean;
  label: string;
  loadingLabel?: string;
  size?: ButtonSize;
  kind?: ButtonKind;
};

export const SubmitButton = ({
  isSubmitting,
  isValid,
  label,
  loadingLabel,
  size = 'lg',
  kind = 'primary',
}: SubmitButtonProps) => {
  return (
    <Button
      kind={kind}
      size={size}
      type="submit"
      disabled={isSubmitting || !isValid}
      renderIcon={(props) =>
        isSubmitting ? <Loading small withOverlay={false} {...props} /> : null
      }
    >
      {isSubmitting ? (loadingLabel ?? 'Loading') : label}
    </Button>
  );
};
