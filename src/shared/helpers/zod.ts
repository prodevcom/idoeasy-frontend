/* eslint-disable @typescript-eslint/no-explicit-any */
// zod-enum-helpers.ts
import { z, ZodOptional } from 'zod';

type ValuesOf<O extends Record<string, string>> = O[keyof O];
type NonEmpty<T> = [T, ...T[]];

const asNonEmpty = <T>(arr: T[]): NonEmpty<T> => {
  if (arr.length === 0) throw new Error('Enum object has no values');
  return [arr[0]!, ...arr.slice(1)];
};

/** enum from const object (preserves literal union) */
export function zodEnumFromConst<const O extends Record<string, string>>(o: O) {
  const vals = asNonEmpty(Object.values(o) as ValuesOf<O>[]);
  // no custom message here
  return z.enum(vals);
}

/** required enum with custom message */
export function zodEnumFromConstRequired<const O extends Record<string, string>>(
  o: O,
  message: string,
) {
  const vals = asNonEmpty(Object.values(o) as ValuesOf<O>[]);
  // Zod v3: second arg supports { error: string }
  return z.enum(vals, { error: message });
}

/** UI-friendly required: maps '' -> undefined so "required" triggers */
export function zodEnumFromConstUIRequired<const O extends Record<string, string>>(
  o: O,
  message: string,
) {
  const base = zodEnumFromConstRequired(o, message);
  return z.preprocess((v) => (v === '' ? undefined : v), base);
}

export function isRequired<T extends z.ZodObject<any>, K extends keyof T['shape']>(
  schema: T,
  field: K,
): boolean {
  const fieldSchema = schema.shape[field as string];
  return !(fieldSchema instanceof ZodOptional);
}
