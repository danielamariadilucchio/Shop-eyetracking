// Step 1: Create a page.tsx file for the server component with generateStaticParams
// File: /app/shop/products/[id]/page.tsx

import { products } from "@/data/products"
import ProductDetailClient from "./product-detail-client"
import type { ProductType } from "@/types/product"

// Server component that can use generateStaticParams
export async function generateStaticParams() {
  return products.map((product) => ({
    id: product.id.toString(),
  }))
}

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  // Get the product data on the server
  const productId = Number.parseInt(params.id)
  const product = products.find((p) => p.id === productId) || null
  
  // Find related products
  const relatedProducts = product 
    ? products
        .filter((p) => p.category === product.category && p.id !== product.id)
        .slice(0, 3)
    : []

  // Pass the data as props to the client component
  return <ProductDetailClient product={product} relatedProducts={relatedProducts} />
}