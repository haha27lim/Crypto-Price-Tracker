"use client"

import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, RefreshCw } from "lucide-react"

interface HeaderProps {
  onSearch: (query: string) => void
  onRefresh: () => Promise<void>
  isRefreshing: boolean
}

export function Header({ onSearch, onRefresh, isRefreshing }: HeaderProps) {
  return (
    <header className="border-b bg-background">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center flex-1">
          <Search className="w-5 h-5 text-muted-foreground mr-2" />
          <Input
            type="search"
            placeholder="Search cryptocurrencies..."
            className="w-[300px] max-w-full"
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" onClick={onRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            <span className="sr-only">Refresh</span>
          </Button>
          <ModeToggle />
        </div>
      </div>
    </header>
  )
}

