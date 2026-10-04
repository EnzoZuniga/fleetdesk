import { type ReactNode } from 'react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      {icon && (
        <div className="mb-4 text-stone-400">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-stone-900 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-stone-600 mb-4 max-w-sm text-center">
          {description}
        </p>
      )}
      {action && (
        <Button onClick={action.onClick} variant="secondary">
          {action.label}
        </Button>
      )}
    </div>
  );
}
