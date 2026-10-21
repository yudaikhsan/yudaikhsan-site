import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merge Tailwind classes without conflicts (shadcn-style helper). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Estimate reading time in minutes from a Markdown body. */
export function readingTime(body = '', wordsPerMinute = 200) {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}

/** "February 4, 2026" — same format as the original site (en-US). */
export function formatDate(date: Date) {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/** ISO date for <time datetime="..."> */
export function isoDate(date: Date) {
  return date.toISOString().split('T')[0];
}