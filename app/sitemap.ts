import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  try {
    // Fetch all active restaurants to include in sitemap
    const restaurants = await prisma.restaurant.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true }
    })

    const restaurantUrls = restaurants.map((restaurant) => ({
      url: `${baseUrl}/${restaurant.slug}`,
      lastModified: restaurant.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))

    const restaurantMenuUrls = restaurants.map((restaurant) => ({
      url: `${baseUrl}/${restaurant.slug}/menu`,
      lastModified: restaurant.updatedAt,
      changeFrequency: 'daily' as const,
      priority: 0.9,
    }))

    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 1,
      },
      ...restaurantUrls,
      ...restaurantMenuUrls,
    ]
  } catch (error) {
    console.error('Error generating sitemap:', error)
    // Fallback: return minimal sitemap with homepage only
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 1,
      },
    ]
  }
}
