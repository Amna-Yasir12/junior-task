import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * A small custom Store API endpoint that goes beyond the stock Medusa routes.
 *
 * GET /store/custom-greeting
 *
 * It returns a friendly message plus a live count of published products,
 * read through the Query layer — showing how to add your own endpoint on top
 * of the framework.
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const { data: products } = await query.graph({
    entity: "product",
    fields: ["id"],
    filters: { status: "published" },
  })

  res.json({
    message: "Hello from the custom Medusa endpoint!",
    published_product_count: products.length,
    timestamp: new Date().toISOString(),
  })
}
