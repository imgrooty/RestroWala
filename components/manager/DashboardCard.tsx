/**
 * Dashboard Card Component
 * 
 * Metric display card for dashboard
 * - Icon and title
 * - Large metric value
 * - Trend indicator
 * - Comparison with previous period
 */

'use client';

import { cn } from '@/lib/utils';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number;
  trendLabel?: React.ReactNode;
  className?: string;
}

export default function DashboardCard({
  title,
  value,
  icon,
  trend: _trend,
  trendLabel,
  className,
}: DashboardCardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-lg border p-6 shadow-sm hover:shadow-md transition-shadow',
        className
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <div className="text-muted-foreground">{icon}</div>
      </div>
      <div className="space-y-1">
        <div className="text-2xl font-bold">{value}</div>
        {trendLabel && (
          <div className="text-xs">{trendLabel}</div>
        )}
      </div>
    </div>
  );
}
