import { cache } from 'react'
import { prisma } from './prisma'

export const getRestaurantBySlug = cache(async (slug: string) => {
  return await prisma.restaurant.findUnique({
    where: { slug },
    select: { id: true, name: true, description: true, logo: true }
  })
})
