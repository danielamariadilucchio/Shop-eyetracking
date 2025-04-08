"use client"

import { useEffect, useState } from "react"
import { Container, Card, Alert } from "react-bootstrap"
import Link from "next/link"
import CalibrationComponent from "@/components/calibration-component"
import EyeTrackingDebug from "@/components/eye-tracking-debug"
import "bootstrap/dist/css/bootstrap.min.css"

export default function CalibrationPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <Container className="py-5">
      <Card className="shadow-sm mb-4">
        <Card.Header className="bg-primary text-white">
          <h2 className="mb-0">Calibrazione Eye Tracking</h2>
        </Card.Header>
        <Card.Body>
          <p className="lead mb-4">
            Prima di utilizzare la funzionalità di eye tracking, è necessario calibrare il sistema per garantire un
            tracciamento accurato dello sguardo.
          </p>

          <CalibrationComponent />

          <hr className="my-4" />

          <h4>Istruzioni</h4>
          <ol>
            <li>Assicurati di essere in un ambiente ben illuminato</li>
            <li>Posiziona il viso in modo che sia chiaramente visibile dalla webcam</li>
            <li>Segui i punti di calibrazione con lo sguardo e fai clic su ciascuno di essi</li>
            <li>Completa tutti i punti di calibrazione per ottenere risultati ottimali</li>
            <li>Una volta completata la calibrazione, potrai utilizzare l'eye tracking nel negozio</li>
          </ol>

          <Alert variant="info" className="mt-4">
            <h5>Comandi da tastiera</h5>
            <p className="mb-2">Durante l'utilizzo dell'eye tracking:</p>
            <ul className="mb-0">
              <li>
                <strong>Barra spaziatrice</strong> - Ferma il tracking e salva i dati in formato CSV
              </li>
              <li>
                <strong>Enter</strong> - Esporta l'immagine della heatmap corrente come PNG
              </li>
            </ul>
          </Alert>

          <div className="d-flex gap-3 mt-4">
            <Link href="/" className="btn btn-outline-secondary">
              Torna alla Home
            </Link>
            <Link href="/shop" className="btn btn-primary">
              Vai al Negozio
            </Link>
          </div>
        </Card.Body>
      </Card>

      <EyeTrackingDebug />
    </Container>
  )
}

