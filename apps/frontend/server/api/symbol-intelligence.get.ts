import { createError, defineEventHandler, getQuery } from 'h3'

interface SymbolQuoteDto {
  price: number
  change: number
  changePercent: number
  dayHigh: number
  dayLow: number
  dayOpen: number
  previousClose: number
}

interface SymbolNewsDto {
  title: string
  summary: string
  readMoreLink: string
  source: string
  datetime: number
  image: string | null
}

interface EarningsDto {
  actual: number | null
  estimate: number | null
  period: string
  quarter: number
  symbol: string
  surprise: number | null
  surprisePercent: number | null
  year: number
}

interface RecommendationDto {
  buy: number
  hold: number
  period: string
  sell: number
  strongBuy: number
  strongSell: number
  symbol: string
}

interface EarningsCalendarDto {
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

interface SymbolIntelligenceDto {
  symbol: string
  quote: SymbolQuoteDto
  companyNews: SymbolNewsDto[]
  earnings: EarningsDto[]
  recommendationTrend: RecommendationDto[]
  nextEarnings: EarningsCalendarDto | null
  insight: {
    sentimentDivergence: number
    eventRisk: 'Low' | 'Medium' | 'High'
    downsideProtection: 'Low' | 'Medium' | 'High'
  }
  bedrockInput: Record<string, unknown>
}

export default defineEventHandler(async (event) => {
  const auth = event.context.auth()
  const { isAuthenticated } = auth

  if (!isAuthenticated) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const token = await auth.getToken()
  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const config = useRuntimeConfig()
  if (!config.public.apiProtectedBase) {
    throw createError({
      statusCode: 500,
      statusMessage: 'NUXT_PUBLIC_API_PROTECTED_BASE is not configured',
    })
  }

  const query = getQuery(event)
  const symbol = String(query.symbol || '').toUpperCase().trim()

  if (!symbol) {
    throw createError({ statusCode: 400, statusMessage: 'symbol query param is required' })
  }

  return await $fetch<SymbolIntelligenceDto>(`${config.public.apiProtectedBase}/symbol-intelligence`, {
    headers: { Authorization: `Bearer ${token}` },
    params: { symbol },
  })
})
