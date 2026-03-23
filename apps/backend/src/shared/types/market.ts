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
  page: number
  limit: number
  total: number
  hasMore: boolean
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

export interface BasicFinancialMetrics {
  beta: number | null
  week52High: number | null
  week52Low: number | null
  week52PriceReturnDaily: number | null
  tenDayAverageTradingVolume: number | null
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

export interface SymbolAiSentimentInsight {
  marketDriver: 'news-driven' | 'technically-driven' | 'event-driven' | 'liquidity-driven' | 'mixed'
  sentimentDivergenceScore: number
  divergenceRisk: 'Low' | 'Medium' | 'High'
  summary: string
}

export interface SymbolAiStructuralInsight {
  marketPhase: 'Accumulation' | 'Distribution' | 'Mark-up' | 'Mark-down' | 'Range-bound'
  supportLevel: number | null
  resistanceLevel: number | null
  trendSustainabilityScore: number
  summary: string
}

export interface SymbolAiVolatilityInsight {
  estimatedMaxDrawdownPercent: number
  downsideProtection: 'Low' | 'Medium' | 'High'
  summary: string
}

export interface SymbolAiInsight {
  provider: 'bedrock'
  modelId: string
  confidence: 'Low' | 'Medium' | 'High'
  sentimentCorrelation: SymbolAiSentimentInsight
  structuralHealth: SymbolAiStructuralInsight
  volatilityStress: SymbolAiVolatilityInsight
  signals: string[]
}

export interface SymbolIntelligence {
  symbol: string
  quote: SymbolQuoteCard
  companyNews: SymbolNewsItem[]
  earnings: EarningsItem[]
  recommendationTrend: RecommendationTrendItem[]
  nextEarnings: EarningsCalendarItem | null
  metrics: BasicFinancialMetrics | null
  insight: SymbolInsightScores
  aiInsight: SymbolAiInsight | null
  bedrockInput: {
    symbol: string
    quote: SymbolQuoteCard
    metrics: BasicFinancialMetrics | null
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
