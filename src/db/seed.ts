/* eslint-disable drizzle/enforce-delete-with-where */

import {
  authLinks,
  evaluations,
  orders,
  products,
  restaurants,
  users,
} from './schema'
import { faker } from '@faker-js/faker'
import { db } from './connection'
import chalk from 'chalk'
import { orderItems } from './schema/order-items'
import { createId } from '@paralleldrive/cuid2'

interface SeedDatabaseProps {
  email?: string
  managerName?: string
  restaurantName?: string
}

export async function seedDatabase({
  email,
  managerName,
  restaurantName,
}: SeedDatabaseProps = {}) {
  /**
   * Reset database
   */

  await db.delete(orderItems)
  await db.delete(orders)
  await db.delete(evaluations)
  await db.delete(products)
  await db.delete(restaurants)
  await db.delete(authLinks)
  await db.delete(users)

  console.log(chalk.yellow('✔ Database reset'))

  console.log(chalk.blue('--------------------'))

  /**
   * Create customers
   */

  const [customer1, customer2] = await db
    .insert(users)
    .values([
      {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        role: 'customer',
      },
      {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        role: 'customer',
      },
    ])
    .returning()

  console.log(chalk.yellow('✔ Created customers'))

  /**
   * Create managers
   */

  const defaultEmail = 'test@test.com'

  const managerEmails = [defaultEmail]

  if (email && email !== defaultEmail) {
    managerEmails.push(email)
  }

  const managers = await db
    .insert(users)
    .values(
      managerEmails.map((managerEmail) => ({
        name:
          managerEmail === defaultEmail
            ? faker.person.fullName()
            : (managerName as string),
        email: managerEmail,
        role: 'manager' as const,
      })),
    )
    .returning()

  console.log(chalk.yellow('✔ Created managers'))

  /**
   * Create restaurant
   */

  for (const manager of managers) {
    const [restaurant] = await db
      .insert(restaurants)
      .values({
        name:
          manager.email === defaultEmail
            ? faker.company.name()
            : (restaurantName as string),
        description: faker.lorem.paragraph(),
        managerId: manager.id,
      })
      .returning()

    console.log(
      chalk.yellow(`✔ Created restaurant for manager ${manager.email}`),
    )

    /**
     * Create products
     */

    const availableProducts = await db
      .insert(products)
      .values(
        Array.from({ length: 9 }).map(() => ({
          name: faker.commerce.productName(),
          priceInCents: Number(
            faker.commerce.price({
              min: 190,
              max: 490,
              dec: 0,
            }),
          ),
          restaurantId: restaurant.id,
          description: faker.commerce.productDescription(),
        })),
      )
      .returning()

    console.log(chalk.yellow('✔ Created products'))

    const ordersToInsert: (typeof orders.$inferInsert)[] = []
    const orderItemsToPush: (typeof orderItems.$inferInsert)[] = []

    for (let i = 0; i < 200; i++) {
      const orderId = createId()

      const orderProducts = faker.helpers.arrayElements(availableProducts, {
        min: 1,
        max: 3,
      })

      let totalInCents = 0

      orderProducts.forEach((orderProduct) => {
        const quantity = faker.number.int({
          min: 1,
          max: 3,
        })

        totalInCents += orderProduct.priceInCents * quantity

        orderItemsToPush.push({
          orderId,
          productId: orderProduct.id,
          priceInCents: orderProduct.priceInCents,
          quantity,
        })
      })

      ordersToInsert.push({
        id: orderId,
        customerId: faker.helpers.arrayElement([customer1.id, customer2.id]),
        restaurantId: restaurant.id,
        status: faker.helpers.arrayElement([
          'pending',
          'canceled',
          'processing',
          'delivering',
          'delivered',
        ]),
        totalInCents,
        createdAt: faker.date.recent({
          days: 40,
        }),
      })
    }

    await db.insert(orders).values(ordersToInsert)
    await db.insert(orderItems).values(orderItemsToPush)

    console.log(chalk.yellow('✔ Created orders'))
  }

  console.log(chalk.greenBright('Database seeded successfully!'))

  // process.exit()
}

seedDatabase()
