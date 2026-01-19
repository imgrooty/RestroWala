"use client";

import { useEffect, useState } from 'react';
import { getSubscriptions } from '../actions';
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
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        fetchSubscriptions();
    }, []);

    const fetchSubscriptions = async () => {
        const res = await getSubscriptions();
        if (res.success) {
            setSubscriptions(res.data || []);
        } else {
            toast({ title: "Error", description: res.error, variant: "destructive" });
        }
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
        <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Billing & Plans</h1>
                    <p className="text-slate-500 font-medium">Subscription tiers and revenue attribution</p>
                </div>
                <Badge className="bg-emerald-600 text-white font-bold px-4 py-2 text-lg">
                    <TrendingUp className="mr-2 h-5 w-5" /> {subscriptions.length} Active
                </Badge>
            </div>

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
        </div>
    );
}
