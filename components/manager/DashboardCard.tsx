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

/**
 * Render a compact dashboard metric card showing a title, main value, icon, and optional trend label.
 *
 * @param title - The card title displayed in the header
 * @param value - The primary metric shown prominently
 * @param icon - Visual element rendered in the header (e.g., an icon or avatar)
 * @param trend - Numeric trend value; accepted by the props but not used by the component
 * @param trendLabel - Optional label displayed beneath the value (e.g., comparison or percentage)
 * @param className - Optional additional CSS classes applied to the card container
 * @returns A React element representing the dashboard card
 */
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
