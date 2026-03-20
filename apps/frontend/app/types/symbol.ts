export interface SymbolQuoteResponse {
  price: number
  change: number
  changePercent: number
  dayHigh: number
  dayLow: number
  dayOpen: number
  previousClose: number
}

export interface SymbolNewsResponse {
  title: string
  summary: string
  readMoreLink: string
  source: string
  datetime: number
  image: string | null
}

export interface EarningsResponse {
  actual: number | null
  estimate: number | null
  period: string
  quarter: number
  symbol: string
  surprise: number | null
  surprisePercent: number | null
  year: number
}

export interface RecommendationResponse {
  buy: number
  hold: number
  period: string
  sell: number
  strongBuy: number
  strongSell: number
  symbol: string
}

export interface NextEarningsResponse {
  date: string
  epsActual: number | null
  epsEstimate: number | null
  hour: string
  quarter: number
  revenueActual: number | null
  revenueEstimate: number | null
  symbol: string
  year: number
}

export interface BasicFinancialMetricsResponse {
  beta: number | null
  week52High: number | null
  week52Low: number | null
  week52PriceReturnDaily: number | null
  tenDayAverageTradingVolume: number | null
}

export interface SymbolIntelligenceResponse {
  symbol: string
  quote: SymbolQuoteResponse
  companyNews: SymbolNewsResponse[]
  earnings: EarningsResponse[]
  recommendationTrend: RecommendationResponse[]
  nextEarnings: NextEarningsResponse | null
  metrics: BasicFinancialMetricsResponse | null
  insight: {
    sentimentDivergence: number
    eventRisk: 'Low' | 'Medium' | 'High'
    downsideProtection: 'Low' | 'Medium' | 'High'
  }
  aiInsight: {
    confidence: 'Low' | 'Medium' | 'High'
    sentimentCorrelation: {
      marketDriver: 'news-driven' | 'technically-driven' | 'event-driven' | 'liquidity-driven' | 'mixed'
      sentimentDivergenceScore: number
      divergenceRisk: 'Low' | 'Medium' | 'High'
      summary: string
    }
    structuralHealth: {
      marketPhase: 'Accumulation' | 'Distribution' | 'Mark-up' | 'Mark-down' | 'Range-bound'
      supportLevel: number | null
      resistanceLevel: number | null
      trendSustainabilityScore: number
      summary: string
    }
    volatilityStress: {
      estimatedMaxDrawdownPercent: number
      downsideProtection: 'Low' | 'Medium' | 'High'
      summary: string
    }
    signals: string[]
  } | null
  bedrockInput: Record<string, unknown>
}
