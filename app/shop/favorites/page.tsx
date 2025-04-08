"use client"

import { useState, useEffect } from "react"
import { Container, Row, Col, Card, Button } from "react-bootstrap"
import Image from "next/image"
import Link from "next/link"
import { Heart, ShoppingCart, ArrowLeft, Trash2 } from "lucide-react"
import MainLayout from "@/components/main-layout"
import { useFavorites } from "@/context/favorites-context"
import { useCart } from "@/context/cart-context"

export default function FavoritesPage() {
  const { favorites, removeFromFavorites, clearFavorites } = useFavorites()
  const { addToCart } = useCart()
  const [mounted, setMounted] = useState(false)

  // Eseguo solo lato client
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleRemoveFromFavorites = (productId: number) => {
    removeFromFavorites(productId)
  }

  const handleAddToCart = (productId: number) => {
    const product = favorites.find((item) => item.id === productId)
    if (product) {
      addToCart(product)
      alert(`${product.name} aggiunto al carrello!`)
    }
  }

  // Formatto il prezzo in euro
  const formatPrice = (price: number) => {
    return price.toFixed(2).replace(".", ",") + " €"
  }

  if (!mounted) return null

  return (
    <MainLayout>
      <Container className="py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1>I Miei Preferiti</h1>
          {favorites.length > 0 && (
            <Button variant="outline-danger" onClick={() => clearFavorites()}>
              <Trash2 size={18} className="me-2" />
              Svuota Preferiti
            </Button>
          )}
        </div>

        {favorites.length === 0 ? (
          <Card className="shadow-sm">
            <Card.Body className="p-5 text-center">
              <div className="mb-4">
                <Heart size={64} className="text-muted" />
              </div>
              <h3>Non hai ancora prodotti preferiti</h3>
              <p className="text-muted mb-4">
                Aggiungi prodotti ai preferiti cliccando sull'icona del cuore nella pagina dei prodotti.
              </p>
              <Link href="/shop/products" passHref>
                <Button variant="primary">Sfoglia Prodotti</Button>
              </Link>
            </Card.Body>
          </Card>
        ) : (
          <>
            <Row>
              {favorites.map((product) => (
                <Col key={product.id} md={6} lg={4} xl={3} className="mb-4">
                  <Card className="h-100 shadow-sm">
                    <div className="position-relative" style={{ height: "200px" }}>
                      <Image
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        fill
                        style={{ objectFit: "cover" }}
                      />
                      <button
                        className="position-absolute top-0 end-0 m-2 btn btn-light rounded-circle p-1"
                        onClick={() => handleRemoveFromFavorites(product.id)}
                        style={{ width: "36px", height: "36px" }}
                        title="Rimuovi dai preferiti"
                      >
                        <Heart size={20} fill="#dc3545" color="#dc3545" />
                      </button>
                    </div>
                    <Card.Body className="d-flex flex-column">
                      <Card.Title>{product.name}</Card.Title>
                      <Card.Text className="text-danger fw-bold mb-2">{formatPrice(product.price)}</Card.Text>
                      <Card.Text className="mb-4 flex-grow-1">{product.description.substring(0, 100)}...</Card.Text>
                      <div className="d-flex gap-2">
                        <Button variant="primary" className="flex-grow-1" onClick={() => handleAddToCart(product.id)}>
                          <ShoppingCart size={18} className="me-2" />
                          Aggiungi al Carrello
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>

            <div className="mt-4">
              <Link href="/shop/products" passHref>
                <Button variant="outline-primary" className="d-flex align-items-center">
                  <ArrowLeft size={16} className="me-2" />
                  Continua lo Shopping
                </Button>
              </Link>
            </div>
          </>
        )}
      </Container>
    </MainLayout>
  )
}

