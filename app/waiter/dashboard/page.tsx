'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Users,
  Clock,
  MapPin,
  CheckCircle2,
  CircleDot,
  Bell,
  ChefHat,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useOrders } from '@/hooks/useOrders';
import { useToast } from '@/components/ui/use-toast';
import { TableStatus } from '@/types/prisma';

/**
 * Render the waiter dashboard page showing floor table cards, a real-time orders feed, and summary statistics.
 *
 * The component retrieves the current session for a greeting, fetches table state on mount, and subscribes to auto-refreshing orders.
 *
 * @returns The React element for the waiter dashboard page.
 */
export default function WaiterDashboardPage() {
  const { data: session } = useSession();
  const [tables, setTables] = useState<any[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const { orders } = useOrders({ autoRefresh: true });
  const { toast } = useToast();

  useEffect(() => {
    const fetchTables = async () => {
      try {
        const res = await fetch('/api/tables');
        const data = await res.json();
        setTables(data.tables || []);
      } catch (error) {
        console.error("Error fetching tables:", error);
      } finally {
        setLoadingItems(false);
      }
    };
    fetchTables();
  }, []);

  const updateTableStatus = async (tableId: string, status: TableStatus) => {
    try {
      const res = await fetch(`/api/tables/${tableId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setTables((prev: any[]) => prev.map((t: any) => t.id === tableId ? { ...t, status } : t));
        toast({ title: "Status Updated", description: `Table T-X is now ${status.toLowerCase()}` });
      }
    } catch {
      toast({ title: "Error", description: "System sync failed", variant: "destructive" });
    }
  };

  const activeOrders = orders.filter((o: any) => o.status !== 'COMPLETED' && o.status !== 'CANCELLED');

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-10 space-y-12">
      {/* Immersive Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-100 px-4 py-1.5 rounded-full text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] animate-pulse">
            <CircleDot className="h-3 w-3 fill-current" /> Live Session
          </div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tight">Service <span className="text-primary">Hero</span></h1>
          <p className="text-slate-500 font-medium text-lg">Good evening, {session?.user?.name || 'Partner'}. Ready to serve?</p>
        </div>

        <div className="bg-white p-4 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 flex items-center gap-6">
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Local Time</p>
            <p className="text-xl font-black text-slate-900">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
          <div className="h-10 w-[2px] bg-slate-50" />
          <Button size="icon" className="h-12 w-12 rounded-2xl bg-slate-900 hover:bg-slate-800 shadow-lg">
            <Bell className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* High-Performance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatsCard icon={<Clock className="text-blue-600" />} label="Avg. Latency" value="3.8m" trend="-15%" />
        <StatsCard icon={<ChefHat className="text-orange-600" />} label="In Progress" value={activeOrders.length.toString()} trend="Active" />
        <StatsCard icon={<Users className="text-purple-600" />} label="Floor Load" value={`${tables.filter((t: any) => t.status === 'OCCUPIED').length}/${tables.length}`} trend="Tables" />
        <StatsCard icon={<TrendingUp className="text-emerald-600" />} label="Service Tips" value="$128.00" trend="+34%" green />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
        {/* Floor Orchestration */}
        <div className="xl:col-span-8 space-y-8">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <MapPin className="h-6 w-6 text-indigo-600" />
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Floor Map</h2>
            </div>
            <div className="flex bg-slate-100/50 p-1.5 rounded-2xl border border-slate-200">
              <Button variant="ghost" size="sm" className="rounded-xl font-black text-xs px-6 hover:bg-white hover:shadow-sm">ALL</Button>
              <Button size="sm" className="rounded-xl font-black text-xs px-6 bg-white text-slate-900 shadow-md">MAIN FLOOR</Button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8">
            {tables.map((table: any) => (
              <TableCard
                key={table.id}
                table={table}
                onStatusChange={updateTableStatus}
              />
            ))}
            {loadingItems && [1, 2, 3, 4].map(i => <div key={i} className="h-48 bg-white/50 rounded-[3rem] animate-pulse shadow-sm border border-slate-50" />)}
          </div>
        </div>

        {/* Real-time Intel Feed */}
        <div className="xl:col-span-4 space-y-8">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <Bell className="h-6 w-6 text-orange-600" />
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Intel Feed</h2>
            </div>
          </div>

          <Card className="border-none shadow-2xl shadow-slate-200/60 rounded-[3rem] overflow-hidden bg-white/40 backdrop-blur-2xl border border-white">
            <CardContent className="p-4 space-y-4">
              {activeOrders.length > 0 ? activeOrders.map((order: any) => (
                <div key={order.id} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-50 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all group animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex gap-4 items-center">
                      <div className="h-14 w-14 rounded-[1.25rem] bg-slate-900 flex items-center justify-center font-black text-white group-hover:bg-primary transition-colors text-lg italic shadow-lg">
                        #{order.orderNumber.slice(-3)}
                      </div>
                      <div>
                        <p className="font-black text-xl text-slate-900">Table {order.table.number}</p>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{order.items.length} items • ${order.finalAmount.toFixed(2)}</p>
                      </div>
                    </div>
                    <Badge className={`rounded-full px-4 py-1.5 border-none shadow-md font-black text-[10px] uppercase tracking-wider ${order.status === 'READY' ? 'bg-emerald-500 text-white shadow-emerald-200' :
                      order.status === 'PREPARING' ? 'bg-amber-500 text-white shadow-amber-200' : 'bg-slate-100 text-slate-600'
                      }`}>
                      {order.status}
                    </Badge>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" size="lg" className="flex-1 rounded-2xl font-black text-xs border-2 border-slate-100 hover:bg-slate-50 uppercase tracking-widest">Details</Button>
                    {order.status === 'READY' && (
                      <Button size="lg" className="flex-1 rounded-2xl font-black text-xs bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-emerald-200 uppercase tracking-widest">
                        Serve Now
                      </Button>
                    )}
                  </div>
                </div>
              )) : (
                <div className="py-24 text-center space-y-6">
                  <div className="bg-slate-50 h-20 w-20 rounded-full flex items-center justify-center mx-auto text-slate-200 shadow-inner">
                    <CheckCircle2 className="h-10 w-10" />
                  </div>
                  <div>
                    <p className="font-black text-slate-900 text-lg">Zero Latency</p>
                    <p className="text-sm font-bold text-slate-400">All customers are satisfied.</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatsCard({ icon, label, value, trend, green = false }: any) {
  return (
    <Card className="border-none shadow-sm hover:shadow-md transition-shadow rounded-3xl overflow-hidden bg-white">
      <CardContent className="p-6 flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center shadow-inner">
            {icon}
          </div>
          <Badge className={`rounded-full border-none px-2 py-0.5 text-[10px] uppercase font-black tracking-tighter ${green ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
            {trend}
          </Badge>
        </div>
        <div>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{label}</p>
          <p className="text-3xl font-black text-slate-900 mt-1">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function TableCard({ table, onStatusChange }: { table: any, onStatusChange: (id: string, s: TableStatus) => void }) {
  const statusColors: any = {
    AVAILABLE: 'bg-emerald-100 text-emerald-700 border-emerald-200 shadow-emerald-100',
    OCCUPIED: 'bg-orange-100 text-orange-700 border-orange-200 shadow-orange-100',
    CLEANING: 'bg-blue-100 text-blue-700 border-blue-200 shadow-blue-100',
    RESERVED: 'bg-purple-100 text-purple-700 border-purple-200 shadow-purple-100',
    MAINTENANCE: 'bg-slate-100 text-slate-700 border-slate-200 shadow-slate-100',
  };

  return (
    <div className={`relative p-6 rounded-[2.5rem] border-2 transition-all flex flex-col items-center justify-center gap-2 group hover:-translate-y-1 hover:shadow-xl bg-white ${table.status === 'AVAILABLE' ? 'border-emerald-50 hover:border-emerald-200' :
      table.status === 'OCCUPIED' ? 'border-orange-50 hover:border-orange-200' : 'border-slate-50'
      }`}>
      <div className={`absolute top-4 right-4 h-3 w-3 rounded-full border-2 border-white shadow-sm ${table.status === 'AVAILABLE' ? 'bg-emerald-500' :
        table.status === 'OCCUPIED' ? 'bg-orange-500' : 'bg-slate-300'
        }`} />

      <p className="text-4xl font-black text-slate-800">T{table.number}</p>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{table.capacity} Seats • {table.floor || 'G'}</p>

      <div className="mt-4 flex flex-col w-full gap-2">
        <Badge className={`mx-auto rounded-xl px-3 py-1 border-none shadow-sm font-bold text-[10px] ${statusColors[table.status]}`}>
          {table.status}
        </Badge>

        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {table.status === 'AVAILABLE' ? (
            <Button size="sm" onClick={() => onStatusChange(table.id, 'OCCUPIED' as TableStatus)} className="flex-1 rounded-xl h-8 text-[10px] font-bold bg-orange-600 shadow-orange-200">Seat</Button>
          ) : table.status === 'OCCUPIED' ? (
            <Button size="sm" onClick={() => onStatusChange(table.id, 'CLEANING' as TableStatus)} className="flex-1 rounded-xl h-8 text-[10px] font-bold bg-blue-600 shadow-blue-200">Clear</Button>
          ) : table.status === 'CLEANING' ? (
            <Button size="sm" onClick={() => onStatusChange(table.id, 'AVAILABLE' as TableStatus)} className="flex-1 rounded-xl h-8 text-[10px] font-bold bg-emerald-600 shadow-emerald-200">Ready</Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
