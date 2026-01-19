/**
 * Menu Related Types
 * 
 * Types for menu items, categories, and related data
 */

export interface Category {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  icon: string | null;
  displayOrder: number;
  isActive: boolean;
  restaurantId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  discountPrice: number | null;
  image: string | null;
  model3dUrl: string | null;
  model3dFormat: string | null;
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  spiceLevel: number | null;
  calories: number | null;
  isAvailable: boolean;
  isFeatured: boolean;
  preparationTime: number | null;
  displayOrder: number;
  tags: string[];
  categoryId: string;
  restaurantId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Extended MenuItem with relations
export interface MenuItemWithRelations extends MenuItem {
  category: Category;
  orderItems?: any[];
}

// Menu item form data
export interface MenuItemFormData {
  name: string;
  description?: string;
  price: number;
  discountPrice?: number;
  image?: string;
  model3dUrl?: string;
  model3dFormat?: string;
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  spiceLevel?: number;
  calories?: number;
  preparationTime?: number;
  categoryId: string;
  tags: string[];
}

// Category with menu items count
export interface CategoryWithCount extends Category {
  _count?: {
    menuItems: number;
  };
  menuItems?: MenuItemWithRelations[];
}

// Menu filters
export interface MenuFilters {
  categoryId?: string;
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  isAvailable?: boolean;
}
