/**
 * Order Stats Cards Component
 * 
 * Quick stats cards for dashboard
 * - Total orders
 * - Revenue
 * - Average order value
 * - Table turnover
 * - Trend indicators
 */

'use client';

import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Clock } from 'lucide-react';
import DashboardCard from './DashboardCard';
import { cn } from '@/lib/utils';

interface OrderStatsCardsProps {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  totalCustomers: number;
  revenueChange?: number;
  ordersChange?: number;
  isLoading?: boolean;
}

export default function OrderStatsCards({
  totalOrders,
  totalRevenue,
  averageOrderValue,
  totalCustomers,
  revenueChange = 0,
  ordersChange = 0,
  isLoading = false,
}: OrderStatsCardsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  const getTrendColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getTrendIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4" />;
    if (change < 0) return <TrendingDown className="h-4 w-4" />;
    return null;
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white rounded-lg border p-6 animate-pulse"
          >
            <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-32 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-20"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Revenue */}
      <DashboardCard
        title="Total Revenue"
        value={formatCurrency(totalRevenue)}
        icon={<DollarSign className="h-5 w-5" />}
        trend={revenueChange}
        trendLabel={
          revenueChange !== 0 ? (
            <span className={cn('flex items-center gap-1 text-sm', getTrendColor(revenueChange))}>
              {getTrendIcon(revenueChange)}
              {Math.abs(revenueChange).toFixed(1)}% vs previous period
            </span>
          ) : undefined
        }
      />

      {/* Total Orders */}
      <DashboardCard
        title="Total Orders"
        value={formatNumber(totalOrders)}
        icon={<ShoppingCart className="h-5 w-5" />}
        trend={ordersChange}
        trendLabel={
          ordersChange !== 0 ? (
            <span className={cn('flex items-center gap-1 text-sm', getTrendColor(ordersChange))}>
              {getTrendIcon(ordersChange)}
              {Math.abs(ordersChange).toFixed(1)}% vs previous period
            </span>
          ) : undefined
        }
      />

      {/* Average Order Value */}
      <DashboardCard
        title="Average Order Value"
        value={formatCurrency(averageOrderValue)}
        icon={<DollarSign className="h-5 w-5" />}
      />

      {/* Total Customers */}
      <DashboardCard
        title="Total Customers"
        value={formatNumber(totalCustomers)}
        icon={<Users className="h-5 w-5" />}
      />
    </div>
  );
}
