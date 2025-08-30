'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

import type { CreateUserRequest, UpdateUserRequest } from '@entech/contracts';

import { createUser, getUser, updateUser } from '../api';

export function useUserUpsert(id?: string) {
  const qc = useQueryClient();

  const userQuery = useQuery({
    queryKey: ['user', id],
    queryFn: () => getUser(id!),
    enabled: !!id,
    refetchOnMount: 'always',
  });

  const defaults: CreateUserRequest = useMemo(() => {
    return userQuery.data
      ? ({
          name: userQuery.data.name ?? '',
          email: userQuery.data.email ?? '',
          role: userQuery.data.role?.id ?? '',
          status: userQuery.data.status ?? 'PROVISIONED',
        } as CreateUserRequest)
      : ({
          name: '',
          email: '',
          password: '',
          role: '',
        } as CreateUserRequest);
  }, [userQuery.data]);

  const mutation = useMutation({
    mutationFn: async (values: CreateUserRequest | UpdateUserRequest) => {
      if (id) return updateUser(id, values as UpdateUserRequest);
      return createUser(values as CreateUserRequest);
    },
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: ['users'] });
      if (id) {
        qc.setQueryData(['user', id], updated);
        qc.invalidateQueries({ queryKey: ['user', id] });
        qc.invalidateQueries({ queryKey: ['users'] });
      }
    },
  });

  return {
    isLoading: userQuery.isLoading || mutation.isPending,
    submit: mutation.mutateAsync,
    defaults,
  };
}
