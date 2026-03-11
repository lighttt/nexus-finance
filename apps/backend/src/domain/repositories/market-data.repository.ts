export interface QuoteData {
  symbol: string
  currentPrice: number
  change: number
  changePercent: number
  high: number
  low: number
  open: number
  previousClose: number
}

export interface CompanyNewsData {
  headline: string
  summary: string
  url: string
  source: string
  datetime: number
  image?: string
}

export interface MarketDataRepository {
  getQuote(symbol: string): Promise<QuoteData>
  getCompanyNews(symbol: string, from: string, to: string): Promise<CompanyNewsData[]>
  getUsSymbols(): Promise<string[]>
}
