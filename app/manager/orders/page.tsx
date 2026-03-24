'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import OrdersTable from '@/components/manager/OrdersTable';
import { useToast } from '@/components/ui/use-toast';

/**
 * Renders the manager "Orders" page with search, polling, and an orders table.
 *
 * Polls the server every 30 seconds to refresh orders, shows a centered loading placeholder while fetching,
 * and filters displayed orders by customer name, order number, or table number using the search input.
 *
 * @returns The component's JSX element representing the manager orders UI.
 */
export default function ManagerOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const { toast } = useToast();

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      if (!res.ok) throw new Error('Failed to fetch orders');
      const data = await res.json();
      setOrders(data.data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: 'Error',
        description: 'Failed to load orders',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (orderId: string, status: string) => {
    // Implementation for status update (can be passed to table or handled in modal)
    console.log('Update status:', orderId, status);
  };

  const filteredOrders = orders.filter((order: any) =>
    order.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.table?.number?.toString().includes(searchQuery)
  );

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-10 space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            Orders
          </h1>
          <p className="text-slate-500 text-lg mt-1 font-medium">Manage and track customer orders in real-time.</p>
        </div>
        <div className="flex gap-3">
          <Button className="rounded-2xl h-12 px-8 font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
            <Plus className="h-5 w-5 mr-2" />
            New Order
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by customer, order #, or table..."
            className="pl-10 h-12 rounded-xl border-slate-200 bg-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="h-12 rounded-xl border-slate-200 bg-white">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      {/* Orders Table */}
      {isLoading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
          Loading orders...
        </div>
      ) : (
        <OrdersTable
          orders={filteredOrders}
          onViewOrder={(id) => router.push(`/manager/orders/${id}`)}
          onUpdateStatus={handleUpdateStatus}
        />
      )}
    </div>
  );
}
