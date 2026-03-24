'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
    DollarSign,
    CheckCircle2,
    Receipt,
    User,
    ArrowRight,
    Sparkles,
    Table as TableIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useOrders } from '@/hooks/useOrders';
import { useToast } from '@/components/ui/use-toast';

export default function CashierDashboardPage() {
    const { data: session } = useSession();
    const [tables, setTables] = useState<any[]>([]);
    const [loadingTables, setLoadingTables] = useState(true);
    const { orders, refetch: refetchOrders } = useOrders({ autoRefresh: true });
    const { toast } = useToast();

    useEffect(() => {
        fetchTables();
    }, []);

    const fetchTables = async () => {
        try {
            const res = await fetch('/api/tables');
            const data = await res.json();
            setTables(data.tables || []);
        } catch (error) {
            console.error("Error fetching tables:", error);
        } finally {
            setLoadingTables(false);
        }
    };

    const handleProcessPayment = async (orderId: string, tableId: string) => {
        try {
            // 1. Update order status to COMPLETED
            const orderRes = await fetch(`/api/orders/${orderId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'COMPLETED' })
            });

            if (!orderRes.ok) throw new Error("Failed to update order");

            // 2. Update table status to CLEANING
            const tableRes = await fetch(`/api/tables/${tableId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'CLEANING' })
            });

            if (!tableRes.ok) throw new Error("Failed to update table");

            toast({
                title: "Payment Processed",
                description: "Order completed and table marked for cleaning.",
            });

            refetchOrders();
            fetchTables();
        } catch {
            toast({
                title: "Error",
                description: "Something went wrong. Please try again.",
                variant: "destructive"
            });
        }
    };

    const handleMarkAvailable = async (tableId: string) => {
        try {
            const res = await fetch(`/api/tables/${tableId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'AVAILABLE' })
            });

            if (res.ok) {
                toast({ title: "Table Available", description: "Table is now ready for new customers." });
                fetchTables();
            }
        } catch {
            toast({ title: "Error", description: "Could not update table.", variant: "destructive" });
        }
    };

    const pendingPayments = orders.filter(o => o.status === 'SERVED');

    return (
        <div className="min-h-screen bg-slate-50/50 p-6 md:p-10 space-y-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Cashier Station</h1>
                    <p className="text-slate-500 text-lg mt-1 font-medium">Process payments and manage checkout flow.</p>
                </div>
                <div className="flex items-center gap-4 bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
                    <div className="h-10 w-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
                        <User className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-left">Cashier</p>
                        <p className="text-sm font-black text-slate-900">{session?.user?.name || 'Shift Lead'}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                {/* Payment Queue */}
                <div className="xl:col-span-2 space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                            <Receipt className="h-6 w-6 text-purple-600" />
                            Checkout Queue
                        </h2>
                        <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-none px-4 py-1.5 rounded-full font-bold">
                            {pendingPayments.length} Pending
                        </Badge>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {pendingPayments.length > 0 ? pendingPayments.map((order) => (
                            <Card key={order.id} className="border-none shadow-sm hover:shadow-md transition-all rounded-3xl overflow-hidden bg-white">
                                <CardContent className="p-6">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                        <div className="flex items-center gap-6">
                                            <div className="h-16 w-16 rounded-2xl bg-slate-50 flex flex-col items-center justify-center border border-slate-100">
                                                <span className="text-[10px] font-black text-slate-400">TABLE</span>
                                                <span className="text-2xl font-black text-slate-900">{order.table.number}</span>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <p className="font-bold text-slate-900">Order #{order.orderNumber.slice(-6)}</p>
                                                    <Badge variant="outline" className="text-[10px] font-black uppercase text-slate-400">SERVED</Badge>
                                                </div>
                                                <p className="text-sm text-slate-400 font-medium">
                                                    {order.items.length} items • {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-8">
                                            <div className="text-right">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount Due</p>
                                                <p className="text-2xl font-black text-slate-900">${order.finalAmount.toFixed(2)}</p>
                                            </div>
                                            <Button
                                                className="rounded-2xl h-14 px-8 font-black bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200 group"
                                                onClick={() => handleProcessPayment(order.id, order.tableId)}
                                            >
                                                Process Payment
                                                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )) : (
                            <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-100">
                                <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle2 className="h-8 w-8 text-slate-200" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-400">No pending payments</h3>
                                <p className="text-sm text-slate-300">All served orders have been processed.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Table Overview Sidebar */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                            <TableIcon className="h-6 w-6 text-blue-600" />
                            Table Map
                        </h2>
                    </div>

                    <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[2.5rem] bg-white p-6">
                        <div className="grid grid-cols-2 gap-4">
                            {tables.map((table) => (
                                <div
                                    key={table.id}
                                    className={`p-4 rounded-2xl border-2 transition-all text-center ${table.status === 'AVAILABLE' ? 'border-emerald-50 bg-emerald-50/30' :
                                        table.status === 'OCCUPIED' ? 'border-orange-50 bg-orange-50/30' :
                                            table.status === 'CLEANING' ? 'border-blue-50 bg-blue-50/30' :
                                                'border-slate-50 bg-slate-50/30'
                                        }`}
                                >
                                    <p className="text-xs font-black text-slate-400 mb-1">T{table.number}</p>
                                    <p className={`text-[10px] font-black uppercase tracking-tighter mb-2 ${table.status === 'AVAILABLE' ? 'text-emerald-600' :
                                        table.status === 'OCCUPIED' ? 'text-orange-600' :
                                            table.status === 'CLEANING' ? 'text-blue-600' :
                                                'text-slate-400'
                                        }`}>
                                        {table.status}
                                    </p>
                                    {table.status === 'CLEANING' && (
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-6 w-full text-[8px] font-black bg-white/50 hover:bg-white text-blue-600 rounded-lg p-0"
                                            onClick={() => handleMarkAvailable(table.id)}
                                        >
                                            <Sparkles className="h-3 w-3 mr-1" />
                                            FREE
                                        </Button>
                                    )}
                                </div>
                            ))}
                            {loadingTables && [1, 2, 3, 4].map(i => (
                                <div key={i} className="h-16 bg-slate-50 rounded-2xl animate-pulse" />
                            ))}
                        </div>
                    </Card>

                    {/* Quick Stats Sidebar */}
                    <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[2.5rem] bg-gradient-to-br from-indigo-600 to-purple-700 p-8 text-white mt-10">
                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                            <DollarSign className="h-5 w-5" />
                            Today's Take
                        </h3>
                        <div className="space-y-6">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Total Revenue</p>
                                <p className="text-4xl font-black mt-1">$1,284.50</p>
                            </div>
                            <div className="pt-6 border-t border-white/10 flex justify-between">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Cash</p>
                                    <p className="text-xl font-bold">$420.00</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Digital</p>
                                    <p className="text-xl font-bold">$864.50</p>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
