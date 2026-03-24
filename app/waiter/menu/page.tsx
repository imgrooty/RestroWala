'use client';

import { useState, useEffect } from 'react';
import {
  Search,
  CheckCircle2,
  XCircle,
  Loader2,
  UtensilsCrossed,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function WaiterMenuPage() {
  const { toast } = useToast();
  const [items, setItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    fetchMenu();
  }, [categoryFilter]);

  const fetchMenu = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (categoryFilter !== 'all') params.append('categoryId', categoryFilter);
      params.append('isAvailable', 'all'); // Special flag for staff to see all items

      const res = await fetch(`/api/menu?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch menu');
      const data = await res.json();
      setItems(data.data || []);
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Error:', error);
      toast({ title: 'Error', description: 'Failed to load menu items', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const toggleAvailability = async (itemId: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/menu/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable: !currentStatus })
      });
      if (!res.ok) throw new Error('Failed to update availability');

      setItems((prev) => prev.map((item) => item.id === itemId ? { ...item, isAvailable: !currentStatus } : item));
      toast({ title: 'Success', description: `Item is now ${!currentStatus ? 'available' : 'unavailable'}` });
    } catch (error) {
      console.error('Error:', error);
      toast({ title: 'Error', description: 'Failed to update availability', variant: 'destructive' });
    }
  };

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Menu Inventory</h1>
        <p className="text-muted-foreground">Manage item availability for real-time ordering</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search menu items..."
            className="pl-10 h-11 rounded-xl"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[200px] h-11 rounded-xl">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading && items.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <Card key={item.id} className={`overflow-hidden border-2 transition-all ${item.isAvailable ? 'border-slate-100' : 'border-red-100 bg-red-50/10 opacity-75'}`}>
              <CardHeader className="p-0">
                <div className="h-48 w-full bg-slate-100 relative">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-slate-300">
                      <UtensilsCrossed className="h-12 w-12" />
                    </div>
                  )}
                  <div className="absolute top-4 right-4">
                    <Badge className={item.isAvailable ? 'bg-emerald-500' : 'bg-red-500'}>
                      {item.isAvailable ? 'In Stock' : 'Out of Stock'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl font-bold">{item.name}</CardTitle>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{item.category?.name}</p>
                  </div>
                  <p className="text-xl font-black text-primary">${item.price.toFixed(2)}</p>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">{item.description}</p>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-2">
                    {item.isAvailable ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
                    <span className="text-sm font-semibold">{item.isAvailable ? 'Available' : 'Unavailable'}</span>
                  </div>
                  <Switch
                    checked={item.isAvailable}
                    onCheckedChange={() => toggleAvailability(item.id, item.isAvailable)}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && filteredItems.length === 0 && (
        <div className="text-center py-20">
          <UtensilsCrossed className="h-12 w-12 text-slate-200 mx-auto mb-4" />
          <h3 className="text-lg font-bold">No items found</h3>
          <p className="text-muted-foreground">Try adjusting your search or category filter</p>
        </div>
      )}
    </div>
  );
}
