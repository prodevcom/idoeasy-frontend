'use client';

import { usePathname } from 'next/navigation';

import { BreadcrumbItem, Breadcrumb as CarbonBreadcrumb, Link } from '@carbon/react';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

const Breadcrumb = () => {
  const pathname = usePathname();
  const t = useTranslations('breadcrumbs');

  // Break the url into segments
  const segments = pathname.split('/').filter(Boolean);

  // Remove the first segment (locale)
  const segmentsWithoutLocale = segments.slice(1);

  // Build the href without the locale
  const buildHref = (index: number) => '/' + segmentsWithoutLocale.slice(0, index + 1).join('/');

  // Intelligent breadcrumb translation
  const getBreadcrumbText = (segment: string, index: number, allSegments: string[]) => {
    // Handle special cases first
    if (segment === 'me') return t('me');
    if (segment === 'create') return t('create');
    if (segment === 'edit') return t('edit');
    if (segment === 'view') return t('view');

    // Handle main sections
    if (segment === 'dash') return t('dashboard');
    if (segment === 'users') return t('users');
    if (segment === 'roles') return t('roles');
    if (segment === 'permissions') return t('permissions');

    // Handle dynamic segments (IDs, etc.)
    if (segment.match(/^[a-f0-9]{24}$/i)) {
      // MongoDB ObjectId - check context
      const previousSegment = allSegments[index - 1];
      if (previousSegment === 'users') return t('view');
      if (previousSegment === 'roles') return t('view');
      return t('view');
    }

    // Handle other dynamic segments
    if (segment.match(/^[0-9a-f-]+$/i)) {
      // UUID or similar - check context
      const previousSegment = allSegments[index - 1];
      if (previousSegment === 'users') return t('view');
      if (previousSegment === 'roles') return t('view');
      return t('view');
    }

    // Fallback: format the segment nicely
    return decodeURIComponent(segment)
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  // Memoize breadcrumb items for performance
  const breadcrumbItems = useMemo(() => {
    return segmentsWithoutLocale.map((segment, i) => ({
      segment,
      href: buildHref(i),
      text: getBreadcrumbText(segment, i, segmentsWithoutLocale),
      isLast: i === segmentsWithoutLocale.length - 1,
    }));
  }, [segmentsWithoutLocale]);

  return (
    <CarbonBreadcrumb style={{ marginBottom: '1rem' }}>
      {breadcrumbItems.map((item, i) => (
        <BreadcrumbItem key={i}>
          {item.isLast ? <span>{item.text}</span> : <Link href={item.href}>{item.text}</Link>}
        </BreadcrumbItem>
      ))}
    </CarbonBreadcrumb>
  );
};

export default Breadcrumb;
