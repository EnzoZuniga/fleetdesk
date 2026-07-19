import { useState, useCallback } from 'react';
import type { Asset, Reservation } from '../types';
import { seedAssets, seedReservations } from '../data/seed';

interface FleetStore {
  assets: Asset[];
  reservations: Reservation[];
  addReservation: (reservation: Omit<Reservation, 'id' | 'createdAt'>) => void;
  updateAssetStatus: (assetId: string, status: Asset['status']) => void;
  getReservationsForAsset: (assetId: string) => Reservation[];
}

let nextReservationId = seedReservations.length + 1;

export function useFleetStore(): FleetStore {
  const [assets, setAssets] = useState<Asset[]>(seedAssets);
  const [reservations, setReservations] = useState<Reservation[]>(seedReservations);

  const addReservation = useCallback(
    (reservation: Omit<Reservation, 'id' | 'createdAt'>) => {
      const newReservation: Reservation = {
        ...reservation,
        id: `r${nextReservationId++}`,
        createdAt: new Date(),
      };
      setReservations((prev) => [...prev, newReservation]);

      // NOTE: On passe l'asset en "reserved" automatiquement si disponible
      setAssets((prev) =>
        prev.map((a) =>
          a.id === reservation.assetId && a.status === 'available'
            ? { ...a, status: 'reserved' }
            : a
        )
      );
    },
    []
  );

  const updateAssetStatus = useCallback((assetId: string, status: Asset['status']) => {
    setAssets((prev) =>
      prev.map((a) => (a.id === assetId ? { ...a, status } : a))
    );
  }, []);

  const getReservationsForAsset = useCallback(
    (assetId: string) => {
      return reservations.filter((r) => r.assetId === assetId);
    },
    [reservations]
  );

  return {
    assets,
    reservations,
    addReservation,
    updateAssetStatus,
    getReservationsForAsset,
  };
}
