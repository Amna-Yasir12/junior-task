"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { medusa, formatPrice } from "@/lib/medusa"
import type { HttpTypes } from "@medusajs/types"

type Product = HttpTypes.StoreProduct

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function load() {
      try {
        setLoading(true)
        setError(null)
        // Fetch products live from the Medusa Store API — not hard-coded.
        const { products } = await medusa.store.product.list({
          limit: 50,
          fields: "id,title,handle,thumbnail,*variants.calculated_price",
        })
        if (active) setProducts(products)
      } catch (e) {
        console.error(e)
        if (active)
          setError(
            "Could not load products. Is the backend running and is the publishable key set?"
          )
      } finally {
        if (active) setLoading(false)
      }
    }

    load()
    return () => {
      active = false
    }
  }, [])

  if (loading) {
    return (
      <main className="container">
        <p className="state">Loading products…</p>
      </main>
    )
  }

  if (error) {
    return (
      <main className="container">
        <p className="state error">{error}</p>
      </main>
    )
  }

  if (products.length === 0) {
    return (
      <main className="container">
        <p className="state">No products found. Run the seed script on the backend.</p>
      </main>
    )
  }

  return (
    <main className="container">
      <div className="grid">
        {products.map((product) => {
          const price = product.variants?.[0]?.calculated_price
          return (
            <Link
              key={product.id}
              href={`/products/${product.handle}`}
              className="card"
            >
              {/* Plain <img> keeps the sample simple; swap for next/image if desired. */}
              <img
                src={product.thumbnail || "/placeholder.png"}
                alt={product.title}
              />
              <div className="body">
                <div className="title">{product.title}</div>
                <div className="price">
                  {price?.calculated_amount != null
                    ? formatPrice(
                        price.calculated_amount,
                        price.currency_code || "usd"
                      )
                    : "—"}
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </main>
  )
}
