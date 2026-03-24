/**
 * GET /api/analytics/popular-items
 * 
 * Popular menu items analytics
 * - Most ordered items
 * - Revenue by item
 * - Category breakdown
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { UserRole, OrderStatus } from '@/types/prisma';
import { startOfDay, endOfDay, subDays, format } from 'date-fns';

export const dynamic = 'force-dynamic';

/**
 * Handle GET requests to /api/analytics/popular-items and return analytics for the most-ordered menu items filtered by user role, restaurant, and date range.
 *
 * @param request - The incoming NextRequest containing query parameters: `limit`, `startDate`, `endDate`, and `restaurantId`
 * @returns A JSON object with `data.items` (array of top menu items each containing `id`, `name`, `category`, `image`, `quantity`, `revenue`, and `price`) and `data.summary` (object with `totalQuantity`, `totalRevenue`, `itemCount`, and `period` with `startDate` and `endDate` formatted as `yyyy-MM-dd`)
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
    const limit = parseInt(searchParams.get('limit') || '10');
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

    // Default date range: last 30 days
    const endDate = endDateParam ? endOfDay(new Date(endDateParam)) : endOfDay(new Date());
    const startDate = startDateParam
      ? startOfDay(new Date(startDateParam))
      : startOfDay(subDays(endDate, 30));

    // Fetch popular items
    const popularItems = await prisma.menuItem.findMany({
      where: {
        restaurantId: finalRestaurantId,
        orderItems: {
          some: {
            order: {
              status: {
                in: [OrderStatus.COMPLETED, OrderStatus.SERVED],
              },
              createdAt: {
                gte: startDate,
                lte: endDate,
              },
            },
          },
        },
      },
      include: {
        category: true,
        orderItems: {
          where: {
            order: {
              status: {
                in: [OrderStatus.COMPLETED, OrderStatus.SERVED],
              },
              createdAt: {
                gte: startDate,
                lte: endDate,
              },
            },
          },
        },
      },
    });

    // Calculate metrics and format
    const formattedItems = popularItems.map((menuItem) => {
      const quantity = menuItem.orderItems.reduce((sum: number, orderItem) => sum + orderItem.quantity, 0);
      const revenue = menuItem.orderItems.reduce((sum: number, orderItem) => sum + (orderItem.price * orderItem.quantity), 0);

      return {
        id: menuItem.id,
        name: menuItem.name,
        category: menuItem.category.name,
        image: menuItem.image,
        quantity,
        revenue,
        price: menuItem.price,
      };
    })
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, limit);

    // Summary data
    const totalQuantity = formattedItems.reduce((sum: number, item) => sum + item.quantity, 0);
    const totalRevenue = formattedItems.reduce((sum: number, item) => sum + item.revenue, 0);

    return NextResponse.json({
      data: {
        items: formattedItems,
        summary: {
          totalQuantity,
          totalRevenue,
          itemCount: formattedItems.length,
          period: {
            startDate: format(startDate, 'yyyy-MM-dd'),
            endDate: format(endDate, 'yyyy-MM-dd'),
          },
        },
      },
    });
  } catch (error) {
    console.error('Error fetching popular items analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch popular items' },
      { status: 500 }
    );
  }
}
