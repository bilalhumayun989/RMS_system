import React from 'react';
import { Inbox } from 'lucide-react';

export interface EmptyStateProps {
  message: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 text-center select-none">
      <Inbox className="w-12 h-12 text-pos-gray/30 mb-3" />
      <p className="text-sm font-medium text-pos-gray">{message}</p>
    </div>
  );
};

export default EmptyState;
