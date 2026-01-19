'use client';

import {
  LayoutDashboard,
  Users,
  Utensils,
  TrendingUp,
  Activity,
  ShieldCheck,
  ChevronRight,
  Settings,
  Package,
  Calendar,
  Server,
  Bell,
  Grid
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default function ManagerDashboardPage() {
  return (
    <div className="space-y-10 p-2">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-[10px] font-black uppercase tracking-widest">
            <ShieldCheck className="h-3 w-3" /> System Administrator
          </div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tight">Mainframe <span className="text-primary italic">OS</span></h1>
          <p className="text-slate-500 font-medium text-lg">Central nervous system for RestroWala operations.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-2xl h-12 px-6 font-black border-2 border-slate-200 hover:bg-slate-50">
            <Server className="mr-2 h-4 w-4" /> System Logs
          </Button>
          <Button className="rounded-2xl h-12 px-6 font-black shadow-xl shadow-primary/20">
            <Activity className="mr-2 h-4 w-4 animate-spin-slow" /> Running
          </Button>
        </div>
      </div>

      {/* Global Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardMetric
          icon={<TrendingUp className="text-primary" />}
          label="Monthly GPV"
          value="$128,450"
          trend="+14.2%"
          color="bg-primary/10"
        />
        <DashboardMetric
          icon={<Users className="text-indigo-600" />}
          label="Staff Utilization"
          value="92.4%"
          trend="High"
          color="bg-indigo-50"
        />
        <DashboardMetric
          icon={<Utensils className="text-emerald-600" />}
          label="Orders Processed"
          value="12,408"
          trend="+5.3%"
          color="bg-emerald-50"
        />
        <DashboardMetric
          icon={<Calendar className="text-amber-600" />}
          label="Active Reservations"
          value="34"
          trend="Now"
          color="bg-amber-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Management Modules */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="h-6 w-6 text-slate-400" />
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Ecosystem Modules</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <ModuleCard
              title="Menu Architect"
              desc="Design immersive dining experiences"
              icon={<Utensils className="h-8 w-8" />}
              href="/manager/menu-management"
              color="bg-primary text-white"
            />
            <ModuleCard
              title="Table Management"
              desc="QR Codes & Seating Layout"
              icon={<Grid className="h-8 w-8" />}
              href="/manager/tables"
              color="bg-emerald-600 text-white"
            />
            <ModuleCard
              title="Staff Orchestra"
              desc="Manage roles and shift permissions"
              icon={<Users className="h-8 w-8" />}
              href="/manager/staff"
              color="bg-slate-900 text-white"
            />
            <ModuleCard
              title="Inventory Control"
              desc="Real-time stock tracking and alerts"
              icon={<Package className="h-8 w-8" />}
              href="/manager/inventory"
              color="bg-indigo-600 text-white"
            />
            <ModuleCard
              title="Global Settings"
              desc="System-wide configuration"
              icon={<Settings className="h-8 w-8" />}
              href="/manager/settings"
              color="bg-slate-100 text-slate-600"
            />
          </div>
        </div>

        {/* System Alerts and Activity */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="h-6 w-6 text-slate-400" />
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Neural Feed</h2>
            </div>
            <Badge variant="outline" className="rounded-full px-4 border-slate-200 font-bold uppercase tracking-tighter text-[10px]">Live</Badge>
          </div>

          <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-slate-200/50 bg-white/50 backdrop-blur-xl overflow-hidden border border-white">
            <CardContent className="p-0">
              <div className="divide-y divide-slate-50">
                <ActivityItem type="ALERT" msg="Storage utilization reaching 85%" time="2m ago" />
                <ActivityItem type="LOG" msg="Cashier 'Alice' session started" time="15m ago" />
                <ActivityItem type="SUCCESS" msg="Inventory reconciliation complete" time="1h ago" />
                <ActivityItem type="LOG" msg="Global menu update deployed" time="4h ago" />
                <ActivityItem type="ALERT" msg="Database backup delayed" time="6h ago" />
              </div>
              <Button variant="ghost" className="w-full h-14 rounded-none text-slate-400 font-bold hover:bg-slate-50/50">
                View Intelligence Center
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function DashboardMetric({ icon, label, value, trend, color }: any) {
  return (
    <Card className="border-none shadow-sm hover:shadow-xl transition-all duration-500 rounded-[2rem] overflow-hidden bg-white/50 backdrop-blur-md border border-white">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className={`h-14 w-14 rounded-2xl flex items-center justify-center ${color} shadow-inner`}>
            {icon}
          </div>
          <Badge className="bg-emerald-50 text-emerald-600 border-none rounded-full px-3 py-1 font-black text-[10px]">
            {trend}
          </Badge>
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{label}</p>
          <p className="text-3xl font-black text-slate-900 tracking-tighter">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function ModuleCard({ title, desc, icon, href, color }: any) {
  return (
    <Link href={href}>
      <Card className="group relative h-48 rounded-[2.5rem] border-none shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden bg-white">
        <CardContent className="p-8 h-full flex flex-col justify-between relative z-10">
          <div className={`h-16 w-16 rounded-[1.5rem] flex items-center justify-center ${color} shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}>
            {icon}
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              {title}
              <ChevronRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary" />
            </h3>
            <p className="text-slate-400 text-sm font-medium">{desc}</p>
          </div>
        </CardContent>
        <div className="absolute top-0 right-0 p-8 text-slate-50 select-none pointer-events-none group-hover:text-primary/5 transition-colors">
          <LayoutDashboard size={120} />
        </div>
      </Card>
    </Link>
  );
}

function ActivityItem({ type, msg, time }: any) {
  const colors: any = {
    ALERT: 'bg-rose-500',
    LOG: 'bg-indigo-500',
    SUCCESS: 'bg-emerald-500'
  };
  return (
    <div className="p-5 flex gap-4 hover:bg-white transition-colors">
      <div className={`h-2 w-2 rounded-full mt-2 shrink-0 ${colors[type]}`} />
      <div className="flex-1">
        <p className="text-sm font-bold text-slate-800 leading-tight">{msg}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className={`text-[10px] font-black uppercase tracking-tighter ${type === 'ALERT' ? 'text-rose-600' : 'text-slate-400'}`}>
            {type}
          </span>
          <span className="text-[10px] font-medium text-slate-300">•</span>
          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">{time}</span>
        </div>
      </div>
    </div>
  );
}
