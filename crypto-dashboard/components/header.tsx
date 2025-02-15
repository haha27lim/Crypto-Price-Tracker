"use client"

import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { SearchBar } from "@/components/search-bar"

interface HeaderProps {
  onSearch?: (query: string) => void
  onRefresh: () => Promise<void>
  isRefreshing: boolean
  redirectOnSelect?: boolean
}

export function Header({ onSearch, onRefresh, isRefreshing, redirectOnSelect = true }: HeaderProps) {
  return (
    <header className="border-b bg-background">
      <div className="flex items-center justify-between px-6 py-4">
        <SearchBar onSearch={onSearch} redirectOnSelect={redirectOnSelect} />
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

