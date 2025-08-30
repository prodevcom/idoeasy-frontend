'use client';

import { Folder, Search } from '@carbon/icons-react';
import { Button, Link, Stack, Tag } from '@carbon/react';

type Illustration = 'search' | 'folder';

type DataTableEmptyStateProps = {
  title: string;
  description?: string;
  illustration?: Illustration; // default: 'search'
  actionLabel?: string;
  onActionClick?: () => void;
  secondaryActionLabel?: string;
  onSecondaryActionClick?: () => void;
  tips?: string[]; // optional quick hints
  docHref?: string; // optional link to docs/help
};

export function DataTableEmptyState({
  title,
  description,
  illustration = 'search',
  actionLabel,
  onActionClick,
  secondaryActionLabel,
  onSecondaryActionClick,
  tips,
  docHref,
}: DataTableEmptyStateProps) {
  const Icon = illustration === 'folder' ? Folder : Search;

  return (
    <Stack
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        minHeight: '16rem',
        gap: '2rem',
      }}
    >
      {/* Icon bubble */}
      <Icon size={32} />

      {/* Title + description */}
      <Stack gap={2} style={{ alignItems: 'center', justifyContent: 'center' }}>
        <h3 className="cds--heading-03" style={{ margin: 0 }}>
          {title}
        </h3>
        <p className="cds--body-long-02" style={{ margin: 0, color: 'var(--cds-text-secondary)' }}>
          {description || 'No data found'}
          {docHref ? (
            <>
              {' '}
              <Link href={docHref}>Learn more</Link>
            </>
          ) : null}
        </p>
      </Stack>

      {/* Optional tips as subtle tags */}
      {tips?.length ? (
        <Stack gap={2} orientation="horizontal" style={{ alignItems: 'center' }}>
          {tips.map((t, i) => (
            <Tag key={i} size="sm" type="cool-gray">
              {t}
            </Tag>
          ))}
        </Stack>
      ) : null}

      {/* Actions */}
      {(actionLabel || secondaryActionLabel) && (
        <Stack gap={3} orientation="horizontal" style={{ alignItems: 'center' }}>
          {actionLabel && (
            <Button kind="primary" size="md" onClick={onActionClick}>
              {actionLabel}
            </Button>
          )}
          {secondaryActionLabel && (
            <Button kind="secondary" size="md" onClick={onSecondaryActionClick}>
              {secondaryActionLabel}
            </Button>
          )}
        </Stack>
      )}
    </Stack>
  );
}
