"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react"

// Define the GazeDataPoint interface
interface GazeDataPoint {
  x: number
  y: number
  timestamp: number
  page?: string // Aggiungo il campo page per tracciare la pagina
}

// Aggiorna l'interfaccia EyeTrackingContextType per includere la nuova funzione
interface EyeTrackingContextType {
  isTracking: boolean
  gazeData: GazeDataPoint[]
  showHeatmap: boolean
  startTracking: () => void
  stopTracking: () => void
  toggleHeatmap: () => void
  clearGazeData: () => void
  exportGazeData: (pageUrl?: string) => void
  exportHeatmapImage: (pageUrl?: string) => void
  setHeatmapCanvasRef: (canvas: HTMLCanvasElement | null) => void
  exportSuccess: boolean
  setExportSuccess: (value: boolean) => void
}

const EyeTrackingContext = createContext<EyeTrackingContextType>({
  isTracking: false,
  gazeData: [],
  showHeatmap: false,
  startTracking: () => {},
  stopTracking: () => {},
  toggleHeatmap: () => {},
  clearGazeData: () => {},
  exportGazeData: () => {},
  exportHeatmapImage: () => {},
  setHeatmapCanvasRef: () => {},
  exportSuccess: false,
  setExportSuccess: () => {},
})

export function EyeTrackingProvider({ children }: { children: React.ReactNode }) {
  const [isTracking, setIsTracking] = useState(false)
  const [gazeData, setGazeData] = useState<GazeDataPoint[]>([])
  const [showHeatmap, setShowHeatmap] = useState(false)
  const [webgazerLoaded, setWebgazerLoaded] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [exportSuccess, setExportSuccess] = useState(false)
  const gazeListenerRef = useRef<any>(null)
  const currentGazeData = useRef<GazeDataPoint[]>([])
  const webgazerInitialized = useRef(false)
  const initializationAttempted = useRef(false)
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const exportInProgressRef = useRef<boolean>(false)
  const heatmapCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const canvasCheckIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Esegui solo lato client
  useEffect(() => {
    setMounted(true)
  }, [])

  // Funzione per accedere in sicurezza a webgazer dalla finestra
  const getWebgazer = () => {
    if (typeof window !== "undefined") {
      return (window as any).webgazer
    }
    return null
  }

  // Controllo se WebGazer è già caricato
  useEffect(() => {
    if (!mounted) return

    const checkWebgazer = () => {
      if (typeof window !== "undefined" && (window as any).webgazer) {
        console.log("WebGazer rilevato nel contesto")
        setWebgazerLoaded(true)
        return true
      }
      return false
    }

    // Controllo immediatamente
    if (checkWebgazer()) return

    // Se non è caricato, controllo di nuovo dopo un ritardo (per i casi in cui potrebbe caricarsi dopo questo componente)
    const intervalId = setInterval(() => {
      if (checkWebgazer()) {
        clearInterval(intervalId)
      }
    }, 1000)

    return () => clearInterval(intervalId)
  }, [mounted])

  // Inizializza WebGazer quando è caricato
  useEffect(() => {
    if (!mounted || !webgazerLoaded || webgazerInitialized.current || initializationAttempted.current) return

    initializationAttempted.current = true
    const webgazer = getWebgazer()
    if (!webgazer) return

    // Controllo se WebGazer è già inizializzato
    try {
      if (webgazer.isReady()) {
        console.log("WebGazer è già inizializzato")
        webgazerInitialized.current = true
        return
      }
    } catch (error) {
      console.error("Errore nel controllo dello stato di WebGazer:", error)
    }

    // Se abbiamo dati di calibrazione, provo a caricarli
    const isCalibrated = localStorage.getItem("webgazer-calibrated") === "true"
    if (isCalibrated) {
      try {
        console.log("Tentativo di inizializzare WebGazer con la calibrazione salvata")
        webgazer
          .begin()
          .then(() => {
            console.log("WebGazer inizializzato con successo con la calibrazione salvata")
            webgazerInitialized.current = true

            // Nascondi elementi UI
            try {
              if (typeof webgazer.showVideoPreview === "function") {
                webgazer.showVideoPreview(false)
              }
              webgazer.showFaceOverlay(false)
              webgazer.showFaceFeedbackBox(false)
              if (typeof webgazer.showPredictionPoints === "function") {
                webgazer.showPredictionPoints(false)
              }
            } catch (e) {
              console.warn("Errore nel nascondere l'UI di WebGazer:", e)
            }
          })
          .catch((err: any) => {
            console.error("Errore nell'inizializzare WebGazer con la calibrazione salvata:", err)
          })
      } catch (error) {
        console.error("Errore nell'inizializzare WebGazer:", error)
      }
    }
  }, [webgazerLoaded, mounted])

  // Configura il listener dello sguardo quando il tracking inizia
  useEffect(() => {
    if (!mounted || !isTracking) return

    const webgazer = getWebgazer()
    if (!webgazer) {
      console.error("WebGazer non disponibile")
      return
    }

    try {
      // Assicurati che webgazer sia in esecuzione
      if (!webgazer.isReady()) {
        console.log("WebGazer non pronto, inizializzazione in corso...")
        webgazer
          .begin()
          .then(() => {
            console.log("WebGazer inizializzato nel contesto di tracking")
            webgazerInitialized.current = true
            setupGazeListener(webgazer)
          })
          .catch((err: any) => {
            console.error("Errore nell'inizializzare WebGazer:", err)
          })
      } else {
        console.log("WebGazer già pronto")
        setupGazeListener(webgazer)
      }
    } catch (error) {
      console.error("Errore nel controllo dello stato di WebGazer:", error)
    }

    return () => {
      if (webgazer && gazeListenerRef.current) {
        try {
          // Rimuovi il listener dello sguardo
          webgazer.clearGazeListener()
          gazeListenerRef.current = null

          // Nascondi il punto dello sguardo
          if (typeof webgazer.showPredictionPoints === "function") {
            webgazer.showPredictionPoints(false)
          }

          console.log("Listener dello sguardo pulito")
        } catch (error) {
          console.error("Errore nella pulizia del listener dello sguardo:", error)
        }
      }

      // Pulisci l'intervallo di aggiornamento
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current)
        updateIntervalRef.current = null
      }
    }
  }, [isTracking, mounted])

  // Aggiungi event listener per il tasto Enter per esportare la heatmap
  useEffect(() => {
    if (!mounted) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter" && showHeatmap && gazeData.length > 0) {
        console.log("Tasto Enter premuto, esportazione heatmap...")
        exportHeatmapImage()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [mounted, showHeatmap, gazeData])

  // Resetta il messaggio di successo dopo un po'
  useEffect(() => {
    if (!exportSuccess) return

    const timer = setTimeout(() => {
      setExportSuccess(false)
    }, 3000)

    return () => clearTimeout(timer)
  }, [exportSuccess])

  // Aggiorno la funzione setupGazeListener per tenere conto dello scroll e della pagina corrente
  const setupGazeListener = (webgazer: any) => {
    try {
      // Definisci la funzione del listener dello sguardo
      const gazeListener = (data: any, elapsedTime: number) => {
        if (data == null || data.x == null || data.y == null) return

        // Ottieni il percorso corrente
        const currentPath = typeof window !== "undefined" ? window.location.pathname : ""

        // Aggiungi il punto dati dello sguardo al ref per accesso immediato
        // Aggiungo lo scrollY per registrare la posizione assoluta nella pagina
        const newPoint = {
          x: data.x,
          y: data.y + window.scrollY, // Aggiungo lo scroll verticale per avere coordinate assolute
          timestamp: Date.now(),
          page: currentPath, // Aggiungo la pagina corrente
        }

        // Aggiungo il punto anche se si trova sulla barra di navigazione
        currentGazeData.current = [...currentGazeData.current, newPoint]
      }

      // Memorizza il riferimento al listener dello sguardo per la pulizia
      gazeListenerRef.current = gazeListener

      // Imposta il listener dello sguardo
      webgazer.setGazeListener(gazeListener)

      // Mostra il punto dello sguardo per feedback
      if (typeof webgazer.showPredictionPoints === "function") {
        webgazer.showPredictionPoints(true)
      }

      // Configura l'intervallo per aggiornare lo stato gazeData per la heatmap in tempo reale
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current)
      }

      updateIntervalRef.current = setInterval(() => {
        if (currentGazeData.current.length > 0) {
          setGazeData([...currentGazeData.current])
        }
      }, 300) // Aggiorna ogni 300ms per un buon equilibrio tra prestazioni e reattività

      console.log("Listener dello sguardo configurato con successo con aggiornamenti in tempo reale")

      // Mostra heatmap durante il tracking
      setShowHeatmap(true)
    } catch (error) {
      console.error("Errore nella configurazione del listener dello sguardo:", error)
    }
  }

  // Pulisci webgazer quando il componente viene smontato
  useEffect(() => {
    if (!mounted) return

    return () => {
      if (typeof window !== "undefined") {
        const webgazer = getWebgazer()
        if (webgazer) {
          try {
            // Non terminare webgazer, solo mettilo in pausa
            if (typeof webgazer.pause === "function") {
              webgazer.pause()
              console.log("WebGazer messo in pausa durante lo smontaggio")
            }
          } catch (error) {
            console.error("Errore nella pausa di WebGazer:", error)
          }
        }
      }

      // Pulisci l'intervallo di aggiornamento
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current)
      }

      // Pulisci l'intervallo di controllo del canvas
      if (canvasCheckIntervalRef.current) {
        clearInterval(canvasCheckIntervalRef.current)
      }
    }
  }, [mounted])

  const startTracking = useCallback(async () => {
    if (!mounted) return

    const webgazer = getWebgazer()
    if (!webgazer) {
      // Se WebGazer non è disponibile, provo a caricarlo
      if (typeof window !== "undefined" && !document.getElementById("webgazer-script")) {
        console.log("WebGazer non trovato, caricamento script...")
        const script = document.createElement("script")
        script.id = "webgazer-script"
        script.src = "https://webgazer.cs.brown.edu/webgazer.js"
        script.async = true
        script.onload = () => {
          console.log("WebGazer caricato dinamicamente")
          setWebgazerLoaded(true)
          // Prova a iniziare il tracking di nuovo dopo il caricamento dello script
          setTimeout(() => startTracking(), 1000)
        }
        document.body.appendChild(script)
        return
      } else {
        alert("WebGazer non è disponibile. Completa prima la calibrazione.")
        return
      }
    }

    try {
      console.log("Avvio eye tracking...")

      // Resetta i dati dello sguardo
      currentGazeData.current = []
      setGazeData([])

      // Assicurati che webgazer sia in esecuzione
      if (!webgazer.isReady()) {
        console.log("WebGazer non pronto, inizializzazione...")
        await webgazer.begin()
        console.log("WebGazer inizializzato per il tracking")
        webgazerInitialized.current = true
      } else {
        console.log("WebGazer già pronto")
        // Se era in pausa, riprendilo
        if (typeof webgazer.resume === "function") {
          webgazer.resume()
          console.log("WebGazer ripreso")
        }
      }

      // Configura UI
      try {
        if (typeof webgazer.showVideo === "function") {
          webgazer.showVideo(false)
        } else if (typeof webgazer.showVideoPreview === "function") {
          webgazer.showVideoPreview(false)
        }
      } catch (e) {
        console.warn("Impossibile nascondere il video:", e)
      }

      try {
        webgazer.showFaceOverlay(false)
      } catch (e) {
        console.warn("Impossibile nascondere l'overlay del viso:", e)
      }

      try {
        webgazer.showFaceFeedbackBox(false)
      } catch (e) {
        console.warn("Impossibile nascondere il box di feedback del viso:", e)
      }

      try {
        if (typeof webgazer.showPredictionPoints === "function") {
          webgazer.showPredictionPoints(true)
          console.log("Visualizzazione punti di previsione")
        }
      } catch (e) {
        console.warn("Impossibile mostrare i punti di previsione:", e)
      }

      // Avvia tracking
      setIsTracking(true)

      // Mostra heatmap durante il tracking
      setShowHeatmap(true)

      console.log("Eye tracking avviato con heatmap in tempo reale")
    } catch (error) {
      console.error("Errore nell'avvio di WebGazer:", error)
      alert("Impossibile avviare l'eye tracking. Assicurati che l'accesso alla fotocamera sia concesso.")
    }
  }, [webgazerLoaded, mounted])

  const stopTracking = useCallback(() => {
    if (!mounted) return

    const webgazer = getWebgazer()
    if (!webgazer || !isTracking) return

    try {
      console.log("Arresto eye tracking...")

      // Nascondi i punti di previsione
      try {
        if (typeof webgazer.showPredictionPoints === "function") {
          webgazer.showPredictionPoints(false)
        }
      } catch (e) {
        console.warn("Impossibile nascondere i punti di previsione:", e)
      }

      // Ferma il tracking
      setIsTracking(false)
      console.log("Eye tracking fermato")

      // Assicurati di avere i dati più recenti
      setGazeData([...currentGazeData.current])

      // Esporta i dati solo quando l'utente ferma manualmente il tracking
      exportGazeData(undefined)
    } catch (error) {
      console.error("Errore nell'arresto di WebGazer:", error)
    }
  }, [isTracking, mounted])

  const toggleHeatmap = useCallback(() => {
    if (!mounted) return
    setShowHeatmap((prev) => !prev)
  }, [mounted])

  const clearGazeData = useCallback(() => {
    currentGazeData.current = []
    setGazeData([])
  }, [])

  // Funzione per impostare il riferimento al canvas della heatmap
  const setHeatmapCanvasRef = useCallback((canvas: HTMLCanvasElement | null) => {
    console.log("Canvas della heatmap impostato:", canvas ? "disponibile" : "null")
    heatmapCanvasRef.current = canvas
  }, [])

  // Funzione per trovare il canvas della heatmap nel DOM
  const findHeatmapCanvas = useCallback(() => {
    // Prima controlla se abbiamo già un riferimento
    if (heatmapCanvasRef.current) {
      return heatmapCanvasRef.current
    }

    // Altrimenti cerca nel DOM
    if (typeof document !== "undefined") {
      const canvas = document.getElementById("heatmap-canvas") as HTMLCanvasElement
      if (canvas) {
        heatmapCanvasRef.current = canvas
        return canvas
      }
    }

    return null
  }, [])

  const exportToCsv = (data: GazeDataPoint[], pageUrl?: string) => {
    if (!mounted || data.length === 0 || typeof window === "undefined") {
      console.warn("Nessun dato dello sguardo da esportare")
      return
    }

    try {
      console.log(`Esportazione di ${data.length} punti dati dello sguardo in CSV`)

      // Crea contenuto CSV con informazioni sulla pagina
      const csvContent = [
        "x,y,timestamp,page",
        ...data.map(
          (point) => `${point.x},${point.y},${point.timestamp},${point.page || pageUrl || window.location.pathname}`,
        ),
      ].join("\n")

      // Crea e scarica il file usando direttamente l'API Blob
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" })

      // Crea un nome file con la pagina corrente
      const pageName = (pageUrl || window.location.pathname).replace(/\//g, "_").replace(/^_/, "")
      const timestamp = new Date().toISOString().replace(/:/g, "-").split(".")[0]
      const fileName = `eyetracking_${pageName || "home"}_${timestamp}.csv`

      // Crea un link di download e attivalo
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()

      // Pulizia
      setTimeout(() => {
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      }, 100)

      console.log(`Esportati ${data.length} punti dati dello sguardo in CSV`)
    } catch (error) {
      console.error("Errore nell'esportazione CSV:", error)
      alert("Impossibile esportare i dati. Vedi la console per i dettagli.")
    }
  }

  const exportGazeData = useCallback(
    (pageUrl?: string) => {
      exportToCsv(currentGazeData.current, pageUrl)
    },
    [mounted],
  )

  // Funzione per esportare solo l'immagine della heatmap
  const exportHeatmapImage = useCallback(
    (pageUrl?: string) => {
      if (!mounted || gazeData.length === 0 || typeof window === "undefined") {
        console.log("Nessun dato da esportare per l'immagine della heatmap o ambiente non browser")
        return
      }

      // Previeni esportazioni multiple simultanee
      if (exportInProgressRef.current) {
        console.log("Esportazione già in corso, saltata")
        return
      }

      try {
        exportInProgressRef.current = true
        console.log("Esportazione dell'immagine della heatmap...")

        // Trova il canvas della heatmap
        const canvas = findHeatmapCanvas()

        if (!canvas) {
          console.log("Canvas della heatmap non trovato, tentativo di ricerca con intervallo...")

          // Se il canvas non è disponibile, imposta un intervallo per cercarlo
          let attempts = 0
          const maxAttempts = 10

          if (canvasCheckIntervalRef.current) {
            clearInterval(canvasCheckIntervalRef.current)
          }

          canvasCheckIntervalRef.current = setInterval(() => {
            attempts++
            const foundCanvas = findHeatmapCanvas()

            if (foundCanvas) {
              clearInterval(canvasCheckIntervalRef.current!)
              console.log("Canvas della heatmap trovato dopo tentativi:", attempts)
              proceedWithExport(foundCanvas)
            } else if (attempts >= maxAttempts) {
              clearInterval(canvasCheckIntervalRef.current!)
              console.error("Canvas della heatmap non trovato dopo", maxAttempts, "tentativi")
              exportInProgressRef.current = false
            }
          }, 200)

          return
        }

        proceedWithExport(canvas)
      } catch (error) {
        console.error("Errore nell'esportazione dell'immagine della heatmap:", error)
        exportInProgressRef.current = false
      }

      // Funzione interna per procedere con l'esportazione una volta trovato il canvas
      function proceedWithExport(canvas: HTMLCanvasElement) {
        try {
          // Esporta solo il canvas della heatmap
          const timestamp = new Date().toISOString().replace(/:/g, "-").split(".")[0]
          const currentPage = pageUrl || window.location.pathname
          const pageName = currentPage.replace(/\//g, "_").replace(/^_/, "")
          const fileName = `heatmap_${pageName || "home"}_${timestamp}.png`

          // Crea un canvas temporaneo per aggiungere informazioni
          const tempCanvas = document.createElement("canvas")
          tempCanvas.width = canvas.width
          tempCanvas.height = canvas.height
          const ctx = tempCanvas.getContext("2d")

          if (ctx) {
            // Disegna la heatmap
            ctx.drawImage(canvas, 0, 0)

            // Aggiungi informazioni sulla pagina
            ctx.fillStyle = "rgba(0, 0, 0, 0.7)"
            ctx.fillRect(0, tempCanvas.height - 40, tempCanvas.width, 40)
            ctx.fillStyle = "white"
            ctx.font = "14px Arial"
            ctx.fillText(`Pagina: ${currentPage} - ${new Date().toLocaleString()}`, 10, tempCanvas.height - 15)

            // Esporta l'immagine
            tempCanvas.toBlob((blob) => {
              if (blob) {
                const url = URL.createObjectURL(blob)
                const link = document.createElement("a")
                link.href = url
                link.download = fileName
                document.body.appendChild(link)
                link.click()

                setTimeout(() => {
                  document.body.removeChild(link)
                  URL.revokeObjectURL(url)
                  exportInProgressRef.current = false

                  // Mostra messaggio di successo
                  setExportSuccess(true)
                }, 100)

                console.log(`Immagine della heatmap esportata come ${fileName}`)
              } else {
                exportInProgressRef.current = false
              }
            }, "image/png")
          } else {
            exportInProgressRef.current = false
          }
        } catch (error) {
          console.error("Errore durante l'esportazione:", error)
          exportInProgressRef.current = false
        }
      }
    },
    [gazeData, mounted, findHeatmapCanvas],
  )

  // Aggiungi exportGazeData al context value
  return (
    <EyeTrackingContext.Provider
      value={{
        isTracking,
        gazeData,
        showHeatmap,
        startTracking,
        stopTracking,
        toggleHeatmap,
        clearGazeData,
        exportGazeData,
        exportHeatmapImage,
        setHeatmapCanvasRef,
        exportSuccess,
        setExportSuccess,
      }}
    >
      {children}
    </EyeTrackingContext.Provider>
  )
}

export const useEyeTracking = () => useContext(EyeTrackingContext)

