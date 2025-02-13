"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

const marketDominanceData = [
  { name: "Bitcoin", value: 48.2 },
  { name: "Ethereum", value: 18.5 },
  { name: "Others", value: 33.3 },
]

const COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))", "hsl(var(--muted))"]

export default function AnalyticsPage() {
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Add refresh logic here
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header onSearch={() => {}} onRefresh={handleRefresh} isRefreshing={isRefreshing} />
        <main className="flex-1 overflow-y-auto p-4">
          <h1 className="text-3xl font-bold mb-6">Analytics</h1>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Market Dominance</CardTitle>
                <CardDescription>Distribution of market capitalization</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={marketDominanceData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name} (${value}%)`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {marketDominanceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Trading Volume</CardTitle>
                <CardDescription>24h trading volume by exchange</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { name: "Binance", volume: 12.5 },
                        { name: "Coinbase", volume: 8.2 },
                        { name: "Kraken", volume: 4.7 },
                        { name: "FTX", volume: 3.9 },
                        { name: "Others", volume: 15.3 },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="name" className="text-xs text-muted-foreground" />
                      <YAxis className="text-xs text-muted-foreground" tickFormatter={(value) => `$${value}B`} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                        }}
                        formatter={(value: any) => [`$${value}B`, "Volume"]}
                      />
                      <Bar dataKey="volume" fill="hsl(var(--primary))" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}

