"use client"

import { useState, useEffect, useRef } from "react"
import { Button, Modal, Container, Row, Col, Alert } from "react-bootstrap"

interface CalibrationPoint {
  x: number
  y: number
}

export default function CalibrationComponent() {
  const [showModal, setShowModal] = useState(false)
  const [currentPointIndex, setCurrentPointIndex] = useState(0)
  const [calibrationComplete, setCalibrationComplete] = useState(false)
  const [calibrationPoints, setCalibrationPoints] = useState<CalibrationPoint[]>([])
  const [webgazerLoaded, setWebgazerLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const pointRef = useRef<HTMLDivElement>(null)
  const [isCalibrated, setIsCalibrated] = useState(false)

  // Genera 10 punti di calibrazione in posizioni strategiche
  useEffect(() => {
    // Genera punti in posizioni distribuite sullo schermo
    const points: CalibrationPoint[] = [
      { x: 20, y: 20 }, // In alto a sinistra
      { x: 50, y: 20 }, // In alto al centro
      { x: 80, y: 20 }, // In alto a destra
      { x: 20, y: 50 }, // Al centro a sinistra
      { x: 50, y: 50 }, // Al centro
      { x: 80, y: 50 }, // Al centro a destra
      { x: 20, y: 80 }, // In basso a sinistra
      { x: 50, y: 80 }, // In basso al centro
      { x: 80, y: 80 }, // In basso a destra
      { x: 35, y: 65 }, // Punto aggiuntivo
    ]
    setCalibrationPoints(points)

    // Controlla se la calibrazione è già stata completata
    const calibrated = localStorage.getItem("webgazer-calibrated") === "true"
    setIsCalibrated(calibrated)

    // Verifica se WebGazer è disponibile
    const checkWebgazer = () => {
      if (typeof window !== "undefined" && (window as any).webgazer) {
        setWebgazerLoaded(true)
        return true
      }
      return false
    }

    // Controlla immediatamente
    if (checkWebgazer()) return

    // Se non è caricato, carica lo script WebGazer
    if (typeof window !== "undefined" && !document.getElementById("webgazer-script")) {
      const script = document.createElement("script")
      script.id = "webgazer-script"
      script.src = "https://webgazer.cs.brown.edu/webgazer.js"
      script.async = true
      script.onload = () => {
        console.log("WebGazer caricato per la calibrazione")
        setWebgazerLoaded(true)
      }
      script.onerror = () => {
        setError("Impossibile caricare WebGazer. Controlla la connessione internet.")
      }
      document.body.appendChild(script)
    }

    // Controlla di nuovo dopo un ritardo
    const intervalId = setInterval(() => {
      if (checkWebgazer()) {
        clearInterval(intervalId)
      }
    }, 1000)

    return () => clearInterval(intervalId)
  }, [])

  const startCalibration = async () => {
    if (!webgazerLoaded) {
      setError("WebGazer non è ancora pronto. Attendi il caricamento.")
      return
    }

    try {
      const webgazer = (window as any).webgazer

      // Inizializza WebGazer
      await webgazer.begin()

      // Configura l'interfaccia utente di WebGazer
      webgazer.showVideoPreview(true)
      webgazer.showFaceOverlay(true)
      webgazer.showFaceFeedbackBox(true)
      webgazer.showPredictionPoints(true)

      // Mostra il modale di calibrazione
      setShowModal(true)
      setCurrentPointIndex(0)
      setCalibrationComplete(false)
      setError(null)
    } catch (err) {
      console.error("Errore nell'inizializzazione di WebGazer:", err)
      setError("Impossibile inizializzare WebGazer. Assicurati che l'accesso alla fotocamera sia concesso.")
    }
  }

  const handlePointClick = () => {
    // Registra il clic per la calibrazione
    const nextIndex = currentPointIndex + 1

    if (nextIndex < calibrationPoints.length) {
      // Passa al punto successivo
      setCurrentPointIndex(nextIndex)
    } else {
      // Calibrazione completata
      completeCalibration()
    }
  }

  const completeCalibration = () => {
    try {
      const webgazer = (window as any).webgazer

      // Salva la calibrazione
      if (typeof webgazer.saveDataAcrossSessions === "function") {
        webgazer.saveDataAcrossSessions(true)
      }

      // Nascondi l'interfaccia utente di WebGazer
      webgazer.showVideoPreview(false)
      webgazer.showFaceOverlay(false)
      webgazer.showFaceFeedbackBox(false)
      webgazer.showPredictionPoints(false)

      // Imposta lo stato di calibrazione
      localStorage.setItem("webgazer-calibrated", "true")
      setCalibrationComplete(true)
      setIsCalibrated(true)

      // Chiudi il modale dopo un breve ritardo
      setTimeout(() => {
        setShowModal(false)
      }, 2000)
    } catch (err) {
      console.error("Errore nel completamento della calibrazione:", err)
      setError("Si è verificato un errore durante il salvataggio della calibrazione.")
    }
  }

  const resetCalibration = () => {
    try {
      const webgazer = (window as any).webgazer

      // Reimposta WebGazer
      if (webgazer && typeof webgazer.clearData === "function") {
        webgazer.clearData()
      }

      // Rimuovi il flag di calibrazione
      localStorage.removeItem("webgazer-calibrated")
      setIsCalibrated(false)

      // Reimposta lo stato
      setCurrentPointIndex(0)
      setCalibrationComplete(false)
    } catch (err) {
      console.error("Errore nel reset della calibrazione:", err)
      setError("Si è verificato un errore durante il reset della calibrazione.")
    }
  }

  return (
    <>
      <div className="mb-4">
        <h4>Calibrazione Eye Tracking</h4>
        {isCalibrated ? (
          <div>
            <Alert variant="success">
              La calibrazione è già stata completata. Puoi iniziare a utilizzare l'eye tracking.
            </Alert>
            <Button variant="outline-primary" onClick={startCalibration}>
              Ricalibrare
            </Button>{" "}
            <Button variant="outline-danger" onClick={resetCalibration}>
              Resetta Calibrazione
            </Button>
          </div>
        ) : (
          <div>
            <Alert variant="warning">Per utilizzare l'eye tracking, è necessario completare la calibrazione.</Alert>
            <Button variant="primary" onClick={startCalibration} disabled={!webgazerLoaded}>
              {webgazerLoaded ? "Inizia Calibrazione" : "Caricamento WebGazer..."}
            </Button>
          </div>
        )}

        {error && (
          <Alert variant="danger" className="mt-2">
            {error}
          </Alert>
        )}
      </div>

      <Modal
        show={showModal}
        fullscreen={true}
        onHide={() => {}} // Impedisci la chiusura durante la calibrazione
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header>
          <Modal.Title>Calibrazione Eye Tracking</Modal.Title>
        </Modal.Header>
        <Modal.Body className="position-relative">
          {calibrationComplete ? (
            <Container className="text-center">
              <h2>Calibrazione Completata!</h2>
              <p>Ora puoi utilizzare l'eye tracking in modo accurato.</p>
              <Button variant="primary" onClick={() => setShowModal(false)}>
                Inizia a Utilizzare l'Eye Tracking
              </Button>
            </Container>
          ) : (
            <Container fluid className="h-100 position-relative">
              <Row className="mb-4">
                <Col className="text-center">
                  <h3>
                    Punto {currentPointIndex + 1} di {calibrationPoints.length}
                  </h3>
                  <p>Guarda il punto e fai clic su di esso</p>
                </Col>
              </Row>

              {/* Mostra solo il punto corrente */}
              {calibrationPoints.length > 0 && (
                <div
                  ref={pointRef}
                  className="position-absolute bg-danger rounded-circle"
                  style={{
                    left: `${calibrationPoints[currentPointIndex].x}%`,
                    top: `${calibrationPoints[currentPointIndex].y}%`,
                    width: "30px",
                    height: "30px",
                    transform: "translate(-50%, -50%)",
                    cursor: "pointer",
                    animation: "pulse 1s infinite",
                  }}
                  onClick={handlePointClick}
                />
              )}
            </Container>
          )}
        </Modal.Body>
      </Modal>

      <style jsx global>{`
        @keyframes pulse {
          0% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.2);
            opacity: 0.7;
          }
          100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </>
  )
}

