import { Filter, Repeat } from '@carbon/icons-react';
import { Button } from '@carbon/react';
import { useTranslations } from 'next-intl';

type FiltersProps = {
  onOpen: () => void;
  hasFilters: boolean;
  onReset: () => void;
};

export const Filters = ({ hasFilters, onReset, onOpen }: FiltersProps) => {
  const t = useTranslations('users');
  return (
    <>
      {hasFilters && (
        <Button
          hasIconOnly
          kind="danger"
          renderIcon={Repeat}
          iconDescription={t('filters.reset')}
          onClick={onReset}
        >
          {t('filters.reset')}
        </Button>
      )}
      <Button
        hasIconOnly
        kind="secondary"
        iconDescription={t('filters.filter')}
        onClick={onOpen}
        aria-label={t('filters.open')}
        renderIcon={(props) => (
          <span style={{ position: 'relative', display: 'inline-flex' }}>
            <Filter {...props} />
            {hasFilters && (
              <span
                aria-hidden
                style={{
                  position: 'absolute',
                  top: -2,
                  right: -2,
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: 'var(--cds-support-success, #24a148)',
                  boxShadow: '0 0 0 1px var(--cds-layer, #fff)',
                }}
              />
            )}
          </span>
        )}
      />
    </>
  );
};
