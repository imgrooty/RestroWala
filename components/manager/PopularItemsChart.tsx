/**
 * Popular Items Chart Component
 * 
 * Chart displaying popular menu items
 * - Bar chart ranking
 * - Order count and revenue
 * - Export functionality
 */

'use client';

import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Download, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PopularItem } from '@/types/analytics';
import Image from 'next/image';

interface PopularItemsChartProps {
  items: PopularItem[];
  isLoading?: boolean;
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1', '#d084d0', '#ffb347'];

export default function PopularItemsChart({
  items,
  isLoading = false,
}: PopularItemsChartProps) {
  const [sortBy, setSortBy] = useState<'orders' | 'revenue'>('orders');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleExport = () => {
    const headers = ['Rank', 'Item Name', 'Order Count', 'Revenue'];
    const rows = sortedItems.map((item, index) => [
      (index + 1).toString(),
      item.name,
      item.orderCount.toString(),
      formatCurrency(item.revenue),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `popular-items-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const sortedItems = [...items]
    .sort((a, b) => {
      if (sortBy === 'orders') {
        return b.orderCount - a.orderCount;
      }
      return b.revenue - a.revenue;
    })
    .slice(0, 10); // Top 10

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border p-6">
        <div className="h-64 flex items-center justify-center">
          <div className="text-muted-foreground">Loading popular items...</div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-lg border p-6">
        <div className="h-64 flex items-center justify-center">
          <div className="text-muted-foreground">No data available</div>
        </div>
      </div>
    );
  }

  const chartData = sortedItems.map((item, index) => ({
    name: item.name.length > 15 ? `${item.name.substring(0, 15)}...` : item.name,
    fullName: item.name,
    orders: item.orderCount,
    revenue: item.revenue,
    rank: index + 1,
  }));

  return (
    <div className="bg-white rounded-lg border p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Popular Menu Items</h3>
        <div className="flex items-center gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'orders' | 'revenue')}
            className="rounded-md border border-input bg-background px-3 py-1 text-sm"
          >
            <option value="orders">Sort by Orders</option>
            <option value="revenue">Sort by Revenue</option>
          </select>
          <Button variant="outline" size="icon" onClick={handleExport}>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis
            dataKey="name"
            type="category"
            width={150}
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            formatter={(value: number, name: string, props: any) => {
              if (name === 'revenue') return formatCurrency(value);
              if (name === 'orders') return `${value} orders`;
              return value;
            }}
            labelFormatter={(label, payload) => {
              if (payload && payload[0]) {
                return payload[0].payload.fullName;
              }
              return label;
            }}
          />
          <Legend />
          <Bar dataKey={sortBy === 'orders' ? 'orders' : 'revenue'} name={sortBy === 'orders' ? 'Orders' : 'Revenue'}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Top Items List */}
      <div className="mt-6 space-y-2">
        <h4 className="text-sm font-semibold mb-3">Top 10 Items</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {sortedItems.map((item, index) => (
            <div
              key={item.id}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50"
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                {index + 1}
              </div>
              {item.image && (
                <div className="flex-shrink-0 w-10 h-10 rounded overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={40}
                    height={40}
                    className="object-cover"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{item.name}</div>
                <div className="text-xs text-muted-foreground">
                  {item.orderCount} orders • {formatCurrency(item.revenue)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
