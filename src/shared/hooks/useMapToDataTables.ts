import { useUserPreferencesContext } from '@/shared/contexts';
import { mapToDataTables } from '@/shared/helpers/parser';

type WithId<T> = Omit<T, 'id'> & { id: string };

type FormatterMap<T> = {
  [K in keyof T]?: (value: T[K], row: T) => unknown;
};

/**
 * Hook version of mapToDataTables that automatically gets preferences from context
 * Use this in React components for cleaner code without passing preferences manually
 */
export function useMapToDataTables(dateFields?: string[]) {
  const contextPreferences = useUserPreferencesContext();

  return <T extends { id: string }>(arr?: T[], customFormatters?: FormatterMap<T>): WithId<T>[] => {
    return mapToDataTables(arr, customFormatters, contextPreferences, dateFields);
  };
}
