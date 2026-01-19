/**
 * Analytics Related Types
 * 
 * Types for analytics and reporting
 */

// Dashboard analytics
export interface DashboardAnalytics {
  todayRevenue: number;
  todayOrders: number;
  todayCustomers: number;
  averageOrderValue: number;
  revenueChange: number; // percentage
  ordersChange: number; // percentage
  popularItems: PopularItem[];
  recentOrders: any[];
  peakHours: HourlyData[];
}

// Popular item
export interface PopularItem {
  id: string;
  name: string;
  orderCount: number;
  revenue: number;
  image?: string;
}

// Revenue by date
export interface RevenueData {
  date: string;
  revenue: number;
  orders: number;
  customers: number;
  averageOrderValue?: number;
}

// Hourly data
export interface HourlyData {
  hour: number;
  orders: number;
  revenue: number;
}

// Date range filter
export interface DateRangeFilter {
  startDate: Date;
  endDate: Date;
  period: 'day' | 'week' | 'month' | 'year';
}

// Sales report
export interface SalesReport {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  averageOrderValue: number;
  topSellingItems: PopularItem[];
  revenueByDate: RevenueData[];
  revenueByCategory: CategoryRevenue[];
}

// Category revenue
export interface CategoryRevenue {
  categoryId: string;
  categoryName: string;
  revenue: number;
  orderCount: number;
  percentage: number;
}
