/**
 * Customer Menu Page (After QR Scan)
 * 
 * Menu browsing interface for customers after scanning table QR code
 * - Category filtering
 * - Search functionality
 * - AR/VR 3D model viewer
 * - Add to cart functionality
 * - Responsive grid layout
 * - Mobile-first design
 */

'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { Search, Filter, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import MenuCard from '@/components/customer/MenuCard';
import ARMenuViewer from '@/components/customer/ARMenuViewer';
import { useCart } from '@/hooks/useCart';
import { useDebounce } from '@/hooks/useDebounce';
import { MenuItemWithRelations } from '@/types/menu';
import { apiClient } from '@/lib/api-client';

interface MenuResponse {
  data: MenuItemWithRelations[];
  categories: Array<{
    id: string;
    name: string;
    description: string | null;
    image: string | null;
    icon: string | null;
  }>;
}

export default function MenuPage() {
  const params = useParams();
  const tableId = params.tableId as string;
  
  const { addItem } = useCart();
  const [menuItems, setMenuItems] = useState<MenuItemWithRelations[]>([]);
  const [categories, setCategories] = useState<MenuResponse['categories']>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedARItem, setSelectedARItem] = useState<MenuItemWithRelations | null>(null);
  const [dietaryFilter, setDietaryFilter] = useState<string>('all');
  
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Fetch menu items
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // First, get table info to get restaurant ID
        const tableResponse = await apiClient.get<{ table: { restaurantId: string } }>(`/tables/${tableId}`);
        const restaurantId = tableResponse.table.restaurantId;

        // Build query params
        const params = new URLSearchParams();
        if (selectedCategory) {
          params.append('categoryId', selectedCategory);
        }
        if (debouncedSearch) {
          params.append('search', debouncedSearch);
        }
        if (dietaryFilter === 'vegetarian') {
          params.append('isVegetarian', 'true');
        } else if (dietaryFilter === 'vegan') {
          params.append('isVegan', 'true');
        } else if (dietaryFilter === 'glutenFree') {
          params.append('isGlutenFree', 'true');
        }
        params.append('restaurantId', restaurantId);
        params.append('isAvailable', 'true');

        const response = await apiClient.get<MenuResponse>(`/menu?${params.toString()}`);
        setMenuItems(response.data);
        setCategories(response.categories);
      } catch (err) {
        console.error('Error fetching menu items:', err);
        setError('Failed to load menu items. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    if (tableId) {
      fetchMenuItems();
    }
  }, [tableId, selectedCategory, debouncedSearch, dietaryFilter]);

  const handleAddToCart = (item: MenuItemWithRelations) => {
    addItem({
      menuItemId: item.id,
      name: item.name,
      price: item.discountPrice ?? item.price,
      image: item.image ?? undefined,
    });
  };

  const handleViewAR = (item: MenuItemWithRelations) => {
    if (item.model3dUrl) {
      setSelectedARItem(item);
    }
  };

  const filteredItems = useMemo(() => {
    return menuItems;
  }, [menuItems]);

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold mb-4">Our Menu</h1>
          
          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search menu items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
                onClick={() => setSearchQuery('')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-4">
            {/* Category Filter */}
            <Select
              value={selectedCategory || 'all'}
              onValueChange={(value) => setSelectedCategory(value === 'all' ? null : value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Dietary Filter */}
            <Select
              value={dietaryFilter}
              onValueChange={setDietaryFilter}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Dietary" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Items</SelectItem>
                <SelectItem value="vegetarian">Vegetarian</SelectItem>
                <SelectItem value="vegan">Vegan</SelectItem>
                <SelectItem value="glutenFree">Gluten Free</SelectItem>
              </SelectContent>
            </Select>

            {/* Active Filters Badges */}
            {(selectedCategory || dietaryFilter !== 'all') && (
              <div className="flex items-center gap-2 ml-auto">
                {selectedCategory && (
                  <Badge
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => setSelectedCategory(null)}
                  >
                    {categories.find((c) => c.id === selectedCategory)?.name}
                    <X className="h-3 w-3 ml-1" />
                  </Badge>
                )}
                {dietaryFilter !== 'all' && (
                  <Badge
                    variant="secondary"
                    className="cursor-pointer capitalize"
                    onClick={() => setDietaryFilter('all')}
                  >
                    {dietaryFilter.replace(/([A-Z])/g, ' $1').trim()}
                    <X className="h-3 w-3 ml-1" />
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading menu...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">No menu items found</p>
              {(selectedCategory || searchQuery || dietaryFilter !== 'all') && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedCategory(null);
                    setSearchQuery('');
                    setDietaryFilter('all');
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Results Count */}
            <div className="mb-4 text-sm text-muted-foreground">
              Showing {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
            </div>

            {/* Menu Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredItems.map((item) => (
                <MenuCard
                  key={item.id}
                  item={item}
                  onAddToCart={handleAddToCart}
                  onViewAR={handleViewAR}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* AR Viewer Modal */}
      {selectedARItem && selectedARItem.model3dUrl && (
        <ARMenuViewer
          modelUrl={selectedARItem.model3dUrl}
          modelFormat={selectedARItem.model3dFormat || 'glb'}
          itemName={selectedARItem.name}
          fallbackImage={selectedARItem.image || undefined}
          isOpen={!!selectedARItem}
          onClose={() => setSelectedARItem(null)}
        />
      )}
    </div>
  );
}
