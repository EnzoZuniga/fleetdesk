import { format, parseISO, isAfter, isBefore } from 'date-fns';

export function formatDate(date: Date): string {
  return format(date, 'dd/MM/yyyy');
}

export function formatDateTime(date: Date): string {
  return format(date, 'dd/MM/yyyy HH:mm');
}

export function parseDate(dateStr: string): Date {
  return parseISO(dateStr);
}

export function isDateRangeOverlap(
  start1: Date,
  end1: Date,
  start2: Date,
  end2: Date
): boolean {
  return isBefore(start1, end2) && isAfter(end1, start2);
}
