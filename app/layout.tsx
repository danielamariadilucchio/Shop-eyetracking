import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { EyeTrackingProvider } from "@/context/eye-tracking-context"
import { CartProvider } from "@/context/cart-context"
import { FavoritesProvider } from "@/context/favorites-context"
import PageChangeTracker from "@/components/page-change-tracker"

export const metadata: Metadata = {
  title: "ShopEyeTracking",
  description: "E-commerce with eye tracking capabilities",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <EyeTrackingProvider>
          <CartProvider>
            <FavoritesProvider>
              <PageChangeTracker />
              {children}
            </FavoritesProvider>
          </CartProvider>
        </EyeTrackingProvider>
      </body>
    </html>
  )
}

import "./globals.css"



import './globals.css'