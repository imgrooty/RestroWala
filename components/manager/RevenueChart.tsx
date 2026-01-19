/**
 * Revenue Chart Component
 * 
 * Chart displaying revenue trends using Recharts
 * - Line/Bar chart
 * - Date range selector
 * - Multiple metrics
 * - Export functionality
 */

'use client';

import { useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Download, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RevenueData } from '@/types/analytics';

interface RevenueChartProps {
  data: RevenueData[];
  period: 'day' | 'week' | 'month' | 'year';
  onPeriodChange: (period: 'day' | 'week' | 'month' | 'year') => void;
  isLoading?: boolean;
  totalRevenue?: number;
  revenueChange?: number;
}

export default function RevenueChart({
  data,
  period,
  onPeriodChange,
  isLoading = false,
  totalRevenue = 0,
  revenueChange = 0,
}: RevenueChartProps) {
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleExport = () => {
    // Convert data to CSV
    const headers = ['Date', 'Revenue', 'Orders', 'Customers', 'Average Order Value'];
    const rows = data.map((item) => [
      item.date,
      item.revenue.toString(),
      item.orders.toString(),
      item.customers.toString(),
      item.revenue / item.orders || 0,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `revenue-${period}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border p-6">
        <div className="h-64 flex items-center justify-center">
          <div className="text-muted-foreground">Loading chart data...</div>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg border p-6">
        <div className="h-64 flex items-center justify-center">
          <div className="text-muted-foreground">No data available for the selected period</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">Revenue Analytics</h3>
          {totalRevenue > 0 && (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-bold">{formatCurrency(totalRevenue)}</span>
              {revenueChange !== 0 && (
                <span
                  className={`text-sm flex items-center gap-1 ${
                    revenueChange > 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  <TrendingUp className="h-4 w-4" />
                  {Math.abs(revenueChange).toFixed(1)}%
                </span>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={onPeriodChange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Select value={chartType} onValueChange={(value) => setChartType(value as 'line' | 'bar')}>
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="line">Line</SelectItem>
              <SelectItem value="bar">Bar</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={handleExport}>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={400}>
        {chartType === 'line' ? (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis tickFormatter={(value) => `$${value}`} />
            <Tooltip
              formatter={(value: number, name: string) => {
                if (name === 'revenue') return formatCurrency(value);
                return value;
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#8884d8"
              strokeWidth={2}
              name="Revenue"
            />
            <Line
              type="monotone"
              dataKey="orders"
              stroke="#82ca9d"
              strokeWidth={2}
              name="Orders"
            />
          </LineChart>
        ) : (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis tickFormatter={(value) => `$${value}`} />
            <Tooltip
              formatter={(value: number, name: string) => {
                if (name === 'revenue') return formatCurrency(value);
                return value;
              }}
            />
            <Legend />
            <Bar dataKey="revenue" fill="#8884d8" name="Revenue" />
            <Bar dataKey="orders" fill="#82ca9d" name="Orders" />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
