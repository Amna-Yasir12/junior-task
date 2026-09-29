"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { medusa, formatPrice } from "@/lib/medusa"
import type { HttpTypes } from "@medusajs/types"

type Product = HttpTypes.StoreProduct

export default function ProductDetailPage() {
  const params = useParams<{ handle: string }>()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function load() {
      try {
        setLoading(true)
        setError(null)
        const { products } = await medusa.store.product.list({
          handle: params.handle,
          fields:
            "id,title,handle,description,thumbnail,images.url,*variants.calculated_price",
        })
        if (active) setProduct(products[0] ?? null)
      } catch (e) {
        console.error(e)
        if (active) setError("Could not load this product.")
      } finally {
        if (active) setLoading(false)
      }
    }

    load()
    return () => {
      active = false
    }
  }, [params.handle])

  if (loading)
    return (
      <main className="container">
        <p className="state">Loading…</p>
      </main>
    )

  if (error)
    return (
      <main className="container">
        <p className="state error">{error}</p>
      </main>
    )

  if (!product)
    return (
      <main className="container">
        <p className="state">Product not found.</p>
        <p style={{ textAlign: "center" }}>
          <Link className="back" href="/products">
            ← Back to products
          </Link>
        </p>
      </main>
    )

  const price = product.variants?.[0]?.calculated_price

  return (
    <main className="container">
      <Link className="back" href="/products">
        ← Back to products
      </Link>
      <div className="detail">
        <img
          src={product.thumbnail || "/placeholder.png"}
          alt={product.title}
        />
        <div>
          <h2>{product.title}</h2>
          <div className="price">
            {price?.calculated_amount != null
              ? formatPrice(
                  price.calculated_amount,
                  price.currency_code || "usd"
                )
              : "—"}
          </div>
          <p>{product.description}</p>
        </div>
      </div>
    </main>
  )
}
