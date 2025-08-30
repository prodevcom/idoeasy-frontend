'use client';

import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from '@carbon/icons-react';
import { Button, Checkbox, FormLabel, InlineNotification, Search } from '@carbon/react';
import { useTranslations } from 'next-intl';
import React, { useEffect, useMemo, useState } from 'react';

import { useIsMobile } from '@/shared/hooks/layout';

export type SubPermission = {
  id: string;
  name: string;
  description?: string;
  module?: string;
};

export type PermissionTransferProps = {
  items: SubPermission[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  loading?: boolean;
  disabled?: boolean;
  errorMessage?: string;
  leftTitle?: string;
  rightTitle?: string;
  rowsVisible?: number;
  rowHeightPx?: number;
  disabledIds?: string[];
  sort?: 'alpha' | 'none' | ((a: SubPermission, b: SubPermission) => number);
  renderItem?: (p: SubPermission) => React.ReactNode;
};

function usePaneState() {
  const [query, setQuery] = useState('');
  const [checked, setChecked] = useState<string[]>([]);
  const clear = () => setChecked([]);
  return { query, setQuery, checked, setChecked, clear } as const;
}

function byAlpha(a: SubPermission, b: SubPermission) {
  return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
}

export function PermissionTransfer({
  items,
  selectedIds,
  onChange,
  loading,
  disabled,
  errorMessage,
  leftTitle,
  rightTitle,
  rowsVisible = 8,
  rowHeightPx = 48,
  disabledIds = [],
  sort = 'alpha',
  renderItem,
}: PermissionTransferProps) {
  const t = useTranslations('permissions.transfer');
  const isMobile = useIsMobile();
  const left = usePaneState();
  const right = usePaneState();

  const [available, enabled] = useMemo(() => {
    const selected = new Set(selectedIds);
    const avail = items.filter((i) => !selected.has(i.id));
    const en = items.filter((i) => selected.has(i.id));
    const sorter = sort === 'alpha' ? byAlpha : sort === 'none' ? undefined : sort;
    if (sorter) {
      avail.sort(sorter);
      en.sort(sorter);
    }
    return [avail, en] as const;
  }, [items, selectedIds, sort]);

  const disabledPermIds = useMemo(() => new Set(disabledIds), [disabledIds]);

  const visibleLeft = useMemo(() => {
    const q = left.query.trim().toLowerCase();
    const base = !q
      ? available
      : available.filter(
          (p) => p.name.toLowerCase().includes(q) || p.module?.toLowerCase().includes(q),
        );
    return base;
  }, [available, left.query]);

  const visibleRight = useMemo(() => {
    const q = right.query.trim().toLowerCase();
    const base = !q
      ? enabled
      : enabled.filter(
          (p) => p.name.toLowerCase().includes(q) || p.module?.toLowerCase().includes(q),
        );
    return base;
  }, [enabled, right.query]);

  // Clear checks when data or selection changes
  useEffect(() => {
    left.clear();
    right.clear();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, selectedIds]);

  const listHeight = `${(isMobile ? 4 : rowsVisible) * rowHeightPx}px`;

  // Actions
  const canAdd = left.checked.some((id) => !disabledPermIds.has(id));
  const canRemove = right.checked.length > 0;

  function addSelected() {
    if (!canAdd) return;
    const toAdd = left.checked.filter((id) => !disabledPermIds.has(id));
    const unique = new Set([...selectedIds, ...toAdd]);
    onChange(Array.from(unique));
    left.clear();
  }

  function removeSelected() {
    if (!canRemove) return;
    const toRemove = new Set(right.checked);
    onChange(selectedIds.filter((id) => !toRemove.has(id)));
    right.clear();
  }

  // “Select all” correctness: count only visible, non‑disabled (left)
  const visibleLeftSelectableIds = useMemo(
    () => visibleLeft.map((p) => p.id).filter((id) => !disabledPermIds.has(id)),
    [visibleLeft, disabledPermIds],
  );

  const allLeftChecked =
    visibleLeftSelectableIds.length > 0 && left.checked.length === visibleLeftSelectableIds.length;

  const leftIndeterminate =
    left.checked.length > 0 && left.checked.length < visibleLeftSelectableIds.length;

  function setAllLeftChecked(v: boolean) {
    left.setChecked(v ? visibleLeftSelectableIds : []);
  }
  function setAllRightChecked(v: boolean) {
    right.setChecked(v ? visibleRight.map((p) => p.id) : []);
  }

  // Toggle helpers (row + checkbox)
  function toggleChecked(pane: 'left' | 'right', id: string) {
    const state = pane === 'left' ? left : right;
    const isChecked = state.checked.includes(id);
    state.setChecked((prev) => (isChecked ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  // Row renderer (now row is clickable)
  function renderRow(p: SubPermission, pane: 'left' | 'right') {
    const isDisabled = (pane === 'left' && disabledPermIds.has(p.id)) || disabled;

    const state = pane === 'left' ? left : right;
    const checked = state.checked.includes(p.id);

    const onRowClick = () => {
      if (isDisabled || disabled) return;
      toggleChecked(pane, p.id);
    };

    return (
      <li
        key={p.id}
        className="perm-transfer__row cds--layer-one"
        aria-selected={checked}
        aria-disabled={isDisabled || disabled || undefined}
        data-selected={checked || undefined}
        data-disabled={isDisabled || disabled || undefined}
        role="option"
        onClick={onRowClick}
        style={{
          padding: 'var(--cds-spacing-03)',
          borderBottom: '1px solid var(--cds-border-subtle)',
          flexDirection: 'row',
          display: 'flex',
          gap: 'var(--cds-spacing-03)',
          alignItems: 'center',
          cursor: isDisabled || disabled ? 'not-allowed' : 'pointer',
          userSelect: 'none',
        }}
      >
        {/* Wrapper to block bubbling from input/label */}
        <div
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          style={{ flex: '0 0 auto' }}
        >
          <Checkbox
            id={`${pane}-${p.id}`}
            labelText=""
            checked={checked}
            disabled={isDisabled || disabled}
            onChange={() => toggleChecked(pane, p.id)}
          />
        </div>

        <div
          style={{
            minWidth: 0,
            textAlign: pane === 'right' ? 'right' : 'left',
          }}
        >
          <div className="cds--type-heading-compact-01" style={{ wordBreak: 'break-word' }}>
            {renderItem ? renderItem(p) : p.name}
          </div>
          {(p.module || p.description) && (
            <div
              className="cds--type-body-compact-01"
              style={{ color: 'var(--cds-text-secondary)' }}
            >
              {[p.module, p.description].filter(Boolean).join(' — ')}
            </div>
          )}
        </div>
      </li>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        gap: '20px',
        width: '100%',
        alignItems: 'center',
        ...(isMobile && { flexDirection: 'column' }),
      }}
    >
      {/* Left Pane */}
      <div style={{ minWidth: 0, width: '100%' }}>
        <FormLabel style={{ marginBottom: '0.5rem' }}>{leftTitle ?? t('available')}</FormLabel>

        <Search
          size="md"
          labelText={t('searchAvailable')}
          placeholder={t('search')}
          value={left.query}
          onChange={(e) => left.setQuery((e.target as HTMLInputElement).value)}
          disabled={disabled}
        />
        <div
          style={{
            border: '1px solid var(--cds-border-subtle)',
            borderRadius: 'var(--cds-layer-radius, 0.25rem)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 'var(--cds-spacing-03)',
              borderBottom: '1px solid var(--cds-border-subtle)',
              background: 'var(--cds-layer)',
            }}
          >
            <Checkbox
              id="left-select-all"
              labelText={t('selectAll')}
              checked={allLeftChecked}
              indeterminate={leftIndeterminate}
              onChange={(_, { checked }) => setAllLeftChecked(checked)}
              disabled={disabled}
            />
            <div
              className="cds--type-helper-text"
              style={{ color: disabled ? 'var(--cds-text-disabled)' : '' }}
            >
              {visibleLeft.length} {t('items')}
            </div>
          </div>
          <ul
            role="listbox"
            aria-multiselectable
            style={{
              listStyle: 'none',
              margin: 0,
              padding: 0,
              height: listHeight,
              overflow: 'auto',
              background: 'var(--cds-layer)',
            }}
          >
            {visibleLeft.map((p) => renderRow(p, 'left'))}
            {visibleLeft.length === 0 && (
              <div
                className="cds--type-helper-text"
                style={{ padding: 'var(--cds-spacing-04)' }}
                data-disabled={disabled || undefined}
              >
                {t('noItems')}
              </div>
            )}
          </ul>
        </div>
      </div>

      {/* Middle Actions (icon-only, small, centered) */}
      <div
        style={{
          minWidth: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: isMobile ? 'row' : 'column',
          gap: '20px',
          width: 'fit-content',
        }}
      >
        <Button
          size="sm"
          hasIconOnly
          kind="primary"
          renderIcon={isMobile ? ChevronDown : ChevronRight}
          iconDescription={t('addSelected')}
          aria-label={t('addSelected')}
          onClick={addSelected}
          disabled={!canAdd || !!loading}
        />
        <Button
          size="sm"
          hasIconOnly
          kind="danger"
          renderIcon={isMobile ? ChevronUp : ChevronLeft}
          iconDescription={t('removeSelected')}
          aria-label={t('removeSelected')}
          onClick={removeSelected}
          disabled={!canRemove || !!loading}
        />
        {errorMessage && (
          <InlineNotification lowContrast kind="error" title="Error" subtitle={errorMessage} />
        )}
      </div>

      {/* Right Pane */}
      <div style={{ minWidth: 0, width: '100%' }}>
        <FormLabel style={{ marginBottom: '0.5rem' }}>{rightTitle ?? t('enabled')}</FormLabel>
        <Search
          size="md"
          labelText={t('searchEnabled')}
          placeholder={t('search')}
          value={right.query}
          onChange={(e) => right.setQuery((e.target as HTMLInputElement).value)}
          disabled={disabled}
        />
        <div
          style={{
            border: '1px solid var(--cds-border-subtle)',
            borderRadius: 'var(--cds-layer-radius, 0.25rem)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 'var(--cds-spacing-03)',
              borderBottom: '1px solid var(--cds-border-subtle)',
              background: 'var(--cds-layer)',
            }}
          >
            <Checkbox
              id="right-select-all"
              labelText={t('selectAll')}
              checked={visibleRight.length > 0 && right.checked.length === visibleRight.length}
              indeterminate={right.checked.length > 0 && right.checked.length < visibleRight.length}
              onChange={(_, { checked }) => setAllRightChecked(checked)}
              disabled={disabled}
            />
            <div
              className="cds--type-helper-text"
              style={{ color: disabled ? 'var(--cds-text-disabled)' : '' }}
            >
              {visibleRight.length} {t('items')}
            </div>
          </div>
          <ul
            role="listbox"
            aria-multiselectable
            style={{
              listStyle: 'none',
              margin: 0,
              padding: 0,
              height: listHeight, // fixed 8 rows
              overflow: 'auto',
              background: 'var(--cds-layer)',
            }}
          >
            {visibleRight.map((p) => renderRow(p, 'right'))}
            {visibleRight.length === 0 && (
              <div
                className="cds--type-helper-text"
                style={{ padding: 'var(--cds-spacing-04)' }}
                data-disabled={disabled || undefined}
              >
                {t('noItems')}
              </div>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
