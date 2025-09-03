import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

import type { ChangePasswordRequest } from '@idoeasy/contracts';

import { changePassword } from '@/features/me/api';

export const useChangePassword = () => {
  const qc = useQueryClient();

  const defaults: ChangePasswordRequest = useMemo(
    () => ({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    }),
    [],
  );

  const mutation = useMutation({
    mutationFn: changePassword,
    retry: false,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['me'] });
    },
  });

  return {
    defaults,
    mutation,
  };
};
