"use client";

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Container, Row, Col, Card, Button, Badge, Form, Tabs, Tab, Alert } from "react-bootstrap"
import Image from "next/image"
import Link from "next/link"
import { Heart, ShoppingCart, ArrowLeft, Star, StarHalf, Plus, Minus, Check, Info } from "lucide-react"
import MainLayout from "@/components/main-layout"
import { useCart } from "@/context/cart-context"
import { useFavorites } from "@/context/favorites-context"
import type { ProductType } from "@/types/product"

interface ProductDetailClientProps {
  product: ProductType | null
  relatedProducts: ProductType[]
}

export default function ProductDetailClient({ product, relatedProducts }: ProductDetailClientProps) {
  const router = useRouter()
  const { addToCart } = useCart()
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites()
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState("description")
  const [mounted, setMounted] = useState(false)
  const [subscriptionOption, setSubscriptionOption] = useState("one-time")

  // Eseguo solo lato client
  useEffect(() => {
    setMounted(true)
    
    // Redirect if no product (this is a fallback in case server-side props aren't available)
    if (!product) {
      router.push("/shop/products")
    }
  }, [product, router])

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1) {
      setQuantity(newQuantity)
    }
  }

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity)
      alert(`${product.name} aggiunto al carrello!`)
    }
  }

  const handleToggleFavorite = () => {
    if (!product) return

    if (isFavorite(product.id)) {
      removeFromFavorites(product.id)
    } else {
      addToFavorites(product)
    }
  }

  // Formatto il prezzo in euro
  const formatPrice = (price: number) => {
    return price.toFixed(2).replace(".", ",") + " €"
  }

  // Genero stelle per le recensioni
  const renderStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`star-${i}`} className="text-warning" fill="#ffc107" />)
    }

    if (hasHalfStar) {
      stars.push(<StarHalf key="half-star" className="text-warning" fill="#ffc107" />)
    }

    const emptyStars = 5 - stars.length
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="text-muted" />)
    }

    return stars
  }

  if (!mounted || !product) return null

  return (
    <MainLayout>
      <Container className="py-4">
        {/* Breadcrumb */}
        <div className="mb-4">
          <Link href="/shop/products" className="text-decoration-none text-muted d-flex align-items-center">
            <ArrowLeft size={16} className="me-2" />
            Torna ai prodotti
          </Link>
        </div>

        <Row className="mb-5">
          {/* Immagine prodotto */}
          <Col lg={6} className="mb-4 mb-lg-0">
            <Card className="border-0 shadow-sm">
              <div className="position-relative" style={{ height: "400px" }}>
                <Image
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  fill
                  style={{ objectFit: "cover" }}
                  priority
                />
                <button
                  className="position-absolute top-0 end-0 m-3 btn btn-light rounded-circle p-2"
                  onClick={handleToggleFavorite}
                  style={{ width: "46px", height: "46px" }}
                >
                  {isFavorite(product.id) ? <Heart size={24} fill="#dc3545" color="#dc3545" /> : <Heart size={24} />}
                </button>
              </div>
            </Card>
          </Col>

          {/* Dettagli prodotto */}
          <Col lg={6}>
            <div className="mb-2">
              <Badge
                bg={
                  product.category === "electronics" ? "info" : product.category === "clothing" ? "success" : "danger"
                }
              >
                {product.category === "electronics"
                  ? "Elettronica"
                  : product.category === "clothing"
                    ? "Abbigliamento"
                    : "Casa & Cucina"}
              </Badge>
            </div>

            <h1 className="mb-2">{product.name}</h1>

            <div className="d-flex align-items-center mb-3">
              <div className="d-flex me-2">{renderStars(4.5)}</div>
              <span className="text-muted">4.5 (128 recensioni)</span>
            </div>

            <h2 className="text-danger fw-bold mb-4">{formatPrice(product.price)}</h2>

            <div className="mb-4">
              <h5>Perché Scegliere Questo Prodotto</h5>
              <ul className="list-unstyled">
                <li className="mb-2 d-flex align-items-start">
                  <Check size={20} className="text-success me-2 flex-shrink-0 mt-1" />
                  <span>Qualità premium garantita</span>
                </li>
                <li className="mb-2 d-flex align-items-start">
                  <Check size={20} className="text-success me-2 flex-shrink-0 mt-1" />
                  <span>Design elegante e funzionale</span>
                </li>
            <li className="d-flex align-items-start">
                  <Check size={20} className="text-success me-2 flex-shrink-0 mt-1" />
                  <span>Assistenza clienti dedicata</span>
                </li>
              </ul>
            </div>

            {/* Opzioni di acquisto */}
            <Card className="mb-4 border-0 shadow-sm">
              <Card.Body>
                <h5 className="mb-3">Seleziona un'opzione</h5>

                <div className="mb-3">
                  <Form.Check
                    type="radio"
                    id="one-time-purchase"
                    name="purchase-option"
                    label={
                      <div>
                        <span className="fw-bold">Acquisto singolo</span>
                        <span className="ms-2">{formatPrice(product.price)}</span>
                      </div>
                    }
                    checked={subscriptionOption === "one-time"}
                    onChange={() => setSubscriptionOption("one-time")}
                    className="mb-2"
                  />

                  <Form.Check
                    type="radio"
                    id="subscription"
                    name="purchase-option"
                    label={
                      <div>
                        <span className="fw-bold">Abbonamento (risparmia 10%)</span>
                        <span className="ms-2">{formatPrice(product.price * 0.9)}</span>
                        <div className="text-muted small">Consegna ogni mese, annulla quando vuoi</div>
                      </div>
                    }
                    checked={subscriptionOption === "subscription"}
                    onChange={() => setSubscriptionOption("subscription")}
                  />
                </div>

                <div className="d-flex align-items-center mb-3">
                  <div className="me-3">
                    <label htmlFor="quantity" className="form-label mb-0">
                      Quantità
                    </label>
                  </div>
                  <div className="d-flex align-items-center">
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                    >
                      <Minus size={16} />
                    </Button>
                    <Form.Control
                      type="number"
                      id="quantity"
                      min="1"
                      value={quantity}
                      onChange={(e) => handleQuantityChange(Number.parseInt(e.target.value) || 1)}
                      className="mx-2 text-center"
                      style={{ width: "60px" }}
                    />
                    <Button variant="outline-secondary" size="sm" onClick={() => handleQuantityChange(quantity + 1)}>
                      <Plus size={16} />
                    </Button>
                  </div>
                </div>

                <div className="d-grid gap-2">
                  <Button variant="primary" size="lg" onClick={handleAddToCart} className="d-flex align-items-center justify-content-center gap-2">
                    <ShoppingCart />
                    <span>Aggiungi al Carrello</span>
                  </Button>

                  <Button variant="outline-primary" onClick={handleToggleFavorite} className="d-flex align-items-center justify-content-center gap-2">
                    <Heart />
                    {isFavorite(product.id) ? "Rimuovi dai Preferiti" : "Aggiungi ai Preferiti"}
                  </Button>
                </div>
              </Card.Body>
            </Card>

            <Alert variant="info" className="d-flex align-items-start">
              <Info size={20} className="me-2 flex-shrink-0 mt-1" />
              <div>
                <strong>Spedizione gratuita</strong> per ordini superiori a 50€. Consegna in 2-4 giorni lavorativi.
              </div>
            </Alert>
          </Col>
        </Row>

        {/* Tabs con descrizione e dettagli */}
        <Card className="border-0 shadow-sm mb-5">
          <Card.Body>
            <Tabs activeKey={activeTab} onSelect={(k) => k && setActiveTab(k)} className="mb-4">
              <Tab eventKey="description" title="Descrizione">
                <div className="py-3">
                  <h4 className="mb-3">{product.name}</h4>
                  <p className="mb-4">{product.description}</p>
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies
                    tincidunt, nisl nisl aliquam nisl, eget ultricies nisl nisl eget nisl. Nullam auctor, nisl eget
                    ultricies tincidunt, nisl nisl aliquam nisl, eget ultricies nisl nisl eget nisl.
                  </p>
                </div>
              </Tab>
              <Tab eventKey="specifications" title="Specifiche">
                <div className="py-3">
                  <h4 className="mb-3">Specifiche Tecniche</h4>
                  <Row>
                    <Col md={6}>
                      <table className="table">
                        <tbody>
                          <tr>
                            <th scope="row">Categoria</th>
                            <td>
                              {product.category === "electronics"
                                ? "Elettronica"
                                : product.category === "clothing"
                                  ? "Abbigliamento"
                                  : "Casa & Cucina"}
                            </td>
                          </tr>
                          <tr>
                            <th scope="row">Codice Prodotto</th>
                            <td>PRD-{product.id.toString().padStart(4, "0")}</td>
                          </tr>
                          <tr>
                            <th scope="row">Disponibilità</th>
                            <td>In Stock</td>
                          </tr>
                          <tr>
                            <th scope="row">Garanzia</th>
                            <td>2 anni</td>
                          </tr>
                        </tbody>
                      </table>
                    </Col>
                    <Col md={6}>
                      <table className="table">
                        <tbody>
                          <tr>
                            <th scope="row">Materiali</th>
                            <td>Premium</td>
                          </tr>
                          <tr>
                            <th scope="row">Dimensioni</th>
                            <td>30 x 20 x 10 cm</td>
                          </tr>
                          <tr>
                            <th scope="row">Peso</th>
                            <td>0.5 kg</td>
                          </tr>
                          <tr>
                            <th scope="row">Paese di origine</th>
                            <td>Italia</td>
                          </tr>
                        </tbody>
                      </table>
                    </Col>
                  </Row>
                </div>
              </Tab>
              <Tab eventKey="reviews" title="Recensioni">
                <div className="py-3">
                  <h4 className="mb-3">Recensioni dei Clienti</h4>
                  <div className="mb-4">
                    <div className="d-flex align-items-center mb-3">
                      <div className="d-flex me-2">{renderStars(5)}</div>
                      <span className="fw-bold">Ottimo prodotto!</span>
                    </div>
                    <p className="mb-1">Prodotto eccellente, supera le aspettative. Lo consiglio vivamente a tutti.</p>
                    <div className="text-muted small">Mario R. - 15 marzo 2025</div>
                  </div>

                  <div className="mb-4">
                    <div className="d-flex align-items-center mb-3">
                      <div className="d-flex me-2">{renderStars(4)}</div>
                      <span className="fw-bold">Buona qualità</span>
                    </div>
                    <p className="mb-1">
                      Prodotto di buona qualità, spedizione veloce. Unico neo: il prezzo un po' alto.
                    </p>
                    <div className="text-muted small">Laura B. - 2 marzo 2025</div>
                  </div>

                  <div>
                    <div className="d-flex align-items-center mb-3">
                      <div className="d-flex me-2">{renderStars(5)}</div>
                      <span className="fw-bold">Perfetto!</span>
                    </div>
                    <p className="mb-1">Esattamente quello che cercavo. Ottima qualità e servizio impeccabile.</p>
                    <div className="text-muted small">Giovanni T. - 18 febbraio 2025</div>
                  </div>
                </div>
              </Tab>
            </Tabs>
          </Card.Body>
        </Card>

        {/* Prodotti correlati */}
        <section>
          <h3 className="mb-4">Prodotti Correlati</h3>
          <Row>
            {relatedProducts.map((relatedProduct) => (
              <Col key={relatedProduct.id} md={4} className="mb-4">
                <Card className="h-100 shadow-sm">
                  <div className="position-relative" style={{ height: "200px" }}>
                    <Image
                      src={relatedProduct.image || "/placeholder.svg"}
                      alt={relatedProduct.name}
                      fill
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                  <Card.Body className="d-flex flex-column">
                    <Card.Title>{relatedProduct.name}</Card.Title>
                    <Card.Text className="text-danger fw-bold mb-2">{formatPrice(relatedProduct.price)}</Card.Text>
                    <Card.Text className="mb-4 flex-grow-1">{relatedProduct.description.substring(0, 80)}...</Card.Text>
                    <div className="mt-auto d-flex gap-2">
                      <Link href={`/shop/products/${relatedProduct.id}`} className="flex-grow-1">
                        <Button variant="outline-primary" className="w-100">
                          Vedi Dettagli
                        </Button>
                      </Link>
                      <Button variant="primary" className="flex-shrink-0" onClick={() => addToCart(relatedProduct, 1)}>
                        <ShoppingCart size={18} />
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </section>
      </Container>
    </MainLayout>
  )
}

// File: tsconfig.json
// Assicurati che il tuo tsconfig.json contenga questa configurazione per gli alias @/

/*
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    },
    // altre opzioni...
  }
}
*/