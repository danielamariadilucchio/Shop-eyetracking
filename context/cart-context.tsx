"use client"

import type React from "react"
import type { ProductType } from "@/types/product"

import { createContext, useContext, useState, useEffect } from "react"

// Definizione del tipo di oggetto nel carrello
export interface CartItem extends ProductType {
  quantity: number
}

// Definizione del tipo di contesto per il carrello
interface CartContextType {
  cartItems: CartItem[]
  addToCart: (product: ProductType, quantity?: number) => void
  removeFromCart: (productId: number) => void
  updateQuantity: (productId: number, quantity: number) => void
  clearCart: () => void
  getTotalPrice: () => number
}

// Creazione del contesto del carrello
const CartContext = createContext<CartContextType>({
  cartItems: [],
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  getTotalPrice: () => 0,
})

// Componente provider del carrello
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [mounted, setMounted] = useState(false)

  // Inizializza il carrello da localStorage quando il componente viene montato
  useEffect(() => {
    setMounted(true)
    const storedCart = localStorage.getItem("cart")
    if (storedCart) {
      try {
        setCartItems(JSON.parse(storedCart))
      } catch (error) {
        console.error("Errore durante il parsing del carrello da localStorage:", error)
        localStorage.removeItem("cart")
      }
    }
  }, [])

  // Aggiorna localStorage quando cambia il contenuto del carrello
  useEffect(() => {
    if (mounted) {
      localStorage.setItem("cart", JSON.stringify(cartItems))
    }
  }, [cartItems, mounted])

  // Aggiunge un prodotto al carrello
  const addToCart = (product: ProductType, quantity = 1) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id)

      if (existingItem) {
        // Se l'articolo esiste già, aggiorna la quantità
        return prevItems.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item,
        )
      } else {
        // Altrimenti, aggiungi il nuovo articolo
        return [...prevItems, { ...product, quantity }]
      }
    })
  }

  // Rimuove un prodotto dal carrello
  const removeFromCart = (productId: number) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId))
  }

  // Aggiorna la quantità di un prodotto nel carrello
  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }

    setCartItems((prevItems) => prevItems.map((item) => (item.id === productId ? { ...item, quantity } : item)))
  }

  // Svuota completamente il carrello
  const clearCart = () => {
    setCartItems([])
  }

  // Calcola il prezzo totale degli articoli nel carrello
  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

// Hook personalizzato per usare il contesto del carrello
export const useCart = () => useContext(CartContext)
