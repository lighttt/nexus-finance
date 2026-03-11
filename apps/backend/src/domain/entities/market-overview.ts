export interface MarketQuote {
  symbol: string
  price: number
  change: number
  changePercent: number
  high: number
  low: number
  open: number
  previousClose: number
}

export interface MarketOverview {
  gainers: MarketQuote[]
  losers: MarketQuote[]
}
