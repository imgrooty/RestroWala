/**
 * Inventory Related Types
 * 
 * Types for inventory management
 */

import { Inventory as PrismaInventory, InventoryUnit } from '@prisma/client';

// Extended Inventory with relations
export interface InventoryWithRelations extends PrismaInventory {
  menuItems?: any[];
}

// Create/Update inventory data
export interface InventoryFormData {
  name: string;
  description?: string;
  sku?: string;
  quantity: number;
  unit: InventoryUnit;
  minQuantity: number;
  maxQuantity?: number;
  costPerUnit: number;
  supplier?: string;
  supplierContact?: string;
  expiryDate?: Date;
  location?: string;
}

// Low stock alert
export interface LowStockItem extends PrismaInventory {
  percentageRemaining: number;
}

// Inventory filters
export interface InventoryFilters {
  search?: string;
  lowStock?: boolean;
  expiringSoon?: boolean;
  unit?: InventoryUnit;
}

// Stock update
export interface StockUpdateData {
  inventoryId: string;
  quantity: number;
  type: 'add' | 'remove' | 'set';
  notes?: string;
}
