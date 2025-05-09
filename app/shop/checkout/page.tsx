"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Container, Row, Col, Card, Button, Form, Alert, Badge, ProgressBar } from "react-bootstrap"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ShoppingBag,
  TruckIcon,
  CheckCircle,
  ChevronRight,
  Lock,
  CreditCard,
  Wallet,
  Gift,
  ArrowLeft,
  Check,
  Shield,
  MapPin,
  User,
  Mail,
  Phone,
  Home,
  Globe,
  Calendar,
  CreditCardIcon,
  AlertCircle,
} from "lucide-react"
import MainLayout from "@/components/main-layout"
import { useCart } from "@/context/cart-context"

export default function CheckoutPage() {
  const { cartItems, getTotalPrice, clearCart } = useCart()
  const [mounted, setMounted] = useState(false)
  const [orderComplete, setOrderComplete] = useState(false)
  const [orderNumber, setOrderNumber] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("card")
  const [shippingMethod, setShippingMethod] = useState("standard")
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    country: "Italia",
    cardNumber: "",
    cardName: "",
    cardExpiry: "",
    cardCvv: "",
    saveInfo: true,
    newsletter: false,
    notes: "",
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [currentStep, setCurrentStep] = useState(1)
  const router = useRouter()

  // Esegui solo lato client
  useEffect(() => {
    setMounted(true)
  }, [])

  // Reindirizza al carrello se è vuoto
  useEffect(() => {
    if (mounted && cartItems.length === 0 && !orderComplete) {
      router.push("/shop/cart")
    }
  }, [cartItems, mounted, router, orderComplete])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }))

    // Rimuovi l'errore quando l'utente inizia a digitare
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}

    // Validazione step 1 (dati personali)
    if (currentStep === 1) {
      if (!formData.firstName) errors.firstName = "Il nome è obbligatorio"
      if (!formData.lastName) errors.lastName = "Il cognome è obbligatorio"
      if (!formData.email) errors.email = "L'email è obbligatoria"
      else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = "Email non valida"
      if (!formData.phone) errors.phone = "Il telefono è obbligatorio"
      if (!formData.address) errors.address = "L'indirizzo è obbligatorio"
      if (!formData.city) errors.city = "La città è obbligatoria"
      if (!formData.postalCode) errors.postalCode = "Il CAP è obbligatorio"
    }

    // Validazione step 2 (pagamento)
    if (currentStep === 2 && paymentMethod === "card") {
      if (!formData.cardNumber) errors.cardNumber = "Il numero della carta è obbligatorio"
      else if (!/^\d{16}$/.test(formData.cardNumber.replace(/\s/g, ""))) errors.cardNumber = "Numero carta non valido"

      if (!formData.cardName) errors.cardName = "Il nome sulla carta è obbligatorio"

      if (!formData.cardExpiry) errors.cardExpiry = "La data di scadenza è obbligatoria"
      else if (!/^\d{2}\/\d{2}$/.test(formData.cardExpiry)) errors.cardExpiry = "Formato non valido (MM/YY)"

      if (!formData.cardCvv) errors.cardCvv = "Il CVV è obbligatorio"
      else if (!/^\d{3,4}$/.test(formData.cardCvv)) errors.cardCvv = "CVV non valido"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleNextStep = () => {
    if (validateForm()) {
      setCurrentStep((prev) => prev + 1)
      window.scrollTo(0, 0)
    }
  }

  const handlePrevStep = () => {
    setCurrentStep((prev) => prev - 1)
    window.scrollTo(0, 0)
  }

  const handleSubmitOrder = () => {
    if (validateForm()) {
      // Simula l'elaborazione dell'ordine
      setOrderComplete(true)
      setOrderNumber(`ORD-${Math.floor(100000 + Math.random() * 900000)}`)
      clearCart()
      window.scrollTo(0, 0)
    }
  }

  // Formatto il prezzo in euro
  const formatPrice = (price: number) => {
    return price.toFixed(2).replace(".", ",") + " €"
  }

  // Calcola il totale con spedizione
  const calculateTotal = () => {
    const subtotal = getTotalPrice()
    const shippingCost = shippingMethod === "express" ? 9.99 : subtotal >= 50 ? 0 : 4.99
    return subtotal + shippingCost
  }

  if (!mounted) return null

  // Pagina di conferma ordine
  if (orderComplete) {
    return (
      <MainLayout>
        <Container className="py-5">
          <Card className="shadow border-0 order-complete-card">
            <Card.Body className="p-5">
              <div className="text-center mb-5">
                <div className="success-icon-container rounded-circle bg-success text-white d-inline-flex p-4 mb-4">
                  <CheckCircle size={48} />
                </div>
                <h1 className="mb-3">Grazie per il tuo ordine!</h1>
                <p className="text-muted mb-4 lead">
                  Il tuo ordine #{orderNumber} è stato confermato e sarà spedito a breve.
                </p>
                <div className="d-flex justify-content-center">
                  <Badge bg="success" className="px-3 py-2 fs-6">
                    Pagamento completato
                  </Badge>
                </div>
              </div>

              <Row className="mb-5">
                <Col md={6} className="mb-4 mb-md-0">
                  <Card className="h-100 order-details-card">
                    <Card.Body>
                      <h5 className="mb-3 d-flex align-items-center">
                        <MapPin size={18} className="me-2 text-primary" />
                        Dettagli Spedizione
                      </h5>
                      <p className="mb-1">
                        <strong>Nome:</strong> {formData.firstName} {formData.lastName}
                      </p>
                      <p className="mb-1">
                        <strong>Indirizzo:</strong> {formData.address}
                      </p>
                      <p className="mb-1">
                        <strong>Città:</strong> {formData.city}, {formData.postalCode}
                      </p>
                      <p className="mb-1">
                        <strong>Paese:</strong> {formData.country}
                      </p>
                      <p className="mb-0">
                        <strong>Email:</strong> {formData.email}
                      </p>
                      <p className="mb-0">
                        <strong>Telefono:</strong> {formData.phone}
                      </p>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card className="h-100 order-details-card">
                    <Card.Body>
                      <h5 className="mb-3 d-flex align-items-center">
                        <CreditCard size={18} className="me-2 text-primary" />
                        Dettagli Pagamento
                      </h5>
                      <p className="mb-1">
                        <strong>Metodo:</strong> {paymentMethod === "card" ? "Carta di Credito" : "PayPal"}
                      </p>
                      {paymentMethod === "card" && (
                        <>
                          <p className="mb-1">
                            <strong>Carta:</strong> **** **** **** {formData.cardNumber.slice(-4)}
                          </p>
                          <p className="mb-1">
                            <strong>Intestatario:</strong> {formData.cardName}
                          </p>
                        </>
                      )}
                      <p className="mb-1">
                        <strong>Totale:</strong> {formatPrice(calculateTotal() * 1.22)}
                      </p>
                      <p className="mb-0">
                        <strong>Stato:</strong> <span className="text-success">Pagato</span>
                      </p>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              <div className="text-center">
                <p className="mb-4">
                  Ti abbiamo inviato una email di conferma a <strong>{formData.email}</strong>.<br />
                  Se hai domande sul tuo ordine, contattaci all'indirizzo{" "}
                  <a href="mailto:support@eyeshop.com">support@eyeshop.com</a>
                </p>
                <div className="d-flex justify-content-center gap-3">
                  <Link href="/shop" passHref>
                    <Button variant="primary" size="lg">
                      Continua lo Shopping
                    </Button>
                  </Link>
                  <Button variant="outline-secondary" size="lg">
                    Traccia Ordine
                  </Button>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Container>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="checkout-page">
        <Container className="py-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1 className="mb-0">Checkout</h1>
            <div className="d-none d-md-block">
              <div className="checkout-steps d-flex align-items-center">
                <div
                  className={`step-circle d-flex align-items-center justify-content-center ${currentStep >= 1 ? "active" : ""}`}
                >
                  <span>1</span>
                </div>
                <div className={`step-line ${currentStep >= 2 ? "active" : ""}`}></div>
                <div
                  className={`step-circle d-flex align-items-center justify-content-center ${currentStep >= 2 ? "active" : ""}`}
                >
                  <span>2</span>
                </div>
                <div className={`step-line ${currentStep >= 3 ? "active" : ""}`}></div>
                <div
                  className={`step-circle d-flex align-items-center justify-content-center ${currentStep >= 3 ? "active" : ""}`}
                >
                  <span>3</span>
                </div>
              </div>
            </div>
          </div>

          {/* Barra di progresso per mobile */}
          <div className="d-md-none mb-4">
            <ProgressBar now={(currentStep / 3) * 100} variant="primary" className="checkout-progress" />
            <div className="d-flex justify-content-between mt-1">
              <span className="small">Dati</span>
              <span className="small">Pagamento</span>
              <span className="small">Conferma</span>
            </div>
          </div>

          <Row>
            <Col lg={8} className="mb-4">
              {/* Step 1: Dati di spedizione */}
              {currentStep === 1 && (
                <Card className="shadow-sm mb-4 checkout-card">
                  <Card.Header className="bg-white py-3 border-bottom">
                    <h5 className="mb-0 d-flex align-items-center">
                      <User size={18} className="me-2 text-primary" />
                      Dati di Spedizione
                    </h5>
                  </Card.Header>
                  <Card.Body className="p-4">
                    <Row>
                      <Col md={6} className="mb-3">
                        <Form.Group controlId="firstName">
                          <Form.Label>
                            Nome <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Control
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            isInvalid={!!formErrors.firstName}
                            placeholder="Inserisci il tuo nome"
                            className="form-field"
                          />
                          <Form.Control.Feedback type="invalid">{formErrors.firstName}</Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      <Col md={6} className="mb-3">
                        <Form.Group controlId="lastName">
                          <Form.Label>
                            Cognome <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Control
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            isInvalid={!!formErrors.lastName}
                            placeholder="Inserisci il tuo cognome"
                            className="form-field"
                          />
                          <Form.Control.Feedback type="invalid">{formErrors.lastName}</Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={6} className="mb-3">
                        <Form.Group controlId="email">
                          <Form.Label>
                            Email <span className="text-danger">*</span>
                          </Form.Label>
                          <div className="input-icon-wrapper">
                            <Mail size={16} className="input-icon text-muted" />
                            <Form.Control
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              isInvalid={!!formErrors.email}
                              placeholder="esempio@email.com"
                              className="form-field ps-4"
                            />
                          </div>
                          <Form.Control.Feedback type="invalid">{formErrors.email}</Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      <Col md={6} className="mb-3">
                        <Form.Group controlId="phone">
                          <Form.Label>
                            Telefono <span className="text-danger">*</span>
                          </Form.Label>
                          <div className="input-icon-wrapper">
                            <Phone size={16} className="input-icon text-muted" />
                            <Form.Control
                              type="tel"
                              name="phone"
                              value={formData.phone}
                              onChange={handleInputChange}
                              isInvalid={!!formErrors.phone}
                              placeholder="+39 123 456 7890"
                              className="form-field ps-4"
                            />
                          </div>
                          <Form.Control.Feedback type="invalid">{formErrors.phone}</Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                    </Row>

                    <Form.Group className="mb-3" controlId="address">
                      <Form.Label>
                        Indirizzo <span className="text-danger">*</span>
                      </Form.Label>
                      <div className="input-icon-wrapper">
                        <Home size={16} className="input-icon text-muted" />
                        <Form.Control
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          isInvalid={!!formErrors.address}
                          placeholder="Via, numero civico, interno"
                          className="form-field ps-4"
                        />
                      </div>
                      <Form.Control.Feedback type="invalid">{formErrors.address}</Form.Control.Feedback>
                    </Form.Group>

                    <Row>
                      <Col md={6} className="mb-3">
                        <Form.Group controlId="city">
                          <Form.Label>
                            Città <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Control
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            isInvalid={!!formErrors.city}
                            placeholder="Inserisci la tua città"
                            className="form-field"
                          />
                          <Form.Control.Feedback type="invalid">{formErrors.city}</Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      <Col md={6} className="mb-3">
                        <Form.Group controlId="postalCode">
                          <Form.Label>
                            CAP <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Control
                            type="text"
                            name="postalCode"
                            value={formData.postalCode}
                            onChange={handleInputChange}
                            isInvalid={!!formErrors.postalCode}
                            placeholder="12345"
                            className="form-field"
                          />
                          <Form.Control.Feedback type="invalid">{formErrors.postalCode}</Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                    </Row>

                    <Form.Group className="mb-3" controlId="country">
                      <Form.Label>
                        Paese <span className="text-danger">*</span>
                      </Form.Label>
                      <div className="input-icon-wrapper">
                        <Globe size={16} className="input-icon text-muted" />
                        <Form.Select
                          name="country"
                          value={formData.country}
                          onChange={handleInputChange}
                          className="form-field ps-4"
                        >
                          <option value="Italia">Italia</option>
                          <option value="Francia">Francia</option>
                          <option value="Germania">Germania</option>
                          <option value="Spagna">Spagna</option>
                          <option value="Regno Unito">Regno Unito</option>
                        </Form.Select>
                      </div>
                    </Form.Group>

                    <div className="mt-4 pt-2 border-top">
                      <Form.Group className="mb-3" controlId="saveInfo">
                        <Form.Check
                          type="checkbox"
                          name="saveInfo"
                          label="Salva queste informazioni per la prossima volta"
                          checked={formData.saveInfo}
                          onChange={handleInputChange}
                          className="checkout-checkbox"
                        />
                      </Form.Group>

                      <Form.Group className="mb-3" controlId="newsletter">
                        <Form.Check
                          type="checkbox"
                          name="newsletter"
                          label="Desidero ricevere aggiornamenti su prodotti e offerte speciali"
                          checked={formData.newsletter}
                          onChange={handleInputChange}
                          className="checkout-checkbox"
                        />
                      </Form.Group>
                    </div>
                  </Card.Body>
                  <Card.Footer className="bg-white py-3 d-flex justify-content-between">
                    <Link href="/shop/cart" passHref>
                      <Button variant="outline-secondary" className="d-flex align-items-center">
                        <ArrowLeft size={16} className="me-2" />
                        Torna al Carrello
                      </Button>
                    </Link>
                    <Button variant="primary" onClick={handleNextStep} className="next-step-button">
                      Continua al Pagamento <ChevronRight size={16} className="ms-2" />
                    </Button>
                  </Card.Footer>
                </Card>
              )}

              {/* Step 2: Metodo di pagamento */}
              {currentStep === 2 && (
                <Card className="shadow-sm mb-4 checkout-card">
                  <Card.Header className="bg-white py-3 border-bottom">
                    <h5 className="mb-0 d-flex align-items-center">
                      <CreditCardIcon size={18} className="me-2 text-primary" />
                      Metodo di Pagamento
                    </h5>
                  </Card.Header>
                  <Card.Body className="p-4">
                    <div className="mb-4">
                      <div className="payment-method-option mb-3">
                        <Form.Check
                          type="radio"
                          id="payment-card"
                          name="payment-method"
                          checked={paymentMethod === "card"}
                          onChange={() => setPaymentMethod("card")}
                          label={
                            <div className="d-flex align-items-center">
                              <CreditCardIcon size={20} className="me-2 text-primary" />
                              <span>Carta di Credito/Debito</span>
                            </div>
                          }
                          className="mb-0 payment-radio"
                        />
                      </div>

                      {paymentMethod === "card" && (
                        <div className="border rounded p-3 ms-4 payment-details-container">
                          <Row>
                            <Col md={12} className="mb-3">
                              <Form.Group controlId="cardNumber">
                                <Form.Label>
                                  Numero Carta <span className="text-danger">*</span>
                                </Form.Label>
                                <div className="input-icon-wrapper">
                                  <CreditCardIcon size={16} className="input-icon text-muted" />
                                  <Form.Control
                                    type="text"
                                    name="cardNumber"
                                    value={formData.cardNumber}
                                    onChange={handleInputChange}
                                    placeholder="1234 5678 9012 3456"
                                    isInvalid={!!formErrors.cardNumber}
                                    className="form-field ps-4"
                                  />
                                </div>
                                <Form.Control.Feedback type="invalid">{formErrors.cardNumber}</Form.Control.Feedback>
                              </Form.Group>
                            </Col>
                            <Col md={12} className="mb-3">
                              <Form.Group controlId="cardName">
                                <Form.Label>
                                  Nome sulla Carta <span className="text-danger">*</span>
                                </Form.Label>
                                <Form.Control
                                  type="text"
                                  name="cardName"
                                  value={formData.cardName}
                                  onChange={handleInputChange}
                                  isInvalid={!!formErrors.cardName}
                                  placeholder="Nome e cognome"
                                  className="form-field"
                                />
                                <Form.Control.Feedback type="invalid">{formErrors.cardName}</Form.Control.Feedback>
                              </Form.Group>
                            </Col>
                          </Row>
                          <Row>
                            <Col md={6} className="mb-3">
                              <Form.Group controlId="cardExpiry">
                                <Form.Label>
                                  Data Scadenza <span className="text-danger">*</span>
                                </Form.Label>
                                <div className="input-icon-wrapper">
                                  <Calendar size={16} className="input-icon text-muted" />
                                  <Form.Control
                                    type="text"
                                    name="cardExpiry"
                                    value={formData.cardExpiry}
                                    onChange={handleInputChange}
                                    placeholder="MM/YY"
                                    isInvalid={!!formErrors.cardExpiry}
                                    className="form-field ps-4"
                                  />
                                </div>
                                <Form.Control.Feedback type="invalid">{formErrors.cardExpiry}</Form.Control.Feedback>
                              </Form.Group>
                            </Col>
                            <Col md={6} className="mb-3">
                              <Form.Group controlId="cardCvv">
                                <Form.Label>
                                  CVV <span className="text-danger">*</span>
                                </Form.Label>
                                <Form.Control
                                  type="text"
                                  name="cardCvv"
                                  value={formData.cardCvv}
                                  onChange={handleInputChange}
                                  isInvalid={!!formErrors.cardCvv}
                                  placeholder="123"
                                  className="form-field"
                                />
                                <Form.Control.Feedback type="invalid">{formErrors.cardCvv}</Form.Control.Feedback>
                              </Form.Group>
                            </Col>
                          </Row>
                          <div className="d-flex align-items-center mt-2">
                            <Lock size={14} className="text-success me-2" />
                            <span className="text-success small">I tuoi dati di pagamento sono protetti</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mb-4">
                      <div className="payment-method-option">
                        <Form.Check
                          type="radio"
                          id="payment-paypal"
                          name="payment-method"
                          checked={paymentMethod === "paypal"}
                          onChange={() => setPaymentMethod("paypal")}
                          label={
                            <div className="d-flex align-items-center">
                              <Wallet size={20} className="me-2 text-primary" />
                              <span>PayPal</span>
                            </div>
                          }
                          className="mb-3 payment-radio"
                        />
                      </div>

                      {paymentMethod === "paypal" && (
                        <div className="border rounded p-3 ms-4 payment-details-container">
                          <p className="mb-0">Verrai reindirizzato al sito di PayPal per completare il pagamento.</p>
                        </div>
                      )}
                    </div>

                    <div className="mb-3 mt-4 pt-2 border-top">
                      <h6 className="mb-3 d-flex align-items-center">
                        <TruckIcon size={18} className="me-2 text-primary" />
                        Metodo di Spedizione
                      </h6>
                      <div className="shipping-options">
                        <Form.Check
                          type="radio"
                          id="shipping-standard"
                          name="shipping-method"
                          label={
                            <div className="d-flex justify-content-between align-items-center w-100">
                              <div>
                                <span className="fw-medium">Standard</span>
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
                                <span className="fw-medium">Express</span>
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
                  </Card.Body>
                  <Card.Footer className="bg-white py-3 d-flex justify-content-between">
                    <Button variant="outline-secondary" onClick={handlePrevStep}>
                      <ArrowLeft size={16} className="me-2" />
                      Torna ai Dati di Spedizione
                    </Button>
                    <Button variant="primary" onClick={handleNextStep} className="next-step-button">
                      Rivedi Ordine <ChevronRight size={16} className="ms-2" />
                    </Button>
                  </Card.Footer>
                </Card>
              )}

              {/* Step 3: Riepilogo ordine */}
              {currentStep === 3 && (
                <Card className="shadow-sm mb-4 checkout-card">
                  <Card.Header className="bg-white py-3 border-bottom">
                    <h5 className="mb-0 d-flex align-items-center">
                      <ShoppingBag size={18} className="me-2 text-primary" />
                      Riepilogo Ordine
                    </h5>
                  </Card.Header>
                  <Card.Body className="p-4">
                    <div className="mb-4">
                      <h6 className="mb-3 section-title">Prodotti</h6>
                      {cartItems.map((item) => (
                        <div key={item.id} className="d-flex mb-3 border-bottom pb-3 order-item">
                          <div className="position-relative" style={{ width: "80px", height: "80px", flexShrink: 0 }}>
                            <Image
                              src={item.image || "/placeholder.svg"}
                              alt={item.name}
                              fill
                              style={{ objectFit: "cover" }}
                            />
                          </div>
                          <div className="ms-3 flex-grow-1">
                            <div className="d-flex justify-content-between">
                              <h6 className="mb-1">{item.name}</h6>
                              <span className="fw-bold">{formatPrice(item.price * item.quantity)}</span>
                            </div>
                            <div className="text-muted small mb-1">Quantità: {item.quantity}</div>
                            <div className="text-muted small">{formatPrice(item.price)} cad.</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mb-4">
                      <h6 className="mb-3 section-title">Dati di Spedizione</h6>
                      <div className="border rounded p-3 info-box">
                        <p className="mb-1">
                          <strong>
                            {formData.firstName} {formData.lastName}
                          </strong>
                        </p>
                        <p className="mb-1">{formData.address}</p>
                        <p className="mb-1">
                          {formData.city}, {formData.postalCode}
                        </p>
                        <p className="mb-1">{formData.country}</p>
                        <p className="mb-1">Email: {formData.email}</p>
                        <p className="mb-0">Telefono: {formData.phone}</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h6 className="mb-3 section-title">Metodo di Pagamento</h6>
                      <div className="border rounded p-3 info-box">
                        {paymentMethod === "card" ? (
                          <div className="d-flex align-items-center">
                            <CreditCardIcon size={20} className="me-2 text-primary" />
                            <div>
                              <p className="mb-1">Carta di Credito/Debito</p>
                              <p className="mb-0 text-muted small">**** **** **** {formData.cardNumber.slice(-4)}</p>
                            </div>
                          </div>
                        ) : (
                          <div className="d-flex align-items-center">
                            <Wallet size={20} className="me-2 text-primary" />
                            <p className="mb-0">PayPal</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mb-4">
                      <h6 className="mb-3 section-title">Metodo di Spedizione</h6>
                      <div className="border rounded p-3 info-box">
                        <div className="d-flex align-items-center">
                          <TruckIcon size={20} className="me-2 text-primary" />
                          <div>
                            <p className="mb-1">
                              {shippingMethod === "standard" ? "Spedizione Standard" : "Spedizione Express"}
                            </p>
                            <p className="mb-0 text-muted small">
                              {shippingMethod === "standard"
                                ? "Consegna in 2-3 giorni lavorativi"
                                : "Consegna in 1 giorno lavorativo"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Form.Group className="mb-3" controlId="notes">
                      <Form.Label>Note per la consegna (opzionale)</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        placeholder="Istruzioni speciali per la consegna..."
                        className="form-field"
                      />
                    </Form.Group>

                    <Alert variant="info" className="d-flex align-items-start mt-4">
                      <AlertCircle size={20} className="me-2 flex-shrink-0 mt-1" />
                      <div>
                        <strong>Nota:</strong> Questo è un negozio dimostrativo. Nessun ordine reale verrà elaborato e
                        nessun pagamento verrà addebitato.
                      </div>
                    </Alert>
                  </Card.Body>
                  <Card.Footer className="bg-white py-3 d-flex justify-content-between">
                    <Button variant="outline-secondary" onClick={handlePrevStep}>
                      <ArrowLeft size={16} className="me-2" />
                      Torna al Pagamento
                    </Button>
                    <Button variant="success" onClick={handleSubmitOrder} className="confirm-order-button">
                      <Check size={16} className="me-2" />
                      Conferma Ordine
                    </Button>
                  </Card.Footer>
                </Card>
              )}
            </Col>

            <Col lg={4}>
              <div className="order-summary">
                <Card className="shadow-sm mb-4">
                  <Card.Header className="bg-primary text-white py-3">
                    <h5 className="mb-0">Riepilogo Ordine</h5>
                  </Card.Header>
                  <Card.Body>
                    <div className="mb-3">
                      {cartItems.map((item) => (
                        <div key={item.id} className="d-flex justify-content-between mb-2">
                          <span>
                            {item.name} <span className="text-muted">x{item.quantity}</span>
                          </span>
                          <span>{formatPrice(item.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>

                    <hr />

                    <div className="d-flex justify-content-between mb-2">
                      <span>Subtotale</span>
                      <span>{formatPrice(getTotalPrice())}</span>
                    </div>

                    <div className="d-flex justify-content-between mb-2">
                      <span>Spedizione</span>
                      <span>
                        {shippingMethod === "express" ? (
                          formatPrice(9.99)
                        ) : getTotalPrice() >= 50 ? (
                          <span className="text-success">Gratuita</span>
                        ) : (
                          formatPrice(4.99)
                        )}
                      </span>
                    </div>

                    <div className="d-flex justify-content-between mb-2">
                      <span>Tasse (22%)</span>
                      <span>{formatPrice(calculateTotal() * 0.22)}</span>
                    </div>

                    <hr />

                    <div className="d-flex justify-content-between fw-bold mb-3">
                      <span>Totale</span>
                      <span className="fs-5">{formatPrice(calculateTotal() * 1.22)}</span>
                    </div>

                    <div className="d-flex align-items-center mb-3">
                      <Shield size={16} className="text-success me-2" />
                      <span className="text-success small">Pagamento sicuro e crittografato</span>
                    </div>

                    <div className="d-flex align-items-center">
                      <Gift size={16} className="text-primary me-2" />
                      <span className="text-primary small">Spedizione gratuita per ordini superiori a 50€</span>
                    </div>
                  </Card.Body>
                </Card>

                <div className="d-flex justify-content-center">
                 
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Stili specifici per la pagina di checkout */}
      <style jsx global>{`
        /* Stili per il riepilogo ordine */
        @media (min-width: 992px) {
          .order-summary {
            position: sticky;
            top: 100px;
          }
        }
        
        /* Stili per i passaggi del checkout */
        .checkout-steps {
          position: relative;
        }
        
        .step-circle {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background-color: #f8f9fa;
          border: 1px solid #dee2e6;
          color: #6c757d;
          font-weight: bold;
          z-index: 2;
        }
        
        .step-circle.active {
          background-color:rgb(153, 13, 253);
          border-color:rgb(105, 13, 253);
          color: white;
        }
        
        .step-line {
          height: 2px;
          width: 60px;
          background-color: #dee2e6;
          z-index: 1;
        }
        
        .step-line.active {
          background-color:rgb(145, 13, 253);
        }
        
        /* Stili per i campi del form */
        .form-field {
          padding: 0.75rem;
          border-radius: 0.375rem;
          transition: all 0.2s ease;
        }
        
        .form-field:focus {
          border-color:rgb(117, 13, 253);
          box-shadow: 0 0 0 0.25rem rgba(13, 17, 253, 0.25);
        }
        
        /* Stili per le opzioni di pagamento */
        .payment-method-option {
          transition: all 0.2s ease;
        }
        
        .payment-radio:checked + .form-check-label {
          font-weight: 500;
        }
        
        .payment-details-container {
          background-color: #f8f9fa;
          transition: all 0.3s ease;
        }
        
        /* Stili per le opzioni di spedizione */
        .shipping-option {
          transition: all 0.2s ease;
        }
        
        .shipping-option:hover {
          background-color: rgba(13, 110, 253, 0.05);
        }
        
        .form-check-input:checked + .form-check-label .shipping-option {
          border-color:rgb(113, 13, 253) !important;
          background-color: rgba(13, 110, 253, 0.1);
        }
        
        /* Stili per i pulsanti */
        .next-step-button, .confirm-order-button {
          transition: all 0.3s ease;
          font-weight: 500;
        }
        
        .next-step-button:hover, .confirm-order-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        
        /* Stili per la pagina di conferma ordine */
        .order-complete-card {
          border-radius: 1rem;
        }
        
        .success-icon-container {
          transition: all 0.3s ease;
        }
        
        .success-icon-container:hover {
          transform: scale(1.1);
        }
        
        .order-details-card {
          transition: all 0.3s ease;
        }
        
        .order-details-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
        }
        
        /* Stili per gli elementi con icone */
        .input-icon-wrapper {
          position: relative;
        }
        
        .input-icon {
          position: absolute;
          left: 10px;
          top: 50%;
          transform: translateY(-50%);
          z-index: 10;
        }
        
        /* Stili per i box informativi */
        .info-box {
          background-color: #f8f9fa;
          transition: all 0.2s ease;
        }
        
        .info-box:hover {
          background-color: #f0f0f0;
        }
        
        /* Stili per i titoli delle sezioni */
        .section-title {
          color: #0d6efd;
          font-weight: 500;
          display: flex;
          align-items: center;
        }
        
        /* Stili per gli elementi dell'ordine */
        .order-item {
          transition: all 0.2s ease;
        }
        
        .order-item:hover {
          background-color: rgba(13, 110, 253, 0.05);
        }
        
        /* Stili per i checkbox */
        .checkout-checkbox .form-check-input:checked {
          background-color:rgb(221, 13, 253);
          border-color:rgb(193, 13, 253);
        }
        
        /* Stili per la barra di progresso mobile */
        .checkout-progress {
          height: 8px;
          border-radius: 4px;
        }
      `}</style>
    </MainLayout>
  )
}
