/**
 * Waiter Orders Page
 * 
 * All orders assigned to waiter
 * - Active orders
 * - Order history
 * - Filter by table and status
 * - Real-time updates
 * - Status change actions
 * - Sound notifications
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Search, Bell, Loader2, CheckCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import OrderCard from '@/components/shared/OrderCard';
import { useSocket } from '@/hooks/useSocket';
import { useToast } from '@/components/ui/use-toast';
import { OrderWithRelations } from '@/types/order';
import { OrderStatus, UserRole } from '@/types/prisma';
import { apiClient } from '@/lib/api-client';

export default function WaiterOrdersPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const { socket } = useSocket();
  const [orders, setOrders] = useState<OrderWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [tableFilter, setTableFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio for notifications
  useEffect(() => {
    audioRef.current = new Audio('/sounds/notification.mp3');
    audioRef.current.volume = 0.5;
  }, []);

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        const params = new URLSearchParams();
        if (statusFilter !== 'all') {
          params.append('status', statusFilter);
        }
        if (tableFilter !== 'all') {
          params.append('tableId', tableFilter);
        }

        const response = await apiClient.get<{ data: OrderWithRelations[] }>(
          `/orders?${params.toString()}`
        );
        setOrders(response.data);
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

    if (session?.user) {
      fetchOrders();
    }
  }, [session, statusFilter, tableFilter, toast]);

  // Listen for real-time order updates
  useEffect(() => {
    if (!socket) return;

    const handleOrderCreated = (data: { order: OrderWithRelations }) => {
      // ... same logic ...
      setOrders((prev) => {
        const exists = prev.find((o) => o.id === data.order.id);
        if (exists) return prev;
        return [data.order, ...prev];
      });

      if (audioRef.current) audioRef.current.play().catch(() => { });
      toast({ title: 'New Order', description: `Order #${data.order.orderNumber} from Table ${data.order.table.number}` });
    };

    const handleOrderStatusChanged = (data: { orderId: string; status: OrderStatus; orderNumber: string; tableNumber: number; }) => {
      setOrders((prev) => prev.map((order) => order.id === data.orderId ? { ...order, status: data.status } : order));
      if (['READY', 'SERVED'].includes(data.status) && audioRef.current) audioRef.current.play().catch(() => { });
      toast({ title: 'Order Updated', description: `Order #${data.orderNumber} (Table ${data.tableNumber}) is now ${data.status}` });
    };

    socket.on('order:created', handleOrderCreated as any);
    socket.on('order:status-changed', handleOrderStatusChanged as any);

    return () => {
      socket.off('order:created', handleOrderCreated as any);
      socket.off('order:status-changed', handleOrderStatusChanged as any);
    };
  }, [socket, orders.length, statusFilter, toast]);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await apiClient.patch(`/orders/${orderId}/status`, { status: newStatus });

      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );

      toast({
        title: 'Success',
        description: 'Order status updated',
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update order status',
        variant: 'destructive',
      });
    }
  };

  const handleViewDetails = (orderId: string) => {
    router.push(`/waiter/orders/${orderId}`);
  };

  // Get unique tables for filter
  const uniqueTables = Array.from(
    new Set(orders.map((order) => order.table.number))
  ).sort((a, b) => a - b);

  // Filter orders by search query
  const filteredOrders = orders.filter((order) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        order.orderNumber.toLowerCase().includes(query) ||
        order.table.number.toString().includes(query) ||
        order.user?.name?.toLowerCase().includes(query) ||
        order.items.some((item) =>
          item.menuItem.name.toLowerCase().includes(query)
        )
      );
    }
    return true;
  });

  // Group orders by status
  const ordersByStatus = {
    PENDING: filteredOrders.filter((o) => o.status === 'PENDING'),
    CONFIRMED: filteredOrders.filter((o) => o.status === 'CONFIRMED'),
    PREPARING: filteredOrders.filter((o) => o.status === 'PREPARING'),
    READY: filteredOrders.filter((o) => o.status === 'READY'),
    SERVED: filteredOrders.filter((o) => o.status === 'SERVED'),
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold">Orders</h1>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Real-time updates enabled
            </span>
          </div>
        </div>
        <p className="text-muted-foreground">Manage orders from your assigned tables</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value as OrderStatus | 'all')}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="CONFIRMED">Confirmed</SelectItem>
            <SelectItem value="PREPARING">Preparing</SelectItem>
            <SelectItem value="READY">Ready</SelectItem>
            <SelectItem value="SERVED">Served</SelectItem>
          </SelectContent>
        </Select>

        <Select value={tableFilter} onValueChange={setTableFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Table" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tables</SelectItem>
            {uniqueTables.map((tableNum) => (
              <SelectItem key={tableNum} value={tableNum.toString()}>
                Table {tableNum}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Orders by Status */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Ready Orders (Priority) */}
          {ordersByStatus.READY.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Ready to Serve ({ordersByStatus.READY.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {ordersByStatus.READY.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    userRole={UserRole.WAITER}
                    onStatusChange={handleStatusChange}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Other Statuses */}
          {['PENDING', 'CONFIRMED', 'PREPARING', 'SERVED'].map((status) => {
            const statusOrders = ordersByStatus[status as keyof typeof ordersByStatus];
            if (statusOrders.length === 0) return null;

            return (
              <div key={status}>
                <h2 className="text-xl font-semibold mb-4 capitalize">
                  {status} ({statusOrders.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {statusOrders.map((order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      userRole={UserRole.WAITER}
                      onStatusChange={handleStatusChange}
                      onViewDetails={handleViewDetails}
                    />
                  ))}
                </div>
              </div>
            );
          })}

          {filteredOrders.length === 0 && (
            <div className="text-center py-20">
              <p className="text-muted-foreground">No orders found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
