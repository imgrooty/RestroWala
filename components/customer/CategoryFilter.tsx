/**
 * Category Filter Component
 * 
 * Filter menu items by category
 * - Horizontal scrollable tabs
 * - Active category highlighting
 * - Category images/icons
 */

'use client';

import { Category } from '@/types/menu';

interface CategoryFilterProps {
  categories: Category[];
  activeCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
}

export default function CategoryFilter({ categories, activeCategory, onSelectCategory }: CategoryFilterProps) {
  return (
    <div className="flex items-center gap-3 overflow-x-auto pb-4 pt-1 px-4 scrollbar-hide">
      <button
        onClick={() => onSelectCategory(null)}
        className={`whitespace-nowrap px-6 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-300 ${activeCategory === null
          ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20 scale-105'
          : 'bg-white/50 text-slate-500 hover:bg-white hover:text-slate-900 border border-white/40'
          }`}
      >
        All Flavors
      </button>

      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onSelectCategory(category.id)}
          className={`whitespace-nowrap px-6 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-300 flex items-center gap-2 ${activeCategory === category.id
            ? 'bg-primary text-slate-900 shadow-xl shadow-primary/20 scale-105'
            : 'bg-white/50 text-slate-500 hover:bg-white hover:text-slate-900 border border-white/40'
            }`}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}
