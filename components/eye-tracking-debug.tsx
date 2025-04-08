"use client"

import { useState, useEffect, useRef } from "react"
import { Button, Card, Form } from "react-bootstrap"
import { useEyeTracking } from "@/context/eye-tracking-context"

export default function EyeTrackingDebug() {
  const { isTracking, gazeData, startTracking, stopTracking } = useEyeTracking()
  const [showDebug, setShowDebug] = useState(false)
  const [lastGazePoint, setLastGazePoint] = useState({ x: 0, y: 0 })
  const [webgazerStatus, setWebgazerStatus] = useState("Non inizializzato")
  const debugDotRef = useRef<HTMLDivElement>(null)
  const statusIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Aggiorna l'ultimo punto di sguardo quando i dati cambiano
    if (gazeData.length > 0) {
      const lastPoint = gazeData[gazeData.length - 1]
      setLastGazePoint({ x: lastPoint.x, y: lastPoint.y })

      // Aggiorna la posizione del punto di debug
      if (debugDotRef.current && showDebug) {
        // Calcolo la posizione relativa alla viewport
        const viewportY = lastPoint.y - window.scrollY
        debugDotRef.current.style.left = `${lastPoint.x}px`
        debugDotRef.current.style.top = `${viewportY}px` // Sottraggo lo scroll per posizionare correttamente nella viewport
        debugDotRef.current.style.display = "block"
      }
    }
  }, [gazeData, showDebug])

  useEffect(() => {
    // Controlla lo stato di WebGazer periodicamente
    if (showDebug) {
      checkWebgazerStatus()
      statusIntervalRef.current = setInterval(checkWebgazerStatus, 2000)
    } else {
      if (statusIntervalRef.current) {
        clearInterval(statusIntervalRef.current)
      }
    }

    return () => {
      if (statusIntervalRef.current) {
        clearInterval(statusIntervalRef.current)
      }
    }
  }, [showDebug])

  const checkWebgazerStatus = () => {
    if (typeof window === "undefined") return

    const webgazer = (window as any).webgazer
    if (!webgazer) {
      setWebgazerStatus("Non disponibile")
      return
    }

    try {
      if (webgazer.isReady()) {
        setWebgazerStatus("Pronto" + (isTracking ? " (Tracking attivo)" : ""))
      } else {
        setWebgazerStatus("Inizializzato ma non pronto")
      }
    } catch (err) {
      setWebgazerStatus(`Errore: ${err}`)
    }
  }

  const toggleDebugDot = () => {
    if (debugDotRef.current) {
      if (showDebug) {
        debugDotRef.current.style.display = "none"
      } else if (gazeData.length > 0) {
        const lastPoint = gazeData[gazeData.length - 1]
        debugDotRef.current.style.left = `${lastPoint.x}px`
        debugDotRef.current.style.top = `${lastPoint.y}px`
        debugDotRef.current.style.display = "block"
      }
    }
    setShowDebug(!showDebug)
  }

  return (
    <>
      <Card className="mb-4">
        <Card.Header>
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Debug Eye Tracking</h5>
            <Form.Check
              type="switch"
              id="debug-switch"
              label="Mostra Debug"
              checked={showDebug}
              onChange={toggleDebugDot}
            />
          </div>
        </Card.Header>
        {showDebug && (
          <Card.Body>
            <div className="mb-3">
              <strong>Stato WebGazer:</strong>{" "}
              <span className={webgazerStatus.includes("Pronto") ? "text-success" : "text-danger"}>
                {webgazerStatus}
              </span>
            </div>

            <div className="mb-3">
              <strong>Ultimo punto rilevato:</strong> X: {Math.round(lastGazePoint.x)}, Y: {Math.round(lastGazePoint.y)}
            </div>

            <div className="mb-3">
              <strong>Punti totali registrati:</strong> {gazeData.length}
            </div>

            <div className="d-flex gap-2">
              <Button variant={isTracking ? "danger" : "success"} onClick={isTracking ? stopTracking : startTracking}>
                {isTracking ? "Ferma Tracking" : "Avvia Tracking"}
              </Button>

              <Button
                variant="outline-secondary"
                onClick={() => {
                  if (typeof window !== "undefined" && (window as any).webgazer) {
                    const webgazer = (window as any).webgazer
                    webgazer.showPredictionPoints(!showDebug)
                  }
                }}
              >
                {showDebug ? "Nascondi" : "Mostra"} Punto di Previsione WebGazer
              </Button>
            </div>
          </Card.Body>
        )}
      </Card>

      {/* Punto di debug per visualizzare l'ultimo punto di sguardo */}
      <div
        ref={debugDotRef}
        style={{
          position: "fixed",
          width: "20px",
          height: "20px",
          borderRadius: "50%",
          backgroundColor: "rgba(0, 255, 0, 0.7)",
          border: "2px solid white",
          pointerEvents: "none",
          zIndex: 9999,
          display: "none",
          transform: "translate(-50%, -50%)",
          boxShadow: "0 0 10px rgba(0,0,0,0.5)",
        }}
      />
    </>
  )
}

