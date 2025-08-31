import type { User, UserPreferences } from '@entech/contracts';

/**
 * Get user preferences from multiple sources in priority order:
 * 1. Cookies (for SSR and hydration consistency)
 * 2. User metadata from database
 * 3. Browser defaults
 * 4. Fallback defaults
 *
 * This function is SSR-safe and will not cause hydration mismatches
 */
export function getUserPreferences(user?: User | null): UserPreferences {
  // 1. Check cookies first (highest priority for SSR consistency)
  // Only check cookies on client side to prevent hydration issues
  let cookieLocale: string | undefined;
  let cookieTimeZone: string | undefined;
  let cookieShowTimezoneOffset: boolean | undefined;

  if (typeof window !== 'undefined') {
    try {
      cookieLocale = localStorage.getItem('pref_locale') as string | undefined;
      cookieTimeZone = localStorage.getItem('pref_tz') as string | undefined;
      const showOffsetCookie = localStorage.getItem('pref_show_tz_offset') as string | undefined;
      cookieShowTimezoneOffset = showOffsetCookie ? showOffsetCookie === 'true' : undefined;
    } catch {
      // Ignore cookie errors during SSR
    }
  }

  if (cookieLocale && cookieTimeZone) {
    return {
      locale: cookieLocale,
      timeZone: cookieTimeZone,
      showTimezoneOffset: cookieShowTimezoneOffset ?? false,
    };
  }

  // 2. Check user metadata from database
  if (user?.metadata?.locale && user?.metadata?.timeZone) {
    return {
      locale: user.metadata.locale,
      timeZone: user.metadata.timeZone,
      showTimezoneOffset: user.metadata.showTimezoneOffset ?? false,
    };
  }

  // Partial preferences - combine cookies, metadata, and browser defaults
  let locale = cookieLocale || user?.metadata?.locale;
  let timeZone = cookieTimeZone || user?.metadata?.timeZone;
  const showTimezoneOffset =
    cookieShowTimezoneOffset ?? user?.metadata?.showTimezoneOffset ?? false;

  // 3. Browser defaults (client-side only)
  if (typeof window !== 'undefined') {
    if (!locale) {
      try {
        // Map browser language to supported locales
        const browserLang = navigator.language || 'en';
        if (browserLang.startsWith('pt')) {
          locale = 'pt-BR';
        } else if (browserLang.startsWith('en')) {
          locale = 'en';
        } else {
          locale = 'en';
        }
      } catch {
        locale = 'en';
      }
    }
    if (!timeZone) {
      try {
        timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
      } catch {
        timeZone = 'UTC';
      }
    }
  }

  // 4. Fallback defaults
  const finalPreferences = {
    locale: locale || 'en',
    timeZone: timeZone || 'UTC',
    showTimezoneOffset,
  };

  return finalPreferences;
}

/**
 * Save user preferences to cookies and optionally localStorage
 * This function is SSR-safe and will not cause hydration issues
 */
export function saveUserPreferences(preferences: UserPreferences): void {
  // Only save cookies on client side
  if (typeof window !== 'undefined') {
    try {
      console.log('🔧 [Preferences] Saving preferences:', preferences);
      console.log('🔧 [Preferences] Environment:', process.env.NODE_ENV);

      if (preferences.locale) {
        localStorage.setItem('pref_locale', preferences.locale);
        console.log('🔧 [Preferences] Saved locale cookie:', preferences.locale);
      }

      if (preferences.timeZone) {
        localStorage.setItem('pref_tz', preferences.timeZone);
        console.log('🔧 [Preferences] Saved timezone cookie:', preferences.timeZone);
      }

      if (preferences.showTimezoneOffset !== undefined) {
        localStorage.setItem('pref_show_tz_offset', preferences.showTimezoneOffset.toString());
        console.log(
          '🔧 [Preferences] Saved showTimezoneOffset cookie:',
          preferences.showTimezoneOffset,
        );
      }

      // Optional: Save to localStorage for quick client-side access
      try {
        localStorage.setItem('userPreferences', JSON.stringify(preferences));
        console.log('🔧 [Preferences] Saved to localStorage');
      } catch (localStorageError) {
        console.warn('Failed to save to localStorage:', localStorageError);
      }

      console.log('🔧 [Preferences] All preferences saved successfully');
    } catch (error) {
      console.error('❌ [Preferences] Failed to save preferences:', error);
    }
  } else {
    console.log('🔧 [Preferences] Not in browser environment, skipping save');
  }
}

/**
 * Get timezone offset string (e.g., "+3", "-4", "UTC")
 */
export function getTimezoneOffset(timeZone: string, date?: Date): string {
  try {
    const dateObj = date || new Date();

    // Special case for UTC
    if (timeZone === 'UTC') {
      return 'UTC';
    }

    // Get the offset using Intl.DateTimeFormat
    const targetFormatter = new Intl.DateTimeFormat('en', {
      timeZone,
      timeZoneName: 'longOffset',
    });

    const targetOffset =
      targetFormatter.formatToParts(dateObj).find((part) => part.type === 'timeZoneName')?.value ||
      '+00:00';

    // Extract hours from offset (e.g., "+03:00" -> "+3")
    const match = targetOffset.match(/([+-])(\d{1,2}):?\d{0,2}/);
    if (match) {
      const sign = match[1];
      const hours = parseInt(match[2], 10);

      if (hours === 0) {
        return 'UTC';
      }
      return `${sign}${hours}`;
    }

    return '';
  } catch (error) {
    console.warn('Failed to get timezone offset:', error);
    return '';
  }
}

/**
 * Format date using user preferences
 * When used within PreferencesProvider, preferences are automatically injected
 * Otherwise falls back to getUserPreferences()
 */
export function formatDate(
  date: Date | string | number,
  preferences?: UserPreferences,
  options?: Intl.DateTimeFormatOptions & { showTimezoneOffset?: boolean },
): string {
  const prefs = preferences || getUserPreferences();
  const dateObj = new Date(date);

  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }

  const { showTimezoneOffset, ...formatOptions } = options || {};

  // Use preference setting by default, allow override via options
  const shouldShowOffset =
    showTimezoneOffset !== undefined ? showTimezoneOffset : prefs.showTimezoneOffset;

  try {
    const defaultOptions: Intl.DateTimeFormatOptions = {
      dateStyle: 'short',
      timeStyle: 'short',
      timeZone: prefs.timeZone,
      ...formatOptions,
    };

    let formattedDate = new Intl.DateTimeFormat(prefs.locale, defaultOptions).format(dateObj);

    // Add timezone offset if enabled in preferences or explicitly requested
    if (shouldShowOffset && prefs.timeZone) {
      const offset = getTimezoneOffset(prefs.timeZone, dateObj);
      if (offset) {
        formattedDate += ` (GMT${offset})`;
      }
    }

    return formattedDate;
  } catch (error) {
    console.warn('Failed to format date with preferences:', error);
    // Fallback to basic formatting
    const fallbackDate = new Intl.DateTimeFormat('en-GB', {
      dateStyle: 'short',
      timeStyle: 'short',
      timeZone: 'UTC',
      ...formatOptions,
    }).format(dateObj);

    return shouldShowOffset ? `${fallbackDate} (GMT+0)` : fallbackDate;
  }
}

/**
 * Create a formatter function that uses current context preferences
 * This is used internally by parser.ts and other utilities
 */
export function createContextAwareFormatter(contextPreferences?: UserPreferences) {
  return (date: Date | string | number, options?: Intl.DateTimeFormatOptions): string => {
    return formatDate(date, contextPreferences, options);
  };
}

/**
 * Get supported locales for the preferences UI
 */
export function getSupportedLocales(): Array<{ value: string; label: string }> {
  return [
    { value: 'en', label: 'English (US)' },
    { value: 'pt-BR', label: 'Português (Brasil)' },
  ];
}

/**
 * Get supported timezones for the preferences UI
 */
export function getSupportedTimeZones(): Array<{ value: string; label: string }> {
  try {
    if (typeof Intl !== 'undefined' && 'supportedValuesOf' in Intl) {
      // @ts-expect-error - supportedValuesOf is available in modern browsers
      const timeZones = Intl.supportedValuesOf('timeZone') as string[];
      return timeZones
        .map((tz: string) => ({
          value: tz,
          label: formatTimeZoneLabel(tz),
        }))
        .sort((a: { label: string }, b: { label: string }) => a.label.localeCompare(b.label));
    }
  } catch (error) {
    console.warn('Failed to get supported timezones:', error);
  }

  // Fallback list of common timezones
  return [
    { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
    { value: 'America/New_York', label: 'America/New_York (Eastern Time)' },
    { value: 'America/Chicago', label: 'America/Chicago (Central Time)' },
    { value: 'America/Denver', label: 'America/Denver (Mountain Time)' },
    { value: 'America/Los_Angeles', label: 'America/Los_Angeles (Pacific Time)' },
    { value: 'America/Sao_Paulo', label: 'America/Sao_Paulo (Brasília Time)' },
    { value: 'Europe/London', label: 'Europe/London (GMT/BST)' },
    { value: 'Europe/Paris', label: 'Europe/Paris (CET/CEST)' },
    { value: 'Europe/Berlin', label: 'Europe/Berlin (CET/CEST)' },
    { value: 'Asia/Tokyo', label: 'Asia/Tokyo (JST)' },
    { value: 'Asia/Shanghai', label: 'Asia/Shanghai (CST)' },
    { value: 'Asia/Kolkata', label: 'Asia/Kolkata (IST)' },
    { value: 'Australia/Sydney', label: 'Australia/Sydney (AEST/AEDT)' },
  ];
}

/**
 * Format timezone label for display
 */
function formatTimeZoneLabel(timeZone: string): string {
  try {
    const now = new Date();
    const offset = new Intl.DateTimeFormat('en', {
      timeZone,
      timeZoneName: 'longOffset',
    })
      .formatToParts(now)
      .find((part) => part.type === 'timeZoneName')?.value;

    const shortName = new Intl.DateTimeFormat('en', {
      timeZone,
      timeZoneName: 'short',
    })
      .formatToParts(now)
      .find((part) => part.type === 'timeZoneName')?.value;

    return `${timeZone} (${shortName || offset || 'Unknown'})`;
  } catch {
    return timeZone;
  }
}

/**
 * Clear user preferences from cookies and localStorage
 */
export function clearUserPreferences(): void {
  localStorage.removeItem('pref_locale');
  localStorage.removeItem('pref_tz');

  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem('userPreferences');
    } catch (error) {
      console.warn('Failed to clear preferences from localStorage:', error);
    }
  }
}
