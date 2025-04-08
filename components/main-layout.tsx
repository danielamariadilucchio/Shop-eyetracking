"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Container } from "react-bootstrap"
import { useEyeTracking } from "@/context/eye-tracking-context"
import HeatmapOverlay from "@/components/heatmap-overlay"
import HeatmapControls from "@/components/heatmap-controls"
import SidebarNavigation from "@/components/sidebar-navigation"
import Link from "next/link"
import "bootstrap/dist/css/bootstrap.min.css"
import { useRouter } from "next/navigation"
import { Keyboard } from "lucide-react"

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  const [showHelp, setShowHelp] = useState(true)
  const eyeTracking = useEyeTracking()
  const { isTracking, stopTracking, showHeatmap, exportHeatmapImage } = eyeTracking
  const router = useRouter()

  // Esegui solo lato client
  useEffect(() => {
    setMounted(true)

    // Gestisci la pressione della barra spaziatrice per fermare il tracking
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Space" && isTracking) {
        event.preventDefault() // Previeni lo scorrimento
        stopTracking()
      } else if (event.key === "Enter" && showHeatmap && isTracking) {
        event.preventDefault()
        exportHeatmapImage()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isTracking, stopTracking, showHeatmap, exportHeatmapImage])

  const navigateToCategory = (category: string) => {
    // Usa un link diretto per evitare problemi di navigazione
    window.location.href = `/shop/products?category=${category}`
  }

  if (!mounted) return null // Previeni problemi SSR

  return (
    <div className="d-flex flex-column min-vh-100" id="main-layout-container">
      {/* Navigazione Sidebar */}
      <SidebarNavigation />

      {/* Banner informativo */}
      {showHelp && (
        <div className="bg-light border-bottom py-2">
          <Container className="top-bar-spacer d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <Keyboard size={20} className="me-2" />
              <span>
                <strong>Comandi rapidi:</strong> <kbd className="ms-1">Spazio</kbd> per fermare il tracking,
                <kbd className="ms-1">Enter</kbd> per esportare manualmente la heatmap
              </span>
            </div>
            <button className="btn btn-sm btn-close" onClick={() => setShowHelp(false)} aria-label="Chiudi"></button>
          </Container>
        </div>
      )}

      {/* Contenuto Principale */}
      <main className="flex-grow-1">{children}</main>

      {/* Footer */}
      <footer className="bg-dark text-white py-4 mt-5">
        <Container className="top-bar-spacer">
          <div className="d-flex flex-column flex-md-row justify-content-between">
            <div className="mb-3 mb-md-0">
              <h5 className="text-warning">StyleShop</h5>
              <p className="text-muted mb-0">© {new Date().getFullYear()} Tutti i diritti riservati.</p>
            </div>

            <div className="d-flex flex-column mb-3 mb-md-0">
              <h6 className="text-info">Categorie</h6>
              <span
                className="text-muted text-decoration-none cursor-pointer"
                onClick={() => navigateToCategory("electronics")}
              >
                Elettronica
              </span>
              <span
                className="text-muted text-decoration-none cursor-pointer"
                onClick={() => navigateToCategory("clothing")}
              >
                Abbigliamento
              </span>
              <span
                className="text-muted text-decoration-none cursor-pointer"
                onClick={() => navigateToCategory("home")}
              >
                Casa & Cucina
              </span>
            </div>

            <div className="d-flex flex-column mb-3 mb-md-0">
              <h6 className="text-info">Link utili</h6>
              <Link href="/" className="text-muted text-decoration-none">
                Home
              </Link>
              <Link href="/calibration" className="text-muted text-decoration-none">
                Calibrazione
              </Link>
              <Link href="/shop" className="text-muted text-decoration-none">
                Negozio
              </Link>
            </div>
          </div>
        </Container>
      </footer>

      {/* Notifica eye tracking */}
      {isTracking && (
        <div className="position-fixed bottom-0 start-0 w-100 bg-danger text-white p-2 text-center">
          <p className="m-0">
            Eye tracking attivo. Premi <kbd>Spazio</kbd> per fermare il tracking.
            {showHeatmap && " Premi "}
            {showHeatmap && <kbd>Enter</kbd>}
            {showHeatmap && " per esportare manualmente la heatmap."}
          </p>
        </div>
      )}

      {/* Renderizza overlay heatmap */}
      <HeatmapOverlay />

      {/* Controlli heatmap */}
      <HeatmapControls />
    </div>
  )
}

