/**
 * Formatting utility functions for dates and display values.
 */
import { DEFAULT_LOCALE } from "@/types/common";

const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 3600;
const SECONDS_PER_DAY = 86400;
const SECONDS_PER_WEEK = 604800;

/**
 * Format timestamp as relative time (e.g., "2 hours ago", "Yesterday")
 */
export function formatRelativeTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);

  if (diffSeconds < SECONDS_PER_MINUTE) {
    return 'Just now';
  }

  if (diffSeconds < SECONDS_PER_HOUR) {
    const minutes = Math.floor(diffSeconds / SECONDS_PER_MINUTE);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  }

  if (diffSeconds < SECONDS_PER_DAY) {
    const hours = Math.floor(diffSeconds / SECONDS_PER_HOUR);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }

  if (diffSeconds < SECONDS_PER_DAY * 2) {
    const timeStr = date.toLocaleTimeString(DEFAULT_LOCALE, {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    return `Yesterday, ${timeStr}`;
  }

  if (diffSeconds < SECONDS_PER_WEEK) {
    const days = Math.floor(diffSeconds / SECONDS_PER_DAY);
    return `${days} days ago`;
  }

  // Fallback to formatted date
  return date.toLocaleDateString(DEFAULT_LOCALE, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/**
 * Format date for table display (short format)
 */
export function formatTableDate(timestamp: string): string {
  return new Date(timestamp).toLocaleString(DEFAULT_LOCALE, {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

/**
 * Format date as "Oct 24, 2023" style
 */
export function formatDisplayDate(timestamp: string): string {
  return new Date(timestamp).toLocaleDateString(DEFAULT_LOCALE, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
