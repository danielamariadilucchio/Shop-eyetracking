"use client"

import { useState, useEffect, useCallback } from "react"
import { Container, Row, Col, Card, Button, Form, Alert, Badge } from "react-bootstrap"
import Image from "next/image"
import Link from "next/link"
import {
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  CreditCard,
  ShoppingBag,
  TruckIcon,
  Clock,
  Shield,
  Gift,
  Heart,
} from "lucide-react"
import MainLayout from "@/components/main-layout"
import { useCart } from "@/context/cart-context"
import { useFavorites } from "@/context/favorites-context"
import { products } from "@/data/products"
import { useRouter } from "next/navigation"

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart, clearCart, getTotalPrice, addToCart } = useCart()
  const { addToFavorites, isFavorite } = useFavorites()
  const [mounted, setMounted] = useState(false)
  const [promoCode, setPromoCode] = useState("")
  const [promoApplied, setPromoApplied] = useState(false)
  const [promoDiscount, setPromoDiscount] = useState(0)
  const [showPromoError, setShowPromoError] = useState(false)
  const [shippingMethod, setShippingMethod] = useState("standard")
  const router = useRouter()

  // Prodotti suggeriti (basati su quelli nel carrello)
  const [suggestedProducts, setSuggestedProducts] = useState<typeof products>([])

  // Esegui solo lato client
  useEffect(() => {
    setMounted(true)
  }, [])

  // Genera prodotti suggeriti basati sulle categorie nel carrello
  useEffect(() => {
    if (mounted && cartItems.length > 0) {
      // Raccogli le categorie dei prodotti nel carrello
      const cartCategories = [...new Set(cartItems.map((item) => item.category))]

      // Trova prodotti delle stesse categorie che non sono nel carrello
      const suggestions = products
        .filter(
          (product) => cartCategories.includes(product.category) && !cartItems.some((item) => item.id === product.id),
        )
        .slice(0, 4)

      setSuggestedProducts(suggestions)
    }
  }, [cartItems, mounted])

  const handleQuantityChange = (productId: number, newQuantity: number) => {
    if (newQuantity < 1) return
    updateQuantity(productId, newQuantity)
  }

  const handleRemoveItem = (productId: number) => {
    if (confirm("Sei sicuro di voler rimuovere questo prodotto dal carrello?")) {
      removeFromCart(productId)
    }
  }

  const handleApplyPromo = () => {
    // Simula un codice promozionale valido "PROMO20"
    if (promoCode.toUpperCase() === "PROMO20") {
      setPromoApplied(true)
      setPromoDiscount(getTotalPrice() * 0.2) // 20% di sconto
      setShowPromoError(false)
    } else {
      setPromoApplied(false)
      setPromoDiscount(0)
      setShowPromoError(true)
    }
  }

  const handleProceedToCheckout = () => {
    router.push("/shop/checkout")
  }

  const handleAddToCart = useCallback(
    (productId: number) => {
      const product = products.find((p) => p.id === productId)
      if (product) {
        addToCart(product)
      }
    },
    [addToCart],
  )

  const handleAddToFavorites = useCallback(
    (productId: number) => {
      const product = products.find((p) => p.id === productId)
      if (product) {
        addToFavorites(product)
      }
    },
    [addToFavorites],
  )

  // Formatto il prezzo in euro
  const formatPrice = (price: number) => {
    return price.toFixed(2).replace(".", ",") + " €"
  }

  // Calcola il totale con spedizione e sconto
  const calculateTotal = () => {
    const subtotal = getTotalPrice()
    const shippingCost = shippingMethod === "express" ? 9.99 : subtotal >= 50 ? 0 : 4.99
    return subtotal + shippingCost - promoDiscount
  }

  if (!mounted) return null

  return (
    <MainLayout>
      <div className="cart-page">
        <Container className="py-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1 className="mb-0">Il Tuo Carrello</h1>
            <div className="d-none d-md-block">
              <div className="d-flex align-items-center">
                <div
                  className="bg-primary rounded-circle text-white d-flex align-items-center justify-content-center"
                  style={{ width: "30px", height: "30px" }}
                >
                  <ShoppingBag size={15} />
                </div>
                <div className="mx-2">
                  <hr className="border-2 border-primary my-0" style={{ width: "50px" }} />
                </div>
                <div
                  className="bg-light rounded-circle text-muted d-flex align-items-center justify-content-center"
                  style={{ width: "30px", height: "30px", border: "1px solid #dee2e6" }}
                >
                  <span className="small fw-bold">2</span>
                </div>
                <div className="mx-2">
                  <hr className="border-2 border-light my-0" style={{ width: "50px" }} />
                </div>
                <div
                  className="bg-light rounded-circle text-muted d-flex align-items-center justify-content-center"
                  style={{ width: "30px", height: "30px", border: "1px solid #dee2e6" }}
                >
                  <span className="small fw-bold">3</span>
                </div>
              </div>
            </div>
          </div>

          {cartItems.length === 0 ? (
            <Card className="shadow-sm">
              <Card.Body className="p-5 text-center">
                <div className="mb-4">
                  <ShoppingBag size={64} className="text-muted" />
                </div>
                <h3>Il tuo carrello è vuoto</h3>
                <p className="text-muted mb-4">Sembra che non hai ancora aggiunto prodotti al tuo carrello.</p>
                <Link href="/shop/products" passHref>
                  <Button variant="primary" size="lg" className="px-4 py-2">
                    Inizia lo Shopping
                  </Button>
                </Link>
              </Card.Body>
            </Card>
          ) : (
            <Row>
              {/* Colonna principale con prodotti */}
              <Col lg={8} className="mb-4">
                <Card className="shadow-sm mb-4">
                  <Card.Header className="bg-white py-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <h5 className="mb-0">Prodotti nel Carrello ({cartItems.length})</h5>
                      <Button variant="outline-danger" size="sm" onClick={() => clearCart()}>
                        <Trash2 size={14} className="me-1" /> Svuota Carrello
                      </Button>
                    </div>
                  </Card.Header>
                  <Card.Body className="p-0">
                    {cartItems.map((item) => (
                      <div
                        key={item.id}
                        className="d-flex flex-column flex-md-row align-items-center p-3 border-bottom position-relative"
                      >
                       

                        <div className="position-relative" style={{ width: "120px", height: "120px", flexShrink: 0 }}>
                          <Image
                            src={item.image || "/placeholder.svg"}
                            alt={item.name}
                            fill
                            style={{ objectFit: "cover" }}
                          />
                        </div>
                        <div className="ms-md-4 mt-3 mt-md-0 flex-grow-1">
                          <h5 className="mb-1">{item.name}</h5>
                          
                          <div className="d-flex align-items-center mb-2">
                            <div className="me-3 d-flex align-items-center">
                              <TruckIcon size={14} className="text-success me-1" />
                              <span className="text-success small">Disponibile</span>
                            </div>
                            <div className="d-flex align-items-center">
                              <Clock size={14} className="text-primary me-1" />
                              <span className="text-primary small">In 2-3 giorni</span>
                            </div>
                          </div>
                        </div>
                        <div className="d-flex flex-column flex-md-row align-items-center mt-3 mt-md-0 ms-md-3">
                          <div className="d-flex align-items-center me-md-4 mb-3 mb-md-0">
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            style={{ width: "35px", height: "35px" }}
                            className="d-flex align-items-center justify-content-center"
                          >
                            <Minus size={16} />
                          </Button>
                          <Form.Control
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(item.id, Number.parseInt(e.target.value) || 1)}
                            className="mx-2 text-center"
                            style={{ width: "60px", height: "38px" }}
                          />
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            style={{ width: "35px", height: "35px" }}
                            className="d-flex align-items-center justify-content-center"
                          >
                            <Plus size={16} />
                          </Button>
                          </div>
                          <div className="d-flex align-items-center">
                          <div className="text-end me-4" style={{ minWidth: "100px" }}>
                            <div className="fw-bold">{formatPrice(item.price * item.quantity)}</div>
                            <small className="text-muted">{formatPrice(item.price)} cad.</small>
                          </div>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleRemoveItem(item.id)}
                            title="Rimuovi"
                            style={{ width: "38px", height: "38px" }}
                            className="d-flex align-items-center justify-content-center"
                          >
                            <Trash2 size={16} />
                          </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </Card.Body>
                  <Card.Footer className="bg-white d-flex justify-content-between py-3">
                    <Link href="/shop/products" passHref>
                      <Button variant="outline-primary" className="d-flex align-items-center px-4 py-2">
                        <ArrowLeft size={16} className="me-2" />
                        Continua lo Shopping
                      </Button>
                    </Link>
                  </Card.Footer>
                </Card>

                {/* Prodotti suggeriti */}
                {suggestedProducts.length > 0 && (
                  <Card className="shadow-sm mb-4">
                    <Card.Header className="bg-white py-3">
                      <h5 className="mb-0">Potrebbe Interessarti Anche</h5>
                    </Card.Header>
                    <Card.Body>
                      <Row xs={1} md={2} className="g-3">
                        {suggestedProducts.map((product) => (
                          <Col key={product.id}>
                            <div className="d-flex border rounded p-2 position-relative">
                              <div
                                className="position-relative"
                                style={{ width: "80px", height: "80px", flexShrink: 0 }}
                              >
                                <Image
                                  src={product.image || "/placeholder.svg"}
                                  alt={product.name}
                                  fill
                                  style={{ objectFit: "cover" }}
                                />
                              </div>
                              <div className="ms-3 d-flex flex-column justify-content-between flex-grow-1">
                                <div>
                                  <h6 className="mb-1 text-truncate">{product.name}</h6>
                                  <div className="text-danger fw-bold">{formatPrice(product.price)}</div>
                                </div>
                                <div className="d-flex gap-2">
                                  <Button
                                    variant="outline-primary"
                                    size="sm"
                                    onClick={() => handleAddToCart(product.id)}
                                    className="flex-grow-1"
                                  >
                                    Aggiungi
                                  </Button>
                                  <Button
                                    variant={isFavorite(product.id) ? "danger" : "outline-secondary"}
                                    size="sm"
                                    onClick={() => handleAddToFavorites(product.id)}
                                    className="d-flex align-items-center justify-content-center"
                                    style={{ width: "34px", height: "34px" }}
                                  >
                                    <Heart size={16} />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </Col>
                        ))}
                      </Row>
                    </Card.Body>
                  </Card>
                )}
              </Col>

              {/* Colonna laterale con riepilogo ordine */}
              <Col lg={4}>
                <div className="order-summary">
                  <Card className="shadow-sm mb-4">
                    <Card.Header className="bg-primary text-white py-3">
                      <h5 className="mb-0">Riepilogo Ordine</h5>
                    </Card.Header>
                    <Card.Body>
                      <div className="d-flex justify-content-between mb-2">
                        <span>Subtotale</span>
                        <span className="fw-medium">{formatPrice(getTotalPrice())}</span>
                      </div>

                      <div className="d-flex justify-content-between mb-2">
                        <span>Spedizione</span>
                        <span className="fw-medium">
                          {shippingMethod === "express" ? (
                            formatPrice(9.99)
                          ) : getTotalPrice() >= 50 ? (
                            <span className="text-success">Gratuita</span>
                          ) : (
                            formatPrice(4.99)
                          )}
                        </span>
                      </div>

                      {promoApplied && (
                        <div className="d-flex justify-content-between mb-2 text-success">
                          <span>Sconto (PROMO20)</span>
                          <span>-{formatPrice(promoDiscount)}</span>
                        </div>
                      )}

                      <div className="d-flex justify-content-between mb-2">
                        <span>Tasse (22%)</span>
                        <span className="fw-medium">{formatPrice(calculateTotal() * 0.22)}</span>
                      </div>

                      <hr />

                      <div className="d-flex justify-content-between fw-bold mb-3">
                        <span>Totale</span>
                        <span className="fs-5">{formatPrice(calculateTotal() * 1.22)}</span>
                      </div>

                      {/* Opzioni di spedizione */}
                      <div className="mb-3">
                        <h6 className="mb-2">Metodo di Spedizione</h6>
                        <div className="shipping-options">
                          <Form.Check
                            type="radio"
                            id="shipping-standard"
                            name="shipping-method"
                            label={
                              <div className="d-flex justify-content-between align-items-center w-100">
                                <div>
                                  <span>Standard</span>
                                  <div className="text-muted small">2-3 giorni lavorativi</div>
                                </div>
                                <span>{getTotalPrice() >= 50 ? "Gratuita" : formatPrice(4.99)}</span>
                              </div>
                            }
                            checked={shippingMethod === "standard"}
                            onChange={() => setShippingMethod("standard")}
                            className="mb-2 p-2 border rounded shipping-option"
                          />
                          <Form.Check
                            type="radio"
                            id="shipping-express"
                            name="shipping-method"
                            label={
                              <div className="d-flex justify-content-between align-items-center w-100">
                                <div>
                                  <span>Express</span>
                                  <div className="text-muted small">1 giorno lavorativo</div>
                                </div>
                                <span>{formatPrice(9.99)}</span>
                              </div>
                            }
                            checked={shippingMethod === "express"}
                            onChange={() => setShippingMethod("express")}
                            className="p-2 border rounded shipping-option"
                          />
                        </div>
                      </div>

                      {/* Codice promozionale */}
                      <div className="mb-3">
                        <h6 className="mb-2">Codice Promozionale</h6>
                        <div className="d-flex">
                          <Form.Control
                            type="text"
                            placeholder="Inserisci codice"
                            value={promoCode}
                            onChange={(e) => setPromoCode(e.target.value)}
                            className="me-2"
                            isInvalid={showPromoError}
                          />
                          <Button
                            variant="outline-primary"
                            onClick={handleApplyPromo}
                            disabled={!promoCode}
                            className="px-3"
                          >
                            Applica
                          </Button>
                        </div>
                        {showPromoError && (
                          <Form.Text className="text-danger">Codice promozionale non valido</Form.Text>
                        )}
                        {promoApplied && (
                          <Alert variant="success" className="mt-2 py-2 px-3 small">
                            Codice PROMO20 applicato: 20% di sconto!
                          </Alert>
                        )}
                        <div className="text-muted small mt-1">Prova con "PROMO20" per ottenere il 20% di sconto</div>
                      </div>
                    </Card.Body>
                    <Card.Footer className="bg-white py-3">
                      <Button
                        variant="success"
                        size="lg"
                        className="w-100 d-flex align-items-center justify-content-center py-2 checkout-button"
                        onClick={handleProceedToCheckout}
                      >
                        <CreditCard size={18} className="me-2" />
                        Procedi al Checkout
                      </Button>

                      <div className="d-flex justify-content-center mt-3">
                        <div className="d-flex align-items-center mx-2">
                          <Shield size={16} className="text-muted me-1" />
                          <span className="text-muted small">Pagamento Sicuro</span>
                        </div>
                        <div className="d-flex align-items-center mx-2">
                          <TruckIcon size={16} className="text-muted me-1" />
                          <span className="text-muted small">Spedizione Veloce</span>
                        </div>
                      </div>
                    </Card.Footer>
                  </Card>

                  <Alert variant="info" className="d-flex align-items-start shadow-sm">
                    <Gift size={20} className="text-primary me-2 flex-shrink-0 mt-1" />
                    <div>
                      <strong>Spedizione gratuita</strong> per ordini superiori a 50€. Aggiungi altri{" "}
                      {formatPrice(Math.max(0, 50 - getTotalPrice()))} per ottenere la spedizione gratuita.
                    </div>
                  </Alert>
                </div>
              </Col>
            </Row>
          )}
        </Container>
      </div>

      {/* Stili specifici per la pagina del carrello */}
      <style jsx global>{`
        /* Stili per il riepilogo ordine */
        @media (min-width: 992px) {
          .order-summary {
            position: sticky;
            top: 100px;
          }
        }
        
        /* Stili per le opzioni di spedizione */
        .shipping-option {
          transition: all 0.2s ease;
        }
        
        .shipping-option:hover {
          background-color: rgba(0, 123, 255, 0.05);
        }
        
        .form-check-input:checked + .form-check-label .shipping-option {
          border-color:rgb(121, 13, 253) !important;
          background-color: rgba(13, 110, 253, 0.1);
        }
        
        /* Stile per il pulsante di checkout */
        .checkout-button {
          transition: all 0.3s ease;
          font-weight: 600;
          letter-spacing: 0.5px;
        }
        
        .checkout-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </MainLayout>
  )
}
