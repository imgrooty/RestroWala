/**
 * Menu Card Component
 * 
 * Display single menu item in grid/list
 * - Item image
 * - Name, price, description
 * - Dietary badges (veg, vegan, gluten-free, etc.)
 * - Add to cart button
 * - AR/3D view button
 * - Spice level indicator
 * - Tags (popular, chef-special, etc.)
 */

'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Plus, Eye, ChefHat, Flame, Leaf, Wheat, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MenuItemWithRelations } from '@/types/menu';
import { useToast } from '@/components/ui/use-toast';

interface MenuCardProps {
  item: MenuItemWithRelations;
  onAddToCart: (item: MenuItemWithRelations) => void;
  onViewAR: (item: MenuItemWithRelations) => void;
}

export default function MenuCard({ item, onAddToCart, onViewAR }: MenuCardProps) {
  const [imageError, setImageError] = useState(false);
  const { toast } = useToast();

  const handleAddToCart = () => {
    onAddToCart(item);
    toast({
      title: 'Added to cart',
      description: `${item.name} has been added to your cart`,
    });
  };

  const displayPrice = item.discountPrice ?? item.price;
  const hasDiscount = item.discountPrice && item.discountPrice < item.price;

  const getSpiceLevelColor = (level: number) => {
    if (level === 0) return 'text-slate-400';
    if (level <= 2) return 'text-amber-500';
    if (level <= 4) return 'text-orange-500';
    return 'text-rose-500';
  };

  const getSpiceLevelText = (level: number) => {
    if (level === 0) return 'Mild';
    if (level === 1) return 'Mild+';
    if (level === 2) return 'Medium';
    if (level === 3) return 'Medium+';
    if (level === 4) return 'Hot';
    return 'Extreme';
  };

  return (
    <div className="group relative bg-white rounded-[2rem] shadow-sm hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 overflow-hidden border border-slate-100 flex flex-col h-full">
      {/* Image Container with Glass Overlays */}
      <div className="relative w-full aspect-[4/3] overflow-hidden bg-slate-100">
        {item.image && !imageError ? (
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-700"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
            <ChefHat className="h-16 w-16 text-slate-300" />
          </div>
        )}

        {/* Dynamic Badge Overlays */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
          {item.isFeatured && (
            <Badge className="bg-amber-400/90 backdrop-blur-md text-slate-900 border-none px-3 py-1 font-bold text-[10px] uppercase tracking-wider rounded-full shadow-lg">
              Featured
            </Badge>
          )}
          {item.tags.includes('popular') && (
            <Badge className="bg-white/90 backdrop-blur-md text-slate-900 border-none px-3 py-1 font-bold text-[10px] uppercase tracking-wider rounded-full shadow-lg">
              Popular
            </Badge>
          )}
          {item.tags.includes('chef-special') && (
            <Badge className="bg-indigo-600/90 backdrop-blur-md text-white border-none px-3 py-1 font-bold text-[10px] uppercase tracking-wider rounded-full shadow-lg">
              Chef's Pick
            </Badge>
          )}
        </div>

        {/* 3D/AR Trigger - Glassmorphism */}
        {item.model3dUrl && (
          <div className="absolute top-4 right-4 z-10 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
            <Button
              variant="secondary"
              size="icon"
              className="h-10 w-10 bg-white/40 backdrop-blur-xl hover:bg-white/60 border border-white/40 shadow-2xl rounded-2xl"
              onClick={() => onViewAR(item)}
            >
              <Eye className="h-5 w-5 text-slate-900" />
            </Button>
          </div>
        )}

        {/* Dietary Info - Bottom Glass Row */}
        <div className="absolute bottom-4 left-4 flex gap-1.5 z-10">
          {item.isVegetarian && (
            <div className="bg-emerald-500/90 backdrop-blur-md p-1.5 rounded-xl shadow-lg border border-emerald-400/20" title="Vegetarian">
              <Leaf className="h-3.5 w-3.5 text-white" />
            </div>
          )}
          {item.isGlutenFree && (
            <div className="bg-amber-500/90 backdrop-blur-md p-1.5 rounded-xl shadow-lg border border-amber-400/20" title="Gluten Free">
              <Wheat className="h-3.5 w-3.5 text-white" />
            </div>
          )}
        </div>

        {/* Spice Level Overlay */}
        {item.spiceLevel !== null && item.spiceLevel !== undefined && item.spiceLevel > 0 && (
          <div className="absolute bottom-4 right-4 z-10">
            <div className="bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full shadow-lg border border-white/40 flex items-center gap-1">
              <Flame className={`h-3 w-3 ${getSpiceLevelColor(item.spiceLevel)}`} />
              <span className="text-[10px] font-black uppercase text-slate-600 tracking-tighter">
                {getSpiceLevelText(item.spiceLevel)}
              </span>
            </div>
          </div>
        )}

        {/* Gradient Overlay for Text Readability */}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
      </div>

      {/* Content Area */}
      <div className="p-6 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-black text-xl text-slate-900 tracking-tight leading-none group-hover:text-primary transition-colors">
            {item.name}
          </h3>
        </div>

        {item.description && (
          <p className="text-sm text-slate-500 font-medium mb-6 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        )}

        <div className="mt-auto flex items-end justify-between">
          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 tracking-tighter">
                ${displayPrice.toFixed(2)}
              </span>
              {hasDiscount && (
                <span className="text-sm text-slate-400 line-through font-bold">
                  ${item.price.toFixed(2)}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {item.preparationTime && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {item.preparationTime}m
                </span>
              )}
              {item.calories && (
                <span className="flex items-center gap-1">
                  ⚡ {item.calories} cal
                </span>
              )}
            </div>
          </div>

          <Button
            onClick={handleAddToCart}
            className="rounded-2xl h-12 px-6 font-black bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95 disabled:grayscale"
            disabled={!item.isAvailable}
          >
            {item.isAvailable ? (
              <>
                <Plus className="h-5 w-5 mr-2" />
                Add to Cart
              </>
            ) : (
              'Sold Out'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
