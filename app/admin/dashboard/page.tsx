"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShieldCheck, Server, Activity, Users, Lock, ChevronRight, DollarSign } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getAdminMetrics } from "../actions";
import { useToast } from "@/components/ui/use-toast";

export default function AdminDashboardPage() {
    const [metrics, setMetrics] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        fetchMetrics();
    }, []);

    const fetchMetrics = async () => {
        const res = await getAdminMetrics();
        if (res.success) {
            setMetrics(res.data);
        } else {
            toast({ title: "Error", description: res.error, variant: "destructive" });
        }
        setLoading(false);
    };

    if (loading) {
        return <div className="p-8 text-center font-bold text-slate-500">Loading system metrics...</div>;
    }

    return (
        <div className="p-8 space-y-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <Badge variant="outline" className="mb-2 border-indigo-200 bg-indigo-50 text-indigo-700 font-bold tracking-widest uppercase">
                        Root Access
                    </Badge>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tighter">System <span className="text-indigo-600">Overview</span></h1>
                    <p className="text-slate-500 font-medium text-lg mt-2">Global control plane for all restaurant instances.</p>
                </div>
                <div className="flex gap-3">
                    <Button className="bg-indigo-600 hover:bg-indigo-700 font-bold shadow-lg shadow-indigo-200">
                        <Activity className="mr-2 h-4 w-4" /> System Health: {metrics?.systemHealth || "100%"}
                    </Button>
                </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <AdminMetric
                    icon={<Server className="text-indigo-600" />}
                    label="Active Nodes"
                    value={metrics?.activeNodes || 0}
                    sub="Running"
                />
                <AdminMetric
                    icon={<DollarSign className="text-emerald-600" />}
                    label="Total Revenue"
                    value={`$${metrics?.totalRevenue?.toLocaleString() || 0}`}
                    sub="Gross"
                />
                <AdminMetric
                    icon={<Users className="text-blue-600" />}
                    label="Total Users"
                    value={metrics?.totalUsers?.toLocaleString() || 0}
                    sub="Verified"
                />
                <AdminMetric
                    icon={<Lock className="text-rose-600" />}
                    label="Security Events"
                    value={metrics?.securityEvents || 0}
                    sub="Safe"
                />
            </div>

            {/* Control Modules */}
            <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-6 flex items-center gap-2">
                    <ShieldCheck className="h-6 w-6 text-slate-400" /> Administrative Modules
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Link href="/admin/restaurants">
                        <AdminModule title="Multi-Tenancy" desc="Manage restaurant instances and domains." />
                    </Link>
                    <Link href="/admin/users">
                        <AdminModule title="User Management" desc="Global user roles and permissions audit." />
                    </Link>
                    <Link href="/admin/billing">
                        <AdminModule title="Billing & Plans" desc="Subscription tiers and revenue attribution." />
                    </Link>
                    <Link href="/admin/logs">
                        <AdminModule title="System Logs" desc="Raw server logs and error tracking." />
                    </Link>
                    <Link href="/admin/feature-flags">
                        <AdminModule title="Feature Flags" desc="Toggle beta features for specific tenants." />
                    </Link>
                    <Link href="/admin/api-keys">
                        <AdminModule title="API Keys" desc="Manage third-party integration access tokens." />
                    </Link>
                </div>
            </div>
        </div>
    );
}

function AdminMetric({ icon, label, value, sub }: any) {
    return (
        <Card className="border-none shadow-sm drop-shadow-sm hover:shadow-lg transition-all rounded-3xl bg-white">
            <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center">
                        {icon}
                    </div>
                </div>
                <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</p>
                    <div className="flex items-baseline gap-2 mt-1">
                        <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{value}</h3>
                        <span className="text-xs font-bold text-slate-400">{sub}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function AdminModule({ title, desc }: any) {
    return (
        <Card className="group border-none shadow-sm hover:shadow-xl transition-all rounded-[2rem] bg-white cursor-pointer overflow-hidden relative">
            <CardContent className="p-8">
                <h3 className="text-xl font-black text-slate-900 mb-2 flex items-center justify-between">
                    {title}
                    <ChevronRight className="h-5 w-5 text-indigo-200 group-hover:text-indigo-600 transition-colors" />
                </h3>
                <p className="text-slate-400 font-medium text-sm">{desc}</p>
            </CardContent>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
        </Card>
    );
}
