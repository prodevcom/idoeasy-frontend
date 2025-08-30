'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

import { createRole, getRole, updateRole } from '@/features/roles';

export type UpsertValues = {
  name: string;
  description: string;
  isActive: boolean;
  isAdmin: boolean;
  parentId?: string;
  permissions: string[];
};

export function useRoleUpsert(id?: string) {
  const qc = useQueryClient();

  const roleQuery = useQuery({
    queryKey: ['role', id],
    queryFn: () => getRole(id!),
    enabled: !!id,
    refetchOnMount: 'always',
  });

  const defaults: UpsertValues = useMemo(
    () =>
      roleQuery.data
        ? {
            name: roleQuery.data.name ?? '',
            description: roleQuery.data.description ?? '',
            isActive: !!roleQuery.data.isActive,
            isAdmin: !!roleQuery.data.isAdmin,
            parentId: undefined,
            permissions: roleQuery.data.permissions?.map((i) => i.id) ?? [],
          }
        : {
            name: '',
            description: '',
            isActive: true,
            isAdmin: false,
            parentId: undefined,
            permissions: [],
          },
    [roleQuery.data],
  );

  const mutation = useMutation({
    mutationFn: async (values: UpsertValues) => {
      if (id) return updateRole(id, values);
      return createRole(values);
    },
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: ['roles'] });
      if (id) {
        qc.setQueryData(['role', id], updated);
        qc.invalidateQueries({ queryKey: ['role', id] });
      }
    },
  });

  return {
    isLoading: roleQuery.isLoading,
    isError: roleQuery.isError,
    submit: mutation.mutateAsync,
    defaults,
  };
}
