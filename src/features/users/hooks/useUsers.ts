'use client';

import { useMutation, useQuery, useQueryClient, type QueryKey } from '@tanstack/react-query';
import { useMemo } from 'react';

import type { CreateUserRequest, UpdateUserRequest } from '@idoeasy/contracts';

import { createUser, getUser, updateUser } from '../api';

type User = Awaited<ReturnType<typeof getUser>>;
type CreateResult = Awaited<ReturnType<typeof createUser>>;
type UpdateResult = Awaited<ReturnType<typeof updateUser>>;

export const qk = {
  user: (id: string): QueryKey => ['user', id],
  users: ['users'] as const,
};

// Keep these as module-level constants to preserve reference identity.
const DEFAULTS_CREATE: CreateUserRequest = Object.freeze({
  name: '',
  email: '',
  password: '',
  role: '',
  status: 'ACTIVE',
});

// Use a frozen object for “loading” update defaults, also stable by reference.
const DEFAULTS_UPDATE_LOADING: UpdateUserRequest = Object.freeze({
  name: '',
  email: '',
  role: '',
  status: 'ACTIVE',
});

function toUpdateDefaults(u: User): UpdateUserRequest {
  return {
    name: u.name ?? '',
    email: u.email ?? '',
    role: u.role?.id ?? '',
    status: u.status ?? 'ACTIVE',
  };
}

/* ------------------------------- useUserCreate ------------------------------ */
export function useUserCreate(): {
  isLoading: boolean;
  defaults: CreateUserRequest;
  submit: (values: CreateUserRequest) => Promise<CreateResult>;
} {
  const qc = useQueryClient();

  const mutation = useMutation<CreateResult, unknown, CreateUserRequest>({
    mutationKey: ['user-create'],
    mutationFn: (values) => createUser(values),
    onSuccess: (created) => {
      const createdAsUser = created.data as Partial<User>;
      if (createdAsUser.id) qc.setQueryData<User>(qk.user(createdAsUser.id), created.data as User);
      qc.invalidateQueries({ queryKey: qk.users });
    },
  });

  // defaults are a frozen constant — stable by reference:
  return {
    isLoading: mutation.isPending,
    defaults: DEFAULTS_CREATE,
    submit: mutation.mutateAsync,
  };
}

/* ------------------------------- useUserUpdate ------------------------------ */
export function useUserUpdate(id: string): {
  submit: (values: UpdateUserRequest) => Promise<UpdateResult>;
  defaults: UpdateUserRequest;
  isUpdating: boolean;
  isLoading: boolean;
  isReady: boolean;
  user?: User;
} {
  const qc = useQueryClient();

  const userQuery = useQuery<User>({
    queryKey: qk.user(id),
    queryFn: () => getUser(id),
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    placeholderData: (prev) => prev,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });

  // Only create a new defaults object when the underlying user object changes.
  const defaults = useMemo<UpdateUserRequest>(() => {
    if (userQuery.data) return toUpdateDefaults(userQuery.data);
    return DEFAULTS_UPDATE_LOADING;
  }, [userQuery.data]);

  const mutation = useMutation<UpdateResult, unknown, UpdateUserRequest>({
    mutationKey: ['user-update', id],
    mutationFn: (values) => updateUser(id, values),
    onSuccess: (updated) => {
      qc.setQueryData<User>(qk.user(id), updated.data as User);
      qc.invalidateQueries({ queryKey: qk.user(id) });
      qc.invalidateQueries({ queryKey: qk.users });
    },
  });

  return {
    defaults,
    isLoading: userQuery.isLoading || mutation.isPending,
    isReady: Boolean(userQuery.data),
    submit: mutation.mutateAsync,
    isUpdating: mutation.isPending,
    user: userQuery.data,
  };
}
