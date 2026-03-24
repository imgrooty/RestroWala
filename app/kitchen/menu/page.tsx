/**
 * Kitchen Menu Availability Page
 *
 * Allows kitchen staff to toggle menu item availability in real time.
 * Items that are unavailable are visually dimmed and marked as "Sold Out".
 * Staff can also search and filter by category.
 */

'use client';

import { useCallback, useEffect, useState } from 'react';
import { Search, RefreshCw, UtensilsCrossed, CheckCircle2, XCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

interface Category {
  id: string;
  name: string;
}

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  isAvailable: boolean;
  isVegetarian: boolean;
  isVegan: boolean;
  preparationTime?: number;
  category: Category;
  image?: string;
}

export default function KitchenMenuPage() {
  const { toast } = useToast();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [toggling, setToggling] = useState<Set<string>>(new Set());

  const fetchMenu = useCallback(async () => {
    setIsLoading(true);
    try {
      const [availRes, unavailRes] = await Promise.all([
        fetch('/api/menu'),
        fetch('/api/menu?isAvailable=false'),
      ]);
      const [availData, unavailData] = await Promise.all([
        availRes.json(),
        unavailRes.json(),
      ]);
      const allItems: MenuItem[] = [
        ...(availData.data ?? []),
        ...(unavailData.data ?? []),
      ];
      // Dedupe by id
      const seen = new Set<string>();
      const deduped = allItems.filter((i) => {
        if (seen.has(i.id)) return false;
        seen.add(i.id);
        return true;
      });
      setItems(deduped);
      setCategories(availData.categories ?? []);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to load menu items',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  const toggleAvailability = async (item: MenuItem) => {
    setToggling((prev) => new Set(prev).add(item.id));
    try {
      const res = await fetch(`/api/menu/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable: !item.isAvailable }),
      });
      if (!res.ok) throw new Error('Failed to update');
      const data = await res.json();
      const updated = data.data as MenuItem;
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, isAvailable: updated.isAvailable } : i))
      );
      toast({
        title: updated.isAvailable ? 'Item Available' : 'Item Sold Out',
        description: `${item.name} is now marked as ${updated.isAvailable ? 'available' : 'sold out'}.`,
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to update item availability',
        variant: 'destructive',
      });
    } finally {
      setToggling((prev) => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    }
  };

  const filtered = items.filter((item) => {
    const matchSearch =
      !searchQuery ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory =
      selectedCategory === 'all' || item.category?.id === selectedCategory;
    return matchSearch && matchCategory;
  });

  const available = filtered.filter((i) => i.isAvailable);
  const soldOut = filtered.filter((i) => !i.isAvailable);

  return (
    <div className="min-h-screen bg-slate-900 p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <UtensilsCrossed className="h-5 w-5 text-orange-400" />
            <h1 className="text-2xl font-black text-white tracking-tight">
              Menu Availability
            </h1>
          </div>
          <p className="text-slate-400 text-sm">
            {available.length} available · {soldOut.length} sold out
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchMenu}
          disabled={isLoading}
          className="text-slate-400 hover:text-white self-start md:self-auto"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Search + Category filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-orange-500"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
              selectedCategory === 'all'
                ? 'bg-orange-500 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-orange-500 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-32">
          <div className="h-16 w-16 border-4 border-slate-700 border-t-orange-500 rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-32 border-2 border-dashed border-slate-800 rounded-3xl">
          <UtensilsCrossed className="h-10 w-10 text-slate-700 mx-auto mb-3" />
          <p className="text-slate-600 font-semibold">No items found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className={`bg-slate-800 rounded-2xl border p-4 flex flex-col gap-3 transition-opacity ${
                item.isAvailable
                  ? 'border-slate-700 opacity-100'
                  : 'border-slate-700/50 opacity-60'
              }`}
            >
              {/* Item image or placeholder */}
              {item.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-32 object-cover rounded-xl"
                />
              ) : (
                <div className="w-full h-24 bg-slate-700/50 rounded-xl flex items-center justify-center">
                  <UtensilsCrossed className="h-8 w-8 text-slate-600" />
                </div>
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-white text-sm leading-snug">{item.name}</h3>
                  {!item.isAvailable && (
                    <Badge className="bg-red-500/20 text-red-300 border-red-500/30 text-[10px] font-bold shrink-0">
                      Sold Out
                    </Badge>
                  )}
                </div>
                <p className="text-slate-400 text-xs mt-0.5">{item.category?.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-orange-400 font-bold text-sm">
                    ₹{item.price.toFixed(2)}
                  </span>
                  {item.preparationTime && (
                    <span className="text-slate-500 text-xs">~{item.preparationTime}m</span>
                  )}
                  {item.isVegetarian && (
                    <span className="text-emerald-400 text-xs font-bold">Veg</span>
                  )}
                </div>
              </div>

              {/* Toggle button */}
              <Button
                size="sm"
                disabled={toggling.has(item.id)}
                onClick={() => toggleAvailability(item)}
                className={`w-full font-bold text-xs ${
                  item.isAvailable
                    ? 'bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30'
                    : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30'
                }`}
                variant="ghost"
              >
                {toggling.has(item.id) ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin mr-1" />
                ) : item.isAvailable ? (
                  <XCircle className="h-3.5 w-3.5 mr-1" />
                ) : (
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                )}
                {item.isAvailable ? 'Mark Sold Out' : 'Mark Available'}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
