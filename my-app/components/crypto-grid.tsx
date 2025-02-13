"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Crypto {
  id: string
  name: string
  symbol: string
  price: number
  change24h: number
}

export function CryptoGrid() {
  const [cryptos, setCryptos] = useState<Crypto[]>([])

  useEffect(() => {
    // Simulating API call with placeholder data
    const placeholderData: Crypto[] = [
      { id: "bitcoin", name: "Bitcoin", symbol: "BTC", price: 50000, change24h: 2.5 },
      { id: "ethereum", name: "Ethereum", symbol: "ETH", price: 3000, change24h: -1.2 },
      { id: "cardano", name: "Cardano", symbol: "ADA", price: 1.5, change24h: 5.7 },
      { id: "dogecoin", name: "Dogecoin", symbol: "DOGE", price: 0.3, change24h: 10.1 },
      { id: "polkadot", name: "Polkadot", symbol: "DOT", price: 30, change24h: -0.8 },
      { id: "ripple", name: "Ripple", symbol: "XRP", price: 1.1, change24h: 3.2 },
    ]
    setCryptos(placeholderData)
  }, [])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {cryptos.map((crypto) => (
        <Card key={crypto.id}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {crypto.name} ({crypto.symbol})
            </CardTitle>
            <Badge variant={crypto.change24h >= 0 ? "default" : "destructive"}>
              {crypto.change24h >= 0 ? "+" : ""}
              {crypto.change24h.toFixed(2)}%
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${crypto.price.toLocaleString()}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

