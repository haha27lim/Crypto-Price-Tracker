"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Star } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { fetchAssetDetails, fetchAssetHistory, type CryptoAsset, type CryptoHistory } from "@/services/api"
import { Skeleton } from "@/components/ui/skeleton"
import { Header } from "@/components/header"
import { useSettings } from "@/contexts/settings-context"
import { formatPrice, formatLargeNumber } from "@/utils/currency"

export default function AssetPage() {
  const { id } = useParams()
  const router = useRouter()
  const [asset, setAsset] = useState<CryptoAsset | null>(null)
  const [history, setHistory] = useState<CryptoHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { currency, showGridLines, showTooltips, timeRange } = useSettings()

  const fetchData = useCallback(async () => {
    if (typeof id !== "string") return
    setLoading(true)
    try {
      const [assetData, historyData] = await Promise.all([fetchAssetDetails(id), fetchAssetHistory(id, timeRange)])
      setAsset(assetData)
      setHistory(historyData)
    } finally {
      setLoading(false)
    }
  }, [id, timeRange])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleRefresh = async () => {
    if (!isRefreshing) {
      setIsRefreshing(true)
      await fetchData()
      setIsRefreshing(false)
    }
  }

  const handleSearch = (query: string) => {
    // This function is now empty to prevent navigation
  }

  // Calculate the maximum price properly
  const maxPrice = Math.max(...history.map((item) => Number(Number.parseFloat(item.priceUsd))))
  // Add 10% padding to the max price for better visualization
  const yAxisMax = maxPrice * 1.1

  const formatYAxis = (value: number) => {
    if (value === 0) return "0"
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`
    return formatPrice(value, currency)
  }

  const formatXAxis = (value: string) => {
    if (timeRange === "24h") {
      return value // Already formatted as time in fetchAssetHistory
    }
    const date = new Date(value)
    return `${date.getMonth() + 1}/${date.getDate()}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header
          onSearch={handleSearch}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
          redirectOnSelect={false}
        />
        <div className="container mx-auto p-6 max-w-7xl space-y-8">
          <div className="flex items-center justify-between">
            <div className="space-y-4">
              <Skeleton className="h-12 w-48" />
              <Skeleton className="h-6 w-24" />
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-[200px]" />
            <Skeleton className="h-[200px]" />
          </div>
          <Skeleton className="h-[400px]" />
        </div>
      </div>
    )
  }

  if (!asset) {
    return (
      <div className="min-h-screen bg-background">
        <Header
          onSearch={handleSearch}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
          redirectOnSelect={false}
        />
        <div className="container mx-auto p-6 max-w-7xl">
          <h1 className="text-2xl font-bold">Asset not found</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onSearch={handleSearch} onRefresh={handleRefresh} isRefreshing={isRefreshing} redirectOnSelect={false} />
      <div className="container mx-auto p-6 max-w-7xl space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <Link href="/">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 relative">
                  <Image src={asset.icon || "/placeholder.svg"} alt={asset.name} fill className="object-contain" />
                </div>
                <h1 className="text-3xl font-bold">
                  {asset.name} ({asset.symbol})
                </h1>
              </div>
            </div>
            <Badge variant="secondary">Rank #{asset.rank}</Badge>
          </div>
          <Button variant="outline" size="icon">
            <Star className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Price</div>
                <div className="text-2xl font-bold">{formatPrice(Number.parseFloat(asset.priceUsd), currency)}</div>
                <Badge variant={Number.parseFloat(asset.changePercent24Hr) >= 0 ? "default" : "destructive"}>
                  {Number.parseFloat(asset.changePercent24Hr) >= 0 ? "+" : ""}
                  {Number.parseFloat(asset.changePercent24Hr).toFixed(2)}%
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Market Cap</div>
                <div className="text-2xl font-bold">
                  {formatLargeNumber(Number.parseFloat(asset.marketCapUsd), currency)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Volume (24h): {formatLargeNumber(Number.parseFloat(asset.volumeUsd24Hr), currency)}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-4">Price History ({timeRange})</h2>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  {showGridLines && <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />}
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatXAxis}
                    interval="preserveStartEnd"
                    minTickGap={50}
                    className="text-xs text-muted-foreground"
                  />
                  <YAxis
                    tickFormatter={formatYAxis}
                    domain={[0, yAxisMax]}
                    allowDataOverflow={false}
                    className="text-xs text-muted-foreground"
                  />
                  {showTooltips && (
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                      }}
                      labelStyle={{
                        color: "hsl(var(--muted-foreground))",
                      }}
                      formatter={(value: any) => [formatPrice(Number.parseFloat(value), currency), "Price"]}
                    />
                  )}
                  <Line
                    type="monotone"
                    dataKey="priceUsd"
                    stroke="hsl(var(--primary))"
                    dot={false}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

