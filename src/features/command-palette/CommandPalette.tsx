import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Package, Calendar, FileText, Plus } from 'lucide-react';
import { Modal } from '../../shared/ui/Modal';
import { useFleetStore } from '../../store/fleetStore';
import { cn } from '../../shared/lib/cn';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNewReservation: () => void;
}

interface Command {
  id: string;
  label: string;
  keywords: string[];
  icon: React.ReactNode;
  onSelect: () => void;
}

export function CommandPalette({ isOpen, onClose, onNewReservation }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const { assets } = useFleetStore();

  const commands = useMemo<Command[]>(() => {
    const nav: Command[] = [
      {
        id: 'nav-catalogue',
        label: 'Catalogue',
        keywords: ['catalogue', 'assets', 'équipement', 'materiel'],
        icon: <Package size={18} />,
        onSelect: () => {
          navigate('/');
          onClose();
        },
      },
      {
        id: 'nav-planning',
        label: 'Planning',
        keywords: ['planning', 'gantt', 'timeline', 'calendrier'],
        icon: <Calendar size={18} />,
        onSelect: () => {
          navigate('/planning');
          onClose();
        },
      },
      {
        id: 'nav-reservations',
        label: 'Réservations',
        keywords: ['reservations', 'bookings', 'liste'],
        icon: <FileText size={18} />,
        onSelect: () => {
          navigate('/reservations');
          onClose();
        },
      },
      {
        id: 'action-new',
        label: 'Nouvelle réservation',
        keywords: ['nouvelle', 'créer', 'ajouter', 'new', 'create'],
        icon: <Plus size={18} />,
        onSelect: () => {
          onNewReservation();
          onClose();
        },
      },
    ];

    const assetCommands: Command[] = assets.map(asset => ({
      id: `asset-${asset.id}`,
      label: asset.name,
      keywords: [asset.name.toLowerCase(), asset.serialNumber.toLowerCase(), asset.category],
      icon: <Package size={18} />,
      onSelect: () => {
        navigate(`/?asset=${asset.id}`);
        onClose();
      },
    }));

    return [...nav, ...assetCommands];
  }, [assets, navigate, onClose, onNewReservation]);

  const filteredCommands = useMemo(() => {
    if (!query.trim()) return commands;
    const lowerQuery = query.toLowerCase();
    return commands.filter(cmd =>
      cmd.label.toLowerCase().includes(lowerQuery) ||
      cmd.keywords.some(kw => kw.includes(lowerQuery))
    );
  }, [commands, query]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(i => Math.min(i + 1, filteredCommands.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(i => Math.max(i - 1, 0));
      } else if (e.key === 'Enter' && filteredCommands[selectedIndex]) {
        e.preventDefault();
        filteredCommands[selectedIndex].onSelect();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" className="!p-0">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-stone-200">
        <Search size={18} className="text-stone-400" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Rechercher équipement, vue, action..."
          className="flex-1 bg-transparent outline-none text-stone-900 placeholder:text-stone-400"
          autoFocus
        />
      </div>
      <div className="max-h-96 overflow-y-auto py-2">
        {filteredCommands.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-stone-500">
            Aucun résultat pour "{query}"
          </div>
        ) : (
          filteredCommands.map((cmd, index) => (
            <button
              key={cmd.id}
              onClick={cmd.onSelect}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-2.5 text-left transition',
                'hover:bg-stone-50',
                selectedIndex === index && 'bg-stone-100'
              )}
            >
              <span className="text-stone-500">{cmd.icon}</span>
              <span className="text-stone-900">{cmd.label}</span>
            </button>
          ))
        )}
      </div>
    </Modal>
  );
}
