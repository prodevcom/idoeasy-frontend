export function getFlatpickrDateFormat(locale: string): string {
  const parts = new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date(2025, 0, 2));

  return parts
    .map((p) => {
      if (p.type === 'day') return 'd';
      if (p.type === 'month') return 'm';
      if (p.type === 'year') return 'Y';

      return p.value;
    })
    .join('');
}
