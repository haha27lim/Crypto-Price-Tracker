"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { fetchCryptoAssets, type CryptoAsset } from "@/services/api"
import Image from "next/image"
import { useRouter } from "next/navigation"

interface SearchBarProps {
  onSearch?: (query: string) => void
  redirectOnSelect?: boolean
}

export function SearchBar({ onSearch, redirectOnSelect = true }: SearchBarProps) {
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<CryptoAsset[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length > 0) {
        setIsLoading(true)
        try {
          const assets = await fetchCryptoAssets()
          const filteredAssets = assets
            .filter(
              (asset) =>
                asset.name.toLowerCase().includes(query.toLowerCase()) ||
                asset.symbol.toLowerCase().includes(query.toLowerCase()),
            )
            .slice(0, 5) // Limit to 5 suggestions
          setSuggestions(filteredAssets)
        } catch (error) {
          console.error("Error fetching suggestions:", error)
        } finally {
          setIsLoading(false)
        }
      } else {
        setSuggestions([])
      }
    }

    fetchSuggestions()
  }, [query])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    if (onSearch) {
      onSearch(value)
    }
    setShowSuggestions(true)
  }

  const handleSuggestionClick = (asset: CryptoAsset) => {
    if (redirectOnSelect) {
      router.push(`/asset/${asset.id}`)
    } else {
      setQuery(asset.name)
      setShowSuggestions(false)
      if (onSearch) {
        onSearch(asset.name)
      }
    }
  }

  return (
    <div ref={searchRef} className="relative">
      <div className="flex items-center">
        <Search className="w-5 h-5 text-muted-foreground mr-2" />
        <Input
          type="search"
          placeholder="Search cryptocurrencies..."
          className="w-[300px] max-w-full"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setShowSuggestions(true)}
        />
      </div>
      {showSuggestions && (suggestions.length > 0 || isLoading) && (
        <div className="absolute z-10 w-full mt-1 bg-background border border-input rounded-md shadow-lg">
          {isLoading ? (
            <div className="p-2 text-center">Loading...</div>
          ) : (
            <ul>
              {suggestions.map((asset) => (
                <li key={asset.id} className="border-b last:border-b-0">
                  <button
                    className="w-full text-left flex items-center p-2 hover:bg-muted"
                    onClick={() => handleSuggestionClick(asset)}
                  >
                    <div className="w-6 h-6 mr-2 relative">
                      <Image
                        src={asset.icon || "/placeholder.svg"}
                        alt={`${asset.name} icon`}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <span>{asset.name}</span>
                    <span className="text-muted-foreground ml-1">({asset.symbol})</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

