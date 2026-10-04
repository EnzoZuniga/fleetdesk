import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, NavLink, useSearchParams, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Package, Calendar, FileText, Plus, Command } from 'lucide-react';
import { useFleetStore } from '../store/fleetStore';
import { Catalogue } from '../features/assets/Catalogue';
import { Inspector } from '../features/assets/Inspector';
import { Planning } from '../features/calendar/Planning';
import { ReservationList } from '../features/reservations/ReservationList';
import { ReservationWizard } from '../features/reservations/ReservationWizard';
import { CommandPalette } from '../features/command-palette/CommandPalette';
import { Button } from '../shared/ui/Button';
import { ToastContainer } from '../shared/ui/Toast';
import { useToast } from '../shared/hooks/useToast';
import { cn } from '../shared/lib/cn';

function AppContent() {
  const store = useFleetStore();
  const { toasts, addToast, removeToast } = useToast();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [showWizard, setShowWizard] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);

  const selectedAsset = selectedAssetId ? store.getAsset(selectedAssetId) : null;

  // Sync selected asset avec URL
  useEffect(() => {
    const assetParam = searchParams.get('asset');
    setSelectedAssetId(assetParam);
  }, [searchParams]);

  // Raccourcis clavier globaux
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K / Ctrl+K pour palette
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(true);
      }
      
      // N pour nouvelle réservation
      if (e.key === 'n' && !e.metaKey && !e.ctrlKey && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        setShowWizard(true);
      }
      
      // Esc pour fermer inspector
      if (e.key === 'Escape' && selectedAssetId) {
        setSelectedAssetId(null);
        navigate(location.pathname);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedAssetId, navigate]);

  const handleNewReservation = (res: Omit<import('../types').Reservation, 'id' | 'createdAt'>) => {
    const newRes = store.addReservation(res);
    
    // Toast avec Undo
    let undoUsed = false;
    addToast({
      message: 'Réservation créée',
      type: 'success',
      duration: 5000,
      action: {
        label: 'Annuler',
        onClick: () => {
          if (!undoUsed) {
            store.cancelReservation(newRes.id);
            addToast({
              message: 'Réservation annulée',
              type: 'info',
              duration: 3000,
            });
            undoUsed = true;
          }
        },
      },
    });
  };

  const handleCancelReservation = (id: string) => {
    const res = store.getReservation(id);
    if (!res) return;
    
    store.cancelReservation(id);
    addToast({
      message: `Réservation "${res.eventName}" annulée`,
      type: 'info',
      duration: 3000,
    });
  };

  // Stats pour header
  const availableCount = store.assets.filter(a => a.status === 'available').length;
  const onSiteCount = store.assets.filter(a => a.status === 'on_site').length;
  
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  const conflictsNextWeek = store.reservations.filter(res => {
    if (res.startDate > nextWeek) return false;
    const assetReservations = store.reservations.filter(
      r => r.assetId === res.assetId && r.id !== res.id
    );
    return assetReservations.some(
      other =>
        (res.startDate >= other.startDate && res.startDate <= other.endDate) ||
        (res.endDate >= other.startDate && res.endDate <= other.endDate) ||
        (res.startDate <= other.startDate && res.endDate >= other.endDate)
    );
  }).length;

  return (
    <div className="h-screen flex flex-col bg-stone-50">
      {/* Header */}
      <header className="flex-shrink-0 bg-[#1C1917] text-white">
        <div className="px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold font-['Sora']">FleetDesk</h1>
            <p className="text-sm text-stone-400">Gestion parc événementiel</p>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 text-sm">
              <div>
                <span className="text-stone-400">Disponible:</span>{' '}
                <span className="font-semibold text-emerald-400">{availableCount}</span>
              </div>
              <div>
                <span className="text-stone-400">Sur site:</span>{' '}
                <span className="font-semibold text-blue-400">{onSiteCount}</span>
              </div>
              {conflictsNextWeek > 0 && (
                <div>
                  <span className="text-stone-400">Conflits 7j:</span>{' '}
                  <span className="font-semibold text-amber-400">{conflictsNextWeek}</span>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowCommandPalette(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 rounded text-sm transition"
              title="⌘K"
            >
              <Command size={14} />
              Recherche
            </button>

            <Button onClick={() => setShowWizard(true)} size="sm">
              <Plus size={16} className="mr-1" />
              Nouvelle réservation
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <nav className="w-56 bg-white border-r border-stone-200 flex flex-col">
          <div className="flex-1 py-4">
            <NavLink
              to="/"
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-6 py-2.5 text-sm font-medium transition',
                  isActive
                    ? 'bg-stone-100 text-stone-900 border-r-2 border-[#8B9A3D]'
                    : 'text-stone-600 hover:bg-stone-50'
                )
              }
            >
              <Package size={18} />
              Catalogue
            </NavLink>
            <NavLink
              to="/planning"
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-6 py-2.5 text-sm font-medium transition',
                  isActive
                    ? 'bg-stone-100 text-stone-900 border-r-2 border-[#8B9A3D]'
                    : 'text-stone-600 hover:bg-stone-50'
                )
              }
            >
              <Calendar size={18} />
              Planning
            </NavLink>
            <NavLink
              to="/reservations"
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-6 py-2.5 text-sm font-medium transition',
                  isActive
                    ? 'bg-stone-100 text-stone-900 border-r-2 border-[#8B9A3D]'
                    : 'text-stone-600 hover:bg-stone-50'
                )
              }
            >
              <FileText size={18} />
              Réservations
            </NavLink>
          </div>

          <div className="px-6 py-4 border-t border-stone-200 text-xs text-stone-500">
            <div className="mb-2">
              <kbd className="px-1.5 py-0.5 bg-stone-100 rounded text-stone-700 font-mono">⌘K</kbd>{' '}
              Palette
            </div>
            <div>
              <kbd className="px-1.5 py-0.5 bg-stone-100 rounded text-stone-700 font-mono">N</kbd>{' '}
              Nouvelle
            </div>
          </div>
        </nav>

        {/* Main content */}
        <main className="flex-1 overflow-hidden flex">
          <div className="flex-1 overflow-hidden">
            <Routes>
              <Route
                path="/"
                element={
                  <Catalogue
                    assets={store.assets}
                    onSelectAsset={id => {
                      setSelectedAssetId(id);
                      const params = new URLSearchParams(searchParams);
                      params.set('asset', id);
                      navigate(`/?${params.toString()}`);
                    }}
                  />
                }
              />
              <Route
                path="/planning"
                element={
                  <Planning
                    assets={store.assets}
                    reservations={store.reservations}
                  />
                }
              />
              <Route
                path="/reservations"
                element={
                  <ReservationList
                    reservations={store.reservations}
                    assets={store.assets}
                    onCancelReservation={handleCancelReservation}
                  />
                }
              />
            </Routes>
          </div>

          {/* Inspector panel */}
          <AnimatePresence>
            {selectedAsset && (
              <Inspector
                key={selectedAsset.id}
                asset={selectedAsset}
                reservations={store.getReservationsForAsset(selectedAsset.id)}
                allReservations={store.reservations}
                onClose={() => {
                  setSelectedAssetId(null);
                  const params = new URLSearchParams(searchParams);
                  params.delete('asset');
                  navigate(`${location.pathname}${params.toString() ? `?${params.toString()}` : ''}`);
                }}
                onStatusChange={status => {
                  store.updateAssetStatus(selectedAsset.id, status);
                  addToast({
                    message: 'Statut mis à jour',
                    type: 'success',
                    duration: 2000,
                  });
                }}
                onNotesChange={notes => {
                  store.updateAssetNotes(selectedAsset.id, notes);
                }}
              />
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Modals */}
      <ReservationWizard
        isOpen={showWizard}
        onClose={() => setShowWizard(false)}
        assets={store.assets}
        reservations={store.reservations}
        onSubmit={handleNewReservation}
      />

      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        onNewReservation={() => {
          setShowCommandPalette(false);
          setShowWizard(true);
        }}
      />

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

export function AppShell() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
