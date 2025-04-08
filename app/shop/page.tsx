"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button, Container, Row, Col, Card } from "react-bootstrap"
import MainLayout from "@/components/main-layout"
import { useEyeTracking } from "@/context/eye-tracking-context"
import { featuredProducts } from "@/data/products"
import { useRouter } from "next/navigation"

export default function ShopHome() {
  const { isTracking, startTracking, stopTracking } = useEyeTracking()
  const [isLoaded, setIsLoaded] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  const navigateToCategory = (category: string) => {
    router.push(`/shop/products?category=${category}`)
  }

  // Formatto il prezzo in euro
  const formatPrice = (price: number) => {
    return price.toFixed(2).replace(".", ",") + " €"
  }

  if (!isLoaded) {
    return null // Prevengo problemi SSR
  }

  return (
    <MainLayout>
      {/* Sezione Hero */}
      <div
        className="bg-primary text-white py-5 mb-5"
        style={{
          background: "linear-gradient(135deg, #4158D0 0%, #C850C0 46%, #FFCC70 100%)",
        }}
      >
        <Container>
          <Row className="align-items-center">
            <Col md={6} className="mb-4 mb-md-0">
              <h1 className="display-4 fw-bold">Benvenuto su EyeShop</h1>
              <p className="lead mb-4">
                Scopri le ultime tendenze e acquista con fiducia. Naviga tra i nostri prodotti selezionati e trova ciò
                che stai cercando.
              </p>
              <div className="d-flex gap-3">
                <Link href="/shop/products" passHref>
                  <Button variant="light" size="lg">
                    Acquista Ora
                  </Button>
                </Link>
                {!isTracking ? (
                  <Button
                    variant="outline-light"
                    size="lg"
                    onClick={() => {
                      console.log("Pulsante avvio tracking cliccato nella sezione hero")
                      startTracking()
                    }}
                  >
                    Avvia Eye Tracking
                  </Button>
                ) : (
                  <Button
                    variant="danger"
                    size="lg"
                    onClick={() => {
                      console.log("Pulsante stop tracking cliccato nella sezione hero")
                      stopTracking()
                    }}
                  >
                    Ferma Tracking
                  </Button>
                )}
              </div>
            </Col>
            <Col md={6}>
              <div className="position-relative" style={{ height: "300px" }}>
                <Image
                  src="/placeholder.svg?height=600&width=800"
                  alt="Shopping"
                  fill
                  style={{ objectFit: "cover", borderRadius: "8px" }}
                  priority
                />
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Prodotti in Evidenza */}
      <Container className="mb-5">
        <h2 className="text-center mb-4">Prodotti in Evidenza</h2>
        <Row>
          {featuredProducts.slice(0, 3).map((product) => (
            <Col key={product.id} md={4} className="mb-4">
              <Card className="h-100 shadow-sm border-primary">
                <div className="position-relative" style={{ height: "200px" }}>
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    style={{ objectFit: "cover" }}
                  />
                </div>
                <Card.Body className="d-flex flex-column bg-light">
                  <Card.Title className="text-primary">{product.name}</Card.Title>
                  <Card.Text className="text-danger fw-bold mb-2">{formatPrice(product.price)}</Card.Text>
                  <Card.Text className="mb-4">{product.description.substring(0, 80)}...</Card.Text>
                  <div className="mt-auto">
                    <Link href={`/shop/products/${product.id}`} passHref>
                      <Button variant="outline-primary" className="w-100">
                        Vedi Dettagli
                      </Button>
                    </Link>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
        <div className="text-center mt-4">
          <Link href="/shop/products" passHref>
            <Button variant="primary">Vedi Tutti i Prodotti</Button>
          </Link>
        </div>
      </Container>

      {/* Categorie */}
      <Container className="mb-5">
        <h2 className="text-center mb-4">Acquista per Categoria</h2>
        <Row>
          {[
            {
              name: "Elettronica",
              color: "#4158D0",
              image: "/images/categories/elettronica.jpg",
              category: "electronics",
            },
            {
              name: "Abbigliamento",
              color: "#C850C0",
              image: "/images/categories/abbigliamento.jpg",
              category: "clothing",
            },
            { name: "Casa & Cucina", color: "#FFCC70", image: "/images/categories/casa-cucina.jpg", category: "home" },
          ].map((category, index) => (
            <Col key={index} md={4} className="mb-4">
              <Card
                className="text-center h-100 shadow-sm cursor-pointer"
                style={{ borderColor: category.color, borderWidth: "2px" }}
                onClick={() => navigateToCategory(category.category)}
              >
                <div className="position-relative" style={{ height: "150px" }}>
                  <Image
                    src={`/placeholder.svg?height=300&width=400&text=${category.name}`}
                    alt={category.name}
                    fill
                    style={{ objectFit: "cover" }}
                  />
                </div>
                <Card.Body style={{ backgroundColor: `${category.color}20` }}>
                  <Card.Title style={{ color: category.color }}>{category.name}</Card.Title>
                  <Button
                    variant="outline-primary"
                    style={{ borderColor: category.color, color: category.color }}
                    onClick={(e) => {
                      e.stopPropagation()
                      navigateToCategory(category.category)
                    }}
                  >
                    Sfoglia {category.name}
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>

      {/* Newsletter */}
      <Container className="mb-5">
        <Card className="bg-info text-white p-4 shadow">
          <Card.Body className="text-center">
            <h3>Iscriviti alla Nostra Newsletter</h3>
            <p>Ricevi gli ultimi aggiornamenti sui nuovi prodotti e promozioni speciali.</p>
            <Row className="justify-content-center">
              <Col md={6}>
                <div className="input-group mb-3">
                  <input type="email" className="form-control" placeholder="Il tuo indirizzo email" />
                  <Button variant="dark">Iscriviti</Button>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Container>
    </MainLayout>
  )
}
