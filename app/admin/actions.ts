'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { createLog, LogLevel } from "@/lib/logger"
import bcrypt from "bcryptjs"

async function ensureSuperAdmin() {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'SUPER_ADMIN') {
        throw new Error("Unauthorized: Super Admin access required")
    }
    return session
}

export async function getRestaurants() {
    try {
        await ensureSuperAdmin()
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
    } catch (error: any) {
        return { success: false, error: error.message || "Failed to fetch restaurants" }
    }
}

export async function createRestaurant(data: FormData) {
    try {
        const session = await ensureSuperAdmin()
        const name = data.get('name') as string
        const slug = data.get('slug') as string
        const email = data.get('email') as string
        const phone = data.get('phone') as string
        const address = data.get('address') as string
        const description = data.get('description') as string
        const managerName = data.get('managerName') as string
        const managerEmail = data.get('managerEmail') as string
        const managerPassword = data.get('managerPassword') as string

        if (!name || !slug || !managerName || !managerEmail || !managerPassword) {
            return { success: false, error: "Required fields missing" }
        }

        const hashedPassword = await bcrypt.hash(managerPassword, 10)

        const restaurant = await prisma.restaurant.create({
            data: {
                name,
                slug,
                email,
                phone,
                address,
                description,
                staff: {
                    create: {
                        name: managerName,
                        email: managerEmail,
                        password: hashedPassword,
                        role: 'MANAGER'
                    }
                }
            }
        })

        await createLog(
            "RESTAURANT_CREATED",
            `Created new restaurant: ${name} (${slug}) with manager ${managerEmail}`,
            LogLevel.INFO,
            session.user.id
        )

        revalidatePath('/admin/restaurants')
        return { success: true, data: restaurant }
    } catch (error: any) {
        if (error.code === 'P2002') {
            return { success: false, error: "A restaurant or user with this identifier already exists" }
        }
        return { success: false, error: error.message || "Failed to create restaurant" }
    }
}

export async function deleteRestaurant(id: string) {
    try {
        const session = await ensureSuperAdmin()

        // Find restaurant to get name for logging and handle subscription
        const restaurant = await prisma.restaurant.findUnique({
            where: { id },
            select: { name: true, subscriptionId: true }
        })

        if (!restaurant) {
            return { success: false, error: "Restaurant not found" }
        }

        await prisma.restaurant.delete({
            where: { id }
        })

        // Cleanup subscription if it exists
        if (restaurant.subscriptionId) {
            await prisma.subscription.delete({
                where: { id: restaurant.subscriptionId }
            }).catch(err => console.error("Failed to cleanup subscription:", err))
        }

        await createLog(
            "RESTAURANT_DELETED",
            `Deleted restaurant: ${restaurant.name}`,
            LogLevel.WARN,
            session.user.id
        )

        revalidatePath('/admin/restaurants')
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message || "Failed to delete restaurant" }
    }
}

export async function updateRestaurantStatus(id: string, isActive: boolean) {
    try {
        const session = await ensureSuperAdmin()
        const restaurant = await prisma.restaurant.update({
            where: { id },
            data: { isActive }
        })

        await createLog(
            "RESTAURANT_STATUS_UPDATED",
            `${isActive ? 'Activated' : 'Deactivated'} restaurant: ${restaurant.name}`,
            LogLevel.INFO,
            session.user.id
        )

        revalidatePath('/admin/restaurants')
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message || "Failed to update restaurant status" }
    }
}

export async function getGlobalUsers() {
    try {
        await ensureSuperAdmin()
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
    } catch (error: any) {
        return { success: false, error: error.message || "Failed to fetch users" }
    }
}

export async function manageUserStatus(userId: string, isActive: boolean) {
    try {
        const session = await ensureSuperAdmin()
        const user = await prisma.user.update({
            where: { id: userId },
            data: { isActive }
        })

        await createLog(
            "USER_STATUS_UPDATED",
            `${isActive ? 'Activated' : 'Deactivated'} user: ${user.email}`,
            LogLevel.INFO,
            session.user.id
        )

        revalidatePath('/admin/users')
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message || "Failed to update user status" }
    }
}

export async function updateUserRole(userId: string, role: string) {
    try {
        const session = await ensureSuperAdmin()
        const user = await prisma.user.update({
            where: { id: userId },
            data: { role: role as any }
        })

        await createLog(
            "USER_ROLE_UPDATED",
            `Updated role for ${user.email} to ${role}`,
            LogLevel.INFO,
            session.user.id
        )

        revalidatePath('/admin/users')
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message || "Failed to update user role" }
    }
}

export async function deleteUser(userId: string) {
    try {
        const session = await ensureSuperAdmin()
        const user = await prisma.user.delete({
            where: { id: userId }
        })

        await createLog(
            "USER_DELETED",
            `Deleted user: ${user.email}`,
            LogLevel.WARN,
            session.user.id
        )

        revalidatePath('/admin/users')
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message || "Failed to delete user" }
    }
}

export async function getAdminMetrics() {
    try {
        await ensureSuperAdmin()
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
    } catch (error: any) {
        return { success: false, error: error.message || "Failed to fetch metrics" }
    }
}

export async function getSubscriptions() {
    try {
        await ensureSuperAdmin()
        const subscriptions = await prisma.subscription.findMany({
            include: {
                restaurant: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        })
        return { success: true, data: subscriptions }
    } catch (error: any) {
        return { success: false, error: error.message || "Failed to fetch subscriptions" }
    }
}

export async function getSystemLogs() {
    try {
        await ensureSuperAdmin()
        const logs = await prisma.systemLog.findMany({
            include: {
                user: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 100
        })
        return { success: true, data: logs }
    } catch (error: any) {
        return { success: false, error: error.message || "Failed to fetch system logs" }
    }
}

export async function getGlobalPayments() {
    try {
        await ensureSuperAdmin()
        const payments = await prisma.payment.findMany({
            include: {
                order: {
                    include: {
                        restaurant: {
                            select: {
                                name: true,
                                slug: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 50
        })
        return { success: true, data: payments }
    } catch (error: any) {
        return { success: false, error: error.message || "Failed to fetch global payments" }
    }
}

export async function getGlobalBillingMetrics() {
    try {
        await ensureSuperAdmin()
        const [revenueData, transactionCount] = await Promise.all([
            prisma.payment.aggregate({
                _sum: { amount: true },
                where: { status: 'COMPLETED' }
            }),
            prisma.payment.count()
        ])

        const totalRevenue = revenueData._sum.amount || 0
        const avgTicket = transactionCount > 0 ? totalRevenue / transactionCount : 0

        return {
            success: true,
            data: {
                totalRevenue,
                transactionCount,
                avgTicket
            }
        }
    } catch (error: any) {
        return { success: false, error: error.message || "Failed to fetch billing metrics" }
    }
}
