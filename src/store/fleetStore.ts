import { useSyncExternalStore } from 'react';
import type { Asset, Reservation, AssetStatus } from '../types';
import { seedAssets, seedReservations } from '../data/seed';

const STORAGE_KEY = 'fleetdesk:state';

interface StoreState {
  assets: Asset[];
  reservations: Reservation[];
}

let listeners: Array<() => void> = [];
let state: StoreState = loadState();

function loadState(): StoreState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return { assets: seedAssets, reservations: seedReservations };
    
    const parsed = JSON.parse(stored) as StoreState;
    // Reconstituer les dates
    return {
      assets: parsed.assets,
      reservations: parsed.reservations.map(r => ({
        ...r,
        startDate: new Date(r.startDate),
        endDate: new Date(r.endDate),
        createdAt: new Date(r.createdAt),
      })),
    };
  } catch {
    return { assets: seedAssets, reservations: seedReservations };
  }
}

function saveState(newState: StoreState) {
  state = newState;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
  emitChange();
}

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

const subscribe = (listener: () => void) => {
  listeners = [...listeners, listener];
  return () => {
    listeners = listeners.filter(l => l !== listener);
  };
};

const getSnapshot = () => state;

// Actions
let nextReservationId = seedReservations.length + 1;

export const fleetActions = {
  addReservation(reservation: Omit<Reservation, 'id' | 'createdAt'>) {
    const newReservation: Reservation = {
      ...reservation,
      id: `r${nextReservationId++}`,
      createdAt: new Date(),
    };
    
    const newAssets = state.assets.map(a =>
      a.id === reservation.assetId && a.status === 'available'
        ? { ...a, status: 'reserved' as AssetStatus }
        : a
    );

    saveState({
      assets: newAssets,
      reservations: [...state.reservations, newReservation],
    });

    return newReservation;
  },

  cancelReservation(reservationId: string) {
    const reservation = state.reservations.find(r => r.id === reservationId);
    if (!reservation) return;

    const newReservations = state.reservations.filter(r => r.id !== reservationId);
    const assetHasOtherReservations = newReservations.some(
      r => r.assetId === reservation.assetId
    );

    const newAssets = state.assets.map(a => {
      if (a.id === reservation.assetId && !assetHasOtherReservations && a.status === 'reserved') {
        return { ...a, status: 'available' as AssetStatus };
      }
      return a;
    });

    saveState({
      assets: newAssets,
      reservations: newReservations,
    });
  },

  updateAssetStatus(assetId: string, status: AssetStatus) {
    saveState({
      ...state,
      assets: state.assets.map(a => 
        a.id === assetId ? { ...a, status } : a
      ),
    });
  },

  updateAssetNotes(assetId: string, notes: string) {
    saveState({
      ...state,
      assets: state.assets.map(a =>
        a.id === assetId ? { ...a, notes } : a
      ),
    });
  },
};

// Selectors
export const fleetSelectors = {
  getAsset: (assetId: string) => 
    state.assets.find(a => a.id === assetId),
  
  getReservationsForAsset: (assetId: string) =>
    state.reservations.filter(r => r.assetId === assetId),
  
  getReservation: (reservationId: string) =>
    state.reservations.find(r => r.id === reservationId),
};

export function useFleetStore() {
  const storeState = useSyncExternalStore(subscribe, getSnapshot);
  
  return {
    assets: storeState.assets,
    reservations: storeState.reservations,
    ...fleetActions,
    ...fleetSelectors,
  };
}
