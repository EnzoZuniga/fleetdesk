import type { Asset } from '../types';

interface AssetCardProps {
  asset: Asset;
  onClick: () => void;
  isSelected: boolean;
}

const statusLabels: Record<Asset['status'], string> = {
  available: 'Disponible',
  reserved: 'Réservé',
  on_site: 'Sur site',
  maintenance: 'Maintenance',
};

const statusColors: Record<Asset['status'], string> = {
  available: 'bg-emerald-100 text-emerald-800',
  reserved: 'bg-amber-100 text-amber-800',
  on_site: 'bg-blue-100 text-blue-800',
  maintenance: 'bg-slate-100 text-slate-600',
};

export function AssetCard({ asset, onClick, isSelected }: AssetCardProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-lg border transition-all ${
        isSelected
          ? 'border-slate-900 bg-slate-50'
          : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-slate-900">{asset.name}</h3>
        <span
          className={`text-xs px-2 py-1 rounded ${statusColors[asset.status]}`}
        >
          {statusLabels[asset.status]}
        </span>
      </div>
      <p className="text-sm text-slate-600 mb-1">SN: {asset.serialNumber}</p>
      {asset.notes && (
        <p className="text-sm text-slate-500 line-clamp-2">{asset.notes}</p>
      )}
    </button>
  );
}
