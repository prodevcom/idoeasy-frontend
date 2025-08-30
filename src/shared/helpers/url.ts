/* eslint-disable @typescript-eslint/no-explicit-any */

type Primitive = string | number | boolean | string[] | number[];

export const defaultPageSchema = {
  page: {
    qs: 'page',
    default: 1,
    serialize: (n: number) => (n > 1 ? String(n) : null),

    deserialize: (v: any) => {
      const s = Array.isArray(v) ? v[0] : v;
      const n = Number(s);
      return Number.isFinite(n) && n > 0 ? n : 1;
    },
  },
  pageSize: {
    qs: 'limit',
    default: 10,
    serialize: (n: number) => (n > 1 ? String(n) : null),
    deserialize: (v: any) => {
      const s = Array.isArray(v) ? v[0] : v;
      const n = Number(s);
      return Number.isFinite(n) && n > 0 ? n : 10;
    },
  },
};

export type ParamDef<T extends Primitive> = {
  qs: string;
  default?: T;
  serialize?: (v: T) => string | string[] | null | undefined;
  deserialize?: (v: string | string[]) => T;
  equals?: (a: T, b: T) => boolean;
  omitIfDefault?: boolean;
};

export type Schema<Shape extends Record<string, Primitive>> = {
  [K in keyof Shape]: ParamDef<Shape[K]>;
};

function defaultEquals<T>(a: T, b: T) {
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
    return true;
  }
  return a === b;
}

export function createQueryHelpers<Shape extends Record<string, Primitive>>(schema: Schema<Shape>) {
  const orderedKeys = Object.keys(schema) as (keyof Shape)[];

  function toPairs(params: Partial<Shape>): [string, string][] {
    const pairs: [string, string][] = [];
    for (const k of orderedKeys) {
      const def = schema[k];
      const val = params[k];
      if (val === undefined || val === null) continue;

      const omitDefault = def.omitIfDefault ?? def.default !== undefined;
      const eq = def.equals ?? (defaultEquals as (a: any, b: any) => boolean);
      if (omitDefault && def.default !== undefined && eq(val as any, def.default as any)) {
        continue;
      }

      const raw = def.serialize ? def.serialize(val as any) : (val as any);
      if (raw == null) continue;

      if (Array.isArray(raw)) {
        for (const item of raw) pairs.push([def.qs, String(item)]);
      } else {
        pairs.push([def.qs, String(raw)]);
      }
    }
    return pairs;
  }

  function build(pathname: string, params: Partial<Shape>) {
    const usp = new URLSearchParams();
    for (const [k, v] of toPairs(params)) usp.append(k, v);
    const qs = usp.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }

  function append(url: string, params: Partial<Shape>) {
    const u = new URL(url, 'http://local');
    const usp = u.searchParams;
    // clear known keys, then append pairs
    for (const k of orderedKeys) usp.delete(schema[k].qs);
    for (const [key, val] of toPairs(params)) usp.append(key, val);
    const qs = usp.toString();
    const path = u.pathname + (qs ? `?${qs}` : '');
    return url.startsWith('http') ? u.origin + path : path;
  }

  function parse(source: string | URLSearchParams): Shape {
    const usp = typeof source === 'string' ? new URL(source, 'http://local').searchParams : source;

    const out = {} as Shape;
    for (const k of orderedKeys) {
      const def = schema[k];
      const all = usp.getAll(def.qs);
      const val = def.deserialize
        ? def.deserialize(all.length > 1 ? all : (all[0] ?? ''))
        : all.length > 1
          ? all
          : (all[0] as any);

      (out as any)[k] = val === undefined || val === null || val === '' ? def.default : val;
    }
    return out;
  }

  return { build, append, parse };
}
