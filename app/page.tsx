"use client"

import { useEffect, useState } from "react"
import { Container, Card, Row, Col, Button, Alert } from "react-bootstrap"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, BarChart2, ShoppingCart, Download, ArrowRight, Zap, Target, Layers } from "lucide-react"
import "bootstrap/dist/css/bootstrap.min.css"

export default function IntroPage() {
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="bg-light min-vh-100">
      {/* Hero Section */}
      <div
        className="bg-gradient-primary text-white py-5"
        style={{
          background: "linear-gradient(135deg, #4158D0 0%, #C850C0 46%, #FFCC70 100%)",
        }}
      >
        <Container className="py-5">
          <Row className="align-items-center">
            <Col lg={7} className="mb-5 mb-lg-0">
              <h1 className="display-3 fw-bold mb-3">EyeShop</h1>
              <h2 className="display-6 mb-4">Analisi visiva per e-commerce</h2>
              <p className="lead mb-4">
                Il mio progetto di tesi che analizza il comportamento visivo degli utenti durante la navigazione in un
                negozio online, generando heatmap e dati per ottimizzare l'esperienza utente.
              </p>
              <div className="d-flex gap-3 flex-wrap">
                <Link href="/calibration" passHref>
                  <Button size="lg" className="px-4 py-3" variant="light">
                    Inizia la Calibrazione <ArrowRight className="ms-2" size={20} />
                  </Button>
                </Link>
                <Link href="/shop" passHref>
                  <Button size="lg" className="px-4 py-3" variant="outline-light">
                    Vai al Negozio <ShoppingCart className="ms-2" size={20} />
                  </Button>
                </Link>
              </div>
            </Col>
            <Col lg={5} className="text-center">
              <div className="position-relative" style={{ height: "350px" }}>
                <div
                  className="position-absolute"
                  style={{
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "300px",
                    height: "300px",
                    background: "rgba(255,255,255,0.2)",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 0 40px rgba(255,255,255,0.4)",
                  }}
                >
                  <Eye size={120} strokeWidth={1.5} />
                </div>
                <div
                  className="position-absolute"
                  style={{
                    top: "20%",
                    right: "10%",
                    width: "80px",
                    height: "80px",
                    background: "rgba(255,255,255,0.15)",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Target size={40} strokeWidth={1.5} />
                </div>
                <div
                  className="position-absolute"
                  style={{
                    bottom: "15%",
                    left: "15%",
                    width: "100px",
                    height: "100px",
                    background: "rgba(255,255,255,0.15)",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <BarChart2 size={50} strokeWidth={1.5} />
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      <Container className="py-5">
        {/* Cos'è EyeShop */}
        <section className="mb-5">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold mb-3">Il Mio Progetto di Tesi</h2>
            <p className="lead text-muted mx-auto" style={{ maxWidth: "800px" }}>
              Ho sviluppato EyeShop come parte della mia tesi di laurea per studiare come gli utenti interagiscono
              visivamente con le interfacce di e-commerce, combinando tecnologie di eye tracking e analisi dei dati.
            </p>
          </div>

          <Row className="g-4">
            <Col md={4}>
              <Card className="border-0 shadow-sm h-100 hover-lift">
                <Card.Body className="p-4 text-center">
                  <div
                    className="rounded-circle mx-auto mb-4 d-flex align-items-center justify-content-center"
                    style={{
                      width: "80px",
                      height: "80px",
                      background: "rgba(65, 88, 208, 0.1)",
                    }}
                  >
                    <Eye size={40} color="#4158D0" />
                  </div>
                  <h3 className="h4 mb-3">Eye Tracking</h3>
                  <p className="text-muted">
                    Traccia con precisione dove gli utenti guardano mentre navigano nel negozio online, registrando ogni
                    movimento oculare.
                  </p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="border-0 shadow-sm h-100 hover-lift">
                <Card.Body className="p-4 text-center">
                  <div
                    className="rounded-circle mx-auto mb-4 d-flex align-items-center justify-content-center"
                    style={{
                      width: "80px",
                      height: "80px",
                      background: "rgba(200, 80, 192, 0.1)",
                    }}
                  >
                    <BarChart2 size={40} color="#C850C0" />
                  </div>
                  <h3 className="h4 mb-3">Heatmap</h3>
                  <p className="text-muted">
                    Visualizza i dati dello sguardo come heatmap colorate che mostrano le aree di maggiore interesse e
                    attenzione.
                  </p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="border-0 shadow-sm h-100 hover-lift">
                <Card.Body className="p-4 text-center">
                  <div
                    className="rounded-circle mx-auto mb-4 d-flex align-items-center justify-content-center"
                    style={{
                      width: "80px",
                      height: "80px",
                      background: "rgba(255, 204, 112, 0.1)",
                    }}
                  >
                    <Download size={40} color="#FFCC70" />
                  </div>
                  <h3 className="h4 mb-3">Esportazione Dati</h3>
                  <p className="text-muted">
                    Esporta automaticamente i dati grezzi in CSV e le heatmap come immagini PNG per analisi
                    approfondite.
                  </p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </section>

        {/* Come Iniziare - Passaggi */}
        <section className="mb-5 py-5">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold mb-3">Come Utilizzare il Progetto</h2>
            <p className="lead text-muted mx-auto" style={{ maxWidth: "700px" }}>
              Ho progettato un flusso di utilizzo semplice e intuitivo che permette di raccogliere e analizzare i dati
              di eye tracking in pochi passaggi.
            </p>
          </div>

          <div className="position-relative">
            <div
              className="position-absolute d-none d-lg-block"
              style={{
                top: "40px",
                left: "50%",
                right: "0",
                height: "4px",
                background: "#f0f0f0",
                zIndex: "-1",
                transform: "translateX(-50%)",
                width: "80%",
              }}
            ></div>

            <Row className="g-5">
              <Col lg={4}>
                <div className="d-flex flex-column align-items-center">
                  <div
                    className="rounded-circle mb-4 d-flex align-items-center justify-content-center text-white fs-3 fw-bold"
                    style={{
                      width: "80px",
                      height: "80px",
                      background: "#4158D0",
                      boxShadow: "0 10px 20px rgba(65, 88, 208, 0.3)",
                    }}
                  >
                    1
                  </div>
                  <h3 className="h4 mb-3 text-center">Calibrazione</h3>
                  <p className="text-center text-muted">
                    Completa la calibrazione del sistema di eye tracking per garantire un tracciamento preciso dello
                    sguardo.
                  </p>
                  <Link href="/calibration" passHref>
                    <Button variant="outline-primary" className="mt-2">
                      Vai alla Calibrazione
                    </Button>
                  </Link>
                </div>
              </Col>

              <Col lg={4}>
                <div className="d-flex flex-column align-items-center">
                  <div
                    className="rounded-circle mb-4 d-flex align-items-center justify-content-center text-white fs-3 fw-bold"
                    style={{
                      width: "80px",
                      height: "80px",
                      background: "#C850C0",
                      boxShadow: "0 10px 20px rgba(200, 80, 192, 0.3)",
                    }}
                  >
                    2
                  </div>
                  <h3 className="h4 mb-3 text-center">Esplora il Negozio</h3>
                  <p className="text-center text-muted">
                    Naviga nel negozio demo con l'eye tracking attivo per registrare i movimenti oculari e generare
                    dati.
                  </p>
                  <Link href="/shop" passHref>
                    <Button variant="outline-primary" className="mt-2">
                      Vai al Negozio
                    </Button>
                  </Link>
                </div>
              </Col>

              <Col lg={4}>
                <div className="d-flex flex-column align-items-center">
                  <div
                    className="rounded-circle mb-4 d-flex align-items-center justify-content-center text-white fs-3 fw-bold"
                    style={{
                      width: "80px",
                      height: "80px",
                      background: "#FFCC70",
                      boxShadow: "0 10px 20px rgba(255, 204, 112, 0.3)",
                    }}
                  >
                    3
                  </div>
                  <h3 className="h4 mb-3 text-center">Analizza i Dati</h3>
                  <p className="text-center text-muted">
                    Visualizza le heatmap in tempo reale ed esporta i dati per analisi approfondite del comportamento
                    visivo.
                  </p>
                  <Button variant="outline-primary" className="mt-2" disabled>
                    Visualizza Analisi
                  </Button>
                </div>
              </Col>
            </Row>
          </div>
        </section>

        {/* Comandi da Tastiera */}
        <section className="mb-5 py-4">
          <Card className="border-0 shadow">
            <Card.Header className="bg-primary text-white py-3">
              <h2 className="h3 mb-0">Comandi da Tastiera</h2>
            </Card.Header>
            <Card.Body className="p-4 p-lg-5">
              <Row className="g-4">
                <Col md={6}>
                  <div className="d-flex">
                    <div className="me-3">
                      <div
                        className="d-inline-flex align-items-center justify-content-center bg-light rounded p-3"
                        style={{ width: "60px", height: "60px" }}
                      >
                        <kbd className="fs-5 px-3 py-2 bg-dark text-white rounded">Space</kbd>
                      </div>
                    </div>
                    <div>
                      <h4 className="h5 mb-2">Ferma il Tracking</h4>
                      <p className="text-muted mb-0">
                        <strong>Quando usarlo:</strong> Durante la navigazione con eye tracking attivo.
                        <br />
                        <strong>Cosa fa:</strong> Ferma la registrazione dei dati e li esporta automaticamente in
                        formato CSV.
                      </p>
                    </div>
                  </div>
                </Col>

                <Col md={6}>
                  <div className="d-flex">
                    <div className="me-3">
                      <div
                        className="d-inline-flex align-items-center justify-content-center bg-light rounded p-3"
                        style={{ width: "60px", height: "60px" }}
                      >
                        <kbd className="fs-5 px-3 py-2 bg-dark text-white rounded">Enter</kbd>
                      </div>
                    </div>
                    <div>
                      <h4 className="h5 mb-2">Esporta Heatmap</h4>
                      <p className="text-muted mb-0">
                        <strong>Quando usarlo:</strong> Quando la heatmap è visibile e vuoi esportarla.
                        <br />
                        <strong>Cosa fa:</strong> Esporta manualmente l'immagine della heatmap come PNG.
                      </p>
                    </div>
                  </div>
                </Col>
              </Row>

              <Alert variant="info" className="mt-4 mb-0">
                <strong>Nota importante:</strong> Le heatmap vengono esportate automaticamente quando cambi pagina, ma
                puoi usare il tasto Enter se hai bisogno di un'esportazione immediata senza cambiare pagina.
              </Alert>
            </Card.Body>
          </Card>
        </section>

        {/* Curiosità */}
        <section className="mb-5 py-4">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold mb-3">Curiosità sul Progetto</h2>
          </div>

          <Row className="g-4">
            <Col lg={6}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body className="p-4">
                  <div className="d-flex align-items-center mb-3">
                    <div className="rounded-circle bg-primary bg-opacity-10 p-2 me-3">
                      <Eye size={24} className="text-primary" />
                    </div>
                    <h3 className="h5 mb-0">Come funziona l'eye tracking?</h3>
                  </div>
                  <p className="text-muted mb-0">
                    Nel mio progetto, ho implementato l'eye tracking utilizzando la libreria WebGazer.js che sfrutta
                    algoritmi di computer vision per analizzare le immagini della webcam. Il sistema traccia la
                    posizione degli occhi e calcola dove l'utente sta guardando sullo schermo con una precisione
                    sorprendente.
                  </p>
                </Card.Body>
              </Card>
            </Col>
            <Col lg={6}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body className="p-4">
                  <div className="d-flex align-items-center mb-3">
                    <div className="rounded-circle bg-primary bg-opacity-10 p-2 me-3">
                      <BarChart2 size={24} className="text-primary" />
                    </div>
                    <h3 className="h5 mb-0">Come vengono generate le heatmap?</h3>
                  </div>
                  <p className="text-muted mb-0">
                    Ho sviluppato un algoritmo che converte i punti di fissazione dello sguardo in una mappa di
                    intensità. Ogni punto contribuisce a un'area circolare con intensità che diminuisce con la distanza
                    dal centro. Questi dati vengono poi visualizzati con un gradiente di colori che va dal blu (bassa
                    intensità) al rosso (alta intensità).
                  </p>
                </Card.Body>
              </Card>
            </Col>
            <Col lg={6}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body className="p-4">
                  <div className="d-flex align-items-center mb-3">
                    <div className="rounded-circle bg-primary bg-opacity-10 p-2 me-3">
                      <Zap size={24} className="text-primary" />
                    </div>
                    <h3 className="h5 mb-0">Perché l'eye tracking è importante?</h3>
                  </div>
                  <p className="text-muted mb-0">
                    Nella mia ricerca, ho scoperto che l'eye tracking rivela informazioni cruciali sul comportamento
                    degli utenti che non possono essere ottenute con metodi tradizionali. Gli utenti spesso non sono
                    consapevoli di dove guardano, quindi questi dati offrono insight unici per ottimizzare il design
                    delle interfacce e migliorare l'esperienza utente.
                  </p>
                </Card.Body>
              </Card>
            </Col>
            <Col lg={6}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body className="p-4">
                  <div className="d-flex align-items-center mb-3">
                    <div className="rounded-circle bg-primary bg-opacity-10 p-2 me-3">
                      <Layers size={24} className="text-primary" />
                    </div>
                    <h3 className="h5 mb-0">Applicazioni future</h3>
                  </div>
                  <p className="text-muted mb-0">
                    Ho identificato diverse applicazioni future per questa tecnologia: ottimizzazione del posizionamento
                    dei prodotti, test A/B basati sullo sguardo, personalizzazione dell'interfaccia in tempo reale e
                    analisi dell'efficacia pubblicitaria. Questi sviluppi potrebbero rivoluzionare il modo in cui
                    progettiamo e valutiamo le interfacce digitali.
                  </p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </section>

        {/* CTA */}
        <section className="text-center py-5">
          <Card
            className="border-0 shadow"
            style={{
              background: "linear-gradient(135deg, #4158D0 0%, #C850C0 100%)",
              borderRadius: "16px",
            }}
          >
            <Card.Body className="p-5 text-white">
              <h2 className="display-5 fw-bold mb-4">Pronto a iniziare?</h2>
              <p className="lead mb-4 mx-auto" style={{ maxWidth: "700px" }}>
                Inizia subito a esplorare il mio progetto di tesi e scopri come l'eye tracking può rivoluzionare la
                comprensione del comportamento degli utenti.
              </p>
              <div className="d-flex gap-3 justify-content-center flex-wrap">
                <Link href="/calibration" passHref>
                  <Button size="lg" variant="light" className="px-4 py-3 text-primary">
                    Inizia la Calibrazione <ArrowRight className="ms-2" size={20} />
                  </Button>
                </Link>
                <Link href="/shop" passHref>
                  <Button size="lg" variant="outline-light" className="px-4 py-3">
                    Vai al Negozio <ShoppingCart className="ms-2" size={20} />
                  </Button>
                </Link>
              </div>
            </Card.Body>
          </Card>
        </section>
      </Container>

      <footer className="bg-dark text-white py-4 mt-5">
        <Container className="text-center">
          <h3 className="h5 mb-3">EyeShop</h3>
          <p className="text-muted mb-0">© {new Date().getFullYear()} Progetto di Tesi - Tutti i diritti riservati</p>
        </Container>
      </footer>

      {/* Stili aggiuntivi */}
      <style jsx global>{`
        .hover-lift {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .hover-lift:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important;
        }
      `}</style>
    </div>
  )
}

