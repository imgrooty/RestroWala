/**
 * GET /api/analytics/revenue
 * 
 * Revenue analytics
 * - Date range filtering
 * - Daily/Weekly/Monthly breakdown
 * - Comparison with previous period
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { UserRole, OrderStatus } from '@/types/prisma';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, format, eachDayOfInterval, eachMonthOfInterval } from 'date-fns';

export const dynamic = 'force-dynamic';

interface RevenueDataPoint {
  date: string;
  revenue: number;
  orders: number;
  customers: number;
  averageOrderValue: number;
}

/**
 * Produce revenue analytics for a restaurant over a selectable date range, including a gap-filled time series, aggregate totals, averages, and percent changes versus the previous period.
 *
 * @returns A JSON object with a `data` property containing:
 *  - `period` — the selected period identifier (`day`, `week`, `month`, `year`, or custom`),
 *  - `startDate` / `endDate` — ISO dates (`yyyy-MM-dd`) for the current window,
 *  - `dataPoints` — an array of revenue datapoints (date label, `revenue`, `orders`, `customers`, `averageOrderValue`),
 *  - `summary` — aggregate metrics: `totalRevenue`, `totalOrders`, `totalCustomers`, `averageOrderValue`, `revenueChange` (percentage vs previous window), and `ordersChange` (percentage vs previous window).
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userRole = session.user.role as UserRole;
    if (userRole !== UserRole.MANAGER && userRole !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'week'; // day, week, month, year
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');
    const restaurantId = searchParams.get('restaurantId');

    // Get restaurant ID from user or parameter
    let finalRestaurantId = restaurantId;
    if (!finalRestaurantId) {
      // Get first restaurant (in a multi-tenant system, you'd get from user context)
      const restaurant = await prisma.restaurant.findFirst({
        where: { isActive: true },
      });
      if (!restaurant) {
        return NextResponse.json(
          { error: 'No restaurant found' },
          { status: 404 }
        );
      }
      finalRestaurantId = restaurant.id;
    }

    // Calculate date range
    const now = new Date();
    let startDate: Date;
    let endDate: Date = endOfDay(now);

    if (startDateParam && endDateParam) {
      startDate = startOfDay(new Date(startDateParam));
      endDate = endOfDay(new Date(endDateParam));
    } else {
      switch (period) {
        case 'day':
          startDate = startOfDay(now);
          break;
        case 'week':
          startDate = startOfWeek(now, { weekStartsOn: 1 });
          endDate = endOfWeek(now, { weekStartsOn: 1 });
          break;
        case 'month':
          startDate = startOfMonth(now);
          endDate = endOfMonth(now);
          break;
        case 'year':
          startDate = startOfYear(now);
          endDate = endOfYear(now);
          break;
        default:
          startDate = startOfWeek(now, { weekStartsOn: 1 });
          endDate = endOfWeek(now, { weekStartsOn: 1 });
      }
    }

    // Fetch orders in date range
    const orders = await prisma.order.findMany({
      where: {
        restaurantId: finalRestaurantId,
        status: {
          in: [OrderStatus.COMPLETED, OrderStatus.SERVED],
        },
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        items: true,
        user: {
          select: {
            id: true,
          },
        },
      },
    });

    // Group by period
    const dataMap = new Map<string, {
      revenue: number;
      orders: number;
      customers: Set<string>;
    }>();

    orders.forEach((order) => {
      let key: string;

      if (period === 'day') {
        key = format(order.createdAt, 'yyyy-MM-dd HH:00'); // Hourly
      } else if (period === 'week') {
        key = format(order.createdAt, 'yyyy-MM-dd'); // Daily
      } else if (period === 'month') {
        key = format(order.createdAt, 'yyyy-MM-dd'); // Daily
      } else {
        key = format(order.createdAt, 'yyyy-MM'); // Monthly
      }

      const existing = dataMap.get(key) || {
        revenue: 0,
        orders: 0,
        customers: new Set<string>(),
      };

      existing.revenue += order.finalAmount;
      existing.orders += 1;
      if (order.userId) {
        existing.customers.add(order.userId);
      }
      if (order.customerPhone) {
        existing.customers.add(order.customerPhone);
      }

      dataMap.set(key, existing);
    });

    // Convert to array and fill gaps
    const dataPoints: RevenueDataPoint[] = [];

    if (period === 'day') {
      // Hourly data for today
      const hours = Array.from({ length: 24 }, (_, i) => i);
      hours.forEach((hour) => {
        const date = new Date(startDate);
        date.setHours(hour, 0, 0, 0);
        const key = format(date, 'yyyy-MM-dd HH:00');
        const data = dataMap.get(key) || { revenue: 0, orders: 0, customers: new Set<string>() };
        dataPoints.push({
          date: format(date, 'HH:mm'),
          revenue: data.revenue,
          orders: data.orders,
          customers: data.customers.size,
          averageOrderValue: data.orders > 0 ? data.revenue / data.orders : 0,
        });
      });
    } else if (period === 'week' || period === 'month') {
      // Daily data
      const days = eachDayOfInterval({ start: startDate, end: endDate });
      days.forEach((day) => {
        const key = format(day, 'yyyy-MM-dd');
        const data = dataMap.get(key) || { revenue: 0, orders: 0, customers: new Set<string>() };
        dataPoints.push({
          date: format(day, 'MMM dd'),
          revenue: data.revenue,
          orders: data.orders,
          customers: data.customers.size,
          averageOrderValue: data.orders > 0 ? data.revenue / data.orders : 0,
        });
      });
    } else {
      // Monthly data
      const months = eachMonthOfInterval({ start: startDate, end: endDate });
      months.forEach((month) => {
        const key = format(month, 'yyyy-MM');
        const data = dataMap.get(key) || { revenue: 0, orders: 0, customers: new Set<string>() };
        dataPoints.push({
          date: format(month, 'MMM yyyy'),
          revenue: data.revenue,
          orders: data.orders,
          customers: data.customers.size,
          averageOrderValue: data.orders > 0 ? data.revenue / data.orders : 0,
        });
      });
    }

    // Calculate totals and comparison
    const totalRevenue = orders.reduce((sum: number, order) => sum + order.finalAmount, 0);
    const totalOrders = orders.length;
    const uniqueCustomers = new Set<string>();
    orders.forEach((order) => {
      if (order.userId) uniqueCustomers.add(order.userId);
      if (order.customerPhone) uniqueCustomers.add(order.customerPhone);
    });
    const totalCustomers = uniqueCustomers.size;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Compare with previous period
    const previousStartDate = new Date(startDate);
    const previousEndDate = new Date(endDate);
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    previousStartDate.setDate(previousStartDate.getDate() - daysDiff - 1);
    previousEndDate.setDate(previousEndDate.getDate() - daysDiff - 1);

    const previousOrders = await prisma.order.findMany({
      where: {
        restaurantId: finalRestaurantId,
        status: {
          in: [OrderStatus.COMPLETED, OrderStatus.SERVED],
        },
        createdAt: {
          gte: previousStartDate,
          lte: previousEndDate,
        },
      },
    });

    const previousRevenue = previousOrders.reduce((sum: number, order) => sum + order.finalAmount, 0);
    const previousOrdersCount = previousOrders.length;
    const revenueChange = previousRevenue > 0
      ? ((totalRevenue - previousRevenue) / previousRevenue) * 100
      : 0;
    const ordersChange = previousOrdersCount > 0
      ? ((totalOrders - previousOrdersCount) / previousOrdersCount) * 100
      : 0;

    return NextResponse.json({
      data: {
        period,
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd'),
        dataPoints,
        summary: {
          totalRevenue,
          totalOrders,
          totalCustomers,
          averageOrderValue,
          revenueChange,
          ordersChange,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching revenue analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch revenue analytics' },
      { status: 500 }
    );
  }
}
