"use client"

import { useEffect, useRef, useState } from "react"
import { useEyeTracking } from "@/context/eye-tracking-context"

// Configurazione della heatmap
const HEATMAP_CONFIG = {
  radius: 40, // Raggio di influenza di ogni punto in pixel
  maxOpacity: 0.7, // Opacità massima della heatmap
  minOpacity: 0.05, // Opacità minima della heatmap
  blur: 15, // Quantità di sfocatura (in pixel)
  gradient: {
    0.0: "blue", // Intensità bassa
    0.25: "cyan", // Intensità medio-bassa
    0.5: "lime", // Intensità media
    0.75: "yellow", // Intensità medio-alta
    1.0: "red", // Intensità alta
  },
}

export default function HeatmapOverlay() {
  const { gazeData, showHeatmap, setHeatmapCanvasRef, exportSuccess } = useEyeTracking()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [mounted, setMounted] = useState(false)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const intensityMapRef = useRef<number[][]>()
  const gradientRef = useRef<CanvasGradient>()
  const renderTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastRenderTimeRef = useRef<number>(0)

  // Esegui solo lato client
  useEffect(() => {
    setMounted(true)
    updateDimensions()
  }, [])

  // Funzione per aggiornare le dimensioni del canvas
  const updateDimensions = () => {
    if (typeof window !== "undefined") {
      // Imposto le dimensioni per coprire l'intera viewport
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }
  }

  // Passa il riferimento al canvas al context immediatamente dopo il montaggio
  useEffect(() => {
    if (canvasRef.current && mounted) {
      console.log("Impostazione del riferimento al canvas della heatmap")
      setHeatmapCanvasRef(canvasRef.current)
    }

    return () => {
      if (mounted) {
        setHeatmapCanvasRef(null)
      }
    }
  }, [canvasRef, setHeatmapCanvasRef, mounted])

  // Gestisci il ridimensionamento della finestra
  useEffect(() => {
    if (!mounted) return

    const handleResize = () => {
      updateDimensions()
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [mounted])

  // Crea la mappa di intensità e il gradiente
  useEffect(() => {
    if (!mounted || !canvasRef.current || !showHeatmap) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Crea il gradiente di colori una sola volta
    if (!gradientRef.current) {
      const gradient = ctx.createLinearGradient(0, 0, 0, 256)
      for (const [stop, color] of Object.entries(HEATMAP_CONFIG.gradient)) {
        gradient.addColorStop(Number.parseFloat(stop), color)
      }
      gradientRef.current = gradient
    }
  }, [mounted, showHeatmap])

  // Renderizza la heatmap quando i dati cambiano con throttling
  useEffect(() => {
    if (!mounted || !showHeatmap || !canvasRef.current || gazeData.length === 0) return

    // Implementa throttling per evitare troppe renderizzazioni
    const now = Date.now()
    const throttleTime = 100 // ms

    if (now - lastRenderTimeRef.current < throttleTime) {
      // Se è passato troppo poco tempo dall'ultima renderizzazione, pianifica una nuova
      if (renderTimeoutRef.current) {
        clearTimeout(renderTimeoutRef.current)
      }

      renderTimeoutRef.current = setTimeout(() => {
        renderHeatmap()
        renderTimeoutRef.current = null
      }, throttleTime)

      return
    }

    // Altrimenti renderizza subito
    renderHeatmap()
  }, [gazeData, showHeatmap, mounted, dimensions])

  // Funzione per renderizzare la heatmap
  const renderHeatmap = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx || !gradientRef.current) return

    // Imposta le dimensioni del canvas per coprire l'intera viewport
    canvas.width = dimensions.width
    canvas.height = dimensions.height

    // Crea una mappa di intensità
    const intensityMap = createIntensityMap(dimensions.width, dimensions.height, gazeData)
    intensityMapRef.current = intensityMap

    // Pulisci il canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Disegna la heatmap
    drawHeatmap(ctx, intensityMap, gradientRef.current)

    // Aggiorna il timestamp dell'ultima renderizzazione
    lastRenderTimeRef.current = Date.now()
  }

  // Crea una mappa di intensità basata sui punti di sguardo
  const createIntensityMap = (width: number, height: number, points: Array<{ x: number; y: number }>) => {
    // Crea una griglia di intensità con risoluzione ridotta per performance
    const scale = 4 // Fattore di scala (1 = risoluzione completa, 2 = metà risoluzione, ecc.)
    const gridWidth = Math.ceil(width / scale)
    const gridHeight = Math.ceil(height / scale)

    // Inizializza la griglia con zeri
    const grid: number[][] = Array(gridHeight)
      .fill(0)
      .map(() => Array(gridWidth).fill(0))

    // Calcola l'intensità per ogni punto della griglia
    points.forEach((point) => {
      // Adatta le coordinate per considerare solo la parte visibile (viewport)
      const viewportY = point.y - window.scrollY

      // Verifica se il punto è all'interno della viewport
      if (viewportY >= 0 && viewportY <= window.innerHeight) {
        const centerX = Math.floor(point.x / scale)
        const centerY = Math.floor(viewportY / scale)
        const radius = Math.ceil(HEATMAP_CONFIG.radius / scale)

        // Aggiungi intensità in un'area circolare attorno al punto
        for (let y = Math.max(0, centerY - radius); y < Math.min(gridHeight, centerY + radius); y++) {
          for (let x = Math.max(0, centerX - radius); x < Math.min(gridWidth, centerX + radius); x++) {
            const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2))
            if (distance <= radius) {
              // Intensità diminuisce con la distanza dal centro (funzione gaussiana)
              const intensity = Math.exp(-(distance * distance) / (2 * (radius / 2) * (radius / 2)))
              grid[y][x] += intensity
            }
          }
        }
      }
    })

    return grid
  }

  // Disegna la heatmap sul canvas in modo ottimizzato
  const drawHeatmap = (ctx: CanvasRenderingContext2D, intensityMap: number[][], gradient: CanvasGradient) => {
    const scale = 4 // Deve corrispondere al fattore di scala usato in createIntensityMap
    const width = intensityMap[0].length
    const height = intensityMap.length

    // Trova il valore massimo di intensità per normalizzare
    let maxIntensity = 0
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        maxIntensity = Math.max(maxIntensity, intensityMap[y][x])
      }
    }

    // Se non ci sono punti con intensità, non disegnare nulla
    if (maxIntensity === 0) return

    // Crea un'immagine di dati per la heatmap
    const imageData = ctx.createImageData(width, height)
    const data = imageData.data

    // Crea un canvas temporaneo per il gradiente
    const tempCanvas = document.createElement("canvas")
    const tempCtx = tempCanvas.getContext("2d")
    if (!tempCtx) return

    tempCanvas.width = 1
    tempCanvas.height = 256
    tempCtx.fillStyle = gradient
    tempCtx.fillRect(0, 0, 1, 256)
    const gradientData = tempCtx.getImageData(0, 0, 1, 256).data

    // Riempi l'immagine di dati con i valori di intensità colorati
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const intensity = intensityMap[y][x] / maxIntensity // Normalizza tra 0 e 1

        if (intensity > 0) {
          // Ottieni il colore dal gradiente pre-calcolato
          const colorIndex = Math.floor(intensity * 255) * 4

          // Calcola l'opacità basata sull'intensità
          const alpha = HEATMAP_CONFIG.minOpacity + (HEATMAP_CONFIG.maxOpacity - HEATMAP_CONFIG.minOpacity) * intensity

          // Imposta il colore nel pixel dell'immagine di dati
          const index = (y * width + x) * 4
          data[index] = gradientData[colorIndex] // R
          data[index + 1] = gradientData[colorIndex + 1] // G
          data[index + 2] = gradientData[colorIndex + 2] // B
          data[index + 3] = Math.floor(alpha * 255) // A
        }
      }
    }

    // Crea un canvas temporaneo per la heatmap a bassa risoluzione
    const heatmapCanvas = document.createElement("canvas")
    heatmapCanvas.width = width
    heatmapCanvas.height = height
    const heatmapCtx = heatmapCanvas.getContext("2d")
    if (!heatmapCtx) return

    // Disegna l'immagine di dati sul canvas temporaneo
    heatmapCtx.putImageData(imageData, 0, 0)

    // Applica sfocatura per un effetto più morbido
    heatmapCtx.filter = `blur(${HEATMAP_CONFIG.blur / scale}px)`
    heatmapCtx.drawImage(heatmapCanvas, 0, 0)
    heatmapCtx.filter = "none"

    // Disegna il canvas temporaneo sul canvas principale, scalandolo alla dimensione originale
    ctx.drawImage(heatmapCanvas, 0, 0, width, height, 0, 0, ctx.canvas.width, ctx.canvas.height)
  }

  if (!mounted || !showHeatmap) return null

  return (
    <>
      <canvas
        ref={canvasRef}
        className="position-fixed top-0 left-0 pointer-events-none"
        style={{
          zIndex: 1000,
          width: "100%",
          height: "100vh",
        }}
        id="heatmap-canvas"
      />

      {/* Notifica di esportazione riuscita */}
      {exportSuccess && (
        <div
          className="position-fixed bottom-0 start-50 translate-middle-x mb-4 p-3 bg-success text-white rounded shadow-lg"
          style={{ zIndex: 1100 }}
        >
          Heatmap esportata con successo! 🎉
        </div>
      )}
    </>
  )
}

