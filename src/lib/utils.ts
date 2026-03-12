import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Get current date string in Vietnam timezone (GMT+7)
 * Always returns YYYY-MM-DD format regardless of browser timezone
 */
export function getVietnamDateString(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date());
}

/**
 * Get yesterday's date string in Vietnam timezone (GMT+7)
 */
export function getVietnamYesterdayString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(d);
}

/**
 * Get date string for X days ago in Vietnam timezone (GMT+7)
 */
export function getVietnamPastDateString(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(d);
}

/**
 * Get current hour in Vietnam timezone (0-23)
 */
export function getVietnamHour(): number {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Ho_Chi_Minh',
    hour: 'numeric',
    hour12: false
  });
  const hourStr = formatter.format(new Date());
  return parseInt(hourStr, 10) === 24 ? 0 : parseInt(hourStr, 10);
}
