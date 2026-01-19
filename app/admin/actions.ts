'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getRestaurants() {
    try {
        const restaurants = await prisma.restaurant.findMany({
            include: {
                _count: {
                    select: {
                        menuItems: true,
                        orders: true,
                        staff: true
                    }
                },
                staff: {
                    where: {
                        role: "MANAGER"
                    },
                    select: {
                        name: true,
                        email: true
                    },
                    take: 1
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })
        return { success: true, data: restaurants }
    } catch (error) {
        return { success: false, error: "Failed to fetch restaurants" }
    }
}

export async function createRestaurant(data: FormData) {
    try {
        const name = data.get('name') as string
        const slug = data.get('slug') as string
        const email = data.get('email') as string
        const phone = data.get('phone') as string
        const address = data.get('address') as string
        const description = data.get('description') as string

        if (!name || !slug) return { success: false, error: "Name and Slug are required" }

        const restaurant = await prisma.restaurant.create({
            data: {
                name,
                slug,
                email,
                phone,
                address,
                description
            }
        })

        revalidatePath('/admin/restaurants')
        return { success: true, data: restaurant }
    } catch (error: any) {
        if (error.code === 'P2002') {
            return { success: false, error: "A restaurant with this slug already exists" }
        }
        return { success: false, error: "Failed to create restaurant" }
    }
}
