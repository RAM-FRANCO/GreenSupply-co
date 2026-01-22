/**
 * Common shared types used across the application.
 */

/** Reusable select option for dropdown components */
export interface SelectOption {
  readonly id: number;
  readonly label: string;
}

/** Default locale for date/time formatting (i18n ready) */
export const DEFAULT_LOCALE = 'en-US' as const;
