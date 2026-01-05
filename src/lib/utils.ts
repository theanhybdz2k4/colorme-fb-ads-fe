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
  const now = new Date();
  // Get Vietnam time by adding 7 hours to UTC
  const vietnamTime = new Date(now.getTime() + (7 * 60 * 60 * 1000));
  return vietnamTime.toISOString().split('T')[0];
}

/**
 * Get yesterday's date string in Vietnam timezone (GMT+7)
 */
export function getVietnamYesterdayString(): string {
  const now = new Date();
  // Get Vietnam time by adding 7 hours to UTC, then subtract 1 day
  const vietnamTime = new Date(now.getTime() + (7 * 60 * 60 * 1000) - (24 * 60 * 60 * 1000));
  return vietnamTime.toISOString().split('T')[0];
}

/**
 * Get current hour in Vietnam timezone (0-23)
 */
export function getVietnamHour(): number {
  const now = new Date();
  const vietnamTime = new Date(now.getTime() + (7 * 60 * 60 * 1000));
  return vietnamTime.getUTCHours();
}
