export type AssetStatus = 'available' | 'reserved' | 'on_site' | 'maintenance';

export type AssetCategory = 'audio' | 'lighting' | 'structure' | 'power';

export interface Asset {
  id: string;
  name: string;
  category: AssetCategory;
  status: AssetStatus;
  serialNumber: string;
  notes?: string;
}

export interface Reservation {
  id: string;
  assetId: string;
  clientName: string;
  eventName: string;
  startDate: Date;
  endDate: Date;
  notes?: string;
  createdAt: Date;
}

export interface ConflictResult {
  hasConflict: boolean;
  conflictingReservations: Reservation[];
}
