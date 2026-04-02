'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  MapPin,
  User,
  Phone,
  FileText,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import {
  STATUS_INFO,
  getStatusBadgeVariant,
  getStatusColor,
  getNextStatuses
} from '@/lib/orderStateMachine';
import { OrderStatus, UserRole } from '@/types/prisma';
import { format } from 'date-fns';

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [params.id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/orders/${params.id}`);
      if (!res.ok) throw new Error('Failed to fetch order');
      const data = await res.json();
      setOrder(data.data);
    } catch (error) {
      console.error('Error:', error);
      toast({ title: 'Error', description: 'Failed to load order details', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: OrderStatus) => {
    try {
      setUpdating(true);
      const res = await fetch(`/api/orders/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error('Failed to update status');

      const data = await res.json();
      setOrder(data.data);
      toast({ title: 'Success', description: `Order status updated to ${newStatus}` });
    } catch (error) {
      console.error('Error:', error);
      toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' });
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

  if (!order) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold">Order not found</h2>
        <Button onClick={() => router.back()} variant="ghost" className="mt-4">
          <ChevronLeft className="mr-2 h-4 w-4" /> Go Back
        </Button>
      </div>
    );
  }

  const nextStatuses = getNextStatuses(order.status, UserRole.WAITER);

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <Button onClick={() => router.back()} variant="ghost" size="sm">
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>
        <div className="flex gap-2">
          {nextStatuses.map((status) => (
            <Button
              key={status}
              onClick={() => handleStatusChange(status)}
              disabled={updating}
              variant={status === 'READY' || status === 'SERVED' ? 'default' : 'outline'}
              className={status === 'READY' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
            >
              Mark as {STATUS_INFO[status].label}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-2xl font-bold">Order #{order.orderNumber.slice(-6)}</CardTitle>
              <p className="text-sm text-muted-foreground">Placed on {format(new Date(order.createdAt), 'PPP p')}</p>
            </div>
            <Badge variant={getStatusBadgeVariant(order.status)} className={getStatusColor(order.status)}>
              {STATUS_INFO[order.status].label}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Order Items</h3>
              <div className="space-y-3">
                {order.items.map((item: any) => (
                  <div key={item.id} className="flex justify-between items-start">
                    <div className="flex gap-4">
                      <div className="h-12 w-12 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-slate-500">
                        {item.quantity}x
                      </div>
                      <div>
                        <p className="font-medium">{item.menuItem.name}</p>
                        {item.specialInstructions && (
                          <p className="text-xs text-muted-foreground italic">Note: {item.specialInstructions}</p>
                        )}
                      </div>
                    </div>
                    <p className="font-semibold">${item.subtotal.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>${order.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax</span>
                <span>${order.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total</span>
                <span>${order.finalAmount.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">Customer & Table</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-semibold">Table {order.table.number}</p>
                  <p className="text-xs text-muted-foreground">{order.table.floor || 'Main Floor'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-semibold">{order.customerName || 'Guest'}</p>
                  <p className="text-xs text-muted-foreground">Customer</p>
                </div>
              </div>
              {order.customerPhone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-primary" />
                  <p className="text-sm font-semibold">{order.customerPhone}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">Order Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <FileText className="h-4 w-4 text-primary mt-1 shrink-0" />
                <p className="text-sm whitespace-pre-wrap">{order.notes || 'No special notes for this order.'}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
