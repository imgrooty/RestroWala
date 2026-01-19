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

export async function deleteRestaurant(id: string) {
    try {
        await prisma.restaurant.delete({
            where: { id }
        })
        revalidatePath('/admin/restaurants')
        return { success: true }
    } catch (error) {
        return { success: false, error: "Failed to delete restaurant" }
    }
}

export async function updateRestaurantStatus(id: string, isActive: boolean) {
    try {
        await prisma.restaurant.update({
            where: { id },
            data: { isActive }
        })
        revalidatePath('/admin/restaurants')
        return { success: true }
    } catch (error) {
        return { success: false, error: "Failed to update restaurant status" }
    }
}

export async function getGlobalUsers() {
    try {
        const users = await prisma.user.findMany({
            include: {
                restaurant: {
                    select: {
                        name: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })
        return { success: true, data: users }
    } catch (error) {
        return { success: false, error: "Failed to fetch users" }
    }
}

export async function manageUserStatus(userId: string, isActive: boolean) {
    try {
        await prisma.user.update({
            where: { id: userId },
            data: { isActive }
        })
        revalidatePath('/admin/users')
        return { success: true }
    } catch (error) {
        return { success: false, error: "Failed to update user status" }
    }
}

export async function updateUserRole(userId: string, role: string) {
    try {
        await prisma.user.update({
            where: { id: userId },
            data: { role: role as any }
        })
        revalidatePath('/admin/users')
        return { success: true }
    } catch (error) {
        return { success: false, error: "Failed to update user role" }
    }
}

export async function getAdminMetrics() {
    try {
        const [restaurantCount, userCount, activeOrders, totalRevenue] = await Promise.all([
            prisma.restaurant.count(),
            prisma.user.count(),
            prisma.order.count({ where: { status: { notIn: ['COMPLETED', 'CANCELLED'] } } }),
            prisma.payment.aggregate({
                _sum: { amount: true },
                where: { status: 'COMPLETED' }
            })
        ])

        return {
            success: true,
            data: {
                activeNodes: restaurantCount,
                totalUsers: userCount,
                activeOrders,
                totalRevenue: totalRevenue._sum.amount || 0,
                dataVolume: "45.2 GB", // Mocked for now
                systemHealth: "100%", // Mocked for now
                securityEvents: 0
            }
        }
    } catch (error) {
        return { success: false, error: "Failed to fetch metrics" }
    }
}

export async function getSubscriptions() {
    try {
        const subscriptions = await prisma.subscription.findMany({
            include: {
                restaurant: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        })
        return { success: true, data: subscriptions }
    } catch (error) {
        return { success: false, error: "Failed to fetch subscriptions" }
    }
}
