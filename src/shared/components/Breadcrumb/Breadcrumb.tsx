'use client';

import NextLink from 'next/link';
import { usePathname } from 'next/navigation';

import { BreadcrumbItem, Breadcrumb as CarbonBreadcrumb, Link } from '@carbon/react';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

import { useBreadcrumbs } from '@/shared/contexts';

/* ------------------------ Helpers ------------------------ */

function isLocale(seg?: string) {
  return !!seg && seg.length === 2;
}

function isId(seg: string) {
  return /^[a-f0-9]{24}$/i.test(seg) || /^[0-9a-f-]+$/i.test(seg);
}

function buildHref(segments: string[], index: number) {
  return '/' + segments.slice(0, index + 1).join('/');
}

function prettify(s: string) {
  return decodeURIComponent(s)
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/* -------------------------------- Breadcrumb -------------------------------- */

const Breadcrumb = () => {
  const pathname = usePathname();
  const t = useTranslations('breadcrumbs');
  const { getBreadcrumbLabel } = useBreadcrumbs();

  const segments = pathname.split('/').filter(Boolean);
  const segs = isLocale(segments[0]) ? segments.slice(1) : segments;

  const items = useMemo(() => {
    return segs.map((segment, i) => {
      const prev = i > 0 ? segs[i - 1] : undefined;
      const isLast = i === segs.length - 1;

      const override = getBreadcrumbLabel(segment, prev);

      if (override) {
        return { href: buildHref(segs, i), text: override, isLast };
      }

      if (isId(segment)) {
        return { href: buildHref(segs, i), text: segment, isLast };
      }

      let text = '-';
      try {
        text = t(segment);
      } catch {
        text = prettify(segment);
      }

      return { href: buildHref(segs, i), text, isLast };
    });
  }, [segs, t, getBreadcrumbLabel]);

  return (
    <CarbonBreadcrumb style={{ marginBottom: '1rem' }}>
      {items.map((item, i) => (
        <BreadcrumbItem key={i} isCurrentPage={item.isLast}>
          {item.isLast ? (
            <span aria-current="page">{item.text}</span>
          ) : (
            <Link as={NextLink} href={item.href}>
              {item.text}
            </Link>
          )}
        </BreadcrumbItem>
      ))}
    </CarbonBreadcrumb>
  );
};

export default Breadcrumb;
