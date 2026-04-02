'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  MapPin,
  Users,
  Loader2,
  CheckCircle2,
  History,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { TableStatus } from '@/types/prisma';
import { format } from 'date-fns';

export default function TableDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const [table, setTable] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchTable();
  }, [params.id]);

  const fetchTable = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/tables/${params.id}`);
      if (!res.ok) throw new Error('Failed to fetch table');
      const data = await res.json();
      setTable(data.table);
    } catch (error) {
      console.error('Error:', error);
      toast({ title: 'Error', description: 'Failed to load table details', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const updateTableStatus = async (status: TableStatus) => {
    try {
      setUpdating(true);
      const res = await fetch(`/api/tables/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error('Failed to update table status');

      const data = await res.json();
      setTable(data.table);
      toast({ title: 'Success', description: `Table status updated to ${status.toLowerCase()}` });
    } catch (error) {
      console.error('Error:', error);
      toast({ title: 'Error', description: 'Failed to update table status', variant: 'destructive' });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!table) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold">Table not found</h2>
        <Button onClick={() => router.back()} variant="ghost" className="mt-4">
          <ChevronLeft className="mr-2 h-4 w-4" /> Go Back
        </Button>
      </div>
    );
  }

  const activeOrders = table.orders || [];

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <Button onClick={() => router.back()} variant="ghost" size="sm">
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to Floor
        </Button>
        <div className="flex gap-2">
          {table.status !== 'AVAILABLE' && (
            <Button
              variant="outline"
              onClick={() => updateTableStatus('AVAILABLE' as TableStatus)}
              disabled={updating}
              className="bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
            >
              Mark Available
            </Button>
          )}
          {table.status !== 'OCCUPIED' && (
             <Button
              variant="outline"
              onClick={() => updateTableStatus('OCCUPIED' as TableStatus)}
              disabled={updating}
              className="bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100"
            >
              Mark Occupied
            </Button>
          )}
          {table.status !== 'CLEANING' && (
            <Button
              variant="outline"
              onClick={() => updateTableStatus('CLEANING' as TableStatus)}
              disabled={updating}
              className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
            >
              Mark Cleaning
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-3xl font-black">Table {table.number}</CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  <MapPin className="h-4 w-4" /> Floor: {table.floor || 'G'} • Capacity: {table.capacity} Persons
                </CardDescription>
              </div>
              <Badge className={`text-sm px-3 py-1 ${
                table.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-700' :
                table.status === 'OCCUPIED' ? 'bg-orange-100 text-orange-700' :
                'bg-blue-100 text-blue-700'
              }`}>
                {table.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <History className="h-5 w-5 text-primary" /> Active Orders
              </h3>
              {activeOrders.length > 0 ? (
                <div className="space-y-4">
                  {activeOrders.map((order: any) => (
                    <div
                      key={order.id}
                      className="p-4 rounded-xl border border-slate-100 bg-slate-50 hover:border-primary/20 transition-all cursor-pointer"
                      onClick={() => router.push(`/waiter/orders/${order.id}`)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-black">Order #{order.orderNumber.slice(-6)}</p>
                          <p className="text-xs text-muted-foreground">{format(new Date(order.createdAt), 'PPP p')}</p>
                        </div>
                        <Badge variant="outline" className="bg-white">
                          {order.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center mt-3">
                        <div className="flex gap-1">
                          {order.items.slice(0, 3).map((item: any) => (
                            <Badge key={item.id} variant="secondary" className="text-[10px] font-medium">
                              {item.quantity}x {item.menuItem.name}
                            </Badge>
                          ))}
                          {order.items.length > 3 && (
                            <Badge variant="secondary" className="text-[10px] font-medium">+{order.items.length - 3} more</Badge>
                          )}
                        </div>
                        <p className="font-bold text-primary">${order.finalAmount.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                  <Info className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-500 font-medium">No active orders for this table</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Quick Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Users className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-semibold">{table.capacity} Persons</p>
                  <p className="text-xs text-muted-foreground">Maximum Capacity</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-semibold">{table.location || 'Central Area'}</p>
                  <p className="text-xs text-muted-foreground">Location</p>
                </div>
              </div>
              {table.waiter && (
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-sm font-semibold">{table.waiter.name}</p>
                    <p className="text-xs text-muted-foreground">Assigned Waiter</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Button
            className="w-full h-12 rounded-2xl font-black bg-slate-900 shadow-xl"
            onClick={() => router.push(`/waiter/orders/new?tableId=${table.id}`)}
            disabled={table.status === 'CLEANING' || table.status === 'MAINTENANCE'}
          >
            Create New Order
          </Button>
        </div>
      </div>
    </div>
  );
}
