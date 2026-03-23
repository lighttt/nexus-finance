import { BedrockProvider } from '../../providers/bedrock.provider'
import { FinnhubProvider } from '../../providers/finnhub.provider'
import {
  LatestNews,
  MarketOverview,
  MarketQuote,
  MarketStatus,
  NasdaqSymbols,
  SymbolIntelligence,
  SymbolNewsItem,
} from '../../shared/types/market'

const DEFAULT_MARKET_MOVER_SYMBOL_LIMIT = 250
const QUOTE_BATCH_SIZE = 25
const QUOTE_BATCH_DELAY_MS = 1200
const MARKET_OVERVIEW_CACHE_TTL_MS = 60 * 1000
const MARKET_NEWS_CACHE_TTL_MS = 60 * 1000
const NASDAQ_SYMBOLS_CACHE_TTL_MS = 15 * 60 * 1000
const SYMBOL_INTELLIGENCE_CACHE_TTL_MS = 5 * 60 * 1000

export class PublicService {
  private marketOverviewCache: { expiresAt: number; data: MarketOverview } | null = null
  private marketOverviewInFlight: Promise<MarketOverview> | null = null
  private latestNewsCache: { expiresAt: number; data: LatestNews['news'] } | null = null
  private latestNewsInFlight: Promise<LatestNews['news']> | null = null
  private nasdaqSymbolsCache = new Map<number, { expiresAt: number; data: NasdaqSymbols }>()
  private nasdaqSymbolsInFlight = new Map<number, Promise<NasdaqSymbols>>()
  private symbolIntelligenceCache = new Map<string, { expiresAt: number; data: SymbolIntelligence }>()
  private symbolIntelligenceInFlight = new Map<string, Promise<SymbolIntelligence>>()

  constructor(
    private readonly finnhubProvider: FinnhubProvider,
    private readonly bedrockProvider: BedrockProvider | null = null,
  ) {}

  getHealth() {
    return { ok: true }
  }

  async getMarketStatus(): Promise<MarketStatus> {
    return this.finnhubProvider.getMarketStatus('US')
  }

  async getMarketOverview(symbolLimit = DEFAULT_MARKET_MOVER_SYMBOL_LIMIT): Promise<MarketOverview> {
    const cached = this.marketOverviewCache
    if (cached) {
      if (cached.expiresAt <= Date.now() && !this.marketOverviewInFlight) {
        void this.refreshMarketOverview(symbolLimit)
      }
      return cached.data
    }

    return this.refreshMarketOverview(symbolLimit)
  }

  async getLatestNews(): Promise<LatestNews> {
    return this.getLatestNewsPage(1, 10)
  }

  async getLatestNewsPage(page = 1, limit = 10): Promise<LatestNews> {
    const allNews = await this.getCachedLatestNews()
    const normalizedPage = Math.max(1, page)
    const normalizedLimit = Math.max(1, Math.min(limit, 30))

    const startIndex = (normalizedPage - 1) * normalizedLimit
    const news = allNews.slice(startIndex, startIndex + normalizedLimit)

    return {
      news,
      page: normalizedPage,
      limit: normalizedLimit,
      total: allNews.length,
      hasMore: startIndex + normalizedLimit < allNews.length,
    }
  }

  async getNasdaqSymbols(limit = 200): Promise<NasdaqSymbols> {
    const normalizedLimit = Math.max(1, Math.min(limit, 1000))
    const cached = this.nasdaqSymbolsCache.get(normalizedLimit)
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data
    }

    const inFlight = this.nasdaqSymbolsInFlight.get(normalizedLimit)
    if (inFlight) {
      return inFlight
    }

    const request = (async () => {
      const rawSymbols = await this.finnhubProvider.getUsSymbols()

      const onlyNasdaq = rawSymbols.filter((symbol) => symbol.mic === 'XNAS')
      const source = onlyNasdaq.length ? onlyNasdaq : rawSymbols

      const symbols = source
        .filter((item) => item.symbol && item.displaySymbol && item.description)
        .slice(0, normalizedLimit)

      const payload = { symbols }
      this.nasdaqSymbolsCache.set(normalizedLimit, {
        data: payload,
        expiresAt: Date.now() + NASDAQ_SYMBOLS_CACHE_TTL_MS,
      })

      return payload
    })()

    this.nasdaqSymbolsInFlight.set(normalizedLimit, request)

    try {
      return await request
    } finally {
      this.nasdaqSymbolsInFlight.delete(normalizedLimit)
    }
  }

  async getSymbolIntelligence(symbol: string): Promise<SymbolIntelligence> {
    const normalizedSymbol = symbol.toUpperCase().trim()
    const cached = this.symbolIntelligenceCache.get(normalizedSymbol)
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data
    }

    const inFlight = this.symbolIntelligenceInFlight.get(normalizedSymbol)
    if (inFlight) {
      return inFlight
    }

    const request = this.buildSymbolIntelligence(normalizedSymbol)
    this.symbolIntelligenceInFlight.set(normalizedSymbol, request)

    try {
      const payload = await request
      this.symbolIntelligenceCache.set(normalizedSymbol, {
        data: payload,
        expiresAt: Date.now() + SYMBOL_INTELLIGENCE_CACHE_TTL_MS,
      })
      return payload
    } finally {
      this.symbolIntelligenceInFlight.delete(normalizedSymbol)
    }
  }

  private async buildSymbolIntelligence(normalizedSymbol: string): Promise<SymbolIntelligence> {
    const now = new Date()
    const newsTo = this.formatDate(now)
    const newsFrom = this.formatDate(new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000))
    const earningsTo = this.formatDate(new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000))

    const [quote, companyNewsRaw, earnings, recommendationTrend, earningsCalendar, metrics] = await Promise.all([
      this.finnhubProvider.getQuote(normalizedSymbol),
      this.finnhubProvider.getCompanyNews(normalizedSymbol, newsFrom, newsTo),
      this.finnhubProvider.getCompanyEarnings(normalizedSymbol, 4),
      this.finnhubProvider.getRecommendationTrends(normalizedSymbol),
      this.finnhubProvider.getEarningsCalendar(normalizedSymbol, newsTo, earningsTo),
      this.finnhubProvider.getBasicFinancialMetrics(normalizedSymbol),
    ])

    const companyNews: SymbolNewsItem[] = companyNewsRaw
      .filter((item) => item.headline && item.url)
      .sort((a, b) => b.datetime - a.datetime)
      .slice(0, 10)
      .map((item) => ({
        title: item.headline,
        summary: item.summary,
        readMoreLink: item.url,
        source: item.source,
        datetime: item.datetime,
        image: item.image ?? null,
      }))

    const sentimentBias = this.estimateNewsSentiment(companyNews)
    const sentimentDivergence = this.calculateSentimentDivergence(sentimentBias, quote.changePercent)

    const nextEarnings = earningsCalendar
      .filter((event) => event.date >= newsTo)
      .sort((a, b) => a.date.localeCompare(b.date))[0] ?? null

    const eventRisk = this.calculateEventRisk(earnings, recommendationTrend, nextEarnings)
    const downsideProtection = this.calculateDownsideProtection(quote.changePercent, sentimentDivergence)

    const bedrockInput = {
      symbol: normalizedSymbol,
      quote: {
        price: quote.currentPrice,
        change: quote.change,
        changePercent: quote.changePercent,
        dayHigh: quote.high,
        dayLow: quote.low,
        dayOpen: quote.open,
        previousClose: quote.previousClose,
      },
      metrics,
      topNews: companyNews.slice(0, 5).map((item) => ({
        headline: item.title,
        source: item.source,
        publishedAt: item.datetime,
      })),
      earningsHistory: earnings.slice(0, 4).map((item) => ({
        period: item.period,
        surprisePercent: item.surprisePercent,
      })),
      recommendationTrend: recommendationTrend.slice(0, 3).map((item) => ({
        period: item.period,
        buy: item.buy,
        hold: item.hold,
        sell: item.sell,
        strongBuy: item.strongBuy,
        strongSell: item.strongSell,
      })),
      nextEarningsDate: nextEarnings?.date ?? null,
    }

    let aiInsight = null
    if (this.bedrockProvider) {
      try {
        aiInsight = await this.bedrockProvider.generateSymbolInsight(bedrockInput)
      } catch (error) {
        console.error('[PublicService] Bedrock insight generation failed:', error)
        aiInsight = this.bedrockProvider.getFallbackSymbolInsight(bedrockInput)
      }
    }

    return {
      symbol: normalizedSymbol,
      quote: {
        price: quote.currentPrice,
        change: quote.change,
        changePercent: quote.changePercent,
        dayHigh: quote.high,
        dayLow: quote.low,
        dayOpen: quote.open,
        previousClose: quote.previousClose,
      },
      companyNews,
      earnings,
      recommendationTrend: recommendationTrend.slice(0, 3),
      nextEarnings,
      metrics,
      insight: {
        sentimentDivergence,
        eventRisk,
        downsideProtection,
      },
      aiInsight,
      bedrockInput,
    }
  }

  private async getCachedLatestNews(): Promise<LatestNews['news']> {
    const cached = this.latestNewsCache
    if (cached) {
      if (cached.expiresAt <= Date.now() && !this.latestNewsInFlight) {
        void this.refreshLatestNews()
      }
      return cached.data
    }

    return this.refreshLatestNews()
  }

  private async refreshLatestNews(): Promise<LatestNews['news']> {
    if (this.latestNewsInFlight) {
      return this.latestNewsInFlight
    }

    this.latestNewsInFlight = (async () => {
      const rawNews = await this.finnhubProvider.getMarketNews('general')
      const mapped = rawNews
        .filter((item) => item.headline && item.summary && item.url)
        .sort((a, b) => b.datetime - a.datetime)
        .map((item) => ({
          title: item.headline,
          summary: item.summary,
          readMoreLink: item.url,
          source: item.source,
          datetime: item.datetime,
          image: item.image ?? null,
          related: item.related ?? '',
          category: item.category ?? 'general',
        }))

      this.latestNewsCache = {
        data: mapped,
        expiresAt: Date.now() + MARKET_NEWS_CACHE_TTL_MS,
      }

      return mapped
    })()

    try {
      return await this.latestNewsInFlight
    } finally {
      this.latestNewsInFlight = null
    }
  }

  private async refreshMarketOverview(symbolLimit: number): Promise<MarketOverview> {
    if (this.marketOverviewInFlight) {
      return this.marketOverviewInFlight
    }

    this.marketOverviewInFlight = (async () => {
      const nasdaqSymbols = await this.getNasdaqSymbols(symbolLimit)
      const symbols = nasdaqSymbols.symbols.map((item) => item.symbol)
      const quotes = await this.getQuotesInBatches(symbols)

      const validQuotes: MarketQuote[] = quotes
        .filter((quote) => typeof quote.currentPrice === 'number' && !Number.isNaN(quote.currentPrice) && quote.currentPrice > 0)
        .map((quote) => ({
          symbol: quote.symbol,
          price: quote.currentPrice,
          change: quote.change,
          changePercent: quote.changePercent,
          high: quote.high,
          low: quote.low,
          open: quote.open,
          previousClose: quote.previousClose,
        }))

      const gainers = [...validQuotes].sort((a, b) => b.changePercent - a.changePercent).slice(0, 5)
      const losers = [...validQuotes].sort((a, b) => a.changePercent - b.changePercent).slice(0, 5)

      const overview = { gainers, losers }
      this.marketOverviewCache = {
        data: overview,
        expiresAt: Date.now() + MARKET_OVERVIEW_CACHE_TTL_MS,
      }

      return overview
    })()

    try {
      return await this.marketOverviewInFlight
    } finally {
      this.marketOverviewInFlight = null
    }
  }

  private formatDate(date: Date): string {
    const year = date.getUTCFullYear()
    const month = `${date.getUTCMonth() + 1}`.padStart(2, '0')
    const day = `${date.getUTCDate()}`.padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  private estimateNewsSentiment(news: SymbolNewsItem[]): number {
    if (!news.length) return 0

    const positiveTerms = ['beat', 'growth', 'surge', 'strong', 'upgrade', 'record', 'profit', 'gain']
    const negativeTerms = ['miss', 'drop', 'fall', 'weak', 'downgrade', 'risk', 'loss', 'decline']

    let score = 0
    for (const item of news) {
      const text = `${item.title} ${item.summary}`.toLowerCase()
      for (const word of positiveTerms) {
        if (text.includes(word)) score += 1
      }
      for (const word of negativeTerms) {
        if (text.includes(word)) score -= 1
      }
    }

    const normalized = score / Math.max(news.length * 3, 1)
    return Math.max(-1, Math.min(1, normalized))
  }

  private calculateSentimentDivergence(sentimentBias: number, changePercent: number): number {
    const priceDirection = changePercent === 0 ? 0 : changePercent > 0 ? 1 : -1
    const sentimentDirection = sentimentBias === 0 ? 0 : sentimentBias > 0 ? 1 : -1

    if (priceDirection === 0 || sentimentDirection === 0) {
      return Math.min(100, Math.round(Math.abs(changePercent) * 10))
    }

    const aligned = priceDirection === sentimentDirection
    if (aligned) {
      return Math.max(0, 30 - Math.round(Math.abs(changePercent) * 3))
    }

    return Math.min(100, 55 + Math.round(Math.abs(changePercent) * 6))
  }

  private calculateEventRisk(
    earnings: Array<{ surprisePercent: number | null }>,
    recommendation: Array<{ buy: number; hold: number; sell: number; strongBuy: number; strongSell: number }>,
    nextEarnings: { date: string } | null,
  ): 'Low' | 'Medium' | 'High' {
    const surpriseValues = earnings.map((item) => Math.abs(item.surprisePercent ?? 0))
    const avgSurprise = surpriseValues.length
      ? surpriseValues.reduce((sum, value) => sum + value, 0) / surpriseValues.length
      : 0

    const topRecommendation = recommendation[0]
    const analystDispersion = topRecommendation
      ? Math.abs((topRecommendation.strongBuy + topRecommendation.buy) - (topRecommendation.strongSell + topRecommendation.sell))
      : 0

    let score = avgSurprise

    if (nextEarnings) {
      const daysUntil = Math.max(
        0,
        Math.ceil((new Date(`${nextEarnings.date}T00:00:00Z`).getTime() - Date.now()) / (24 * 60 * 60 * 1000)),
      )
      if (daysUntil <= 7) score += 20
      else if (daysUntil <= 21) score += 10
    }

    if (analystDispersion <= 2) score += 8

    if (score >= 25) return 'High'
    if (score >= 12) return 'Medium'
    return 'Low'
  }

  private calculateDownsideProtection(changePercent: number, divergenceScore: number): 'Low' | 'Medium' | 'High' {
    const stressScore = Math.max(0, -changePercent) * 3 + divergenceScore * 0.6

    if (stressScore >= 45) return 'Low'
    if (stressScore >= 20) return 'Medium'
    return 'High'
  }

  private async getQuotesInBatches(symbols: string[]): Promise<
    {
      symbol: string
      currentPrice: number
      change: number
      changePercent: number
      high: number
      low: number
      open: number
      previousClose: number
    }[]
  > {
    const quotes: {
      symbol: string
      currentPrice: number
      change: number
      changePercent: number
      high: number
      low: number
      open: number
      previousClose: number
    }[] = []

    for (let index = 0; index < symbols.length; index += QUOTE_BATCH_SIZE) {
      const batch = symbols.slice(index, index + QUOTE_BATCH_SIZE)
      const results = await Promise.allSettled(batch.map((symbol) => this.finnhubProvider.getQuote(symbol)))

      for (const result of results) {
        if (result.status === 'fulfilled') {
          quotes.push(result.value)
        }
      }

      const hasMore = index + QUOTE_BATCH_SIZE < symbols.length
      if (hasMore) {
        await new Promise((resolve) => setTimeout(resolve, QUOTE_BATCH_DELAY_MS))
      }
    }

    return quotes
  }
}
