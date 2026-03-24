/**
 * GET /api/menu - Get all menu items
 * POST /api/menu - Create new menu item (MANAGER only)
 * 
 * Menu items management
 * - Fetch with filters (category, availability, etc.)
 * - Create new items
 * - Include 3D model URLs
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { menuItemSchema } from '@/lib/validations';
import { Prisma } from '@prisma/client';

/**
 * Retrieves menu items and active categories filtered by query parameters and restaurant scope.
 *
 * Recognizes query parameters on the request URL to filter results: `categoryId`, `search`, `isAvailable`,
 * `isVegetarian`, `isVegan`, `isGlutenFree`, `minPrice`, `maxPrice`, `slug`, and `restaurantId`. If the
 * authenticated session includes `session.user.restaurantId`, that restaurant is always used. If no
 * restaurant can be resolved, returns empty `data` and `categories` arrays.
 *
 * @param request - The incoming NextRequest; its URL query parameters control filtering and scoping.
 * @returns An object with `data` (the list of matching menu items, each including its category) and
 *          `categories` (active categories for the resolved restaurant). On failure, returns an error
 *          object and an HTTP 500 status.
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const search = searchParams.get('search');
    const isAvailable = searchParams.get('isAvailable');
    const isVegetarian = searchParams.get('isVegetarian');
    const isVegan = searchParams.get('isVegan');
    const isGlutenFree = searchParams.get('isGlutenFree');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const slug = searchParams.get('slug');
    let restaurantId = searchParams.get('restaurantId');

    const session = await getServerSession(authOptions);

    // Enforce isolation for staff
    if (session?.user?.restaurantId) {
      restaurantId = session.user.restaurantId;
    }
    // Public access via slug
    else if (slug) {
      const restaurant = await prisma.restaurant.findFirst({
        where: { slug },
        select: { id: true }
      });
      if (restaurant) {
        restaurantId = restaurant.id;
      }
    }

    // Safety check: Don't return all items if no context
    if (!restaurantId) {
      return NextResponse.json({ data: [], categories: [] });
    }

    // Build where clause
    const where: Prisma.MenuItemWhereInput = {};

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (isAvailable !== null) {
      where.isAvailable = isAvailable === 'true';
    } else {
      // Default to only available items for customers
      where.isAvailable = true;
    }

    if (isVegetarian === 'true') {
      where.isVegetarian = true;
    }

    if (isVegan === 'true') {
      where.isVegan = true;
    }

    if (isGlutenFree === 'true') {
      where.isGlutenFree = true;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { hasSome: [search] } },
      ];
    }

    if (minPrice || maxPrice) {
      const priceFilter: Prisma.FloatFilter = {};
      if (minPrice) {
        priceFilter.gte = parseFloat(minPrice);
      }
      if (maxPrice) {
        priceFilter.lte = parseFloat(maxPrice);
      }
      where.price = priceFilter;
    }

    if (restaurantId) {
      where.restaurantId = restaurantId;
    }

    // Fetch menu items with category
    const menuItems = await prisma.menuItem.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            description: true,
            image: true,
            icon: true,
          },
        },
      },
      orderBy: [
        { isFeatured: 'desc' },
        { displayOrder: 'asc' },
        { name: 'asc' },
      ],
    });

    // Fetch categories for filter
    const categories = await prisma.category.findMany({
      where: {
        isActive: true,
        ...(restaurantId ? { restaurantId } : {}),
      },
      orderBy: { displayOrder: 'asc' },
      select: {
        id: true,
        name: true,
        description: true,
        image: true,
        icon: true,
      },
    });

    return NextResponse.json({
      data: menuItems,
      categories,
    });
  } catch (error) {
    console.error('Error fetching menu items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch menu items' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'MANAGER') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validate price is a valid number
    const priceValue = parseFloat(body.price);
    if (isNaN(priceValue)) {
      return NextResponse.json(
        { error: 'Invalid price value' },
        { status: 400 }
      );
    }

    if (!session.user.restaurantId) {
      return NextResponse.json({ error: 'No restaurant associated' }, { status: 400 });
    }

    // Determine target category before validation
    let targetCategoryId = body.categoryId;
    if (!targetCategoryId) {
      // Find first category for this restaurant
      const firstCat = await prisma.category.findFirst({
        where: { restaurantId: session.user.restaurantId }
      });
      if (firstCat) {
        targetCategoryId = firstCat.id;
      } else {
        // Create default category
        const newCat = await prisma.category.create({
          data: {
            name: "General",
            restaurantId: session.user.restaurantId
          }
        });
        targetCategoryId = newCat.id;
      }
    }
    
    // Use validation schema with the determined categoryId
    const validation = menuItemSchema.safeParse({
      ...body,
      categoryId: targetCategoryId,
      price: priceValue,
    });

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Verify category belongs to user's restaurant
    const category = await prisma.category.findFirst({
      where: {
        id: targetCategoryId,
        restaurantId: session.user.restaurantId,
      }
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Invalid category or unauthorized access' },
        { status: 403 }
      );
    }

    // Create menu item with explicitly defined fields to avoid confusion
    const newItem = await prisma.menuItem.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        discountPrice: data.discountPrice,
        image: data.image,
        model3dUrl: data.model3dUrl,
        model3dFormat: data.model3dFormat,
        isVegetarian: data.isVegetarian,
        isVegan: data.isVegan,
        isGlutenFree: data.isGlutenFree,
        spiceLevel: data.spiceLevel,
        calories: data.calories,
        preparationTime: data.preparationTime,
        tags: data.tags,
        restaurantId: session.user.restaurantId,
        categoryId: targetCategoryId,
        isAvailable: true
      }
    });

    return NextResponse.json({ message: 'Menu item created', data: newItem }, { status: 201 });
  } catch (error) {
    console.error('Error creating menu item:', error);
    return NextResponse.json(
      { error: 'Failed to create menu item' },
      { status: 500 }
    );
  }
}
