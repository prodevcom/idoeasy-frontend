import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';

import { getMyLastAuditLogs } from '../api';

export function useMyLogs() {
  const t = useTranslations('profile');
  const tableHeaders = [
    {
      key: 'createdAt',
      header: t('auditLogs.headers.date'),
    },
    {
      key: 'description',
      header: t('auditLogs.headers.description'),
    },
  ];

  const logsQuery = useQuery({
    queryKey: ['my-logs'],
    queryFn: getMyLastAuditLogs,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
    staleTime: 30_000,
  });

  return {
    headers: tableHeaders,
    logsQuery,
  };
}
