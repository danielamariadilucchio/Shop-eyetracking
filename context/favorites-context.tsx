"use client"

import type React from "react"
import type { ProductType } from "@/types/product"

import { createContext, useContext, useState, useEffect } from "react"

// Definisco il tipo del contesto dei preferiti
interface FavoritesContextType {
  favorites: ProductType[]
  addToFavorites: (product: ProductType) => void
  removeFromFavorites: (productId: number) => void
  isFavorite: (productId: number) => boolean
  clearFavorites: () => void
}

// Creo il contesto dei preferiti
const FavoritesContext = createContext<FavoritesContextType>({
  favorites: [],
  addToFavorites: () => {},
  removeFromFavorites: () => {},
  isFavorite: () => false,
  clearFavorites: () => {},
})

// Creo il provider dei preferiti
export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<ProductType[]>([])
  const [mounted, setMounted] = useState(false)

  // Inizializzo i preferiti dal localStorage quando il componente viene montato
  useEffect(() => {
    setMounted(true)
    const storedFavorites = localStorage.getItem("favorites")
    if (storedFavorites) {
      try {
        setFavorites(JSON.parse(storedFavorites))
      } catch (error) {
        console.error("Errore nel parsing dei preferiti dal localStorage:", error)
        localStorage.removeItem("favorites")
      }
    }
  }, [])

  // Aggiorno il localStorage quando i preferiti cambiano
  useEffect(() => {
    if (mounted) {
      localStorage.setItem("favorites", JSON.stringify(favorites))
    }
  }, [favorites, mounted])

  // Aggiungo un prodotto ai preferiti
  const addToFavorites = (product: ProductType) => {
    setFavorites((prevFavorites) => {
      // Verifico se il prodotto è già nei preferiti
      if (prevFavorites.some((item) => item.id === product.id)) {
        return prevFavorites
      }
      // Aggiungo il nuovo prodotto
      return [...prevFavorites, product]
    })
  }

  // Rimuovo un prodotto dai preferiti
  const removeFromFavorites = (productId: number) => {
    setFavorites((prevFavorites) => prevFavorites.filter((item) => item.id !== productId))
  }

  // Verifico se un prodotto è nei preferiti
  const isFavorite = (productId: number) => {
    return favorites.some((item) => item.id === productId)
  }

  // Svuoto i preferiti
  const clearFavorites = () => {
    setFavorites([])
  }

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        addToFavorites,
        removeFromFavorites,
        isFavorite,
        clearFavorites,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  )
}

// Creo un hook per usare il contesto dei preferiti
export const useFavorites = () => useContext(FavoritesContext)

