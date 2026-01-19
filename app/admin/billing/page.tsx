"use client";

import { useEffect, useState } from 'react';
import { getSubscriptions, getGlobalPayments, getGlobalBillingMetrics } from '../actions';
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { CreditCard, TrendingUp } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent } from "@/components/ui/card";

export default function BillingPage() {
    const [subscriptions, setSubscriptions] = useState<any[]>([]);
    const [payments, setPayments] = useState<any[]>([]);
    const [metrics, setMetrics] = useState({
        totalRevenue: 0,
        transactionCount: 0,
        avgTicket: 0
    });
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const [subRes, payRes, metricsRes] = await Promise.all([
            getSubscriptions(),
            getGlobalPayments(),
            getGlobalBillingMetrics()
        ]);

        if (subRes.success) setSubscriptions(subRes.data || []);
        else toast({ title: "Error", description: subRes.error, variant: "destructive" });

        if (payRes.success) setPayments(payRes.data || []);
        else toast({ title: "Error", description: payRes.error, variant: "destructive" });

        if (metricsRes.success) setMetrics(metricsRes.data);
        else toast({ title: "Error", description: metricsRes.error, variant: "destructive" });

        setLoading(false);
    };

    const getTierColor = (tier: string) => {
        switch (tier) {
            case 'FREE': return 'bg-slate-500';
            case 'PRO': return 'bg-indigo-600';
            case 'ENTERPRISE': return 'bg-purple-600';
            default: return 'bg-slate-500';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE': return 'bg-emerald-500';
            case 'TRIALING': return 'bg-blue-500';
            case 'PAST_DUE': return 'bg-amber-500';
            case 'CANCELED': return 'bg-rose-500';
            default: return 'bg-slate-500';
        }
    };

    return (
        <div className="p-8 space-y-12">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Billing & Plans</h1>
                    <p className="text-slate-500 font-medium">Subscription tiers and revenue attribution</p>
                </div>
                <Badge className="bg-emerald-600 text-white font-bold px-4 py-2 text-lg">
                    <TrendingUp className="mr-2 h-5 w-5" /> {subscriptions.length} Active
                </Badge>
            </div>

            <section className="space-y-6">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <TrendingUp className="h-6 w-6 text-emerald-500" /> Active Subscriptions
                </h2>
                <Card className="border-none shadow-sm rounded-[2rem] overflow-hidden bg-white">
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-slate-50">
                                <TableRow>
                                    <TableHead className="font-black text-slate-400 uppercase tracking-widest pl-8 py-6">Restaurant</TableHead>
                                    <TableHead className="font-black text-slate-400 uppercase tracking-widest">Plan</TableHead>
                                    <TableHead className="font-black text-slate-400 uppercase tracking-widest">Status</TableHead>
                                    <TableHead className="font-black text-slate-400 uppercase tracking-widest">Start Date</TableHead>
                                    <TableHead className="font-black text-slate-400 uppercase tracking-widest text-right pr-8">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    [1, 2, 3].map((i) => (
                                        <TableRow key={i}>
                                            <TableCell colSpan={5} className="h-24 text-center">
                                                <div className="h-4 w-1/2 bg-slate-100 rounded animate-pulse mx-auto" />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : subscriptions.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-32 text-center text-slate-400 font-medium">
                                            No subscriptions found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    subscriptions.map((sub) => (
                                        <TableRow key={sub.id} className="hover:bg-slate-50/50 transition-colors">
                                            <TableCell className="pl-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                                        <CreditCard className="h-6 w-6" />
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-slate-900 text-lg">{sub.restaurant?.name || 'Unassigned'}</p>
                                                        <p className="text-xs font-bold text-slate-400">{sub.restaurant?.slug || 'N/A'}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={`${getTierColor(sub.tier)} text-white border-none px-3 py-1 font-bold`}>
                                                    {sub.tier}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={`${getStatusColor(sub.status)} text-white border-none px-3 py-1`}>
                                                    {sub.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <p className="font-bold text-slate-700">
                                                    {new Date(sub.startDate).toLocaleDateString()}
                                                </p>
                                            </TableCell>
                                            <TableCell className="text-right pr-8">
                                                <Button variant="ghost" className="text-indigo-600 hover:text-indigo-700 font-bold">
                                                    Manage
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </section>

            {/* Revenue Tracking Section */}
            <section className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <TrendingUp className="h-6 w-6 text-indigo-500" /> Revenue Tracking
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="border-none shadow-sm rounded-3xl bg-white p-6">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Total Volume</p>
                        <h3 className="text-3xl font-black text-slate-900">
                            ${metrics.totalRevenue.toLocaleString()}
                        </h3>
                    </Card>
                    <Card className="border-none shadow-sm rounded-3xl bg-white p-6">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Transaction Count</p>
                        <h3 className="text-3xl font-black text-slate-900">{metrics.transactionCount}</h3>
                    </Card>
                    <Card className="border-none shadow-sm rounded-3xl bg-white p-6">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Avg. Ticket</p>
                        <h3 className="text-3xl font-black text-slate-900">
                            ${metrics.avgTicket.toFixed(2)}
                        </h3>
                    </Card>
                </div>

                <Card className="border-none shadow-sm rounded-[2rem] overflow-hidden bg-white mt-6">
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-slate-50">
                                <TableRow>
                                    <TableHead className="font-black text-slate-400 uppercase tracking-widest pl-8 py-6">Transaction ID</TableHead>
                                    <TableHead className="font-black text-slate-400 uppercase tracking-widest">Restaurant</TableHead>
                                    <TableHead className="font-black text-slate-400 uppercase tracking-widest">Amount</TableHead>
                                    <TableHead className="font-black text-slate-400 uppercase tracking-widest">Method</TableHead>
                                    <TableHead className="font-black text-slate-400 uppercase tracking-widest">Status</TableHead>
                                    <TableHead className="font-black text-slate-400 uppercase tracking-widest text-right pr-8">Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    [1, 2, 3].map((i) => (
                                        <TableRow key={i}>
                                            <TableCell colSpan={6} className="h-20 text-center">
                                                <div className="h-4 w-3/4 bg-slate-100 rounded animate-pulse mx-auto" />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : payments.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-32 text-center text-slate-400 font-medium">
                                            No transactions recorded.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    payments.map((payment) => (
                                        <TableRow key={payment.id} className="hover:bg-slate-50/50 transition-colors">
                                            <TableCell className="pl-8 py-4 font-mono text-xs text-slate-500 uppercase">
                                                {payment.transactionId || payment.id.substring(0, 12)}
                                            </TableCell>
                                            <TableCell>
                                                <p className="font-bold text-slate-700">{payment.order?.restaurant?.name || 'Unknown'}</p>
                                            </TableCell>
                                            <TableCell className="font-black text-slate-900">
                                                ${payment.amount.toFixed(2)}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="font-bold text-slate-500 border-slate-200">
                                                    {payment.method}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={`${payment.status === 'COMPLETED' ? 'bg-emerald-500' : 'bg-amber-500'} text-white border-none`}>
                                                    {payment.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right pr-8 text-slate-500 text-sm font-medium">
                                                {new Date(payment.createdAt).toLocaleDateString()}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </section>
        </div>
    );
}
