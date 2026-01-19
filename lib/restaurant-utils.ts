/**
 * Restaurant Utilities
 * 
 * Helper functions for restaurant management
 */

import { prisma } from './prisma';

/**
 * Get or create default restaurant
 * Temporary solution until multi-restaurant support is fully implemented
 */
export async function getOrCreateDefaultRestaurant() {
  let restaurant = await prisma.restaurant.findFirst();

  if (!restaurant) {
    restaurant = await prisma.restaurant.create({
      data: {
        name: 'The Sapphire Grill',
        slug: 'the-sapphire-grill',
        address: '123 Main Street',
        phone: '+1 (555) 123-4567',
        email: 'contact@sapphiregrill.com',
        description: 'Welcome to our premium restaurant',
        isActive: true,
      } as any,
    });
  }

  return restaurant;
}

/**
 * Get restaurant ID for current session
 */
export async function getRestaurantId(userId?: string): Promise<string> {
  if (userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { restaurantId: true } as any
    });
    if ((user as any)?.restaurantId) return (user as any).restaurantId;
  }

  // Fallback to the first restaurant for backwards compatibility during migration
  const restaurant = await getOrCreateDefaultRestaurant();
  return restaurant.id;
}
