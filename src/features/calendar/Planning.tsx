import { useMemo } from 'react';
import { format, addDays, startOfWeek, isSameDay, isWithinInterval } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Asset, Reservation } from '../../types';
import { EmptyState } from '../../shared/ui/EmptyState';
import { Calendar } from 'lucide-react';
import { cn } from '../../shared/lib/cn';

interface PlanningProps {
  assets: Asset[];
  reservations: Reservation[];
}

export function Planning({ assets, reservations }: PlanningProps) {
  const weekStart = useMemo(() => startOfWeek(new Date(), { weekStartsOn: 1 }), []);
  const days = useMemo(() => {
    return Array.from({ length: 21 }, (_, i) => addDays(weekStart, i));
  }, [weekStart]);

  const assetsWithReservations = useMemo(() => {
    return assets
      .map(asset => {
        const assetReservations = reservations.filter(r => r.assetId === asset.id);
        return { asset, reservations: assetReservations };
      })
      .filter(item => item.reservations.length > 0);
  }, [assets, reservations]);

  if (assetsWithReservations.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <EmptyState
          icon={<Calendar size={48} />}
          title="Aucune réservation"
          description="Le planning est vide pour les 3 prochaines semaines"
        />
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto">
      <div className="min-w-max">
        {/* En-tête calendrier */}
        <div className="sticky top-0 bg-white z-10 border-b border-stone-200">
          <div className="flex">
            <div className="w-64 flex-shrink-0 px-4 py-3 font-medium text-sm text-stone-700 border-r border-stone-200">
              Équipement
            </div>
            {days.map(day => (
              <div
                key={day.toISOString()}
                className={cn(
                  'w-24 flex-shrink-0 px-2 py-3 text-center border-r border-stone-100',
                  isSameDay(day, new Date()) && 'bg-[#8B9A3D]/5'
                )}
              >
                <div className="text-xs font-medium text-stone-900">
                  {format(day, 'EEE', { locale: fr })}
                </div>
                <div className="text-xs text-stone-600">
                  {format(day, 'd MMM', { locale: fr })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lignes assets + barres réservations */}
        <div>
          {assetsWithReservations.map(({ asset, reservations }) => (
            <div key={asset.id} className="flex border-b border-stone-100 hover:bg-stone-50/50">
              <div className="w-64 flex-shrink-0 px-4 py-3 border-r border-stone-200">
                <p className="text-sm font-medium text-stone-900 mb-1">
                  {asset.name}
                </p>
                <p className="text-xs font-mono text-stone-600">
                  {asset.serialNumber}
                </p>
              </div>
              <div className="flex-1 relative py-3">
                <div className="flex h-full">
                  {days.map(day => (
                    <div
                      key={day.toISOString()}
                      className={cn(
                        'w-24 flex-shrink-0 border-r border-stone-100',
                        isSameDay(day, new Date()) && 'bg-[#8B9A3D]/5'
                      )}
                    />
                  ))}
                </div>
                {/* Barres de réservation */}
                <div className="absolute inset-0 pointer-events-none px-1 py-2">
                  {reservations.map(res => {
                    const start = res.startDate < weekStart ? weekStart : res.startDate;
                    const end = res.endDate > days[days.length - 1] ? days[days.length - 1] : res.endDate;
                    
                    const startIndex = days.findIndex(d => isSameDay(d, start) || d > start);
                    if (startIndex === -1) return null;

                    const visibleDays = days.filter(d =>
                      isWithinInterval(d, { start, end })
                    ).length;

                    const leftOffset = startIndex * 96; // 96px = w-24
                    const width = visibleDays * 96;

                    return (
                      <div
                        key={res.id}
                        className="absolute h-7 rounded bg-[#8B9A3D] text-white px-2 flex items-center shadow-sm pointer-events-auto cursor-pointer hover:bg-[#7a8636] transition"
                        style={{
                          left: `${leftOffset}px`,
                          width: `${width}px`,
                        }}
                        title={`${res.eventName} - ${res.clientName}`}
                      >
                        <span className="text-xs font-medium truncate">
                          {res.eventName}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
