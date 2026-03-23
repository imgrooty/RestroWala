'use client';

import { useState, useEffect } from 'react';
import { Search, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import MenuCard from '@/components/customer/MenuCard';
import CategoryFilter from '@/components/customer/CategoryFilter';
import ARMenuViewer from '@/components/customer/ARMenuViewer';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/components/ui/use-toast';
import { MenuItemWithRelations, Category } from '@/types/menu';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function MenuPage() {
  const params = useParams();
  const slug = typeof params?.slug === 'string' ? params.slug : '';

  const [menuItems, setMenuItems] = useState<MenuItemWithRelations[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredItems, setFilteredItems] = useState<MenuItemWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [arItem, setArItem] = useState<MenuItemWithRelations | null>(null);

  const { addItem, itemCount } = useCart(slug);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [menuRes, catRes] = await Promise.all([
          fetch(`/api/menu?slug=${slug}`),
          fetch(`/api/categories?slug=${slug}`)
        ]);

        const menuData = await menuRes.json();
        const catData = await catRes.json();

        setMenuItems(menuData.menuItems || []);
        setCategories(catData.categories || []);
        setFilteredItems(menuData.menuItems || []);
      } catch (error) {
        console.error('Error fetching menu data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load menu. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  useEffect(() => {
    let result = menuItems;

    if (selectedCategory) {
      result = result.filter(item => item.categoryId === selectedCategory);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query)
      );
    }

    setFilteredItems(result);
  }, [searchQuery, selectedCategory, menuItems]);

  return (
    <div className="min-h-screen bg-slate-50/30 pb-32">
      {/* Immersive Hero Section */}
      <div className="relative h-[40vh] min-h-[400px] w-full bg-slate-900 overflow-hidden flex items-center justify-center">
        {/* Abstract Background Elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 -left-20 w-80 h-80 bg-primary/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-indigo-500/20 rounded-full blur-[150px] animate-pulse delay-700" />
        </div>

        <div className="relative z-10 text-center space-y-6 px-4 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full text-xs font-bold text-white uppercase tracking-widest animate-in fade-in slide-in-from-bottom-4 duration-500">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400"></span>
            Freshly Prepared Tonight
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none animate-in fade-in slide-in-from-bottom-8 duration-700">
            Culinary <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-400">Masterpieces</span>
          </h1>
          <p className="text-slate-400 text-lg md:text-xl font-medium max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-12 duration-1000">
            A journey of flavors, crafted with passion and served with precision.
          </p>
        </div>

        {/* Glass Sticky Search/Header Bar */}
        <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-slate-50/30 to-transparent z-20 pointer-events-none" />
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-12 relative z-30">
        <div className="bg-white/70 backdrop-blur-2xl border border-white/40 shadow-2xl rounded-[2.5rem] p-6 mb-12 flex flex-col md:flex-row items-center gap-6">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              placeholder="Crave something specific?"
              className="pl-12 h-14 rounded-2xl bg-white border-slate-100 focus-visible:ring-primary text-lg font-medium shadow-inner"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <Link href={`/${slug}/cart`} className="flex-1 md:flex-none">
              <Button className="h-14 px-8 w-full rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black flex gap-3 shadow-xl transition-all hover:scale-105 active:scale-95">
                <ShoppingCart className="h-6 w-6" />
                In Cart
                <Badge className="bg-primary text-slate-900 border-none h-6 min-w-[24px] flex items-center justify-center font-black">
                  {itemCount}
                </Badge>
              </Button>
            </Link>
          </div>
        </div>

        {/* Category Filters - Glass Scrolls */}
        <div className="mb-12">
          <div className="bg-white/40 backdrop-blur-md p-2 rounded-3xl border border-white/40 overflow-x-auto scrollbar-hide">
            <CategoryFilter
              categories={categories}
              activeCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />
          </div>
        </div>

        {/* Menu Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-6">
            <div className="relative">
              <div className="h-20 w-20 rounded-full border-4 border-slate-200" />
              <div className="h-20 w-20 rounded-full border-4 border-primary border-t-transparent animate-spin absolute top-0" />
            </div>
            <p className="text-slate-500 font-black text-lg uppercase tracking-widest animate-pulse">Preheating the oven...</p>
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredItems.map((item, index) => (
              <div key={item.id} className="animate-in fade-in slide-in-from-bottom-12 duration-700" style={{ animationDelay: `${index * 50}ms` }}>
                <MenuCard
                  item={item}
                  onAddToCart={(it) => addItem({
                    menuItemId: it.id,
                    name: it.name,
                    price: it.discountPrice ?? it.price,
                    image: it.image ?? undefined
                  })}
                  onViewAR={(it) => setArItem(it)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-32 bg-white/40 backdrop-blur-md rounded-[3rem] border-2 border-dashed border-white/60">
            <div className="h-24 w-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
              <Search className="h-10 w-10 text-slate-300" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">No flavors found</h3>
            <p className="text-slate-500 mt-2 font-medium">We couldn't find matches for your search. Try another category?</p>
            <Button
              variant="link"
              className="mt-6 font-black text-primary uppercase tracking-widest"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory(null);
              }}
            >
              Clear Vision
            </Button>
          </div>
        )}
      </div>

      {/* AR/3D Modal */}
      {arItem && (
        <ARMenuViewer
          isOpen={!!arItem}
          onClose={() => setArItem(null)}
          modelUrl={arItem.model3dUrl || ''}
          itemName={arItem.name}
          fallbackImage={arItem.image || undefined}
        />
      )}
    </div>
  );
}
