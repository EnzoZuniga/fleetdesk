import type { AssetCategory, AssetStatus } from '../types';

interface FiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterCategory: AssetCategory | 'all';
  onCategoryChange: (category: AssetCategory | 'all') => void;
  filterStatus: AssetStatus | 'all';
  onStatusChange: (status: AssetStatus | 'all') => void;
}

const categories: Array<{ value: AssetCategory | 'all'; label: string }> = [
  { value: 'all', label: 'Toutes catégories' },
  { value: 'audio', label: 'Audio' },
  { value: 'lighting', label: 'Lumière' },
  { value: 'structure', label: 'Structure' },
  { value: 'power', label: 'Énergie' },
];

const statuses: Array<{ value: AssetStatus | 'all'; label: string }> = [
  { value: 'all', label: 'Tous statuts' },
  { value: 'available', label: 'Disponible' },
  { value: 'reserved', label: 'Réservé' },
  { value: 'on_site', label: 'Sur site' },
  { value: 'maintenance', label: 'Maintenance' },
];

export function Filters({
  searchQuery,
  onSearchChange,
  filterCategory,
  onCategoryChange,
  filterStatus,
  onStatusChange,
}: FiltersProps) {
  return (
    <div className="space-y-4">
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Rechercher par nom ou SN..."
        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
      />
      <div className="grid grid-cols-2 gap-3">
        <select
          value={filterCategory}
          onChange={(e) => onCategoryChange(e.target.value as AssetCategory | 'all')}
          className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
        >
          {categories.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => onStatusChange(e.target.value as AssetStatus | 'all')}
          className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
        >
          {statuses.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
