import "./globals.css"
import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Sample Store",
  description: "Junior task storefront powered by Medusa",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <header className="header">
          <div className="container" style={{ padding: "0 20px" }}>
            <h1>
              <Link href="/products">Sample Store</Link>
            </h1>
          </div>
        </header>
        {children}
      </body>
    </html>
  )
}
