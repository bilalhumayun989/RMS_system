import React from 'react';
import { Badge, BadgeVariant } from '../ui/Badge';

export interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getBadgeVariant = (s: string): BadgeVariant => {
    const normal = s.toLowerCase();
    if (normal === 'ready' || normal === 'completed' || normal === 'served' || normal === 'available') return 'green';
    if (normal === 'cooking' || normal === 'in-progress' || normal === 'occupied') return 'yellow';
    if (normal === 'new' || normal === 'waiting' || normal === 'reserved') return 'blue';
    if (normal === 'cancel' || normal === 'delete') return 'red';
    return 'gray';
  };

  const getLabel = (s: string) => {
    return s.replace('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return <Badge variant={getBadgeVariant(status)}>{getLabel(status)}</Badge>;
};

export default StatusBadge;
