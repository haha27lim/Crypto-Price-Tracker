"use client"

import { useState, useRef } from "react"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { CryptoTable } from "@/components/crypto-table"

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const tableRef = useRef<{ fetchData: () => Promise<void> } | null>(null)

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleRefresh = async () => {
    if (!isRefreshing && tableRef.current) {
      setIsRefreshing(true)
      try {
        await tableRef.current.fetchData()
      } finally {
        setIsRefreshing(false)
      }
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header onSearch={handleSearch} onRefresh={handleRefresh} isRefreshing={isRefreshing} />
        <main className="flex-1 overflow-y-auto p-4">
          <h1 className="text-3xl font-bold mb-6">Crypto Price Tracker</h1>
          <CryptoTable ref={tableRef} searchQuery={searchQuery} />
        </main>
      </div>
    </div>
  )
}

