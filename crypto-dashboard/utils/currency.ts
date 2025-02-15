const exchangeRates: Record<string, number> = {
  usd: 1,
  eur: 0.91,
  gbp: 0.79,
  jpy: 149.5,
}

const currencySymbols: Record<string, string> = {
  usd: "$",
  eur: "€",
  gbp: "£",
  jpy: "¥",
}

export function convertPrice(priceUsd: number, currency: string): { value: number; symbol: string } {
  const rate = exchangeRates[currency as keyof typeof exchangeRates] || 1
  const symbol = currencySymbols[currency as keyof typeof currencySymbols] || "$"
  return {
    value: priceUsd * rate,
    symbol,
  }
}

export function formatPrice(price: number, currency: string): string {
  const { value, symbol } = convertPrice(price, currency)

  if (currency === "jpy") {
    return `${symbol}${Math.round(value).toLocaleString()}`
  }

  if (value < 1) {
    const [, decimal] = value.toFixed(20).split(".")
    const significantDigits = decimal.match(/^0*/)![0].length + 4
    return `${symbol}${value.toFixed(significantDigits)}`
  }

  return `${symbol}${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export function formatLargeNumber(number: number, currency: string): string {
  const { value, symbol } = convertPrice(number, currency)
  return `${symbol}${Math.round(value).toLocaleString()}`
}

