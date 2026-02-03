import { formatInTimeZone, toZonedTime } from 'date-fns-tz';

/**
 * Format a date in a specific timezone
 */
export function formatDateInTimezone(
  date: Date,
  timezone: string,
  formatString: string = 'PPpp',
): string {
  return formatInTimeZone(date, timezone, formatString);
}

/**
 * Convert a date to a specific timezone
 */
export function convertToTimezone(date: Date, timezone: string): Date {
  return toZonedTime(date, timezone);
}

/**
 * Get the current time in a specific timezone
 */
export function getCurrentTimeInTimezone(timezone: string): Date {
  return toZonedTime(new Date(), timezone);
}

/**
 * Format timezone for display (e.g., "GMT +07:00 Bangkok")
 */
export function formatTimezoneForDisplay(timezone: string): string {
  const now = new Date();
  const offset = formatInTimeZone(now, timezone, 'XXX'); // "+07:00"
  const cityName = timezone.split('/')[1]?.replace(/_/g, ' '); // "Bangkok"

  return `GMT ${offset} ${cityName || timezone}`;
}

/**
 * Get the user's browser timezone
 */
export function getBrowserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/**
 * Compare times across different timezones
 */
export function compareTimezones(
  date: Date,
  timezones: string[],
): Array<{ timezone: string; time: string; offset: string }> {
  return timezones.map((tz) => ({
    timezone: tz,
    time: formatInTimeZone(date, tz, 'PPpp'),
    offset: formatInTimeZone(date, tz, 'XXX'),
  }));
}
