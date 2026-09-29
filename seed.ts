import {
  createApiKeysWorkflow,
  createProductsWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createStockLocationsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
} from "@medusajs/medusa/core-flows"
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils"
import type { ExecArgs } from "@medusajs/framework/types"

/**
 * Seed script for the junior task.
 *
 * Creates:
 *   - a sales channel
 *   - a region (United States / USD)
 *   - a stock location
 *   - a publishable API key (used by the storefront)
 *   - a handful of sample products with prices and images
 *
 * Run with:  npm run seed   (from apps/backend)  or  npm run seed (from root)
 */
export default async function seed({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  logger.info("Seeding sample data...")

  // 1. Sales channel
  const { result: salesChannels } = await createSalesChannelsWorkflow(
    container
  ).run({
    input: {
      salesChannelsData: [{ name: "Default Sales Channel" }],
    },
  })
  const salesChannel = salesChannels[0]

  // 2. Region
  const { result: regions } = await createRegionsWorkflow(container).run({
    input: {
      regions: [
        {
          name: "United States",
          currency_code: "usd",
          countries: ["us"],
          payment_providers: ["pp_system_default"],
        },
      ],
    },
  })
  logger.info(`Created region: ${regions[0].name}`)

  // 3. Stock location
  const { result: stockLocations } = await createStockLocationsWorkflow(
    container
  ).run({
    input: {
      locations: [
        {
          name: "Main Warehouse",
          address: { city: "New York", country_code: "US", address_1: "" },
        },
      ],
    },
  })
  const stockLocation = stockLocations[0]

  await linkSalesChannelsToStockLocationWorkflow(container).run({
    input: {
      id: stockLocation.id,
      add: [salesChannel.id],
    },
  })

  // 4. Publishable API key for the storefront
  const { result: apiKeys } = await createApiKeysWorkflow(container).run({
    input: {
      api_keys: [
        {
          title: "Storefront",
          type: "publishable",
          created_by: "seed-script",
        },
      ],
    },
  })
  const publishableKey = apiKeys[0]

  await linkSalesChannelsToApiKeyWorkflow(container).run({
    input: {
      id: publishableKey.id,
      add: [salesChannel.id],
    },
  })

  // 5. Sample products
  const sampleProducts = [
    {
      title: "Classic Cotton T-Shirt",
      handle: "classic-cotton-tshirt",
      description: "A soft, everyday cotton t-shirt.",
      thumbnail:
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600",
      price: 2500,
    },
    {
      title: "Canvas Sneakers",
      handle: "canvas-sneakers",
      description: "Lightweight canvas sneakers for casual wear.",
      thumbnail:
        "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600",
      price: 5900,
    },
    {
      title: "Leather Wallet",
      handle: "leather-wallet",
      description: "A slim leather wallet with card slots.",
      thumbnail:
        "https://images.unsplash.com/photo-1627123424574-724758594e93?w=600",
      price: 3900,
    },
    {
      title: "Ceramic Coffee Mug",
      handle: "ceramic-coffee-mug",
      description: "A 350ml ceramic mug, dishwasher safe.",
      thumbnail:
        "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600",
      price: 1500,
    },
    {
      title: "Wool Beanie",
      handle: "wool-beanie",
      description: "A warm knitted wool beanie.",
      thumbnail:
        "https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=600",
      price: 2000,
    },
    {
      title: "Stainless Water Bottle",
      handle: "stainless-water-bottle",
      description: "Insulated 500ml stainless steel bottle.",
      thumbnail:
        "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600",
      price: 3200,
    },
  ]

  await createProductsWorkflow(container).run({
    input: {
      products: sampleProducts.map((p) => ({
        title: p.title,
        handle: p.handle,
        description: p.description,
        status: "published" as const,
        thumbnail: p.thumbnail,
        images: [{ url: p.thumbnail }],
        options: [{ title: "Size", values: ["One Size"] }],
        variants: [
          {
            title: "One Size",
            options: { Size: "One Size" },
            manage_inventory: false,
            prices: [{ amount: p.price, currency_code: "usd" }],
          },
        ],
        sales_channels: [{ id: salesChannel.id }],
      })),
    },
  })

  const { data: allProducts } = await query.graph({
    entity: "product",
    fields: ["id"],
  })

  logger.info(`Seeded ${allProducts.length} products.`)
  logger.info("-----------------------------------------------------")
  logger.info("COPY THIS into apps/storefront/.env.local:")
  logger.info(`NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=${publishableKey.token}`)
  logger.info("-----------------------------------------------------")
}
