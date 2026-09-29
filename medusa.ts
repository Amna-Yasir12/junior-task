import Medusa from "@medusajs/js-sdk"

/**
 * Shared Medusa Store API client.
 * The storefront talks to the backend ONLY through this SDK + a publishable key —
 * it never touches the database directly.
 */
export const medusa = new Medusa({
  baseUrl:
    process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000",
  publishableKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
})

/** Format an amount (in the currency's minor units, e.g. cents) for display. */
export function formatPrice(amount: number, currency = "usd"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount / 100)
}
