import type { Asset, AssetCategory, AssetStatus } from '../types';
import { AssetCard } from './AssetCard';

interface AssetListProps {
  assets: Asset[];
  selectedAssetId: string | null;
  onSelectAsset: (assetId: string) => void;
  filterCategory: AssetCategory | 'all';
  filterStatus: AssetStatus | 'all';
  searchQuery: string;
}

export function AssetList({
  assets,
  selectedAssetId,
  onSelectAsset,
  filterCategory,
  filterStatus,
  searchQuery,
}: AssetListProps) {
  const filtered = assets.filter((asset) => {
    if (filterCategory !== 'all' && asset.category !== filterCategory) return false;
    if (filterStatus !== 'all' && asset.status !== filterStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        asset.name.toLowerCase().includes(q) ||
        asset.serialNumber.toLowerCase().includes(q)
      );
    }
    return true;
  });

  if (filtered.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        Aucun équipement trouvé
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {filtered.map((asset) => (
        <AssetCard
          key={asset.id}
          asset={asset}
          onClick={() => onSelectAsset(asset.id)}
          isSelected={selectedAssetId === asset.id}
        />
      ))}
    </div>
  );
}
