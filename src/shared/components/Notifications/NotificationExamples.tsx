'use client';

import { Button, Stack } from '@carbon/react';

import { useNotificationHelpers } from '@/shared/contexts';

export function NotificationExamples() {
  const { showSuccess, showError, showWarning, showInfo } = useNotificationHelpers();

  return (
    <Stack gap={4}>
      <h3>Test Notifications</h3>
      <Stack gap={2}>
        <Button onClick={() => showSuccess('Success!', 'This is a success message')}>
          Show Success
        </Button>
        <Button onClick={() => showError('Error!', 'This is an error message')}>Show Error</Button>
        <Button onClick={() => showWarning('Warning!', 'This is a warning message')}>
          Show Warning
        </Button>
        <Button onClick={() => showInfo('Info!', 'This is an info message')}>Show Info</Button>
      </Stack>
    </Stack>
  );
}
