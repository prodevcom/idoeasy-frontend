import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';

export type FieldErrorsMap = Record<string, string>;

/**
 * Robust parser:
 * - Accepts Axios-style errors (err.response.data.status.message)
 * - Accepts plain strings, arrays of messages, and simple objects
 * - Supports formats:
 *   "email already exists: foo@bar.com"
 *   "email: already exists"
 *   "email - already exists"
 *   "name is required, email already exists"
 */
export function parseApiErrors(err: unknown): FieldErrorsMap {
  // Try to pull a canonical message first (Axios-style)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anyErr = err as any;
  const payload =
    anyErr?.response?.data?.status?.message ??
    anyErr?.response?.data?.message ??
    anyErr?.message ??
    anyErr;

  // If array of messages
  if (Array.isArray(payload)) {
    return payload.reduce<FieldErrorsMap>((acc, item) => {
      const entry = normalizeSingleMessage(String(item));
      if (entry) acc[entry.field] = entry.message;
      return acc;
    }, {});
  }

  // If object with field->message
  if (payload && typeof payload === 'object') {
    // You can be stricter if your API sometimes returns a map already
    const out: FieldErrorsMap = {};
    for (const [k, v] of Object.entries(payload)) {
      out[k] = typeof v === 'string' ? v : JSON.stringify(v);
    }
    return out;
  }

  // If single string
  if (typeof payload === 'string') {
    // Split by commas into potential multi-field messages
    const parts = payload
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    return parts.reduce<FieldErrorsMap>((acc, part) => {
      const entry = normalizeSingleMessage(part);
      if (entry) acc[entry.field] = entry.message;
      return acc;
    }, {});
  }

  return {};
}

/** Parses a single "segment" into { field, message } */
function normalizeSingleMessage(segment: string): { field: string; message: string } | null {
  // Try common patterns first: "field: message" or "field - message"
  let m = segment.match(/^(\w+)\s*[:\-]\s*(.+)$/);
  if (m) {
    return { field: m[1], message: m[2].trim() };
  }

  // Fallback: "field rest of message"
  m = segment.match(/^(\w+)\s+(.*)$/);
  if (m) {
    return { field: m[1], message: m[2].trim() };
  }

  // Last resort: attach to a generic key
  return { field: 'form', message: segment.trim() };
}

/**
 * Apply parsed errors into RHF
 */

export type FieldErrorsMapTyped<T extends FieldValues> = Partial<Record<Path<T>, string>> & {
  root?: string;
};

export function applyFormErrors<T extends FieldValues>(
  setError: UseFormSetError<T>,
  map: FieldErrorsMapTyped<T>,
) {
  const entries = Object.entries(map) as Array<[Path<T> | 'root', string]>;
  if (!entries.length) return;

  entries.forEach(([field, message], idx) => {
    if (field === 'root') {
      setError('root', { type: 'server', message });
    } else {
      setError(field, { type: 'server', message }, { shouldFocus: idx === 0 });
    }
  });
}
