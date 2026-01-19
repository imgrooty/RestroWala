'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface OrdersTableProps {
  orders: any[];
  onViewOrder: (orderId: string) => void;
  onUpdateStatus: (orderId: string, status: string) => void;
}

export default function OrdersTable({ orders, onViewOrder }: OrdersTableProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED': return 'bg-blue-100 text-blue-800';
      case 'PREPARING': return 'bg-purple-100 text-purple-800';
      case 'READY': return 'bg-indigo-100 text-indigo-800';
      case 'SERVED': return 'bg-green-100 text-green-800';
      case 'COMPLETED': return 'bg-slate-100 text-slate-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow>
            <TableHead className="font-bold text-slate-900">Order ID</TableHead>
            <TableHead className="font-bold text-slate-900">Customer</TableHead>
            <TableHead className="font-bold text-slate-900">Table</TableHead>
            <TableHead className="font-bold text-slate-900">Status</TableHead>
            <TableHead className="font-bold text-slate-900">Items</TableHead>
            <TableHead className="font-bold text-slate-900">Total</TableHead>
            <TableHead className="font-bold text-slate-900">Time</TableHead>
            <TableHead className="text-right font-bold text-slate-900">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                No orders found.
              </TableCell>
            </TableRow>
          ) : (
            orders.map((order) => (
              <TableRow key={order.id} className="hover:bg-slate-50 transition-colors">
                <TableCell className="font-medium font-mono text-xs">
                  {order.orderNumber}
                </TableCell>
                <TableCell>
                  <div className="font-bold text-slate-900">{order.customerName || 'Guest'}</div>
                  {order.customerPhone && (
                    <div className="text-xs text-muted-foreground">{order.customerPhone}</div>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-slate-50 font-mono">
                    Table {order.table?.number}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={`border-none ${getStatusColor(order.status)} hover:${getStatusColor(order.status)}`}>
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {order.items.length} items
                  </div>
                  <div className="text-xs text-muted-foreground truncate max-w-[150px]">
                    {order.items.map((i: any) => i.menuItem?.name).join(', ')}
                  </div>
                </TableCell>
                <TableCell className="font-bold">
                  ${order.finalAmount.toFixed(2)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {format(new Date(order.createdAt), 'h:mm a')}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onViewOrder(order.id)}
                    className="h-8 w-8 text-slate-500 hover:text-primary"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
