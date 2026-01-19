
import { PrismaClient, UserRole, OrderStatus, TableStatus, PaymentMethod, PaymentStatus, InventoryUnit } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// Helper to generate random dates within the last X days
const randomDate = (daysAgo: number) => {
  const date = new Date()
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo))
  date.setHours(Math.floor(Math.random() * 12) + 11) // 11 AM - 11 PM
  return date
}

async function main() {
  console.log('🗑️ Cleaning database...')

  // Delete in order to respect foreign key constraints
  await prisma.menuItemInventory.deleteMany()
  await prisma.inventory.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.table.deleteMany()
  await prisma.menuItem.deleteMany()
  await prisma.category.deleteMany()
  await prisma.reservation.deleteMany()
  await prisma.analytics.deleteMany()
  await prisma.user.deleteMany()
  await prisma.restaurant.deleteMany()

  console.log('✅ Database cleaned.')
  console.log('🌱 Seeding 3 Restaurants with Comprehensive Data...')

  const password = await bcrypt.hash('password123', 10)

  // 1. Create Super Admin
  await prisma.user.create({
    data: {
      email: 'admin@restrowala.com',
      password,
      name: 'Platform Admin',
      role: 'SUPER_ADMIN' as any,
    },
  })

  // 2. Define Restaurants Data
  const restaurants = [
    {
      id: 'res-sapphire',
      name: 'The Sapphire Grill',
      slug: 'the-sapphire-grill',
      email: 'contact@sapphiregrill.com',
      description: 'Premium Steakhouse & Fine Dining. Experience the finest cuts of meat and an exquisite wine selection.',
      address: '101 Luxury Lane, Downtown',
      openingTime: '17:00',
      closingTime: '23:00',
      staff: [
        { email: 'manager@sapphiregrill.com', name: 'Robert Ford', role: UserRole.MANAGER },
        { email: 'chef@sapphiregrill.com', name: 'Gordon Head', role: UserRole.KITCHEN_STAFF },
        { email: 'waiter@sapphiregrill.com', name: 'Alice Server', role: UserRole.WAITER },
        { email: 'cashier@sapphiregrill.com', name: 'Penny Cash', role: UserRole.CASHIER },
        { email: 'cleaner@sapphiregrill.com', name: 'Clean Carl', role: 'CLEANER' as any },
      ],
      categories: [
        {
          name: 'Starters', image: '/images/categories/starters.png', items: [
            { name: 'Truffle Mac & Cheese', price: 18.50, description: 'Creamy macaroni with black truffle oil', image: '/images/categories/starters.png' },
            { name: 'Calamari Fritti', price: 16.00, description: 'Crispy fried calamari with marinara dip' },
            { name: 'Wagyu Beef Sliders', price: 22.00, description: 'Mini burgers with caramelized onions' }
          ]
        },
        {
          name: 'Steaks & Grills', image: '/images/categories/steaks.png', items: [
            { name: 'Wagyu Ribeye (12oz)', price: 85.00, description: 'A5 Grade Japanese Wagyu', isFeatured: true, image: '/images/categories/steaks.png' },
            { name: 'Filet Mignon (8oz)', price: 55.00, description: 'Tender beef fillet with red wine reduction' },
            { name: 'Herb-Crusted Lamb Rack', price: 48.00, description: 'Served with roasted root vegetables' },
            { name: 'Grilled Salmon', price: 32.00, description: 'Atlantic salmon with lemon butter sauce' }
          ]
        },
        {
          name: 'Sides', items: [
            { name: 'Creamed Spinach', price: 9.00 },
            { name: 'Truffle Mashed Potatoes', price: 12.00 },
            { name: 'Grilled Asparagus', price: 10.00 }
          ]
        },
        {
          name: 'Desserts', items: [
            { name: 'Molten Lava Cake', price: 14.00 },
            { name: 'New York Cheesecake', price: 12.00 }
          ]
        }
      ],
      inventory: [
        { name: 'Wagyu Beef', unit: InventoryUnit.KG, quantity: 50, minQuantity: 10, costPerUnit: 120 },
        { name: 'Potatoes', unit: InventoryUnit.KG, quantity: 200, minQuantity: 20, costPerUnit: 0.5 },
        { name: 'Red Wine', unit: InventoryUnit.BOTTLE, quantity: 100, minQuantity: 15, costPerUnit: 25 },
        { name: 'Truffle Oil', unit: InventoryUnit.L, quantity: 5, minQuantity: 1, costPerUnit: 80 }
      ]
    },
    {
      id: 'res-pasta',
      name: 'Pasta Palace',
      slug: 'pasta-palace',
      email: 'hello@pastapalace.com',
      description: 'Authentic Hand-made Italian Pasta using traditional recipes passed down through generations.',
      address: '42 Little Italy Ave',
      openingTime: '11:00',
      closingTime: '22:00',
      staff: [
        { email: 'manager@pastapalace.com', name: 'Mario Rossi', role: UserRole.MANAGER },
        { email: 'chef@pastapalace.com', name: 'Luigi Verdi', role: UserRole.KITCHEN_STAFF },
        { email: 'waiter@pastapalace.com', name: 'Peach Toadstool', role: UserRole.WAITER },
        { email: 'cashier@pastapalace.com', name: 'Daisy Flower', role: UserRole.CASHIER },
        { email: 'cleaner@pastapalace.com', name: 'Toad Kin', role: 'CLEANER' as any },
      ],
      categories: [
        {
          name: 'Antipasti', image: '/images/categories/starters.png', items: [
            { name: 'Bruschetta Pomodoro', price: 10.00, description: 'Toasted bread with tomatoes and basil' },
            { name: 'Burrata with Pesto', price: 14.50, description: 'Fresh creamy cheese with basil pesto' },
            { name: 'Arancini', price: 12.00, description: 'Fried saffron risotto balls' }
          ]
        },
        {
          name: 'Pasta Classico', image: '/images/categories/pasta.png', items: [
            { name: 'Carbonara Authentica', price: 21.00, description: 'Guanciale, pecorino, egg yolk, black pepper', isFeatured: true, image: '/images/categories/pasta.png' },
            { name: 'Tagliatelle al Tartufo', price: 24.00, description: 'Fresh pork truffle pasta' },
            { name: 'Pappardelle Bolognese', price: 19.00, description: 'Slow-cooked beef ragu' },
            { name: 'Ravioli Ricotta', price: 18.00, description: 'Filled with spinach and ricotta' }
          ]
        },
        {
          name: 'Pizza', image: '/images/categories/pizza.png', items: [
            { name: 'Margherita', price: 15.00, description: 'Tomato, mozzarella, basil', image: '/images/categories/pizza.png' },
            { name: 'Diavola', price: 17.00, description: 'Spicy salami and chili oil' }
          ]
        },
        {
          name: 'Dolci', items: [
            { name: 'Tiramisu', price: 9.00, description: 'Coffee-soaked ladyfingers with mascarpone' },
            { name: 'Panna Cotta', price: 8.00, description: 'Vanilla cooked cream with berry coulis' }
          ]
        }
      ],
      inventory: [
        { name: 'Flour Type 00', unit: InventoryUnit.KG, quantity: 150, minQuantity: 20, costPerUnit: 1.2 },
        { name: 'Eggs', unit: InventoryUnit.PIECE, quantity: 500, minQuantity: 50, costPerUnit: 0.2 },
        { name: 'Parmesan Cheese', unit: InventoryUnit.KG, quantity: 20, minQuantity: 2, costPerUnit: 25 },
        { name: 'Tomatoes (Canned)', unit: InventoryUnit.CAN, quantity: 200, minQuantity: 20, costPerUnit: 1.5 }
      ]
    },
    {
      id: 'res-zen',
      name: 'Zen Sushi',
      slug: 'zen-sushi',
      email: 'zen@gensushi.com',
      description: 'Minimalist Japanese Culinary Art. Fresh fish flown in daily from Tsukiji Market.',
      address: '88 Sakura Blvd',
      openingTime: '12:00',
      closingTime: '23:00',
      staff: [
        { email: 'manager@zensushi.com', name: 'Kenji Sato', role: UserRole.MANAGER },
        { email: 'chef@zensushi.com', name: 'Jiro Ono', role: UserRole.KITCHEN_STAFF },
        { email: 'waiter@zensushi.com', name: 'Yuki Snow', role: UserRole.WAITER },
        { email: 'cashier@zensushi.com', name: 'Sakura Bloom', role: UserRole.CASHIER },
        { email: 'cleaner@zensushi.com', name: 'Clean San', role: 'CLEANER' as any },
      ],
      categories: [
        {
          name: 'Sashimi & Nigiri', image: '/images/categories/sushi.png', items: [
            { name: 'Bluefin Tuna (Otoro)', price: 12.00, description: 'Fatty tuna belly' },
            { name: 'Salmon Sashimi (5pcs)', price: 15.00, description: 'Fresh Atlantic salmon' },
            { name: 'Yellowtail Nigiri (2pcs)', price: 9.00, description: 'Hamachi with scallions' },
            { name: 'Uni (Sea Urchin)', price: 18.00, description: 'Fresh sea urchin from Hokkaido' }
          ]
        },
        {
          name: 'Signature Rolls', image: '/images/categories/sushi.png', items: [
            { name: 'Dragon Roll', price: 22.00, description: 'Eel, cucumber, topped with avocado', isFeatured: true, image: '/images/categories/sushi.png' },
            { name: 'Spicy Tuna Crunch', price: 18.00, description: 'Spicy tuna, tempura flakes' },
            { name: 'Rainbow Roll', price: 20.00, description: 'California roll topped with assorted fish' }
          ]
        },
        {
          name: 'Hot Kitchen', items: [
            { name: 'Miso Soup', price: 5.00 },
            { name: 'Chicken Teriyaki', price: 19.00 },
            { name: 'Shrimp Tempura', price: 16.00 }
          ]
        },
        {
          name: 'Sake & Drinks', items: [
            { name: 'Junmai Daiginjo (Glass)', price: 25.00 },
            { name: 'Green Tea', price: 4.00 }
          ]
        }
      ],
      inventory: [
        { name: 'Sushi Rice', unit: InventoryUnit.KG, quantity: 100, minQuantity: 10, costPerUnit: 3 },
        { name: 'Nori Sheets', unit: InventoryUnit.PACKET, quantity: 50, minQuantity: 5, costPerUnit: 15 },
        { name: 'Fresh Salmon', unit: InventoryUnit.KG, quantity: 30, minQuantity: 5, costPerUnit: 25 },
        { name: 'Wasabi', unit: InventoryUnit.KG, quantity: 2, minQuantity: 0.5, costPerUnit: 40 }
      ]
    }
  ]

  // 3. Loop through restaurants and create everything
  for (const resData of restaurants) {
    console.log(`🏗️ Building ${resData.name}...`)

    // Create Restaurant
    const restaurant = await prisma.restaurant.create({
      data: {
        id: resData.id,
        name: resData.name,
        slug: resData.slug,
        address: resData.address,
        phone: '+1 (555) 000-0000',
        email: resData.email,
        description: resData.description,
        openingTime: resData.openingTime,
        closingTime: resData.closingTime,
      },
    })

    // Create Staff
    for (const staffMember of resData.staff) {
      await prisma.user.create({
        data: {
          email: staffMember.email,
          password,
          name: staffMember.name,
          role: staffMember.role,
          restaurantId: restaurant.id,
        },
      })
    }

    // Create Tables with QR codes
    const tables = []
    for (let i = 1; i <= 10; i++) {
      // Randomly assign some tables as occupied
      const status = Math.random() > 0.7 ? TableStatus.OCCUPIED : TableStatus.AVAILABLE;
      const table = await prisma.table.create({
        data: {
          number: i,
          capacity: i % 2 === 0 ? 4 : 2, // Alternating capacity
          status: status,
          qrCode: `${resData.slug.substring(0, 3).toUpperCase()}-${i}`,
          restaurantId: restaurant.id,
          floor: i > 5 ? 'Mezzanine' : 'Main Floor',
          location: i % 3 === 0 ? 'Window View' : 'Central'
        },
      })
      tables.push(table)
    }

    // Create Categories and Menu Items
    const menuItems: any[] = []
    for (let i = 0; i < resData.categories.length; i++) {
      const catData = resData.categories[i]
      const category = await prisma.category.create({
        data: {
          name: catData.name,
          image: (catData as any).image || null,
          displayOrder: i + 1,
          restaurantId: restaurant.id,
        },
      })

      for (const item of catData.items as any[]) {
        const menuItem = await prisma.menuItem.create({
          data: {
            name: item.name,
            price: item.price,
            description: item.description || null,
            image: item.image || (catData as any).image || null,
            isFeatured: item.isFeatured || false,
            categoryId: category.id,
            restaurantId: restaurant.id,
            displayOrder: 1,
            isAvailable: true,
          },
        })
        menuItems.push(menuItem)
      }
    }

    // Create Inventory
    for (const invItem of resData.inventory) {
      await prisma.inventory.create({
        data: {
          ...invItem,
          restaurantId: restaurant.id,
        },
      })
    }

    // Create Dummy Orders (History)
    // Create ~20 orders per restaurant
    for (let i = 0; i < 20; i++) {
      const table = tables[Math.floor(Math.random() * tables.length)]
      const numItems = Math.floor(Math.random() * 4) + 1

      let orderTotal = 0
      const orderItemsData = []

      for (let j = 0; j < numItems; j++) {
        const menuItem = menuItems[Math.floor(Math.random() * menuItems.length)]
        const quantity = Math.floor(Math.random() * 2) + 1
        const subtotal = menuItem.price * quantity
        orderTotal += subtotal

        orderItemsData.push({
          menuItemId: menuItem.id,
          quantity,
          price: menuItem.price,
          subtotal
        })
      }

      const tax = orderTotal * 0.1
      const finalAmount = orderTotal + tax

      // Distribute dates over last 30 days
      const createdAt = randomDate(30)

      // Random status - mostly completed for history
      const status = Math.random() > 0.2 ? OrderStatus.COMPLETED : OrderStatus.SERVED;

      const order = await prisma.order.create({
        data: {
          orderNumber: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          tableId: table.id,
          restaurantId: restaurant.id,
          status,
          totalAmount: orderTotal,
          tax,
          finalAmount,
          customerName: `Guest ${Math.floor(Math.random() * 100)}`,
          createdAt,
          updatedAt: createdAt,
          completedAt: status === OrderStatus.COMPLETED ? new Date(createdAt.getTime() + 1000 * 60 * 60) : null, // Completed 1 hour later
          items: {
            create: orderItemsData
          }
        }
      })

      // Create Payment for completed orders
      if (status === OrderStatus.COMPLETED) {
        await prisma.payment.create({
          data: {
            amount: finalAmount,
            method: Math.random() > 0.5 ? PaymentMethod.CARD : PaymentMethod.CASH,
            status: PaymentStatus.COMPLETED,
            orderId: order.id,
            paidAt: new Date(createdAt.getTime() + 1000 * 60 * 60),
          }
        })
      }
    }
  }

  console.log('\n🎉 Database Reset & Comprehensive Seeding Complete!')
  console.log('You can now log in with:')
  console.log('  Admin: admin@restrowala.com / password123')
  console.log('  Managers: manager@sapphiregrill.com, etc. / password123')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
