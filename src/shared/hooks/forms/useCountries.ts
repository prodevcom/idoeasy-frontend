import countries from 'world-countries';

export function useCountries() {
  // Sort countries by name
  countries.sort((a, b) => a.name.common.localeCompare(b.name.common));

  return { countries };
}
