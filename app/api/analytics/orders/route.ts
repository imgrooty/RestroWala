/**
 * GET /api/analytics/orders
 * 
 * Order statistics analytics
 * - Order counts by status
 * - Average order value
 * - Table turnover rate
 * - Peak hours analysis
 * - Waiter performance metrics
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { UserRole, OrderStatus } from '@/types/prisma';
import { startOfDay, endOfDay, subDays, format } from 'date-fns';

export const dynamic = 'force-dynamic';

/**
 * Provide order analytics for a restaurant over a specified date range.
 *
 * @param request - Incoming request whose query may include `startDate`, `endDate`, and `restaurantId`
 * @returns A JSON HTTP response:
 * - 200: analytics payload with `data.period`, `data.summary` (totals, revenue, peak hour, table turnover), `hourlyData`, `waiterPerformance`, and `statusTimeline`
 * - 401: `{ error: 'Unauthorized' }` when the user is not authenticated
 * - 403: `{ error: 'Forbidden' }` when the user lacks manager/admin role
 * - 404: `{ error: 'No restaurant found' }` when no active restaurant is available and no `restaurantId` was provided
 * - 500: `{ error: 'Failed to fetch order statistics' }` on unexpected failures
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
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');
    const restaurantId = searchParams.get('restaurantId');

    // Get restaurant ID
    let finalRestaurantId = restaurantId;
    if (!finalRestaurantId) {
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

    // Calculate date range (default: last 30 days)
    const endDate = endDateParam ? endOfDay(new Date(endDateParam)) : endOfDay(new Date());
    const startDate = startDateParam
      ? startOfDay(new Date(startDateParam))
      : startOfDay(subDays(endDate, 30));

    // Fetch orders
    const orders = await prisma.order.findMany({
      where: {
        restaurantId: finalRestaurantId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        table: {
          select: {
            id: true,
            number: true,
            capacity: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        items: true,
      },
    });

    // Order counts by status
    const ordersByStatus = Object.values(OrderStatus).reduce<Record<OrderStatus, number>>((acc, status) => {
      acc[status] = orders.filter((o) => o.status === status).length;
      return acc;
    }, {} as Record<OrderStatus, number>);

    // Calculate metrics
    const completedOrders = orders.filter(
      (o) => o.status === OrderStatus.COMPLETED || o.status === OrderStatus.SERVED
    );
    const totalRevenue = completedOrders.reduce((sum: number, o) => sum + o.finalAmount, 0);
    const totalOrders = orders.length;
    const averageOrderValue = completedOrders.length > 0
      ? totalRevenue / completedOrders.length
      : 0;

    // Peak hours analysis
    const hourlyData = Array.from({ length: 24 }, (_, hour) => {
      const hourOrders = orders.filter((order) => {
        const orderHour = new Date(order.createdAt).getHours();
        return orderHour === hour;
      });
      return {
        hour,
        hourLabel: `${hour}:00`,
        orders: hourOrders.length,
        revenue: hourOrders
          .filter((o) => o.status === OrderStatus.COMPLETED || o.status === OrderStatus.SERVED)
          .reduce((sum: number, o) => sum + o.finalAmount, 0),
      };
    });

    const peakHour = hourlyData.reduce(
      (max, current) => (current.orders > max.orders ? current : max),
      hourlyData[0] ?? { hour: 0, hourLabel: '0:00', orders: 0, revenue: 0 }
    );

    // Table turnover rate
    const tables = await prisma.table.findMany({
      where: { restaurantId: finalRestaurantId },
      include: {
        orders: {
          where: {
            createdAt: { gte: startDate, lte: endDate },
            status: OrderStatus.COMPLETED,
          },
        },
      },
    });

    const totalTables = tables.length;
    const averageTableTurnover = totalTables > 0
      ? completedOrders.length / totalTables
      : 0;

    // Waiter performance metrics
    const waiterStats = await prisma.user.findMany({
      where: {
        restaurantId: finalRestaurantId,
        role: UserRole.WAITER,
        isActive: true,
      },
      include: {
        assignedTables: {
          include: {
            orders: {
              where: {
                createdAt: { gte: startDate, lte: endDate },
                status: { in: [OrderStatus.COMPLETED, OrderStatus.SERVED] },
              },
            },
          },
        },
      },
    });

    const waiterPerformance = waiterStats.map((waiter) => {
      const waiterOrders = waiter.assignedTables.flatMap((table) => table.orders);
      const waiterRevenue = waiterOrders.reduce((sum: number, o) => sum + o.finalAmount, 0);
      const tablesAssigned = waiter.assignedTables.length;

      return {
        waiterId: waiter.id,
        waiterName: waiter.name || 'Unknown',
        ordersServed: waiterOrders.length,
        revenue: waiterRevenue,
        tablesAssigned,
        averageOrderValue: waiterOrders.length > 0
          ? waiterRevenue / waiterOrders.length
          : 0,
        ordersPerTable: tablesAssigned > 0
          ? waiterOrders.length / tablesAssigned
          : 0,
      };
    }).sort((a, b) => b.revenue - a.revenue);

    // Order status timeline (last 7 days)
    const last7Days = Array.from({ length: 7 }, (_, i: number) => {
      const date = subDays(endDate, 6 - i);
      const dayOrders = orders.filter((order) => {
        const orderDate = format(new Date(order.createdAt), 'yyyy-MM-dd');
        return orderDate === format(date, 'yyyy-MM-dd');
      });
      return {
        date: format(date, 'MMM dd'),
        dateValue: format(date, 'yyyy-MM-dd'),
        total: dayOrders.length,
        completed: dayOrders.filter((o) => o.status === OrderStatus.COMPLETED).length,
        cancelled: dayOrders.filter((o) => o.status === OrderStatus.CANCELLED).length,
      };
    });

    return NextResponse.json({
      data: {
        period: {
          startDate: format(startDate, 'yyyy-MM-dd'),
          endDate: format(endDate, 'yyyy-MM-dd'),
        },
        summary: {
          totalOrders,
          ordersByStatus,
          totalRevenue,
          averageOrderValue,
          peakHour: {
            hour: peakHour.hour,
            hourLabel: peakHour.hourLabel,
            orders: peakHour.orders,
          },
          tableTurnover: {
            averageTurnover: averageTableTurnover,
            totalTables,
          },
        },
        hourlyData,
        waiterPerformance,
        statusTimeline: last7Days,
      },
    });
  } catch (error) {
    console.error('Error fetching order statistics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order statistics' },
      { status: 500 }
    );
  }
}
