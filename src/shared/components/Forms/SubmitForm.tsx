import { Button, Loading, Stack } from '@carbon/react';

type SubmitFormProps = {
  submitting?: boolean;
  isValid?: boolean;
  onSubmitText: string;
  onCancelText: string;
  onCancel: () => void;
};

export const SubmitForm = ({
  submitting,
  isValid,
  onSubmitText = 'Save',
  onCancelText = 'Cancel',
  onCancel,
}: SubmitFormProps) => {
  return (
    <Stack orientation="horizontal">
      <Button
        size="lg"
        type="submit"
        kind="primary"
        disabled={submitting || !isValid}
        iconDescription={submitting ? 'Saving…' : 'Save'}
        renderIcon={(props) =>
          submitting ? <Loading small withOverlay={false} {...props} /> : null
        }
      >
        {submitting ? 'Saving…' : onSubmitText}
      </Button>
      <Button type="button" kind="secondary" disabled={submitting} onClick={onCancel}>
        {onCancelText}
      </Button>
    </Stack>
  );
};
