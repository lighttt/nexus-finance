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

export interface NewsArticle {
  title: string
  summary: string
  readMoreLink: string
  source: string
  datetime: number
  image: string | null
  related: string
  category: string
}

export interface LatestNews {
  news: NewsArticle[]
}

export interface NasdaqSymbol {
  symbol: string
  displaySymbol: string
  description: string
  type: string
  mic: string
}

export interface NasdaqSymbols {
  symbols: NasdaqSymbol[]
}

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
