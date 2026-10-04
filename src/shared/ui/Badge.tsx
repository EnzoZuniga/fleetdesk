import { type ReactNode } from 'react';
import { cn } from '../lib/cn';
import type { AssetStatus, AssetCategory } from '../../types';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'status' | 'category';
  status?: AssetStatus;
  category?: AssetCategory;
  className?: string;
}

export function Badge({ children, variant = 'default', status, category, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded px-2 py-0.5 text-xs font-medium',
        {
          'bg-stone-100 text-stone-700': variant === 'default',
          'bg-emerald-100 text-emerald-800': status === 'available',
          'bg-amber-100 text-amber-800': status === 'reserved',
          'bg-blue-100 text-blue-800': status === 'on_site',
          'bg-stone-200 text-stone-600': status === 'maintenance',
          'bg-violet-50 text-violet-700': category === 'audio',
          'bg-amber-50 text-amber-700': category === 'lighting',
          'bg-slate-100 text-slate-700': category === 'structure',
          'bg-orange-50 text-orange-700': category === 'power',
        },
        className
      )}
    >
      {children}
    </span>
  );
}
