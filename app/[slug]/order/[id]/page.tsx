'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
    CheckCircle2,
    Clock,
    ChevronLeft,
    Receipt,
    UtensilsCrossed,
    Timer
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useOrders } from '@/hooks/useOrders';
import Link from 'next/link';

export default function OrderTrackingPage() {
    const params = useParams();
    const id = params?.id as string;
    const slug = params?.slug as string;
    const { orders, loading } = useOrders({
        filters: { slug },
        autoRefresh: true
    });
    const [order, setOrder] = useState<any>(null);

    useEffect(() => {
        if (orders && orders.length > 0) {
            const found = orders.find((o: any) => o.id === id);
            if (found) setOrder(found);
        }
    }, [orders, id]);

    if (loading && !order) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!order && !loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50">
                <Card className="max-w-md w-full p-8 text-center border-none shadow-xl">
                    <UtensilsCrossed className="h-16 w-16 mx-auto text-slate-200 mb-6" />
                    <CardTitle className="text-2xl font-bold mb-2">Order Not Found</CardTitle>
                    <p className="text-muted-foreground mb-8">We couldn't find the order you're looking for.</p>
                    <Link href={`/${slug}/menu`}>
                        <Button className="w-full">Return to Menu</Button>
                    </Link>
                </Card>
            </div>
        );
    }

    const statusProgress: Record<string, number> = {
        PENDING: 10,
        CONFIRMED: 30,
        PREPARING: 60,
        READY: 90,
        SERVED: 100,
    };

    const currentProgress = statusProgress[order?.status as keyof typeof statusProgress] || 0;

    return (
        <div className="min-h-screen bg-slate-50 pb-20 font-sans">
            <div className="bg-white border-b px-4 py-6 sticky top-0 z-10">
                <div className="max-w-2xl mx-auto flex items-center gap-4">
                    <Link href={`/${slug}/menu`}>
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <ChevronLeft className="h-6 w-6" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold">Order Tracking</h1>
                        <p className="text-sm text-muted-foreground">Order #{order?.orderNumber?.slice(-6)}</p>
                    </div>
                </div>
            </div>

            <div className="max-w-2xl mx-auto p-4 space-y-6 mt-4">
                {/* Status Card */}
                <Card className="border-none shadow-lg bg-white overflow-hidden rounded-3xl">
                    <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                            <Badge className={`px-4 py-1 rounded-full font-bold ${order?.status === 'READY' ? 'bg-green-100 text-green-700' :
                                order?.status === 'SERVED' ? 'bg-blue-100 text-blue-700' :
                                    'bg-orange-100 text-orange-700'
                                }`}>
                                {order?.status}
                            </Badge>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Timer className="h-4 w-4" />
                                <span className="text-sm font-medium">Est. 15-20 min</span>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-8">
                        <div className="space-y-4">
                            <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
                                <span>Preparing</span>
                                <span>Enjoy!</span>
                            </div>
                            <Progress value={currentProgress} className="h-3 rounded-full bg-slate-100" />
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            <StatusStep
                                icon={<Clock className="h-5 w-5" />}
                                title="Order Received"
                                time="10:30 AM"
                                completed={currentProgress >= 10}
                            />
                            <StatusStep
                                icon={<UtensilsCrossed className="h-5 w-5" />}
                                title="Kitchen is preparing"
                                time="10:35 AM"
                                active={order?.status === 'PREPARING'}
                                completed={currentProgress >= 60}
                            />
                            <StatusStep
                                icon={<CheckCircle2 className="h-5 w-5" />}
                                title="Ready for Pickup/Service"
                                time="Pending"
                                active={order?.status === 'READY'}
                                completed={currentProgress >= 90}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Order Details */}
                <Card className="border-none shadow-lg rounded-3xl overflow-hidden">
                    <CardHeader className="bg-slate-50/50">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Receipt className="h-5 w-5 text-slate-400" />
                            Order Summary
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="space-y-4">
                            {order?.items?.map((item: any) => (
                                <div key={item.id} className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-500">
                                            {item.quantity}x
                                        </div>
                                        <div>
                                            <p className="font-bold">{item.menuItem?.name || item.name}</p>
                                            {item.specialInstructions && (
                                                <p className="text-xs text-muted-foreground">{item.specialInstructions}</p>
                                            )}
                                        </div>
                                    </div>
                                    <p className="font-bold">${((item.priceAtOrder || item.price || 0) * item.quantity).toFixed(2)}</p>
                                </div>
                            ))}
                            <div className="border-t pt-4 mt-6 space-y-2">
                                <div className="flex justify-between text-muted-foreground">
                                    <span>Subtotal</span>
                                    <span>${(order?.totalAmount || 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-xl font-black pt-2">
                                    <span>Total</span>
                                    <span>${(order?.finalAmount || 0).toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function StatusStep({ icon, title, time, completed = false, active = false }: any) {
    return (
        <div className="flex gap-4 items-start">
            <div className={`h-10 w-10 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${completed ? 'bg-green-100 text-green-600' :
                active ? 'bg-orange-100 text-orange-600 animate-pulse' :
                    'bg-slate-100 text-slate-300'
                }`}>
                {icon}
            </div>
            <div className="flex-1 pt-1">
                <div className="flex justify-between items-center">
                    <p className={`font-bold ${completed ? 'text-slate-900' : 'text-slate-400'}`}>{title}</p>
                    <span className="text-xs font-bold text-slate-300">{time}</span>
                </div>
                {active && <p className="text-xs text-orange-600 font-bold uppercase tracking-widest mt-1">In Progress...</p>}
            </div>
        </div>
    );
}
