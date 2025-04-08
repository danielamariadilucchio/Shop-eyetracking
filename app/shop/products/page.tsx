"use client"

import type React from "react"

import { useEffect, useState, useCallback, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Container, Row, Col, Card, Button, Form, Badge } from "react-bootstrap"
import Image from "next/image"
import { Heart } from "lucide-react"
import MainLayout from "@/components/main-layout"
import { useCart } from "@/context/cart-context"
import { useFavorites } from "@/context/favorites-context"
import { products } from "@/data/products"
import type { ProductType } from "@/types/product"

export default function ProductsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { addToCart } = useCart()
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites()
  const [mounted, setMounted] = useState(false)

  // Stato unico per tutti i prodotti filtrati
  const [displayedProducts, setDisplayedProducts] = useState<ProductType[]>([])

  // Stati UI controllati
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)
  const [searchInput, setSearchInput] = useState("")
  const [sortOption, setSortOption] = useState("featured")

  // Ref per tenere traccia dei parametri precedenti
  const prevParamsRef = useRef<{
    category: string | null
    search: string | null
    id: string | null
  }>({ category: null, search: null, id: null })

  // Funzione per aggiornare i prodotti visualizzati
  const updateDisplayedProducts = useCallback(
    (category: string | null, search: string, sort: string, productId: string | null) => {
      // Filtro prodotti
      let filtered = [...products]

      // Filtro per ID se specificato
      if (productId) {
        filtered = filtered.filter((product) => product.id === Number.parseInt(productId))
      }
      // Altrimenti applico filtri normali
      else {
        // Filtro per categoria
        if (category) {
          filtered = filtered.filter((product) => product.category === category)
        }

        // Filtro per termine di ricerca
        if (search) {
          const searchLower = search.toLowerCase()
          filtered = filtered.filter(
            (product) =>
              product.name.toLowerCase().includes(searchLower) ||
              product.description.toLowerCase().includes(searchLower),
          )
        }
      }

      // Ordino prodotti
      switch (sort) {
        case "price-low":
          filtered.sort((a, b) => a.price - b.price)
          break
        case "price-high":
          filtered.sort((a, b) => b.price - a.price)
          break
        case "name":
          filtered.sort((a, b) => a.name.localeCompare(b.name))
          break
        // Per default (featured), non faccio nulla
      }

      setDisplayedProducts(filtered)
    },
    [],
  )

  // Inizializzazione e gestione dei parametri di ricerca
  useEffect(() => {
    if (!mounted) {
      setMounted(true)
      // Mostro tutti i prodotti all'inizio
      setDisplayedProducts([...products])
    } else {
      // Ottengo i parametri dall'URL
      const urlCategory = searchParams?.get("category")
      const urlSearch = searchParams?.get("search")
      const urlId = searchParams?.get("id")

      // Verifico se i parametri sono cambiati
      const categoryChanged = urlCategory !== prevParamsRef.current.category
      const searchChanged = urlSearch !== prevParamsRef.current.search
      const idChanged = urlId !== prevParamsRef.current.id

      // Aggiorno solo se necessario
      if (categoryChanged || searchChanged || idChanged) {
        // Aggiorno i riferimenti
        prevParamsRef.current = {
          category: urlCategory,
          search: urlSearch,
          id: urlId,
        }

        // Aggiorno lo stato solo se necessario
        if (categoryChanged) {
          setCategoryFilter(urlCategory)
        }

        if (searchChanged && urlSearch) {
          setSearchInput(urlSearch)
        }

        // Aggiorno i prodotti visualizzati
        updateDisplayedProducts(urlCategory || null, urlSearch || "", sortOption, urlId || null)
      }
    }
  }, [searchParams, mounted, updateDisplayedProducts, sortOption])

  // Gestori eventi
  const handleCategoryClick = (category: string | null) => {
    // Aggiorno l'URL con il nuovo parametro di categoria
    if (category) {
      router.push(`/shop/products?category=${category}`)
    } else {
      router.push("/shop/products")
    }
  }

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSort = e.target.value
    setSortOption(newSort)
    updateDisplayedProducts(categoryFilter, searchInput, newSort, null)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateDisplayedProducts(categoryFilter, searchInput, sortOption, null)
  }

  const handleAddToCart = (product: ProductType) => {
    addToCart(product)
    alert(`${product.name} aggiunto al carrello!`)
  }

  const handleToggleFavorite = (product: ProductType) => {
    if (isFavorite(product.id)) {
      removeFromFavorites(product.id)
    } else {
      addToFavorites(product)
    }
  }

  const handleProductClick = (productId: number) => {
    router.push(`/shop/products/${productId}`)
  }

  // Formatto il prezzo in euro
  const formatPrice = (price: number) => {
    return price.toFixed(2).replace(".", ",") + " €"
  }

  if (!mounted) {
    return null // Prevengo problemi SSR
  }

  return (
    <MainLayout>
      <Container className="py-4">
        <h1 className="mb-4">
          {categoryFilter
            ? `Prodotti: ${
                categoryFilter === "electronics"
                  ? "Elettronica"
                  : categoryFilter === "clothing"
                    ? "Abbigliamento"
                    : "Casa & Cucina"
              }`
            : "Tutti i Prodotti"}
        </h1>

        {/* Filtri e Ordinamento */}
        <Row className="mb-4">
          <Col md={6} lg={8}>
            <div className="d-flex flex-wrap gap-2">
              <Button
                variant={categoryFilter === null ? "primary" : "outline-primary"}
                onClick={() => handleCategoryClick(null)}
                className="mb-2"
              >
                Tutti
              </Button>
              <Button
                variant={categoryFilter === "electronics" ? "primary" : "outline-primary"}
                onClick={() => handleCategoryClick("electronics")}
                className="mb-2"
              >
                Elettronica
              </Button>
              <Button
                variant={categoryFilter === "clothing" ? "primary" : "outline-primary"}
                onClick={() => handleCategoryClick("clothing")}
                className="mb-2"
              >
                Abbigliamento
              </Button>
              <Button
                variant={categoryFilter === "home" ? "primary" : "outline-primary"}
                onClick={() => handleCategoryClick("home")}
                className="mb-2"
              >
                Casa & Cucina
              </Button>
            </div>
          </Col>
          <Col md={6} lg={4}>
            <Form onSubmit={handleSearchSubmit}>
              <div className="d-flex gap-2 align-items-center justify-content-md-end">
                <Form.Control
                  type="search"
                  placeholder="Cerca prodotti..."
                  value={searchInput}
                  onChange={handleSearchChange}
                  className="w-auto flex-grow-1"
                />
                <Button type="submit" variant="outline-primary" className="d-none d-md-block">
                  Cerca
                </Button>
                <Form.Select value={sortOption} onChange={handleSortChange} className="w-auto">
                  <option value="featured">In evidenza</option>
                  <option value="price-low">Prezzo: basso-alto</option>
                  <option value="price-high">Prezzo: alto-basso</option>
                  <option value="name">Nome</option>
                </Form.Select>
              </div>
            </Form>
          </Col>
        </Row>

        {/* Prodotti */}
        {displayedProducts.length === 0 ? (
          <div className="text-center py-5">
            <h3>Nessun prodotto trovato</h3>
            <p>Prova a modificare i filtri di ricerca</p>
          </div>
        ) : (
          <Row>
            {displayedProducts.map((product) => (
              <Col key={product.id} md={6} lg={4} xl={3} className="mb-4">
                <Card className="h-100 shadow-sm">
                  <div
                    className="position-relative cursor-pointer"
                    style={{ height: "200px" }}
                    onClick={() => handleProductClick(product.id)}
                  >
                    <Image
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      fill
                      style={{ objectFit: "cover" }}
                    />
                    <button
                      className="position-absolute top-0 end-0 m-2 btn btn-light rounded-circle p-1"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleToggleFavorite(product)
                      }}
                      style={{ width: "36px", height: "36px" }}
                    >
                      {isFavorite(product.id) ? (
                        <Heart size={20} fill="#dc3545" color="#dc3545" />
                      ) : (
                        <Heart size={20} />
                      )}
                    </button>
                  </div>
                  <Card.Body className="d-flex flex-column">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <Card.Title className="mb-0 cursor-pointer" onClick={() => handleProductClick(product.id)}>
                        {product.name}
                      </Card.Title>
                      <Badge bg="primary" className="ms-2">
                        {product.category === "electronics"
                          ? "Elettronica"
                          : product.category === "clothing"
                            ? "Abbigliamento"
                            : "Casa"}
                      </Badge>
                    </div>
                    <Card.Text className="text-danger fw-bold mb-2">{formatPrice(product.price)}</Card.Text>
                    <Card.Text
                      className="mb-4 flex-grow-1 cursor-pointer"
                      onClick={() => handleProductClick(product.id)}
                    >
                      {product.description.substring(0, 100)}...
                    </Card.Text>
                    <div className="d-flex gap-2">
                      <Button
                        variant="outline-primary"
                        className="flex-grow-1"
                        onClick={() => handleProductClick(product.id)}
                      >
                        Vedi Dettagli
                      </Button>
                      <Button variant="primary" onClick={() => handleAddToCart(product)}>
                        Aggiungi
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </MainLayout>
  )
}
