import { useState } from 'react';
import type { AssetCategory, AssetStatus } from './types';
import { useFleetStore } from './hooks/useFleetStore';
import { Filters } from './components/Filters';
import { AssetList } from './components/AssetList';
import { AssetDetail } from './components/AssetDetail';
import { ReservationForm } from './components/ReservationForm';

export default function App() {
  const store = useFleetStore();
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [showReservationForm, setShowReservationForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<AssetCategory | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<AssetStatus | 'all'>('all');

  const selectedAsset = store.assets.find((a) => a.id === selectedAssetId);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">FleetDesk</h1>
            <p className="text-sm text-slate-600">Gestion parc événementiel</p>
          </div>
          <button
            onClick={() => setShowReservationForm(true)}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition font-medium"
          >
            + Nouvelle réservation
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6">
        <div className="mb-6">
          <Filters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filterCategory={filterCategory}
            onCategoryChange={setFilterCategory}
            filterStatus={filterStatus}
            onStatusChange={setFilterStatus}
          />
        </div>

        <AssetList
          assets={store.assets}
          selectedAssetId={selectedAssetId}
          onSelectAsset={setSelectedAssetId}
          filterCategory={filterCategory}
          filterStatus={filterStatus}
          searchQuery={searchQuery}
        />
      </main>

      {selectedAsset && (
        <AssetDetail
          asset={selectedAsset}
          reservations={store.getReservationsForAsset(selectedAsset.id)}
          onClose={() => setSelectedAssetId(null)}
          onStatusChange={(status) =>
            store.updateAssetStatus(selectedAsset.id, status)
          }
        />
      )}

      {showReservationForm && (
        <ReservationForm
          assets={store.assets}
          reservations={store.reservations}
          onSubmit={(res) => {
            store.addReservation(res);
            setShowReservationForm(false);
          }}
          onCancel={() => setShowReservationForm(false)}
        />
      )}
    </div>
  );
}
