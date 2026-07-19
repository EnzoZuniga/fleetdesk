import type { Asset, Reservation } from '../types';
import { formatDate } from '../lib/dates';

interface AssetDetailProps {
  asset: Asset;
  reservations: Reservation[];
  onClose: () => void;
  onStatusChange: (status: Asset['status']) => void;
}

const statusOptions: Array<{ value: Asset['status']; label: string }> = [
  { value: 'available', label: 'Disponible' },
  { value: 'reserved', label: 'Réservé' },
  { value: 'on_site', label: 'Sur site' },
  { value: 'maintenance', label: 'Maintenance' },
];

export function AssetDetail({
  asset,
  reservations,
  onClose,
  onStatusChange,
}: AssetDetailProps) {
  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white border-l border-slate-200 shadow-xl overflow-y-auto">
      <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Détails</h2>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 transition"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <div className="p-4 space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-slate-900 mb-1">
            {asset.name}
          </h3>
          <p className="text-sm text-slate-600">SN: {asset.serialNumber}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Statut
          </label>
          <select
            value={asset.status}
            onChange={(e) => onStatusChange(e.target.value as Asset['status'])}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {asset.notes && (
          <div>
            <h4 className="text-sm font-medium text-slate-700 mb-2">Notes</h4>
            <p className="text-sm text-slate-600">{asset.notes}</p>
          </div>
        )}

        <div>
          <h4 className="text-sm font-medium text-slate-700 mb-3">
            Réservations ({reservations.length})
          </h4>
          {reservations.length === 0 ? (
            <p className="text-sm text-slate-500">Aucune réservation</p>
          ) : (
            <div className="space-y-3">
              {reservations.map((res) => (
                <div
                  key={res.id}
                  className="p-3 bg-slate-50 rounded-lg border border-slate-200"
                >
                  <p className="font-medium text-slate-900 text-sm mb-1">
                    {res.eventName}
                  </p>
                  <p className="text-xs text-slate-600 mb-1">{res.clientName}</p>
                  <p className="text-xs text-slate-500">
                    {formatDate(res.startDate)} → {formatDate(res.endDate)}
                  </p>
                  {res.notes && (
                    <p className="text-xs text-slate-500 mt-2">{res.notes}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
