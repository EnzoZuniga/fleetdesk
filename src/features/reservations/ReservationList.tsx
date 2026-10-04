import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { FileText, Trash2 } from 'lucide-react';
import type { Reservation, Asset } from '../../types';
import { EmptyState } from '../../shared/ui/EmptyState';
import { motion } from 'framer-motion';

interface ReservationListProps {
  reservations: Reservation[];
  assets: Asset[];
  onCancelReservation: (id: string) => void;
}

type SortKey = 'startDate' | 'clientName' | 'eventName';

export function ReservationList({ reservations, assets, onCancelReservation }: ReservationListProps) {
  const [sortKey, setSortKey] = useState<SortKey>('startDate');
  const [sortAsc, setSortAsc] = useState(true);

  const sorted = useMemo(() => {
    const copy = [...reservations];
    copy.sort((a, b) => {
      let compareA: string | number;
      let compareB: string | number;

      if (sortKey === 'startDate') {
        compareA = a.startDate.getTime();
        compareB = b.startDate.getTime();
      } else {
        compareA = a[sortKey];
        compareB = b[sortKey];
      }

      if (compareA < compareB) return sortAsc ? -1 : 1;
      if (compareA > compareB) return sortAsc ? 1 : -1;
      return 0;
    });
    return copy;
  }, [reservations, sortKey, sortAsc]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  if (reservations.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <EmptyState
          icon={<FileText size={48} />}
          title="Aucune réservation"
          description="Créez votre première réservation pour démarrer"
        />
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto">
      <table className="w-full">
        <thead className="bg-stone-50 border-b border-stone-200 sticky top-0 z-10">
          <tr>
            <th
              className="text-left px-6 py-3 text-xs font-medium text-stone-700 cursor-pointer hover:bg-stone-100 transition"
              onClick={() => toggleSort('eventName')}
            >
              Événement {sortKey === 'eventName' && (sortAsc ? '↑' : '↓')}
            </th>
            <th
              className="text-left px-6 py-3 text-xs font-medium text-stone-700 cursor-pointer hover:bg-stone-100 transition"
              onClick={() => toggleSort('clientName')}
            >
              Client {sortKey === 'clientName' && (sortAsc ? '↑' : '↓')}
            </th>
            <th className="text-left px-6 py-3 text-xs font-medium text-stone-700">
              Équipement
            </th>
            <th
              className="text-left px-6 py-3 text-xs font-medium text-stone-700 cursor-pointer hover:bg-stone-100 transition"
              onClick={() => toggleSort('startDate')}
            >
              Dates {sortKey === 'startDate' && (sortAsc ? '↑' : '↓')}
            </th>
            <th className="text-left px-6 py-3 text-xs font-medium text-stone-700">
              Notes
            </th>
            <th className="w-20"></th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((res, index) => {
            const asset = assets.find(a => a.id === res.assetId);
            return (
              <motion.tr
                key={res.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02, duration: 0.2 }}
                className="border-b border-stone-100 hover:bg-stone-50"
              >
                <td className="px-6 py-4">
                  <p className="text-sm font-medium text-stone-900">
                    {res.eventName}
                  </p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-stone-700">{res.clientName}</p>
                </td>
                <td className="px-6 py-4">
                  {asset ? (
                    <div>
                      <p className="text-sm text-stone-900 mb-1">{asset.name}</p>
                      <p className="text-xs font-mono text-stone-600">
                        {asset.serialNumber}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-stone-400">—</p>
                  )}
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-stone-900">
                    {format(res.startDate, 'd MMM yyyy', { locale: fr })}
                  </p>
                  <p className="text-xs text-stone-600">
                    → {format(res.endDate, 'd MMM yyyy', { locale: fr })}
                  </p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-xs text-stone-600 line-clamp-2">
                    {res.notes || '—'}
                  </p>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => onCancelReservation(res.id)}
                    className="text-stone-400 hover:text-red-600 transition"
                    title="Annuler"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
