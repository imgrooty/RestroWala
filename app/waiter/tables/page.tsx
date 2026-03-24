'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  MapPin,
  Loader2,
  RefreshCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { TableStatus } from '@/types/prisma';

export default function WaiterTablesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [tables, setTables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTables();
    const interval = setInterval(fetchTables, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchTables = async () => {
    try {
      const res = await fetch('/api/tables');
      if (!res.ok) throw new Error('Failed to fetch tables');
      const data = await res.json();
      setTables(data.data || []);
    } catch (error) {
      console.error('Error:', error);
      toast({ title: 'Error', description: 'Failed to load tables', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const updateTableStatus = async (tableId: string, status: TableStatus) => {
    try {
      const res = await fetch(`/api/tables/${tableId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error('Failed to update table status');

      setTables((prev) => prev.map((t) => t.id === tableId ? { ...t, status } : t));
      toast({ title: 'Success', description: `Table status updated to ${status.toLowerCase()}` });
    } catch (error) {
      console.error('Error:', error);
      toast({ title: 'Error', description: 'Failed to update table status', variant: 'destructive' });
    }
  };

  if (loading && tables.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    AVAILABLE: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    OCCUPIED: 'bg-orange-100 text-orange-700 border-orange-200',
    CLEANING: 'bg-blue-100 text-blue-700 border-blue-200',
    RESERVED: 'bg-purple-100 text-purple-700 border-purple-200',
    MAINTENANCE: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Floor Management</h1>
          <p className="text-muted-foreground">Manage table statuses and floor availability</p>
        </div>
        <Button onClick={fetchTables} variant="outline" size="sm">
          <RefreshCcw className="mr-2 h-4 w-4" /> Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {tables.map((table) => (
          <Card key={table.id} className="relative group overflow-hidden border-2 hover:border-primary/50 transition-all">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                   <div className="h-10 w-10 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-lg">
                    T{table.number}
                  </div>
                  <div>
                    <CardTitle className="text-lg">Table {table.number}</CardTitle>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {table.floor || 'G'} • {table.capacity} Seats
                    </p>
                  </div>
                </div>
                <Badge className={statusColors[table.status]}>
                  {table.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2 pt-2">
                {table.status === 'AVAILABLE' && (
                  <Button
                    size="sm"
                    className="flex-1 bg-orange-600 hover:bg-orange-700"
                    onClick={() => updateTableStatus(table.id, 'OCCUPIED' as TableStatus)}
                  >
                    Set Occupied
                  </Button>
                )}
                {table.status === 'OCCUPIED' && (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => updateTableStatus(table.id, 'CLEANING' as TableStatus)}
                  >
                    Set Cleaning
                  </Button>
                )}
                {table.status === 'CLEANING' && (
                  <Button
                    size="sm"
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => updateTableStatus(table.id, 'AVAILABLE' as TableStatus)}
                  >
                    Set Ready
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => router.push(`/waiter/tables/${table.id}`)}
                >
                  Manage
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
