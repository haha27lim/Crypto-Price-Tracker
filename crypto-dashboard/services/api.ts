const COINCAP_API_BASE = "https://api.coincap.io/v2"

export interface CryptoAsset {
  id: string
  rank: string
  symbol: string
  name: string
  priceUsd: string
  changePercent24Hr: string
  marketCapUsd: string
  volumeUsd24Hr: string
  icon?: string
}

export interface CryptoHistory {
  priceUsd: string
  time: number
  date: string
}

// Add delay between requests to avoid rate limiting
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Reusable fetch function with error handling
async function fetchWithRetry(url: string, retries = 3): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return response
    } catch (error) {
      if (i === retries - 1) throw error
      await delay(1000 * (i + 1)) // Exponential backoff
    }
  }
  throw new Error("Failed to fetch after retries")
}

export async function fetchCryptoAssets(): Promise<CryptoAsset[]> {
  try {
    const response = await fetchWithRetry(`${COINCAP_API_BASE}/assets?limit=100`)
    const data = await response.json()

    if (!data || !data.data || !Array.isArray(data.data)) {
      console.error("Invalid data format received:", data)
      return []
    }

    return data.data.map((asset: CryptoAsset) => ({
      ...asset,
      icon: `https://assets.coincap.io/assets/icons/${asset.symbol.toLowerCase()}@2x.png`,
    }))
  } catch (error) {
    console.error("Error fetching crypto assets:", error)
    return []
  }
}

export async function fetchAssetDetails(id: string): Promise<CryptoAsset | null> {
  try {
    const response = await fetchWithRetry(`${COINCAP_API_BASE}/assets/${id}`)
    const data = await response.json()

    if (!data || !data.data) {
      console.error("Invalid asset data format received:", data)
      return null
    }

    return {
      ...data.data,
      icon: `https://assets.coincap.io/assets/icons/${data.data.symbol.toLowerCase()}@2x.png`,
    }
  } catch (error) {
    console.error("Error fetching asset details:", error)
    return null
  }
}

export async function fetchAssetHistory(id: string, timeRange: string): Promise<CryptoHistory[]> {
  try {
    let interval: string
    let start: number
    const end = Date.now()

    switch (timeRange) {
      case "24h":
        interval = "m30"
        start = end - 24 * 60 * 60 * 1000
        break
      case "7d":
        interval = "h6"
        start = end - 7 * 24 * 60 * 60 * 1000
        break
      case "30d":
        interval = "d1"
        start = end - 30 * 24 * 60 * 60 * 1000
        break
      case "90d":
        interval = "d1"
        start = end - 90 * 24 * 60 * 60 * 1000
        break
      default:
        interval = "d1"
        start = end - 30 * 24 * 60 * 60 * 1000
    }

    const url = `${COINCAP_API_BASE}/assets/${id}/history?interval=${interval}&start=${start}&end=${end}`
    const response = await fetchWithRetry(url)
    const data = await response.json()

    if (!data || !data.data || !Array.isArray(data.data)) {
      console.error("Invalid history data format received:", data)
      return []
    }

    return data.data.map((item: any) => ({
      ...item,
      date:
        timeRange === "24h"
          ? new Date(item.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          : new Date(item.time).toLocaleDateString(),
    }))
  } catch (error) {
    console.error("Error fetching asset history:", error)
    return []
  }
}

