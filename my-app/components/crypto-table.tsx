"use client"

import { useEffect, useState, useImperativeHandle, forwardRef, useCallback } from "react"
import Image from "next/image"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { fetchCryptoAssets, type CryptoAsset } from "@/services/api"
import Link from "next/link"

type FilterType = "all" | "gainers" | "losers"

interface CryptoTableProps {
  searchQuery: string
}

export const CryptoTable = forwardRef<{ fetchData: () => Promise<void> }, CryptoTableProps>(function CryptoTable(
  { searchQuery },
  ref,
) {
  const [cryptos, setCryptos] = useState<CryptoAsset[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterType>("all")

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchCryptoAssets()
      if (data.length === 0) {
        setError("No data available. Please try again later.")
      }
      setCryptos(data)
    } catch (error) {
      setError("Failed to fetch cryptocurrency data. Please try again later.")
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useImperativeHandle(ref, () => ({
    fetchData,
  }))

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [fetchData])

  const filteredCryptos = cryptos
    .filter(
      (crypto) =>
        crypto.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        crypto.symbol.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    .sort((a, b) => {
      if (filter === "gainers") {
        return Number.parseFloat(b.changePercent24Hr) - Number.parseFloat(a.changePercent24Hr)
      }
      if (filter === "losers") {
        return Number.parseFloat(a.changePercent24Hr) - Number.parseFloat(b.changePercent24Hr)
      }
      return Number.parseInt(a.rank) - Number.parseInt(b.rank)
    })

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button variant={filter === "all" ? "default" : "outline"} onClick={() => setFilter("all")}>
          All Coins
        </Button>
        <Button variant={filter === "gainers" ? "default" : "outline"} onClick={() => setFilter("gainers")}>
          Top Gainers
        </Button>
        <Button variant={filter === "losers" ? "default" : "outline"} onClick={() => setFilter("losers")}>
          Top Losers
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          {/* Remove whitespace */}
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Rank</TableHead>
              <TableHead className="w-[300px]">Name</TableHead>
              <TableHead className="w-[150px]">Price (USD)</TableHead>
              <TableHead className="w-[120px]">24h Change</TableHead>
              <TableHead className="w-[150px] text-right">Market Cap</TableHead>
              <TableHead className="w-[150px] text-right">Volume (24h)</TableHead>
            </TableRow>
          </TableHeader>
          {/* Remove whitespace */}
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="ml-2">Loading...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  {error}
                </TableCell>
              </TableRow>
            ) : filteredCryptos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No cryptocurrencies found
                </TableCell>
              </TableRow>
            ) : (
              filteredCryptos.map((crypto) => (
                <TableRow key={crypto.id}>
                  <TableCell>{crypto.rank}</TableCell>
                  <TableCell className="font-medium">
                    <Link href={`/asset/${crypto.id}`} className="flex items-center hover:text-primary">
                      <div className="w-6 h-6 mr-2 relative">
                        <Image
                          src={crypto.icon || "/placeholder.svg"}
                          alt={`${crypto.name} icon`}
                          fill
                          className="object-contain"
                        />
                      </div>
                      {crypto.name} <span className="text-muted-foreground ml-1">({crypto.symbol})</span>
                    </Link>
                  </TableCell>
                  <TableCell>
                    $
                    {Number.parseFloat(crypto.priceUsd).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </TableCell>
                  <TableCell>
                    <Badge variant={Number.parseFloat(crypto.changePercent24Hr) >= 0 ? "default" : "destructive"}>
                      {Number.parseFloat(crypto.changePercent24Hr) >= 0 ? "+" : ""}
                      {Number.parseFloat(crypto.changePercent24Hr).toFixed(2)}%
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    $
                    {Number.parseFloat(crypto.marketCapUsd / 1e9).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                    B
                  </TableCell>
                  <TableCell className="text-right">
                    $
                    {Number.parseFloat(crypto.volumeUsd24Hr / 1e6).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                    M
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
})

CryptoTable.displayName = "CryptoTable"

