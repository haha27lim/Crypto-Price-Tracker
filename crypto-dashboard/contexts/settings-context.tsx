"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"

interface SettingsContextType {
  currency: string
  setCurrency: (currency: string) => void
  autoRefresh: boolean
  setAutoRefresh: (autoRefresh: boolean) => void
  showGridLines: boolean
  setShowGridLines: (showGridLines: boolean) => void
  showTooltips: boolean
  setShowTooltips: (showTooltips: boolean) => void
  timeRange: string
  setTimeRange: (timeRange: string) => void
  priceAlerts: boolean
  setPriceAlerts: (priceAlerts: boolean) => void
  resetToDefaults: () => void
}

const defaultSettings = {
  currency: "usd",
  autoRefresh: true,
  showGridLines: true,
  showTooltips: true,
  timeRange: "30d",
  priceAlerts: false,
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState(defaultSettings.currency)
  const [autoRefresh, setAutoRefresh] = useState(defaultSettings.autoRefresh)
  const [showGridLines, setShowGridLines] = useState(defaultSettings.showGridLines)
  const [showTooltips, setShowTooltips] = useState(defaultSettings.showTooltips)
  const [timeRange, setTimeRange] = useState(defaultSettings.timeRange)
  const [priceAlerts, setPriceAlerts] = useState(defaultSettings.priceAlerts)

  useEffect(() => {
    const savedSettings = localStorage.getItem("cryptoSettings")
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings)
      setCurrency(parsed.currency || defaultSettings.currency)
      setAutoRefresh(parsed.autoRefresh ?? defaultSettings.autoRefresh)
      setShowGridLines(parsed.showGridLines ?? defaultSettings.showGridLines)
      setShowTooltips(parsed.showTooltips ?? defaultSettings.showTooltips)
      setTimeRange(parsed.timeRange || defaultSettings.timeRange)
      setPriceAlerts(parsed.priceAlerts ?? defaultSettings.priceAlerts)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(
      "cryptoSettings",
      JSON.stringify({
        currency,
        autoRefresh,
        showGridLines,
        showTooltips,
        timeRange,
        priceAlerts,
      }),
    )
  }, [currency, autoRefresh, showGridLines, showTooltips, timeRange, priceAlerts])

  const resetToDefaults = () => {
    setCurrency(defaultSettings.currency)
    setAutoRefresh(defaultSettings.autoRefresh)
    setShowGridLines(defaultSettings.showGridLines)
    setShowTooltips(defaultSettings.showTooltips)
    setTimeRange(defaultSettings.timeRange)
    setPriceAlerts(defaultSettings.priceAlerts)
  }

  return (
    <SettingsContext.Provider
      value={{
        currency,
        setCurrency,
        autoRefresh,
        setAutoRefresh,
        showGridLines,
        setShowGridLines,
        showTooltips,
        setShowTooltips,
        timeRange,
        setTimeRange,
        priceAlerts,
        setPriceAlerts,
        resetToDefaults,
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider")
  }
  return context
}

