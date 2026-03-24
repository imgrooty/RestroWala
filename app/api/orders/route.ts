/**
 * GET /api/orders - Get orders (filtered by role)
 * POST /api/orders - Create new order
 * 
 * Order management
 * - Customers see their orders
 * - Waiters see assigned table orders
 * - Kitchen sees all preparing orders
 * - Managers see all orders
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createOrderSchema } from '@/lib/validations';
import { OrderStatus, UserRole, TableStatus } from '@/types/prisma';
import { Prisma } from '@prisma/client';
// Socket.io logic removed

/**
 * Generate unique order number
 */
function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

/**
 * Fetches orders according to query parameters and the caller's role, applying restaurant and role-based filters.
 *
 * Uses query parameters (status, statuses, tableId, userId, slug, restaurantId) and the authenticated session to scope results:
 * - Guest requests require `tableId` and return only active orders (not COMPLETED).
 * - CUSTOMER sees only their orders.
 * - WAITER sees orders for their assigned tables (if any) or broader restaurant orders when none assigned.
 * - KITCHEN_STAFF sees orders in PENDING, CONFIRMED, PREPARING, or READY states.
 * - MANAGER and ADMIN have no additional role filtering.
 *
 * @returns A JSON response; on success the body is `{ data: orders }` where each order includes `items.menuItem` (id, name, image, price), `table` (id, number, capacity, floor, location), and `user` (id, name, email). On error returns a JSON object with an `error` message and an appropriate HTTP status code (401 for missing tableId for guests, 500 for server errors, etc.).
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as OrderStatus | null;
    const statuses = searchParams.get('statuses')?.split(',') as OrderStatus[] | undefined;
    const tableId = searchParams.get('tableId');
    const userId = searchParams.get('userId');
    const slug = searchParams.get('slug');
    let restaurantId = searchParams.get('restaurantId');

    // If slug is provided (for guest tracking), resolve restaurantId
    if (slug) {
      const restaurant = await prisma.restaurant.findFirst({
        where: { slug },
        select: { id: true }
      });
      if (restaurant) {
        restaurantId = restaurant.id;
      }
    }

    // Role-based filtering enhancements
    if (session && session.user.restaurantId) {
      // If user is staff, enforce their own restaurantId unless they are SUPER_ADMIN
      if (session.user.role !== 'SUPER_ADMIN') {
        restaurantId = session.user.restaurantId;
      }
    }

    // If no session, only allow fetching by tableId (Guest Tracking)
    if (!session || !session.user) {
      if (!tableId) {
        return NextResponse.json(
          { error: 'Unauthorized. Table ID required for guest tracking.' },
          { status: 401 }
        );
      }

      const orders = await prisma.order.findMany({
        where: {
          tableId,
          ...(restaurantId ? { restaurantId } : {}),
          status: { not: OrderStatus.COMPLETED } // Only active orders for guests
        },
        include: {
          items: { include: { menuItem: true } },
          table: true
        },
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json({ data: orders });
    }

    const userRole = session.user.role as UserRole;
    const where: Prisma.OrderWhereInput = {};
    if (restaurantId) where.restaurantId = restaurantId;

    // Role-based filtering
    if (userRole === UserRole.CUSTOMER) {
      // Customers see only their orders
      where.userId = session.user.id;
    } else if (userRole === UserRole.WAITER) {
      // Prefer assigned tables, but fall back to restaurant orders when no assignments exist yet.
      const waiterTables = await prisma.table.findMany({
        where: { waiterId: session.user.id },
        select: { id: true },
      });
      if (waiterTables.length > 0) {
        where.tableId = { in: waiterTables.map((t) => t.id) };
      }
    } else if (userRole === UserRole.KITCHEN_STAFF) {
      // Kitchen needs to see newly created orders immediately.
      where.status = { in: [OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.PREPARING, OrderStatus.READY] };
    }
    // MANAGER and ADMIN see all orders (no additional filter)

    // Additional filters
    if (statuses && statuses.length > 0) {
      where.status = { in: statuses };
    } else if (status) {
      where.status = status;
    }
    if (tableId) {
      where.tableId = tableId;
    }
    if (userId && (userRole === UserRole.MANAGER || userRole === UserRole.ADMIN)) {
      where.userId = userId;
    }
    if (restaurantId && (userRole === UserRole.MANAGER || userRole === UserRole.ADMIN)) {
      where.restaurantId = restaurantId;
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            menuItem: {
              select: {
                id: true,
                name: true,
                image: true,
                price: true,
              },
            },
          },
        },
        table: {
          select: {
            id: true,
            number: true,
            capacity: true,
            floor: true,
            location: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ data: orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

/**
 * Create a new order from the request body, allowing guest orders and returning the created order.
 *
 * Validates the request payload, verifies the table and requested menu items are available, calculates totals (including a fixed 10% tax), creates the order and its items, updates the table status to OCCUPIED, and emits socket events when possible.
 *
 * @returns On success, a JSON object with `{ message: 'Order created successfully', data: <created order record> }` where the created order includes its items (with menuItem), table, and user. On validation or menu availability failure returns a JSON error with status 400 and details; if the table is not found returns status 404; on unexpected server errors returns a JSON error with status 500.
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    // Allow guest ordering without session

    const body = await request.json();
    const validation = createOrderSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Verify table exists and get restaurant ID
    const table = await prisma.table.findUnique({
      where: { id: data.tableId },
      include: { restaurant: true },
    });

    if (!table) {
      return NextResponse.json(
        { error: 'Table not found' },
        { status: 404 }
      );
    }

    // Verify menu items exist and calculate totals
    const menuItems = await prisma.menuItem.findMany({
      where: {
        id: { in: data.items.map((item) => item.menuItemId) },
        isAvailable: true,
      },
    });

    if (menuItems.length !== data.items.length) {
      return NextResponse.json(
        { error: 'One or more menu items are not available' },
        { status: 400 }
      );
    }

    // Calculate order totals
    let totalAmount = 0;
    const orderItems = data.items.map((item) => {
      const menuItem = menuItems.find((mi) => mi.id === item.menuItemId)!;
      const price = menuItem.discountPrice ?? menuItem.price;
      const subtotal = price * item.quantity;
      totalAmount += subtotal;

      return {
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        price,
        discount: menuItem.discountPrice ? menuItem.price - menuItem.discountPrice : 0,
        subtotal,
        specialInstructions: item.specialInstructions,
        status: OrderStatus.PENDING,
      };
    });

    const tax = totalAmount * 0.1; // 10% tax (adjust as needed)
    const finalAmount = totalAmount + tax;

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        status: OrderStatus.PENDING,
        totalAmount,
        discount: 0,
        tax,
        finalAmount,
        tableId: data.tableId,
        userId: session?.user?.role === UserRole.CUSTOMER || !session ? (session?.user?.id || null) : null,
        restaurantId: table.restaurantId,
        customerName: data.customerName || session?.user?.name || 'Guest',
        customerPhone: data.customerPhone || null,
        notes: data.notes,
        items: {
          create: orderItems,
        },
      },
      include: {
        items: {
          include: {
            menuItem: {
              select: {
                id: true,
                name: true,
                image: true,
                price: true,
              },
            },
          },
        },
        table: {
          select: {
            id: true,
            number: true,
            capacity: true,
            floor: true,
            location: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Update table status to OCCUPIED if not already
    const updatedTable = await prisma.table.update({
      where: { id: data.tableId },
      data: { status: 'OCCUPIED' },
    });

    // Emit socket events
    import('@/lib/socket').then(({ emitOrderCreated, emitTableStatusChanged }) => {
      emitOrderCreated({ order });
      emitTableStatusChanged({
        tableId: updatedTable.id,
        tableNumber: updatedTable.number,
        status: updatedTable.status as TableStatus,
        previousStatus: table.status as TableStatus,
        waiterId: updatedTable.waiterId,
      });
    }).catch(err => console.error('Failed to emit socket events:', err));

    return NextResponse.json(
      {
        message: 'Order created successfully',
        data: order,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
