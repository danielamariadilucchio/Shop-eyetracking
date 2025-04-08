"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ShoppingCart,
  Home,
  Search,
  Eye,
  BarChart2,
  Menu,
  X,
  Laptop,
  Shirt,
  HomeIcon,
  Grid,
  ChevronRight,
  Trash2,
  User,
  Heart,
  Settings,
  HelpCircle,
  LogOut,
} from "lucide-react"
import { Form, Button, Badge, InputGroup } from "react-bootstrap"
import { useCart } from "@/context/cart-context"
import { useEyeTracking } from "@/context/eye-tracking-context"
import { useFavorites } from "@/context/favorites-context"

export default function SidebarNavigation() {
  const router = useRouter()
  const { cartItems } = useCart()
  const { favorites } = useFavorites()
  const { isTracking, startTracking, stopTracking, showHeatmap, toggleHeatmap, gazeData, clearGazeData } =
    useEyeTracking()
  const [searchTerm, setSearchTerm] = useState("")
  const [mounted, setMounted] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  const totalFavorites = favorites.length

  // Eseguo solo lato client
  useEffect(() => {
    setMounted(true)
  }, [])

  // Chiudo sidebar quando si clicca fuori
  useEffect(() => {
    if (!mounted) return

    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById("sidebar")
      const toggleButton = document.getElementById("sidebar-toggle")

      if (
        sidebar &&
        !sidebar.contains(event.target as Node) &&
        toggleButton &&
        !toggleButton.contains(event.target as Node) &&
        sidebarOpen
      ) {
        setSidebarOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [sidebarOpen, mounted])

  // Prevengo lo scorrimento quando la sidebar è aperta su mobile
  useEffect(() => {
    if (!mounted) return

    if (sidebarOpen && window.innerWidth < 992) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }

    return () => {
      document.body.style.overflow = "auto"
    }
  }, [sidebarOpen, mounted])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      router.push(`/shop/products?search=${encodeURIComponent(searchTerm.trim())}`)
      setSidebarOpen(false)
    }
  }

  const handleNavClick = () => {
    setSidebarOpen(false)
  }

  const navigateToCategory = (category: string) => {
    // Chiudo la sidebar prima di navigare
    setSidebarOpen(false)

    // Navigo alla pagina dei prodotti con il parametro di categoria
    const url = `/shop/products?category=${category}`

    // Uso un approccio più semplice per la navigazione
    window.location.href = url
  }

  if (!mounted) return null

  return (
    <>
      {/* Pulsante Toggle Sidebar */}
      <button
        id="sidebar-toggle"
        className="btn btn-dark position-fixed d-lg-none"
        style={{
          top: "10px",
          left: "10px",
          zIndex: 1050,
          width: "40px",
          height: "40px",
          padding: "0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "50%",
        }}
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Brand e Carrello nella barra superiore fissa */}
      <div
        className="bg-dark text-white py-2 px-3 d-flex justify-content-between align-items-center"
        style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 1040 }}
        id="top-navigation-bar" // Aggiungo un ID per poterlo identificare facilmente
      >
        <div className="d-flex align-items-center">
          <span className="d-lg-none" style={{ width: "40px" }}></span> {/* Spaziatore per il pulsante toggle */}
          <Link href="/shop" className="text-decoration-none">
            <h1 className="text-warning m-0 fs-4">EyeShop</h1>
          </Link>
        </div>

        <div className="d-flex align-items-center">
          {/* Controlli eye tracking - visibili su tutti gli schermi */}
          <div className="d-flex align-items-center me-3">
            {!isTracking ? (
              <button
                className="btn btn-outline-warning btn-sm d-flex align-items-center"
                onClick={() => {
                  console.log("Pulsante avvio tracking cliccato")
                  startTracking()
                }}
                title="Avvia eye tracking"
              >
                <Eye size={18} className="me-1" />
                <span className="d-none d-sm-inline">Avvia Tracking</span>
              </button>
            ) : (
              <button
                className="btn btn-danger btn-sm d-flex align-items-center"
                onClick={() => {
                  console.log("Pulsante stop tracking cliccato")
                  stopTracking()
                }}
              >
                <Eye size={18} className="me-1" />
                <span className="d-none d-sm-inline">Stop</span>
              </button>
            )}

            <div className="d-flex">
              {gazeData.length > 0 && (
                <>
                  <button
                    className={`btn btn-sm ms-2 ${showHeatmap ? "btn-success" : "btn-outline-light"}`}
                    onClick={toggleHeatmap}
                    title={showHeatmap ? "Nascondi Heatmap" : "Mostra Heatmap"}
                  >
                    <BarChart2 size={18} />
                  </button>

                  <button
                    className="btn btn-outline-danger btn-sm ms-2"
                    onClick={clearGazeData}
                    title="Cancella Dati Heatmap"
                  >
                    <Trash2 size={18} />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Link preferiti */}
          <Link href="/shop/favorites" className="text-decoration-none position-relative me-3">
            <div className="d-flex align-items-center text-white">
              <Heart size={24} />
              {totalFavorites > 0 && (
                <Badge bg="danger" pill className="position-absolute top-0 start-100 translate-middle">
                  {totalFavorites}
                </Badge>
              )}
            </div>
          </Link>

          {/* Link carrello - sempre visibile */}
          <Link href="/shop/cart" className="text-decoration-none position-relative">
            <div className="d-flex align-items-center text-white">
              <ShoppingCart size={24} />
              {totalItems > 0 && (
                <Badge bg="danger" pill className="position-absolute top-0 start-100 translate-middle">
                  {totalItems}
                </Badge>
              )}
              <span className="ms-2 d-none d-sm-inline">Carrello</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Sidebar */}
      <div
        id="sidebar"
        className={`bg-dark text-white position-fixed h-100 d-flex flex-column transition-all ${sidebarOpen ? "show" : ""}`}
        style={{
          top: 0,
          left: sidebarOpen ? 0 : "-280px",
          width: "280px",
          zIndex: 1045,
          paddingTop: "60px", // Spazio per la barra superiore
          transition: "left 0.3s ease",
          overflowY: "auto",
          boxShadow: sidebarOpen ? "0 0 15px rgba(0,0,0,0.5)" : "none",
        }}
      >
        {/* Profilo utente */}
        <div className="p-4 text-center border-bottom border-secondary mb-3">
          <div
            className="rounded-circle bg-primary mx-auto mb-3 d-flex align-items-center justify-content-center"
            style={{ width: "70px", height: "70px" }}
          >
            <User size={32} />
          </div>
          <h5 className="mb-1">Visitatore</h5>
          <p className="text-muted small mb-0">Benvenuto nel negozio</p>
        </div>

        {/* Form di ricerca */}
        <div className="px-4 pb-3">
          <Form onSubmit={handleSearch}>
            <InputGroup>
              <Form.Control
                type="search"
                placeholder="Cerca prodotti..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Cerca"
                className="border-0"
              />
              <Button variant="warning" type="submit">
                <Search size={18} />
              </Button>
            </InputGroup>
          </Form>
        </div>

        {/* Link di navigazione */}
        <div className="p-3">
          <h6 className="text-warning text-uppercase small mb-3 px-2">Navigazione</h6>

          <Link href="/shop" className="text-decoration-none" onClick={handleNavClick}>
            <div className="d-flex align-items-center text-white mb-2 p-2 rounded hover-bg-secondary">
              <Home size={20} className="me-3 text-warning" />
              <span>Home</span>
            </div>
          </Link>

          <Link href="/shop/products" className="text-decoration-none" onClick={handleNavClick}>
            <div className="d-flex align-items-center text-white mb-2 p-2 rounded hover-bg-secondary">
              <Grid size={20} className="me-3 text-warning" />
              <span>Tutti i Prodotti</span>
            </div>
          </Link>

          <Link href="/shop/favorites" className="text-decoration-none" onClick={handleNavClick}>
            <div className="d-flex align-items-center text-white mb-2 p-2 rounded hover-bg-secondary">
              <Heart size={20} className="me-3 text-warning" />
              <span>Preferiti</span>
              {totalFavorites > 0 && (
                <Badge bg="danger" pill className="ms-auto">
                  {totalFavorites}
                </Badge>
              )}
            </div>
          </Link>

          <Link href="/shop/cart" className="text-decoration-none" onClick={handleNavClick}>
            <div className="d-flex align-items-center text-white mb-2 p-2 rounded hover-bg-secondary">
              <ShoppingCart size={20} className="me-3 text-warning" />
              <span>Carrello</span>
              {totalItems > 0 && (
                <Badge bg="danger" pill className="ms-auto">
                  {totalItems}
                </Badge>
              )}
            </div>
          </Link>
        </div>

        {/* Categorie */}
        <div className="p-3 border-top border-secondary">
          <h6 className="text-warning text-uppercase small mb-3 px-2">Categorie</h6>

          <div
            className="d-flex align-items-center text-white mb-2 p-2 rounded hover-bg-secondary cursor-pointer"
            onClick={() => navigateToCategory("electronics")}
            role="button"
            tabIndex={0}
          >
            <Laptop size={20} className="me-3 text-info" />
            <span>Elettronica</span>
            <ChevronRight size={16} className="ms-auto" />
          </div>

          <div
            className="d-flex align-items-center text-white mb-2 p-2 rounded hover-bg-secondary cursor-pointer"
            onClick={() => navigateToCategory("clothing")}
            role="button"
            tabIndex={0}
          >
            <Shirt size={20} className="me-3 text-success" />
            <span>Abbigliamento</span>
            <ChevronRight size={16} className="ms-auto" />
          </div>

          <div
            className="d-flex align-items-center text-white mb-2 p-2 rounded hover-bg-secondary cursor-pointer"
            onClick={() => navigateToCategory("home")}
            role="button"
            tabIndex={0}
          >
            <HomeIcon size={20} className="me-3 text-danger" />
            <span>Casa & Cucina</span>
            <ChevronRight size={16} className="ms-auto" />
          </div>
        </div>

        {/* Sezione inferiore */}
        <div className="mt-auto p-3 border-top border-secondary">
          <div className="d-flex align-items-center text-white mb-2 p-2 rounded hover-bg-secondary">
            <Settings size={20} className="me-3 text-muted" />
            <span>Impostazioni</span>
          </div>

          <div className="d-flex align-items-center text-white mb-2 p-2 rounded hover-bg-secondary">
            <HelpCircle size={20} className="me-3 text-muted" />
            <span>Aiuto</span>
          </div>

          <div className="d-flex align-items-center text-white p-2 rounded hover-bg-secondary">
            <LogOut size={20} className="me-3 text-muted" />
            <span>Esci</span>
          </div>
        </div>
      </div>

      {/* Overlay per mobile */}
      {sidebarOpen && (
        <div
          className="position-fixed top-0 left-0 w-100 h-100 bg-dark d-lg-none"
          style={{
            zIndex: 1044,
            opacity: 0.5,
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Aggiungo stili personalizzati */}
      <style jsx global>{`
        @media (min-width: 992px) {
          #sidebar {
            left: 0 !important;
          }
          
          main {
            margin-left: 280px;
          }
          
          .top-bar-spacer {
            margin-left: 280px;
          }
        }
        
        .hover-bg-secondary:hover {
          background-color: rgba(255, 255, 255, 0.15);
          transform: translateX(5px);
          transition: all 0.2s ease;
        }
        
        body {
          padding-top: 56px; /* Altezza della barra superiore */
        }
        
        .cursor-pointer {
          cursor: pointer;
        }
      `}</style>
    </>
  )
}

