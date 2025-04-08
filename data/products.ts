import type { ProductType } from "@/types/product"

export const products: ProductType[] = [
  {
    id: 1,
    name: "Cuffie Wireless",
    price: 99.99,
    description:
      "Cuffie wireless premium con cancellazione del rumore e 30 ore di autonomia. Perfette per gli amanti della musica e i viaggiatori.",
    image: "/placeholder.svg?height=300&width=300&text=Cuffie",
    category: "electronics",
  },
  {
    id: 2,
    name: "Smartphone",
    price: 699.99,
    description:
      "Ultimo smartphone con fotocamera ad alta risoluzione, processore veloce e batteria che dura tutto il giorno. Resta connesso con la migliore tecnologia.",
    image: "/placeholder.svg?height=300&width=300&text=Smartphone",
    category: "electronics",
  },
  {
    id: 3,
    name: "Laptop",
    price: 1299.99,
    description:
      "Potente laptop per lavoro e gaming con scheda grafica dedicata e processore ad alte prestazioni. Completa il tuo lavoro più velocemente.",
    image: "/placeholder.svg?height=300&width=300&text=Laptop",
    category: "electronics",
  },
  {
    id: 4,
    name: "Smartwatch",
    price: 249.99,
    description:
      "Tieni traccia della tua forma fisica e resta connesso con questo elegante smartwatch. Caratteristiche: monitoraggio della frequenza cardiaca, GPS e resistenza all'acqua.",
    image: "/placeholder.svg?height=300&width=300&text=Smartwatch",
    category: "electronics",
  },
  {
    id: 5,
    name: "Auricolari Wireless",
    price: 129.99,
    description:
      "Auricolari compatti con qualità del suono straordinaria e cancellazione attiva del rumore. Leggeri e comodi per l'uso quotidiano.",
    image: "/placeholder.svg?height=300&width=300&text=Auricolari",
    category: "electronics",
  },
  {
    id: 6,
    name: "Tablet",
    price: 499.99,
    description:
      "Tablet portatile per intrattenimento e produttività con display ad alta risoluzione e lunga durata della batteria. Ottimo per leggere e guardare video.",
    image: "/placeholder.svg?height=300&width=300&text=Tablet",
    category: "electronics",
  },
  {
    id: 7,
    name: "T-Shirt Uomo",
    price: 24.99,
    description: "Comoda t-shirt in cotone per uso quotidiano. Disponibile in più colori e taglie.",
    image: "/placeholder.svg?height=300&width=300&text=T-Shirt",
    category: "clothing",
  },
  {
    id: 8,
    name: "Jeans Donna",
    price: 59.99,
    description:
      "Jeans in denim di alta qualità con vestibilità perfetta e comfort. Eleganti e durevoli per l'uso quotidiano.",
    image: "/placeholder.svg?height=300&width=300&text=Jeans",
    category: "clothing",
  },
  {
    id: 9,
    name: "Scarpe da Corsa",
    price: 89.99,
    description:
      "Scarpe da corsa leggere e comode con eccellente supporto e ammortizzazione. Perfette per corridori di tutti i livelli.",
    image: "/placeholder.svg?height=300&width=300&text=Scarpe",
    category: "clothing",
  },
  {
    id: 10,
    name: "Giacca Invernale",
    price: 149.99,
    description:
      "Giacca invernale calda e impermeabile per tenerti comodo con il freddo. Design elegante con tasche multiple.",
    image: "/placeholder.svg?height=300&width=300&text=Giacca",
    category: "clothing",
  },
  {
    id: 11,
    name: "Macchina per Caffè",
    price: 79.99,
    description:
      "Macchina per caffè programmabile con caraffa termica per mantenere il caffè caldo per ore. Perfetta per gli amanti del caffè.",
    image: "/placeholder.svg?height=300&width=300&text=Caffè",
    category: "home",
  },
  {
    id: 12,
    name: "Frullatore",
    price: 69.99,
    description:
      "Potente frullatore per frullati, zuppe e altro. Impostazioni di velocità multiple e facile da pulire.",
    image: "/placeholder.svg?height=300&width=300&text=Frullatore",
    category: "home",
  },
  {
    id: 13,
    name: "Set Lenzuola",
    price: 89.99,
    description: "Set lenzuola morbido e confortevole con copripiumino e federe. Disponibile in più colori e fantasie.",
    image: "/placeholder.svg?height=300&width=300&text=Lenzuola",
    category: "home",
  },
  {
    id: 14,
    name: "Altoparlante Smart",
    price: 129.99,
    description:
      "Altoparlante smart con controllo vocale e qualità audio premium. Controlla la tua casa intelligente e riproduci musica con facilità.",
    image: "/placeholder.svg?height=300&width=300&text=Speaker",
    category: "electronics",
  },
  {
    id: 15,
    name: "Lampada da Scrivania",
    price: 39.99,
    description:
      "Lampada da scrivania regolabile con più livelli di luminosità e temperature di colore. Perfetta per lavoro o lettura.",
    image: "/placeholder.svg?height=300&width=300&text=Lampada",
    category: "home",
  },
]

export const featuredProducts = products.slice(0, 6)

