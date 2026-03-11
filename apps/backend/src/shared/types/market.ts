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
}

export interface LatestNews {
  news: NewsArticle[]
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
