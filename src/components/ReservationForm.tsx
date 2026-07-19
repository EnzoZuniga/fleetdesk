import { useState } from 'react';
import { z } from 'zod';
import type { Asset, Reservation } from '../types';
import { detectConflicts } from '../lib/conflicts';

interface ReservationFormProps {
  assets: Asset[];
  reservations: Reservation[];
  onSubmit: (reservation: Omit<Reservation, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

const reservationSchema = z.object({
  assetId: z.string().min(1, 'Veuillez sélectionner un équipement'),
  clientName: z.string().min(2, 'Nom du client requis'),
  eventName: z.string().min(2, 'Nom de l\'événement requis'),
  startDate: z.string().min(1, 'Date de début requise'),
  endDate: z.string().min(1, 'Date de fin requise'),
  notes: z.string().optional(),
});

export function ReservationForm({
  assets,
  reservations,
  onSubmit,
  onCancel,
}: ReservationFormProps) {
  const [formData, setFormData] = useState({
    assetId: '',
    clientName: '',
    eventName: '',
    startDate: '',
    endDate: '',
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  const availableAssets = assets.filter((a) => a.status === 'available');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setConflictWarning(null);

    const result = reservationSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);

    if (end <= start) {
      setErrors({ endDate: 'La date de fin doit être après la date de début' });
      return;
    }

    const conflictCheck = detectConflicts(
      formData.assetId,
      start,
      end,
      reservations
    );

    if (conflictCheck.hasConflict) {
      setConflictWarning(
        `Conflit détecté avec ${conflictCheck.conflictingReservations.length} réservation(s) existante(s)`
      );
      return;
    }

    onSubmit({
      assetId: formData.assetId,
      clientName: formData.clientName,
      eventName: formData.eventName,
      startDate: start,
      endDate: end,
      notes: formData.notes || undefined,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
        <div className="border-b border-slate-200 p-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Nouvelle réservation
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Équipement
            </label>
            <select
              value={formData.assetId}
              onChange={(e) =>
                setFormData({ ...formData, assetId: e.target.value })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              <option value="">-- Sélectionner --</option>
              {availableAssets.map((asset) => (
                <option key={asset.id} value={asset.id}>
                  {asset.name} (SN: {asset.serialNumber})
                </option>
              ))}
            </select>
            {errors.assetId && (
              <p className="text-sm text-red-600 mt-1">{errors.assetId}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Client
            </label>
            <input
              type="text"
              value={formData.clientName}
              onChange={(e) =>
                setFormData({ ...formData, clientName: e.target.value })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
            {errors.clientName && (
              <p className="text-sm text-red-600 mt-1">{errors.clientName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Événement
            </label>
            <input
              type="text"
              value={formData.eventName}
              onChange={(e) =>
                setFormData({ ...formData, eventName: e.target.value })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
            {errors.eventName && (
              <p className="text-sm text-red-600 mt-1">{errors.eventName}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Début
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
              {errors.startDate && (
                <p className="text-sm text-red-600 mt-1">{errors.startDate}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Fin
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
              {errors.endDate && (
                <p className="text-sm text-red-600 mt-1">{errors.endDate}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Notes (optionnel)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          {conflictWarning && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{conflictWarning}</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition"
            >
              Créer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
