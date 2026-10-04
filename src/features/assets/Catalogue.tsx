import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, Package } from 'lucide-react';
import type { Asset, AssetCategory, AssetStatus } from '../../types';
import { Badge } from '../../shared/ui/Badge';
import { EmptyState } from '../../shared/ui/EmptyState';
import { cn } from '../../shared/lib/cn';
import { motion } from 'framer-motion';

interface CatalogueProps {
  assets: Asset[];
  onSelectAsset: (assetId: string) => void;
}

const categories: Array<{ value: AssetCategory | 'all'; label: string }> = [
  { value: 'all', label: 'Tout' },
  { value: 'audio', label: 'Audio' },
  { value: 'lighting', label: 'Lumière' },
  { value: 'structure', label: 'Structure' },
  { value: 'power', label: 'Électricité' },
];

const statuses: Array<{ value: AssetStatus | 'all'; label: string }> = [
  { value: 'all', label: 'Tous' },
  { value: 'available', label: 'Disponible' },
  { value: 'reserved', label: 'Réservé' },
  { value: 'on_site', label: 'Sur site' },
  { value: 'maintenance', label: 'Maintenance' },
];

export function Catalogue({ assets, onSelectAsset }: CatalogueProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);

  const query = searchParams.get('q') || '';
  const category = (searchParams.get('category') || 'all') as AssetCategory | 'all';
  const status = (searchParams.get('status') || 'all') as AssetStatus | 'all';
  const selectedAssetId = searchParams.get('asset');

  const updateFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === 'all' || value === '') {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    setSearchParams(newParams);
  };

  const filtered = useMemo(() => {
    return assets.filter(asset => {
      if (category !== 'all' && asset.category !== category) return false;
      if (status !== 'all' && asset.status !== status) return false;
      if (query) {
        const lowerQuery = query.toLowerCase();
        return (
          asset.name.toLowerCase().includes(lowerQuery) ||
          asset.serialNumber.toLowerCase().includes(lowerQuery)
        );
      }
      return true;
    });
  }, [assets, category, status, query]);

  const activeFiltersCount = 
    (category !== 'all' ? 1 : 0) +
    (status !== 'all' ? 1 : 0);

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-stone-200 bg-white">
        <div className="px-6 py-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={query}
                onChange={e => updateFilter('q', e.target.value)}
                placeholder="Rechercher équipement..."
                className="w-full pl-10 pr-4 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8B9A3D]"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg border transition text-sm font-medium',
                showFilters || activeFiltersCount > 0
                  ? 'border-[#8B9A3D] bg-[#8B9A3D]/5 text-stone-900'
                  : 'border-stone-300 hover:bg-stone-50 text-stone-600'
              )}
            >
              <Filter size={16} />
              Filtres
              {activeFiltersCount > 0 && (
                <span className="bg-[#8B9A3D] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>

          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="flex gap-3 pt-3 border-t border-stone-100"
            >
              <div className="flex-1">
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Catégorie
                </label>
                <select
                  value={category}
                  onChange={e => updateFilter('category', e.target.value)}
                  className="w-full px-3 py-1.5 border border-stone-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#8B9A3D]"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Statut
                </label>
                <select
                  value={status}
                  onChange={e => updateFilter('status', e.target.value)}
                  className="w-full px-3 py-1.5 border border-stone-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#8B9A3D]"
                >
                  {statuses.map(st => (
                    <option key={st.value} value={st.value}>
                      {st.label}
                    </option>
                  ))}
                </select>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {filtered.length === 0 ? (
          <EmptyState
            icon={<Package size={48} />}
            title={query ? `Aucun résultat pour "${query}"` : 'Aucun équipement'}
            description={
              activeFiltersCount > 0
                ? 'Essayez de modifier les filtres'
                : undefined
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((asset, index) => (
              <motion.button
                key={asset.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03, duration: 0.2 }}
                onClick={() => onSelectAsset(asset.id)}
                className={cn(
                  'text-left bg-white border rounded-lg p-4 transition',
                  'hover:shadow-md hover:border-stone-300',
                  selectedAssetId === asset.id
                    ? 'border-[#8B9A3D] ring-2 ring-[#8B9A3D]/20'
                    : 'border-stone-200'
                )}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-stone-900 text-sm">
                    {asset.name}
                  </h3>
                  <Badge status={asset.status}>
                    {statuses.find(s => s.value === asset.status)?.label}
                  </Badge>
                </div>
                <p className="text-xs font-mono text-stone-600 mb-2">
                  {asset.serialNumber}
                </p>
                <Badge category={asset.category} className="text-xs">
                  {categories.find(c => c.value === asset.category)?.label}
                </Badge>
                {asset.notes && (
                  <p className="mt-2 text-xs text-stone-500 line-clamp-2">
                    {asset.notes}
                  </p>
                )}
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
