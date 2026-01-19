import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🗑️ Cleaning database...')

  // Delete in order to respect foreign key constraints
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.menuItem.deleteMany()
  await prisma.category.deleteMany()
  await prisma.table.deleteMany()
  await prisma.user.deleteMany()
  await prisma.restaurant.deleteMany()

  console.log('✅ Database cleaned.')
  console.log('🌱 Seeding 3 Restaurants Demo...')

  const password = await bcrypt.hash('password123', 10)

  // 0. Super Admin
  await prisma.user.upsert({
    where: { email: 'admin@gourmetos.com' },
    update: {},
    create: {
      email: 'admin@gourmetos.com',
      password,
      name: 'Platform Admin',
      role: 'SUPER_ADMIN' as any,
    },
  })

  const restaurants = [
    {
      id: 'res-sapphire',
      name: 'The Sapphire Grill',
      slug: 'the-sapphire-grill',
      email: 'contact@sapphiregrill.com',
      description: 'Premium Steakhouse & Fine Dining',
      managerEmail: 'manager@sapphiregrill.com',
      waiterEmail: 'waiter@sapphiregrill.com',
      categories: [
        {
          name: 'Starters', items: [
            { name: 'Truffle Mac & Cheese', price: 18.50 },
            { name: 'Calamari Fritti', price: 16.00 }
          ]
        },
        {
          name: 'Gourmet Grills', items: [
            { name: 'Wagyu Ribeye', price: 65.00 },
            { name: 'Herb-Crusted Lamb', price: 42.00 }
          ]
        }
      ]
    },
    {
      id: 'res-pasta',
      name: 'Pasta Palace',
      slug: 'pasta-palace',
      email: 'hello@pastapalace.com',
      description: 'Authentic Hand-made Italian Pasta',
      managerEmail: 'manager@pastapalace.com',
      waiterEmail: 'waiter@pastapalace.com',
      categories: [
        {
          name: 'Antipasti', items: [
            { name: 'Bruschetta', price: 10.00 },
            { name: 'Burrata with Pesto', price: 14.50 }
          ]
        },
        {
          name: 'Pasta Classico', items: [
            { name: 'Carbonara Authentica', price: 21.00 },
            { name: 'Truffle Tagliatelle', price: 24.00 }
          ]
        }
      ]
    },
    {
      id: 'res-zen',
      name: 'Zen Sushi',
      slug: 'zen-sushi',
      email: 'zen@gensushi.com',
      description: 'Minimalist Japanese Culinary Art',
      managerEmail: 'manager@zensushi.com',
      waiterEmail: 'waiter@zensushi.com',
      categories: [
        {
          name: 'Sashimi & Nigiri', items: [
            { name: 'Bluefin Tuna Set', price: 35.00 },
            { name: 'Salmon Aburi', price: 18.00 }
          ]
        },
        {
          name: 'Signature Rolls', items: [
            { name: 'Dragon Roll', price: 22.00 },
            { name: 'Zen Special', price: 25.00 }
          ]
        }
      ]
    }
  ]

  for (const resData of restaurants) {
    // Create Restaurant
    const restaurant = await prisma.restaurant.upsert({
      where: { id: resData.id },
      update: {},
      create: {
        id: resData.id,
        name: resData.name,
        slug: resData.slug,
        address: '123 Multi-Tenant Plaza',
        phone: '+1 (555) 000-0000',
        email: resData.email,
        description: resData.description,
      } as any,
    })

    // Create Manager
    await prisma.user.upsert({
      where: { email: resData.managerEmail },
      update: {},
      create: {
        email: resData.managerEmail,
        password,
        name: `${resData.name} Manager`,
        role: 'MANAGER',
        restaurantId: restaurant.id,
      } as any,
    })

    // Create Waiter
    await prisma.user.upsert({
      where: { email: resData.waiterEmail },
      update: {},
      create: {
        email: resData.waiterEmail,
        password,
        name: `${resData.name} Waiter`,
        role: 'WAITER',
        restaurantId: restaurant.id,
      } as any,
    })

    // Create Tables
    for (let i = 1; i <= 5; i++) {
      await prisma.table.create({
        data: {
          number: i,
          capacity: 4,
          status: 'AVAILABLE',
          qrCode: `${resData.slug.substring(0, 2).toUpperCase()}-${i}`,
          restaurantId: restaurant.id,
        },
      })
    }

    // Create Categories and Menu Items
    for (let i = 0; i < resData.categories.length; i++) {
      const catData = resData.categories[i]
      const category = await prisma.category.create({
        data: {
          name: catData.name,
          displayOrder: i + 1,
          restaurantId: restaurant.id,
        },
      })

      for (const item of catData.items) {
        await prisma.menuItem.create({
          data: {
            name: item.name,
            price: item.price,
            categoryId: category.id,
            restaurantId: restaurant.id,
            displayOrder: 1,
          },
        })
      }
    }

    console.log(`✅ Seeded: ${resData.name}`)
  }

  console.log('\n🎉 Multi-restaurant seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
