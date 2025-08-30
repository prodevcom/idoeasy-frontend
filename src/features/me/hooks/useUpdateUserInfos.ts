import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

import type { AuthUser, UpdateMeRequest } from '@entech/contracts';

import { updateMeInfos } from '../api';

export type useUpdateUserInfosProps = {
  currentUser: AuthUser;
};

export const useUpdateUserInfos = ({ currentUser }: useUpdateUserInfosProps) => {
  const qc = useQueryClient();

  const defaults: UpdateMeRequest = useMemo(
    () => ({
      name: currentUser.name,
      email: currentUser.email,
    }),
    [currentUser],
  );

  const mutation = useMutation({
    mutationFn: updateMeInfos,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['me'] });
    },
  });

  return {
    defaults,
    mutation,
  };
};
