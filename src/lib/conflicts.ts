import type { Reservation, ConflictResult } from '../types';
import { isDateRangeOverlap } from './dates';

export function checkConflicts(
  assetId: string,
  startDate: Date,
  endDate: Date,
  existingReservations: Reservation[],
  excludeReservationId?: string
): ConflictResult {
  const conflicts = existingReservations.filter((res) => {
    if (res.id === excludeReservationId) return false;
    if (res.assetId !== assetId) return false;
    return isDateRangeOverlap(startDate, endDate, res.startDate, res.endDate);
  });

  return {
    hasConflict: conflicts.length > 0,
    conflictingReservations: conflicts,
  };
}

// Alias for backward compatibility
export const detectConflicts = checkConflicts;
