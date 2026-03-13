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

export interface MarketStatus {
  exchange: string
  isOpen: boolean
  session: string | null
  timestamp: number
  timezone: string
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

export interface EarningsItem {
  actual: number | null
  estimate: number | null
  period: string
  quarter: number
  symbol: string
  surprise: number | null
  surprisePercent: number | null
  year: number
}

export interface RecommendationTrendItem {
  buy: number
  hold: number
  period: string
  sell: number
  strongBuy: number
  strongSell: number
  symbol: string
}

export interface EarningsCalendarItem {
  date: string
  epsActual: number | null
  epsEstimate: number | null
  hour: 'bmo' | 'amc' | 'dmh' | string
  quarter: number
  revenueActual: number | null
  revenueEstimate: number | null
  symbol: string
  year: number
}

export interface SymbolNewsItem {
  title: string
  summary: string
  readMoreLink: string
  source: string
  datetime: number
  image: string | null
}

export interface SymbolQuoteCard {
  price: number
  change: number
  changePercent: number
  dayHigh: number
  dayLow: number
  dayOpen: number
  previousClose: number
}

export interface SymbolInsightScores {
  sentimentDivergence: number
  eventRisk: 'Low' | 'Medium' | 'High'
  downsideProtection: 'Low' | 'Medium' | 'High'
}

export interface SymbolIntelligence {
  symbol: string
  quote: SymbolQuoteCard
  companyNews: SymbolNewsItem[]
  earnings: EarningsItem[]
  recommendationTrend: RecommendationTrendItem[]
  nextEarnings: EarningsCalendarItem | null
  insight: SymbolInsightScores
  bedrockInput: {
    symbol: string
    quote: SymbolQuoteCard
    topNews: Array<{
      headline: string
      source: string
      publishedAt: number
    }>
    earningsHistory: Array<{
      period: string
      surprisePercent: number | null
    }>
    recommendationTrend: Array<{
      period: string
      buy: number
      hold: number
      sell: number
      strongBuy: number
      strongSell: number
    }>
    nextEarningsDate: string | null
  }
}
