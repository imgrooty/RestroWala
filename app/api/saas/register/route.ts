import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { UserRole } from '@prisma/client';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { restaurantName, restaurantSlug, ownerName, ownerEmail, ownerPassword } = body;

        // 1. Basic Validation
        if (!restaurantName || !restaurantSlug || !ownerName || !ownerEmail || !ownerPassword) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }

        // 2. Check if slug or email exists
        const existingRestaurant = await prisma.restaurant.findUnique({
            where: { slug: restaurantSlug }
        });

        if (existingRestaurant) {
            return NextResponse.json({ message: 'This restaurant slug is already taken' }, { status: 400 });
        }

        const existingUser = await prisma.user.findUnique({
            where: { email: ownerEmail }
        });

        if (existingUser) {
            return NextResponse.json({ message: 'An account with this email already exists' }, { status: 400 });
        }

        // 3. Create Restaurant and Manager in a transaction
        const hashedPassword = await bcrypt.hash(ownerPassword, 12);

        const result = await prisma.$transaction(async (tx) => {
            // Create Restaurant
            const restaurant = await tx.restaurant.create({
                data: {
                    name: restaurantName,
                    slug: restaurantSlug,
                    address: 'Default Address', // Can be updated later
                    phone: 'Default Phone',
                    email: ownerEmail,
                }
            });

            // Create Manager User associated with this restaurant
            const user = await tx.user.create({
                data: {
                    name: ownerName,
                    email: ownerEmail,
                    password: hashedPassword,
                    role: UserRole.MANAGER,
                    restaurantId: restaurant.id,
                }
            });

            return { restaurant, user };
        });

        return NextResponse.json({
            message: 'Restaurant registered successfully',
            restaurantId: result.restaurant.id
        }, { status: 201 });

    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
