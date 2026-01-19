/**
 * Table Status Badge Component
 * 
 * Reusable badge for displaying table status
 * - Color coding
 * - Status labels
 * - Icon support
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { TableStatus } from '@prisma/client';

interface TableStatusBadgeProps {
  status: TableStatus;
  className?: string;
}

const statusConfig: Record<
  TableStatus,
  { label: string; color: string; icon: string }
> = {
  AVAILABLE: {
    label: 'Available',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: '✓',
  },
  OCCUPIED: {
    label: 'Occupied',
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: '👥',
  },
  RESERVED: {
    label: 'Reserved',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: '📅',
  },
  CLEANING: {
    label: 'Cleaning',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: '🧹',
  },
  MAINTENANCE: {
    label: 'Maintenance',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: '🔧',
  },
};

export default function TableStatusBadge({
  status,
  className,
}: TableStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge className={`${config.color} ${className}`}>
      <span className="mr-1">{config.icon}</span>
      {config.label}
    </Badge>
  );
}
