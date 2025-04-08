"use client"

import type React from "react"

import { useState } from "react"
import { Button, Form, Offcanvas } from "react-bootstrap"
import { Settings } from "lucide-react"
import { useEyeTracking } from "@/context/eye-tracking-context"

export default function HeatmapControls() {
  const { showHeatmap, toggleHeatmap, clearGazeData } = useEyeTracking()
  const [showControls, setShowControls] = useState(false)
  const [opacity, setOpacity] = useState(0.7)
  const [radius, setRadius] = useState(40)
  const [blur, setBlur] = useState(15)

  // Aggiorna le variabili CSS per controllare l'aspetto della heatmap
  const updateHeatmapStyle = () => {
    document.documentElement.style.setProperty("--heatmap-opacity", opacity.toString())
    document.documentElement.style.setProperty("--heatmap-radius", `${radius}px`)
    document.documentElement.style.setProperty("--heatmap-blur", `${blur}px`)
  }

  const handleOpacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseFloat(e.target.value)
    setOpacity(value)
    document.documentElement.style.setProperty("--heatmap-opacity", value.toString())

    // Update heatmap instance if available
    if (typeof window !== "undefined" && (window as any).h337 && document.querySelector("canvas")) {
      try {
        const heatmapInstance = (window as any)._heatmapInstance
        if (heatmapInstance) {
          heatmapInstance.configure({ maxOpacity: value })
        }
      } catch (e) {
        console.warn("Could not update heatmap opacity:", e)
      }
    }
  }

  const handleRadiusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value)
    setRadius(value)
    document.documentElement.style.setProperty("--heatmap-radius", `${value}px`)

    // Update heatmap instance if available
    if (typeof window !== "undefined" && (window as any).h337 && document.querySelector("canvas")) {
      try {
        const heatmapInstance = (window as any)._heatmapInstance
        if (heatmapInstance) {
          heatmapInstance.configure({ radius: value })
        }
      } catch (e) {
        console.warn("Could not update heatmap radius:", e)
      }
    }
  }

  const handleBlurChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value)
    setBlur(value)
    document.documentElement.style.setProperty("--heatmap-blur", `${value}px`)

    // Update heatmap instance if available
    if (typeof window !== "undefined" && (window as any).h337 && document.querySelector("canvas")) {
      try {
        const heatmapInstance = (window as any)._heatmapInstance
        if (heatmapInstance) {
          heatmapInstance.configure({ blur: value / 40 }) // Scale down for heatmap.js
        }
      } catch (e) {
        console.warn("Could not update heatmap blur:", e)
      }
    }
  }

  return (
    <>
      <Button
        variant="outline-secondary"
        size="sm"
        className="position-fixed bottom-0 end-0 m-3"
        onClick={() => setShowControls(true)}
        title="Impostazioni Heatmap"
      >
        <Settings size={18} />
      </Button>

      <Offcanvas show={showControls} onHide={() => setShowControls(false)} placement="end">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Impostazioni Heatmap</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Check
                type="switch"
                id="heatmap-toggle"
                label="Mostra Heatmap"
                checked={showHeatmap}
                onChange={toggleHeatmap}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Opacità: {opacity.toFixed(2)}</Form.Label>
              <Form.Range min={0.1} max={1} step={0.05} value={opacity} onChange={handleOpacityChange} />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Raggio: {radius}px</Form.Label>
              <Form.Range min={10} max={100} step={5} value={radius} onChange={handleRadiusChange} />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Sfocatura: {blur}px</Form.Label>
              <Form.Range min={0} max={30} step={1} value={blur} onChange={handleBlurChange} />
            </Form.Group>

            <div className="d-grid gap-2">
              <Button variant="outline-danger" onClick={clearGazeData}>
                Cancella Dati Heatmap
              </Button>
            </div>

            <hr />

            <div className="mt-3">
              <h6>Legenda Colori</h6>
              <div className="d-flex align-items-center mb-2">
                <div style={{ width: "20px", height: "20px", backgroundColor: "blue", marginRight: "10px" }}></div>
                <span>Bassa intensità</span>
              </div>
              <div className="d-flex align-items-center mb-2">
                <div style={{ width: "20px", height: "20px", backgroundColor: "cyan", marginRight: "10px" }}></div>
                <span>Intensità medio-bassa</span>
              </div>
              <div className="d-flex align-items-center mb-2">
                <div style={{ width: "20px", height: "20px", backgroundColor: "lime", marginRight: "10px" }}></div>
                <span>Intensità media</span>
              </div>
              <div className="d-flex align-items-center mb-2">
                <div style={{ width: "20px", height: "20px", backgroundColor: "yellow", marginRight: "10px" }}></div>
                <span>Intensità medio-alta</span>
              </div>
              <div className="d-flex align-items-center">
                <div style={{ width: "20px", height: "20px", backgroundColor: "red", marginRight: "10px" }}></div>
                <span>Alta intensità</span>
              </div>
            </div>
          </Form>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  )
}

