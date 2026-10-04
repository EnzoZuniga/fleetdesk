import { useState } from 'react';
import { z } from 'zod';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Modal } from '../../shared/ui/Modal';
import { Button } from '../../shared/ui/Button';
import { Badge } from '../../shared/ui/Badge';
import type { Asset, Reservation } from '../../types';
import { checkConflicts } from '../../lib/conflicts';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { cn } from '../../shared/lib/cn';

interface ReservationWizardProps {
  isOpen: boolean;
  onClose: () => void;
  assets: Asset[];
  reservations: Reservation[];
  onSubmit: (reservation: Omit<Reservation, 'id' | 'createdAt'>) => void;
}

type Step = 'asset' | 'dates' | 'details' | 'review';

const reservationSchema = z.object({
  assetId: z.string().min(1, 'Sélectionnez un équipement'),
  startDate: z.date(),
  endDate: z.date(),
  clientName: z.string().min(1, 'Le nom du client est requis'),
  eventName: z.string().min(1, 'Le nom de l\'événement est requis'),
  notes: z.string().optional(),
}).refine(data => data.endDate >= data.startDate, {
  message: 'La date de fin doit être après la date de début',
  path: ['endDate'],
});

export function ReservationWizard({ isOpen, onClose, assets, reservations, onSubmit }: ReservationWizardProps) {
  const [step, setStep] = useState<Step>('asset');
  const [assetId, setAssetId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [clientName, setClientName] = useState('');
  const [eventName, setEventName] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedAsset = assets.find(a => a.id === assetId);

  const reset = () => {
    setStep('asset');
    setAssetId('');
    setStartDate('');
    setEndDate('');
    setClientName('');
    setEventName('');
    setNotes('');
    setErrors({});
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const validateStep = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 'asset' && !assetId) {
      newErrors.assetId = 'Sélectionnez un équipement';
    }

    if (step === 'dates') {
      if (!startDate) newErrors.startDate = 'La date de début est requise';
      if (!endDate) newErrors.endDate = 'La date de fin est requise';
      if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
        newErrors.endDate = 'La date de fin doit être après la date de début';
      }
    }

    if (step === 'details') {
      if (!clientName.trim()) newErrors.clientName = 'Le nom du client est requis';
      if (!eventName.trim()) newErrors.eventName = 'Le nom de l\'événement est requis';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep()) return;

    const steps: Step[] = ['asset', 'dates', 'details', 'review'];
    const currentIndex = steps.indexOf(step);
    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1]);
    }
  };

  const handleBack = () => {
    const steps: Step[] = ['asset', 'dates', 'details', 'review'];
    const currentIndex = steps.indexOf(step);
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1]);
    }
  };

  const handleSubmit = () => {
    const reservation = {
      assetId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      clientName,
      eventName,
      notes: notes || undefined,
    };

    try {
      reservationSchema.parse(reservation);
      onSubmit(reservation);
      handleClose();
    } catch (e) {
      if (e instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        e.errors.forEach(err => {
          newErrors[err.path[0] as string] = err.message;
        });
        setErrors(newErrors);
      }
    }
  };

  const conflict = startDate && endDate && assetId
    ? checkConflicts(assetId, new Date(startDate), new Date(endDate), reservations)
    : null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Nouvelle réservation" size="lg">
      <div className="space-y-6">
        {/* Progress indicator */}
        <div className="flex items-center gap-2">
          {['asset', 'dates', 'details', 'review'].map((s, i) => (
            <div key={s} className="flex items-center flex-1">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition',
                  ['asset', 'dates', 'details', 'review'].indexOf(step) >= i
                    ? 'bg-[#8B9A3D] text-white'
                    : 'bg-stone-200 text-stone-500'
                )}
              >
                {i + 1}
              </div>
              {i < 3 && (
                <div
                  className={cn(
                    'flex-1 h-1 mx-2 rounded transition',
                    ['asset', 'dates', 'details', 'review'].indexOf(step) > i
                      ? 'bg-[#8B9A3D]'
                      : 'bg-stone-200'
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step: Asset */}
        {step === 'asset' && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Sélectionnez un équipement</h3>
            <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
              {assets.map(asset => (
                <button
                  key={asset.id}
                  onClick={() => {
                    setAssetId(asset.id);
                    setErrors({});
                  }}
                  className={cn(
                    'text-left border rounded-lg p-3 transition',
                    assetId === asset.id
                      ? 'border-[#8B9A3D] bg-[#8B9A3D]/5'
                      : 'border-stone-200 hover:border-stone-300'
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-medium text-sm">{asset.name}</p>
                    <Badge status={asset.status}>{asset.status}</Badge>
                  </div>
                  <p className="text-xs font-mono text-stone-600">
                    {asset.serialNumber}
                  </p>
                </button>
              ))}
            </div>
            {errors.assetId && (
              <p className="text-sm text-red-600 mt-2">{errors.assetId}</p>
            )}
          </div>
        )}

        {/* Step: Dates */}
        {step === 'dates' && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Choisissez les dates</h3>
            {selectedAsset && (
              <div className="mb-4 p-3 bg-stone-50 rounded-lg">
                <p className="text-sm font-medium">{selectedAsset.name}</p>
                <p className="text-xs text-stone-600">{selectedAsset.serialNumber}</p>
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Date de début
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={e => {
                    setStartDate(e.target.value);
                    setErrors({});
                  }}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B9A3D]"
                />
                {errors.startDate && (
                  <p className="text-sm text-red-600 mt-1">{errors.startDate}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Date de fin
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={e => {
                    setEndDate(e.target.value);
                    setErrors({});
                  }}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B9A3D]"
                />
                {errors.endDate && (
                  <p className="text-sm text-red-600 mt-1">{errors.endDate}</p>
                )}
              </div>
            </div>

            {conflict?.hasConflict && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                <AlertTriangle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-900 mb-1">
                    Conflit détecté
                  </p>
                  <p className="text-xs text-amber-800">
                    {conflict.conflictingReservations.length} réservation(s) existante(s) sur cette période
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step: Details */}
        {step === 'details' && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Informations client</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Nom du client
                </label>
                <input
                  type="text"
                  value={clientName}
                  onChange={e => {
                    setClientName(e.target.value);
                    setErrors({});
                  }}
                  placeholder="Ex: Casino Théâtre"
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B9A3D]"
                />
                {errors.clientName && (
                  <p className="text-sm text-red-600 mt-1">{errors.clientName}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Nom de l'événement
                </label>
                <input
                  type="text"
                  value={eventName}
                  onChange={e => {
                    setEventName(e.target.value);
                    setErrors({});
                  }}
                  placeholder="Ex: Festival Jazz"
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B9A3D]"
                />
                {errors.eventName && (
                  <p className="text-sm text-red-600 mt-1">{errors.eventName}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Notes (optionnel)
                </label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Informations supplémentaires..."
                  rows={3}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B9A3D] resize-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step: Review */}
        {step === 'review' && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Récapitulatif</h3>
            <div className="space-y-3 bg-stone-50 rounded-lg p-4">
              <div>
                <p className="text-xs text-stone-600 mb-1">Équipement</p>
                <p className="text-sm font-medium">{selectedAsset?.name}</p>
                <p className="text-xs font-mono text-stone-600">
                  {selectedAsset?.serialNumber}
                </p>
              </div>
              <div>
                <p className="text-xs text-stone-600 mb-1">Période</p>
                <p className="text-sm">
                  Du {format(new Date(startDate), 'd MMMM yyyy', { locale: fr })} au{' '}
                  {format(new Date(endDate), 'd MMMM yyyy', { locale: fr })}
                </p>
              </div>
              <div>
                <p className="text-xs text-stone-600 mb-1">Client</p>
                <p className="text-sm">{clientName}</p>
              </div>
              <div>
                <p className="text-xs text-stone-600 mb-1">Événement</p>
                <p className="text-sm">{eventName}</p>
              </div>
              {notes && (
                <div>
                  <p className="text-xs text-stone-600 mb-1">Notes</p>
                  <p className="text-sm">{notes}</p>
                </div>
              )}
            </div>

            {conflict?.hasConflict ? (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                <AlertTriangle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-900 mb-1">
                    Attention : conflit de réservation
                  </p>
                  <p className="text-xs text-amber-800">
                    Cet équipement est déjà réservé sur cette période
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-2">
                <CheckCircle size={18} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-emerald-900">
                  Aucun conflit détecté
                </p>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-stone-200">
          <div>
            {step !== 'asset' && (
              <Button onClick={handleBack} variant="ghost">
                Retour
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button onClick={handleClose} variant="secondary">
              Annuler
            </Button>
            {step === 'review' ? (
              <Button onClick={handleSubmit} variant="primary">
                Confirmer
              </Button>
            ) : (
              <Button onClick={handleNext} variant="primary">
                Suivant
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
