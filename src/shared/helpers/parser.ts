import { formatDate, getUserPreferences } from './preferences';

import type { UserPreferences } from '@idoeasy/contracts';

type WithId<T> = Omit<T, 'id'> & { id: string };

export function parseIntSafe(v: string | null, fallback: number) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

type FormatterMap<T> = {
  [K in keyof T]?: (value: T[K], row: T) => unknown;
};

/**
 * Enhanced mapToDataTables that automatically uses context preferences when available
 * Falls back to getUserPreferences() if no context is provided
 *
 * @param arr - The array to map
 * @param customFormatters - The custom formatters to use
 * @param contextPreferences - The context preferences to use
 * @param dateFields - The date fields to stringify
 * @returns The mapped array
 */
export function mapToDataTables<T extends { id: string }>(
  arr?: T[],
  customFormatters?: FormatterMap<T>,
  contextPreferences?: UserPreferences,
  dateFields?: string[],
): WithId<T>[] {
  // Use context preferences if provided, otherwise fall back to getUserPreferences
  const preferences = contextPreferences || getUserPreferences();
  // normalize input into an array of rows
  const rows: T[] = Array.isArray(arr)
    ? (arr as T[])
    : Array.isArray((arr as unknown as { data: T[] })?.data)
      ? (arr as unknown as { data: T[] }).data
      : [];
  return (
    rows?.map((row) => {
      const { id, ...rest } = row;
      const formatted: Record<string, unknown> = {};

      for (const [key, value] of Object.entries(rest)) {
        if (customFormatters && key in customFormatters) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatted[key] = customFormatters[key as keyof T]?.(value as any, row);
          continue;
        }

        if (dateFields?.includes(key) || isDateLikeKey(key)) {
          formatted[key] = tryStringifyDate(value, preferences);
        } else {
          formatted[key] = value;
        }
      }

      return {
        ...formatted,
        id,
      } as WithId<T>;
    }) ?? []
  );
}

/**
 * Check if a key is a date-like key
 *
 * @param key - The key to check
 * @returns True if the key is a date-like key, false otherwise
 */
export function isDateLikeKey(key: string): boolean {
  return /At$/i.test(key) || /(created|updated|deleted|modified|date|time|timestamp)$/i.test(key);
}

/**
 * Try to stringify a date
 *
 * @param value - The value to stringify
 * @param preferences - The preferences to use
 * @returns The stringified date or null if the value is not a date
 */
export function tryStringifyDate(value: unknown, preferences: UserPreferences): string | null {
  if (value instanceof Date) {
    return formatDate(value, preferences);
  } else if (typeof value === 'string' && !isNaN(Date.parse(value))) {
    return formatDate(value, preferences);
  } else {
    return null;
  }
}

/**
 * Get the direction of a sort
 *
 * @param isSorted - Whether the sort is sorted
 * @param direction - The direction of the sort
 * @returns The direction of the sort
 */
export const getDirection = (isSorted: boolean, direction: 'asc' | 'desc') => {
  if (!isSorted) return 'none';
  return direction.toUpperCase() as 'ASC' | 'DESC';
};
