import { motion } from 'framer-motion';
import { X, AlertTriangle } from 'lucide-react';
import type { Asset, Reservation } from '../../types';
import { Badge } from '../../shared/ui/Badge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { checkConflicts } from '../../lib/conflicts';

interface InspectorProps {
  asset: Asset;
  reservations: Reservation[];
  allReservations: Reservation[];
  onClose: () => void;
  onStatusChange: (status: Asset['status']) => void;
  onNotesChange: (notes: string) => void;
}

const statusOptions: Array<{ value: Asset['status']; label: string }> = [
  { value: 'available', label: 'Disponible' },
  { value: 'reserved', label: 'Réservé' },
  { value: 'on_site', label: 'Sur site' },
  { value: 'maintenance', label: 'Maintenance' },
];

export function Inspector({
  asset,
  reservations,
  allReservations,
  onClose,
  onStatusChange,
  onNotesChange,
}: InspectorProps) {
  const upcomingReservations = reservations
    .filter(r => r.endDate >= new Date())
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

  // Détection conflits sur les 7 prochains jours
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  const conflictsNextWeek = upcomingReservations.filter(res => {
    const result = checkConflicts(
      asset.id,
      res.startDate,
      res.endDate,
      allReservations,
      res.id
    );
    return result.hasConflict && res.startDate <= nextWeek;
  });

  return (
    <motion.div
      initial={{ x: 320 }}
      animate={{ x: 0 }}
      exit={{ x: 320 }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      className="fixed right-0 top-0 bottom-0 w-80 bg-white border-l border-stone-200 shadow-2xl flex flex-col z-30"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-stone-200">
        <h3 className="font-semibold text-stone-900">Détails</h3>
        <button
          onClick={onClose}
          className="text-stone-400 hover:text-stone-600 transition"
          aria-label="Fermer"
        >
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          <div>
            <h4 className="text-sm font-medium text-stone-900 mb-2">{asset.name}</h4>
            <p className="text-xs font-mono text-stone-600 mb-2">{asset.serialNumber}</p>
            <div className="flex gap-2">
              <Badge category={asset.category}>{asset.category}</Badge>
              <Badge status={asset.status}>
                {statusOptions.find(s => s.value === asset.status)?.label}
              </Badge>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">
              Statut
            </label>
            <select
              value={asset.status}
              onChange={e => onStatusChange(e.target.value as Asset['status'])}
              className="w-full px-3 py-2 border border-stone-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#8B9A3D]"
            >
              {statusOptions.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">
              Notes
            </label>
            <textarea
              value={asset.notes || ''}
              onChange={e => onNotesChange(e.target.value)}
              placeholder="Informations supplémentaires..."
              rows={3}
              className="w-full px-3 py-2 border border-stone-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#8B9A3D] resize-none"
            />
          </div>

          {conflictsNextWeek.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-amber-900 mb-1">
                    Conflit détecté
                  </p>
                  <p className="text-xs text-amber-800">
                    {conflictsNextWeek.length} réservation(s) chevauchante(s) sur 7 jours
                  </p>
                </div>
              </div>
            </div>
          )}

          <div>
            <h5 className="text-xs font-medium text-stone-700 mb-2">
              Réservations à venir ({upcomingReservations.length})
            </h5>
            {upcomingReservations.length === 0 ? (
              <p className="text-xs text-stone-500">Aucune réservation</p>
            ) : (
              <div className="space-y-2">
                {upcomingReservations.slice(0, 5).map(res => (
                  <div
                    key={res.id}
                    className="bg-stone-50 rounded p-2 text-xs"
                  >
                    <p className="font-medium text-stone-900 mb-1">
                      {res.eventName}
                    </p>
                    <p className="text-stone-600">
                      {format(res.startDate, 'd MMM', { locale: fr })} –{' '}
                      {format(res.endDate, 'd MMM', { locale: fr })}
                    </p>
                  </div>
                ))}
                {upcomingReservations.length > 5 && (
                  <p className="text-xs text-stone-500">
                    + {upcomingReservations.length - 5} autre(s)
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
