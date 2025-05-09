"use client"
import { useEffect, useRef, Suspense } from "react"
import { usePathname } from "next/navigation"
import { useEyeTracking } from "@/context/eye-tracking-context"

// Componente che usa useSearchParams
function PageChangeTrackerInner() {
  const { useSearchParams } = require("next/navigation")
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const { isTracking, gazeData, exportHeatmapImage, exportGazeData, clearGazeData } = useEyeTracking()
  const previousPathRef = useRef<string | null>(null)
  const previousSearchParamsRef = useRef<string | null>(null)
  const initialLoadRef = useRef<boolean>(true)
  const exportInProgressRef = useRef<boolean>(false)

  useEffect(() => {
    // Se è il primo caricamento, salva solo il percorso senza esportare
    if (initialLoadRef.current) {
      previousPathRef.current = pathname
      previousSearchParamsRef.current = searchParams?.toString() || null
      initialLoadRef.current = false
      return
    }

    // Verifica se c'è stato un cambio di pagina effettivo
    const currentSearchParams = searchParams?.toString() || null
    const hasPathChanged = pathname !== previousPathRef.current
    const hasSearchParamsChanged = currentSearchParams !== previousSearchParamsRef.current

    // Se c'è stato un cambio di pagina e l'eye tracking è attivo
    if ((hasPathChanged || hasSearchParamsChanged) && isTracking && !exportInProgressRef.current) {
      exportInProgressRef.current = true

      // Esporta solo se ci sono dati da esportare
      if (gazeData.length > 0) {
        console.log("Cambio pagina rilevato, esportazione automatica heatmap e dati...")

        // Salva il percorso precedente per l'esportazione
        const prevPath = previousPathRef.current || "/"

        // Esporta i dati di eye tracking come CSV
        exportGazeData(prevPath)

        // Attendi un momento prima di tentare l'esportazione della heatmap
        // per dare tempo al canvas di essere disponibile
        setTimeout(() => {
          try {
            // Tenta di esportare la heatmap
            exportHeatmapImage(prevPath)
          } catch (error) {
            console.error("Errore durante l'esportazione della heatmap:", error)
          }

          // Pulisci i dati per la nuova pagina dopo un breve ritardo
          setTimeout(() => {
            clearGazeData()
            exportInProgressRef.current = false
          }, 300)
        }, 500)
      } else {
        exportInProgressRef.current = false
      }
    }

    // Aggiorna i riferimenti per il prossimo cambio
    previousPathRef.current = pathname
    previousSearchParamsRef.current = currentSearchParams
  }, [pathname, searchParams, isTracking, gazeData, exportHeatmapImage, exportGazeData, clearGazeData])

  // Questo componente non renderizza nulla, è solo per la logica
  return null
}

// Componente principale con Suspense
export default function PageChangeTracker() {
  return (
    <Suspense fallback={null}>
      <PageChangeTrackerInner />
    </Suspense>
  )
}